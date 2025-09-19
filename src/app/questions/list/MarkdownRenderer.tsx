import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Row,
  Col,
  Divider,
  Typography,
  Empty,
  message,
} from "antd";
import { QuestionPreview } from "../question-preview";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface MarkdownRendererProps {
  questionsByTopic: Record<string, any[]>;
  onQuestionsSaved?: () => void;
}

interface EditedQuestionData {
  topic: string;
  content: string;
  level: string;
  answer: string;
}

const Topics: Record<
  string,
  { topic: string; chapter: string; subject: string }
> = {};
export function MarkdownRenderer({
  questionsByTopic,
  onQuestionsSaved,
}: MarkdownRendererProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [editedQuestions, setEditedQuestions] = useState<
    Record<string, EditedQuestionData>
  >({});

  // Initialize editedQuestions with content when content changes
  useEffect(() => {
    if (questionsByTopic) {
      const initialContent: Record<string, EditedQuestionData> = {};
      Object.entries(questionsByTopic).forEach(([topicKey, questions]) => {
        questions.forEach((question: any) => {
          const questionId = `${topicKey}-${question.srNo}`;
          initialContent[questionId] = {
            ...question,
          };
        });
      });
      setEditedQuestions(initialContent);
    }
  }, [questionsByTopic]);

  const handleQuestionEdit = (
    questionId: string,
    field: keyof EditedQuestionData,
    value: string
  ) => {
    setEditedQuestions((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
      },
    }));
  };

  const getQuestionId = (topic: string, questionNumber: string) => {
    return `${topic}-${questionNumber}`;
  };

  if (!questionsByTopic || Object.keys(questionsByTopic).length === 0) {
    return (
      <Card
        title="Processed Content"
        style={{ marginTop: "16px", minHeight: "200px" }}
      >
        <Empty description="Parse markdown content to see questions here" />
      </Card>
    );
  }

  const handleSubmit = () => {
    // Flatten editedQuestions and map topic names using selectedChapterState (topics prop)
    const flatQuestions = Object.entries(editedQuestions).map(([id, data]) => {
      // id format: topic-questionNumber
      // Use Topics to map topic object
      const newData = {
        ...data,
      };
      return newData;
    });
    console.log("Edited Questions (flattened):", flatQuestions);

    // Call PUT API to save questions
    fetch("/api/questions", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flatQuestions),
    })
      .then(async (response) => {
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error?.error || "Failed to save questions");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Questions saved:", data);
        messageApi.success("Questions saved successfully!");
        setEditedQuestions({});
        if (onQuestionsSaved) onQuestionsSaved();
      })
      .catch((err) => {
        console.error("Error saving questions:", err);
        messageApi.error("Failed to save questions: " + err.message);
      });
  };

  if (Object.keys(editedQuestions).length === 0) {
    return (
      <Card
        title="Processed Content"
        style={{ marginTop: "16px", minHeight: "200px" }}
      >
        <Empty description="No questions available to display." />
      </Card>
    );
  }

  return (
    <Card title="Processed Content" style={{ marginTop: "16px" }}>
      {contextHolder}
      {Object.entries(questionsByTopic).map(([topicKey, questions]) => (
        <div key={topicKey} style={{ marginBottom: "32px" }}>
          <Title level={4}>
            {topicKey}- {questions[0].topic.topic}
          </Title>
          <Divider />
          {questions.map((question: any) => {
            const questionId = getQuestionId(topicKey, question.srNo);
            const questionData = editedQuestions[questionId];
            return (
              <div key={questionId} style={{ marginBottom: "24px" }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: "12px" }}>
                      <Row gutter={8} align="middle">
                        <Col>
                          <Text strong>Question {question.srNo}</Text>
                        </Col>
                        <Col>
                          <Input
                            placeholder="Level"
                            value={questionData?.level}
                            onChange={(e) =>
                              handleQuestionEdit(
                                questionId,
                                "level",
                                e.target.value
                              )
                            }
                            style={{ width: "100px" }}
                            size="small"
                            prefix="Level:"
                          />
                        </Col>
                        <Col>
                          <Input
                            placeholder="Answer"
                            value={questionData?.answer}
                            onChange={(e) =>
                              handleQuestionEdit(
                                questionId,
                                "answer",
                                e.target.value
                              )
                            }
                            style={{ width: "100px" }}
                            size="small"
                            prefix="Ans:"
                          />
                        </Col>
                      </Row>
                    </div>
                    <TextArea
                      value={questionData.content}
                      onChange={(e) =>
                        handleQuestionEdit(
                          questionId,
                          "content",
                          e.target.value
                        )
                      }
                      autoSize={{ minRows: 10, maxRows: 24 }}
                      style={{ fontFamily: "monospace", fontSize: "13px" }}
                    />
                  </Col>
                  <Col span={12}>
                    <div
                      style={{
                        padding: "12px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px",
                        minHeight: "200px",
                        whiteSpace: "pre-wrap",
                        fontFamily: "monospace",
                        fontSize: "13px",
                        marginTop: "36px",
                      }}
                    >
                      <div
                        style={{
                          marginBottom: "8px",
                          fontSize: "16px",
                          color: "#666",
                        }}
                      >
                        <strong>Level:</strong>{" "}
                        <strong style={{ fontSize: "18px", color: "#000" }}>
                          {questionData.level} |{" "}
                        </strong>
                        <strong>Answer:</strong>{" "}
                        <strong style={{ fontSize: "18px", color: "#000" }}>
                          {questionData.answer}
                        </strong>
                      </div>
                      <QuestionPreview content={questionData.content} />
                    </div>
                  </Col>
                </Row>
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ textAlign: "right", marginTop: "24px" }}>
        <button
          type="button"
          style={{
            background: "#1890ff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "8px 24px",
            fontSize: "16px",
            cursor: "pointer",
          }}
          onClick={handleSubmit}
        >
          Update All
        </button>
      </div>
    </Card>
  );
}
