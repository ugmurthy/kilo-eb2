import * as vscode from 'vscode';
// Use explicit import for node-fetch to avoid Vite externalization issues
import fetch, { Response } from 'node-fetch';
import { join as pathJoin } from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * Interface for chat message
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Interface for chat request
 */
interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream: boolean;
  max_tokens?: number;
}

/**
 * Interface for streaming chat response
 */
interface StreamingChatResponse {
  message: {
    content: string;
  };
  done: boolean;
}

/**
 * Interface for chat response
 */
interface ChatResponse {
  message: {
    content: string;
  };
}

/**
 * Interface for Ollama model
 */
interface OllamaModel {
  name: string;
}

/**
 * Interface for Ollama tags response
 */
interface OllamaTagsResponse {
  models: OllamaModel[];
}

/**
 * Gets the Ollama API endpoint from configuration
 * @returns The configured Ollama API endpoint
 */
function getOllamaEndpoint(): string {
  const config = vscode.workspace.getConfiguration('graphGenerator');
  return config.get<string>('ollamaEndpoint') || 'http://localhost:11434';
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
 * Fetches available models from Ollama API
 * @returns Array of available model names
 */
export async function fetchAvailableModels(): Promise<string[]> {
  try {
    const endpoint = getOllamaEndpoint();
    const response = await fetch(`${endpoint}/api/tags`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    
    const data = await response.json() as OllamaTagsResponse;
    
    // Extract model names from the response
    const models = data.models || [];
    return models.map(model => model.name);
  } catch (error) {
    console.error('Error fetching models:', error instanceof Error ? error.message : 'Unknown error');
    // Return some default models in case the API call fails
    return ['gemma3:27b', 'llama3:8b', 'mistral:7b', 'phi3:14b'];
  }
}

/**
 * Sends a chat request to Ollama
 * @param model The model to use
 * @param messages The messages to send
 * @param maxTokens Optional maximum number of tokens to generate
 * @returns The response content as a string
 */
export async function generateCode(
  model: string,
  messages: ChatMessage[],
  maxTokens: number = 4096
): Promise<string> {
  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Generating graph code using ${model}...`,
      cancellable: true
    },
    async (progress, token) => {
      try {
        // Validate inputs
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          throw new Error('Messages must be a non-empty array');
        }
        
        if (!model || typeof model !== 'string') {
          throw new Error('Model must be a non-empty string');
        }
        
        // Prepare the chat request
        const request: ChatRequest = {
          model: model,
          messages: messages,
          stream: false,
          max_tokens: maxTokens
        };
        
        // Send the chat request to Ollama
        const endpoint = getOllamaEndpoint();
        const response = await fetch(`${endpoint}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request)
        });
        
        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`);
        }
        
        const data = await response.json() as ChatResponse;
        
        // Return the response content
        return data.message.content;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Error generating code: ${error.message}`);
        } else {
          throw new Error('Unknown error generating code');
        }
      }
    }
  );
}

/**
 * Generates code using Ollama with streaming output to an editor tab
 * @param model The model to use
 * @param messages The messages to send
 * @param maxTokens Optional maximum number of tokens to generate
 * @returns A promise that resolves when streaming is complete
 */
