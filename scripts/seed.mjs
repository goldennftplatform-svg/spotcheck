import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ingestReceipt, loadDb, saveDb } from "../lib/store.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "db.json");

// Reset
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
saveDb({ receipts: [], cases: [] });

const base = Date.parse("2026-07-28T18:00:00.000Z");
const t = (ms) => new Date(base + ms).toISOString();

const samples = [
  // Clean player
  {
    type: "session.start",
    playerId: "player_clean",
    ts: t(0),
    source: "api",
  },
  {
    type: "match.join",
    playerId: "player_clean",
    matchId: "match_a",
    roomStakeLamports: 1_000_000,
    ts: t(5_000),
    source: "api",
  },
  {
    type: "kill",
    playerId: "player_clean",
    matchId: "match_a",
    counterpartyId: "bot_1",
    amountLamports: 1_000_000,
    ts: t(45_000),
    source: "api",
  },
  {
    type: "extract",
    playerId: "player_clean",
    matchId: "match_a",
    ts: t(90_000),
    source: "api",
  },
  {
    type: "withdraw.requested",
    playerId: "player_clean",
    amountLamports: 1_000_000,
    ts: t(100_000),
    source: "api",
  },
  {
    type: "withdraw.sent",
    playerId: "player_clean",
    amountLamports: 1_000_000,
    txSig: "5cleanTxExample111",
    ts: t(110_000),
    source: "chain",
  },

  // Suspicious: kill without join
  {
    type: "session.start",
    playerId: "player_ghost",
    ts: t(0),
    source: "api",
  },
  {
    type: "kill",
    playerId: "player_ghost",
    matchId: "match_ghost",
    amountLamports: 5_000_000,
    ts: t(20_000),
    source: "client",
  },

  // Suspicious: impossible timing + payout mismatch
  {
    type: "session.start",
    playerId: "player_speed",
    ts: t(0),
    source: "api",
  },
  {
    type: "match.join",
    playerId: "player_speed",
    matchId: "match_b",
    roomStakeLamports: 1_000_000,
    ts: t(1_000),
    source: "api",
  },
  {
    type: "kill",
    playerId: "player_speed",
    matchId: "match_b",
    amountLamports: 1_000_000,
    ts: t(30_000),
    source: "api",
  },
  {
    type: "kill",
    playerId: "player_speed",
    matchId: "match_b",
    amountLamports: 1_000_000,
    ts: t(30_100),
    source: "api",
  },
  {
    type: "withdraw.sent",
    playerId: "player_speed",
    amountLamports: 50_000_000,
    ts: t(60_000),
    source: "chain",
  },

  // Orphan + duplicate POV
  {
    type: "pov.clip",
    playerId: "player_clip",
    matchId: "match_missing",
    ts: t(10_000),
    source: "pov",
    payload: { fileHash: "abc123", url: "https://example.com/a.webm" },
  },
  {
    type: "pov.clip",
    playerId: "player_clip",
    matchId: "match_missing",
    ts: t(20_000),
    source: "pov",
    payload: { fileHash: "abc123", url: "https://example.com/b.webm" },
  },
];

for (const s of samples) {
  ingestReceipt(s);
}

const db = loadDb();
console.log(`Seeded ${db.receipts.length} receipts, ${db.cases.length} cases → data/db.json`);
