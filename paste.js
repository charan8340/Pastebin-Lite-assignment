import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db/mongo.js";

export async function createPaste({ content, ttlSeconds, maxViews, createdAt }) {
  const db = await getDb();

  const doc = {
    _id: uuidv4(),
    content,
    maxViews: maxViews ?? null,
    views: 0,
    createdAt,
    expiresAt: ttlSeconds ? new Date(createdAt.getTime() + ttlSeconds * 1000) : null
  };

  await db.collection("pastes").insertOne(doc);
  return doc;
}

export async function fetchPaste(id, now) {
  const db = await getDb();

  const result = await db.collection("pastes").findOneAndUpdate(
    {
      _id: id,
      $expr: {
        $and: [
          { $or: [{ $eq: ["$expiresAt", null] }, { $gt: ["$expiresAt", now] }] },
          { $or: [{ $eq: ["$maxViews", null] }, { $lt: ["$views", "$maxViews"] }] }
        ]
      }
    },
    { $inc: { views: 1 } },
    { returnDocument: "after" }
  );

  return result.value;
}
