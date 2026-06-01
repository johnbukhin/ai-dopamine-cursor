# Feature Implementation Plan — Issue #50: Legal quick fixes (Workstream A)

**Overall Progress:** `100%`

## TLDR
First PR off the legal-audit umbrella issue (#50). Ships **workstream A only** — 8 text/CSS-level fixes within the 4 `funnel/legal/*.html` files. Closes a real doc/product mismatch (in-app cancel exists; docs say email-only) and several minor regulatory hygiene items. No new compliance content (that's workstream B) and no engineering (that's workstream C).

## Critical Decisions
- **Medical disclaimer as visual callout box** (light amber bg, left border) at top of Terms + Subscription only — most professional, most clearly "conspicuous" per regulatory expectations.
- **Refund "pointer" pattern** — Terms §6.3 references Subscription §6 instead of duplicating refund text.
- **Cancellation: in-account primary, email alternative** — describes product reality (`webapp/components/CancelFlow.tsx` exists) AND closes audit Critical #3.
- **Combined Steps 3+4 into one §6.3 rewrite** — both touched the same paragraph; cleaner to land both in one Edit.
- **Skip date refresh** — `Last updated: June 1, 2026` already matches today; no change needed.
- **CSS duplicated across 4 files** — kept existing pattern; just added `.medical-disclaimer` to Terms + Subscription.

## Tasks

- [x] 🟩 **Step 1: Medical disclaimer callout** (Terms + Subscription)
  - [x] 🟩 `.medical-disclaimer` CSS class in both files' `<style>` blocks (amber `#FEF3C7` bg, `#F59E0B` left border, `#78350F` text)
  - [x] 🟩 `<div class="medical-disclaimer">` inserted after `<p class="last-updated">` in both, with merged §1+§9.2 wording
  - [x] 🟩 Existing §1 + §10.2 (renumbered) paragraphs preserved

- [x] 🟩 **Step 2: Eligibility / age gate in Terms**
  - [x] 🟩 New `<h2>2. Eligibility</h2>` + paragraph inserted between current §1 and former §2
  - [x] 🟩 Renumbered §2 → §3 through §17 → §18 (all `<h2>` and `<h3>` subsections)
  - [x] 🟩 Updated single cross-reference: `Section 16.1` → `Section 17.1` in §13.2

- [x] 🟩 **Step 3 + 4 (combined): Cancel + refund rewrite in §6.3**
  - [x] 🟩 §6.3 now: in-app cancel primary ("Profile → Subscription → Cancel Subscription"), email alternative, refund eligibility points to Subscription §6
  - [x] 🟩 `subscription-policy.html` §5 mirrors same wording

- [x] 🟩 **Step 5: 30 vs 45-day timeline (Privacy §11)**
  - [x] 🟩 Now reads: "thirty (30) days under the GDPR, or forty-five (45) days for California residents under the CCPA, or such longer period…"

- [x] 🟩 **Step 6: Trade-name disclosure parity** (Subscription + Cookie)
  - [x] 🟩 Pre-incorporation `<p>` added to bottom of both, matching Privacy + Terms wording

- [x] 🟩 **Step 7: Currency conversion clarity** (Subscription §4)
  - [x] 🟩 Now explicitly: "Prices on the Mind Compass website are displayed in EUR. If your payment method is denominated in a different currency, your bank or card issuer performs the conversion at its own rate."

- [x] 🟩 **Step 8: Date refresh** — no-op, already at today's date (June 1, 2026)

- [x] 🟩 **Step 9: Local verification**
  - [x] 🟩 All 4 `localhost:8080/legal/*.html` → 200 OK
  - [x] 🟩 Internal links between docs intact (verified via grep)

- [x] 🟩 **Step 10: Pre-PR sanity**
  - [x] 🟩 `git diff --stat`: 4 files, +76/-43
  - [x] 🟩 Email retained as alternative cancel method (not primary)
  - [x] 🟩 Trade-name disclosure now in all 4 docs (was 2)
  - [x] 🟩 Medical disclaimer only in Terms + Subscription (correct scope)
  - [x] 🟩 In-app cancel ("Profile → Subscription") in both Terms + Subscription
  - [x] 🟩 Age gate ("eighteen (18) years or older") in Terms
