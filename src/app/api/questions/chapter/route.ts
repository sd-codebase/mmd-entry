import { getMongoClient } from "@app/api/utils/mongo";

const COLLECTION_NAME = "questions";

export async function POST(request: Request) {
  let client;
  try {
    client = await getMongoClient();
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    const body = await request.json();
    // body is an object: { "Topic 1": { topic, chapter, subject }, ... }
    const response: Record<string, any[]> = {};
    for (const [topicKey, filter] of Object.entries(body)) {
      const { topic, chapter, subject } = filter as {
        topic: string;
        chapter: string;
        subject: string;
      };
      // Find questions matching topic, chapter, subject in nested 'topic' field
      const questions = await collection
        .find({
          "topic.topic": topic,
          "topic.chapter": chapter,
          "topic.subject": subject,
        })
        .toArray();
      response[topicKey] = questions;
    }
    await client.close();
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (client) await client.close();
    let errorMsg = "Unknown error";
    if (error instanceof Error) {
      errorMsg = error.message;
    }
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
