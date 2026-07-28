# GET TRENCHED: SPOT CHECK

### Receipts. Rules. Cases.  
**Automated proof for skill-based play — without trusting the client.**

<p align="center">
  <img src="https://img.shields.io/badge/GET%20TRENCHED-SPOT%20CHECK-c8f560?style=for-the-badge&labelColor=0f1412" alt="brand" />
  <img src="https://img.shields.io/badge/stack-Node.js%20%2B%20Express-6db3ff?style=for-the-badge&labelColor=0f1412" alt="stack" />
  <img src="https://img.shields.io/badge/status-MVP-ff6b5a?style=for-the-badge&labelColor=0f1412" alt="mvp" />
</p>

<p align="center"><strong>GET TRENCHED</strong> · <em>SPOT CHECK</em> — proof before payout.</p>

---

## The pitch

In kill-stake / play-to-earn games, arguments start when money moves.  
**GET TRENCHED: SPOT CHECK** turns every meaningful act into a **hashed receipt**, runs **rules** over those receipts, and opens a **case queue** when something looks wrong.

| Without SPOT CHECK | With GET TRENCHED: SPOT CHECK |
| --- | --- |
| “Trust me, I got the kill” | Immutable event receipt + optional POV |
| Manual Discord drama | Auto-opened cases with severity |
| Payouts first, questions later | Hold → review → resolve |
| Screen captures as “proof” | Captures as *evidence*, not source of truth |

> **Design law:** Server + chain are the source of truth. POV clips are optional attachments.

---

## How it works

```text
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │   INGEST    │ ──▶ │  RECEIPTS   │ ──▶ │    RULES    │ ──▶ │ CASE QUEUE  │
   │ api / chain │     │ hashed evt  │     │ auto-flag   │     │ review UI   │
   └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

1. **Receipt** — kill, join, extract, deposit, withdraw, POV clip… each event is canonicalized + SHA-256 hashed  
2. **Rules** — e.g. kill without `match.join`, impossible timing, payout mismatch  
3. **Case** — open / held / needs_pov / resolved / dismissed, with linked receipt IDs  
4. **Console** — ops UI to triage and close the loop  

---

## Quick start

```bash
npm install
npm run seed    # 15 sample receipts → 5 demo cases
npm start       # http://localhost:4180
```

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Service + counts |
| `GET /api/receipts` | All receipts |
| `POST /api/receipts` | Ingest one receipt (runs rules) |
| `GET /api/cases` | Case queue |
| `PATCH /api/cases/:id` | Update status / notes |
| `POST /api/rescan` | Re-run rules over the ledger |

---

## What’s in the box

```text
spotcheck/
├── docs/
│   ├── RECEIPTS.md          # Schema + rule table (source of truth)
│   └── ONEPAGER_BRIEF.md    # ← paste into ChatGPT for a 1-pager
├── lib/
│   ├── schema.mjs           # Receipt / case shapes + hashing
│   ├── rules.mjs            # Auto-report engine
│   └── store.mjs            # JSON ledger (data/db.json)
├── public/                  # Case review console
├── scripts/seed.mjs         # Demo dataset
└── server.mjs               # API + UI
```

### Rules shipping in MVP

| Rule | Severity | Why it matters |
| --- | --- | --- |
| `kill_without_match` | high | Kill with no join = ghost credit |
| `payout_mismatch` | high | Withdrawn more than earned |
| `impossible_timing` | medium | Kills &lt;200ms apart |
| `withdraw_without_extract` | medium | Cash out without leaving the fight |
| `duplicate_clip_hash` | medium | Same POV file reused for rewards |
| `orphan_pov` | low | Clip points at unknown match |

Full schema → [`docs/RECEIPTS.md`](docs/RECEIPTS.md)

---

## Roadmap (intentional)

- [x] Receipt schema + hash  
- [x] Rule engine + case queue UI  
- [x] Seed / local JSON store  
- [ ] Webhooks from game API + Helius  
- [ ] Optional POV capture agent (spot-check clips bound to `match_id`)  
- [ ] Persist to Postgres / Firestore  
- [ ] Operator auth + audit trail  

---

## One-pager (for ChatGPT / design / investors)

**Don’t invent from scratch.** Copy the brief:

📄 **[`docs/ONEPAGER_BRIEF.md`](docs/ONEPAGER_BRIEF.md)**

That file includes:
- a ready-to-paste **ChatGPT prompt**
- structured product facts (problem, solution, loop, rules, CTA)
- tone + layout constraints so the 1-pager stays tight

---

## Brand & CTA

| Layer | Copy |
| --- | --- |
| Parent brand | **GET TRENCHED** |
| Product | **SPOT CHECK** |
| Lockup | **GET TRENCHED: SPOT CHECK** |
| CTA line | **GET TRENCHED → run SPOT CHECK** |
| Tagline | Proof before payout. |

Sibling project: hosting status meter lives elsewhere — **SPOT CHECK** owns receipts & disputes.

```text
  GET TRENCHED
  : SPOT CHECK
  proof before payout.
```
