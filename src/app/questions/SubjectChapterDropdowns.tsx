"use client";

import { useEffect, useState } from "react";
import { Select, Spin } from "antd";

interface Chapter {
  chapter: string;
  order: number;
  description: string;
  topics: { topic: string; order: number; description: string }[];
}
interface Subject {
  subject: string;
  description: string;
  chapters: Chapter[];
}

interface TopicSelection {
  [key: string]: {
    topic: string;
    chapter: string;
    subject: string;
  };
}

export function SubjectChapterDropdowns({
  onChapterSelect,
}: {
  onChapterSelect: (selection: TopicSelection) => void;
}) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
  const [selectedChapter, setSelectedChapter] = useState<string | undefined>();

  useEffect(() => {
    async function fetchSubjects() {
      setLoading(true);
      try {
        const res = await fetch("/api/subjects");
        const data = await res.json();
        // Ensure data is an array, or extract if nested
        const subjectsArray = Array.isArray(data) ? data : data.subjects || [];
        setSubjects(subjectsArray);
      } catch (err) {
        setSubjects([]);
      }
      setLoading(false);
    }
    fetchSubjects();
  }, []);

  const chapters = (
    subjects.find((s) => s.subject === selectedSubject)?.chapters || []
  )
    .slice()
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (selectedSubject && selectedChapter) {
      const chapterObj = chapters.find((c) => c.chapter === selectedChapter);
      if (chapterObj) {
        const selection: TopicSelection = {};
        chapterObj.topics.forEach((topic) => {
          selection[`Topic ${topic.order}`] = {
            topic: topic.topic,
            chapter: chapterObj.chapter,
            subject: selectedSubject,
          };
        });
        onChapterSelect(selection);
      }
    }
  }, [selectedChapter, selectedSubject]);

  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
      {loading ? (
        <Spin />
      ) : (
        <>
          <Select
            style={{ minWidth: 180 }}
            placeholder="Select Subject"
            value={selectedSubject}
            onChange={setSelectedSubject}
            options={subjects.map((s) => ({
              label: s.subject,
              value: s.subject,
            }))}
          />
          <Select
            style={{ minWidth: 280 }}
            placeholder="Select Chapter"
            value={selectedChapter}
            onChange={setSelectedChapter}
            options={chapters.map((c) => ({
              label: `${c.order}. ${c.chapter}`,
              value: c.chapter,
            }))}
            disabled={!selectedSubject}
          />
        </>
      )}
    </div>
  );
}
