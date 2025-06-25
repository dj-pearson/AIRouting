import api, { route } from "@forge/api";
import { AIRoutingEngine } from "./ai-routing-engine.js";
import { TicketTriageEngine } from "./ticket-triage-engine.js";
import { AutoTaggingManager } from "./auto-tagging-manager.js";
import { ConfigurationManager } from "./configuration-manager.js";
import { Logger } from "./utils/logger.js";

/**
 * Main event handler for issue creation and updates
 * Triggers intelligent routing when issues are created or become unassigned
 */
export async function issueEventHandler(event, context) {
  const logger = new Logger("IssueEventHandler");

  try {
    logger.info("Processing issue event", {
      eventType: event.eventType,
      issueKey: event.issue?.key,
    });

    // Get app configuration
    const config = await ConfigurationManager.getConfiguration();
    if (!config.enabled) {
      logger.info("AI routing is disabled, skipping event");
      return;
    }

    // Only process issues that need routing
    if (!shouldProcessIssue(event, config)) {
      logger.info("Issue does not need processing", {
        issueKey: event.issue?.key,
      });
      return;
    }

    // Initialize AI engines
    const aiEngine = new AIRoutingEngine(config);
    const triageEngine = config.enableTriage
      ? new TicketTriageEngine(config)
      : null;
    const autoTaggingManager = new AutoTaggingManager(config);

    // Get enhanced issue data
    const issueData = await getEnhancedIssueData(event.issue.key);

    // Perform triage analysis if enabled
    let triageResult = null;
    if (triageEngine) {
      triageResult = await triageEngine.performTriage(issueData);

      // Apply triage suggestions
      await autoTaggingManager.applyTriageSuggestions(
        event.issue.key,
        triageResult
      );
    }

    // Generate AI routing suggestions
    const suggestions = await aiEngine.generateSuggestions(
      issueData,
      triageResult
    );

    // Apply routing suggestions based on configuration
    await applySuggestions(event.issue.key, suggestions, config);

    // Log activity for analytics
    await logRoutingActivity(
      event.issue.key,
      suggestions,
      config,
      triageResult
    );

    logger.info("Successfully processed issue", {
      issueKey: event.issue.key,
      suggestions: suggestions,
    });
  } catch (error) {
    logger.error("Error processing issue event", {
      error: error.message,
      stack: error.stack,
    });

    // Don't throw - we don't want to break Jira workflows
    // Instead, log the error and continue
  }
}

/**
 * Determines if an issue should be processed by AI routing
 */
function shouldProcessIssue(event, config) {
  const issue = event.issue;

  // Skip if issue already has assignee (unless re-routing is enabled)
  if (issue.fields.assignee && !config.allowReassignment) {
    return false;
  }

  // Check if issue matches configured filters
  if (config.projectFilter && config.projectFilter.length > 0) {
    if (!config.projectFilter.includes(issue.fields.project.key)) {
      return false;
    }
  }

  // Check issue type filters
  if (config.issueTypeFilter && config.issueTypeFilter.length > 0) {
    if (!config.issueTypeFilter.includes(issue.fields.issuetype.name)) {
      return false;
    }
  }

  // Skip issues created by the app itself (prevent loops)
  if (issue.fields.creator?.accountId === context.cloudId) {
    return false;
  }

  return true;
}

/**
 * Gets enhanced issue data including project context and team information
 */
async function getEnhancedIssueData(issueKey) {
  try {
    // Get full issue details
    const response = await api
      .asApp()
      .requestJira(
        route`/rest/api/3/issue/${issueKey}?expand=changelog,renderedFields`
      );
    const issue = await response.json();

    // Get project assignable users
    const usersResponse = await api
      .asApp()
      .requestJira(
        route`/rest/api/3/user/assignable/search?project=${issue.fields.project.key}&maxResults=100`
      );
    const assignableUsers = await usersResponse.json();

    // Get recent similar issues for context
    const similarIssues = await findSimilarIssues(issue);

    return {
      ...issue,
      assignableUsers,
      similarIssues,
      enhancedAt: new Date().toISOString(),
    };
  } catch (error) {
    Logger.error("Error getting enhanced issue data", {
      error: error.message,
      issueKey,
    });
    throw error;
  }
}

/**
 * Finds similar issues for AI context
 */
