import express from "express";
import helmet from "helmet";
import health from "./routes/health.js";
import pastes from "./routes/pastes.js";
import { fetchPaste } from "./models/Paste.js";
import { now } from "./utils/time.js";

const app = express();

app.use(helmet());
app.use(express.json());

app.use("/api", health);
app.use("/api", pastes);

app.get("/p/:id", async (req, res) => {
  const paste = await fetchPaste(req.params.id, now(req));
  if (!paste) return res.status(404).send("Not found");

  res.status(200).send(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Paste</title></head>
<body>
<pre>${escapeHtml(paste.content)}</pre>
</body>
</html>
  `);
});

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

export default app;
