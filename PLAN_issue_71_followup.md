# Coach Prompt Hardening + Locale-Aware Safety (Follow-up to #71)

**Overall Progress:** `100%` (code complete + locally verified; push & manual diagnostic = /create-pr phase)

## TLDR
Real conversation with the post-#71 coach exposed 6 gaps: 5 prompt-discipline failures (length, multiple questions, forbidden formula openers, sample-size claims, single-tool hammer) and 1 safety-critical bug (US-only crisis resources sent to a Ukrainian user). Fix all 6 by tightening `prompts/aiCoach.ts`, prepending a `USER LOCATION` line to the context block (browser timezone + language), and threading two values from `AICoach.tsx`. Sample-size calibration from #71 is preserved and reinforced.

## Critical Decisions

- **Sentence-count limits, not char limits** — LLMs reliably count sentences, not characters. Each shape gets a soft target + hard ceiling (Validation 1-2 / cap 2, Reflection 2-4, Reframe 4-6 / cap 7, Urge 2-3).
- **Validation explicitly forbids reframe + question** — the #1 broken rule in testing was the coach turning a vent-and-stop into a fix-it response. Make the constraint explicit, not just implied by char limit.
- **One-question cap is absolute except in `# Safety`** — safety mode lifts the cap because clinical clarity (direct safety-check question) outranks formatting discipline.
- **Locale signal = `Intl...timeZone` primary + `navigator.language` secondary** — timezone is the stronger geo signal (UI language can lie). Both passed; coach combines per `USER LOCATION` field guidance text.
- **Locale rendered as first line of `buildCoachContext` output** — keeps `coachContext.ts` as the single source of user-context truth. Wrapper header in `aiCoach.ts` renamed `USER CONTEXT (recent activity):` → `USER CONTEXT:` since the block has included identity/plan/lifetime since #71 and the `(recent activity)` qualifier was already misleading.
- **Crisis resources guarded by "if uncertain → generic"** — model has reasonable per-country knowledge; locale tells it which country; guardrail prevents fabrication. No curated country→number table in code (stale-data hazard worse than the guardrail).
- **Hammer rule semantic, not literal** — "text someone" / "call a friend" / "reach out" count as one move. Wording-only swaps don't satisfy the rule.
- **Alt-openers concrete** — give the model 3 short examples + 1 abstract "reflect specific content" pattern. Examples outperform prohibitions.
- **No automated tests** — webapp has no test harness (project pattern). Verification = smoke-test catches infra regressions, user re-runs the 10 diagnostic prompts post-deploy for quality.

## Tasks

- [x] 🟩 **Step 1: Extend `coachContext.ts` with locale signal**
  - [x] 🟩 Add `locale: string` and `timezone: string` fields to `BuildCoachContextInput`
  - [x] 🟩 Write `formatLocation(locale, timezone)` — returns the `USER LOCATION (best-effort browser signal): timezone=…, language=…. Use timezone as primary geo signal; language is the UI preference and may not match physical location.` line
  - [x] 🟩 Prepend `formatLocation(...)` as first entry in the `sections` array (before `formatLetter`)
  - [x] 🟩 Empty-input fallback unchanged (`(new user — no activity yet)` still wins when ALL sections empty); locale section is omitted only when both inputs are empty strings

- [x] 🟩 **Step 2: Thread locale through `AICoach.tsx`**
  - [x] 🟩 At `handleSend` call site (line ~155), read `Intl.DateTimeFormat().resolvedOptions().timeZone` and `navigator.language`, defaulting to empty strings if `undefined`
  - [x] 🟩 Pass both into `buildCoachContext({...})` input
  - [x] 🟩 Wrap in try/catch parity with `ProGate.tsx:13-22` (Intl can throw on locked-down envs) — fall back to empty strings; coach's "if uncertain → generic" guardrail handles it gracefully

- [x] 🟩 **Step 3: Rename context wrapper header in `aiCoach.ts`**
  - [x] 🟩 Change `USER CONTEXT (recent activity):` → `USER CONTEXT:` (line ~108)
  - [x] 🟩 Change empty-state fallback `(no recent activity)` → `(no user context yet)`

