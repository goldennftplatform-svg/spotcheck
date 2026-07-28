import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { evaluateRules } from "./rules.mjs";
import { normalizeReceipt } from "./schema.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function emptyDb() {
  return { receipts: [], cases: [] };
}

export function loadDb() {
  if (!fs.existsSync(DB_PATH)) return emptyDb();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

export function saveDb(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function listReceipts() {
  return loadDb().receipts;
}

export function listCases() {
  return loadDb().cases.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function ingestReceipt(input) {
  const receipt = normalizeReceipt(input);
  const db = loadDb();
  db.receipts.push(receipt);
  const opened = evaluateRules(db.receipts, db.cases);
  db.cases.push(...opened);
  saveDb(db);
  return { receipt, openedCases: opened };
}

export function updateCase(id, patch) {
  const db = loadDb();
  const idx = db.cases.findIndex((c) => c.id === id);
  if (idx < 0) throw new Error("case not found");
  const next = {
    ...db.cases[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  if (patch.note) {
    next.notes = [...(db.cases[idx].notes || []), patch.note];
    delete next.note;
  }
  db.cases[idx] = next;
  saveDb(db);
  return next;
}

export function rescan() {
  const db = loadDb();
  const opened = evaluateRules(db.receipts, db.cases);
  db.cases.push(...opened);
  saveDb(db);
  return opened;
}

export function getStats() {
  const db = loadDb();
  const openCases = db.cases.filter((c) =>
    ["open", "held", "needs_pov"].includes(c.status)
  ).length;
  return {
    receipts: db.receipts.length,
    cases: db.cases.length,
    openCases,
  };
}
