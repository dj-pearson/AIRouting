# Intelligent Task Routing App - Windows Deployment Script
# This script deploys the Forge app to your Jira Cloud instance

Write-Host "🚀 Starting deployment of Intelligent Task Routing App..." -ForegroundColor Green

# Check if Forge CLI is installed
try {
    forge whoami | Out-Null
    Write-Host "✅ Forge CLI found and user authenticated" -ForegroundColor Green
} catch {
    Write-Host "❌ Forge CLI not found or not authenticated. Please:" -ForegroundColor Red
    Write-Host "   1. Install: npm install -g @forge/cli" -ForegroundColor Yellow
    Write-Host "   2. Login: forge login" -ForegroundColor Yellow
    exit 1
}

# Install main dependencies
Write-Host "📦 Installing main dependencies..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install main dependencies" -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
Set-Location "static/ai-suggestions-panel"
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build frontend" -ForegroundColor Red
    exit 1
}

# Return to root
Set-Location "../.."

# Deploy the app
Write-Host "🚀 Deploying app to Forge..." -ForegroundColor Blue
forge deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy app" -ForegroundColor Red
    exit 1
}

Write-Host "✅ App deployed successfully!" -ForegroundColor Green

# Prompt for installation
$install = Read-Host "🤔 Would you like to install the app on your Jira instance now? (y/n)"
if ($install -eq "y" -or $install -eq "Y") {
    Write-Host "📱 Installing app on Jira instance..." -ForegroundColor Blue
    forge install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ App installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Deployment complete! Your Intelligent Task Routing App is now ready." -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Yellow
        Write-Host "1. Go to Jira Settings > Apps > AI Task Routing Configuration"
        Write-Host "2. Configure your OpenAI API key"
        Write-Host "3. Enable the features you want to use"
        Write-Host "4. Create a test issue to see AI suggestions in action!"
        Write-Host ""
        Write-Host "📖 For more information, check the README.md file"
    } else {
        Write-Host "❌ Failed to install app" -ForegroundColor Red
    }
} else {
    Write-Host "📝 App deployed but not installed. To install later, run:" -ForegroundColor Yellow
    Write-Host "   forge install"
}

Write-Host "🎊 All done!" -ForegroundColor Green 