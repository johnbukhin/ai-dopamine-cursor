# Create New Funnel

You are creating a new quiz funnel for the Mind Compass app.

## Architecture context

```
funnel/
  engine/
    app.js       — shared rendering engine (never edit per-funnel)
    styles.css   — shared stylesheet (never edit per-funnel)
  screens/
    registry.json — shared screens: checkout, thank_you, create_account, app_dashboard
                    (any screen here can be referenced by any funnel's sequence)
  funnels/
    v1/           — Funnel V1 (wellbeing / dopamine quiz)
    v2/           — Funnel V2 (porn addiction recovery quiz)
    <new>/        — your new funnel goes here
  assets/         — images shared by all funnels
  vercel.json     — URL routing (one entry per funnel)
```

A funnel = `index.html` (loader only) + `config.json` (sequence of screen IDs) + `screens.json` (screen data for screens unique to this funnel). The engine handles all rendering.

The shared registry already contains: `checkout`, `thank_you`, `create_account`, `app_dashboard` — these can be used in any funnel sequence without adding them to local `screens.json`.

---

## Your task

### Step 1 — Gather requirements

Ask the user (if not already in arguments):
- **Funnel slug** — short identifier used in folder name and URL, e.g. `v3`, `weight-loss`, `anxiety`
- **Funnel name** — human-readable, e.g. "Funnel V3 — Weight Loss"
- **Purpose** — what is this funnel about? (helps write screen content)
- **Base it on an existing funnel?** — if yes, which one (v1 or v2)? Starting from an existing funnel copies its screen sequence and data as a starting point.
- **Vercel URL slug** — the public URL path, e.g. `funnel-v3` → accessible at `yourdomain.com/funnel-v3`

### Step 2 — Read source files

Before creating anything, read:
- `funnel/funnels/v1/config.json` and `funnel/funnels/v2/config.json` — to understand sequence format
- `funnel/funnels/v1/screens.json` or `funnel/funnels/v2/screens.json` — if basing on existing
- `funnel/screens/registry.json` — to know which screen IDs are already globally available
- `funnel/vercel.json` — to add the new route correctly

### Step 3 — Create the funnel directory

```bash
mkdir -p funnel/funnels/<slug>
```

### Step 4 — Create index.html

This file is IDENTICAL for every funnel — it just loads the shared engine. Write it exactly as:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mind Compass</title>
    <link rel="icon" href="../../assets/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="../../engine/styles.css">
</head>
<body>
    <div id="app">
        <div class="loading-spinner">Loading...</div>
    </div>
    <script src="https://js.stripe.com/v3/"></script>
    <script src="../../engine/app.js"></script>
</body>
</html>
```

### Step 5 — Create config.json

```json
{
  "name": "<Funnel Name>",
  "sequence": [
    "landing",
    "... screen IDs in order ...",
    "checkout",
    "thank_you",
    "create_account"
  ]
}
```

**Rules for the sequence:**
- The sequence is the complete user journey — every screen the user will see, in order
- IDs must match entries in either `funnel/screens/registry.json` or the local `screens.json`
- `checkout`, `thank_you`, `create_account` are already in the registry — just reference them
- If basing on an existing funnel: copy its sequence and modify as needed
- If building from scratch: start with `landing`, add questions, interstitials, loading screens, then end with paywall → checkout → thank_you → create_account

### Step 6 — Create screens.json

A flat JSON array of screen objects for screens **not** already in the registry.

**If basing on an existing funnel:** copy that funnel's `screens.json` entirely. Then add, remove, or modify screens as needed.

**If building from scratch:** create the array with at minimum a `landing` screen:
```json
[
  {
    "id": "landing",
    "type": "landing",
    "screenType": "landing",
    "headline": "Take the Quiz",
    "subheadline": "Find your personalized plan",
    "options": [
      { "id": "male", "label": "Male", "image": "../../assets/male.png" },
      { "id": "female", "label": "Female", "image": "../../assets/female.png" }
    ]
  }
]
```

For screen JSON structure by type, see the `/create-ob-screen` command reference.

**Do NOT include in screens.json:** `checkout`, `thank_you`, `create_account`, `app_dashboard` — they're in the registry.

### Step 7 — Add route to vercel.json

Read `funnel/vercel.json`. Add a new entry to the `rewrites` array:

```json
{
  "source": "/<url-slug>",
  "destination": "/funnels/<slug>/index.html"
}
```

### Step 8 — Validate

Run this to confirm all sequence IDs resolve:

```bash
python3 -c "
import json, sys
slug = '<slug>'
reg = json.load(open('funnel/screens/registry.json'))
local = json.load(open(f'funnel/funnels/{slug}/screens.json'))
cfg = json.load(open(f'funnel/funnels/{slug}/config.json'))
all_ids = {s['id'] for s in reg + local}
missing = [sid for sid in cfg['sequence'] if sid not in all_ids]
print('Sequence length:', len(cfg['sequence']))
print('Missing IDs:', missing if missing else 'NONE — all good!')
"
```

If there are missing IDs, add the screen objects to `screens.json` or fix the ID references.

### Step 9 — Report back

Tell the user:
- **Test URL:** `http://localhost:8080/funnel/funnels/<slug>/`
  (start server: `lsof -ti:8080 | xargs kill -9 2>/dev/null || true && cd /Users/yevhen/cursor-projects/ClaudeCode && python3 -m http.server 8080 &`)
- **Production URL** (after push + Vercel deploy): `https://<vercel-domain>/<url-slug>`
- **Sequence summary:** how many screens, which paywall is used
- What screens were added to local `screens.json` vs reused from registry
- Next steps: "Use `/create-ob-screen` to add new screens to this funnel"

---

## How to add more funnels in the future

Repeat this process. Each funnel is independent — it can reuse any screen from the registry or from other funnels' `screens.json` by copying the object with a new or same ID. The engine and styles never change per-funnel.

To promote a screen to the shared registry (so multiple funnels can reference it without copying):
1. Move the screen object from `funnels/<slug>/screens.json` into `funnel/screens/registry.json`
2. Keep the same `id` — all funnels that already reference it will continue to work
