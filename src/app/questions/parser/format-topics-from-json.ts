// subject => [{id,name,description}]
// chapter => [{id,name,description,order_num,subject_id}]
// topic => [{id,name,description,chapter_id,order_num}]

// output
// [{subject: "",description: "", chapters: [{chapter: "",order: 1,description: "", topics: [{topic: "", order: 3,description: ""}]}]}]

export async function formatTopicsFromJson(): Promise<Record<string, any>[]> {
  // Fetch data from public folder
  const [subjectsRes, chaptersRes, topicsRes] = await Promise.all([
    fetch("/data/subjects_rows.json"),
    fetch("/data/chapters_rows.json"),
    fetch("/data/topics_rows.json"),
  ]);

  const [subjects, chapters, topics] = await Promise.all([
    subjectsRes.json(),
    chaptersRes.json(),
    topicsRes.json(),
  ]);

  const formattedOutput = subjects.map((subject: any) => {
    const subjectChapters = chapters.filter(
      (chapter: any) => chapter.subject_id === subject.id
    );

    const formattedChapters = subjectChapters.map((chapter: any) => {
      const chapterTopics = topics.filter(
        (topic: any) => topic.chapter_id === chapter.id
      );

      return {
        chapter: chapter.name,
        order: chapter.order_num,
        description: chapter.description,
        topics: chapterTopics.map((topic: any) => ({
          topic: topic.name,
          order: topic.order_num,
          description: topic.description,
        })),
      };
    });

    return {
      subject: subject.name,
      description: subject.description,
      chapters: formattedChapters,
    };
  });

  console.log({ formattedOutput });

  return formattedOutput;
}
