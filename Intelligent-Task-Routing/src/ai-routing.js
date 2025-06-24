import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";

const resolver = new Resolver();

class SimpleConfigManager {
  static async getConfiguration() {
    try {
      const config = await api.asApp().storage.get("ai-routing-config");
      return (
        config || {
          selectedModel: "gpt-4",
          autoAssign: true,
          autoPriority: true,
          enableSuggestions: true,
          confidenceThreshold: 0.9,
          enabled: true,
        }
      );
    } catch (error) {
      console.error("Error getting configuration:", error);
      return {
        selectedModel: "gpt-4",
        autoAssign: true,
        autoPriority: true,
        enableSuggestions: true,
        confidenceThreshold: 0.9,
        enabled: true,
      };
    }
  }
}

class SimpleAIEngine {
  constructor(config) {
    this.config = config;
  }

  async generateSuggestions(issueData) {
    console.log("🤖 Generating AI suggestions for issue:", issueData.key);

    try {
      const assignableUsers = await this.getAssignableUsers(
        issueData.fields.project.key
      );

      if (!assignableUsers.length) {
        console.log("No assignable users found");
        return null;
      }

      const suggestion = await this.selectBestAssignee(
        assignableUsers,
        issueData
      );

      const suggestions = {
        assignee: suggestion,
        priority: await this.suggestPriority(issueData),
        confidence: suggestion.confidence,
        reasoning: `AI analysis complete. Selected ${
          suggestion.displayName
        } with ${Math.round(
          suggestion.confidence * 100
        )}% confidence based on workload and expertise factors.`,
      };

      console.log("✅ Generated suggestions:", suggestions);
      return suggestions;
    } catch (error) {
      console.error("❌ Error generating suggestions:", error);
      throw error;
    }
  }

