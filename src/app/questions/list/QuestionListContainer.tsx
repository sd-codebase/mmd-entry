"use client";

import { Button } from "antd";
import { useState } from "react";
import { SubjectChapterDropdowns } from "../SubjectChapterDropdowns";
import { MarkdownRenderer } from "./MarkdownRenderer";

export function QuestionListContainer() {
  const [selectedChapterState, setSelectedChapterState] = useState<any>(null);
  const [questionsByTopic, setQuestionsByTopic] = useState<
    Record<string, any[]>
  >({});

  const handleSubmit = async () => {
    if (!selectedChapterState) return;
    try {
      const res = await fetch("/api/questions/chapter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedChapterState),
      });
      const data = await res.json();
      setQuestionsByTopic(data);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  // Reset state and show message when questions are saved
  const handleQuestionsSaved = () => {
    setSelectedChapterState(null);
    setQuestionsByTopic({});
    // Optionally show a message (if using antd message):
    // message.success("Questions saved and list cleared.");
  };

  return (
    <div>
      <h2>Questions List</h2>
      <SubjectChapterDropdowns
        onChapterSelect={(selection) => {
          setSelectedChapterState(selection);
        }}
      />
      <div style={{ marginTop: "16px" }}>
        <Button
          type="primary"
          onClick={handleSubmit}
          disabled={!selectedChapterState}
        >
          Show Questions
        </Button>
      </div>
      {Object.keys(questionsByTopic).length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <MarkdownRenderer
            questionsByTopic={questionsByTopic}
            onQuestionsSaved={handleQuestionsSaved}
          />
        </div>
      )}
    </div>
  );
}
