import React, { useState, useEffect } from "react";
import { invoke } from "@forge/bridge";

function App() {
  const [loading, setLoading] = useState(true);
  const [workloadData, setWorkloadData] = useState([]);
  const [teamStats, setTeamStats] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWorkloadData();
  }, [selectedTimeRange]);

  const loadWorkloadData = async () => {
    try {
      setLoading(true);
      // Try to fetch real data, fall back to mock data
      const workload = await invoke("getTeamWorkload").catch(() =>
        getMockWorkloadData()
      );
      const stats = await invoke("getTeamStats").catch(() =>
        getMockTeamStats()
      );
      const suggestions = await invoke("getAIRebalancingSuggestions").catch(
        () => getMockAISuggestions()
      );

      setWorkloadData(workload || getMockWorkloadData());
      setTeamStats(stats || getMockTeamStats());
      setAiSuggestions(suggestions || getMockAISuggestions());
    } catch (error) {
      console.error("Error loading workload data:", error);
      // Set mock data for development
      setWorkloadData(getMockWorkloadData());
      setTeamStats(getMockTeamStats());
      setAiSuggestions(getMockAISuggestions());
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWorkloadData();
    setRefreshing(false);
  };

  const handleReassign = async (suggestion) => {
    try {
      await invoke("executeReassignment", suggestion);
      await loadWorkloadData(); // Refresh data
    } catch (error) {
      console.error("Error executing reassignment:", error);
    }
  };

  const getMockWorkloadData = () => [
    {
      userId: "user1",
      displayName: "Info Demo",
      email: "info.demo@company.com",
      activeIssues: 3,
      totalPoints: 21,
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
      efficiency: 92,
      expertise: ["Testing", "QA"],
      status: "underutilized",
    },
    {
      userId: "user4",
      displayName: "Mike Chen",
      email: "mike.chen@company.com",
      activeIssues: 5,
      totalPoints: 28,
      efficiency: 78,
      expertise: ["DevOps", "Infrastructure"],
      status: "optimal",
    },
  ];

  const getMockTeamStats = () => ({
    totalTeamMembers: 4,
    totalActiveIssues: 18,
    avgTeamEfficiency: 81.75,
    workloadDistribution: [
      { name: "Optimal", value: 2, color: "#36B37E" },
      { name: "Overloaded", value: 1, color: "#FF5630" },
      { name: "Underutilized", value: 1, color: "#FFAB00" },
    ],
  });

  const getMockAISuggestions = () => [
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
    {
      id: 2,
      type: "skill_match",
      priority: "medium",
      title: "Optimize Skill Alignment",
      description:
        "ECS-17 (UI component bug) assigned to Mike Chen (DevOps) - better suited for Info Demo (UI/UX expert).",
      fromUser: "Mike Chen",
      toUsers: ["Info Demo"],
      affectedIssues: ["ECS-17"],
      expectedImpact: "Faster resolution time, 25% efficiency gain",
      confidence: 76,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "optimal":
        return "#36B37E";
      case "overloaded":
        return "#FF5630";
      case "underutilized":
        return "#FFAB00";
      default:
        return "#6B778C";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#FF5630";
      case "medium":
        return "#FFAB00";
      case "low":
        return "#36B37E";
      default:
        return "#6B778C";
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div>🔄 Loading workload data...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1400px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ margin: 0, color: "#0052cc" }}>
          🔄 Workload Balancing Dashboard
        </h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "2px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
            <option value="180d">Last 6 Months</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              padding: "8px 16px",
              backgroundColor: "#0052cc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: refreshing ? "not-allowed" : "pointer",
              fontSize: "14px",
            }}
          >
            {refreshing ? "🔄 Refreshing..." : "🔄 Refresh Data"}
          </button>
        </div>
      </div>

      {/* Team Overview Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{ margin: "0 0 8px 0", fontSize: "32px", color: "#0052cc" }}
          >
            {teamStats.totalTeamMembers || 0}
          </h2>
          <div style={{ color: "#6B778C" }}>Team Members</div>
        </div>
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{ margin: "0 0 8px 0", fontSize: "32px", color: "#0052cc" }}
          >
            {teamStats.totalActiveIssues || 0}
          </h2>
          <div style={{ color: "#6B778C" }}>Active Issues</div>
        </div>
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{ margin: "0 0 8px 0", fontSize: "32px", color: "#0052cc" }}
          >
            {teamStats.avgTeamEfficiency
              ? teamStats.avgTeamEfficiency.toFixed(1)
              : 0}
            %
          </h2>
          <div style={{ color: "#6B778C" }}>Avg Efficiency</div>
        </div>
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{ margin: "0 0 8px 0", fontSize: "32px", color: "#0052cc" }}
          >
            {aiSuggestions.length}
          </h2>
          <div style={{ color: "#6B778C" }}>AI Suggestions</div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "24px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "16px", color: "#0052cc" }}>
          🤖 AI Rebalancing Suggestions
        </h2>
        {aiSuggestions.length > 0 ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {aiSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                style={{
                  border: "1px solid #DFE1E6",
                  borderRadius: "6px",
                  padding: "16px",
                  backgroundColor:
                    suggestion.priority === "high" ? "#FFF4E6" : "#F4F5F7",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <strong>{suggestion.title}</strong>
                    <span
                      style={{
                        marginLeft: "8px",
                        padding: "2px 8px",
                        backgroundColor: getPriorityColor(suggestion.priority),
                        color: "white",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    >
                      {suggestion.priority} priority
                    </span>
                  </div>
                  <div style={{ color: "#6B778C", fontSize: "12px" }}>
                    {suggestion.confidence}% confidence
                  </div>
                </div>
                <div style={{ marginBottom: "8px", color: "#42526E" }}>
                  {suggestion.description}
                </div>
                <div
                  style={{
                    marginBottom: "12px",
                    fontSize: "12px",
                    color: "#6B778C",
                  }}
                >
                  <strong>Expected Impact:</strong> {suggestion.expectedImpact}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    {suggestion.affectedIssues &&
                      suggestion.affectedIssues.length > 0 && (
                        <div>
                          <strong>Issues:</strong>{" "}
                          {suggestion.affectedIssues.join(", ")}
                        </div>
                      )}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#f4f5f7",
                        border: "1px solid #dfe1e6",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleReassign(suggestion)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#0052cc",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Apply Suggestion
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "20px",
              backgroundColor: "#e6fcff",
              border: "1px solid #b3f5ff",
              borderRadius: "6px",
              color: "#0747a6",
            }}
          >
            <p>
              No AI suggestions available at the moment. Your team workload
              appears to be well balanced!
            </p>
          </div>
        )}
      </div>

      {/* Team Workload Table */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "16px", color: "#0052cc" }}>
          Team Member Details
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dfe1e6",
                  }}
                >
                  Team Member
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dfe1e6",
                  }}
                >
                  Active Issues
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dfe1e6",
                  }}
                >
                  Story Points
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dfe1e6",
                  }}
                >
                  Efficiency
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dfe1e6",
                  }}
                >
                  Expertise
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dfe1e6",
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {workloadData.map((member) => (
                <tr key={member.userId}>
                  <td
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #f4f5f7",
                    }}
                  >
                    <div>
                      <strong>{member.displayName}</strong>
                      <br />
                      <small style={{ color: "#6B778C" }}>{member.email}</small>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #f4f5f7",
                    }}
                  >
                    {member.activeIssues}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #f4f5f7",
                    }}
                  >
                    {member.totalPoints}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #f4f5f7",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          width: "100px",
                          height: "8px",
                          backgroundColor: "#f4f5f7",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${member.efficiency}%`,
                            height: "100%",
                            backgroundColor: "#36B37E",
                            borderRadius: "4px",
                          }}
                        ></div>
                      </div>
                      <small>{member.efficiency}%</small>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #f4f5f7",
                    }}
                  >
                    <div>
                      {member.expertise.map((skill) => (
                        <span
                          key={skill}
                          style={{
                            display: "inline-block",
                            margin: "2px",
                            padding: "2px 8px",
                            backgroundColor: "#e6fcff",
                            color: "#0747a6",
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #f4f5f7",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 8px",
                        backgroundColor: getStatusColor(member.status),
                        color: "white",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    >
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
