# Intelligent Task Routing & Triage for Jira

An AI-powered Jira app that provides intelligent task routing, ticket triage, and automated tagging capabilities. This app analyzes issue content to automatically categorize, prioritize, and route tickets to the most suitable team members while detecting sentiment and urgency.

## 🚀 Features

### Core AI Routing

- **Smart Assignment**: AI-powered assignee suggestions based on skills, workload, and historical patterns
- **Priority Intelligence**: Automatic priority assessment based on impact and urgency analysis
- **Skill Matching**: Routes tickets to team members with relevant expertise

### 🧠 Intelligent Ticket Triage & Tagging (NEW!)

- **Automatic Categorization**: AI classifies issues into types (bug, feature, support, security, etc.)
- **Priority Detection**: Analyzes content to determine appropriate priority levels
- **Sentiment Analysis**: Detects emotional tone and customer frustration levels
- **Urgency Assessment**: Identifies time-sensitive issues requiring immediate attention
- **Auto-Labeling**: Applies relevant labels based on AI analysis
- **Component Suggestions**: Recommends appropriate project components
- **Escalation Risk Detection**: Flags tickets with high customer escalation potential

### 📊 Analytics & Insights

- **Triage Analytics Dashboard**: Comprehensive analytics on ticket categorization and sentiment
- **Activity Tracking**: Monitor AI suggestions and their effectiveness
- **Performance Metrics**: Track confidence scores and recommendation accuracy
- **Escalation Monitoring**: Identify patterns in customer escalation risks

## 🛠️ Installation

1. **Prerequisites**

   - Forge CLI installed (`npm install -g @forge/cli`)
   - OpenAI API key (for AI analysis)
   - Jira Admin permissions

2. **Clone and Setup**

   ```bash
   git clone <repository-url>
   cd intelligent-task-routing
   npm install
   ```

3. **Build the UI Components**

   ```bash
   npm run build
   # Or build components individually:
   npm run build:admin    # Admin configuration UI
   npm run build:triage   # Triage analytics dashboard
   ```

4. **Deploy to Jira**
   ```bash
   forge deploy
   forge install
   ```

## ⚙️ Configuration

### 1. Basic Setup

Navigate to **Apps** → **AI Task Routing Configuration** in your Jira admin panel:

- **Enable AI Routing**: Turn the app on/off
- **AI Model Selection**: Choose between GPT-4 or GPT-3.5-turbo
- **API Key Configuration**: Set your OpenAI API key
- **Confidence Thresholds**: Set minimum confidence levels for auto-actions

### 2. Triage Settings

Configure the new triage features:

- **Enable Triage**: Turn on AI-powered ticket analysis
- **Auto-Labeling**: Automatically apply AI-suggested labels
- **Auto-Components**: Automatically assign components (recommend starting disabled)
- **Sentiment Analysis**: Enable emotional tone detection
- **Urgency Detection**: Enable time-sensitivity analysis

### 3. Advanced Configuration

```javascript
// Custom field mapping for triage metadata
customFields: {
  aiConfidenceField: "customfield_10001",      // Store AI confidence scores
  triageTimestampField: "customfield_10002",   // Store triage timestamps
  sentimentScoreField: "customfield_10003",    // Store sentiment scores
  escalationRiskField: "customfield_10004"     // Store escalation risk levels
}
```

## 🎯 How It Works

### Triage Analysis Process

1. **Content Analysis**: AI examines issue summary, description, and comments
2. **Multi-dimensional Assessment**:
   - **Category**: bug, feature, improvement, support, security, performance, etc.
   - **Priority**: critical, high, medium, low based on business impact
   - **Sentiment**: positive, neutral, negative with escalation risk assessment
   - **Urgency**: immediate, high, medium, low based on time-sensitivity
3. **Auto-Tagging**: Applies structured labels like `ai-category-bug`, `ai-priority-high`
4. **Component Matching**: Suggests relevant project components
5. **Escalation Flagging**: Identifies tickets requiring special attention

### Smart Assignment

- Uses triage results to inform routing decisions
- Considers escalation risk for senior team member assignment
- Factors in sentiment analysis for customer-facing issues
- Prioritizes urgent issues for immediate assignment

## 📈 Analytics Dashboard

Access **Apps** → **AI Triage Analytics** to view:

