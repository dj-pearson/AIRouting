import OpenAI from "openai";
import { Logger } from "./utils/logger.js";

/**
 * AI Routing Engine - Core AI integration for intelligent task routing
 * Supports multiple AI models with a unified interface
 */
export class AIRoutingEngine {
  constructor(config) {
    this.config = config;
    this.logger = new Logger("AIRoutingEngine");
    this.openai = null;

    this.initializeModel();
  }

  /**
   * Initialize the selected AI model
   */
  initializeModel() {
    const { selectedModel, modelConfigs } = this.config;

    try {
      switch (selectedModel) {
        case "openai-gpt4":
        case "openai-gpt3.5":
          if (modelConfigs.openai?.apiKey) {
            this.openai = new OpenAI({
              apiKey: modelConfigs.openai.apiKey,
            });
            this.logger.info("Initialized OpenAI client", {
              model: selectedModel,
            });
          } else {
            throw new Error("OpenAI API key not configured");
          }
          break;

        case "anthropic-claude":
          // TODO: Implement Anthropic Claude integration
          throw new Error("Anthropic Claude integration not yet implemented");

        case "google-gemini":
          // TODO: Implement Google Gemini integration
          throw new Error("Google Gemini integration not yet implemented");

        default:
          throw new Error(`Unsupported model: ${selectedModel}`);
      }
    } catch (error) {
      this.logger.error("Failed to initialize AI model", {
        error: error.message,
        model: selectedModel,
      });
      throw error;
    }
  }

  /**
   * Generate AI suggestions for issue assignment and priority
   */
  async generateSuggestions(issueData, triageResult = null) {
    try {
      this.logger.info("Generating AI suggestions", {
        issueKey: issueData.key,
      });

      // Prepare context for AI analysis
      const context = this.prepareIssueContext(issueData, triageResult);

      // Generate suggestions based on selected model
      let suggestions = {};

      switch (this.config.selectedModel) {
        case "openai-gpt4":
        case "openai-gpt3.5":
          suggestions = await this.generateOpenAISuggestions(context);
          break;

        default:
          throw new Error(`Model ${this.config.selectedModel} not implemented`);
      }

      // Validate and enhance suggestions
      suggestions = await this.validateSuggestions(suggestions, issueData);

      this.logger.info("Generated AI suggestions", {
        issueKey: issueData.key,
        suggestions,
      });

      return suggestions;
    } catch (error) {
      this.logger.error("Error generating suggestions", {
        error: error.message,
        issueKey: issueData.key,
      });

      // Return fallback suggestions instead of throwing
      return this.generateFallbackSuggestions(issueData);
    }
  }

  /**
   * Prepare issue context for AI analysis
   */
  prepareIssueContext(issueData, triageResult = null) {
    const context = {
      issue: {
        key: issueData.key,
        summary: issueData.fields.summary,
        description: issueData.fields.description || "",
        issueType: issueData.fields.issuetype.name,
        priority: issueData.fields.priority?.name || "None",
        components: issueData.fields.components?.map((c) => c.name) || [],
        labels: issueData.fields.labels || [],
        project: {
          key: issueData.fields.project.key,
          name: issueData.fields.project.name,
        },
      },
      team: {
        assignableUsers: issueData.assignableUsers.map((user) => ({
          accountId: user.accountId,
          displayName: user.displayName,
          emailAddress: user.emailAddress,
        })),
      },
      history: {
        similarIssues: issueData.similarIssues.map((issue) => ({
          key: issue.key,
          assignee: issue.fields.assignee?.displayName || "Unassigned",
          components: issue.fields.components?.map((c) => c.name) || [],
          resolution: issue.fields.resolution?.name || "Unresolved",
          resolutionDate: issue.fields.resolutiondate,
        })),
      },
      triage: triageResult
        ? {
            category: triageResult.categorization.type,
            priority: triageResult.priority.level,
            urgency: triageResult.urgency.level,
            sentiment: {
              tone: triageResult.sentiment.tone,
              escalationRisk: triageResult.sentiment.escalationRisk,
              hasAngryLanguage:
                triageResult.sentiment.languageFlags.hasAngryLanguage,
              hasUrgentLanguage:
                triageResult.sentiment.languageFlags.hasUrgentLanguage,
            },
            recommendations: triageResult.recommendations,
            confidence: triageResult.confidence,
          }
        : null,
    };

    return context;
  }

