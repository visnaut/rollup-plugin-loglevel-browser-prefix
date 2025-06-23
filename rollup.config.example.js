// rollup.config.example.js
// Example configuration showing how to use the loglevel-format plugin

import loglevelFormat from './plugin.js';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/bundle.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    // Apply loglevel formatting early in the pipeline
    loglevelFormat({
      // Include JavaScript and TypeScript files
      include: ['src/**/*.js', 'src/**/*.ts'],
      
      // Exclude test files and node_modules
      exclude: ['**/*.test.js', '**/*.spec.js', 'node_modules/**'],
      
      // Transform all standard log levels
      logLevels: ['trace', 'debug', 'info', 'warn', 'error'],
      
      // Enable source maps
      sourceMap: true
    }),
    
    // Resolve node modules
    resolve(),
    
    // Minify for production
    process.env.NODE_ENV === 'production' && terser()
  ].filter(Boolean)
};

// Alternative configuration for development with more verbose logging
export const devConfig = {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.dev.js',
    format: 'iife',
    name: 'MyApp',
    sourcemap: true
  },
  plugins: [
    loglevelFormat({
      // Only transform debug and info in development
      logLevels: ['debug', 'info'],
      
      // More specific file patterns
      include: ['src/**/*.{js,ts}'],
      exclude: ['src/**/*.test.{js,ts}']
    }),
    resolve()
  ]
};
