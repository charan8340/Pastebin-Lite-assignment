import express from "express";
import { getDb } from "../db/mongo.js";

const router = express.Router();

router.get("/healthz", async (_, res) => {
  try {
    await getDb();
    res.status(200).json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

export default router;
