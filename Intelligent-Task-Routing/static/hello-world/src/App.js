import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import WorkloadDashboard from "./WorkloadDashboard";

function App() {
  const [config, setConfig] = useState({
    selectedModel: "gpt-4",
    autoAssign: true,
    autoPriority: true,
    enableSuggestions: true,
    confidenceThreshold: 0.8,
  });
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("config");

  useEffect(() => {
    invoke("getConfig")
      .then((data) => {
        if (data) {
          setConfig(data);
        }
        setStatus("ready");
      })
      .catch((error) => {
        console.error("Failed to load config:", error);
        setStatus("ready");
      });
  }, []);

  const handleSave = async () => {
    setStatus("saving");
    try {
      await invoke("saveConfig", config);
      setMessage("✅ Configuration saved successfully!");
      setStatus("ready");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ Failed to save: " + error.message);
      setStatus("ready");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  if (status === "loading") {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h2>🤖 Loading AI Configuration...</h2>
      </div>
    );
  }

  const renderWorkloadDashboard = () => {
    return <WorkloadDashboard />;
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h1 style={{ color: "#0052cc", marginBottom: "20px" }}>
        🤖 AI Task Routing & Workload Management
      </h1>

      {/* Tab Navigation */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "2px", marginBottom: "20px" }}>
          <button
            onClick={() => setActiveTab("config")}
            style={{
              padding: "12px 24px",
              backgroundColor: activeTab === "config" ? "#0052cc" : "#f4f5f7",
              color: activeTab === "config" ? "white" : "#42526E",
              border: "none",
              borderRadius: "6px 6px 0 0",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeTab === "config" ? "bold" : "normal",
            }}
          >
            ⚙️ AI Configuration
          </button>
          <button
            onClick={() => setActiveTab("workload")}
            style={{
              padding: "12px 24px",
              backgroundColor: activeTab === "workload" ? "#0052cc" : "#f4f5f7",
              color: activeTab === "workload" ? "white" : "#42526E",
              border: "none",
              borderRadius: "6px 6px 0 0",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeTab === "workload" ? "bold" : "normal",
            }}
          >
            🔄 Workload Dashboard
          </button>
        </div>
      </div>

      {activeTab === "workload" && renderWorkloadDashboard()}

      {activeTab === "config" && (
        <div>
          <h2
            style={{ color: "#0052cc", marginBottom: "20px", marginTop: "0" }}
          >
            🤖 Intelligent Task Routing Configuration
          </h2>

          {message && (
            <div
              style={{
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "6px",
                backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
                color: message.includes("✅") ? "#155724" : "#721c24",
                border:
                  "1px solid " +
                  (message.includes("✅") ? "#c3e6cb" : "#f5c6cb"),
              }}
            >
              {message}
            </div>
          )}

          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginTop: "0", color: "#0052cc" }}>
              🧠 AI Model Selection
            </h3>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Choose AI Model:
              </label>
              <select
                value={config.selectedModel}
                onChange={(e) => handleChange("selectedModel", e.target.value)}
                style={{
                  padding: "10px",
                  border: "2px solid #ddd",
                  borderRadius: "6px",
                  width: "300px",
                  fontSize: "14px",
                }}
              >
                <option value="gpt-4">
                  GPT-4 (Best accuracy, higher cost)
                </option>
                <option value="gpt-3.5-turbo">
                  GPT-3.5 Turbo (Fast, cost-effective)
                </option>
                <option value="claude-3">Claude 3 (Coming soon)</option>
                <option value="gemini">Google Gemini (Coming soon)</option>
              </select>
              <div
                style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}
              >
                Currently selected: <strong>{config.selectedModel}</strong>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginTop: "0", color: "#0052cc" }}>
              ⚙️ Feature Configuration
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                }}
              >
                <input
                  type="checkbox"
                  checked={config.autoAssign}
                  onChange={(e) => handleChange("autoAssign", e.target.checked)}
                  style={{ marginRight: "12px", transform: "scale(1.2)" }}
                />
                <div>
                  <strong style={{ fontSize: "16px" }}>
                    🎯 Auto-Assign Issues
                  </strong>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    Automatically assign new issues to team members based on
                    expertise
                  </div>
                </div>
              </label>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                }}
              >
                <input
                  type="checkbox"
                  checked={config.autoPriority}
                  onChange={(e) =>
                    handleChange("autoPriority", e.target.checked)
                  }
                  style={{ marginRight: "12px", transform: "scale(1.2)" }}
                />
                <div>
                  <strong style={{ fontSize: "16px" }}>
                    🏷️ Auto-Set Priority
                  </strong>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    Automatically set priority based on AI analysis of urgency
                  </div>
                </div>
              </label>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                }}
              >
                <input
                  type="checkbox"
                  checked={config.enableSuggestions}
                  onChange={(e) =>
                    handleChange("enableSuggestions", e.target.checked)
                  }
                  style={{ marginRight: "12px", transform: "scale(1.2)" }}
                />
                <div>
                  <strong style={{ fontSize: "16px" }}>
                    💡 Show AI Suggestions
                  </strong>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    Display AI recommendations as comments on issues
                  </div>
                </div>
              </label>
            </div>

            <div
              style={{
                marginBottom: "15px",
                padding: "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                🎚️ Confidence Threshold:{" "}
                {Math.round(config.confidenceThreshold * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.1"
                value={config.confidenceThreshold}
                onChange={(e) =>
                  handleChange(
                    "confidenceThreshold",
                    parseFloat(e.target.value)
                  )
                }
                style={{ width: "100%", height: "8px", marginBottom: "8px" }}
              />
              <div style={{ fontSize: "14px", color: "#666" }}>
                Only apply suggestions above{" "}
                {Math.round(config.confidenceThreshold * 100)}% confidence
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginTop: "0", color: "#0052cc" }}>
              📊 Current Status
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#e7f3ff",
                  borderRadius: "6px",
                  textAlign: "center",
                }}
              >
                <strong>🧠 AI Model</strong>
                <br />
                <span style={{ color: "#0052cc", fontSize: "14px" }}>
                  {config.selectedModel}
                </span>
              </div>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: config.autoAssign ? "#d4edda" : "#f8d7da",
                  borderRadius: "6px",
                  textAlign: "center",
                }}
              >
                <strong>🎯 Auto-Assignment</strong>
                <br />
                <span
                  style={{
                    color: config.autoAssign ? "#155724" : "#721c24",
                    fontSize: "14px",
                  }}
                >
                  {config.autoAssign ? "✅ Enabled" : "❌ Disabled"}
                </span>
              </div>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: config.autoPriority ? "#d4edda" : "#f8d7da",
                  borderRadius: "6px",
                  textAlign: "center",
                }}
              >
                <strong>🏷️ Auto-Priority</strong>
                <br />
                <span
                  style={{
                    color: config.autoPriority ? "#155724" : "#721c24",
                    fontSize: "14px",
                  }}
                >
                  {config.autoPriority ? "✅ Enabled" : "❌ Disabled"}
                </span>
              </div>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: config.enableSuggestions
                    ? "#d4edda"
                    : "#f8d7da",
                  borderRadius: "6px",
                  textAlign: "center",
                }}
              >
                <strong>💡 Suggestions</strong>
                <br />
                <span
                  style={{
                    color: config.enableSuggestions ? "#155724" : "#721c24",
                    fontSize: "14px",
                  }}
                >
                  {config.enableSuggestions ? "✅ Enabled" : "❌ Disabled"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <button
              onClick={handleSave}
              disabled={status === "saving"}
              style={{
                padding: "14px 28px",
                backgroundColor: status === "saving" ? "#ccc" : "#0052cc",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: status === "saving" ? "not-allowed" : "pointer",
                marginRight: "10px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              {status === "saving" ? "💾 Saving..." : "💾 Save Configuration"}
            </button>

            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "14px 28px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              🔄 Reload
            </button>
          </div>

          <div
            style={{
              marginTop: "30px",
              padding: "20px",
              backgroundColor: "#e7f3ff",
              borderRadius: "8px",
              border: "2px solid #bee5eb",
            }}
          >
            <h4 style={{ marginTop: "0", color: "#0c5460" }}>
              💡 How AI Task Routing Works
            </h4>
            <ul style={{ marginBottom: "0", color: "#0c5460" }}>
              <li>
                <strong>Smart Assignment:</strong> AI analyzes content and
                suggests the best team member
              </li>
              <li>
                <strong>Priority Intelligence:</strong> Evaluates urgency and
                impact to set priority
              </li>
              <li>
                <strong>Suggestions:</strong> Provides recommendations when
                auto-actions are disabled
              </li>
              <li>
                <strong>Confidence Control:</strong> Only applies suggestions
                above your threshold
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
