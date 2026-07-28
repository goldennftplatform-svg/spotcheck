import crypto from "crypto";

export const RECEIPT_TYPES = [
  "session.start",
  "session.end",
  "match.join",
  "match.leave",
  "kill",
  "death",
  "extract",
  "deposit.credited",
  "withdraw.requested",
  "withdraw.sent",
  "tournament.enter",
  "tournament.claim",
  "pov.clip",
];

export const CASE_STATUSES = ["open", "needs_pov", "held", "resolved", "dismissed"];

export function canonicalPayload(receipt) {
  const { hash: _hash, ...rest } = receipt;
  const keys = Object.keys(rest).sort();
  const ordered = {};
  for (const k of keys) {
    if (rest[k] !== undefined) ordered[k] = rest[k];
  }
  return JSON.stringify(ordered);
}

export function hashReceipt(receipt) {
  return crypto.createHash("sha256").update(canonicalPayload(receipt)).digest("hex");
}

export function makeId(prefix) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

export function normalizeReceipt(input) {
  const now = new Date().toISOString();
  const receipt = {
    id: input.id || makeId("evt"),
    type: input.type,
    ts: input.ts || now,
    playerId: String(input.playerId || ""),
    matchId: input.matchId || undefined,
    roomStakeLamports: input.roomStakeLamports ?? undefined,
    amountLamports: input.amountLamports ?? undefined,
    counterpartyId: input.counterpartyId || undefined,
    txSig: input.txSig || undefined,
    source: input.source || "api",
    payload: input.payload || undefined,
  };

  if (!RECEIPT_TYPES.includes(receipt.type)) {
    throw new Error(`unknown receipt type: ${receipt.type}`);
  }
  if (!receipt.playerId) throw new Error("playerId required");

  receipt.hash = hashReceipt(receipt);
  return receipt;
}

export function makeCase({
  ruleId,
  title,
  severity,
  playerId,
  matchId,
  receiptIds,
  status = "open",
  notes = [],
}) {
  const now = new Date().toISOString();
  return {
    id: makeId("case"),
    status,
    severity,
    ruleId,
    title,
    createdAt: now,
    updatedAt: now,
    playerId,
    matchId,
    receiptIds: [...receiptIds],
    notes: [...notes],
  };
}
