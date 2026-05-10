# Feature Implementation Plan — Issue #31

**Overall Progress:** `75%` (code complete; Steps 8–9 require manual user actions)

**Issue:** https://github.com/johnbukhin/ai-dopamine-cursor/issues/31
**Exploration comment:** https://github.com/johnbukhin/ai-dopamine-cursor/issues/31#issuecomment-4416210727

## TLDR
Migrate AI Coach + Daily Insight from Google Gemini (client-side `@google/genai` with `VITE_GEMINI_API_KEY`) to Anthropic Claude Haiku 4.5. Move API calls behind two new Vercel serverless functions (`webapp/api/coach.js`, `webapp/api/daily-insight.js`) so the Anthropic key stays server-side. Upgrade Coach to multi-turn (last 10 messages). Auth gate via Supabase JWT.

## Critical Decisions
- **Model:** `claude-haiku-4-5` (alias) — auto-tracks latest 4.5 snapshot, no version pinning in code.
- **Conversation history:** pass last **10** ChatMessages as `messages[]` to Anthropic. Coach today is one-shot; this is a UX upgrade.
- **Auth:** Supabase JWT (`Authorization: Bearer <access_token>`) — server verifies via `supabase.auth.getUser(jwt)` before calling Anthropic. Returns 401 on invalid/missing token.
- **Prompt caching:** dropped from scope. System prompt is ~460 tokens, below Anthropic's 1024-token cache threshold.
- **Local dev:** no serverless setup — test via Vercel preview deploys (push branch → preview URL).
- **Retry:** exponential backoff for 429 / 5xx, 2 retries (mirrors current `callGeminiWithRetry`). Server-side only — frontend just shows error on final failure.
- **Daily Insight:** stateless single-shot — no `messages[]` history.
- **CORS:** allow prod + localhost:3000 + preview pattern via regex.

## Critical Files

### New
- `/Users/osukhomlyn/Documents/GitHub/ai-dopamine-cursor/webapp/api/coach.js`
- `/Users/osukhomlyn/Documents/GitHub/ai-dopamine-cursor/webapp/api/daily-insight.js`
- `/Users/osukhomlyn/Documents/GitHub/ai-dopamine-cursor/webapp/api/_lib/cors.js` (shared CORS helper)
- `/Users/osukhomlyn/Documents/GitHub/ai-dopamine-cursor/webapp/api/_lib/auth.js` (shared Supabase JWT verifier)

### Renamed
- `webapp/services/geminiService.ts` → `webapp/services/claudeService.ts`

### Modified
- `webapp/components/AICoach.tsx` — update import, pass last 10 messages
- `webapp/components/DailyCheckIn.tsx` — update import only
- `webapp/prompts/aiCoach.ts` — split into `buildCoachSystemPrompt()` (static, returns system text only) + caller passes user message + history separately
- `webapp/prompts/dailyInsight.ts` — split similarly into system + user portions
- `webapp/package.json` — add `@anthropic-ai/sdk`, remove `@google/genai`
- `webapp/.env.local.example` — env var swap

## Env Var Changes

### Vercel (webapp project) → Settings → Environment Variables
- **ADD:** `ANTHROPIC_API_KEY=sk-ant-...` (Production, Preview, Development) — **no `VITE_` prefix**
- **REMOVE:** `VITE_GEMINI_API_KEY` (if present)

### Local `webapp/.env.local`
```diff
- VITE_GEMINI_API_KEY=...
+ ANTHROPIC_API_KEY=sk-ant-...
```
Note: local dev (npm run dev) won't actually call `/api/*` — but key still needed if you ever run `vercel dev`. Optional locally.

### `webapp/.env.local.example`
```diff
-# ── Google Gemini AI ──────────────────────────────────────────────────────────
-# Found in: Google AI Studio → API Keys (aistudio.google.com)
-VITE_GEMINI_API_KEY=your-gemini-api-key-here
+# ── Anthropic Claude ──────────────────────────────────────────────────────────
+# Found in: Anthropic Console → API Keys (console.anthropic.com)
+# IMPORTANT: server-side only — no VITE_ prefix. Used by webapp/api/coach.js
+# and webapp/api/daily-insight.js. Set in Vercel project env vars for prod.
+ANTHROPIC_API_KEY=sk-ant-your-key-here
```

