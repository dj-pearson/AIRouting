import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import Button from "@atlaskit/button";
import Spinner from "@atlaskit/spinner";
import Avatar from "@atlaskit/avatar";
import Badge from "@atlaskit/badge";
import Lozenge from "@atlaskit/lozenge";
import SectionMessage from "@atlaskit/section-message";
import { token } from "@atlaskit/tokens";
import styled from "styled-components";

const Container = styled.div`
  padding: ${token("space.200")};
  max-width: 400px;
`;

const SuggestionCard = styled.div`
  border: 1px solid ${token("color.border")};
  border-radius: ${token("border.radius")};
  padding: ${token("space.150")};
  margin-bottom: ${token("space.150")};
  background: ${token("color.background.neutral.subtle")};
`;

const SuggestionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${token("space.100")};
`;

const SuggestionContent = styled.div`
  margin-bottom: ${token("space.100")};
`;

const SuggestionActions = styled.div`
  display: flex;
  gap: ${token("space.100")};
  align-items: center;
`;

const ConfidenceScore = styled.div`
  font-size: 12px;
  color: ${token("color.text.subtle")};
  margin-top: ${token("space.050")};
`;

const ReasonText = styled.div`
  font-size: 14px;
  color: ${token("color.text")};
  margin-top: ${token("space.050")};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${token("space.400")};
