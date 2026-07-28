import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import {
  getStats,
  ingestReceipt,
  listCases,
  listReceipts,
  rescan,
  updateCase,
} from "./lib/store.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4180;

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "spotcheck", ...getStats() });
});

app.get("/api/receipts", (_req, res) => {
  res.json({ receipts: listReceipts() });
});

app.post("/api/receipts", (req, res) => {
  try {
    const result = ingestReceipt(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/cases", (_req, res) => {
  res.json({ cases: listCases() });
});

app.patch("/api/cases/:id", (req, res) => {
  try {
    const updated = updateCase(req.params.id, req.body);
    res.json({ case: updated });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.post("/api/rescan", (_req, res) => {
  const opened = rescan();
  res.json({ openedCases: opened, stats: getStats() });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Spotcheck → http://localhost:${PORT}`);
});