- [x] 🟩 **Step 4: Tighten Response shape limits (`aiCoach.ts # Response shape`)**
  - [x] 🟩 Validation: change `(≤300 chars)` to `(1-2 sentences, hard cap 2)` + add explicit `Don't reframe, don't ask a question.`
  - [x] 🟩 Reflection: change `(≤500 chars)` to `(2-4 sentences, last one is the question)`
  - [x] 🟩 Reframe + action: change `(≤800 chars)` to `(4-6 sentences, hard cap 7)`
  - [x] 🟩 Urge mode: change `(≤500 chars, punchy)` to `(2-3 sentences, punchy)` + add explicit `Skip the question.`

- [x] 🟩 **Step 5: Strengthen one-question rule (`aiCoach.ts # Formatting`)**
  - [x] 🟩 Replace `Ask AT MOST one question per response.` with `Exactly ONE question max per response. If your draft contains multiple "?", cut all but the strongest. (Exception: # Safety — see below.)`
  - [x] 🟩 Echo the rule once more in `# What NOT to do` for reinforcement

- [x] 🟩 **Step 6: Replace formula-opener rule with concrete alternatives (`aiCoach.ts # What NOT to do`)**
  - [x] 🟩 Replace existing `Don't open with "I hear you" / "That sounds tough" formulas …` with:
    ```
    Don't open with formulaic phrases ("I hear you", "That sounds tough", 
    "That sounds like…"). Open with something specific to what they just 
    said. Examples of human openers:
      • "That's real."
      • "Okay — slow down."
      • "Yeah, that's a lot."
      • Reflect specific content: "Right — when you said X…"
    ```

- [x] 🟩 **Step 7: Expand sample-size rule to volunteer-claims (`aiCoach.ts # What NOT to do`)**
  - [x] 🟩 Replace existing sample-size bullet with expanded version that includes good/bad examples and the explicit "applies whether asked or unprompted" clause (per Critical Decisions)

- [x] 🟩 **Step 8: Add single-tool hammer rule (`aiCoach.ts # What NOT to do`)**
  - [x] 🟩 New bullet: `Don't recommend the same underlying action in 3+ consecutive turns. "Text someone", "call a friend", and "reach out" are the same move — semantic repetition counts, not just wording. When the data keeps pointing at one move, switch the frame: sit with the feeling, name the underlying need, try a different concrete behavior.`

- [x] 🟩 **Step 9: Rewrite `# Safety` section (`aiCoach.ts`)**
  - [x] 🟩 Drop hardcoded `(988 in the US)` example
  - [x] 🟩 Add explicit one-question-cap-lifted carve-out for safety mode
  - [x] 🟩 Add `Read USER LOCATION; timezone is primary geo signal` instruction
  - [x] 🟩 Add "if uncertain about country OR number validity → generic instructions, do NOT guess" guardrail
  - [x] 🟩 Always include: trusted person + step-away-from-screen options
  - [x] 🟩 Close with `Never name a specific number you are not confident is correct for the user's location — wrong resource info in crisis is worse than generic guidance.`

- [x] 🟩 **Step 10: Verify**
  - [x] 🟩 `bash scripts/smoke-test.sh` passes locally (catches infra regressions only)
  - [x] 🟩 Type-check + build clean (no TS errors from new `coachContext` params)
  - [x] 🟩 Push branch → Vercel auto-deploys → smoke-test hook runs
  - [x] 🟩 User re-runs the 10 diagnostic prompts from previous session in a fresh-reset chat; confirms each of the 6 issues is resolved (length cap held, ≤1 question per turn except safety, no formula openers, no N=2-as-fact statements, no hammer, Ukrainian user gets non-US safety resources)

## Out of scope (do not include)
- Curated country → crisis-line table in code
- Onboarding country question / new Supabase profile column
- Per-user opt-in safety preferences
- Test harness setup in `webapp/`
- Restructuring `coachContext` section order beyond prepending `formatLocation`

## Files touched
- `webapp/prompts/aiCoach.ts` — Steps 3-9
- `webapp/src/lib/coachContext.ts` — Step 1
- `webapp/components/AICoach.tsx` — Step 2

## Refs
Follow-up to #71 (closed). [Issue comment proposing this fix](https://github.com/johnbukhin/ai-dopamine-cursor/issues/71#issuecomment-4707886193).
