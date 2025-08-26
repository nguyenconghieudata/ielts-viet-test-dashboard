import { MongoClient } from "mongodb";

// Use hardcoded values for now - these should be moved to environment variables
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "farmcode";

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    console.log("Connecting to MongoDB at:", uri);
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    cachedClient = client;
    cachedDb = db;
    console.log("MongoDB connection successful");
    return { client, db };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw new Error(
      `Database connection failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export const getCollection = async (collectionName: string) => {
  try {
    const { db } = await connectToDatabase();
    return db.collection(collectionName);
  } catch (error) {
    console.error(`Failed to get collection ${collectionName}:`, error);
    throw new Error(
      `Failed to get collection: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
