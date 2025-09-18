export interface LevelChunks {
  [levelKey: string]: string;
}

export interface TopicChunks {
  [topicKey: string]: LevelChunks;
}

export function cleanMainContent(mainContent: string): string {
  // Step 1: Replace \section lines with "Topic" followed by space and number with ***Topic***
  let cleanedContent = mainContent.replace(
    /^\\section.*\{(?:Topic)\s+\d+.*\}.*$/gm,
    "***Topic***"
  );

  // Step 2: Replace \section lines with "Level" followed by space and number with ***Level***
  cleanedContent = cleanedContent.replace(
    /^\\section.*\{(?:Level)\s+\d+.*\}.*$/gm,
    "***Level***"
  );

  // Step 3: Replace all remaining lines that start with \section with empty strings
  cleanedContent = cleanedContent.replace(/^\\section.*$/gm, "");

  return cleanedContent;
}

export function splitTopicIntoLevels(topicContent: string): LevelChunks {
  const levelChunks: LevelChunks = {};
  // Pattern to match Level sections with various formats:
  // \section{Level 1 ...} or \section*{Level 1 ...} or \section\*{Level 1 ...}
  const levelPattern = /\\section(?:\*|\\\*)?\{Level\s+(\d+)[^}]*\}/gi;
  const levelMatches = Array.from(topicContent.matchAll(levelPattern));

  if (levelMatches.length === 0) {
    levelChunks["0"] = topicContent.trim(); // Level 0
    return levelChunks;
  }

  for (let i = 0; i < levelMatches.length; i++) {
    const match = levelMatches[i];
    const levelNumber = match[1];
    const levelKey = `${levelNumber}`;
    const startIndex = match.index! + match[0].length;
    const endIndex =
      i < levelMatches.length - 1
        ? levelMatches[i + 1].index!
        : topicContent.length;
    levelChunks[levelKey] = topicContent.substring(startIndex, endIndex);
  }

  return levelChunks;
}

export function splitIntoTopicChunks(mainContent: string): TopicChunks {
  // Don't clean the content first - work with raw content
  const topicChunks: TopicChunks = {};

  // Pattern to match Topic sections with various formats:
  // \section{Topic 1 ...} or \section*{Topic 1 ...} or \section\*{Topic 1 ...}
  // The asterisk is optional and can be escaped (\*) or not (*)
  const topicPattern = /\\section(?:\*|\\\*)?\{Topic\s+(\d+)[^}]*\}/gi;
  const topicMatches = Array.from(mainContent.matchAll(topicPattern));

  // If no topics found, return empty
  if (topicMatches.length === 0) {
    return topicChunks;
  }

  // Split by each topic
  for (let i = 0; i < topicMatches.length; i++) {
    const match = topicMatches[i];
    const topicNumber = match[1];
    const topicKey = `Topic ${topicNumber}`;

    // Start from the position after the topic header
    const startIndex = match.index! + match[0].length;

    // End at the next topic or end of content
    const endIndex =
      i < topicMatches.length - 1
        ? topicMatches[i + 1].index!
        : mainContent.length;

    const topicContent = mainContent.substring(startIndex, endIndex).trim();
    topicChunks[topicKey] = splitTopicIntoLevels(topicContent);
  }

  console.log("=== PROCESSED MAIN CONTENT (TOPIC CHUNKS) ===");
  console.log(JSON.stringify(topicChunks, null, 2));
  console.log("=== END PROCESSED MAIN CONTENT ===");
  return topicChunks;
}
