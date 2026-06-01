# Issue #46 — Fix Placeholder Data in Legal Pages

**Overall Progress:** `100%` (execute complete; smoke-test.sh deferred to /create-pr post-push hook)

## TLDR

Replace placeholder corporate data (entity name, address, registration number, arbitration bodies, specific subscription prices) across the 4 legal HTML pages so they reflect Mind Compass's **pre-incorporation** reality and remove future-mismatch risk. Move the legal pages to a shared `funnel/legal/` directory so v1, v2, and future funnels all link to the same files. Update referencing data (`screens.json companyInfo`, `engine/app.js policyLinks` + `companyFooter`) accordingly. Blocker for compliance (Stripe / Apple / GDPR) before launch.

## Critical Decisions

- **Operator name** → `Mind Compass` everywhere; no `Compass Limited`, no legal suffix — Mind Compass is a trade name, not a registered entity yet.
- **No address / registration number / arbitration bodies** — pre-incorporation; cannot legally bind users to an arbitration forum we have no entity to represent us in. One explicit clause in `terms-of-use.html §16.5` (and a short note at the end of `privacy-policy.html §13`) states this status.
- **Asymmetric price handling** — generic in long-form legal docs; specific in `engine/app.js` paywall disclaimer because it's on the same screen as the price cards and required by App Store §3.1.2(a) / EU Consumer Rights Directive Art. 8(2) / FTC ROSCA.
- **Shared `funnel/legal/`** rather than per-funnel duplication — DRY, single source of truth. **No `vercel.json` change needed** — Vercel serves `/legal/*` directly as static files from project root.
- **Shared `LEGAL_PATHS` constant** in `app.js` — replaces the old private `policyLinks` map in `legalDisclaimer` AND fixes the long-standing broken `#hash` links in `companyFooter`. Single source of truth for funnel→legal URLs.
- **CCPA section kept in full** — safest legal posture.
- **Back-link** in each HTML → `/` (root redirects to `/funnel-v2/`).

## Tasks

- [x] 🟩 **Step 1: Move legal HTML files to shared `funnel/legal/`**
  - [x] 🟩 Create `funnel/legal/` directory
  - [x] 🟩 `git mv` 4 files from `funnel/funnels/v2/` → `funnel/legal/`
  - [x] 🟩 Update back-link in each HTML: `<a href="./">` → `<a href="/">`
  - [x] 🟩 Cross-links between docs stay relative (same directory) — verified

- [x] 🟩 **Step 2: Wire `/legal/` route in `funnel/vercel.json`**
  - [x] 🟩 Confirmed Vercel serves `funnel/legal/*` directly at `/legal/*` — **no rewrite needed**
  - [x] 🟩 Verified locally: `curl http://localhost:8080/legal/terms-of-use.html` → 200 OK (×4)

- [x] 🟩 **Step 3: Update `funnel/engine/app.js`**
  - [x] 🟩 Add shared `LEGAL_PATHS` const above `Components`
  - [x] 🟩 Rewrite `legalDisclaimer()` using LEGAL_PATHS + "Terms of Use( and Service)?" regex (no nested-link bug)
  - [x] 🟩 Rewrite `companyFooter()` to use real `/legal/*` URLs (was broken `#hash`) + omit empty address
  - [x] 🟩 Per-currency `legalDisclaimer` strings (lines 112–116) — **unchanged** (prices stay, mandatory pre-purchase disclosure)
  - [x] 🟩 Functional test: both "Subscription Policy" alone and "Terms of Use and Service" linkify correctly without nesting

- [x] 🟩 **Step 4: Rewrite `terms-of-use.html`**
  - [x] 🟩 `Compass Limited` → `Mind Compass` everywhere
  - [x] 🟩 Drop Cyprus address from §intro and §17
  - [x] 🟩 §1 Service — safe product description (self-development; not therapy)
  - [x] 🟩 §5.2 Refunds — refer to Subscription Policy + statutory rights caveat
  - [x] 🟩 Removed §12.3 (LCIA) and §12.4 (JAMS); §12 collapsed to: Informal Resolution → Court Jurisdiction
  - [x] 🟩 §16.1 Governing Law — Cyprus + mandatory consumer protection caveat
  - [x] 🟩 §9.2 strengthened with "therapy, mental health care, or any other professional service"
  - [x] 🟩 Added §16.5 — pre-incorporation legal status
  - [x] 🟩 "Last updated" → June 1, 2026

