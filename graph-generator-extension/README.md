# Graph Generator VSCode Extension

A VSCode extension that generates data visualization graphs using AI. This extension leverages Ollama for code generation and E2B Sandbox for secure code execution.

## Features

- Generate Python data visualization code using AI
- Execute the generated code in a secure sandbox environment
- View the generated graph directly in VSCode
- Save both the code and graph image to your workspace

## Requirements

- [Ollama](https://ollama.ai/) running locally or on a remote server
- An E2B Sandbox API key (sign up at [e2b.dev](https://e2b.dev))

## Setup

1. Install the extension from the VSCode Marketplace
2. Set your E2B Sandbox API key using the "Set E2B Sandbox API Key" command
3. Configure the Ollama endpoint in settings (defaults to http://localhost:11434)

## Usage

1. Open a workspace where you want to save the generated files
2. Run the "Generate Graph from Description" command from the command palette (Ctrl+Shift+P)
3. Select an AI model from the available Ollama models
4. Enter a description of the graph you want to generate
5. Wait for the code to be generated and executed
6. The generated code and graph image will be opened in VSCode

## Example Prompts

- "A bar chart showing monthly sales data for 2023"
- "A scatter plot of height vs weight with a trend line"
- "A pie chart showing market share of top 5 tech companies"
- "A line graph showing temperature changes over the past year with seasonal markers"

## Extension Settings

This extension contributes the following settings:

* `graphGenerator.ollamaEndpoint`: Ollama API endpoint URL (default: http://localhost:11434)
* `graphGenerator.defaultModel`: Default Ollama model to use (default: gemma3:27b)
* `graphGenerator.outputDirectory`: Directory to save generated files (relative to workspace root)

## Security

- Your E2B Sandbox API key is stored securely using VSCode's built-in secret storage
- Code execution happens in an isolated sandbox environment
- No data is sent to third-party services other than Ollama and E2B

## Development

### Building the Extension

1. Clone the repository
2. Run `pnpm install` to install dependencies
3. Run `pnpm run compile` to build the extension
4. Press F5 to launch the extension in a new VSCode window

### Build Tools

This extension uses:

- [Vite](https://vitejs.dev/) as the build tool for faster and more efficient builds
- [pnpm](https://pnpm.io/) as the package manager for better dependency management

If you don't have pnpm installed, you can install it with:

```bash
npm install -g pnpm
```

All commands in the development workflow should use pnpm:

- `pnpm install` - Install dependencies
- `pnpm run compile` - Build the extension using Vite
- `pnpm run watch` - Build and watch for changes with Vite
- `pnpm run package` - Package the extension for distribution
- `pnpm run dev` - Start Vite in development mode

### Project Structure

```
graph-generator-extension/
├── src/
│   ├── commands/         # Command implementations
│   ├── services/         # Core services
│   ├── utils/            # Utility functions
│   └── extension.ts      # Main extension entry point
├── package.json          # Extension manifest
└── README.md             # Documentation
```

## License

MIT