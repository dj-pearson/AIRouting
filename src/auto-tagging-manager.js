import api, { route } from "@forge/api";
import { Logger } from "./utils/logger.js";

/**
 * Auto-Tagging Manager - Applies AI triage suggestions to Jira issues
 * Handles automatic labeling, component assignment, and priority setting
 */
export class AutoTaggingManager {
  constructor(config) {
    this.config = config;
    this.logger = new Logger("AutoTaggingManager");
  }

  /**
   * Apply triage suggestions to a Jira issue
   */
  async applyTriageSuggestions(issueKey, triageResult) {
    try {
      this.logger.info("Applying triage suggestions", {
        issueKey,
        confidence: triageResult.confidence,
      });

      const updates = {};
      const notifications = [];

      // Apply suggestions based on configuration and confidence levels
      if (triageResult.confidence >= this.config.minConfidenceThreshold) {
        // Apply priority changes
        if (
          this.config.autoSetPriority &&
          triageResult.priority.confidence >= 0.7
        ) {
          const priorityUpdate = await this.applyPrioritySuggestion(
            issueKey,
            triageResult.priority
          );
          if (priorityUpdate) {
            updates.priority = priorityUpdate;
            notifications.push(
              `🎯 Priority set to ${triageResult.priority.level.toUpperCase()}`
            );
          }
        }

        // Apply component suggestions
        if (
          this.config.autoSetComponents &&
          triageResult.components.confidence >= 0.6
        ) {
          const componentUpdate = await this.applyComponentSuggestions(
            issueKey,
            triageResult.components
          );
          if (componentUpdate && componentUpdate.length > 0) {
            updates.components = componentUpdate;
            notifications.push(
              `🏷️ Added components: ${componentUpdate
                .map((c) => c.name)
                .join(", ")}`
            );
          }
        }

        // Apply label suggestions
        if (this.config.autoSetLabels) {
          const labelUpdate = await this.applyLabelSuggestions(
            issueKey,
            triageResult
          );
          if (labelUpdate && labelUpdate.length > 0) {
            updates.labels = labelUpdate;
            notifications.push(`🏷️ Added labels: ${labelUpdate.join(", ")}`);
          }
        }

        // Apply custom field updates for triage metadata
        const customFieldUpdates = await this.applyCustomFieldUpdates(
          issueKey,
          triageResult
        );
        if (customFieldUpdates) {
          Object.assign(updates, customFieldUpdates);
        }
      }

      // Apply updates to Jira
      if (Object.keys(updates).length > 0) {
        await this.updateJiraIssue(issueKey, updates);
        this.logger.info("Applied issue updates", { issueKey, updates });
      }

      // Add triage comment with AI insights
      await this.addTriageComment(issueKey, triageResult, notifications);

      // Log activity for analytics
      await this.logTriageActivity(issueKey, triageResult, updates);

      return {
        applied: Object.keys(updates).length > 0,
        updates,
        notifications,
      };
    } catch (error) {
      this.logger.error("Error applying triage suggestions", {
        error: error.message,
        issueKey,
      });
      throw error;
    }
  }

  /**
   * Apply priority suggestion to issue
   */
  async applyPrioritySuggestion(issueKey, priorityAnalysis) {
    try {
      const priorityMap = await this.getPriorityMap(issueKey);
      const targetPriority = this.mapPriorityLevel(
        priorityAnalysis.level,
        priorityMap
      );

      if (targetPriority) {
        return { id: targetPriority.id };
      }

      return null;
    } catch (error) {
      this.logger.error("Error applying priority suggestion", {
        error: error.message,
        issueKey,
      });
      return null;
    }
  }

