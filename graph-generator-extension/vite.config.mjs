// vite.config.mjs
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    target: 'node16',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: 'hidden',
    lib: {
      entry: resolve(__dirname, 'src/extension.ts'),
      formats: ['cjs'],
      fileName: 'extension'
    },
    rollupOptions: {
      // Mark all Node.js built-in modules as external
      external: [
        'vscode',
        'path',
        'fs',
        'os',
        'crypto',
        'child_process',
        'http',
        'https',
        'url',
        'util',
        'stream',
        'zlib',
        'buffer',
        'node:crypto',
        /node:.*/
      ],
      output: {
        // Ensure the extension is compatible with VSCode's CommonJS module system
        format: 'cjs',
        entryFileNames: '[name].js',
      }
    },
    // Minification is not needed for VSCode extensions
    minify: false,
    // Ensure source code is as close as possible to the original
    reportCompressedSize: false,
  },
  resolve: {
    // Allow importing .ts files without specifying the extension
    extensions: ['.ts', '.js']
  },
  // Configure optimizations
  optimizeDeps: {
    // Exclude vscode from optimization
    exclude: ['vscode']
  },
  // Enable watch mode for development
  server: {
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**']
    }
  }
});