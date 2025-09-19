"use client";

import { Button } from "antd";
import { useState } from "react";
import { SubjectChapterDropdowns } from "../SubjectChapterDropdowns";

export function QuestionListContainer() {
  const [selectedChapterState, setSelectedChapterState] = useState<any>(null);

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
      console.log("Questions Response:", data);
      // TODO: Display questions in UI
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
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
    </div>
  );
}
