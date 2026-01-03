import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

let client;
let db;

export async function getDb() {
  if (db) return db;

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(process.env.MONGODB_DB || "pastebin");

  await db.collection("pastes").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  return db;
}