export async function generateCodeStreaming(
  model: string,
  messages: ChatMessage[],
  maxTokens: number = 4096
): Promise<string> {
  // Create a new untitled markdown document
  const document = await vscode.workspace.openTextDocument({
    language: 'markdown',
    content: ''
  });
  
  // Show the document in an editor
  const editor = await vscode.window.showTextDocument(document);
  
  try {
    // Validate inputs
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages must be a non-empty array');
    }
    
    if (!model || typeof model !== 'string') {
      throw new Error('Model must be a non-empty string');
    }
    
    // Create a status bar item to show progress
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBarItem.text = `$(sync~spin) Generating with ${model}...`;
    statusBarItem.show();
    
    // Prepare the chat request with streaming enabled
    const request: ChatRequest = {
      model: model,
      messages: messages,
      stream: true, // Use actual streaming API
      max_tokens: maxTokens
    };
    
    // Send the chat request to Ollama
    const endpoint = getOllamaEndpoint();
    const response = await fetch(`${endpoint}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
    
    // Process the streaming response
    let fullContent = '';
    
    try {
      // Convert the response to text and process line by line
      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      // Show progress in status bar
      statusBarItem.text = `$(sync~spin) Processing response from ${model}...`;
      
      if (lines.length === 0) {
        // If no lines were returned, handle as a non-streaming response
        vscode.window.showWarningMessage('No streaming data received, trying to process as a single response');
        
        try {
          // Try to parse the text as a single JSON object
          const data = JSON.parse(text) as ChatResponse;
          if (data.message && data.message.content) {
            await editor.edit(editBuilder => {
              editBuilder.insert(new vscode.Position(0, 0), data.message.content);
            });
            fullContent = data.message.content;
          }
        } catch (e) {
          // If that fails, just show the raw text
          await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0, 0), text);
          });
          fullContent = text;
        }
      } else {
        // Process each line of the streaming response
        for (const line of lines) {
          try {
            // Parse the JSON line
            const data = JSON.parse(line) as StreamingChatResponse;
            
            if (data.message && data.message.content) {
              const content = data.message.content;
              
              // Append to the document
              await editor.edit(editBuilder => {
                const position = new vscode.Position(document.lineCount, 0);
                editBuilder.insert(position, content);
              });
              
              // Append to full content
              fullContent += content;
              
              // Add a small delay to make the streaming visible
              await new Promise(resolve => setTimeout(resolve, 10));
            }
          } catch (e) {
            console.error('Error parsing streaming response line:', e);
          }
        }
      }
    } catch (e) {
      console.error('Error processing streaming response:', e);
      vscode.window.showErrorMessage(`Error processing streaming response: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
    
    // Hide the status bar item
    statusBarItem.dispose();
    
    // Save the document as generated.md in the output directory
    try {
      // Get the output directory
      const outputDirectory = getOutputDirectory();
      
      // Create a file path for generated.md in the output directory
      const generatedMdPath = vscode.Uri.file(pathJoin(outputDirectory, 'generated.md'));
      
      //////////// Removed SAVE SAVEAS and CANCEL Options as there are not relevant
      // // Ask for confirmation before saving
      // const saveOptions = ['Save', 'Save As...', 'Cancel'];
      // const saveChoice = await vscode.window.showInformationMessage(
      //   `Save generated content to ${generatedMdPath.fsPath}?`,
      //   ...saveOptions
      // );
      
      // if (saveChoice === 'Cancel') {
      //   // User cancelled, keep the untitled document open
      //   return fullContent;
      // } else if (saveChoice === 'Save As...') {
      //   // Use the saveAs command to let the user choose a location
      //   await vscode.commands.executeCommand('workbench.action.files.saveAs', document.uri);
      //   // Close the original untitled document after saving
      //   await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      //   return fullContent;
      // }
      //////////////

      // User chose 'Save', so save to the default location
      // Write the content to the file
      await vscode.workspace.fs.writeFile(
        generatedMdPath,
        Buffer.from(fullContent, 'utf8')
      );
      
      // Close the untitled document
      // await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      
      // // Open the saved file
      // const savedDocument = await vscode.workspace.openTextDocument(generatedMdPath);
      // await vscode.window.showTextDocument(savedDocument);
      
      // Show success message
      vscode.window.showInformationMessage(`Generated content saved to ${generatedMdPath.fsPath}`);
    } catch (e) {
      console.error('Error saving generated.md:', e);
      vscode.window.showErrorMessage(`Failed to save generated.md: ${e instanceof Error ? e.message : 'Unknown error'}`);
      
      ///////////////
      // If we can't save to a file, prompt the user to save manually
      // try {
      //   // Try to rename the untitled document
      //   await vscode.commands.executeCommand('workbench.action.files.saveAs', document.uri);
      //   vscode.window.showInformationMessage('Please save the document to your preferred location');
      // } catch (saveError) {
      //   console.error('Error with saveAs command:', saveError);
      // }
      ///////////////
    }
    
    return fullContent;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error generating code: ${error.message}`);
    } else {
      throw new Error('Unknown error generating code');
    }
  }
}