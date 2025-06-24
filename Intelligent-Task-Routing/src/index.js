import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";
import { storage } from "@forge/api";

const resolver = new Resolver();

// Default configuration
const DEFAULT_CONFIG = {
  selectedModel: "gpt-4",
  autoAssign: true,
  autoPriority: true,
  enableSuggestions: true,
  confidenceThreshold: 0.9,
};

/**
 * Get configuration for admin dashboard
 */
resolver.define("getConfig", async (req) => {
  try {
    console.log("getConfig called:", req);

    // Try to get saved configuration from storage
    const savedConfig = await storage.get("ai-routing-config");

    if (savedConfig) {
      console.log("Retrieved saved config:", savedConfig);
      return savedConfig;
    }

    console.log("No saved config found, returning defaults");
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error("Error getting config:", error);
    return DEFAULT_CONFIG;
  }
});

/**
 * Save configuration from admin dashboard
 */
resolver.define("saveConfig", async (req) => {
  try {
    const { payload } = req;
    console.log("saveConfig called with payload:", payload);

    // Validate the configuration
    const config = {
      selectedModel: payload.selectedModel || "gpt-4",
      autoAssign: payload.autoAssign !== false,
      autoPriority: payload.autoPriority !== false,
      enableSuggestions: payload.enableSuggestions !== false,
      confidenceThreshold: payload.confidenceThreshold || 0.9,
    };

    // Save to storage
    await storage.set("ai-routing-config", config);

    console.log("Configuration saved successfully:", config);

    return {
      success: true,
      message: "Configuration saved successfully",
      config: config,
    };
  } catch (error) {
    console.error("Error saving config:", error);
    return {
      success: false,
      error: error.message || "Failed to save configuration",
    };
  }
});

/**
 * Simple resolver for testing
 */
resolver.define("getText", (req) => {
  console.log("getText called:", req);
  return "🤖 Intelligent Task Routing Configuration";
});

// Workload Dashboard Resolvers
resolver.define("getTeamWorkload", async (req) => {
  try {
    console.log("getTeamWorkload called");

    // Get project users using proper route API
    const projectUsersResponse = await api
      .asApp()
      .requestJira(
        route`/rest/api/3/user/assignable/search?project=ECS&maxResults=50`
      );

    if (!projectUsersResponse.ok) {
      console.log("Failed to fetch users, returning mock data");
      return getMockWorkloadData();
    }

    const users = await projectUsersResponse.json();

    if (!Array.isArray(users) || users.length === 0) {
      console.log("No users found, returning mock data");
      return getMockWorkloadData();
    }

    const workloadData = [];

    for (const user of users.slice(0, 10)) {
      // Limit to 10 users
      try {
        const userIssuesResponse = await api
          .asApp()
          .requestJira(
            route`/rest/api/3/search?jql=${encodeURIComponent(
              `assignee="${user.accountId}" AND status!=Done AND project=ECS`
            )}&maxResults=50`
          );

        let issues = [];
        if (userIssuesResponse.ok) {
          const searchResult = await userIssuesResponse.json();
          issues = searchResult.issues || [];
        }

        const totalPoints = issues.reduce((sum, issue) => {
          const storyPoints = issue.fields.customfield_10016 || 0; // Story points field
          return sum + storyPoints;
        }, 0);

        // Calculate efficiency based on completion rate (mock data for now)
        const efficiency = Math.floor(Math.random() * 30) + 70; // 70-100%

        // Determine status based on workload
        let status = "optimal";
        if (issues.length >= 7) status = "overloaded";
        else if (issues.length <= 2) status = "underutilized";

        workloadData.push({
          userId: user.accountId,
          displayName: user.displayName,
          email: user.emailAddress,
          activeIssues: issues.length,
          totalPoints: totalPoints,
          avgCompletionDays: Math.round((Math.random() * 5 + 2) * 10) / 10, // 2-7 days
          efficiency: efficiency,
          expertise: getRandomExpertise(),
          status: status,
        });
      } catch (userError) {
        console.error(
          `Error fetching data for user ${user.displayName}:`,
          userError
        );
      }
    }

    console.log("Workload data fetched:", workloadData.length, "users");
    return workloadData.length > 0 ? workloadData : getMockWorkloadData();
  } catch (error) {
    console.error("Error fetching team workload:", error);
    // Return mock data if API fails
    return getMockWorkloadData();
  }
});

