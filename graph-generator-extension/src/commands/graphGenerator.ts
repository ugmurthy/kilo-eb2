import * as vscode from 'vscode';
import * as ollamaService from '../services/ollamaService';
import * as sandboxService from '../services/sandboxService';
import * as fileService from '../services/fileService';
import * as credentialService from '../services/credentialService';
import { extractCode } from '../utils/codeExtractor';

/**
 * Shows a quick pick to select an Ollama model
 * @returns The selected model
 */
async function showModelSelector(): Promise<string> {
  try {
    // Fetch available models
    const models = await ollamaService.fetchAvailableModels();
    
    // Show quick pick
    const selected = await vscode.window.showQuickPick(
      models.map(model => ({ label: model })),
      { placeHolder: 'Select an AI model to use' }
    );
    
    if (!selected) {
      throw new Error("Model selection cancelled");
    }
    
    return selected.label;
  } catch (error) {
    // If there's an error fetching models, use the default model from settings
    const config = vscode.workspace.getConfiguration('graphGenerator');
    const defaultModel = config.get<string>('defaultModel') || 'gemma3:27b';
    
    vscode.window.showWarningMessage(
      `Could not fetch models, using default model: ${defaultModel}`
    );
    
    return defaultModel;
  }
}

/**
 * Shows an input box to collect the graph description
 * @returns The entered graph description
 */
async function showPromptInput(): Promise<string> {
  const defaultPrompt = 'A bar chart showing monthly sales data for 2023';
  
  const prompt = await vscode.window.showInputBox({
    prompt: 'Describe the graph you want to generate',
    placeHolder: `E.g., "${defaultPrompt}"`,
    ignoreFocusOut: true
  });
  
  if (!prompt) {
    throw new Error("Graph description cancelled");
  }
  
  return prompt;
}

/**
 * Main command to generate a graph
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
    
    // 1. Get user input (graph description first, then optional model selection)
    const userPrompt = await showPromptInput();
    
    // Get configuration for default model
    const config = vscode.workspace.getConfiguration('graphGenerator');
    const defaultModel = config.get<string>('defaultModel') || 'gemma3:27b';
    
    // Ask if user wants to select a different model
    const selectModel = 'Select Model';
    const useDefault = `Use Default (${defaultModel})`;
    const modelChoice = await vscode.window.showInformationMessage(
      'Which model would you like to use?',
      useDefault,
      selectModel
    );
    
    // Determine which model to use
    let selectedModel: string;
    if (modelChoice === selectModel) {
      // User wants to select a model
      selectedModel = await showModelSelector();
    } else {
      // Use default model
      selectedModel = defaultModel;
    }
    
    // 2. Prepare messages for Ollama
    const messages: ollamaService.ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert code generator specializing in data visualization. Generate Python code that creates graphs based on user descriptions. Include sample data in your code. The code should use matplotlib, seaborn, or plotlib to generate a visual graph that can be saved as an image. Suppress any warnings related to module pydantic. Format your response as follows:\n\n1. A brief explanation of what the code does\n2. The Python code in a code block using triple backticks with "python" language identifier\n\nExample format:\nThis code creates a bar chart showing sales data.\n\n```python\nimport matplotlib.pyplot as plt\n# Code here\n```'
      },
      {
        role: 'user',
        content: userPrompt
      }
    ];
    
    // 3. Generate code using Ollama with streaming
    const response = await ollamaService.generateCodeStreaming(selectedModel, messages);
    
    // 4. Extract code blocks
    const codeBlocks = extractCode(response);
    
    if (codeBlocks.length === 0) {
      throw new Error('No code blocks found in the generated response');
    }
    
    // 5. Execute code in sandbox
    const executionResult = await sandboxService.executeCode(context, codeBlocks[0].code);
    
    // 6. Save and open files
    await fileService.saveAndOpenFiles(codeBlocks, userPrompt, selectedModel, executionResult);
    
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