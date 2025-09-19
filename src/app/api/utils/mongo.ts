import { MongoClient } from "mongodb";

export async function getMongoClient() {
  const uri = process.env.MONGO_CONNECTION;
  if (!uri) throw new Error("Missing MONGO_CONNECTION env variable");
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}
