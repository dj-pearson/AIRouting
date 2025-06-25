# AI Task Routing - Deployment Guide

## Quick Deployment

### Prerequisites

- Forge CLI installed (`npm install -g @forge/cli`)
- OpenAI API key
- Jira Cloud instance with admin access

### Steps

1. **Setup Dependencies**

   ```bash
   npm run setup
   ```

2. **Build the App**

   ```bash
   npm run build
   ```

3. **Deploy to Development**

   ```bash
   forge deploy --environment development
   ```

4. **Install the App**

   ```bash
   forge install --environment development
   ```

5. **Configure the App**

   - Go to Jira Settings → Apps → AI Task Routing Configuration
   - Add your OpenAI API key
   - Configure triage settings
   - Enable features gradually (start with labels only)

6. **Test the App**
   - Create a test issue in Jira
   - Check the issue comments for AI analysis results
   - View analytics at: Jira Settings → Apps → AI Triage Analytics

## Build Commands

- `npm run build` - Build both admin and triage dashboards
- `npm run build:admin` - Build admin configuration UI (static files)
- `npm run build:triage` - Build triage analytics dashboard
- `npm run setup` - Install triage dashboard dependencies

## Configuration

### Initial Setup (Recommended)

1. **Enable triage** with auto-labeling only
2. **Disable auto-assignment** initially
3. **Set confidence threshold** to 70%
4. **Monitor results** for a few days
5. **Gradually enable** more features

### Production Deployment

```bash
forge deploy --environment production
forge install --environment production
```

## Troubleshooting

### Build Issues

- Ensure you have Node.js 16+ installed
- Run `npm run setup` before building
- Check that all dependencies are installed

### Deployment Issues

- Verify Forge CLI is logged in: `forge whoami`
- Check app permissions in manifest.yml
- Ensure OpenAI API key has sufficient credits

### Runtime Issues

- Check Forge logs: `npm run logs`
- Verify OpenAI API key in configuration
- Check Jira project permissions

## Features Overview

### Intelligent Triage

- **Automatic categorization** (bug, feature, support, etc.)
- **Priority detection** based on business impact
- **Sentiment analysis** for customer satisfaction
- **Urgency assessment** for time-sensitivity
- **Auto-labeling** with structured tags

### Analytics Dashboard

- **Visual charts** showing triage distributions
- **Recent activity** with confidence scores
- **Summary metrics** for quick insights
- **Export capabilities** for reporting

### Configuration Options

- **Granular control** over auto-actions
- **Confidence thresholds** for different features
- **Project and issue type filters**
- **Custom field mapping** for metadata storage

## Security Notes

- OpenAI API keys are stored securely in Forge storage
- No issue data is permanently stored by the app
- All API calls are made server-side
- Audit logs available through Forge platform
