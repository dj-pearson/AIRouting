import OpenAI from "openai";
import api from "@forge/api";
import { Logger } from "./utils/logger.js";

/**
 * Ticket Triage Engine - AI-powered ticket categorization and prioritization
 * Provides intelligent analysis of issue content for automatic tagging and priority setting
 */
export class TicketTriageEngine {
  constructor(config) {
    this.config = config;
    this.logger = new Logger("TicketTriageEngine");
    this.openai = null;

    // Initialize model asynchronously
    this.initializeModel().catch((error) => {
      this.logger.error("Failed to initialize model in constructor", {
        error: error.message,
      });
    });
  }

  /**
   * Initialize the AI model for triage operations
   */
  async initializeModel() {
    const { selectedModel, modelConfigs } = this.config;

    try {
      switch (selectedModel) {
        case "openai-gpt4":
        case "openai-gpt3.5":
          if (modelConfigs.openai?.apiKey) {
            this.openai = new OpenAI({
              apiKey: modelConfigs.openai.apiKey,
            });
            this.logger.info("Initialized OpenAI client for triage", {
              model: selectedModel,
            });
          } else {
            throw new Error("OpenAI API key not configured");
          }
          break;

        default:
          throw new Error(`Unsupported model for triage: ${selectedModel}`);
      }
    } catch (error) {
      this.logger.error("Failed to initialize triage AI model", {
        error: error.message,
        model: selectedModel,
      });
      throw error;
    }
  }

  /**
   * Perform comprehensive ticket triage analysis
   */
  async performTriage(issueData) {
    try {
      this.logger.info("Starting ticket triage analysis", {
        issueKey: issueData.key,
      });

      // Prepare issue content for analysis
      const content = this.prepareIssueContent(issueData);

      // Perform parallel analysis for different aspects
      const [
        categorization,
        priorityAnalysis,
        sentimentAnalysis,
        urgencyAssessment,
        componentSuggestions,
      ] = await Promise.all([
        this.categorizeIssue(content),
        this.analyzePriority(content),
        this.analyzeSentiment(content),
        this.assessUrgency(content),
        this.suggestComponents(content, issueData),
      ]);

      // Combine all analyses into comprehensive triage result
      const triageResult = {
        issueKey: issueData.key,
        timestamp: new Date().toISOString(),
        categorization,
        priority: priorityAnalysis,
        sentiment: sentimentAnalysis,
        urgency: urgencyAssessment,
        components: componentSuggestions,
        confidence: this.calculateOverallConfidence([
          categorization,
          priorityAnalysis,
          sentimentAnalysis,
          urgencyAssessment,
        ]),
        recommendations: this.generateRecommendations({
          categorization,
          priorityAnalysis,
          sentimentAnalysis,
          urgencyAssessment,
        }),
      };

      this.logger.info("Completed ticket triage analysis", {
        issueKey: issueData.key,
        category: categorization.type,
        priority: priorityAnalysis.level,
        sentiment: sentimentAnalysis.tone,
        urgency: urgencyAssessment.level,
      });

      return triageResult;
    } catch (error) {
      this.logger.error("Error performing ticket triage", {
        error: error.message,
        issueKey: issueData.key,
      });

      // Return fallback triage result
      return this.generateFallbackTriage(issueData);
    }
  }

  /**
   * Prepare issue content for AI analysis
   */
  prepareIssueContent(issueData) {
    const issue = issueData.fields;

    return {
      summary: issue.summary || "",
      description: issue.description || "",
      issueType: issue.issuetype?.name || "",
      reporter: issue.reporter?.displayName || "",
      comments: issueData.comments || [],
      labels: issue.labels || [],
      environment: issue.environment || "",
      affectedVersions: issue.versions?.map((v) => v.name) || [],
      fixVersions: issue.fixVersions?.map((v) => v.name) || [],
      customFields: this.extractCustomFields(issue),
    };
  }

