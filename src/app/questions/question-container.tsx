"use client";

import { List } from "@refinedev/antd";
import { Alert, Button, Input, message } from "antd";
import { useState } from "react";
import { mapQuestionsAndAnswers, TopicLevelMap } from "./parser/splitter";
import { MarkdownRenderer } from "./markdown-renderer";
import { formatTopicsFromJson } from "./parser/format-topics-from-json";
import { SubjectChapterDropdowns } from "./SubjectChapterDropdowns";

const { TextArea } = Input;

export function QuestionContainer() {
  const handleClear = () => {
    setText("");
    setWarnings([]);
    setSummary([]);
    setProcessedContent(null);
    message.info("Cleared");
  };
  const [text, setText] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [summary, setSummary] = useState<string[]>([]);
  const [processedContent, setProcessedContent] =
    useState<TopicLevelMap | null>(null);
  const [selectedChapterState, setSelectedChapterState] = useState<any>(null);

  const handleSubmit = () => {
    const result = mapQuestionsAndAnswers(text);

    // Set warnings for display
    setWarnings(result.warnings);

    // Set summary for display
    setSummary(result.summary || []);

    // Set processed content for display
    setProcessedContent(result.questions);

    if (result.warnings.length > 0) {
      message.warning(
        `Parsed with ${result.warnings.length} warning(s). Check the warnings section.`
      );
    } else {
      message.success("Parsed successfully! No issues found.");
    }

    console.log("Questions:", result.questions);
    console.log("Warnings:", result.warnings);
    console.log("Summary:", result.summary);
  };

  const handleGoToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormatTopics = async () => {
    await formatTopicsFromJson();
  };

  return (
    <List>
      <div style={{ padding: "24px", position: "relative" }}>
        {/* Dropdowns for Subject and Chapter selection */}
        <SubjectChapterDropdowns
          onChapterSelect={(selection) => {
            setSelectedChapterState(selection);
            // You can also log or use this state elsewhere as needed
            console.log("Selected Chapter State:", selection);
          }}
        />

        <div style={{ marginBottom: "16px", display: "flex", gap: "8px" }}>
          <Button type="primary" onClick={handleSubmit}>
            Parse Markdown
          </Button>
          <Button onClick={handleClear}>Clear</Button>
          {/* <Button onClick={handleFormatTopics}>Format Topics</Button> */}
        </div>

        {/* Display summary if any */}
        {summary.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <Alert
              type="info"
              message="Summary"
              description={
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {summary.map((item, index) => (
                    <li key={index} style={{ marginBottom: "4px" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              }
              showIcon
            />
          </div>
        )}

        {/* Display warnings if any */}
        {warnings.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <Alert
              type="warning"
              message="Processing Warnings"
              description={
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {warnings.map((warning, index) => (
                    <li key={index} style={{ marginBottom: "4px" }}>
                      {warning}
                    </li>
                  ))}
                </ul>
              }
              closable
              onClose={() => setWarnings([])}
              showIcon
            />
          </div>
        )}

        <TextArea
          rows={30}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your markdown content here..."
          style={{ fontSize: "14px", fontFamily: "monospace" }}
        />

        {/* Markdown Renderer Component */}
        <MarkdownRenderer
          content={processedContent}
          topics={selectedChapterState}
        />

        {/* Go To Top Button */}
        <Button
          type="default"
          style={{
            position: "fixed",
            right: "32px",
            bottom: "32px",
            zIndex: 1000,
            background: "#e6f7ff",
            color: "#1890ff",
            border: "1px solid #91d5ff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          onClick={handleGoToTop}
        >
          Go To Top
        </Button>
      </div>
    </List>
  );
}