- [x] 🟩 **Step 5: Rewrite `privacy-policy.html`**
  - [x] 🟩 `Compass Limited` → `Mind Compass`
  - [x] 🟩 Dropped address in §1 (Data Controller) and §13 (Contact Us)
  - [x] 🟩 Added pre-incorporation note as a small grey paragraph at end of §13
  - [x] 🟩 §5 California Privacy Rights — kept full
  - [x] 🟩 §10 Age — 18+ kept
  - [x] 🟩 §11 Privacy Rights — kept full
  - [x] 🟩 "Last updated" → June 1, 2026

- [x] 🟩 **Step 6: Rewrite `subscription-policy.html`**
  - [x] 🟩 `Compass Limited` → `Mind Compass`
  - [x] 🟩 Dropped address in §9 Contact
  - [x] 🟩 §1 General — safe product description + not-therapy disclaimer
  - [x] 🟩 §2 Subscription Plans — genericized (no plan names, no prices)
  - [x] 🟩 §4 Billing — "Stripe (which may include Apple Pay or Google Pay where available)"
  - [x] 🟩 §6 Refunds — "where expressly advertised on the offer or checkout page" + statutory rights caveat
  - [x] 🟩 "Last updated" → June 1, 2026

- [x] 🟩 **Step 7: Rewrite `cookie-policy.html`**
  - [x] 🟩 `Compass Limited` → `Mind Compass`
  - [x] 🟩 Dropped address in §7 Contact
  - [x] 🟩 Kept current domain references in §3
  - [x] 🟩 Cookie table (§4) — updated Stripe row with Apple/Google Pay mention; rest kept
  - [x] 🟩 "Last updated" → June 1, 2026

- [x] 🟩 **Step 8: Update `funnel/funnels/v2/screens.json`**
  - [x] 🟩 `companyInfo.name`: `"Compass Limited"` → `"Mind Compass"`
  - [x] 🟩 Removed `companyInfo.address` entirely
  - [x] 🟩 `companyInfo.links` — kept as is (resolved via `LEGAL_PATHS` in `companyFooter`)
  - [x] 🟩 Paywall fallback `legalDisclaimer` (line 1693) — **unchanged** (dead-fallback; never rendered in practice)
  - [x] 🟩 JSON validity check: passes

- [x] 🟩 **Step 9: Local smoke test**
  - [x] 🟩 Started Python `http.server` on `:8080` from `funnel/`
  - [x] 🟩 `/legal/{terms-of-use,privacy-policy,subscription-policy,cookie-policy}.html` → 200 OK (×4)
  - [x] 🟩 `/funnels/v2/index.html` + `/funnels/v2/screens.json` → 200 OK
  - [x] 🟩 0 placeholder leaks in `funnel/legal/`, `screens.json`, `engine/app.js`
  - [x] 🟩 `node -e "new Function(src)"` on `engine/app.js` parses without error
  - [x] 🟩 Functional unit test of `legalDisclaimer` regex passes (no nested links)
  - [x] 🟩 Server stopped (cleanup)

- [ ] 🟥 **Step 10: Build smoke test (deferred)**
  - Runs automatically post-push via Claude Code hook (per CLAUDE.md). Will be triggered during `/create-pr` push step.

## Files Changed (final)

| File | Action |
|---|---|
| `funnel/legal/terms-of-use.html` | moved + rewritten |
| `funnel/legal/privacy-policy.html` | moved + rewritten |
| `funnel/legal/subscription-policy.html` | moved + rewritten |
| `funnel/legal/cookie-policy.html` | moved + rewritten |
| `funnel/funnels/v2/screens.json` | edited (`companyInfo`) |
| `funnel/engine/app.js` | edited (added `LEGAL_PATHS`, rewrote `legalDisclaimer` + `companyFooter`) |
| `funnel/vercel.json` | **no change** (Vercel default static serve handles `/legal/`) |

## Out of Scope

- Creating an actual legal entity (business action).
- Lawyer review (recommended before launch).
- Adding paywall + legal links to v1 funnel.
- Touching `webapp/components/Login.tsx`.
