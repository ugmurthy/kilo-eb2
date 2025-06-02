import * as vscode from 'vscode';
import { Sandbox } from '@e2b/code-interpreter';
import * as credentialService from './credentialService';

/**
 * Interface for execution results
 */
export interface ExecutionResult {
  logs: string | any;
  results: Array<{
    png?: string;
    [key: string]: any;
  }>;
}

/**
 * Executes code in the E2B sandbox
 * @param context VSCode extension context
 * @param code The code to execute
 * @returns The execution result
 */
export async function executeCode(
  context: vscode.ExtensionContext,
  code: string
): Promise<ExecutionResult> {
  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Executing code to generate graph...",
      cancellable: true
    },
    async (progress, token) => {
      // Retrieve API key securely
      const apiKey = await credentialService.getApiKey(context.secrets);
      
      if (!apiKey) {
        throw new Error(
          "E2B Sandbox API key not found. Please set your API key using the 'Set E2B Sandbox API Key' command."
        );
      }
      
      // Create sandbox with API key
      const sandbox = await Sandbox.create({ apiKey });
      
      try {
        // Report progress
        progress.report({ message: "Sandbox created, executing code..." });
        
        // Execute code
        const result = await sandbox.runCode(code);
        
        // Convert to our ExecutionResult interface
        return {
          logs: result.logs,
          results: result.results
        };
      } finally {
        // Always clean up sandbox
        progress.report({ message: "Cleaning up sandbox..." });
        await sandbox.kill();
      }
    }
  );
}