### Summary Metrics

- Total issues triaged
- Critical priority count
- Negative sentiment detection
- Immediate urgency flags

### Detailed Analytics

- **Category Distribution**: Pie chart of issue types
- **Priority Analysis**: Bar chart of priority levels
- **Sentiment Insights**: Distribution of emotional tones
- **Urgency Patterns**: Analysis of time-sensitivity
- **Recent Activity**: Table of latest triage actions

### Activity Monitoring

- AI confidence scores over time
- Applied vs. suggested changes
- Escalation risk trends
- Team assignment patterns

## 🏷️ Auto-Applied Labels

The system automatically applies structured labels:

### Category Labels

- `ai-category-bug` - Software defects
- `ai-category-feature` - New functionality requests
- `ai-category-support` - Help requests
- `ai-category-security` - Security-related issues
- `ai-category-performance` - Performance problems

### Status Labels

- `ai-priority-critical` - Critical priority assigned
- `ai-sentiment-negative` - Negative sentiment detected
- `ai-urgency-immediate` - Immediate attention required
- `ai-escalation-risk` - High escalation potential
- `ai-customer-frustrated` - Customer frustration detected
- `ai-urgent-language` - Urgent language patterns found

## 🔍 Understanding AI Comments

When the AI processes an issue, it adds a comprehensive comment including:

```
🤖 AI Ticket Triage Analysis (85% confidence)

✅ Applied Changes:
• 🎯 Priority set to HIGH
• 🏷️ Added labels: ai-category-bug, ai-priority-high, ai-escalation-risk

📊 Analysis Summary:
• Category: bug
• Priority: HIGH
• Urgency: high
• Sentiment: negative ⚠️ Escalation Risk: high

💡 Recommendations:
• ⚠️ Customer appears frustrated - prioritize communication and updates
• 🚨 This issue requires immediate attention - consider escalating to senior team members

🔍 Categorization Reasoning: Issue describes a critical login failure affecting multiple users in production environment
⚡ Priority Reasoning: Production system failure with multiple user impact requires immediate attention
```

## 📝 API Integration

### Custom Field Mapping

Store triage metadata in custom fields:

```javascript
// Example: Accessing AI confidence in JQL
project = "DEMO" AND "AI Confidence" > 80

// Example: Finding high escalation risk issues
project = "DEMO" AND "Escalation Risk" = "high"
```

### Webhook Integration

The app triggers on:

- `avi:jira:created:issue` - New issue triage
- `avi:jira:updated:issue` - Re-triage on updates

## 🔐 Security & Privacy

- All AI analysis uses encrypted API connections
- No sensitive data is stored permanently
- Analytics data is anonymized
- Configurable data retention periods
- GDPR compliant data handling

## 🎛️ Performance Tuning

### Confidence Thresholds

- **Auto-Labeling**: 0.6 (default) - Balance between automation and accuracy
- **Auto-Priority**: 0.7 (default) - Higher threshold for priority changes
- **Auto-Components**: 0.8 (default) - Highest threshold for component assignment

### Rate Limiting

- Respects OpenAI API rate limits
- Configurable request throttling
- Fallback mechanisms for API failures

## 🐛 Troubleshooting

### Common Issues

1. **Triage Not Running**

   - Check `enableTriage` setting in configuration
   - Verify OpenAI API key is valid
   - Review app logs for errors

2. **Low Confidence Scores**

   - Ensure issue descriptions are detailed
   - Check if project components are configured
   - Review similar issues for context

3. **Missing Analytics Data**
   - Analytics populate after first triage actions
   - Check storage permissions
   - Verify resolver functions are working

### Debug Mode

Enable detailed logging:

```javascript
// In configuration
logLevel: "debug";
```

## 🔄 Updates & Migrations

### Version 2.0 Features

- ✅ Intelligent ticket triage
- ✅ Sentiment analysis
- ✅ Auto-tagging system
- ✅ Analytics dashboard
- ✅ Escalation risk detection

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

- GitHub Issues: Report bugs and feature requests
- Documentation: Check the `/Documents` folder for detailed guides
- Community: Join our discussions for best practices

---

**Note**: This app requires OpenAI API access and may incur usage costs based on your analysis volume. Monitor your API usage through the OpenAI dashboard.
