# AI Coach v2 — Implementation Plan

**Overall Progress:** `95%`

**Issue:** [#54](https://github.com/johnbukhin/ai-dopamine-cursor/issues/54)
**Branch:** `feat/issue-54-ai-coach-v2`

## TLDR
Глобально підняти якість AI Coach: (1) переписати system prompt — гнучкий, evidence-based, без жорсткої рамки і зайвого whitespace; (2) додати "New conversation" reset з опційним збереженням попереднього чату як memory summary; (3) додати 3 high-impact UX дрібниці (starter prompts, quick-reply chips, copy/regenerate, three-dot typing); (4) ввести $1 / 3-місяці spend cap per user, що покриває Coach + Daily Insight + summarize calls.

## Critical Decisions

### Locked from `/explore`
- **Reset clears single shared chat** — Coach tab і Urge Help modal живуть в одному `chatHistory` state. Без per-surface розділення.
- **Memory shape:** one overwritable summary in new `coach_memory(user_id PK, summary, updated_at)`. Next summarize-call's input includes prior summary → агрегується, не стекається.
- **Save UX:** sync — модалка показує "Saving…" 1-3 сек.
- **Streaming → out of scope** (виноситься у follow-up issue).
- **Quick-replies:** static hardcoded (3 chips).
- **Spend cap counts:** Coach + Daily Insight + summarize (єдиний bucket).
- **Backfill:** lazy — row створюється при першому LLM call після деплою.
- **Quota UX:** input замінюється banner'ом "Quota reached. Resets {date}.", input disabled.

### Research synthesis (informs Scope 1 prompt + Scope 3 features)
Best practices з Woebot / Wysa / Headspace AI (Ebb) / Replika / Finch:
- **Validate first** — ніколи не стрибати одразу в рішення.
- **Reflective listening** — перефразувати те що сказав юзер.
- **One focused question** — не список запитань.
- **Short responses** — 2-4 речення типово; bullet-листи рідкі, тільки коли реально перелік.
- **Concrete next step** — коли пропонуємо дію, ОДНА річ, не три.
- **Минімум markdown** усередині відповідей (bold sparingly, no headers всередині response).
- **Тон:** non-judgmental, warm, друг-який-розуміється а не therapist-роль.
- **Therapeutic frame:** CBT (cognitive reframe), MI (open questions, eliciting change talk), ACT (acceptance + values-action).

**Response length norms (target):**
| Тип запиту | Cap |
|---|---|
| Чиста валідація / коротка реакція | ≤300 chars |
| Reflection + 1 question | ≤500 chars |
| Reframe + action | ≤800 chars |
| Urge mode (acute) | ≤500 chars, punchy |

### Top 3 minor UX (Scope 3, ranked by impact/cost)
Скоротив з 6 до 3 базуючись на принципі "не ускладнювати":
1. **Empty-state starter prompts** — 3 кнопки в чаті при першому відкритті (welcome message stays, chips під ним). Усуває cold-start friction.
2. **Static quick-reply chips під assistant message** — `Tell me more` / `Give me an action` / `Different approach`. 0 LLM cost.
3. **Three-dot typing indicator** — replace spinner на анімовані 3 крапки (animate-pulse stagger). Виглядає природніше, ~10 рядків коду.

**Свідомо НЕ робимо** в цьому тикеті: copy message, regenerate response, haptic, sound, streaming. Якщо метрики покажуть потребу — окремий тикет.

## Tasks

- [x] 🟩 **Step 1: Database migrations**
  - [x] 🟩 Created `supabase/migrations/20260603_llm_usage.sql` — table + atomic RPC `track_llm_spend(p_user_id, p_cost)` with conditional 3-month reset baked into the ON CONFLICT branch.
  - [x] 🟩 Created `supabase/migrations/20260603_coach_memory.sql` — table + RLS `auth.uid() = user_id`.
  - [x] 🟩 RPC re-scoped to accept trusted `p_user_id` from server-side (invoked via service role); no SECURITY DEFINER needed because we explicitly pin the EXECUTE grant to `service_role`.
  - [ ] 🟥 Apply migrations in Supabase Dashboard (deferred to `/review` / pre-deploy step)

- [x] 🟩 **Step 2: Backend — spend tracking + cap enforcement**
  - [x] 🟩 New `webapp/api/_lib/spend.js` — `QUOTA_USD`, `checkQuota(userId)`, `costFromUsage(usage)`, `recordSpend(userId, cost)`.
  - [x] 🟩 Wired into `webapp/api/coach.js` — pre-call quota gate returns 402 with `periodEndsAt`; post-call `recordSpend` is fire-and-forget.
  - [x] 🟩 Wired same pattern into `webapp/api/daily-insight.js`.

- [x] 🟩 **Step 3: Backend — chat reset endpoint + memory**
  - [x] 🟩 New `webapp/api/coach-reset.js`:
    - Path A (discard or empty): wipes both `coach_messages` AND `coach_memory` rows. No LLM call.
    - Path B (save): quota check → fetch existing memory (if any) → summarize with `SUMMARY_SYSTEM_PROMPT` (max 300 tokens) → upsert `coach_memory` → wipe `coach_messages`. Spend recorded.

- [x] 🟩 **Step 4: System prompt rewrite (Scope 1)**
  - [x] 🟩 Rewrote `webapp/prompts/aiCoach.ts` — flexible response shape (validation only / reflection + question / reframe + action / urge mode), evidence-based toolkit (CBT/MI/ACT), explicit response-length caps, anti-patterns list ("Don't open with formulas like 'I hear you'…").
  - [x] 🟩 `buildCoachSystemPrompt(context, memoryNote?)` — memory note injected as `PRIOR CONVERSATION SUMMARY` block when present.
  - [x] 🟩 `claudeService.ts` fetches memory note once per session (module-level cache); `invalidateMemoryCache()` exported for logout + reset paths.

- [x] 🟩 **Step 5: Frontend — AICoach component**
  - [x] 🟩 Reset button (small, right-aligned, above messages) — visible in both Coach tab and CoachModal modes once there's ≥1 real message.
  - [x] 🟩 `ResetChatModal` with two buttons + sync "Saving…" / "Clearing…" states + inline error fallback.
  - [x] 🟩 After successful reset → `setMessages([COACH_WELCOME_MESSAGE])`. Memory cache invalidated server-side wipe + client-side via `invalidateMemoryCache()` inside `resetCoachChat`.
  - [x] 🟩 Three starter chips below welcome (`COACH_STARTER_PROMPTS` in `constants.ts`) — only when `messages.length === 1`.
  - [x] 🟩 Three static quick-reply chips after each assistant message (`COACH_QUICK_REPLIES`) — hidden when input has typed text.
  - [x] 🟩 `<TypingDots />` — 3 spans with staggered `animationDelay`, replaces the spinner.
  - [x] 🟩 `<QuotaBanner />` — replaces entire input footer when `quotaEndsAt` state is set (from either a 402 on send OR a 402 from reset).

- [x] 🟩 **Step 6: Frontend — client-side wiring**
  - [x] 🟩 `claudeService.ts` returns `ServiceResult` discriminated union (`text` / `quota_exceeded` / `auth_error` / `server_error`). Memory fetched + injected automatically.
  - [x] 🟩 `AICoach.tsx` branches on result kind — falls back to `FALLBACK_COPY` strings for non-quota errors; only writes to DB on `kind: 'text'`.
  - [x] 🟩 `DailyCheckIn.tsx` — on quota_exceeded, sets `aiInsight = 'Insight skipped — AI quota reached. Resets next cycle.'` instead of blocking check-in save.

- [x] 🟩 **Step 7: QA + smoke test (local)**
  - [x] 🟩 `npm run build` (project's `tsc && vite build`) — passes clean, 2097 modules transformed, no errors.
  - [x] 🟩 `bash scripts/smoke-test.sh` against prod — 7/9 prod checks pass; 2 fails are missing local env vars (Stripe smoke), not regressions.
  - [ ] 🟥 Manual local QA (deferred to `/review` and `/peer-review`): send 3 Coach messages, exercise both reset paths, temp-flip `QUOTA_USD` to verify banner.
  - [ ] 🟥 Apply migrations + push branch → re-run smoke-test.sh against deployed prod.

## Non-goals (explicit reminder)
- ❌ Streaming responses (follow-up issue)
- ❌ Copy / regenerate buttons (defer)
- ❌ Haptic / sound (defer)
- ❌ Soft warning UI on 80% budget
- ❌ Prompt caching / rolling summary mid-chat
- ❌ Backfill script for existing users
- ❌ Per-surface chat split

## Files touched
**New:**
- `supabase/migrations/<date>_llm_usage.sql`
- `supabase/migrations/<date>_coach_memory.sql`
- `webapp/api/_lib/spend.js`
- `webapp/api/coach-reset.js`
- `webapp/components/ResetChatModal.tsx`
- `webapp/components/QuotaBanner.tsx` (or inline in AICoach)
- `webapp/components/TypingDots.tsx` (or inline)

**Modified:**
- `webapp/prompts/aiCoach.ts` — full rewrite
- `webapp/services/claudeService.ts` — memory fetch, quota signal, updated signatures
- `webapp/api/coach.js` — pre-check + post-record
- `webapp/api/daily-insight.js` — pre-check + post-record
- `webapp/components/AICoach.tsx` — reset button, starter chips, quick-replies, typing dots, quota banner
- `webapp/App.tsx` — clear `chatHistory` after reset

## Risks + mitigations
- **Prompt regression** — нинішня рамка комусь може подобатися. Manual QA з ≥5 різними інпутами (urge, reflection, log relapse, vague feeling, direct action request) перед merge.
- **RPC race condition** — `track_llm_spend` всередині транзакції з row-level lock через `UPDATE`. Перевірити в SQL що `UPDATE ... WHERE user_id = $1 RETURNING *` блокує паралельні writes.
- **Memory leakage** — `coach_memory` має ті ж RLS правила що `coach_messages`. Перевірити що anon client читає тільки свій row.
- **Daily Insight 402** — не блокуємо check-in save. Tested in Step 7.

## Approval
Чекаю `/execute` коли план OK.
