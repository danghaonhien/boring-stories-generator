#!/bin/bash

# Ensure the script fails on errors
set -e

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the frontend application
echo "Building the frontend application..."
npm run build

# Build API functions
echo "Building API functions..."
node --input-type=module api/_build.js

# Copy built API files to the dist directory
echo "Setting up API functions..."
mkdir -p dist/api
cp -r api/build/* dist/api/

echo "Build completed successfully!" 