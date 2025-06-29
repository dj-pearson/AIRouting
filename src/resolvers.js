import Resolver from "@forge/resolver";
import { ConfigurationManager } from "./configuration-manager.js";
import api, { route } from "@forge/api";
import { AIRoutingEngine } from "./ai-routing-engine.js";
import { Logger } from "./utils/logger.js";

const resolver = new Resolver();
const logger = new Logger("Resolvers");

/**
 * Resolver for AI Suggestions Panel
 * Provides real-time suggestions for issues
 */
resolver.define("aiSuggestionsResolver", async (req) => {
  try {
    const { payload, context } = req;
    logger.info("AI Suggestions resolver called", {
      issueKey: context?.extension?.issue?.key,
    });

    // Get issue context
    const issueKey = context?.extension?.issue?.key;
    if (!issueKey) {
      return { error: "No issue context available" };
    }

    // Get app configuration
    const config = await ConfigurationManager.getConfiguration();
    if (!config.enabled) {
      return {
        enabled: false,
        message: "AI routing is currently disabled",
      };
    }

    // Get enhanced issue data
    const issueData = await getIssueData(issueKey);

    // Check if this issue needs suggestions
    if (issueData.fields.assignee && !config.allowReassignment) {
      return {
        enabled: true,
        hasAssignee: true,
        assignee: issueData.fields.assignee.displayName,
        message: "Issue is already assigned",
      };
    }

    // Generate AI suggestions
    const aiEngine = new AIRoutingEngine(config);
    const suggestions = await aiEngine.generateSuggestions(issueData);

    // Get recent activity for this issue
    const recentActivity = await getRecentActivity(issueKey);

    return {
      enabled: true,
      issueKey,
      suggestions,
      config: {
        autoAssign: config.autoAssign,
        autoSetPriority: config.autoSetPriority,
        selectedModel: config.selectedModel,
      },
      recentActivity,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Error in AI suggestions resolver", {
      error: error.message,
      stack: error.stack,
    });

    return {
      error: "Failed to generate suggestions",
      details: error.message,
    };
  }
});

/**
 * Resolver for applying AI suggestions
 */
resolver.define("applySuggestion", async (req) => {
  try {
    const { payload } = req;
    const { issueKey, suggestionType, suggestion } = payload;

    logger.info("Applying AI suggestion", {
      issueKey,
      suggestionType,
      suggestion: suggestion.accountId || suggestion.name,
    });

    if (suggestionType === "assignee") {
      await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            assignee: { accountId: suggestion.accountId },
          },
        }),
      });

      // Log user action
      await logUserAction(issueKey, "apply_assignee_suggestion", suggestion);
    } else if (suggestionType === "priority") {
      await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            priority: { id: suggestion.id },
          },
        }),
      });

      // Log user action
      await logUserAction(issueKey, "apply_priority_suggestion", suggestion);
    }

    return {
      success: true,
      appliedSuggestion: suggestion,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Error applying suggestion", {
      error: error.message,
      payload: req.payload,
    });

    return {
      success: false,
      error: error.message,
    };
  }
});

/**
 * Resolver for providing feedback on suggestions
 */
resolver.define("provideFeedback", async (req) => {
  try {
    const { payload } = req;
    const { issueKey, suggestionType, feedback, suggestion } = payload;

    logger.info("Recording suggestion feedback", {
      issueKey,
      suggestionType,
      feedback,
    });

    // Store feedback for learning
    const feedbackData = {
      issueKey,
      suggestionType,
      suggestion,
      feedback, // 'positive', 'negative', 'neutral'
      timestamp: new Date().toISOString(),
      userId: req.context?.accountId,
    };

    await api
      .asApp()
      .storage.set(
        `feedback:${issueKey}:${suggestionType}:${Date.now()}`,
        feedbackData
      );

    // Log user action
    await logUserAction(issueKey, "provide_feedback", {
      suggestionType,
      feedback,
    });

    return {
      success: true,
      message: "Thank you for your feedback!",
    };
  } catch (error) {
    logger.error("Error recording feedback", {
      error: error.message,
      payload: req.payload,
    });

    return {
      success: false,
      error: error.message,
    };
  }
});

/**
 * Resolver for admin configuration
 */
