import * as vscode from 'vscode';
// Use explicit imports from fs and path to avoid Vite externalization issues
import {
  existsSync,
  mkdirSync,
  writeFileSync
} from 'fs';
import {
  join as pathJoin,
  resolve as pathResolve
} from 'path';
import { CodeBlock, formatCodeWithComments } from '../utils/codeExtractor';
import { ExecutionResult } from './sandboxService';

/**
 * Generates a timestamp string in the format YYYYMMDD-HHMMSS
 * @returns Timestamp string
 */
function generateTimestamp(): string {
  const now = new Date();
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Gets the output directory from configuration or uses the workspace root
 * @returns The path to the output directory
 */
function getOutputDirectory(): string {
  const config = vscode.workspace.getConfiguration('graphGenerator');
  const outputDir = config.get<string>('outputDirectory') || '';
  
  // Get the workspace folder
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    throw new Error("No workspace folder open");
  }
  
  // If output directory is specified, create it if it doesn't exist
  if (outputDir) {
    const fullPath = pathJoin(workspaceFolder.uri.fsPath, outputDir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
    }
    return fullPath;
  }
  
  // Otherwise use workspace root
  return workspaceFolder.uri.fsPath;
}

/**
 * Saves code blocks to files and opens them in the editor
 * @param codeBlocks The code blocks to save
 * @param userPrompt The user prompt that generated the code
 * @param model The model used to generate the code
 * @param executionResult The result of executing the code
 */
export async function saveAndOpenFiles(
  codeBlocks: CodeBlock[],
  userPrompt: string,
  model: string,
  executionResult: ExecutionResult
): Promise<void> {
  const outputDir = getOutputDirectory();
  const savedFiles: string[] = [];
  
  // Generate timestamp for filenames
  const timestamp = generateTimestamp();
  
  // Save code files
  for (let i = 0; i < codeBlocks.length; i++) {
    const codeBlock = codeBlocks[i];
    const fileName = codeBlocks.length > 1
      ? `graph_code_${i + 1}_${timestamp}.py`
      : `graph_code_${timestamp}.py`;
    
    const filePath = pathJoin(outputDir, fileName);
    console.log(`Saving code to: ${filePath}`);
    // Format code with comments
    const formattedCode = formatCodeWithComments(
      codeBlock.code,
      userPrompt,
      model,
      i,
      codeBlocks.length
    );
    
    // Write to file
    writeFileSync(filePath, formattedCode);
    savedFiles.push(filePath);
  }
  
  // Save and open image if available
  let imagePath: string | undefined;
  if (executionResult.results.length > 0 && executionResult.results[0].png) {
    const result = executionResult.results[0];
    if (result.png) {
      imagePath = pathJoin(outputDir, `graph_${timestamp}.png`);
      writeFileSync(imagePath, Buffer.from(result.png, "base64"));
      savedFiles.push(imagePath);
    }
  }
  
  // Open files in editor
  for (const filePath of savedFiles) {
    const uri = vscode.Uri.file(filePath);
    
    if (filePath.endsWith('.png')) {
      // Open image in editor
      await vscode.commands.executeCommand('vscode.open', uri);
    } else {
      // Open text document
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document);
    }
  }
  
  // Show success message
  const fileMessage = codeBlocks.length > 1 
    ? `${codeBlocks.length} code files saved` 
    : "Code saved";
  
  const imageMessage = imagePath ? " and graph image generated" : "";
  vscode.window.showInformationMessage(`${fileMessage}${imageMessage}`);
}