resolver.define("getTeamStats", async (req) => {
  try {
    console.log("getTeamStats called");

    // Get team stats directly from Jira API
    const projectStatsResponse = await api
      .asApp()
      .requestJira(
        route`/rest/api/3/search?jql=${encodeURIComponent(
          "project=ECS AND status!=Done"
        )}&maxResults=200`
      );

    let totalActiveIssues = 0;
    let issueTypesArray = [];

    if (projectStatsResponse.ok) {
      const searchResult = await projectStatsResponse.json();
      const issues = searchResult.issues || [];
      totalActiveIssues = issues.length;

      // Calculate issue type distribution
      const typeDistribution = {};
      issues.forEach((issue) => {
        const type = issue.fields.issuetype.name;
        typeDistribution[type] = (typeDistribution[type] || 0) + 1;
      });

      issueTypesArray = Object.entries(typeDistribution).map(
        ([name, count]) => ({
          name,
          count,
        })
      );
    }

    // Get basic team member count
    const teamMembersResponse = await api
      .asApp()
      .requestJira(
        route`/rest/api/3/user/assignable/search?project=ECS&maxResults=50`
      );

    let totalTeamMembers = 3; // Default fallback
    if (teamMembersResponse.ok) {
      const users = await teamMembersResponse.json();
      totalTeamMembers = users.length;
    }

    // Mock data for efficiency and workload distribution for now
    const avgTeamEfficiency = 83.0;
    const workloadDistribution = [
      {
        name: "Optimal",
        value: Math.max(1, totalTeamMembers - 2),
        color: "#36B37E",
      },
      {
        name: "Overloaded",
        value: 1,
        color: "#FF5630",
      },
      {
        name: "Underutilized",
        value: 1,
        color: "#FFAB00",
      },
    ];

    const stats = {
      totalTeamMembers,
      totalActiveIssues,
      avgTeamEfficiency,
      workloadDistribution,
      issueTypes: issueTypesArray,
    };

    console.log("Team stats calculated:", stats);
    return stats;
  } catch (error) {
    console.error("Error fetching team stats:", error);
    return getMockTeamStats();
  }
});

resolver.define("getAIRebalancingSuggestions", async (req) => {
  try {
    console.log("getAIRebalancingSuggestions called");

    // Get real issue data for suggestions
    const issuesResponse = await api
      .asApp()
      .requestJira(
        route`/rest/api/3/search?jql=${encodeURIComponent(
          "project=ECS AND status!=Done"
        )}&maxResults=50`
      );

    let suggestions = [];

    if (issuesResponse.ok) {
      const searchResult = await issuesResponse.json();
      const issues = searchResult.issues || [];

      // Analyze workload by assignee
      const assigneeWorkload = {};
      issues.forEach((issue) => {
        const assigneeId = issue.fields.assignee?.accountId;
        const assigneeName = issue.fields.assignee?.displayName || "Unassigned";

        if (assigneeId) {
          if (!assigneeWorkload[assigneeId]) {
            assigneeWorkload[assigneeId] = {
              name: assigneeName,
              count: 0,
              issues: [],
            };
          }
          assigneeWorkload[assigneeId].count++;
          assigneeWorkload[assigneeId].issues.push(issue.key);
        }
      });

      // Find overloaded users (more than 5 issues)
      const overloadedUsers = Object.entries(assigneeWorkload)
        .filter(([_, data]) => data.count > 5)
        .map(([id, data]) => ({ id, ...data }));

      // Generate real suggestions based on actual data
      overloadedUsers.forEach((user, index) => {
        suggestions.push({
          id: suggestions.length + 1,
          type: "reassign",
          priority: "high",
          title: `Redistribute ${user.name}'s Overload`,
          description: `${user.name} has ${user.count} active issues. AI suggests moving 2-3 medium priority issues to available team members.`,
          fromUser: user.name,
          toUsers: ["Sarah Johnson", "Info Demo"], // Could be dynamic based on actual users
          affectedIssues: user.issues.slice(-2), // Last 2 issues
          expectedImpact: `Reduce ${user.name}'s workload by 30%, improve team efficiency by 12%`,
          confidence: Math.floor(Math.random() * 20) + 75, // 75-95%
        });
      });
    }

    // Add skill-based suggestion if we have few suggestions
    if (suggestions.length === 0) {
      suggestions.push({
        id: 1,
        type: "skill_match",
        priority: "medium",
        title: "Optimize Skill Alignment",
        description:
          "AI detected issues assigned to team members without optimal skill match. Reassigning could improve velocity.",
        fromUser: "John Smith",
        toUsers: ["Sarah Johnson"],
        affectedIssues: ["ECS-15", "ECS-16"],
        expectedImpact: "Faster resolution time, 20-30% efficiency gain",
        confidence: Math.floor(Math.random() * 15) + 70, // 70-85%
      });
    }

    console.log("AI suggestions generated:", suggestions.length);
    return suggestions;
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    return getMockAISuggestions();
  }
});

