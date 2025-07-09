#!/bin/bash

# TaskFlow Setup Script
# This script installs all dependencies for the TaskFlow project

echo "🚀 Setting up TaskFlow project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies and workspace dependencies
echo "📦 Installing dependencies..."
npm install

# Verify installation
echo "🔍 Verifying installation..."
if [ $? -eq 0 ]; then
    echo "✅ All dependencies installed successfully!"
    echo ""
    echo "🎉 Setup complete! You can now run:"
    echo "  npm run dev      # Start development servers"
    echo "  npm run build    # Build the project"
    echo "  npm run test     # Run tests"
    echo "  npm run lint     # Run linting"
else
    echo "❌ Installation failed. Please check the errors above."
    exit 1
fi