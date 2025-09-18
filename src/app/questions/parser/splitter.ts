import { cleanMainContent, splitIntoTopicChunks } from "./content-processor";
import { splitAnswerKeyByTopics } from "./answer-processor";

export interface SplitContent {
  mainContent: string;
  answerKey: string;
}

export interface MappedQuestion {
  questionNumber: string;
  questionContent: string;
  answer: string;
  topic: string;
  level: string;
}

export interface TopicLevelMap {
  [topic: string]: MappedQuestion[];
}

export interface ProcessingResult {
  questions: TopicLevelMap;
  warnings: string[];
  summary?: string[];
}

export function splitByKeyIndex(markdown: string): SplitContent {
  // Handle \section*{Key Index}, \section\*{Key Index}, or \section{Key Index}
  let cleanedContent = markdown.replace(
    /^.*\\section.*\{-\s*Key\s+Index\}.*$/gm,
    "***Answer Key***"
  );
  let splittedContent = cleanedContent.split("***Answer Key***");
  return {
    mainContent: splittedContent?.[0],
    answerKey: splittedContent?.[1] || "",
  };
}

// Array of PYQ (Previous Year Question) patterns
const PYQ_PATTERNS = [
  "AIEEE",
  "JEE",
  "20", // For years like 2020, 2021, 2022, 2023, 2024
];

function isPYQBracket(text: string): boolean {
  // Check if the text inside brackets matches any PYQ pattern
  return PYQ_PATTERNS.some((pattern) => text.startsWith(pattern));
}

function extractQuestionsFromContent(
  content: string
): Array<{ number: string; content: string }> {
  const questions: Array<{ number: string; content: string }> = [];

  // Split by question numbers at the start of lines
  const parts = content.split(/^(?=\d{2}\s+)/gm);

  for (const part of parts) {
    const trimmedPart = part.trim();
    if (trimmedPart) {
      // Extract question number and content
      const match = trimmedPart.match(/^(\d{2})\s+([\s\S]+)/);
      if (match) {
        let content = match[2].trim();

        // Only wrap brackets with ** if they contain PYQ info
        content = content.replace(
          /\[([^\]]+)\]/g,
          (fullMatch, bracketContent) => {
            if (isPYQBracket(bracketContent)) {
              return `**[${bracketContent}]**`;
            }
            return fullMatch; // Return unchanged if not PYQ
          }
        );

        // Wrap options in ** markers
        // Convert (a), (b), (c), (d) to **a.**, **b.**, **c.**, **d.**
        content = content.replace(/\(([a-d])\)/g, "**$1.**");

        questions.push({
          number: match[1],
          content: content,
        });
      }
    }
  }

  return questions;
}

function mapTopicLevel(
  topic: string,
  level: string,
  content: string,
  topicAnswers: any
): MappedQuestion[] {
  const questions = extractQuestionsFromContent(content);

  return questions.map((question) => ({
    questionNumber: question.number,
    questionContent: cleanMainContent(question.content),
    answer: topicAnswers[question.number] || "Not found",
    topic: topic,
    level: level,
  }));
}

function processContent(markdown: string) {
  const splitContent = splitByKeyIndex(markdown);
  const topicChunks = splitIntoTopicChunks(splitContent.mainContent);
  const answersByTopic = splitAnswerKeyByTopics(splitContent.answerKey);

  return { topicChunks, answersByTopic };
}

function checkMissingQuestions(
  topic: string,
  questions: MappedQuestion[]
): string[] {
  const warnings: string[] = [];

  if (questions.length === 0) {
    warnings.push(`${topic}: No questions found`);
    return warnings;
  }

  // Sort questions by number
  const sortedQuestions = [...questions].sort(
    (a, b) => parseInt(a.questionNumber) - parseInt(b.questionNumber)
  );

  const firstNum = parseInt(sortedQuestions[0].questionNumber);
  const lastNum = parseInt(
    sortedQuestions[sortedQuestions.length - 1].questionNumber
  );

  // Create a set of existing question numbers
  const existingNumbers = new Set(
    questions.map((q) => parseInt(q.questionNumber))
  );

  // Check for missing numbers in the range
  const missingNumbers: number[] = [];
  for (let i = firstNum; i <= lastNum; i++) {
    if (!existingNumbers.has(i)) {
      missingNumbers.push(i);
    }
  }

  if (missingNumbers.length > 0) {
    const missingStr = missingNumbers
      .map((n) => n.toString().padStart(2, "0"))
      .join(", ");
    warnings.push(
      `${topic}: Missing questions: ${missingStr} (Range: ${firstNum
        .toString()
        .padStart(2, "0")}-${lastNum.toString().padStart(2, "0")})`
    );
  }

  // Check for answers marked as "Not found"
  const noAnswers = questions.filter((q) => q.answer === "Not found");
  if (noAnswers.length > 0) {
    const noAnswerNums = noAnswers.map((q) => q.questionNumber).join(", ");
    warnings.push(`${topic}: Missing answers for questions: ${noAnswerNums}`);
  }

  return warnings;
}

export function mapQuestionsAndAnswers(markdown: string): ProcessingResult {
  const { topicChunks, answersByTopic } = processContent(markdown);
  const mappedQuestions: TopicLevelMap = {};
  const allWarnings: string[] = [];

  Object.entries(topicChunks).forEach(([topic, levels]) => {
    mappedQuestions[topic] = [];
    const topicAnswers = answersByTopic[topic] || {};

    // Flatten all levels into a single array per topic
    Object.entries(levels).forEach(([level, content]) => {
      const levelQuestions = mapTopicLevel(topic, level, content, topicAnswers);
      mappedQuestions[topic].push(...levelQuestions);
    });
  });

  // Check for missing questions in each topic
  Object.entries(mappedQuestions).forEach(([topic, questions]) => {
    const warnings = checkMissingQuestions(topic, questions);
    allWarnings.push(...warnings);
  });

  // Build summary: topics, levels, and question ranges (topic and levelwise)
  const summary: string[] = [];
  summary.push(`Topics: ${Object.keys(mappedQuestions).join(", ")}`);
  Object.entries(mappedQuestions).forEach(([topic, questions]) => {
    // Get levels for this topic
    const levels = Array.from(new Set(questions.map((q) => q.level)));
    summary.push(`${topic} Levels: ${levels.join(", ")}`);
    // For each level, get question range
    levels.forEach((level) => {
      const levelQuestions = questions.filter((q) => q.level === level);
      if (levelQuestions.length > 0) {
        const nums = levelQuestions
          .map((q) => parseInt(q.questionNumber))
          .sort((a, b) => a - b);
        const firstNum = nums[0].toString().padStart(2, "0");
        const lastNum = nums[nums.length - 1].toString().padStart(2, "0");
        summary.push(
          `${topic} - Level ${level} Question Range: ${firstNum}-${lastNum}`
        );
      } else {
        summary.push(`${topic} - Level ${level} Question Range: None`);
      }
    });
  });

  console.log({ mappedQuestions, warnings: allWarnings, summary });

  return {
    questions: mappedQuestions,
    warnings: allWarnings,
    summary,
  };
}
