import React, { useState, useEffect } from "react";
import { Card, Input, Row, Col, Divider, Typography, Empty } from "antd";
import type { TopicLevelMap, MappedQuestion } from "./parser/splitter";
import { QuestionPreview } from "./question-preview";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface MarkdownRendererProps {
  content?: TopicLevelMap | null;
  topics?: Record<string, { topic: string; chapter: string; subject: string }>;
}

interface EditedQuestionData {
  questionContent?: string;
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
  content,
  topics = Topics,
}: MarkdownRendererProps) {
  const [editedQuestions, setEditedQuestions] = useState<
    Record<string, EditedQuestionData>
  >({});

  // Initialize editedQuestions with content when content changes
  useEffect(() => {
    if (content) {
      const initialContent: Record<string, EditedQuestionData> = {};
      Object.entries(content).forEach(([topic, questions]) => {
        questions.forEach((question: MappedQuestion) => {
          const questionId = `${topic}-${question.questionNumber}`;
          initialContent[questionId] = {
            ...question,
            content: question.questionContent,
            level: question.level,
            answer: question.answer,
          };
        });
      });
      setEditedQuestions(initialContent);
    }
  }, [content]);

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

  if (!content || Object.keys(content).length === 0) {
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
      // Use topics prop to map topic object

      const newData = {
        ...data,
        topic: topics[data.topic],
      };
      delete newData.questionContent;
      return newData;
    });
    console.log("Edited Questions (flattened):", flatQuestions);
  };

  return (
    <Card title="Processed Content" style={{ marginTop: "16px" }}>
      {Object.entries(content).map(([topic, questions]) => (
        <div key={topic} style={{ marginBottom: "32px" }}>
          <Title level={4}>{topic}</Title>
          <Divider />

          {questions.map((question: MappedQuestion) => {
            const questionId = getQuestionId(topic, question.questionNumber);
            const questionData = editedQuestions[questionId] || {
              content: "",
              level: "",
              answer: "",
            };

            return (
              <div key={questionId} style={{ marginBottom: "24px" }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: "12px" }}>
                      <Row gutter={8} align="middle">
                        <Col>
                          <Text strong>Question {question.questionNumber}</Text>
                        </Col>
                        <Col>
                          <Input
                            placeholder="Level"
                            value={questionData.level}
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
                            value={questionData.answer}
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
          Submit
        </button>
      </div>
    </Card>
  );
}
