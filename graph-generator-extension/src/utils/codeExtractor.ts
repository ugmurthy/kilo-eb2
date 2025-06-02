/**
 * Interface for code blocks extracted from text
 */
export interface CodeBlock {
  language: string;
  code: string;
}

/**
 * Extracts code blocks from text
 * @param text The text to extract code blocks from
 * @returns Array of code blocks with language and code
 */
export function extractCode(text: string): CodeBlock[] {
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
 * Formats code with comments including user prompt and model information
 * @param code The code to format
 * @param userPrompt The user prompt that generated the code
 * @param model The model used to generate the code
 * @param blockIndex Optional index of the code block
 * @param totalBlocks Optional total number of code blocks
 * @returns Formatted code with comments
 */
export function formatCodeWithComments(
  code: string,
  userPrompt: string,
  model: string,
  blockIndex?: number,
  totalBlocks?: number
): string {
  let formattedCode = '';
  
  // Add a comment header
  formattedCode += `# ${'='.repeat(80)}\n`;
  
  // Add user prompt as a multiline comment for better readability
  formattedCode += `# USER PROMPT:\n`;
  // Split the prompt into lines of max 70 characters for readability
  const promptLines = userPrompt.match(/.{1,70}(\s|$)/g) || [userPrompt];
  promptLines.forEach(line => {
    formattedCode += `# ${line.trim()}\n`;
  });
  
  // Add model information
  formattedCode += `#\n# MODEL: ${model}\n`;
  
  // Add code block index as a comment if provided
  if (blockIndex !== undefined && totalBlocks !== undefined && totalBlocks > 1) {
    formattedCode += `# CODE BLOCK: ${blockIndex + 1} of ${totalBlocks}\n`;
  }
  
  // Add a separator line
  formattedCode += `# ${'='.repeat(80)}\n\n`;
  
  // Add the actual code
  formattedCode += code;
  
  return formattedCode;
}