  /**
   * Apply component suggestions to issue
   */
  async applyComponentSuggestions(issueKey, componentSuggestions) {
    try {
      if (
        !componentSuggestions.suggestedComponents ||
        componentSuggestions.suggestedComponents.length === 0
      ) {
        return null;
      }

      // Get current issue components
      const issue = await this.getIssueDetails(issueKey);
      const currentComponents = issue.fields.components || [];

      // Get project components
      const projectComponents = await this.getProjectComponents(
        issue.fields.project.key
      );

      // Match suggested components with actual project components
      const componentsToAdd = [];
      for (const suggestedName of componentSuggestions.suggestedComponents) {
        const matchingComponent = projectComponents.find(
          (comp) =>
            comp.name.toLowerCase() === suggestedName.toLowerCase() ||
            comp.name.toLowerCase().includes(suggestedName.toLowerCase())
        );

        if (
          matchingComponent &&
          !currentComponents.some((cc) => cc.id === matchingComponent.id)
        ) {
          componentsToAdd.push({
            id: matchingComponent.id,
            name: matchingComponent.name,
          });
        }
      }

      if (componentsToAdd.length > 0) {
        // Merge with existing components
        return [...currentComponents, ...componentsToAdd];
      }

      return null;
    } catch (error) {
      this.logger.error("Error applying component suggestions", {
        error: error.message,
        issueKey,
      });
      return null;
    }
  }

  /**
   * Apply label suggestions to issue
   */
  async applyLabelSuggestions(issueKey, triageResult) {
    try {
      const labelsToAdd = new Set();

      // Add categorization labels
      if (triageResult.categorization.type) {
        labelsToAdd.add(`ai-category-${triageResult.categorization.type}`);
      }

      // Add priority labels
      if (triageResult.priority.level) {
        labelsToAdd.add(`ai-priority-${triageResult.priority.level}`);
      }

      // Add sentiment labels
      if (triageResult.sentiment.tone !== "neutral") {
        labelsToAdd.add(`ai-sentiment-${triageResult.sentiment.tone}`);
      }

      // Add urgency labels
      if (triageResult.urgency.level !== "medium") {
        labelsToAdd.add(`ai-urgency-${triageResult.urgency.level}`);
      }

      // Add escalation risk labels
      if (
        triageResult.sentiment.escalationRisk === "high" ||
        triageResult.sentiment.escalationRisk === "critical"
      ) {
        labelsToAdd.add("ai-escalation-risk");
      }

      // Add emotional state labels
      if (triageResult.sentiment.languageFlags.hasAngryLanguage) {
        labelsToAdd.add("ai-customer-frustrated");
      }
      if (triageResult.sentiment.languageFlags.hasUrgentLanguage) {
        labelsToAdd.add("ai-urgent-language");
      }

      // Add suggestion-based labels
      if (triageResult.categorization.suggestedLabels) {
        triageResult.categorization.suggestedLabels.forEach((label) => {
          labelsToAdd.add(label);
        });
      }
      if (triageResult.components.suggestedLabels) {
        triageResult.components.suggestedLabels.forEach((label) => {
          labelsToAdd.add(label);
        });
      }

      // Get current labels
      const issue = await this.getIssueDetails(issueKey);
      const currentLabels = new Set(issue.fields.labels || []);

      // Filter out labels that already exist
      const newLabels = Array.from(labelsToAdd).filter(
        (label) => !currentLabels.has(label)
      );

      if (newLabels.length > 0) {
        // Return merged labels
        return [...Array.from(currentLabels), ...newLabels];
      }

      return null;
    } catch (error) {
      this.logger.error("Error applying label suggestions", {
        error: error.message,
        issueKey,
      });
      return null;
    }
  }

  /**
   * Apply custom field updates for triage metadata
   */
  async applyCustomFieldUpdates(issueKey, triageResult) {
    try {
      const updates = {};

      // Store AI confidence score in a custom field (if configured)
      if (this.config.customFields?.aiConfidenceField) {
        updates[this.config.customFields.aiConfidenceField] = Math.round(
          triageResult.confidence * 100
        );
      }

      // Store triage timestamp
      if (this.config.customFields?.triageTimestampField) {
        updates[this.config.customFields.triageTimestampField] =
          triageResult.timestamp;
      }

      // Store sentiment score
      if (this.config.customFields?.sentimentScoreField) {
        updates[this.config.customFields.sentimentScoreField] =
          triageResult.sentiment.score;
      }

      // Store escalation risk
      if (this.config.customFields?.escalationRiskField) {
        updates[this.config.customFields.escalationRiskField] = {
          value: triageResult.sentiment.escalationRisk,
        };
      }

      return Object.keys(updates).length > 0 ? updates : null;
    } catch (error) {
      this.logger.error("Error applying custom field updates", {
        error: error.message,
        issueKey,
      });
      return null;
    }
  }

