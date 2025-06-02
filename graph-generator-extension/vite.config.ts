import { defineConfig } from 'vite';
import * as path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  build: {
    target: 'node16',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: 'hidden',
    lib: {
      entry: path.resolve('./src/extension.ts'),
      formats: ['cjs'],
      fileName: 'extension'
    },
    rollupOptions: {
      external: ['vscode'],
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
  // Configure plugins
  plugins: [
    // Add Node.js polyfills if needed
    nodePolyfills({
      // Only include polyfills actually used
      include: ['buffer', 'process', 'util']
    })
  ],
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