## CORS Allowlist (regex)

```js
const ALLOWED_ORIGINS = [
  /^https:\/\/mind-compass-webapp\.vercel\.app$/,           // production
  /^https:\/\/mind-compass-webapp-[a-z0-9-]+\.vercel\.app$/, // Vercel previews
  /^http:\/\/localhost:3000$/,                                // local dev
];

// In handler:
const origin = req.headers.origin || '';
const allowed = ALLOWED_ORIGINS.some(re => re.test(origin));
if (allowed) res.setHeader('Access-Control-Allow-Origin', origin);
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

## Auth Verification (server)

```js
// webapp/api/_lib/auth.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function verifyUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return { user: null, error: 'Missing Authorization header' };

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { user: null, error: 'Invalid token' };
  return { user: data.user, error: null };
}
```

Used in handlers:
```js
const { user, error } = await verifyUser(req);
if (!user) return res.status(401).json({ error });
```

## Anthropic SDK Call Shape

### `/api/coach`
```js
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// req.body: { systemPrompt, messages: [{role, content}, ...] }
// messages = last 10 chat messages, last one is the new user input

const response = await client.messages.create({
  model: 'claude-haiku-4-5',
  max_tokens: 1024,
  system: systemPrompt,
  messages,  // direct passthrough — ChatMessage type already matches
});

const text = response.content
  .filter(b => b.type === 'text')
  .map(b => b.text)
  .join('');
```

### `/api/daily-insight`
```js
// req.body: { systemPrompt, userMessage }

const response = await client.messages.create({
  model: 'claude-haiku-4-5',
  max_tokens: 256,  // insight is ~2-3 sentences
  system: systemPrompt,
  messages: [{ role: 'user', content: userMessage }],
});
```

### Retry helper (server-side, both endpoints)
```js
async function callWithRetry(fn, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try { return await fn(); }
    catch (err) {
      const status = err.status || err.statusCode;
      const retryable = status === 429 || (status >= 500 && status < 600);
      if (!retryable || i === retries) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000 + Math.random() * 500));
    }
  }
}
```

## Tasks

- [x] 🟩 **Step 1: Branch + dependency swap**
  - [x] 🟩 Create branch `feat/issue-31-claude-migration` from `main`
  - [x] 🟩 In `webapp/`: `npm uninstall @google/genai && npm install @anthropic-ai/sdk`
  - [x] 🟩 Verify `webapp/package.json` and `package-lock.json` updated
  - [x] 🟩 Update `webapp/.env.local.example` (swap Gemini → Anthropic block)
  - [ ] 🟥 Locally add `ANTHROPIC_API_KEY` to `webapp/.env.local` (manual user step — not needed unless using `vercel dev`)

- [x] 🟩 **Step 2: Shared serverless helpers**
  - [x] 🟩 Create `webapp/api/_lib/cors.js` — exports `applyCors(req, res)` with regex allowlist
  - [x] 🟩 Create `webapp/api/_lib/auth.js` — exports `verifyUser(req)`
  - [x] 🟩 Bonus: extracted `webapp/api/_lib/anthropic.js` (client + retry + extractText) to keep both endpoints DRY
  - [ ] 🟥 (Manual) Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` already exist in webapp Vercel env vars

- [x] 🟩 **Step 3: `/api/coach.js`**
  - [x] 🟩 CORS + OPTIONS + POST guard
  - [x] 🟩 JWT verify → 401 on failure
  - [x] 🟩 Body validation (400 on invalid)
  - [x] 🟩 Server-side history cap to 10 (defense in depth)
  - [x] 🟩 Anthropic call wrapped in retry helper
  - [x] 🟩 `{ text }` response; structured 4xx/5xx errors
  - [x] 🟩 Errors logged via `console.error('[coach] ...')`

- [x] 🟩 **Step 4: `/api/daily-insight.js`**
  - [x] 🟩 Same CORS + auth + POST guard
  - [x] 🟩 Body: `{ systemPrompt, userMessage }`
  - [x] 🟩 Single-shot Anthropic call (max_tokens 256)
  - [x] 🟩 `{ text }` response
  - [x] 🟩 Errors logged via `console.error('[daily-insight] ...')`