  /**
   * Update Jira issue with triage suggestions
   */
  async updateJiraIssue(issueKey, updates) {
    try {
      const response = await api
        .asApp()
        .requestJira(route`/rest/api/3/issue/${issueKey}`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: updates,
          }),
        });

      if (!response.ok) {
        throw new Error(
          `Failed to update issue: ${response.status} ${response.statusText}`
        );
      }

      this.logger.info("Successfully updated Jira issue", {
        issueKey,
        updates,
      });
    } catch (error) {
      this.logger.error("Error updating Jira issue", {
        error: error.message,
        issueKey,
        updates,
      });
      throw error;
    }
  }

  /**
   * Add comprehensive triage comment to issue
   */
  async addTriageComment(issueKey, triageResult, notifications) {
    try {
      const comment = this.buildTriageComment(triageResult, notifications);

      const response = await api
        .asApp()
        .requestJira(route`/rest/api/3/issue/${issueKey}/comment`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: {
              type: "doc",
              version: 1,
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: comment,
                    },
                  ],
                },
              ],
            },
          }),
        });

      if (!response.ok) {
        throw new Error(
          `Failed to add comment: ${response.status} ${response.statusText}`
        );
      }

      this.logger.info("Added triage comment to issue", { issueKey });
    } catch (error) {
      this.logger.error("Error adding triage comment", {
        error: error.message,
        issueKey,
      });
      // Don't throw - comment failure shouldn't break the triage process
    }
  }

  /**
   * Build formatted triage comment
   */
  buildTriageComment(triageResult, notifications) {
    const confidence = Math.round(triageResult.confidence * 100);

    let comment = `🤖 **AI Ticket Triage Analysis** (${confidence}% confidence)\n\n`;

    // Add applied changes
    if (notifications.length > 0) {
      comment += "**✅ Applied Changes:**\n";
      notifications.forEach((notification) => {
        comment += `• ${notification}\n`;
      });
      comment += "\n";
    }

    // Add analysis summary
    comment += "**📊 Analysis Summary:**\n";
    comment += `• **Category:** ${triageResult.categorization.type}`;
    if (triageResult.categorization.subtype) {
      comment += ` (${triageResult.categorization.subtype})`;
    }
    comment += "\n";
    comment += `• **Priority:** ${triageResult.priority.level.toUpperCase()}\n`;
    comment += `• **Urgency:** ${triageResult.urgency.level}\n`;
    comment += `• **Sentiment:** ${triageResult.sentiment.tone}`;
    if (triageResult.sentiment.escalationRisk !== "low") {
      comment += ` ⚠️ Escalation Risk: ${triageResult.sentiment.escalationRisk}`;
    }
    comment += "\n\n";

    // Add recommendations
    if (
      triageResult.recommendations &&
      triageResult.recommendations.length > 0
    ) {
      comment += "**💡 Recommendations:**\n";
      triageResult.recommendations.forEach((rec) => {
        comment += `• ${rec.message}\n`;
      });
      comment += "\n";
    }

    // Add reasoning
    if (triageResult.categorization.reasoning) {
      comment += `**🔍 Categorization Reasoning:** ${triageResult.categorization.reasoning}\n\n`;
    }
    if (triageResult.priority.reasoning) {
      comment += `**⚡ Priority Reasoning:** ${triageResult.priority.reasoning}\n\n`;
    }

    comment += `*Analysis completed at ${new Date(
      triageResult.timestamp
    ).toLocaleString()}*`;

    return comment;
  }

  /**
   * Get priority mapping for the project
   */
  async getPriorityMap(issueKey) {
    try {
      const response = await api
        .asApp()
        .requestJira(route`/rest/api/3/priority`);
      const priorities = await response.json();

      const priorityMap = {};
      priorities.forEach((priority) => {
        priorityMap[priority.name.toLowerCase()] = priority;
      });

      return priorityMap;
    } catch (error) {
      this.logger.error("Error getting priority map", { error: error.message });
      return {};
    }
  }

  /**
   * Map AI priority level to Jira priority
   */
  mapPriorityLevel(aiLevel, priorityMap) {
    const mapping = {
      critical: ["highest", "critical", "blocker"],
      high: ["high", "major"],
      medium: ["medium", "normal"],
      low: ["low", "lowest", "trivial", "minor"],
    };

    const candidates = mapping[aiLevel] || ["medium"];

    for (const candidate of candidates) {
      if (priorityMap[candidate]) {
        return priorityMap[candidate];
      }
    }

    // Fallback to first available priority
    return Object.values(priorityMap)[0] || null;
  }

  /**
   * Get issue details
   */
  async getIssueDetails(issueKey) {
    try {
      const response = await api
        .asApp()
        .requestJira(route`/rest/api/3/issue/${issueKey}?expand=comments`);
      return await response.json();
    } catch (error) {
      this.logger.error("Error getting issue details", {
        error: error.message,
        issueKey,
      });
      throw error;
    }
  }

  /**
   * Get project components
   */
  async getProjectComponents(projectKey) {
    try {
      const response = await api
        .asApp()
        .requestJira(route`/rest/api/3/project/${projectKey}/components`);
      return await response.json();
    } catch (error) {
      this.logger.error("Error getting project components", {
        error: error.message,
        projectKey,
      });
      return [];
    }
  }

  /**
   * Log triage activity for analytics
   */
  async logTriageActivity(issueKey, triageResult, appliedUpdates) {
    try {
      const activity = {
        issueKey,
        timestamp: new Date().toISOString(),
        triageResults: {
          category: triageResult.categorization.type,
          priority: triageResult.priority.level,
          sentiment: triageResult.sentiment.tone,
          urgency: triageResult.urgency.level,
          confidence: triageResult.confidence,
        },
        appliedUpdates: Object.keys(appliedUpdates),
        recommendations: triageResult.recommendations.map((r) => r.type),
      };

      // Store in Forge storage for analytics
      const activityKey = `triage-activity-${issueKey}-${Date.now()}`;
      await api.asApp().storage.set(activityKey, activity);

      // Update analytics counters
      await this.updateAnalyticsCounters(triageResult);

      this.logger.info("Logged triage activity", { issueKey, activity });
    } catch (error) {
      this.logger.error("Error logging triage activity", {
        error: error.message,
        issueKey,
      });
      // Don't throw - logging failure shouldn't break triage
    }
  }

  /**
   * Update analytics counters
   */
  async updateAnalyticsCounters(triageResult) {
    try {
      const counters = (await api
        .asApp()
        .storage.get("triage-analytics-counters")) || {
        totalTriaged: 0,
        byCategory: {},
        byPriority: {},
        bySentiment: {},
        byUrgency: {},
        lastUpdated: new Date().toISOString(),
      };

      // Update counters
      counters.totalTriaged++;
      counters.byCategory[triageResult.categorization.type] =
        (counters.byCategory[triageResult.categorization.type] || 0) + 1;
      counters.byPriority[triageResult.priority.level] =
        (counters.byPriority[triageResult.priority.level] || 0) + 1;
      counters.bySentiment[triageResult.sentiment.tone] =
        (counters.bySentiment[triageResult.sentiment.tone] || 0) + 1;
      counters.byUrgency[triageResult.urgency.level] =
        (counters.byUrgency[triageResult.urgency.level] || 0) + 1;
      counters.lastUpdated = new Date().toISOString();

      await api.asApp().storage.set("triage-analytics-counters", counters);
    } catch (error) {
      this.logger.error("Error updating analytics counters", {
        error: error.message,
      });
    }
  }
}
