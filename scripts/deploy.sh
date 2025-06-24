#!/bin/bash

# Intelligent Task Routing App - Deployment Script
# This script deploys the Forge app to your Jira Cloud instance

set -e

echo "🚀 Starting deployment of Intelligent Task Routing App..."

# Check if Forge CLI is installed
if ! command -v forge &> /dev/null; then
    echo "❌ Forge CLI not found. Please install it first:"
    echo "   npm install -g @forge/cli"
    exit 1
fi

# Check if user is logged in
if ! forge whoami &> /dev/null; then
    echo "❌ You are not logged in to Forge. Please run:"
    echo "   forge login"
    exit 1
fi

echo "✅ Forge CLI found and user authenticated"

# Install main dependencies
echo "📦 Installing main dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd static/ai-suggestions-panel
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Return to root
cd ../..

# Deploy the app
echo "🚀 Deploying app to Forge..."
forge deploy

echo "✅ App deployed successfully!"

# Prompt for installation
read -p "🤔 Would you like to install the app on your Jira instance now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📱 Installing app on Jira instance..."
    forge install
    echo "✅ App installed successfully!"
    echo ""
    echo "🎉 Deployment complete! Your Intelligent Task Routing App is now ready."
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to Jira Settings > Apps > AI Task Routing Configuration"
    echo "2. Configure your OpenAI API key"
    echo "3. Enable the features you want to use"
    echo "4. Create a test issue to see AI suggestions in action!"
    echo ""
    echo "📖 For more information, check the README.md file"
else
    echo "📝 App deployed but not installed. To install later, run:"
    echo "   forge install"
fi

echo "🎊 All done!" 