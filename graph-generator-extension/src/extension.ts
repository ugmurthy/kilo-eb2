import * as vscode from 'vscode';
import * as graphGenerator from './commands/graphGenerator';
import * as apiKeyManager from './commands/apiKeyManager';
import * as execCode from './commands/execCode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Graph Generator extension is now active');

  // Register the graph generator command
  const generateCommand = vscode.commands.registerCommand(
    'graph-generator.generate',
    async () => {
      try {
        await graphGenerator.execute(context);
      } catch (error) {
        if (error instanceof Error) {
          vscode.window.showErrorMessage(`Graph generation failed: ${error.message}`);
        } else {
          vscode.window.showErrorMessage('Graph generation failed with an unknown error');
        }
      }
    }
  );

  // Register the API key management command
  const setApiKeyCommand = vscode.commands.registerCommand(
    'graph-generator.setApiKey',
    async () => {
      try {
        await apiKeyManager.execute(context);
      } catch (error) {
        if (error instanceof Error) {
          vscode.window.showErrorMessage(`Failed to set API key: ${error.message}`);
        } else {
          vscode.window.showErrorMessage('Failed to set API key due to an unknown error');
        }
      }
    }
  );

  // Register the execute code command
  const execCodeCommand = vscode.commands.registerCommand(
    'graph-generator.execcode',
    async () => {
      try {
        await execCode.execute(context);
      } catch (error) {
        if (error instanceof Error) {
          vscode.window.showErrorMessage(`Code execution failed: ${error.message}`);
        } else {
          vscode.window.showErrorMessage('Code execution failed with an unknown error');
        }
      }
    }
  );

  // Add commands to subscriptions
  context.subscriptions.push(generateCommand, setApiKeyCommand, execCodeCommand);
}

export function deactivate() {
  // Clean up resources when the extension is deactivated
  console.log('Graph Generator extension is now deactivated');
}