// ES Module build script for API
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

console.log('Building API functions for Vercel deployment...');

// Simple TypeScript to JavaScript transpilation for API files
async function buildApiFiles() {
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync('./api/build')) {
      fs.mkdirSync('./api/build', { recursive: true });
    }

    // Transpile TypeScript files to JavaScript with ES module syntax
    await execAsync('npx tsc ./api/generate.ts --outDir ./api/build --module es2020 --target es2020 --moduleResolution node');
    
    console.log('API functions built successfully!');
  } catch (error) {
    console.error('Error building API functions:', error);
    process.exit(1);
  }
}

buildApiFiles();

// This script doesn't need to do anything specific as Vercel will handle the TypeScript compilation
// But having this file helps ensure the API directory is properly recognized 