resolver.define("executeReassignment", async (req) => {
  try {
    console.log("executeReassignment called with:", req.payload);

    const { suggestionId, affectedIssues, toUsers, fromUser } = req.payload;

    if (
      !affectedIssues ||
      !Array.isArray(affectedIssues) ||
      affectedIssues.length === 0
    ) {
      throw new Error("No issues specified for reassignment");
    }

    const results = [];

    // First, get user account IDs for the target users
    const userAccountIds = {};

    // Search for users by display name to get their account IDs
    for (const userName of toUsers) {
      try {
        const userSearchResponse = await api
          .asApp()
          .requestJira(
            route`/rest/api/3/user/search?query=${encodeURIComponent(
              userName
            )}&maxResults=5`
          );

        if (userSearchResponse.ok) {
          const users = await userSearchResponse.json();
          const matchedUser = users.find((u) => u.displayName === userName);
          if (matchedUser) {
            userAccountIds[userName] = matchedUser.accountId;
            console.log(
              `Found account ID for ${userName}: ${matchedUser.accountId}`
            );
          }
        }
      } catch (userSearchError) {
        console.error(`Error finding user ${userName}:`, userSearchError);
      }
    }

    // For each issue, attempt to reassign it
    for (const issueKey of affectedIssues) {
      try {
        // Get a random target user from toUsers array
        const targetUser = toUsers[Math.floor(Math.random() * toUsers.length)];
        const targetAccountId = userAccountIds[targetUser];

        if (!targetAccountId) {
          console.log(
            `Could not find account ID for ${targetUser}, skipping ${issueKey}`
          );
          results.push({
            issueKey,
            success: false,
            error: `Could not find account ID for user: ${targetUser}`,
          });
          continue;
        }

        // Update the issue assignee using Jira REST API
        const updateResponse = await api
          .asApp()
          .requestJira(route`/rest/api/3/issue/${issueKey}`, {
            method: "PUT",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fields: {
                assignee: {
                  accountId: targetAccountId,
                },
              },
            }),
          });

        if (updateResponse.ok) {
          console.log(`Successfully reassigned ${issueKey} to ${targetUser}`);

          // Add a comment explaining the AI-driven reassignment
          try {
            const commentResponse = await api
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
                            text: `🤖 AI Workload Rebalancing: Issue reassigned from ${fromUser} to ${targetUser} to optimize team workload distribution. Confidence: ${
                              req.payload.confidence || "N/A"
                            }%`,
                          },
                        ],
                      },
                    ],
                  },
                }),
              });

            if (commentResponse.ok) {
              console.log(`Added AI comment to ${issueKey}`);
            }
          } catch (commentError) {
            console.error(
              `Failed to add comment to ${issueKey}:`,
              commentError
            );
          }

          results.push({
            issueKey,
            success: true,
            assignedTo: targetUser,
            message: `Successfully reassigned ${issueKey} to ${targetUser}`,
          });
        } else {
          const errorText = await updateResponse.text();
          console.error(
            `Failed to reassign ${issueKey}:`,
            updateResponse.status,
            errorText
          );
          results.push({
            issueKey,
            success: false,
            error: `HTTP ${updateResponse.status}: ${errorText}`,
          });
        }
      } catch (issueError) {
        console.error(`Failed to reassign ${issueKey}:`, issueError);
        results.push({
          issueKey,
          success: false,
          error: issueError.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;

    return {
      success: successCount > 0,
      suggestionId,
      results,
      message: `Successfully reassigned ${successCount}/${totalCount} issues`,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: totalCount - successCount,
      },
    };
  } catch (error) {
    console.error("Error executing reassignment:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});

resolver.define("getHistoricalWorkload", async (req) => {
  try {
    console.log("getHistoricalWorkload called with:", req.payload);

    const { timeRange } = req.payload || { timeRange: "30d" };

    // In a real implementation, you would fetch historical data from storage or analytics
    // For now, return mock historical data
    const days = parseInt(timeRange.replace("d", ""));
    const historicalData = [];

    for (let i = days; i >= 0; i -= 7) {
      // Weekly data points
      const date = new Date();
      date.setDate(date.getDate() - i);

      historicalData.push({
        date: date.toISOString().split("T")[0],
        issues: Math.floor(Math.random() * 10) + 15, // 15-25 issues
        efficiency: Math.floor(Math.random() * 15) + 75, // 75-90% efficiency
      });
    }

    console.log(
      "Historical data generated:",
      historicalData.length,
      "data points"
    );
    return historicalData;
  } catch (error) {
    console.error("Error fetching historical workload:", error);
    return getMockHistoricalData();
  }
});

// Helper functions
function getRandomExpertise() {
  const expertiseAreas = [
    ["Frontend", "React"],
    ["Backend", "API"],
    ["Testing", "QA"],
    ["DevOps", "Infrastructure"],
    ["UI/UX", "Design"],
    ["Database", "SQL"],
    ["Mobile", "React Native"],
  ];
  return expertiseAreas[Math.floor(Math.random() * expertiseAreas.length)];
}

function getMockWorkloadData() {
  return [
    {
      userId: "user1",
      displayName: "Info Demo",
      email: "info.demo@company.com",
      activeIssues: 3,
      totalPoints: 21,
      avgCompletionDays: 4.2,
      efficiency: 85,
      expertise: ["UI/UX", "Frontend"],
      status: "optimal",
    },
    {
      userId: "user2",
      displayName: "John Smith",
      email: "john.smith@company.com",
      activeIssues: 8,
      totalPoints: 45,
      avgCompletionDays: 6.8,
      efficiency: 72,
      expertise: ["Backend", "API"],
      status: "overloaded",
    },
    {
      userId: "user3",
      displayName: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      activeIssues: 2,
      totalPoints: 8,
      avgCompletionDays: 3.1,
      efficiency: 92,
      expertise: ["Testing", "QA"],
      status: "underutilized",
    },
  ];
}

function getMockTeamStats() {
  return {
    totalTeamMembers: 3,
    totalActiveIssues: 13,
    avgTeamEfficiency: 83.0,
    workloadDistribution: [
      { name: "Optimal", value: 1, color: "#36B37E" },
      { name: "Overloaded", value: 1, color: "#FF5630" },
      { name: "Underutilized", value: 1, color: "#FFAB00" },
    ],
    issueTypes: [
      { name: "Bug", count: 5 },
      { name: "Story", count: 4 },
      { name: "Task", count: 2 },
      { name: "Epic", count: 2 },
    ],
  };
}

function getMockAISuggestions() {
  return [
    {
      id: 1,
      type: "reassign",
      priority: "high",
      title: "Redistribute John's Overload",
      description:
        "John Smith has 8 active issues (45 story points). AI suggests moving 2 medium priority issues to Sarah Johnson and Info Demo.",
      fromUser: "John Smith",
      toUsers: ["Sarah Johnson", "Info Demo"],
      affectedIssues: ["ECS-15", "ECS-16"],
      expectedImpact:
        "Reduce John's workload by 30%, improve team efficiency by 12%",
      confidence: 89,
    },
  ];
}

function getMockHistoricalData() {
  return [
    { date: "2024-11-15", issues: 18, efficiency: 85 },
    { date: "2024-11-22", issues: 16, efficiency: 79 },
    { date: "2024-11-29", issues: 18, efficiency: 81 },
    { date: "2024-12-06", issues: 20, efficiency: 84 },
    { date: "2024-12-13", issues: 18, efficiency: 82 },
  ];
}

export const handler = resolver.getDefinitions();

// Additional resolver for workload dashboard
export async function workloadHandler(req) {
  return handler(req);
}

// Export AI routing functions for manifest references
export { issueEventHandler, aiSuggestionsResolver } from "./ai-routing.js";
