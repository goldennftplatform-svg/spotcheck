# Receipts & reporting

## Receipt (immutable event)

Every meaningful act becomes one receipt. Money and match outcomes should be server-authored; POV is optional evidence.

```ts
type Receipt = {
  id: string;                 // evt_…
  type: ReceiptType;
  ts: string;                 // ISO server time
  playerId: string;           // wallet or privy user id
  matchId?: string;
  roomStakeLamports?: number;
  amountLamports?: number;
  counterpartyId?: string;    // e.g. killer / victim
  txSig?: string;             // Solana signature when on-chain
  source: "api" | "chain" | "photon" | "client" | "pov";
  payload?: Record<string, unknown>;
  hash: string;               // sha256 of canonical fields
};

type ReceiptType =
  | "session.start"
  | "session.end"
  | "match.join"
  | "match.leave"
  | "kill"
  | "death"
  | "extract"
  | "deposit.credited"
  | "withdraw.requested"
  | "withdraw.sent"
  | "tournament.enter"
  | "tournament.claim"
  | "pov.clip";               // optional visual receipt
```

### Hashing

Canonical string (sorted keys, no `hash` field) → SHA-256. Recompute on ingest; reject mismatches.

## Case (report)

```ts
type Case = {
  id: string;                 // case_…
  status: "open" | "needs_pov" | "held" | "resolved" | "dismissed";
  severity: "low" | "medium" | "high";
  ruleId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  playerId: string;
  matchId?: string;
  receiptIds: string[];
  notes: string[];
  resolution?: string;
};
```

## Auto-report rules (MVP)

| Rule ID | Trigger | Severity | Suggested action |
| --- | --- | --- | --- |
| `kill_without_match` | `kill` with no prior `match.join` for same match/player | high | open case, hold related payouts |
| `payout_mismatch` | sum(kills amounts) ≠ credited balance delta in window | high | hold withdraw |
| `withdraw_without_extract` | `withdraw.requested` with no `extract` in active session | medium | needs review |
| `impossible_timing` | two kills by same player &lt; 200ms apart | medium | flag |
| `orphan_pov` | `pov.clip` with unknown `matchId` | low | ignore or request rebind |
| `duplicate_clip_hash` | same POV file hash twice | medium | reject clip reward |

Rules run on each ingest and on a periodic sweep.

## Automation loop

```
ingest receipt → persist → run rules → maybe open/update case → UI queue
```

Later: webhook from `trenches-api`, Helius tx webhooks, optional spotcheck POV agent uploading `pov.clip` receipts.