  /**
   * Generate suggestions using OpenAI models
   */
  async generateOpenAISuggestions(context) {
    try {
      const prompt = this.buildOpenAIPrompt(context);
      const model =
        this.config.selectedModel === "openai-gpt4" ? "gpt-4" : "gpt-3.5-turbo";

      const completion = await this.openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert project management AI assistant specializing in intelligent task routing and prioritization for software development teams. Analyze the provided issue data and suggest the best assignee and priority level with clear reasoning.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      const response = completion.choices[0].message.content;
      const suggestions = JSON.parse(response);

      return this.transformOpenAIResponse(suggestions, context);
    } catch (error) {
      this.logger.error("OpenAI API error", { error: error.message });
      throw error;
    }
  }

  /**
   * Build prompt for OpenAI analysis
   */
  buildOpenAIPrompt(context) {
    const { issue, team, history, triage } = context;

    return `
Analyze this Jira issue and provide intelligent routing suggestions:

**ISSUE DETAILS:**
- Key: ${issue.key}
- Summary: ${issue.summary}
- Description: ${issue.description.substring(0, 500)}${
      issue.description.length > 500 ? "..." : ""
    }
- Type: ${issue.issueType}
- Current Priority: ${issue.priority}
- Components: ${issue.components.join(", ") || "None"}
- Labels: ${issue.labels.join(", ") || "None"}
- Project: ${issue.project.name} (${issue.project.key})

${
  triage
    ? `**AI TRIAGE ANALYSIS:**
- Category: ${triage.category}
- AI Priority: ${triage.priority}
- Urgency: ${triage.urgency}
- Sentiment: ${triage.sentiment.tone} (Escalation Risk: ${
        triage.sentiment.escalationRisk
      })
- Language Flags: ${triage.sentiment.hasAngryLanguage ? "Angry" : ""} ${
        triage.sentiment.hasUrgentLanguage ? "Urgent" : ""
      }
- AI Confidence: ${Math.round(triage.confidence * 100)}%
- Recommendations: ${triage.recommendations.map((r) => r.message).join("; ")}

`
    : ""
}**TEAM MEMBERS:**
${team.assignableUsers
  .map((user, idx) => `${idx + 1}. ${user.displayName} (${user.accountId})`)
  .join("\n")}

**SIMILAR ISSUES HISTORY:**
${history.similarIssues
  .map(
    (similar, idx) =>
      `${idx + 1}. ${similar.key} - Assigned to: ${
        similar.assignee
      }, Components: ${similar.components.join(", ")}, Resolution: ${
        similar.resolution
      }`
  )
  .join("\n")}

Please respond with a JSON object containing:
{
  "assignee": {
    "accountId": "recommended user account ID",
    "displayName": "user display name",
    "confidence": 0.85,
    "reason": "detailed explanation of why this person is recommended"
  },
  "priority": {
    "name": "High|Medium|Low|Lowest|Highest",
    "confidence": 0.90,
    "reason": "detailed explanation of why this priority level is recommended"
  }
}

Consider these factors:
1. Component expertise based on similar issues
2. Issue complexity and urgency indicators
3. Workload distribution (if you have that data)  
4. Past assignment patterns
5. Issue type and description content analysis
${
  triage
    ? `6. AI Triage Analysis (especially priority, urgency, and sentiment)
7. Customer escalation risk and emotional tone
8. Specialized skills needed (e.g., security issues, performance problems)`
    : ""
}

${
  triage && triage.sentiment.escalationRisk === "high"
    ? "⚠️ IMPORTANT: This issue has HIGH escalation risk - consider assigning to senior team members who excel at customer communication."
    : ""
}
${
  triage && triage.sentiment.hasAngryLanguage
    ? "⚠️ IMPORTANT: Customer appears frustrated - prioritize team members with strong communication skills."
    : ""
}
${
  triage && triage.urgency === "immediate"
    ? "🚨 URGENT: This issue requires immediate attention - assign to available senior team member."
    : ""
}

Provide confidence scores between 0.0 and 1.0 and detailed reasoning.
`;
  }

