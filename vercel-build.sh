#!/bin/bash

# Ensure the script fails on errors
set -e

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Copy any necessary files for the API
echo "Setting up API functions..."
mkdir -p dist/api
cp -r api/* dist/api/

echo "Build completed successfully!" 