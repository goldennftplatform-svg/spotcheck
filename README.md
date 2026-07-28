# Spotcheck — receipts + automated reporting (MVP)

Scaffold for PlayTrenches-style **event receipts**, **rule-based auto-reports**, and a **case queue**.

Open this folder in Cursor for follow-up work. PLayTR stays the status meter.

## Run

```bash
npm install
npm run seed
npm start
```

Open http://localhost:4180

## Layout

| Path | Role |
| --- | --- |
| `docs/RECEIPTS.md` | Receipt schema + report rules |
| `lib/schema.mjs` | Event / case shapes |
| `lib/rules.mjs` | Auto-report rule engine |
| `lib/store.mjs` | JSON file store (`data/db.json`) |
| `server.mjs` | API + static case UI |
| `public/` | Minimal review console |

## Design

1. **Receipts** = immutable gameplay/economy events (server + optional chain/POV refs)
2. **Rules** = scan receipts → open cases when something looks wrong
3. **Cases** = review queue with status + attached receipt ids
4. **POV clips** = optional attachment later (not required for MVP)
