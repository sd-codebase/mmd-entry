import { MongoClient } from "mongodb";

const COLLECTION_NAME = "questions";

async function getMongoClient() {
  const uri = process.env.MONGO_CONNECTION;
  if (!uri) throw new Error("Missing MONGO_CONNECTION env variable");
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function GET(request: Request) {
  let client;
  try {
    client = await getMongoClient();
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
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

export async function POST(request: Request) {
  let client;
  try {
    client = await getMongoClient();
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    const body = await request.json();
    if (Array.isArray(body)) {
      // Bulk create
      const result = await collection.insertMany(body);
      await client.close();
      return new Response(
        JSON.stringify({ success: true, insertedCount: result.insertedCount }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Single create
      const result = await collection.insertOne(body);
      await client.close();
      return new Response(
        JSON.stringify({ success: true, insertedId: result.insertedId }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
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

export async function PUT(request: Request) {
  let client;
  try {
    client = await getMongoClient();
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    const body = await request.json();
    if (Array.isArray(body)) {
      // Bulk update: expects array of {id, ...fields}
      const bulkOps = body.map((update) => ({
        updateOne: {
          filter: { _id: update._id },
          update: { $set: update },
        },
      }));
      const result = await collection.bulkWrite(bulkOps);
      await client.close();
      return new Response(
        JSON.stringify({ success: true, modifiedCount: result.modifiedCount }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Single update: expects {_id, ...fields}
      const result = await collection.updateOne(
        { _id: body._id },
        { $set: body }
      );
      await client.close();
      return new Response(
        JSON.stringify({ success: true, modifiedCount: result.modifiedCount }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
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

export async function DELETE(request: Request) {
  let client;
  try {
    client = await getMongoClient();
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    const body = await request.json();
    if (Array.isArray(body)) {
      // Bulk delete: expects array of _id
      const result = await collection.deleteMany({ _id: { $in: body } });
      await client.close();
      return new Response(
        JSON.stringify({ success: true, deletedCount: result.deletedCount }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Single delete: expects {_id}
      const result = await collection.deleteOne({ _id: body._id });
      await client.close();
      return new Response(
        JSON.stringify({ success: true, deletedCount: result.deletedCount }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
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
