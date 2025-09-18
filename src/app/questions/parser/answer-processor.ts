export interface AnswerMap {
  [questionNum: string]: string;
}

export interface TopicAnswers {
  [topicKey: string]: AnswerMap;
}

function extractAnswersAsMap(content: string): AnswerMap {
  const answerMap: AnswerMap = {};

  // First, clean up LaTeX formatting like $\mathbf{3}$ to just "3"
  const cleanedContent = content.replace(/\$\\mathbf\{(\d+)\}\$/g, '$1');

  // Pattern to match various answer formats:
  // "01 & (a)" or "01 | (b)" or "53 (123)" or tabular format "1 & (a)"
  // Also matches patterns without separators like "1 (a)"
  const answerPattern = /(\d+)\s*[&|\-]?\s*\(([^)]+)\)/gi;

  let match;
  while ((match = answerPattern.exec(cleanedContent)) !== null) {
    const questionNum = match[1].padStart(2, '0');
    const answer = match[2];
    answerMap[questionNum] = answer;
  }

  return answerMap;
}

export function splitAnswerKeyByTopics(answerKey: string): TopicAnswers {
  const topicAnswers: TopicAnswers = {};

  // Pattern to match Topic sections in answer key
  // Handles \section*{, \section\*{, and \section{
  const topicPattern = /\\section(?:\*|\\\*)?\{Topic\s+(\d+)[^}]*\}/gi;
  const topicMatches = Array.from(answerKey.matchAll(topicPattern));

  // If no topic sections found, extract answers from entire content
  if (topicMatches.length === 0) {
    topicAnswers["All Topics"] = extractAnswersAsMap(answerKey);
    console.log('=== PROCESSED ANSWER KEY ===');
    console.log(JSON.stringify(topicAnswers, null, 2));
    console.log('=== END PROCESSED ANSWER KEY ===');
    return topicAnswers;
  }

  // Split by each topic and extract answers
  for (let i = 0; i < topicMatches.length; i++) {
    const match = topicMatches[i];
    const topicNumber = match[1];
    const topicKey = `Topic ${topicNumber}`;

    const startIndex = match.index! + match[0].length;
    const endIndex = i < topicMatches.length - 1
      ? topicMatches[i + 1].index!
      : answerKey.length;

    const topicContent = answerKey.substring(startIndex, endIndex).trim();
    topicAnswers[topicKey] = extractAnswersAsMap(topicContent);
  }

  console.log('=== PROCESSED ANSWER KEY ===');
  console.log(JSON.stringify(topicAnswers, null, 2));
  console.log('=== END PROCESSED ANSWER KEY ===');
  return topicAnswers;
}

