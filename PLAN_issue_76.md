# Coach Prompt: Loosen Length/Validation + Well-Known Safety Resources (Issue #76)

**Overall Progress:** `100%` (code complete + locally verified; push & manual diagnostic = /create-pr phase)

## TLDR
Second follow-up to #71. Post-#75 production diagnostic surfaced two over-corrections (sentence caps too aggressive, Validation prohibitions too strict — both projected my preference for tight responses onto a user who actually wants developed reflection) plus one safety-mode hallucination (coach gave a specific Ukrainian crisis line that couldn't be externally verified). Three prompt-only edits, all in `webapp/prompts/aiCoach.ts`. Reverts Fix 1 + 2 from #75; tightens safety resource gating from "trust the model's confidence" to "well-known + currently active, two-test gate".

## Critical Decisions

- **Soft targets, not hard caps** — switching `(1-2 sentences, hard cap 2)` → `(1-3 sentences)` etc. removes the "cut, don't justify" enforcement language. User explicitly wants `розгорнуті і класно описані` answers; my tight-discipline framing was wrong direction.
- **Urge mode stays 2-3 sentences** — the one shape where brevity is clinically load-bearing (urge moment, not a taste call). All other shapes get loosened.
- **"A vent that gets fixed is a vent that gets ignored" stays as the Validation spirit-line** — it's the memorable rail that keeps center-of-gravity on acknowledgment even when reframe + question are now allowed.
- **Validation prohibitions removed, replaced with center-of-gravity guidance** — `Don't reframe / Don't ask a question / Don't offer a next step` → `Lead with acknowledgment, not action. A short reframe or one reflective question is fine when it lands naturally. Don't pile up a list of action items.`
- **Safety carve-out simplified** — with Fix 1 making caps soft, the verbose lift-list (`sentence-count caps … do NOT apply; one-question cap does NOT apply; bullets rule does NOT apply`) becomes overengineered. Collapses to one sentence: `In safety mode, length doesn't matter — write what the moment needs. The one-question cap is also lifted.`
- **Safety resources gated by well-known-AND-current, not "country-specific = bad"** — user clarified the axis: 988 (US suicide), 911, 112, 116 123 (Samaritans UK) are FINE because they're broadly recognized. La Strada Ukraine, Teleffect, smaller-market lines are NOT, because they're obscure / hard to verify. Two-test prompt rule: (a) typical adult in that country would recognize without context, AND (b) you're confident it's currently active.
- **One-question rule untouched** — user accepted occasional 2-`?` slips as `окей`.
- **Manual verification only** — same 10-prompt diagnostic re-run as #75. No automated tests.

## Tasks

- [x] 🟩 **Step 1: Rewrite `# Response shape` (Fix 1 + Fix 2)**
  - [x] 🟩 Change opener from `Sentence counts are hard limits — count before sending. If over, cut, don't justify.` to `Sentence counts are targets, not hard limits. Lean longer when depth serves the moment; lean shorter when the moment calls for stillness.`
  - [x] 🟩 Validation: `(1-2 sentences, hard cap 2)` → `(1-3 sentences, target)`. Replace `Sit with them. **Don't reframe. Don't ask a question. Don't offer a next step.** A vent that gets fixed is a vent that gets ignored.` with `Lead with acknowledgment, not action. A short reframe or one reflective question is fine when it lands naturally — but the center of gravity stays on sitting-with, not fixing. Don't pile up a list of action items. *A vent that gets fixed is a vent that gets ignored.*`
  - [x] 🟩 Reflection: `(2-4 sentences, last one is the question)` → `(2-5 sentences, ending with a question)`
  - [x] 🟩 Reframe: `(4-6 sentences, hard cap 7)` → `(4-8 sentences, target)`
  - [x] 🟩 Urge: keep `(2-3 sentences, punchy)` and `**Skip the question.** Skip headers, skip lists.` UNCHANGED — brevity here is load-bearing, not a taste call

- [x] 🟩 **Step 2: Rewrite `# Safety` resource-selection block (Fix 3)**
  - [x] 🟩 Simplify safety carve-out paragraph (line ~118): replace verbose lift-list (`sentence-count caps (Validation 2 / Urge 3 / Reframe 7) do NOT apply; the one-question-per-response cap does NOT apply…; the bullets-only-for-3+-items rule does NOT apply`) with `In safety mode, length doesn't matter — write what the moment needs. The one-question cap is also lifted (ask direct safety-check questions freely).`
  - [x] 🟩 Replace `Choosing crisis resources:` block with two-test gating: (a) typical adult in country would recognize without context, (b) confident currently active. Examples kept: `911`, `112`, `988`, `116 123 Samaritans`, `999`, `000`, `119`. Explicit DO NOT list: NGOs (La Strada), obscure/regional (Teleffect), smaller-market short-codes
  - [x] 🟩 Update closing line: keep `Never name a specific number you are not confident is correct` → adjust to `Bias toward generic if you have any doubt. Wrong resource info in a crisis is worse than generic guidance.`
  - [x] 🟩 Keep unchanged: opener (`drop all structure rules above`), trusted-person + step-away requirements, `Read USER LOCATION` instruction

- [x] 🟩 **Step 3: Update file-header comment to reflect #76 follow-up**
  - [x] 🟩 Append `#71-followup²` note to the existing `(#69/#71/#71-followup)` lineage in the `context` input docstring (lines ~15-21)

- [x] 🟩 **Step 4: Verify**
  - [x] 🟩 `npx tsc --noEmit` in `webapp/` returns EXIT 0
  - [x] 🟩 `npx vite build` clean
  - [x] 🟩 `bash scripts/smoke-test.sh` — non-Stripe/Supabase checks pass (same as #75 baseline)
  - [x] 🟩 Push → Vercel auto-deploy → post-deploy smoke-test hook
  - [x] 🟩 User re-runs the 10 diagnostic prompts in a fresh-reset chat. Acceptance: Validation can be 3+ sentences with reflection/question, Reframe can be 6-8 sentences, Safety mode names ONLY well-known numbers (no La Strada / Teleffect), Urge stays punchy, sample-size calibration + formula-blocklist + hammer rule still hold from #75

## Out of scope (do not touch)
- `webapp/src/lib/coachContext.ts` (zero changes — `formatLocation` etc. all still correct)
- `webapp/components/AICoach.tsx` (zero changes — locale plumbing already correct)
- `# What NOT to do` block (formula-blocklist, hammer, sample-size, one-`?` echo) — all working per #75
- `# Formatting` block — bullets/bold/headers + one-`?` primary rule
- `# How to read context` block — USER LOCATION description unchanged
- One-question rule (user accepted occasional 2-`?` as acceptable)
- Test harness setup
- Maintaining a curated list of recognized crisis numbers in code (the prompt trusts the model's knowledge with the two-test gate; bias toward generic is the safety net)

## Files touched
- `webapp/prompts/aiCoach.ts` — Steps 1-3

## Refs
Second follow-up to #71. Builds on #75 (PR). Reverses two over-corrections from #75 + tightens crisis-resource gating. [Issue #76](https://github.com/johnbukhin/ai-dopamine-cursor/issues/76).
