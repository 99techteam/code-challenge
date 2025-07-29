#!/bin/bash

# Scoreboard API Module Specification - Setup Script
# This script automates the setup process for the project

echo "🚀 Setting up Scoreboard API Module Specification..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node --version)"
    exit 1
fi

# Check if Yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn is not installed. Please install Yarn first."
    echo "   You can install it with: npm install -g yarn"
    exit 1
fi

echo "✅ Node.js $(node --version) and Yarn $(yarn --version) are installed"

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Generate diagrams
echo "📊 Generating diagrams..."
yarn generate-diagram

if [ $? -eq 0 ]; then
    echo "✅ Diagrams generated successfully"
else
    echo "❌ Failed to generate diagrams"
    exit 1
fi

# Generate HTML documentation
echo "📄 Generating HTML documentation..."
yarn generate-html

if [ $? -eq 0 ]; then
    echo "✅ HTML documentation generated successfully"
else
    echo "❌ Failed to generate HTML documentation"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📁 Project Structure:"
echo "   - diagrams/*.mermaid (Source diagrams)"
echo "     ├── scoreboard-flow.mermaid (Main system flow)"
echo "     ├── scoreboard-flow-sse.mermaid (Score update flow)"
echo "     └── scoreboard-sse-connection.mermaid (SSE connection flow)"
echo "   - diagrams/generated/*.svg (Generated diagrams)"
echo "   - docs/index.html (HTML documentation)"
echo "   - docs/diagrams/*.svg (Diagrams for HTML viewing)"
echo ""
echo "🚀 Available commands:"
echo "   yarn generate-diagram  - Regenerate diagrams"
echo "   yarn generate-html     - Regenerate HTML documentation"
echo "   yarn view-docs         - Open HTML docs in browser"
echo "   yarn setup             - Complete setup (this script)"
echo ""
echo "📖 View the documentation:"
echo "   - Open docs/index.html in your browser"
echo "   - Or run: yarn view-docs"
echo ""
echo "📋 Next steps:"
echo "   1. Review the specification in docs/index.html"
echo "   2. Check the generated diagrams in diagrams/generated/"
echo "   3. Modify diagrams in diagrams/*.mermaid if needed"
echo "   4. Update README.md for any specification changes"
echo ""
echo "🔧 Development:"
echo "   - Edit .mermaid files in diagrams/ to update diagrams"
echo "   - Run 'yarn generate-diagram' to regenerate SVGs"
echo "   - Run 'yarn generate-html' to update documentation" 