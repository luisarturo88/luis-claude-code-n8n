# Production Deployment Guide
## Content Factory — n8n Self-Hosted

---

## STEP 0 — AUDIT: What to do with existing workflows

### DEACTIVATE + DELETE immediately (dangerous in production):
| Workflow | Reason |
|---|---|
| `TEMP_READ_PIPELINE` | Temporary debug workflow. If active, can corrupt sheet reads. DELETE. |
| `Sheet Reset Row 2 v2` | Resets rows destructively. If it fires in production = data loss. DELETE. |
| `TEMP_UPDATE_ROW_3_FIXED_CREDENTIALS` | Hardcoded row update. Will overwrite live data. DELETE. |

### DEACTIVATE (keep for reference, do not run):
| Workflow | Reason |
|---|---|
| `02_AI_OUTLINE_GENERATOR_FIXED` (old) | Replaced by new 02_AI_CONTENT_GENERATOR. Deactivate to prevent duplicate runs. |
| Any old `01_MASTER_SCHEDULER` | Replace with new version below. |

### KEEP + REPLACE with new versions:
- `01_MASTER_SCHEDULER` → replace with `01_MASTER_SCHEDULER.json`
- `02_AI_CONTENT_GENERATOR` → replace/create with `02_AI_CONTENT_GENERATOR.json`
- `04_BLOGGER_PUBLISHER` → replace with `04_BLOGGER_PUBLISHER.json`
- `05_LOCK_WATCHDOG` → replace with `05_LOCK_WATCHDOG.json`

---

## STEP 1 — CONTENT_PIPELINE Sheet Schema

Your Google Sheet (`18BQ8BjfTvVa56R5FjWyBuvcGR8vVlz0rx-hwAVBdPug`) tab `CONTENT_PIPELINE` must have these columns **in row 1** (exact names, case-sensitive):

| Column | Name | Values |
|---|---|---|
| A | ROW_NUMBER | 2, 3, 4... (= row number in sheet, manually set or formula `=ROW()`) |
| B | STATUS | PENDING / QUEUED / CONTENT_READY / PUBLISHING / PUBLISHED / FAILED |
| C | LOCK | TRUE / FALSE |
| D | LOCK_TIMESTAMP | ISO timestamp or empty |
| E | TITLE | Article title |
| F | NICHE | veterinary / hurones / finanzas / seguros / etc. |
| G | KEYWORDS | Comma-separated keywords |
| H | BLOG_ID | Blogger blog ID (numeric, e.g. `1234567890`) |
| I | LANGUAGE | es / en |
| J | HTML_CONTENT | Generated HTML (populated by workflow 02) |
| K | TOKENS_USED | Number |
| L | GENERATED_AT | ISO timestamp |
| M | PUBLISHED_URL | Full URL to published post |
| N | POST_ID | Blogger post ID |
| O | PUBLISHED_AT | ISO timestamp |
| P | ERROR_MESSAGE | Error description if FAILED |

**To add articles to the pipeline:** Just add rows with:
- ROW_NUMBER = row number
- STATUS = PENDING
- LOCK = FALSE
- TITLE = your title
- NICHE = niche
- KEYWORDS = keyword1, keyword2
- BLOG_ID = your blogger blog ID
- LANGUAGE = es or en

Leave all other columns empty.

---

## STEP 2 — n8n Credentials Required

Before importing workflows, verify these credentials exist in n8n (Settings → Credentials):

### 1. Google Sheets (OAuth2)
- Name: **`Google Sheets account`** (exact name)
- Type: Google Sheets OAuth2
- Must have access to the CONTENT_PIPELINE spreadsheet

### 2. DeepSeek API
- Name: **`DeepSeek API`**
- Type: HTTP Header Auth
- Header Name: `Authorization`
- Header Value: `Bearer YOUR_DEEPSEEK_API_KEY`

### 3. Google Blogger (OAuth2)
- Name: **`Google Blogger OAuth2`**
- Type: Google OAuth2
- Scopes: `https://www.googleapis.com/auth/blogger`

---

## STEP 3 — Import Workflows

For each workflow JSON file:

1. Open n8n UI → Workflows → **New Workflow**
2. Click **...** menu (top right) → **Import from JSON**
3. Paste the full content of the JSON file
4. Click **Import**
5. Verify all credential links show green (not red/warning)
6. Click **Save**

