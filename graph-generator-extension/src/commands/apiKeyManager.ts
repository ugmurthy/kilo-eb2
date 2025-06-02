import * as vscode from 'vscode';
import * as credentialService from '../services/credentialService';

/**
 * Shows an input box to collect the E2B API key from the user
 * @param currentKey Optional current API key to pre-fill
 * @returns The entered API key
 */
async function showApiKeyInput(currentKey?: string): Promise<string> {
  const apiKey = await vscode.window.showInputBox({
    prompt: 'Enter your E2B Sandbox API key',
    placeHolder: 'API key',
    password: true, // Hide input as password
    ignoreFocusOut: true, // Keep dialog open when focus is lost
    value: currentKey || ''
  });
  
  if (!apiKey) {
    throw new Error("API key input cancelled");
  }
  
  return apiKey;
}

/**
 * Main command to manage the E2B API key
 * @param context VSCode extension context
 */
export async function execute(context: vscode.ExtensionContext): Promise<void> {
  try {
    // Check if there's an existing API key
    const existingKey = await credentialService.getApiKey(context.secrets);
    
    // Show options if an API key already exists
    if (existingKey) {
      const action = await vscode.window.showQuickPick(
        [
          { label: 'Update API Key', description: 'Replace the existing API key with a new one' },
          { label: 'Delete API Key', description: 'Remove the stored API key' },
          { label: 'Cancel', description: 'Do nothing' }
        ],
        { placeHolder: 'E2B API Key already exists. What would you like to do?' }
      );
      
      if (!action || action.label === 'Cancel') {
        return;
      }
      
      if (action.label === 'Delete API Key') {
        await credentialService.deleteApiKey(context.secrets);
        vscode.window.showInformationMessage('E2B API key deleted successfully');
        return;
      }
    }
    
    // Get new API key from user
    const apiKey = await showApiKeyInput(existingKey);
    
    // Validate API key format
    if (!credentialService.isValidApiKey(apiKey)) {
      throw new Error("Invalid API key format");
    }
    
    // Store API key securely
    await credentialService.storeApiKey(context.secrets, apiKey);
    
    vscode.window.showInformationMessage("E2B Sandbox API key saved successfully");
  } catch (error) {
    if (error instanceof Error) {
      // Only rethrow if it's not a cancellation
      if (error.message !== "API key input cancelled") {
        throw error;
      }
    } else {
      throw new Error("Unknown error occurred");
    }
  }
}