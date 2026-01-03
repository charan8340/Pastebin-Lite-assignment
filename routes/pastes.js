import express from "express";
import { createPaste, fetchPaste } from "../models/Paste.js";
import { now } from "../utils/time.js";

const router = express.Router();

router.post("/pastes", async (req, res) => {
  const { content, ttl_seconds, max_views } = req.body;

  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "content required" });
  }
  if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
    return res.status(400).json({ error: "invalid ttl_seconds" });
  }
  if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
    return res.status(400).json({ error: "invalid max_views" });
  }

  const paste = await createPaste({
    content,
    ttlSeconds: ttl_seconds,
    maxViews: max_views,
    createdAt: now(req)
  });

  res.status(201).json({
    id: paste._id,
    url: `${req.protocol}://${req.get("host")}/p/${paste._id}`
  });
});

router.get("/pastes/:id", async (req, res) => {
  const paste = await fetchPaste(req.params.id, now(req));
  if (!paste) {
    return res.status(404).json({ error: "not found" });
  }

  res.json({
    content: paste.content,
    remaining_views:
      paste.maxViews === null ? null : Math.max(paste.maxViews - paste.views, 0),
    expires_at: paste.expiresAt ? paste.expiresAt.toISOString() : null
  });
});

export default router;