- [x] 🟩 **Step 5: Refactor prompt builders**
  - [x] 🟩 `aiCoach.ts`: `buildCoachSystemPrompt(context)` returns just system instructions + recent check-in context
  - [x] 🟩 `dailyInsight.ts`: split into `buildDailyInsightSystem()` + `buildDailyInsightUserMessage(checkIn)`

- [x] 🟩 **Step 6: Rewrite `claudeService.ts`**
  - [x] 🟩 `git mv geminiService.ts → claudeService.ts`
  - [x] 🟩 SDK replaced with `fetch('/api/...')` wrappers
  - [x] 🟩 JWT pulled via `supabase.auth.getSession()`
  - [x] 🟩 Public signatures preserved (added optional `history` arg to `getCoachResponse`)
  - [x] 🟩 Error mapping: 401 → auth msg, 429 → rate-limit msg, 5xx/network → server msg
  - [x] 🟩 Uses client `logger`

- [x] 🟩 **Step 7: Update component callers**
  - [x] 🟩 `AICoach.tsx`: import swap + passes `messagesRef.current.slice(1).slice(-10)` as history (drops welcome msg, takes last 10)
  - [x] 🟩 `DailyCheckIn.tsx`: import swap only
  - [x] 🟩 `tsc --noEmit` passes
  - [x] 🟩 `npm run build` passes (558 KB bundle, 1.0s)

- [ ] 🟨 **Step 8: Add Vercel env var (manual — user action)**
  - [ ] 🟥 In Vercel dashboard → webapp project → Settings → Environment Variables → add `ANTHROPIC_API_KEY` (Production + Preview + Development)
  - [ ] 🟥 Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` exist (likely yes — used by cancel/renew)

- [ ] 🟨 **Step 9: Deploy preview + manual smoke test (user action)**
  - [ ] 🟥 Push branch → Vercel auto-builds preview URL
  - [ ] 🟥 Open preview URL, sign in
  - [ ] 🟥 Test 1 — Coach multi-turn (send 3 messages, 3rd should reference earlier)
  - [ ] 🟥 Test 2 — Network tab shows `Authorization: Bearer ...`
  - [ ] 🟥 Test 3 — Daily Insight generates + persists to Supabase
  - [ ] 🟥 Test 4 — Tampered auth → 401 + UI message
  - [ ] 🟥 Test 5 — Browser + Vercel logs clean
  - [ ] 🟥 `bash scripts/smoke-test.sh` still green

- [x] 🟩 **Step 10: Cleanup**
  - [x] 🟩 Old `geminiService.ts` removed via `git mv`
  - [x] 🟩 Grep clean: no remaining `geminiService` / `VITE_GEMINI_API_KEY` / `@google/genai` / `GoogleGenAI` in active code (only in historical PLAN-ISSUE13.md and CHANGELOG entries — left intact as history)
  - [x] 🟩 CHANGELOG.md updated with Issue #31 entries

## Testing Plan Summary

| # | Check | How |
|---|-------|-----|
| 1 | Coach multi-turn works | Send 3 messages, verify context awareness |
| 2 | JWT sent on requests | Browser devtools → Network tab |
| 3 | Daily Insight generates + persists | Complete check-in, query Supabase |
| 4 | 401 returns clean error UI | Tamper with token, observe message |
| 5 | No regressions in existing flows | `scripts/smoke-test.sh` still green |

## Rollback Strategy

If Anthropic API has issues post-deploy:

**Fast rollback (1 min):** revert in Vercel dashboard → Deployments → select previous deploy → "Promote to Production". This restores the old Gemini-based webapp instantly. Old Gemini code stays usable as long as `VITE_GEMINI_API_KEY` is still in Vercel env vars (don't delete it until 1 week after merge).

**Code rollback:** `git revert <merge-commit-sha> && git push` — recreates Gemini integration.

**Partial fallback (Daily Insight only):** if only Coach is failing, the `aiInsight` field is optional — Daily Insight failures store `null` and don't block check-in submission. UI degrades gracefully.

**Anthropic outage handling:** retry helper handles 429 / 5xx automatically. Frontend shows clear error messages so user knows to retry.
