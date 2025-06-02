import { isCancel, cancel, text, intro, outro, spinner, select } from '@clack/prompts';
import { setTimeout } from 'node:timers/promises';
import ollama from 'ollama';
import 'dotenv/config';
import { Sandbox } from '@e2b/code-interpreter';
import fs from 'fs';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import path from 'path';

/**
 * Type for Ollama models
 * This provides type safety for model selection
 */
type OllamaModel =
  | 'gemma3:27b'
  | 'gemma3:7b'
  | 'llama3:8b'
  | 'llama3:70b'
  | 'mistral:7b'
  | 'mixtral:8x7b'
  | 'phi3:14b'
  | string; // Allow custom models as fallback

/**
 * Interface for code blocks extracted from text
 */
interface CodeBlock {
  language: string;
  code: string;
}

/**
 * Interface for chat message
 */
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Interface for streaming chat request options
 */
interface StreamingChatRequest {
  model: OllamaModel;
  messages: ChatMessage[];
  stream: true;
  max_tokens?: number;
}

/**
 * Interface for non-streaming chat request options
 */
interface NonStreamingChatRequest {
  model: OllamaModel;
  messages: ChatMessage[];
  stream: false;
  max_tokens?: number;
}

/**
 * Type for Ollama chat response
 */
interface ChatResponse {
  message: {
    content: string;
  };
}

/**
 * Interface for execution results from E2B
 */
interface ExecutionResult {
  logs: string | any;
  results: Array<{
    png?: string;
    [key: string]: any;
  }>;
}

/**
 * Opens an image file using the appropriate command for the operating system
 * @param filePath - Path to the image file to open
 */
function openImage(filePath: string): void {
  let command: string;

  switch (process.platform) {
    case 'darwin': // macOS
      command = `open "${filePath}"`;
      break;
    case 'win32': // Windows
      command = `start "" "${filePath}"`;
      break;
    case 'linux': // Linux
      command = `xdg-open "${filePath}"`;
      break;
    default:
      console.error('Unsupported operating system:', process.platform);
      return;
  }

  // Execute the command
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error opening image: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }
    console.log('Image opened successfully');
  });
}

/**
 * Fetches available models from Ollama API
 * @returns Array of available model names
 */
async function fetchAvailableModels(): Promise<string[]> {
  try {
    const loadingSpinner = spinner();
    loadingSpinner.start('Fetching available models...');
    
    const response = await fetch('http://localhost:11434/api/tags');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    
    const data = await response.json() as { models?: Array<{ name: string }> };
    loadingSpinner.stop('Models fetched successfully!');
    
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
 * Extracts code blocks from text
 * @param text - The text to extract code blocks from
 * @returns Array of code blocks with language and code
 */
function extractCode(text: string): CodeBlock[] {
  const codeBlocks: CodeBlock[] = [];
  const regex = /```(python|javascript)\n([\s\S]*?)\n```/g;
  let match: RegExpExecArray | null;
  
  while ((match = regex.exec(text)) !== null) {
    codeBlocks.push({
      language: match[1],
      code: match[2]
    });
  }
  
  return codeBlocks;
}

/**
 * Sends a streaming chat request to Ollama
 * @param messages - Array of messages to send
 * @param model - The model to use
 * @param max_tokens - Maximum number of tokens to generate
 * @returns The full response as a string
 */
async function sendStreamingChatRequest(
  messages: ChatMessage[],
  model: OllamaModel,
  max_tokens?: number
): Promise<string> {
  try {
    // Validate inputs
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages must be a non-empty array');
    }
    
    if (!model || typeof model !== 'string') {
      throw new Error('Model must be a non-empty string');
    }
    
    if (max_tokens && (typeof max_tokens !== 'number' || max_tokens <= 0)) {
      throw new Error('max_tokens must be a positive number');
    }
    
    // Prepare the chat request with explicit stream: true type
    const request: StreamingChatRequest = {
      model: model,
      messages: messages,
      stream: true // Enable streaming
    };
    
    // Add max_tokens if provided
    if (max_tokens) {
      request.max_tokens = max_tokens;
    }
    
    // Send the streaming chat request to Ollama
    const response = await ollama.chat(request);
    
    // Process the streaming response
    let fullResponse = '';
    for await (const chunk of response) {
      const content = chunk.message.content;
      process.stdout.write(content); // Print chunk without adding newlines
      fullResponse += content;
    }
    
    process.stdout.write('\n'); // Add newline at the end
    
    // Return the complete response
    return fullResponse;
  } 
  catch (error) {
    if (error instanceof Error) {
      console.error('Error interacting with Ollama:', error.message);
    } 
    else {
      console.error('Unknown error interacting with Ollama');
    }
    throw error;
  }
}

/**
 * Sends a non-streaming chat request to Ollama
 * @param messages - Array of messages to send
 * @param model - The model to use
 * @param max_tokens - Maximum number of tokens to generate
 * @returns The response content as a string
 */
async function sendChatRequest(
  messages: ChatMessage[],
  model: OllamaModel,
  max_tokens?: number
): Promise<string> {
  try {
    // Validate inputs
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages must be a non-empty array');
    }
    
    if (!model || typeof model !== 'string') {
      throw new Error('Model must be a non-empty string');
    }
    
    if (max_tokens && (typeof max_tokens !== 'number' || max_tokens <= 0)) {
      throw new Error('max_tokens must be a positive number');
    }
    
    // Prepare the chat request with explicit stream: false type
    const request: NonStreamingChatRequest = {
      model: model,
      messages: messages,
      stream: false // Disable streaming
    };
    
    // Add max_tokens if provided
    if (max_tokens) {
      request.max_tokens = max_tokens;
    }
    else {
      request.max_tokens = 4096; // Default value
    }
    
    // Send the chat request to Ollama
    const response = await ollama.chat(request);
    
    // Return the response content
    return response.message.content;
  } 
  catch (error) {
    if (error instanceof Error) {
      console.error('Error interacting with Ollama:', error.message);
    } 
    else {
      console.error('Unknown error interacting with Ollama');
    }
    throw error;
  }
}

