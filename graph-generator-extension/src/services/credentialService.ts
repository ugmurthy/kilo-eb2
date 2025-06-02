import * as vscode from 'vscode';

// Key used to store the E2B API key in the secret storage
const E2B_API_KEY = 'e2b.apiKey';

/**
 * Stores the E2B API key securely in VSCode's secret storage
 * @param secretStorage VSCode's secret storage
 * @param apiKey The API key to store
 */
export async function storeApiKey(
  secretStorage: vscode.SecretStorage,
  apiKey: string
): Promise<void> {
  await secretStorage.store(E2B_API_KEY, apiKey);
}

/**
 * Retrieves the E2B API key from VSCode's secret storage
 * @param secretStorage VSCode's secret storage
 * @returns The stored API key or undefined if not found
 */
export async function getApiKey(
  secretStorage: vscode.SecretStorage
): Promise<string | undefined> {
  return secretStorage.get(E2B_API_KEY);
}

/**
 * Deletes the E2B API key from VSCode's secret storage
 * @param secretStorage VSCode's secret storage
 */
export async function deleteApiKey(
  secretStorage: vscode.SecretStorage
): Promise<void> {
  await secretStorage.delete(E2B_API_KEY);
}

/**
 * Validates the format of an API key
 * @param apiKey The API key to validate
 * @returns True if the API key format is valid, false otherwise
 */
export function isValidApiKey(apiKey: string): boolean {
  // Basic validation - can be enhanced based on actual E2B API key format
  return apiKey.trim().length > 0;
}