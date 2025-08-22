#!/bin/bash

# BookerHQ Setup Script
# This script automates the initial setup process
# 
# Usage: 
#   1. Create all project files from the documentation
#   2. chmod +x setup.sh
#   3. ./setup.sh
#   4. Follow the prompts

echo "🚀 Setting up BookerHQ development environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please ensure you're in the BookerHQ project directory"
    echo "   and have created all project files from the documentation."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version $NODE_VERSION detected. Please upgrade to Node.js 16+."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    echo "   Download from: https://git-scm.com/"
    exit 1
fi

echo "✅ Git $(git --version | cut -d' ' -f3) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Set up environment file
if [ ! -f ".env.local" ]; then
    echo "📝 Setting up environment file..."
    cp .env.example .env.local
    echo "✅ Created .env.local from template"
    echo "⚠️  Please edit .env.local with your Supabase credentials before starting development"
else
    echo "✅ .env.local already exists"
fi

# Initialize Git repository if not already initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if there are staged changes or if this is a fresh repo
if [ -z "$(git status --porcelain)" ] && [ -z "$(git log --oneline 2>/dev/null)" ]; then
    echo "📝 Creating initial commit..."
    git add .
    git commit -m "feat: initial BookerHQ project setup with React, TailwindCSS, and Supabase integration"
    echo "✅ Initial commit created"
elif [ -z "$(git log --oneline 2>/dev/null)" ]; then
    echo "📝 Repository has changes, creating initial commit..."
    git add .
    git commit -m "feat: initial BookerHQ project setup with React, TailwindCSS, and Supabase integration"
    echo "✅ Initial commit created"
else
    echo "✅ Git repository already has commits"
fi

# Run linting check
echo "🔍 Running code quality checks..."
npm run lint --silent

if [ $? -eq 0 ]; then
    echo "✅ Code quality checks passed"
else
    echo "⚠️  Code quality issues found. Run 'npm run lint:fix' to auto-fix"
fi

# Summary
echo ""
echo "🎉 BookerHQ setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env.local with your Supabase credentials"
echo "   2. Run 'npm start' to start the development server"
echo "   3. Connect to GitHub:"
echo "      - Create repository on GitHub"
echo "      - git remote add origin https://github.com/YOUR_USERNAME/bookerhq.git"
echo "      - git push -u origin main"
echo ""
echo "🔗 Useful commands:"
echo "   npm start              # Start development server"
echo "   npm run lint           # Check code quality"
echo "   npm run pre-commit     # Fix code before committing"
echo ""
echo "📖 See README.md for detailed instructions and troubleshooting"
echo ""
echo "Happy coding! 🚀"