/**
 * Main function to run the application
 */
async function main(): Promise<void> {
  intro('Welcome to the Graph Generator - Powered by Ollama and E2B!');

  // Fetch available models
  const availableModels = await fetchAvailableModels();
  
  // Let the user select a model
  const selectedModel = await select({
    message: 'Select an AI model to use:',
    options: availableModels.map(model => ({
      value: model,
      label: model
    })),
  });

  if (isCancel(selectedModel)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  // Get the graph description from the user
  const userInput = await text({
    message: 'Describe the graph you want to generate:',
    placeholder: 'E.g., "A bar chart showing monthly sales data for 2023"',
  });
  
  if (isCancel(userInput)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  
  const defaultInput = 'A bar chart showing monthly Beer sales data for 2023. Add a line plot showing average monthly temperature. Generate meaningful sample data for both Beer sales and temperature.';
  
  // Send the user's input to Ollama and get the response
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are an expert code generator specializing in data visualization. Generate Python code that creates graphs based on user descriptions. Include sample data in your code. Only output Python code blocks with no explanations. The code should use matplotlib, seaborn, or plotlib to generate a visual graph that can be saved as an image. Supress any warnings related to module pydantic. Do not include any other text or explanations in your response.'
    },
    {
      role: 'user',
      content: userInput !== '' ? userInput as string : defaultInput
    },
  ];
  
  const max_tokens = 4096;
  let response: string;
  
  const loadingSpinner = spinner();
  loadingSpinner.start(`Generating graph code using ${selectedModel}...`);
  
  try {
    response = await sendChatRequest(messages, selectedModel as OllamaModel, max_tokens);
  }
  catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
  
  loadingSpinner.stop('Code generation completed!');
  
  // Extract code blocks from the response
  loadingSpinner.start('Extracting code...');
  await setTimeout(1000);
  const codeBlocks = extractCode(response);
  console.log(`\n\tCodeBlocks found: ${codeBlocks.length}`);
  loadingSpinner.stop('Code extraction completed!');
  
  if (codeBlocks.length === 0) {
    console.error('No code blocks found in the response.');
    process.exit(1);
  }
  
  // Execute the generated code
  loadingSpinner.start('Creating sandbox environment...');
  const sandbox = await Sandbox.create(); // By default the sandbox is alive for 5 minutes
  loadingSpinner.stop('Sandbox created!');
  
  loadingSpinner.start('Executing code to generate graph...');
  const execution = await sandbox.runCode(codeBlocks[0].code);
  console.log("\n\tLogs:", execution.logs);
  console.log("\n\tResults:", execution.results.length);
  loadingSpinner.stop('Code execution completed!');
  
  // Clean up the sandbox
  sandbox.kill(); // Close the sandbox
  
  // Save the graph as an image if available
  if (execution.results.length > 0 && execution.results[0].png) {
    loadingSpinner.start('Saving graph to graph.png');
    // Write the output to a file
    const result = execution.results[0];
    if (result.png) {
      fs.writeFileSync("graph.png", Buffer.from(result.png, "base64"));
    }
    loadingSpinner.stop('Done! Graph saved as graph.png');
    openImage(path.resolve("graph.png")); // Open the image using the appropriate command for the OS
  }
  else {
    console.log('No graph image was generated.');
  }
  
  // Save the code to files
  if (codeBlocks && codeBlocks.length > 0) {
    loadingSpinner.start(`Saving ${codeBlocks.length > 1 ? 'code blocks' : 'code'} to file(s)...`);
    
    // Get the user prompt to include as a comment
    const userPrompt = userInput !== '' ? userInput as string : defaultInput;
    
    // Write each code block to a separate file if there are multiple
    for (let i = 0; i < codeBlocks.length; i++) {
      const codeBlock = codeBlocks[i];
      const fileName = codeBlocks.length > 1 ? `graph_code_${i + 1}.py` : "graph_code.py";
      
      // Format the code with comments
      let codeWithComments = '';
      
      // Add a comment header
      codeWithComments += `# ${'='.repeat(80)}\n`;
      
      // Add user prompt as a multiline comment for better readability
      codeWithComments += `# USER PROMPT:\n`;
      // Split the prompt into lines of max 70 characters for readability
      const promptLines = userPrompt.match(/.{1,70}(\s|$)/g) || [userPrompt];
      promptLines.forEach(line => {
        codeWithComments += `# ${line.trim()}\n`;
      });
      
      // Add model information
      codeWithComments += `#\n# MODEL: ${selectedModel}\n`;
      
      // Add code block index as a comment if there are multiple code blocks
      if (codeBlocks.length > 1) {
        codeWithComments += `# CODE BLOCK: ${i + 1} of ${codeBlocks.length}\n`;
      }
      
      // Add a separator line
      codeWithComments += `# ${'='.repeat(80)}\n\n`;
      
      // Add the actual code
      codeWithComments += codeBlock.code;
      
      // Write to file
      fs.writeFileSync(fileName, codeWithComments);
    }
    
    const fileMessage = codeBlocks.length > 1
      ? `Done! ${codeBlocks.length} code files saved as graph_code_1.py through graph_code_${codeBlocks.length}.py`
      : "Done! Code saved as graph_code.py";
    
    loadingSpinner.stop(fileMessage);
  }
  
  outro('Thank you for using the Graph Generator!');
}

// Run the application
main().catch(error => {
  console.error('Application error:', error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});