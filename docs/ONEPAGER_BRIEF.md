# Spotcheck — One-Pager Brief

> **For humans:** facts only.  
> **For ChatGPT:** copy everything under **PROMPT TO PASTE** into a new chat, then ask it to generate the one-pager.

---

## PROMPT TO PASTE

```text
You are a sharp product designer + copywriter. Create a single-page product one-pager for SPOTCHECK using ONLY the facts in the BRIEF below. Do not invent features, metrics, partners, or funding.

OUTPUT FORMAT (one page):
1) Hero: product name + 1-line positioning
2) Problem (3 bullets max)
3) Solution (3 bullets max)
4) How it works (4-step loop, short labels)
5) What gets flagged (table or compact list of the 6 rules)
6) Why not “just record the screen” (2–3 lines)
7) Current status + next steps (MVP vs roadmap)
8) Closing line / CTA

CONSTRAINTS:
- Max ~400 words
- No purple prose, no crypto buzzword salad
- Tone: confident, operational, anti-fraud / ops tooling
- Visual hint: dark ops console, acid-green accent (#c8f560), monospace labels OK
- If asked for slides: same content, 1 slide only
- If asked for HTML/PDF copy: keep the same sections

BRIEF START
```

*(The model should continue reading the BRIEF section below as the factual source.)*

---

## BRIEF (source of truth)

### Product
- **Name:** Spotcheck  
- **One-liner:** Automated receipts and case reporting for skill-based games so payouts can be disputed with proof — not vibes.  
- **Category:** Fraud / dispute / payout integrity tooling for play-to-earn & kill-stake games  
- **Repo:** https://github.com/goldennftplatform-svg/spotcheck  

### Problem
- Skill-based wagering games move real money on kills, extracts, and withdrawals.  
- Arguments and abuse happen when the only “proof” is a player clip or a Discord screenshot.  
- Pure client capture (OBS-style) can be faked and does not bind cleanly to match/economy state.  

### Solution
- Treat every meaningful act as an **immutable hashed receipt** (server/API/chain first).  
- Run a **rules engine** over the receipt ledger to auto-open **cases**.  
- Give ops a **case queue** to hold, request POV, resolve, or dismiss.  
- Optional POV / screen clips are **evidence attached to a case**, never the source of truth.  

### Core loop
1. Ingest receipt (API / chain / later POV agent)  
2. Persist + hash  
3. Evaluate rules  
4. Open/update case → review in console  

### Receipt types (examples)
session.start/end · match.join/leave · kill · death · extract · deposit.credited · withdraw.requested/sent · tournament.enter/claim · pov.clip  

### Auto-report rules (MVP)
| Rule ID | Severity | Plain English |
| --- | --- | --- |
| kill_without_match | high | Kill credited with no match join |
| payout_mismatch | high | Withdrawn more than earned |
| impossible_timing | medium | Kills faster than humanly plausible |
| withdraw_without_extract | medium | Cash-out without extracting from fight |
| duplicate_clip_hash | medium | Same POV file reused |
| orphan_pov | low | Clip references unknown match |

### Case statuses
open · held · needs_pov · resolved · dismissed  

### Tech (MVP)
- Node.js + Express  
- JSON file ledger (`data/db.json`)  
- Local review UI at `http://localhost:4180`  
- Seed script produces demo receipts + cases  

### Roadmap (not built yet — do not claim as shipping)
- Game API + Helius webhooks  
- Optional POV capture agent bound to match_id  
- Postgres/Firestore persistence  
- Operator auth + audit trail  

### Audience for the one-pager
- Internal team / advisors / possible partners who need the concept in one glance  
- Not a user-facing consumer marketing page  

### Brand cues
- Name: **SPOTCHECK**  
- Tagline options (pick one):  
  - “Proof before payout.”  
  - “Receipts. Rules. Cases.”  
  - “Automated dispute ops for skill-based play.”  
- Color hint: charcoal background, acid lime accent  

### CTA
- Run locally: `npm install && npm run seed && npm start`  
- Read schema: `docs/RECEIPTS.md`  
- GitHub: https://github.com/goldennftplatform-svg/spotcheck  

BRIEF END

```text
END OF PASTE BLOCK — stop inventing beyond BRIEF.
```

---

## Optional follow-ups you can ask ChatGPT

After it generates the one-pager, you can say:

- “Reformat as a Notion page.”  
- “Make a single Figma-style layout description (sections + hierarchy only).”  
- “Compress to 150 words for a Twitter/X thread opener.”  
- “Turn into a one-slide pitch with speaker notes.”  

Keep pointing it back to this brief if it starts adding fake metrics.
