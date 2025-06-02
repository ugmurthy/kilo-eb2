import * as vscode from 'vscode';
import * as sandboxService from '../services/sandboxService';
import * as fileService from '../services/fileService';
import * as credentialService from '../services/credentialService';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Shows a quick pick to select a Python file from the output directory
 * @returns The selected file path
 */
async function selectPythonFile(): Promise<string> {
  try {
    // Get the output directory
    const config = vscode.workspace.getConfiguration('graphGenerator');
    const outputDir = config.get<string>('outputDirectory') || '';
    
    // Get the workspace folder
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error("No workspace folder open");
    }
    
    // Determine the directory to search for Python files
    let searchDir: string;
    if (outputDir) {
      searchDir = path.join(workspaceFolder.uri.fsPath, outputDir);
    } else {
      searchDir = workspaceFolder.uri.fsPath;
    }
    
    // Find all Python files in the directory
    const pythonFiles: string[] = [];
    
    // Check if directory exists
    if (fs.existsSync(searchDir)) {
      const files = fs.readdirSync(searchDir);
      for (const file of files) {
        if (file.endsWith('.py')) {
          pythonFiles.push(path.join(searchDir, file));
        }
      }
    }
    
    // Also check src/graph/graphs directory if it exists
    const graphsDir = path.join(workspaceFolder.uri.fsPath, 'src', 'graph', 'graphs');
    if (fs.existsSync(graphsDir)) {
      const files = fs.readdirSync(graphsDir);
      for (const file of files) {
        if (file.endsWith('.py')) {
          pythonFiles.push(path.join(graphsDir, file));
        }
      }
    }
    
    if (pythonFiles.length === 0) {
      throw new Error("No Python files found in the output directory");
    }
    
    // Show quick pick with file names (not full paths)
    const selected = await vscode.window.showQuickPick(
      pythonFiles.map(file => ({
        label: path.basename(file),
        description: file,
      })),
      { placeHolder: 'Select a Python file to execute' }
    );
    
    if (!selected) {
      throw new Error("File selection cancelled");
    }
    
    return selected.description;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Unknown error occurred while selecting Python file");
    }
  }
}

/**
 * Main command to execute Python code
 * @param context VSCode extension context
 */
export async function execute(context: vscode.ExtensionContext): Promise<void> {
  try {
    // Check if API key exists
    const apiKey = await credentialService.getApiKey(context.secrets);
    if (!apiKey) {
      const setKey = 'Set API Key';
      const response = await vscode.window.showErrorMessage(
        'E2B Sandbox API key not found. Please set your API key to continue.',
        setKey
      );
      
      if (response === setKey) {
        // Open the API key setting command
        await vscode.commands.executeCommand('graph-generator.setApiKey');
        return;
      } else {
        return;
      }
    }
    
    // 1. Let user select a Python file
    const selectedFilePath = await selectPythonFile();
    
    // 2. Read the file content
    const code = fs.readFileSync(selectedFilePath, 'utf-8');
    
    // 3. Execute code in sandbox
    const executionResult = await sandboxService.executeCode(context, code);
    
    // 4. Extract user prompt and model from code comments if available
    let userPrompt = "Executed Python code";
    let model = "N/A";
    
    const promptMatch = code.match(/# USER PROMPT:\s*#\s*(.*?)(?:\s*#|$)/s);
    if (promptMatch && promptMatch[1]) {
      userPrompt = promptMatch[1].trim();
    }
    
    const modelMatch = code.match(/# MODEL:\s*(.*?)(?:\s*#|$)/);
    if (modelMatch && modelMatch[1]) {
      model = modelMatch[1].trim();
    }
    
    // 5. Create a code block object to pass to saveAndOpenFiles
    const codeBlock = {
      language: 'python',
      code: code
    };
    
    // 6. Save and open files
    await fileService.saveAndOpenFiles([codeBlock], userPrompt, model, executionResult);
    
  } catch (error) {
    if (error instanceof Error) {
      // Only rethrow if it's not a cancellation
      if (!error.message.includes('cancelled')) {
        throw error;
      }
    } else {
      throw new Error("Unknown error occurred");
    }
  }
}