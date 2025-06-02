import * as vscode from 'vscode';
// Use explicit import for node-fetch to avoid Vite externalization issues
import fetch, { Response } from 'node-fetch';

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