  /**
   * Categorize the issue type using AI
   */
  async categorizeIssue(content) {
    try {
      const prompt = this.buildCategorizationPrompt(content);

      const completion = await this.openai.chat.completions.create({
        model: this.getModelName(),
        messages: [
          {
            role: "system",
            content: `You are an expert at categorizing software development issues. 
            Analyze the provided issue and categorize it into one of these types:
            - bug: Software defects or errors
            - feature: New functionality requests
            - improvement: Enhancements to existing features
            - task: General work items or chores
            - support: Help requests or questions
            - security: Security-related issues
            - performance: Performance optimization issues
            - documentation: Documentation updates
            - technical-debt: Code quality or refactoring needs
            
            Provide your response as JSON with confidence score.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: "json_object" },
      });

      const response = JSON.parse(completion.choices[0].message.content);

      return {
        type: response.category || "task",
        subtype: response.subcategory || null,
        confidence: response.confidence || 0.5,
        reasoning: response.reasoning || "",
        suggestedLabels: response.suggested_labels || [],
      };
    } catch (error) {
      this.logger.error("Error categorizing issue", { error: error.message });
      return this.getFallbackCategorization(content);
    }
  }

  /**
   * Analyze issue priority using AI
   */
  async analyzePriority(content) {
    try {
      const prompt = this.buildPriorityPrompt(content);

      const completion = await this.openai.chat.completions.create({
        model: this.getModelName(),
        messages: [
          {
            role: "system",
            content: `You are an expert at prioritizing software development issues.
            Analyze the provided issue and determine its priority level:
            - critical: System down, data loss, security breach
            - high: Major functionality broken, affects many users
            - medium: Important but not blocking, affects some users
            - low: Minor issues, nice-to-have improvements
            
            Consider impact, urgency, and business value.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: "json_object" },
      });

      const response = JSON.parse(completion.choices[0].message.content);

      return {
        level: response.priority || "medium",
        score: response.score || 3, // 1-5 scale
        confidence: response.confidence || 0.5,
        reasoning: response.reasoning || "",
        impactAssessment: {
          usersAffected: response.users_affected || "unknown",
          businessImpact: response.business_impact || "medium",
          technicalComplexity: response.complexity || "medium",
        },
      };
    } catch (error) {
      this.logger.error("Error analyzing priority", { error: error.message });
      return this.getFallbackPriority();
    }
  }

  /**
   * Analyze sentiment and emotional tone
   */
  async analyzeSentiment(content) {
    try {
      const prompt = this.buildSentimentPrompt(content);

      const completion = await this.openai.chat.completions.create({
        model: this.getModelName(),
        messages: [
          {
            role: "system",
            content: `You are an expert at analyzing emotional tone and sentiment in support tickets.
            Analyze the text for:
            - Overall sentiment (positive, neutral, negative)
            - Urgency level (low, medium, high, critical)
            - Emotional indicators (frustrated, angry, confused, satisfied, etc.)
            - Customer escalation risk
            
            Pay special attention to language that indicates customer frustration or urgency.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: "json_object" },
      });

      const response = JSON.parse(completion.choices[0].message.content);

      return {
        tone: response.sentiment || "neutral",
        score: response.sentiment_score || 0, // -1 to 1 scale
        confidence: response.confidence || 0.5,
        emotions: response.emotions || [],
        escalationRisk: response.escalation_risk || "low",
        urgencyIndicators: response.urgency_indicators || [],
        languageFlags: {
          hasAngryLanguage: response.angry_language || false,
          hasUrgentLanguage: response.urgent_language || false,
          hasComplimentaryLanguage: response.complimentary_language || false,
          hasConfusedLanguage: response.confused_language || false,
        },
      };
    } catch (error) {
      this.logger.error("Error analyzing sentiment", { error: error.message });
      return this.getFallbackSentiment();
    }
  }

  /**
   * Assess urgency based on content and context
   */
  async assessUrgency(content) {
    try {
      const prompt = this.buildUrgencyPrompt(content);

      const completion = await this.openai.chat.completions.create({
        model: this.getModelName(),
        messages: [
          {
            role: "system",
            content: `You are an expert at assessing urgency in software issues.
            Determine urgency level based on:
            - Time-sensitivity keywords (ASAP, urgent, critical, blocking)
            - Impact on operations (production down, can't work, losing money)
            - SLA implications
            - Customer-facing vs internal issues
            
            Levels: immediate, high, medium, low`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 300,
        response_format: { type: "json_object" },
      });

      const response = JSON.parse(completion.choices[0].message.content);

      return {
        level: response.urgency || "medium",
        score: response.urgency_score || 3, // 1-5 scale
        confidence: response.confidence || 0.5,
        reasoning: response.reasoning || "",
        timeframe: response.expected_timeframe || "",
        businessJustification: response.business_justification || "",
        keywords: response.urgency_keywords || [],
      };
    } catch (error) {
      this.logger.error("Error assessing urgency", { error: error.message });
      return this.getFallbackUrgency();
    }
  }

  /**
   * Suggest components and labels based on content
   */
  async suggestComponents(content, issueData) {
    try {
      // Get existing project components
      const projectComponents = await this.getProjectComponents(
        issueData.fields.project.key
      );

      const prompt = this.buildComponentPrompt(content, projectComponents);

      const completion = await this.openai.chat.completions.create({
        model: this.getModelName(),
        messages: [
          {
            role: "system",
            content: `You are an expert at categorizing software issues into appropriate components.
            Based on the issue content and available project components, suggest the most relevant ones.
            Also suggest additional labels that would be helpful for organization and filtering.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 400,
        response_format: { type: "json_object" },
      });

      const response = JSON.parse(completion.choices[0].message.content);

      return {
        suggestedComponents: response.components || [],
        suggestedLabels: response.labels || [],
        confidence: response.confidence || 0.5,
        reasoning: response.reasoning || "",
      };
    } catch (error) {
      this.logger.error("Error suggesting components", {
        error: error.message,
      });
      return { suggestedComponents: [], suggestedLabels: [], confidence: 0.3 };
    }
  }

  /**
   * Build categorization prompt
   */
  buildCategorizationPrompt(content) {
    return `
Analyze this issue for categorization:

**Summary:** ${content.summary}
**Description:** ${content.description.substring(0, 1000)}
**Issue Type:** ${content.issueType}
**Existing Labels:** ${content.labels.join(", ") || "None"}

Please categorize this issue and provide your response in JSON format:
{
  "category": "bug|feature|improvement|task|support|security|performance|documentation|technical-debt",
  "subcategory": "more specific category if applicable",
  "confidence": 0.0-1.0,
  "reasoning": "explanation of categorization",
  "suggested_labels": ["label1", "label2"]
}
`;
  }

  /**
   * Build priority analysis prompt
   */
  buildPriorityPrompt(content) {
    return `
Analyze this issue for priority:

**Summary:** ${content.summary}
**Description:** ${content.description.substring(0, 1000)}
**Reporter:** ${content.reporter}
**Environment:** ${content.environment || "Not specified"}
**Affected Versions:** ${content.affectedVersions.join(", ") || "None"}

Consider impact, urgency, and business value. Respond in JSON:
{
  "priority": "critical|high|medium|low",
  "score": 1-5,
  "confidence": 0.0-1.0,
  "reasoning": "explanation",
  "users_affected": "estimate of affected users",
  "business_impact": "assessment of business impact",
  "complexity": "estimated technical complexity"
}
`;
  }

  /**
   * Build sentiment analysis prompt
   */
  buildSentimentPrompt(content) {
    return `
Analyze the emotional tone and sentiment in this issue:

**Summary:** ${content.summary}
**Description:** ${content.description.substring(0, 1500)}
**Comments:** ${content.comments
      .slice(0, 3)
      .map((c) => c.body)
      .join("\n---\n")}

Look for emotional indicators, urgency language, and escalation risk. Respond in JSON:
{
  "sentiment": "positive|neutral|negative",
  "sentiment_score": -1.0 to 1.0,
  "confidence": 0.0-1.0,
  "emotions": ["frustrated", "angry", "confused", "satisfied"],
  "escalation_risk": "low|medium|high|critical",
  "urgency_indicators": ["keywords or phrases indicating urgency"],
  "angry_language": boolean,
  "urgent_language": boolean,
  "complimentary_language": boolean,
  "confused_language": boolean
}
`;
  }

  /**
   * Build urgency assessment prompt
   */
  buildUrgencyPrompt(content) {
    return `
Assess the urgency of this issue:

**Summary:** ${content.summary}
**Description:** ${content.description.substring(0, 1000)}
**Issue Type:** ${content.issueType}

Look for time-sensitive keywords, operational impact, and SLA implications. Respond in JSON:
{
  "urgency": "immediate|high|medium|low",
  "urgency_score": 1-5,
  "confidence": 0.0-1.0,
  "reasoning": "explanation",
  "expected_timeframe": "when this should be addressed",
  "business_justification": "business reason for urgency",
  "urgency_keywords": ["keywords indicating urgency"]
}
`;
  }

  /**
   * Build component suggestion prompt
   */
  buildComponentPrompt(content, projectComponents) {
    return `
Suggest components and labels for this issue:

**Summary:** ${content.summary}
**Description:** ${content.description.substring(0, 1000)}
**Issue Type:** ${content.issueType}
**Existing Labels:** ${content.labels.join(", ") || "None"}

**Available Project Components:**
${projectComponents
  .map((c) => `- ${c.name}: ${c.description || "No description"}`)
  .join("\n")}

Suggest the most relevant components and additional helpful labels. Respond in JSON:
{
  "components": ["component1", "component2"],
  "labels": ["label1", "label2", "label3"],
  "confidence": 0.0-1.0,
  "reasoning": "explanation of suggestions"
}
`;
  }

  /**
   * Calculate overall confidence score
   */
  calculateOverallConfidence(analyses) {
    const confidenceScores = analyses
      .map((analysis) => analysis.confidence)
      .filter((score) => typeof score === "number");

    if (confidenceScores.length === 0) return 0.5;

    return (
      confidenceScores.reduce((sum, score) => sum + score, 0) /
      confidenceScores.length
    );
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations({
    categorization,
    priorityAnalysis,
    sentimentAnalysis,
    urgencyAssessment,
  }) {
    const recommendations = [];

    // Priority-based recommendations
    if (
      priorityAnalysis.level === "critical" ||
      urgencyAssessment.level === "immediate"
    ) {
      recommendations.push({
        type: "escalation",
        message:
          "🚨 This issue requires immediate attention - consider escalating to senior team members",
        action: "escalate",
      });
    }

    // Sentiment-based recommendations
    if (
      sentimentAnalysis.escalationRisk === "high" ||
      sentimentAnalysis.languageFlags.hasAngryLanguage
    ) {
      recommendations.push({
        type: "customer_care",
        message:
          "⚠️ Customer appears frustrated - prioritize communication and updates",
        action: "prioritize_communication",
      });
    }

    // Category-based recommendations
    if (categorization.type === "security") {
      recommendations.push({
        type: "security",
        message:
          "🔒 Security issue detected - follow security incident response procedures",
        action: "security_protocol",
      });
    }

    if (
      categorization.type === "bug" &&
      priorityAnalysis.level === "critical"
    ) {
      recommendations.push({
        type: "hotfix",
        message: "🔥 Critical bug - consider hotfix deployment path",
        action: "hotfix_process",
      });
    }

    return recommendations;
  }

  /**
   * Get project components
   */
  async getProjectComponents(projectKey) {
    try {
      const response = await api
        .asApp()
        .requestJira(`/rest/api/3/project/${projectKey}/components`);
      return await response.json();
    } catch (error) {
      this.logger.error("Error fetching project components", {
        error: error.message,
      });
      return [];
    }
  }

  /**
   * Extract custom fields from issue
   */
  extractCustomFields(issue) {
    const customFields = {};

    Object.keys(issue).forEach((key) => {
      if (key.startsWith("customfield_")) {
        customFields[key] = issue[key];
      }
    });

    return customFields;
  }

  /**
   * Get model name for API calls
   */
  getModelName() {
    return this.config.selectedModel === "openai-gpt4"
      ? "gpt-4"
      : "gpt-3.5-turbo";
  }

  /**
   * Fallback categorization when AI fails
   */
  getFallbackCategorization(content) {
    let type = "task";

    const summary = content.summary.toLowerCase();
    const description = content.description.toLowerCase();

    if (
      summary.includes("bug") ||
      summary.includes("error") ||
      summary.includes("issue")
    ) {
      type = "bug";
    } else if (summary.includes("feature") || summary.includes("enhancement")) {
      type = "feature";
    } else if (summary.includes("support") || summary.includes("help")) {
      type = "support";
    }

    return {
      type,
      subtype: null,
      confidence: 0.3,
      reasoning: "Fallback categorization based on keyword analysis",
      suggestedLabels: [],
    };
  }

  /**
   * Fallback priority analysis
   */
  getFallbackPriority() {
    return {
      level: "medium",
      score: 3,
      confidence: 0.3,
      reasoning: "Default medium priority assigned due to analysis failure",
      impactAssessment: {
        usersAffected: "unknown",
        businessImpact: "medium",
        technicalComplexity: "medium",
      },
    };
  }

  /**
   * Fallback sentiment analysis
   */
  getFallbackSentiment() {
    return {
      tone: "neutral",
      score: 0,
      confidence: 0.3,
      emotions: [],
      escalationRisk: "low",
      urgencyIndicators: [],
      languageFlags: {
        hasAngryLanguage: false,
        hasUrgentLanguage: false,
        hasComplimentaryLanguage: false,
        hasConfusedLanguage: false,
      },
    };
  }

  /**
   * Fallback urgency assessment
   */
  getFallbackUrgency() {
    return {
      level: "medium",
      score: 3,
      confidence: 0.3,
      reasoning: "Default medium urgency assigned due to analysis failure",
      timeframe: "",
      businessJustification: "",
      keywords: [],
    };
  }

  /**
   * Generate fallback triage result
   */
  generateFallbackTriage(issueData) {
    return {
      issueKey: issueData.key,
      timestamp: new Date().toISOString(),
      categorization: this.getFallbackCategorization({
        summary: issueData.fields.summary || "",
        description: issueData.fields.description || "",
      }),
      priority: this.getFallbackPriority(),
      sentiment: this.getFallbackSentiment(),
      urgency: this.getFallbackUrgency(),
      components: {
        suggestedComponents: [],
        suggestedLabels: [],
        confidence: 0.3,
      },
      confidence: 0.3,
      recommendations: [],
    };
  }
}
