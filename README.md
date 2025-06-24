# 🤖 Intelligent Task Routing App for Jira

An AI-powered Forge app that automatically suggests optimal assignees and priority levels for Jira issues, helping teams work more efficiently and ensure tasks reach the right people quickly.

## ✨ Features

### MVP Features (Current)

- **🎯 AI-Powered Assignee Recommendations**: Get intelligent suggestions for who should work on each issue
- **📊 Priority Prediction**: AI analyzes issue content to suggest appropriate priority levels
- **🔧 Multi-Model Support**: Choose from OpenAI GPT-4/3.5, with Anthropic Claude and Google Gemini planned
- **⚙️ Admin Configuration**: Easy-to-use admin dashboard for model selection and settings
- **👍 Feedback System**: Users can provide feedback to improve suggestion accuracy
- **📈 Analytics**: Track suggestion acceptance rates and usage patterns

### How It Works

1. **Issue Created**: When a new issue is created in Jira
2. **AI Analysis**: The app analyzes the issue content, components, and historical data
3. **Smart Suggestions**: AI generates suggestions for assignee and priority with confidence scores
4. **User Choice**: Suggestions appear in the issue panel - users can accept, reject, or provide feedback
5. **Continuous Learning**: The system learns from feedback to improve future suggestions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Atlassian Developer account with Jira Cloud access
- Forge CLI installed globally: `npm install -g @forge/cli`
- OpenAI API key (for AI functionality)

### Installation

#### Option 1: Automated Deployment (Recommended)

**For Windows (PowerShell):**

```powershell
.\scripts\deploy.ps1
```

**For macOS/Linux:**

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

#### Option 2: Manual Deployment

1. **Clone and setup:**

   ```bash
   npm install
   cd static/ai-suggestions-panel
   npm install
   npm run build
   cd ../..
   ```

2. **Login to Forge:**

   ```bash
   forge login
   ```

3. **Deploy the app:**
   ```bash
   forge deploy
   forge install
   ```

## ⚙️ Configuration

### 1. Admin Configuration

After installation, go to:
**Jira Settings** → **Apps** → **AI Task Routing Configuration**

### 2. Configure AI Model

1. **Add OpenAI API Key**: Enter your OpenAI API key
2. **Select Model**: Choose between GPT-3.5 (faster, cheaper) or GPT-4 (more accurate)
3. **Set Confidence Threshold**: Minimum confidence level for suggestions (recommended: 0.6)

### 3. Enable Features

- **Auto-Assign**: Automatically assign issues (start with disabled for testing)
- **Auto-Priority**: Automatically set priority levels
- **Allow Reassignment**: Enable suggestions for already assigned issues

### 4. Configure Filters (Optional)

- **Project Filter**: Limit to specific projects
- **Issue Type Filter**: Apply only to certain issue types
- **Component Filter**: Focus on specific components

## 🎯 Using the App

### For End Users

1. **Create or view an issue** in Jira
2. **Look for the "AI Suggestions" panel** on the right side
3. **Review suggestions** with confidence scores and reasoning
4. **Apply suggestions** with one click or provide feedback
5. **See recent activity** and suggestion history

### For Administrators

1. **Monitor usage** through the admin dashboard
2. **View analytics** including acceptance rates and model usage
3. **Adjust settings** based on team feedback
4. **Export configuration** for backup/sharing

## 📊 Understanding AI Suggestions

### Assignee Suggestions

The AI considers:

- **Component expertise** from historical assignments
- **Issue content analysis** (keywords, complexity)
- **Team workload** (when data available)
- **Past resolution patterns**

### Priority Suggestions

The AI evaluates:

- **Urgency indicators** in the description
- **Issue type patterns** (bugs typically higher priority)
- **Impact keywords** (security, critical, etc.)
- **Historical priority patterns**

### Confidence Scores

- **80-100%**: High confidence - strong recommendation
- **60-79%**: Medium confidence - good suggestion
- **Below 60%**: Low confidence - suggestion filtered out (configurable)

## 🔧 Advanced Configuration

### Model Selection Guidelines

- **GPT-3.5**: Best for high-volume usage, cost-effective, good general performance
- **GPT-4**: Best for complex issues, higher accuracy, more expensive

### Optimizing Performance

1. **Start with suggestions only** (auto-assign disabled)
2. **Monitor acceptance rates** in analytics
3. **Adjust confidence threshold** based on feedback
4. **Enable auto-assignment** once team trusts suggestions

### Security Best Practices

- **API Key Storage**: Keys are encrypted in Forge storage
- **Data Privacy**: Only necessary issue data sent to AI models
- **Opt-out Options**: Configurable data filtering
- **Audit Trail**: All actions logged for compliance

## 📈 Analytics & Monitoring

### Key Metrics

- **Total Suggestions Generated**
- **Acceptance Rate** (suggestions applied by users)
- **Model Usage** (distribution across AI models)
- **Response Times** (AI processing speed)

### Performance Monitoring

```bash
# View live logs
forge logs --follow

# Check app status
forge status

# Validate configuration
forge lint
```

## 🐛 Troubleshooting

### Common Issues

**Issue: No suggestions appearing**

- ✅ Check if app is enabled in configuration
- ✅ Verify OpenAI API key is configured
- ✅ Ensure issue matches filters (project, type, etc.)

**Issue: Low suggestion accuracy**

- ✅ Review confidence threshold setting
- ✅ Provide feedback on suggestions to improve learning
- ✅ Consider switching to GPT-4 for better analysis

**Issue: Performance problems**

- ✅ Check API rate limits in configuration
- ✅ Monitor response times in logs
- ✅ Consider using GPT-3.5 for faster responses

### Debug Mode

```bash
# Start development tunnel
forge tunnel

# View detailed logs
forge logs --verbose
```

### Getting Help

1. **Check logs**: `forge logs`
2. **Review configuration**: Admin dashboard
3. **Test with simple issues**: Create test cases
4. **Contact support**: Include logs and configuration details

## 🔮 Roadmap

### Planned Features

- **Workload Balancing**: Visual dashboard showing team capacity
- **Custom Rules**: Business logic overrides for AI suggestions
- **Multi-language Support**: Non-English issue analysis
- **Confluence Integration**: Context from linked documentation
- **Advanced Analytics**: Detailed performance insights
- **Enterprise Features**: SSO, custom compliance, dedicated support

### Model Additions

- **Anthropic Claude**: Alternative AI model option
- **Google Gemini**: Additional model choice
- **Custom Models**: Support for organization-specific models

## 🤝 Contributing

This app follows Atlassian's best practices for Forge development:

- **Security**: All data handling follows Atlassian security guidelines
- **Performance**: Optimized for Jira Cloud scalability
- **User Experience**: Native Jira UI/UX patterns
- **Accessibility**: WCAG compliance for all UI components

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

- **Documentation**: This README and inline help
- **Logs**: Use `forge logs` for troubleshooting
- **Community**: Atlassian Developer Community forums
- **Issues**: GitHub issues for bug reports and feature requests

---

**Built with ❤️ using Atlassian Forge and modern AI models**

_Transform your Jira workflow with intelligent task routing - because the right task should reach the right person at the right time._