`;

function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState({});

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await invoke("aiSuggestionsResolver", {});
      setData(result);
    } catch (err) {
      console.error("Error loading suggestions:", err);
      setError(err.message || "Failed to load AI suggestions");
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = async (suggestionType, suggestion) => {
    try {
      setApplying((prev) => ({ ...prev, [suggestionType]: true }));

      const result = await invoke("applySuggestion", {
        issueKey: data.issueKey,
        suggestionType,
        suggestion,
      });

      if (result.success) {
        // Reload suggestions to reflect changes
        await loadSuggestions();

        // Show success feedback
        console.log(`Applied ${suggestionType} suggestion successfully`);
      } else {
        throw new Error(result.error || "Failed to apply suggestion");
      }
    } catch (err) {
      console.error("Error applying suggestion:", err);
      setError(err.message);
    } finally {
      setApplying((prev) => ({ ...prev, [suggestionType]: false }));
    }
  };

  const provideFeedback = async (suggestionType, feedback, suggestion) => {
    try {
      await invoke("provideFeedback", {
        issueKey: data.issueKey,
        suggestionType,
        feedback,
        suggestion,
      });

      console.log(`Feedback provided: ${feedback}`);
    } catch (err) {
      console.error("Error providing feedback:", err);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "success";
    if (confidence >= 0.6) return "moved";
    return "default";
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "highest":
        return "removed";
      case "high":
        return "moved";
      case "medium":
        return "inprogress";
      case "low":
        return "new";
      case "lowest":
        return "default";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <Spinner size="medium" />
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <SectionMessage appearance="error">
          <p>{error}</p>
          <Button appearance="link" onClick={loadSuggestions}>
            Try Again
          </Button>
        </SectionMessage>
      </Container>
    );
  }

  if (!data?.enabled) {
    return (
      <Container>
        <SectionMessage appearance="info">
          <p>{data?.message || "AI routing is currently disabled"}</p>
        </SectionMessage>
      </Container>
    );
  }

  if (data?.hasAssignee && !data?.suggestions?.assignee) {
    return (
      <Container>
        <SectionMessage appearance="info">
          <p>Issue is already assigned to {data.assignee}</p>
        </SectionMessage>
      </Container>
    );
  }

  const { suggestions, config } = data;

  return (
    <Container>
      <div style={{ marginBottom: token("space.200") }}>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
          🤖 AI Suggestions
        </h3>
        <div
          style={{
            fontSize: "12px",
            color: token("color.text.subtle"),
            marginTop: token("space.050"),
          }}
        >
          Powered by {config?.selectedModel?.replace("-", " ").toUpperCase()}
        </div>
      </div>

      {suggestions?.assignee && (
        <SuggestionCard>
          <SuggestionHeader>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: token("space.100"),
              }}
            >
              <strong>👤 Assignee</strong>
              <Badge
                appearance={getConfidenceColor(suggestions.assignee.confidence)}
              >
                {Math.round(suggestions.assignee.confidence * 100)}%
              </Badge>
            </div>
          </SuggestionHeader>

          <SuggestionContent>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: token("space.100"),
              }}
            >
              <Avatar size="small" />
              <div>
                <div style={{ fontWeight: 500 }}>
                  {suggestions.assignee.displayName}
                </div>
                <ConfidenceScore>
                  Confidence:{" "}
                  {Math.round(suggestions.assignee.confidence * 100)}%
                </ConfidenceScore>
              </div>
            </div>
            <ReasonText>💡 {suggestions.assignee.reason}</ReasonText>
          </SuggestionContent>

          <SuggestionActions>
            {!config?.autoAssign && (
              <Button
                appearance="primary"
                onClick={() =>
                  applySuggestion("assignee", suggestions.assignee)
                }
                isLoading={applying.assignee}
                size="small"
              >
                Assign
              </Button>
            )}

            <Button
              appearance="subtle"
              onClick={() =>
                provideFeedback("assignee", "positive", suggestions.assignee)
              }
              size="small"
            >
              👍
            </Button>

            <Button
              appearance="subtle"
              onClick={() =>
                provideFeedback("assignee", "negative", suggestions.assignee)
              }
              size="small"
            >
              👎
            </Button>
          </SuggestionActions>
        </SuggestionCard>
      )}

      {suggestions?.priority && (
        <SuggestionCard>
          <SuggestionHeader>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: token("space.100"),
              }}
            >
              <strong>🎯 Priority</strong>
              <Badge
                appearance={getConfidenceColor(suggestions.priority.confidence)}
              >
                {Math.round(suggestions.priority.confidence * 100)}%
              </Badge>
            </div>
          </SuggestionHeader>

          <SuggestionContent>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: token("space.100"),
              }}
            >
              <Lozenge appearance={getPriorityColor(suggestions.priority.name)}>
                {suggestions.priority.name}
              </Lozenge>
              <ConfidenceScore>
                Confidence: {Math.round(suggestions.priority.confidence * 100)}%
              </ConfidenceScore>
            </div>
            <ReasonText>💡 {suggestions.priority.reason}</ReasonText>
          </SuggestionContent>

          <SuggestionActions>
            {!config?.autoSetPriority && (
              <Button
                appearance="primary"
                onClick={() =>
                  applySuggestion("priority", suggestions.priority)
                }
                isLoading={applying.priority}
                size="small"
              >
                Set Priority
              </Button>
            )}

            <Button
              appearance="subtle"
              onClick={() =>
                provideFeedback("priority", "positive", suggestions.priority)
              }
              size="small"
            >
              👍
            </Button>

            <Button
              appearance="subtle"
              onClick={() =>
                provideFeedback("priority", "negative", suggestions.priority)
              }
              size="small"
            >
              👎
            </Button>
          </SuggestionActions>
        </SuggestionCard>
      )}

      {!suggestions?.assignee && !suggestions?.priority && (
        <SectionMessage appearance="info">
          <p>No AI suggestions available for this issue at the moment.</p>
          <Button appearance="link" onClick={loadSuggestions}>
            Refresh
          </Button>
        </SectionMessage>
      )}

      {(config?.autoAssign || config?.autoSetPriority) && (
        <div
          style={{
            marginTop: token("space.200"),
            padding: token("space.100"),
            background: token("color.background.neutral.subtle"),
            borderRadius: token("border.radius"),
            fontSize: "12px",
            color: token("color.text.subtle"),
          }}
        >
          ℹ️ Auto-assignment is {config.autoAssign ? "enabled" : "disabled"}.
          Auto-priority is {config.autoSetPriority ? "enabled" : "disabled"}.
        </div>
      )}

      {data?.recentActivity?.length > 0 && (
        <div style={{ marginTop: token("space.200") }}>
          <h4
            style={{
              fontSize: "14px",
              fontWeight: 600,
              margin: `${token("space.100")} 0`,
            }}
          >
            📊 Recent Activity
          </h4>
          {data.recentActivity.slice(0, 3).map((activity, index) => (
            <div
              key={index}
              style={{
                fontSize: "12px",
                color: token("color.text.subtle"),
                marginBottom: token("space.050"),
              }}
            >
              {new Date(activity.timestamp).toLocaleString()}:
              {activity.suggestions?.assignee &&
                ` Suggested ${activity.suggestions.assignee.displayName}`}
              {activity.suggestions?.priority &&
                ` • Priority: ${activity.suggestions.priority.name}`}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

export default App;