resolver.define("getConfiguration", async (req) => {
  try {
    logger.info("Getting configuration for admin");

    const config = await ConfigurationManager.getConfiguration();
    const summary = await ConfigurationManager.getConfigurationSummary();

    // Get recent analytics
    const analytics = await getAnalytics();

    return {
      configuration: config,
      summary,
      analytics,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Error getting configuration", { error: error.message });

    return {
      error: "Failed to load configuration",
      details: error.message,
    };
  }
});

/**
 * Resolver for updating configuration
 */
resolver.define("updateConfiguration", async (req) => {
  try {
    const { payload } = req;
    logger.info("Updating configuration", { updates: payload });

    const updatedConfig = await ConfigurationManager.updateConfiguration(
      payload
    );

    return {
      success: true,
      configuration: updatedConfig,
      message: "Configuration updated successfully",
    };
  } catch (error) {
    logger.error("Error updating configuration", {
      error: error.message,
      payload: req.payload,
    });

    return {
      success: false,
      error: error.message,
    };
  }
});

/**
 * Helper function to get issue data
 */
async function getIssueData(issueKey) {
  const response = await api
    .asApp()
    .requestJira(route`/rest/api/3/issue/${issueKey}?expand=changelog`);
  return await response.json();
}

/**
 * Helper function to get recent activity
 */
async function getRecentActivity(issueKey) {
  try {
    // Get recent activities from storage
    const activities = [];
    const storageKeys = await api
      .asApp()
      .storage.query()
      .where("key", "startsWith", `activity:${issueKey}`)
      .limit(10)
      .getMany();

    for (const { value } of storageKeys.results) {
      activities.push(value);
    }

    return activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    logger.error("Error getting recent activity", {
      error: error.message,
      issueKey,
    });
    return [];
  }
}

/**
 * Helper function to log user actions
 */
async function logUserAction(issueKey, action, data) {
  try {
    const actionData = {
      issueKey,
      action,
      data,
      timestamp: new Date().toISOString(),
    };

    await api
      .asApp()
      .storage.set(
        `user_action:${issueKey}:${action}:${Date.now()}`,
        actionData
      );
  } catch (error) {
    logger.error("Error logging user action", { error: error.message });
  }
}

/**
 * Helper function to get analytics data
 */
async function getAnalytics() {
  try {
    // Get recent analytics from storage
    const analytics = {
      totalSuggestions: 0,
      acceptedSuggestions: 0,
      recentActivity: [],
      modelUsage: {},
    };

    // Query recent activities
    const activities = await api
      .asApp()
      .storage.query()
      .where("key", "startsWith", "activity:")
      .limit(100)
      .getMany();

    analytics.totalSuggestions = activities.results.length;

    // Query user actions for accepted suggestions
    const userActions = await api
      .asApp()
      .storage.query()
      .where("key", "startsWith", "user_action:")
      .limit(100)
      .getMany();

    const acceptedActions = userActions.results.filter(
      ({ value }) =>
        value.action.includes("apply_") && value.action.includes("suggestion")
    );

    analytics.acceptedSuggestions = acceptedActions.length;
    analytics.acceptanceRate =
      analytics.totalSuggestions > 0
        ? (
            (analytics.acceptedSuggestions / analytics.totalSuggestions) *
            100
          ).toFixed(1)
        : 0;

    return analytics;
  } catch (error) {
    logger.error("Error getting analytics", { error: error.message });
    return { error: "Failed to load analytics" };
  }
}

/**
 * Simple resolver for admin page - gets configuration
 */
resolver.define("getConfig", async (req) => {
  try {
    logger.info("Getting simple config for admin UI");

    const config = await ConfigurationManager.getConfiguration();

    return {
      selectedModel: config.selectedModel || "gpt-4",
      autoAssign: config.autoAssign !== false,
      autoPriority: config.autoSetPriority !== false,
      enableSuggestions: config.enabled !== false,
      confidenceThreshold: config.confidenceThreshold || 0.8,
    };
  } catch (error) {
    logger.error("Error getting simple config", { error: error.message });

    // Return defaults if config load fails
    return {
      selectedModel: "gpt-4",
      autoAssign: true,
      autoPriority: true,
      enableSuggestions: true,
      confidenceThreshold: 0.8,
    };
  }
});

/**
 * Simple resolver for admin page - saves configuration
 */
resolver.define("saveConfig", async (req) => {
  try {
    const { payload } = req;
    logger.info("Saving simple config from admin UI", { config: payload });

    // Map UI config to internal config format
    const configUpdate = {
      selectedModel: payload.selectedModel,
      autoAssign: payload.autoAssign,
      autoSetPriority: payload.autoPriority,
      enabled: payload.enableSuggestions,
      confidenceThreshold: payload.confidenceThreshold,
    };

    await ConfigurationManager.updateConfiguration(configUpdate);

    return {
      success: true,
      message: "Configuration saved successfully",
    };
  } catch (error) {
    logger.error("Error saving simple config", {
      error: error.message,
      payload: req.payload,
    });

    return {
      success: false,
      error: error.message,
    };
  }
});

/**
 * Resolver for getting triage analytics data
 */
resolver.define("getTriageAnalytics", async (req) => {
  try {
    logger.info("Getting triage analytics");

    // Get analytics counters from storage
    const counters = await api.asApp().storage.get("triage-analytics-counters");

    if (!counters) {
      return {
        totalTriaged: 0,
        byCategory: {},
        byPriority: {},
        bySentiment: {},
        byUrgency: {},
        lastUpdated: new Date().toISOString(),
      };
    }

    return counters;
  } catch (error) {
    logger.error("Error getting triage analytics", {
      error: error.message,
    });

    return {
      error: "Failed to load analytics data",
      details: error.message,
    };
  }
});

/**
 * Resolver for getting recent triage activity
 */
resolver.define("getRecentTriageActivity", async (req) => {
  try {
    logger.info("Getting recent triage activity");

    // Get all triage activity keys
    const storageQuery = await api
      .asApp()
      .storage.query()
      .where("key", "like", "triage-activity-%")
      .limit(50);

    const activities = [];

    // Get activity data for each key
    for (const result of storageQuery.results) {
      try {
        const activity = await api.asApp().storage.get(result.key);
        if (activity) {
          activities.push(activity);
        }
      } catch (error) {
        logger.warn("Error loading activity", { key: result.key });
      }
    }

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return activities.slice(0, 20); // Return only the 20 most recent
  } catch (error) {
    logger.error("Error getting recent triage activity", {
      error: error.message,
    });

    return [];
  }
});

/**
 * Resolver for getting triage statistics summary
 */
resolver.define("getTriageStatsSummary", async (req) => {
  try {
    const { payload } = req;
    const { timeframe = "7d" } = payload || {};

    logger.info("Getting triage stats summary", { timeframe });

    // Calculate date range
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeframe) {
      case "1d":
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case "7d":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        cutoffDate.setDate(now.getDate() - 30);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 7);
    }

    // Get recent activities within timeframe
    const storageQuery = await api
      .asApp()
      .storage.query()
      .where("key", "like", "triage-activity-%")
      .limit(1000);

    const activities = [];

    for (const result of storageQuery.results) {
      try {
        const activity = await api.asApp().storage.get(result.key);
        if (activity && new Date(activity.timestamp) >= cutoffDate) {
          activities.push(activity);
        }
      } catch (error) {
        logger.warn("Error loading activity for summary", { key: result.key });
      }
    }

    // Calculate statistics
    const stats = {
      totalTriaged: activities.length,
      averageConfidence: 0,
      escalationRiskCount: 0,
      criticalPriorityCount: 0,
      negativeSentimentCount: 0,
      immediateUrgencyCount: 0,
      topCategories: {},
      timeframe,
      generatedAt: new Date().toISOString(),
    };

    if (activities.length > 0) {
      // Calculate average confidence
      const confidenceSum = activities.reduce((sum, activity) => {
        return sum + (activity.triageResults?.confidence || 0);
      }, 0);
      stats.averageConfidence = (confidenceSum / activities.length).toFixed(2);

      // Count specific conditions
      activities.forEach((activity) => {
        const triage = activity.triageResults;
        if (triage) {
          if (triage.sentiment === "negative") stats.negativeSentimentCount++;
          if (triage.priority === "critical") stats.criticalPriorityCount++;
          if (triage.urgency === "immediate") stats.immediateUrgencyCount++;

          // Count categories
          const category = triage.category || "unknown";
          stats.topCategories[category] =
            (stats.topCategories[category] || 0) + 1;
        }
      });
    }

    return stats;
  } catch (error) {
    logger.error("Error getting triage stats summary", {
      error: error.message,
    });

    return {
      error: "Failed to generate statistics summary",
      details: error.message,
    };
  }
});

/**
 * Default resolver for basic template functionality
 */
resolver.define("getText", async (req) => {
  return "🤖 AI Task Routing is active and ready!";
});

export const aiSuggestionsResolver = resolver.getDefinitions();
export const adminResolver = resolver.getDefinitions();