  async getAssignableUsers(projectKey) {
    try {
      const response = await api
        .asApp()
        .requestJira(
          route`/rest/api/3/user/assignable/search?project=${projectKey}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

      console.log(
        `Found ${response.body.length} assignable users in project ${projectKey}`
      );
      return response.body;
    } catch (error) {
      console.error("Error fetching assignable users:", error);
      return [];
    }
  }

  async selectBestAssignee(users, issueData) {
    console.log("🎯 Analyzing best assignee for:", issueData.summary);

    const analyses = await Promise.all(
      users.map(async (user) => {
        const workloadScore = await this.analyzeWorkload(user);
        const expertiseScore = this.analyzeExpertise(user, issueData);
        const totalScore = workloadScore + expertiseScore;

        return {
          accountId: user.accountId,
          displayName: user.displayName,
          confidence: Math.min(totalScore / 100, 0.95),
          reason: `Selected based on ${
            workloadScore > 20 ? "low" : "moderate"
          } current workload`,
          totalScore: totalScore,
        };
      })
    );

    const bestMatch = analyses.sort((a, b) => b.confidence - a.confidence)[0];

    console.log("🏆 Best assignee analysis:", {
      winner: bestMatch.displayName,
      confidence: bestMatch.confidence,
      totalScore: bestMatch.totalScore,
    });

    return bestMatch;
  }

  async analyzeWorkload(user) {
    try {
      const response = await api
        .asApp()
        .requestJira(
          route`/rest/api/3/search?jql=assignee=${user.accountId} AND status != Done AND status != Closed`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

      const openIssues = response.body.total || 0;

      if (openIssues <= 2) return 30;
      if (openIssues <= 5) return 20;
      if (openIssues <= 10) return 10;
      return 5;
    } catch (error) {
      console.error("Error analyzing workload:", error);
      return 15;
    }
  }

  analyzeExpertise(user, issueData) {
    const issueType = issueData.fields.issuetype?.name?.toLowerCase() || "";
    const description = (issueData.fields.description || "").toLowerCase();

    let expertiseScore = 10;

    if (
      issueType.includes("bug") &&
      user.displayName.toLowerCase().includes("demo")
    ) {
      expertiseScore += 15;
    }

    if (
      description.includes("customer") &&
      user.displayName.toLowerCase().includes("demo")
    ) {
      expertiseScore += 10;
    }

    return Math.min(expertiseScore, 25);
  }

  async suggestPriority(issueData) {
    const description = (issueData.fields.description || "").toLowerCase();
    const summary = (issueData.fields.summary || "").toLowerCase();

    const urgentKeywords = [
      "urgent",
      "critical",
      "production",
      "down",
      "broken",
      "emergency",
    ];
    const highKeywords = ["important", "customer", "deadline", "asap"];

    const text = description + " " + summary;

    if (urgentKeywords.some((keyword) => text.includes(keyword))) {
      return {
        level: "High",
        confidence: 0.8,
        reason: "Detected urgent keywords in issue content",
      };
    }

    if (highKeywords.some((keyword) => text.includes(keyword))) {
      return {
        level: "Medium",
        confidence: 0.7,
        reason: "Detected high-priority keywords in issue content",
      };
    }

    return {
      level: "Low",
      confidence: 0.6,
      reason: "Standard priority based on content analysis",
    };
  }
}

export async function issueEventHandler(event, context) {
  console.log("🔔 Issue event received:", {
    issueKey: event.issue?.key,
    eventType: event.eventType,
    user: event.user?.displayName,
  });

  try {
    const config = await SimpleConfigManager.getConfiguration();

    if (!config.enabled) {
      console.log("❌ AI routing is disabled, skipping");
      return;
    }

    if (event.eventType !== "issue_created") {
      console.log("⏭️ Skipping non-creation event:", event.eventType);
      return;
    }

    if (event.issue.fields.assignee) {
      console.log("⏭️ Issue already has assignee, skipping");
      return;
    }

    const aiEngine = new SimpleAIEngine(config);
    const suggestions = await aiEngine.generateSuggestions(event.issue);

    if (!suggestions) {
      console.log("❌ No suggestions generated");
      return;
    }

    await api
      .asApp()
      .storage.set(`suggestions-${event.issue.key}`, suggestions);

    if (config.autoAssign && suggestions.assignee) {
      console.log(
        "🎯 Auto-assigning issue to:",
        suggestions.assignee.displayName
      );

      await api
        .asApp()
        .requestJira(route`/rest/api/3/issue/${event.issue.key}/assignee`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountId: suggestions.assignee.accountId,
          }),
        });
    }

    if (config.autoPriority && suggestions.priority) {
      console.log("⚡ Auto-setting priority to:", suggestions.priority.level);

      const priorityResponse = await api
        .asApp()
        .requestJira(route`/rest/api/3/priority`, {
          headers: {
            Accept: "application/json",
          },
        });

      const priorities = priorityResponse.body;
      const targetPriority = priorities.find(
        (p) => p.name.toLowerCase() === suggestions.priority.level.toLowerCase()
      );

      if (targetPriority) {
        await api
          .asApp()
          .requestJira(route`/rest/api/3/issue/${event.issue.key}`, {
            method: "PUT",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fields: {
                priority: { id: targetPriority.id },
              },
            }),
          });
      }
    }

    const comment = `🤖 **AI Task Routing Suggestions**

**Recommended Assignee:** ${suggestions.assignee.displayName} (${Math.round(
      suggestions.assignee.confidence * 100
    )}% confidence)
*Reason:* ${suggestions.assignee.reason}

**Suggested Priority:** ${suggestions.priority.level} (${Math.round(
      suggestions.priority.confidence * 100
    )}% confidence)
*Reason:* ${suggestions.priority.reason}

*AI Analysis:* ${suggestions.reasoning}`;

    await api
      .asApp()
      .requestJira(route`/rest/api/3/issue/${event.issue.key}/comment`, {
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

    console.log("✅ AI routing completed successfully");
  } catch (error) {
    console.error("❌ Error in issue event handler:", error);
  }
}

export async function aiSuggestionsResolver(req) {
  console.log("🎯 AI Suggestions resolver called");

  try {
    const issueKey = req.context?.extension?.issue?.key;

    if (!issueKey) {
      return {
        error: "No issue context available",
      };
    }

    console.log("📋 Getting suggestions for issue:", issueKey);

    let suggestions = await api.asApp().storage.get(`suggestions-${issueKey}`);

    if (!suggestions) {
      console.log("🔄 No cached suggestions, generating new ones...");

      const issueResponse = await api
        .asApp()
        .requestJira(route`/rest/api/3/issue/${issueKey}`, {
          headers: {
            Accept: "application/json",
          },
        });

      const config = await SimpleConfigManager.getConfiguration();
      const aiEngine = new SimpleAIEngine(config);

      suggestions = await aiEngine.generateSuggestions(issueResponse.body);

      if (suggestions) {
        await api.asApp().storage.set(`suggestions-${issueKey}`, suggestions);
      }
    }

    return {
      success: true,
      suggestions: suggestions,
      issueKey: issueKey,
    };
  } catch (error) {
    console.error("❌ Error in AI suggestions resolver:", error);
    return {
      error: "Failed to load AI suggestions: " + error.message,
    };
  }
}