  /**
   * Transform OpenAI response to standard format
   */
  transformOpenAIResponse(aiResponse, context) {
    const suggestions = {};

    // Process assignee suggestion
    if (aiResponse.assignee) {
      // Validate that the suggested user exists in assignable users
      const suggestedUser = context.team.assignableUsers.find(
        (user) => user.accountId === aiResponse.assignee.accountId
      );

      if (suggestedUser) {
        suggestions.assignee = {
          accountId: aiResponse.assignee.accountId,
          displayName: suggestedUser.displayName,
          confidence: Math.max(
            0,
            Math.min(1, aiResponse.assignee.confidence || 0.5)
          ),
          reason:
            aiResponse.assignee.reason ||
            "AI recommendation based on issue analysis",
        };
      }
    }

    // Process priority suggestion
    if (aiResponse.priority) {
      const validPriorities = ["Highest", "High", "Medium", "Low", "Lowest"];
      if (validPriorities.includes(aiResponse.priority.name)) {
        suggestions.priority = {
          name: aiResponse.priority.name,
          id: this.getPriorityId(aiResponse.priority.name),
          confidence: Math.max(
            0,
            Math.min(1, aiResponse.priority.confidence || 0.5)
          ),
          reason:
            aiResponse.priority.reason ||
            "AI recommendation based on issue analysis",
        };
      }
    }

    return suggestions;
  }

  /**
   * Map priority names to Jira priority IDs
   */
  getPriorityId(priorityName) {
    const priorityMap = {
      Highest: "1",
      High: "2",
      Medium: "3",
      Low: "4",
      Lowest: "5",
    };
    return priorityMap[priorityName] || "3"; // Default to Medium
  }

  /**
   * Validate AI suggestions against business rules
   */
  async validateSuggestions(suggestions, issueData) {
    // Ensure confidence thresholds are met
    const minConfidence = this.config.minConfidenceThreshold || 0.6;

    if (
      suggestions.assignee &&
      suggestions.assignee.confidence < minConfidence
    ) {
      this.logger.info("Assignee suggestion below confidence threshold", {
        confidence: suggestions.assignee.confidence,
        threshold: minConfidence,
      });
      delete suggestions.assignee;
    }

    if (
      suggestions.priority &&
      suggestions.priority.confidence < minConfidence
    ) {
      this.logger.info("Priority suggestion below confidence threshold", {
        confidence: suggestions.priority.confidence,
        threshold: minConfidence,
      });
      delete suggestions.priority;
    }

    return suggestions;
  }

  /**
   * Generate fallback suggestions when AI fails
   */
  generateFallbackSuggestions(issueData) {
    this.logger.info("Generating fallback suggestions", {
      issueKey: issueData.key,
    });

    const suggestions = {};

    // Simple fallback: assign to first available user from similar issues
    if (issueData.similarIssues.length > 0) {
      const recentAssignee = issueData.similarIssues[0].fields.assignee;
      if (recentAssignee) {
        // Check if this user is still assignable
        const isAssignable = issueData.assignableUsers.find(
          (user) => user.accountId === recentAssignee.accountId
        );

        if (isAssignable) {
          suggestions.assignee = {
            accountId: recentAssignee.accountId,
            displayName: recentAssignee.displayName,
            confidence: 0.5,
            reason: "Fallback: Recently handled similar issue",
          };
        }
      }
    }

    // Default priority based on issue type
    const issueType = issueData.fields.issuetype.name.toLowerCase();
    if (issueType.includes("bug") || issueType.includes("defect")) {
      suggestions.priority = {
        name: "High",
        id: "2",
        confidence: 0.6,
        reason: "Fallback: Bug issues typically have high priority",
      };
    } else if (issueType.includes("story") || issueType.includes("feature")) {
      suggestions.priority = {
        name: "Medium",
        id: "3",
        confidence: 0.6,
        reason: "Fallback: Feature requests typically have medium priority",
      };
    }

    return suggestions;
  }
}
