import { makeCase } from "./schema.mjs";

/** @typedef {import('./schema.mjs')} Schema */

/**
 * Pure rule pass over the full receipt set.
 * Returns new cases to open (caller dedupes).
 */
export function evaluateRules(receipts, existingCases = []) {
  const openKeys = new Set(
    existingCases
      .filter((c) => c.status === "open" || c.status === "held" || c.status === "needs_pov")
      .map((c) => `${c.ruleId}::${c.playerId}::${c.matchId || ""}`)
  );

  const byPlayer = groupBy(receipts, (r) => r.playerId);
  const found = [];

  for (const [playerId, list] of Object.entries(byPlayer)) {
    found.push(...ruleKillWithoutMatch(playerId, list));
    found.push(...ruleWithdrawWithoutExtract(playerId, list));
    found.push(...ruleImpossibleTiming(playerId, list));
    found.push(...rulePayoutMismatch(playerId, list));
    found.push(...ruleOrphanPov(playerId, list));
    found.push(...ruleDuplicateClipHash(playerId, list));
  }

  return found.filter((c) => {
    const key = `${c.ruleId}::${c.playerId}::${c.matchId || ""}`;
    if (openKeys.has(key)) return false;
    openKeys.add(key);
    return true;
  });
}

function groupBy(items, keyFn) {
  const out = {};
  for (const item of items) {
    const k = keyFn(item);
    if (!out[k]) out[k] = [];
    out[k].push(item);
  }
  for (const k of Object.keys(out)) {
    out[k].sort((a, b) => a.ts.localeCompare(b.ts));
  }
  return out;
}

function ruleKillWithoutMatch(playerId, list) {
  const cases = [];
  for (const kill of list.filter((r) => r.type === "kill")) {
    const joined = list.some(
      (r) =>
        r.type === "match.join" &&
        r.matchId &&
        kill.matchId &&
        r.matchId === kill.matchId &&
        r.ts <= kill.ts
    );
    if (!joined) {
      cases.push(
        makeCase({
          ruleId: "kill_without_match",
          title: `Kill without match.join (${kill.matchId || "no-match"})`,
          severity: "high",
          playerId,
          matchId: kill.matchId,
          receiptIds: [kill.id],
          status: "held",
          notes: ["Auto: kill receipt has no preceding match.join for this match."],
        })
      );
    }
  }
  return cases;
}

function ruleWithdrawWithoutExtract(playerId, list) {
  const cases = [];
  for (const w of list.filter((r) => r.type === "withdraw.requested")) {
    const sessionStarts = list.filter((r) => r.type === "session.start" && r.ts <= w.ts);
    const lastStart = sessionStarts[sessionStarts.length - 1];
    if (!lastStart) continue;

    const extracted = list.some(
      (r) => r.type === "extract" && r.ts >= lastStart.ts && r.ts <= w.ts
    );
    if (!extracted) {
      cases.push(
        makeCase({
          ruleId: "withdraw_without_extract",
          title: "Withdraw requested without extract in session",
          severity: "medium",
          playerId,
          matchId: w.matchId,
          receiptIds: [w.id, lastStart.id],
          notes: ["Auto: withdraw.requested after session.start with no extract."],
        })
      );
    }
  }
  return cases;
}

function ruleImpossibleTiming(playerId, list) {
  const cases = [];
  const kills = list.filter((r) => r.type === "kill");
  for (let i = 1; i < kills.length; i++) {
    const a = kills[i - 1];
    const b = kills[i];
    const dt = Date.parse(b.ts) - Date.parse(a.ts);
    if (dt >= 0 && dt < 200) {
      cases.push(
        makeCase({
          ruleId: "impossible_timing",
          title: `Kills ${dt}ms apart`,
          severity: "medium",
          playerId,
          matchId: b.matchId || a.matchId,
          receiptIds: [a.id, b.id],
          notes: [`Auto: consecutive kills ${dt}ms apart (<200ms).`],
        })
      );
    }
  }
  return cases;
}

function rulePayoutMismatch(playerId, list) {
  // Simplified: kill credits should equal sum of kill.amountLamports in a match;
  // flag if a withdraw.sent amount exceeds sum of kills+deposits in that player history window.
  const cases = [];
  const earned = list
    .filter((r) => r.type === "kill" || r.type === "deposit.credited")
    .reduce((s, r) => s + (r.amountLamports || 0), 0);
  const withdrawn = list
    .filter((r) => r.type === "withdraw.sent")
    .reduce((s, r) => s + (r.amountLamports || 0), 0);

  if (withdrawn > 0 && withdrawn > earned) {
    const ids = list
      .filter((r) => ["kill", "deposit.credited", "withdraw.sent"].includes(r.type))
      .map((r) => r.id);
    cases.push(
      makeCase({
        ruleId: "payout_mismatch",
        title: `Withdrawn ${withdrawn} exceeds earned ${earned}`,
        severity: "high",
        playerId,
        receiptIds: ids,
        status: "held",
        notes: ["Auto: withdraw.sent total > kills + deposits (lamports)."],
      })
    );
  }
  return cases;
}

function ruleOrphanPov(playerId, list) {
  const cases = [];
  const matchIds = new Set(
    list.filter((r) => r.matchId && r.type !== "pov.clip").map((r) => r.matchId)
  );
  for (const clip of list.filter((r) => r.type === "pov.clip")) {
    if (clip.matchId && !matchIds.has(clip.matchId)) {
      cases.push(
        makeCase({
          ruleId: "orphan_pov",
          title: `POV clip for unknown match ${clip.matchId}`,
          severity: "low",
          playerId,
          matchId: clip.matchId,
          receiptIds: [clip.id],
          status: "needs_pov",
          notes: ["Auto: pov.clip matchId not seen in other receipts."],
        })
      );
    }
  }
  return cases;
}

function ruleDuplicateClipHash(playerId, list) {
  const cases = [];
  const seen = new Map();
  for (const clip of list.filter((r) => r.type === "pov.clip")) {
    const fileHash = clip.payload?.fileHash;
    if (!fileHash) continue;
    if (seen.has(fileHash)) {
      cases.push(
        makeCase({
          ruleId: "duplicate_clip_hash",
          title: "Duplicate POV file hash",
          severity: "medium",
          playerId,
          matchId: clip.matchId,
          receiptIds: [seen.get(fileHash), clip.id],
          notes: ["Auto: same payload.fileHash on two pov.clip receipts."],
        })
      );
    } else {
      seen.set(fileHash, clip.id);
    }
  }
  return cases;
}
