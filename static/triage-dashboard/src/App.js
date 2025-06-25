import React, { useState, useEffect } from "react";
import { invoke } from "@forge/bridge";

const TriageAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsData, activityData] = await Promise.all([
        invoke("getTriageAnalytics"),
        invoke("getRecentTriageActivity"),
      ]);

      setAnalytics(analyticsData);
      setRecentActivity(activityData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCategoryData = (byCategory) => {
    return Object.entries(byCategory || {}).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      percentage: analytics
        ? ((count / analytics.totalTriaged) * 100).toFixed(1)
        : 0,
    }));
  };

  const formatPriorityData = (byPriority) => {
    const priorityOrder = ["critical", "high", "medium", "low"];
    return priorityOrder.map((priority) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: byPriority?.[priority] || 0,
      percentage: analytics
        ? (
            ((byPriority?.[priority] || 0) / analytics.totalTriaged) *
            100
          ).toFixed(1)
        : 0,
    }));
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "#ffebee",
          borderRadius: "4px",
          color: "#c62828",
        }}
      >
        <h3>Error loading analytics</h3>
        <p>{error}</p>
        <button
          onClick={loadAnalytics}
          style={{
            padding: "8px 16px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "#e3f2fd",
          borderRadius: "4px",
          color: "#1565c0",
        }}
      >
        <h3>No data available</h3>
        <p>
          No triage analytics data found. Issues will appear here once they are
          processed by the AI triage engine.
        </p>
      </div>
    );
  }

  const categoryData = formatCategoryData(analytics.byCategory);
  const priorityData = formatPriorityData(analytics.byPriority);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0, color: "#1976d2" }}>
          AI Ticket Triage Analytics
        </h1>
        <button
          onClick={loadAnalytics}
          style={{
            padding: "8px 16px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            padding: "20px",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            textAlign: "center",
            backgroundColor: "white",
          }}
        >
          <h2
            style={{ margin: "0 0 8px 0", fontSize: "32px", color: "#1976d2" }}
          >
            {analytics.totalTriaged}
          </h2>
          <p style={{ margin: 0, color: "#666" }}>Total Issues Triaged</p>
        </div>
        <div
          style={{
            padding: "20px",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            textAlign: "center",
            backgroundColor: "white",
          }}
        >
          <h2
            style={{ margin: "0 0 8px 0", fontSize: "32px", color: "#4caf50" }}
          >
            {analytics.byPriority?.critical || 0}
          </h2>
          <p style={{ margin: 0, color: "#666" }}>Critical Priority</p>
        </div>
        <div
          style={{
            padding: "20px",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            textAlign: "center",
            backgroundColor: "white",
          }}
        >
          <h2
            style={{ margin: "0 0 8px 0", fontSize: "32px", color: "#f44336" }}
          >
            {analytics.bySentiment?.negative || 0}
          </h2>
          <p style={{ margin: 0, color: "#666" }}>Negative Sentiment</p>
        </div>
        <div
          style={{
            padding: "20px",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            textAlign: "center",
            backgroundColor: "white",
          }}
        >
          <h2
            style={{ margin: "0 0 8px 0", fontSize: "32px", color: "#ff9800" }}
          >
            {analytics.byUrgency?.immediate || 0}
          </h2>
          <p style={{ margin: 0, color: "#666" }}>Immediate Urgency</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", color: "#1976d2" }}>
          Categories Distribution
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
          }}
        >
          {categoryData.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "12px",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1976d2",
                }}
              >
                {item.value}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>{item.name}</div>
              <div style={{ fontSize: "12px", color: "#999" }}>
                {item.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Breakdown */}
      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", color: "#1976d2" }}>
          Priority Distribution
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
          }}
        >
          {priorityData.map((item, index) => {
            const colors = ["#f44336", "#ff9800", "#2196f3", "#4caf50"];
            return (
              <div
                key={index}
                style={{
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: colors[index],
                  }}
                >
                  {item.value}
                </div>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {item.name}
                </div>
                <div style={{ fontSize: "12px", color: "#999" }}>
                  {item.percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", color: "#1976d2" }}>
          Recent Triage Activity
        </h3>
        {recentActivity.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Issue Key
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Category
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Priority
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Sentiment
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Confidence
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Processed
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.slice(0, 10).map((activity, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? "white" : "#fafafa",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      <strong>{activity.issueKey}</strong>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      {activity.triageResults?.category || "Unknown"}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      {activity.triageResults?.priority || "Unknown"}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      {activity.triageResults?.sentiment || "Unknown"}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      {activity.triageResults?.confidence
                        ? `${Math.round(
                            activity.triageResults.confidence * 100
                          )}%`
                        : "N/A"}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      <small>
                        {new Date(activity.timestamp).toLocaleString()}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              textAlign: "center",
              color: "#666",
            }}
          >
            <p>No recent triage activity found.</p>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "16px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h4 style={{ margin: "0 0 8px 0", color: "#1976d2" }}>
          About AI Triage Analytics
        </h4>
        <p style={{ margin: "8px 0", color: "#666", fontSize: "14px" }}>
          This dashboard shows insights from the AI-powered ticket triage
          system. The AI analyzes each issue for:
        </p>
        <ul style={{ margin: "8px 0", color: "#666", fontSize: "14px" }}>
          <li>
            <strong>Category:</strong> Type of issue (bug, feature, support,
            etc.)
          </li>
          <li>
            <strong>Priority:</strong> Business impact and urgency assessment
          </li>
          <li>
            <strong>Sentiment:</strong> Emotional tone analysis from issue
            description and comments
          </li>
          <li>
            <strong>Urgency:</strong> Time-sensitivity based on content analysis
          </li>
        </ul>
        <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#999" }}>
          Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default TriageAnalyticsDashboard;