**Import order:**
1. `05_LOCK_WATCHDOG.json` (no dependencies)
2. `02_AI_CONTENT_GENERATOR.json` (no dependencies)
3. `04_BLOGGER_PUBLISHER.json` (no dependencies)
4. `01_MASTER_SCHEDULER.json` (calls 02 and 04 — set workflow IDs after import)

---

## STEP 4 — Wire Workflow IDs in 01_MASTER_SCHEDULER

After importing all workflows, get the IDs of 02 and 04:
- Open 02_AI_CONTENT_GENERATOR → URL shows the ID (e.g. `/workflow/AbCdEfGh`)
- Open 04_BLOGGER_PUBLISHER → same

Then in 01_MASTER_SCHEDULER:
1. Click the **"02 AI Content Generator"** node
2. Set Workflow ID to the actual ID of your imported 02 workflow
3. Click the **"04 Blogger Publisher"** node  
4. Set Workflow ID to the actual ID of your imported 04 workflow
5. Save

---

## STEP 5 — Activate in Correct Order

1. Activate **05_LOCK_WATCHDOG** first
2. Activate **02_AI_CONTENT_GENERATOR** (sub-workflow, always active)
3. Activate **04_BLOGGER_PUBLISHER** (sub-workflow, always active)
4. Activate **01_MASTER_SCHEDULER** last

Do NOT activate old/temp workflows.

---

## STEP 6 — Test Run

1. Add ONE test row to CONTENT_PIPELINE with STATUS=PENDING
2. In 01_MASTER_SCHEDULER, click **Test workflow** (manual trigger)
3. Watch execution in real-time
4. Verify: sheet row STATUS goes PENDING → QUEUED → CONTENT_READY → PUBLISHING → PUBLISHED
5. Check Blogger for the published post

---

## Architecture Overview

```
CRON (every 20 min)
    │
    ▼
01_MASTER_SCHEDULER
    ├── Reads CONTENT_PIPELINE
    ├── Filters: STATUS=PENDING, LOCK=FALSE
    ├── Takes FIRST row only (no concurrency)
    ├── Sets LOCK=TRUE, STATUS=QUEUED
    │
    ▼
02_AI_CONTENT_GENERATOR (sub-workflow)
    ├── Builds DeepSeek prompt (niche + keywords)
    ├── Calls DeepSeek API (3 retries, 120s timeout)
    ├── Strips markdown fences from response
    ├── Saves HTML_CONTENT to sheet
    ├── Sets STATUS=CONTENT_READY
    └── Returns HTML to caller
    │
    ▼
04_BLOGGER_PUBLISHER (sub-workflow)
    ├── Sets STATUS=PUBLISHING
    ├── POSTs to Blogger API
    ├── On 429: waits 90s → retries once
    ├── On failure: STATUS=FAILED, LOCK=FALSE
    └── On success: STATUS=PUBLISHED, LOCK=FALSE, saves URL
    
CRON (every 30 min)
    │
    ▼
05_LOCK_WATCHDOG
    ├── Scans for LOCK=TRUE rows older than 35 min
    └── Resets: LOCK=FALSE, STATUS=PENDING
```

---

## Key Design Decisions

**Why 1 article at a time?**
Blogger API has rate limits. Running 1 at a time prevents 429 errors and avoids Google Sheets write conflicts. At 1 per 20 min = 72 articles/day = 2,160/month per blog.

**Why no 03 workflow?**
Single-pass generation (title → full HTML in one DeepSeek call) is cheaper and faster than outline → content two-step. Saves ~40% tokens.

**Why LOCK_TIMESTAMP instead of just LOCK boolean?**
So the watchdog can release locks older than 35 min. Without the timestamp, a crashed workflow leaves a permanent zombie lock.

**Blogger 429 handling:**
Wait 90s + retry once. If still fails → FAILED status so the watchdog picks it up next cycle rather than retrying infinitely.

---

## Scaling to Multi-Niche

Once the pipeline is stable, scale by:
1. Adding more rows to CONTENT_PIPELINE with different BLOG_IDs and NICHEs
2. Changing the cron interval: 20 min = 72/day, 10 min = 144/day
3. The NICHE field controls the DeepSeek prompt style automatically
4. Each BLOG_ID is a separate Blogger blog

Current supported niches (auto-detected by 02):
- `veterinary`, `hurones`, `bulldogs`, `chinchillas`, `exotic-pets`
- `finanzas`, `seguros`, `legal`, `saas`, `ia`, `automatizacion`
- `general` (fallback)