async function findSimilarIssues(issue) {
  try {
    // Build JQL query to find similar issues
    const jqlFilters = [];

    // Same project
    jqlFilters.push(`project = "${issue.fields.project.key}"`);

    // Same issue type or component
    if (issue.fields.components?.length > 0) {
      const components = issue.fields.components
        .map((c) => `"${c.name}"`)
        .join(", ");
      jqlFilters.push(`component in (${components})`);
    } else {
      jqlFilters.push(`issuetype = "${issue.fields.issuetype.name}"`);
    }

    // Recently resolved
    jqlFilters.push("status in (Done, Resolved, Closed)");
    jqlFilters.push("resolved >= -30d");

    const jql = jqlFilters.join(" AND ") + " ORDER BY resolved DESC";

    const response = await api
      .asApp()
      .requestJira(
        route`/rest/api/3/search?jql=${encodeURIComponent(
          jql
        )}&maxResults=10&fields=assignee,components,resolution,resolutiondate`
      );

    const result = await response.json();
    return result.issues || [];
  } catch (error) {
    Logger.error("Error finding similar issues", { error: error.message });
    return [];
  }
}

/**
 * Applies AI suggestions based on configuration
 */
async function applySuggestions(issueKey, suggestions, config) {
  try {
    const updates = {};
    const comments = [];

    // Handle assignee suggestion
    if (suggestions.assignee) {
      if (config.autoAssign) {
        updates.assignee = { accountId: suggestions.assignee.accountId };
        comments.push(
          `🤖 *AI Auto-Assignment*: Assigned to ${suggestions.assignee.displayName} ` +
            `(${Math.round(
              suggestions.assignee.confidence * 100
            )}% confidence)\n` +
            `_Reason: ${suggestions.assignee.reason}_`
        );
      } else {
        comments.push(
          `🤖 *AI Suggestion*: Consider assigning to ${suggestions.assignee.displayName} ` +
            `(${Math.round(
              suggestions.assignee.confidence * 100
            )}% confidence)\n` +
            `_Reason: ${suggestions.assignee.reason}_\n` +
            `Click [here|${getAssignIssueUrl(
              issueKey,
              suggestions.assignee.accountId
            )}] to assign.`
        );
      }
    }

    // Handle priority suggestion
    if (suggestions.priority) {
      if (config.autoSetPriority) {
        updates.priority = { id: suggestions.priority.id };
        comments.push(
          `🤖 *AI Priority*: Set to ${suggestions.priority.name} ` +
            `(${Math.round(
              suggestions.priority.confidence * 100
            )}% confidence)\n` +
            `_Reason: ${suggestions.priority.reason}_`
        );
      } else {
        comments.push(
          `🤖 *AI Priority Suggestion*: Consider setting priority to ${suggestions.priority.name} ` +
            `(${Math.round(
              suggestions.priority.confidence * 100
            )}% confidence)\n` +
            `_Reason: ${suggestions.priority.reason}_`
        );
      }
    }

    // Apply field updates
    if (Object.keys(updates).length > 0) {
      await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: updates }),
      });
    }

    // Add comments
    for (const comment of comments) {
      await api
        .asApp()
        .requestJira(route`/rest/api/3/issue/${issueKey}/comment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: {
              type: "doc",
              version: 1,
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: comment }],
                },
              ],
            },
          }),
        });
    }
  } catch (error) {
    Logger.error("Error applying suggestions", {
      error: error.message,
      issueKey,
    });
    throw error;
  }
}

/**
 * Logs routing activity for analytics and learning
 */
async function logRoutingActivity(
  issueKey,
  suggestions,
  config,
  triageResult = null
) {
  try {
    const activity = {
      issueKey,
      timestamp: new Date().toISOString(),
      suggestions,
      config: {
        model: config.selectedModel,
        autoAssign: config.autoAssign,
        autoSetPriority: config.autoSetPriority,
        enableTriage: config.enableTriage,
      },
      triage: triageResult
        ? {
            category: triageResult.categorization.type,
            priority: triageResult.priority.level,
            urgency: triageResult.urgency.level,
            sentiment: {
              tone: triageResult.sentiment.tone,
              escalationRisk: triageResult.sentiment.escalationRisk,
            },
            confidence: triageResult.confidence,
            recommendationsCount: triageResult.recommendations.length,
          }
        : null,
    };

    // Store in Forge storage for analytics
    await api
      .asApp()
      .storage.set(`activity:${issueKey}:${Date.now()}`, activity);
  } catch (error) {
    Logger.error("Error logging activity", { error: error.message, issueKey });
    // Don't throw - logging failures shouldn't break the flow
  }
}

/**
 * Helper to generate assign issue URL
 */
function getAssignIssueUrl(issueKey, accountId) {
  return `/rest/api/3/issue/${issueKey}/assignee`;
}
