import { MongoClient } from "mongodb";

export async function GET(request: Request) {
  const uri = process.env.MONGO_CONNECTION;
  if (!uri) {
    return new Response(
      JSON.stringify({ error: "Missing MONGO_CONNECTION env variable" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let client: MongoClient | undefined;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    const collection = db.collection("subjects");
    const records = await collection.find({}).toArray();
    await client.close();
    return new Response(JSON.stringify(records), {
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
