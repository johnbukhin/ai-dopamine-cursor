# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- **Dashboard right column tops + bottoms align with Streak / Check-in on desktop** (`webapp/components/Dashboard.tsx`). Added `md:row-span-2` to Streak and Check-in so they fill both grid rows; Urges Faced gets `md:self-start` (top-aligned with Streak/Check-in tops) and Urge Help gets `md:self-end` (bottom-aligned with their bottoms). On mobile the row-span no-ops (the col-span-2 items wrap naturally) so the existing vertical stack is unchanged. Refs #61.
- **Dashboard `I'm having an urge — help me` button moved into the tile grid on desktop** (`webapp/components/Dashboard.tsx`). Previously rendered as a full-width row below the Streak / Check-in / Urges Faced grid on every viewport; on desktop that gave it more visual weight than necessary and pushed the calendar further down the page. Moved INTO the grid as a fourth item with `col-span-2 md:col-span-1 md:col-start-3` — on mobile still spans the full width (same visual stack as before), on desktop slots directly under Urges Faced in column 3. Mobile behaviour byte-identical; desktop calendar moves up by one row. Refs #61.

### Fixed
- **PauseStage timer + skip button clipped off-screen on wide desktops** (`webapp/components/urgeHelp/PauseStage.tsx`). The `w-full` HelpTree hero (3:4 aspect ratio) renders at ~75% of main-pane width as its height — on a 1700px-wide main area that's ~1275px tall, larger than viewport. The centered content area (`flex flex-col items-center justify-center`) had no `overflow-y-auto`, so the timer circle and skip button pushed below the fold with no scroll mechanism. Wrapped the outer in `flex-1 overflow-y-auto` with a `min-h-full flex flex-col` inner — content stays centered when it fits, scrolls when it doesn't. Prior `min-h-0` fix already handled the other three stages (Locate/Act/Reflect) which had their own `overflow-y-auto`. Refs #61.
- **Coach replies rendering literal `*asterisks*` instead of italics** (`webapp/components/AICoach.tsx`). `formatMessage` only handled `**bold**` — Claude often emits `*italic*` for in-sentence emphasis (e.g. *"frustrated **about** right now"*), and those single asterisks were appearing as raw text inside the chat bubble. Mirrored LessonPlayer's renderInline pattern: bold split first (`\*\*.*?\*\*`), then italic (`\*[^*\n]+\*`) within each segment, so nested cases like `**Write down what you're frustrated *about* right now.**` render correctly (bold containing italic). Both regexes line-scoped so an unclosed marker can't damage more than one line. Refs #61.
- **Help tab content unscrollable on short desktop viewports** (`webapp/components/UrgeHelp.tsx` + `webapp/components/urgeActions/ActionScreenShell.tsx`). Outer wrappers used `flex-1 flex flex-col` without `min-h-0`, so the wrapper grew to its content's intrinsic height instead of being clipped to the parent flex container; `overflow-hidden` then chopped the bottom off and the inner `flex-1 overflow-y-auto` had no spare height to scroll within. Other tabs (Dashboard, Coach, Plan) sidestep this by using `h-full` directly on the scroll container, but Help routes through nested stages that each own their own scroll shell, so every level in the chain must allow shrinking. Added `min-h-0` to both outer wrappers; ActStage's grid + ActionScreenShell's middle area now scroll correctly when content exceeds viewport height. Refs #61.

### Changed (Issue #61 — follow-up: redirect to Coach tab instead of modal)
- **`I want to talk it through` now navigates to the Coach tab, not an overlay** (`webapp/App.tsx` + `webapp/components/UrgeHelp.tsx` + `webapp/components/AICoach.tsx`, `CoachModal.tsx` deleted). The previous `dvh` fix didn't resolve the mobile lockup — users still couldn't scroll or type inside the bottom-sheet modal on iOS Safari. Pivoted to the path noted in #58's deferred work: `coachSeed` + `coachAutoMessage` lifted from `UrgeHelp` to `App`, new `App.escalateToCoach(seed, autoMessage)` callback sets both and `changeView(View.AI_COACH)`. `UrgeHelp.handleReflect('escalated')` calls the callback instead of opening a modal. `AICoach` gains an `onAutoMessageConsumed` callback that fires synchronously right after `handleSend(...)` dispatch — closure capture preserves the seed for the in-flight async work, while clearing the App-level props prevents a re-fire on remount (e.g. user navigates away and back to Coach). Removed `compact` / `skipWelcome` / `awaitingAutoSend` from AICoach (one render path now), and deleted `webapp/components/urgeHelp/CoachModal.tsx` (99 lines gone). Net **−138 lines** across the four files; CSS bundle shrunk by ~2 KB and JS by ~1.7 KB. User-visible: pressing the button switches to the full-page Coach view with the divider + auto-message already sent and Coach's urge-mode reply on the way — the scroll/input bug is now physically impossible.

### Added (Issue #61)
- **Coach auto-send on `I want to talk it through`** (`webapp/components/UrgeHelp.tsx` + `webapp/components/urgeHelp/CoachModal.tsx` + `webapp/components/AICoach.tsx` + new `webapp/src/lib/urgeAutoMessage.ts`). When the user presses the escalate button on the Reflect stage, the CoachModal now mounts with a pre-built structured message (`I'm in the middle of an urge. / Feeling: anxious (7/10). / Tried: Box Breathing → 5-4-3-2-1 Grounding → Cold Water. / Still here — I want to talk it through.`) that auto-fires through `handleSend` on mount — user no longer has to type in urge-state. Template adapts: drops the `Feeling:` line if no feeling was named, drops the `Tried:` line if no actions, joins multiple actions with ` → ` in click order. One Claude call per click (not one per technique), preserving the $1 / 3-month quota.
- **`ChatMessage.role: 'divider'`** (`webapp/types.ts`) — new UI-only marker, content holds an ISO timestamp. Inserted before the auto-message when the chat is non-empty so accumulated urge sessions read as distinct moments rather than one blob. Rendered as horizontal rule + label `New urge session · 2:34 PM` (short date appended if ≥24h old). Persisted to `coach_messages` so users see past sessions when reopening the Coach, but filtered out of the Anthropic payload and `/api/coach-reset` summarizer (Anthropic rejects any role other than `user`/`assistant`).
- **`UrgeContextSeed.actionsTried[]`** (`webapp/types.ts`) — replaced `actionAttempted: UrgeActionId | null` (last-only). Both the system-prompt context block (`formatUrgeContext` in `AICoach.tsx`) and the auto-message template now render the full coping chain in order, so Claude knows everything the user already tried this session.

### Changed (Issue #61)
- **Welcome message suppressed in Help-flow modal** (`webapp/components/AICoach.tsx`). New `skipWelcome = compact && autoMessage != null` derived flag hides the hardcoded `Hello. I'm your Mind Compass coach…` bubble when the modal opens via auto-send — the user lands on their own context message + Coach's urge-mode reply, not a generic greeting. Coach tab and non-auto-send paths still show the welcome unchanged.
- **`AICoach.handleSend` signature gained `prependedDivider?: ChatMessage` second arg**, used only by the auto-send `useEffect`. Lets the divider and user message land in the SAME `setMessages` call (avoids a second update racing with `messagesRef`). Persist closure mirrors the change — divider is included in the `toStore` array alongside the user message.

### Fixed (Issue #61)
- **CoachModal scroll/input broken on mobile** (`webapp/components/urgeHelp/CoachModal.tsx`). `max-h-[90vh] md:max-h-[85vh]` → `max-h-[90dvh] md:max-h-[85dvh]`. The static `vh` unit includes the area occupied by the iOS/Android virtual keyboard, pushing the input footer off-screen and breaking scroll when the user tried to type. `dvh` (dynamic viewport height, Safari 15.4+ / Chrome 108+) recalculates as the keyboard opens, keeping the input footer reachable and the message scroll area sized correctly.
- **Reset chat button + quick-reply chips no longer flash on first paint of the auto-send modal** (`webapp/components/AICoach.tsx`). With `skipWelcome` inverting `isEmpty` to `false` while only the (hidden) welcome was in state, both surfaces would render for one frame before the auto-send `useEffect` appended the user message. New `awaitingAutoSend = skipWelcome && messages.length === 1` gates both off until handleSend lands.

### Changed (Issue #58 — cosmetic polish pass 2, partial)
- **Help tab — action card title + description pick up the category color** (`webapp/data/urgeData.ts` + `webapp/components/urgeHelp/ActStage.tsx`). Extended `URGE_CATEGORY_META` with two new static-literal fields per bucket: `titleClass` (`text-{color}-900`) and `descriptionClass` (`text-{color}-700/70`). Card body `text-rose-900` / `text-rose-700/70` swapped to `${meta.titleClass}` / `${meta.descriptionClass}` so each bucket reads as one tonal family. The `Best fit` badge (`bg-rose-700 text-white`) and recommended-card border (`border-rose-500 ring-2 ring-rose-200`) intentionally stay rose — they're a separate highlight layer that must pop over the category color.
- **Help tab — Locate modal sheet no longer jumps height on first slider touch** (`webapp/components/urgeHelp/LocateStage.tsx`). The middle Mild/value/Crushing `<span>` previously rendered `·` at `text-[10px]` while `intensity === null`, then jumped to `text-base font-bold` once any value was set — a ~12px line-height delta that grew the whole modal. Always rendered at the larger weight now; only the children swap (`·` placeholder ↔ number).
- **Help tab — Locate modal sheet shades within rose palette by intensity** (`webapp/components/urgeHelp/LocateStage.tsx`). New `intensityTones()` helper + `interpolateHSL()` use inline HSL interpolation to shift 5 surfaces (inner card background + border, slider `accent-color`, intensity number color, drag-handle pill) smoothly as the slider drags 1 → 10. `v=5` anchors reproduce today's Tailwind `rose-*` baseline exactly (`rose-50/100/200/700/800`), so `intensity === null` renders identically to `intensity === 5` — no first-touch jump in either height or color. Sheet outer chrome (white background, `border-rose-200`, header text, `Continue` CTA) stays constant so the modulation reads as interior depth, not a wholesale repaint. All hue anchors locked into the narrow 345°–356° band — `interpolateHSL` does plain linear lerp, NOT shortest-arc, so any anchor pair crossing 0°/360° would visibly sweep through yellow → green → blue → purple mid-range (peer-review catch). Docstring warns future editors.
- **Dashboard — `Urges Surfed` tile is an upsell button for free users** (`webapp/components/Dashboard.tsx`, `webapp/App.tsx`). New `hasUpsellAccess: boolean` prop on `Dashboard` plumbed from App state (already lives there at line 55, persisted in `localStorage` as `mc_has_upsell`). When `false`, the tile renders as `<button type="button" onClick={() => onChangeView(View.AI_COACH)}>` with `hover:bg-purple-200 transition-colors` — mirrors the sibling `I'm having an urge — help me` button pattern so the dashboard reads as a consistent affordance family. When `true`, the tile stays as the existing static `<div>`. Counter wiring unchanged: localStorage-only urge log (`mc.urge_log.v1`) is naturally frozen for users without Help access, so lapsed paid → free users keep their accumulated `Y` and it stays put.

> **Still deferred (Issue #58 Item 4):** routing the Reflect-stage `I want to talk it through` button to the Coach tab (instead of opening `CoachModal` as an overlay) is still on hold per user — requires lifting `coachSeed` from `UrgeHelp` to App-level so the urge-context seed survives the tab switch. Issue #58 remains open.

### Changed (Issue #58 — cosmetic polish pass, partial)
- **Help tab — `Stage N of 4` labels removed** (`webapp/components/urgeHelp/{Locate,Act,Reflect}Stage.tsx`) — small pink uppercase chips above each stage heading dropped; the visual progress is already conveyed by `StageProgress` above. Header `mt-6 md:mt-8` bumped to `mt-12 md:mt-14` so the `<h2>` stays at the same vertical position rather than shifting up.
- **Help tab — Locate intensity sheet is now a real modal** (`webapp/components/urgeHelp/LocateStage.tsx`) — adopted the existing `LessonBottomSheet` overlay pattern: `fixed inset-0 z-50` container with `role="dialog" aria-modal="true"`, separate backdrop element (`bg-stone-900/40 backdrop-blur-sm`) whose `animate-backdrop-in/out` timing is independent of the sheet's slide, click-outside-to-dismiss, Escape-to-dismiss, body scroll lock. Dropped the prior in-flow `absolute inset-x-0 bottom-0` sheet along with its `ResizeObserver` + `sheetHeight` plumbing and the grid's `transition-[padding]` reactive bottom-padding (now a static `pb-8`). Trade-off accepted: while the sheet is open the feelings grid is no longer tappable to swap selection — the X button / backdrop / Escape are the way to change feeling.
- **Help tab — Act category palette recoloured** (`webapp/data/urgeData.ts` `URGE_CATEGORY_META`) — each bucket gets its own hue so the four sections read as distinct toolboxes:
  - **Reset** (`Calm the body`) → `bg-emerald-100/60 border-emerald-200` + `text-emerald-700`
  - **Ground** (`Come back to now`) → `bg-teal-100/60 border-teal-200` + `text-teal-700`
  - **Protect** (`Change your environment`) → `bg-sky-100/60 border-sky-200` + `text-sky-700`
  - **Reframe** (`Shift the story`) → `bg-indigo-100/60 border-indigo-200` + `text-indigo-700`
- **Help tab — Act category subtitle inherits the accent** (`webapp/components/urgeHelp/ActStage.tsx:110`) — was hardcoded `text-xs text-rose-700/60` regardless of category; now `${meta.accent} opacity-70` so heading + subtitle read as one coloured unit per bucket. `ActionScreenShell.tsx` already reads `meta.tint`/`meta.accent` for the icon badge in the mini-screen header, so individual action screens auto-pick up the new colour with no further changes; the rest of the mini-screen chrome (background, Back, "I did this" CTA) intentionally stays rose-themed.
- **Dashboard day-detail modal — Clean Day card is now fully emerald** (`webapp/components/Dashboard.tsx` lines 420–456) — mirrors how Slip Day is fully rose. `text-purple-*` swapped to `text-emerald-*` across banner, labels, values, tag text, note text, and AI box text inside the `isClean` branches only. Day-header modal chrome (`text-purple-900` on line 402) intentionally left untouched.
- **Dashboard day-detail modal — AI insight relabel** (`webapp/components/Dashboard.tsx:498`) — `<span className="font-semibold mr-1">AI:</span>` → `<span className="font-semibold">Observation.</span>`. Dropping `mr-1` kills the double-space artifact (4px right margin + literal space between `</span>` and `{detail.aiInsight}` was rendering as ~8-9px gap).
- **Daily insight prompt — hard 3-sentence / 50-word cap** (`webapp/prompts/dailyInsight.ts:7`) — `Provide a single, short paragraph (2-3 sentences) insight.` → `Provide a single, short insight. Strict hard limits: at most 3 sentences AND at most 50 words total. Be concise; do not pad.` Soft enforcement (no client/server truncation) — minor overshoot acceptable.

> **Deferred (Issue #58 Item 4):** routing the Reflect-stage "I want to talk it through" button to the Coach tab (instead of opening `CoachModal` as an overlay) is intentionally left for a follow-up — requires lifting `coachSeed` from `UrgeHelp` to App-level so the urge-context seed survives the tab switch. Issue #58 remains open.

### Added (Issue #56)
- **`creatives/mind-compass-brand-context.ts`** — new static reference library (124 lines, `as const` TypeScript) for ad creative generation tooling (e.g. NanoBanana). Three sections currently populated: `meta` (company, EUR pricing tiers €10.50 / €19.99 / €34.99, payment methods, format definitions for hook/punchline/script), `compliance` (Meta/Google/TikTok platform rules, `forbidden_terms` list — `porn`/`pornography`/`masturbation`/`addiction` as direct medical claim/etc., `euphemism_dictionary` of drop-in swaps, `safe_framing_patterns`, `avoid_framing_patterns`), `positioning` (one-liner, differentiators around CBT + licensed mental-health review). Not imported by `funnel/` or `webapp/` — purely a reference asset for external creative-gen workflows; zero runtime impact. Verified via `tsc --noEmit` (exit 0) and `grep -r mind-compass-brand-context` returns nothing in app code.

### Added (Issue #54)
- **`/api/coach-reset` endpoint** (`webapp/api/coach-reset.js`) — "New conversation" flow. Two paths: `save=true` summarizes prior chat (folding any existing memory note in so summaries don't stack) into a ≤300-token note via Haiku 4.5, upserts `coach_memory`, then wipes `coach_messages`; `save=false` wipes both tables, no LLM call. Race-safe: both wipe helpers propagate Supabase errors so partial-success never returns 200.
- **`coach_memory` table** (`supabase/migrations/20260603_coach_memory.sql`) — one overwritable summary per user (`user_id` PK, `summary text`, `updated_at`). Same RLS pattern as `coach_messages` (`auth.uid() = user_id` FOR ALL). Injected into Coach system prompt as `PRIOR CONVERSATION SUMMARY` block by `claudeService.getMemoryNote()` (cached 30 min, invalidated on logout/reset).
- **`llm_usage` table + `track_llm_spend` RPC** (`supabase/migrations/20260603_llm_usage.sql`) — $1 / 3-month rolling spend cap covering Coach + Daily Insight + summarize. Single-row-per-user `(user_id PK, period_start_at, total_cost_usd)`; atomic `ON CONFLICT` upsert with conditional reset baked into the same statement (no SELECT-then-UPDATE race). EXECUTE pinned to `service_role` only; webapp/api uses service-role client and passes trusted `user.id` (verified upstream by `_lib/auth.js verifyUser`).
- **`webapp/api/_lib/spend.js`** — shared `checkQuota(userId)` / `costFromUsage(usage)` / `recordSpend(userId, cost)` helpers with Haiku 4.5 pricing constants (`$1/MTok in`, `$5/MTok out`). `checkQuota` fails open on Supabase read errors (won't block users on transient DB hiccups); `recordSpend` is fire-and-forget so it never blocks the user-facing response.
- **Reset chat UI** (`webapp/components/ResetChatModal.tsx` + `AICoach.tsx`) — "New conversation" button in the Coach header (visible in both Coach tab and Urge Help modal once there's ≥1 real message; disabled while a response is in flight) opens a sync modal with two actions: `Save & start fresh` (primary, purple) and `Discard & start fresh`. Shows `Saving…` / `Clearing…` states; inline error fallback keeps chat intact on failure.
- **Three empty-state starter prompts** (`COACH_STARTER_PROMPTS` in `constants.ts`) — `"I'm struggling with an urge"` / `"I want to reflect on yesterday"` / `"What pattern do you see?"`. Render under the welcome message when chat is empty; click → fills + sends immediately.
- **Three static quick-reply chips** (`COACH_QUICK_REPLIES`) — `Tell me more` / `Give me an action` / `Different approach`. Appear under each assistant turn; hidden the moment the user starts typing so the keyboard doesn't compete for attention.
- **Three-dot typing indicator** (`<TypingDots />` in `AICoach.tsx`) — replaces the spinner with 3 pulsing dots, staggered via inline `animationDelay`. Lighter visual weight, more chatbot-native feel.
- **Quota banner** (`<QuotaBanner />` in `AICoach.tsx`) — when the API returns 402, the input footer is swapped for `AI quota reached / Resets on {date}.` No disabled-button false affordance; explicit lock instead.

### Changed (Issue #54)
- **AI Coach system prompt fully rewritten** (`webapp/prompts/aiCoach.ts`) — dropped the rigid `**Status:** / **What I noticed:** / **Next step:**` template that forced every reply into the same shape. New prompt instructs the model to pick from four response shapes per turn (validation-only ≤300 chars / reflection + open question ≤500 / reframe + one action ≤800 / urge mode ≤500, punchy) based on what the user actually needs. Evidence-based grounding: CBT (cognitive reframing), Motivational Interviewing (open questions, rolling with resistance), ACT (acceptance + values-aligned action) — treated as a toolkit, not a script. Explicit anti-patterns list (no `"I hear you"` formulas, no triple-action lists, no motivational fluff) and formatting rules (plain prose default, bullets only for 3+ truly parallel items, no markdown headers inside the response, ≤1 question per turn). Optional `memoryNote` param injects prior-conversation summary as `PRIOR CONVERSATION SUMMARY` block.
- **`getCoachResponse` / `generateDailyInsight` return shape** (`webapp/services/claudeService.ts`) — `Promise<string>` → `Promise<ServiceResult>` discriminated union (`text` / `quota_exceeded` / `auth_error` / `server_error`). Callers narrow on `kind` and branch into the quota-banner path on 402; `DailyCheckIn.tsx` falls back to `"Insight skipped — AI quota reached. Resets next cycle."` so the check-in itself always saves regardless of insight state.
- **`AICoach.handleSend` persist closure guarded by two captured identities** — `startGen` (incremented by `handleResetComplete`) and `startUserId` (re-checked at write time). A response that arrives after the user reset the chat OR signed out is now silently dropped instead of resurrecting deleted messages or writing under the wrong user. Reset button also disabled while `isLoading` as defense-in-depth.
- **`COACH_WELCOME_MESSAGE` moved to `webapp/constants.ts`** — was inline in `App.tsx`; now shared so `AICoach.handleResetComplete` can restore it on reset without circular imports.
- **`webapp/api/coach.js` / `daily-insight.js` request validation precedes quota check** — a malformed request now returns 400 regardless of the user's quota state, so misbehaving clients get the right diagnostic.
- **`onKeyPress` → `onKeyDown`** in Coach input (`AICoach.tsx`) — `onKeyPress` is deprecated in React 17+.

### Security (Issue #54)
- **`track_llm_spend` RPC EXECUTE revoked from PUBLIC, granted only to `service_role`** — RPC is intentionally not callable from authenticated clients; all writes flow through `api/_lib/spend.js` after `verifyUser()` validates the JWT and passes the trusted `user.id`. Read access to own `llm_usage` row is permitted via standard RLS SELECT policy so the frontend can render the quota reset date in the banner.

### Changed (Issue #54 — post-merge follow-ups)
- **`New conversation` button — visual + position + animated pulse** (`webapp/components/AICoach.tsx` + `webapp/src/index.css`, commits `0fb0b2f` → `29bd37f` → `f6be028` → `d26d8a1`). Iterated to the final form:
  - **Pill, not link** — text-only purple link blended into the assistant message bubble; replaced with a white pill (`bg-white`, `border-2`, `shadow-sm`, `text-sm font-semibold`, `px-4 py-2`, 16px icon). Reads as a button, contrasts cleanly against the purple bubble.
  - **Centered + lifted** — `justify-end` → `justify-center` and `-mb-1` → `-mt-10 mb-2` so the pill sits roughly halfway between the hero illustration's bottom fade and the first message bubble.
  - **Pulse animation** — new `@keyframes coach-reset-pulse` in `index.css` smoothly cycles `color` (cascades to lucide icon via `currentColor`) and `border-color` over a 2.4s `ease-in-out` loop: `purple-600 → blue-600 → emerald-500 → blue-600 → purple-600`. The blue-600 midpoint at 25% / 75% keeps the RGB interpolation saturated so the transition never visibly passes through grey (the direct purple↔green RGB midpoint would). Disabled via `prefers-reduced-motion`.
- **Quick-reply chips — single row, centered, no scrollbar** (`webapp/components/AICoach.tsx`, commits `0fb0b2f` → `4a4117c`). Final form:
  - `flex-wrap` → `flex-nowrap` + `whitespace-nowrap` per chip so `Tell me more` / `Give me an action` / `Different approach` always sit on one row.
  - Tighter spacing (`gap-2` → `gap-1.5`, chip `px-3` → `px-2.5`) so all three fit at typical mobile widths (375 px+).
  - `pl-11` avatar indent dropped + `justify-center` added — the avatar indent ate enough width on 392 px viewports that the third chip overflowed and Safari painted a horizontal scrollbar. Centered without indent fits cleanly with no scrollbar.

### Added (Issue #52)
- **Data sub-tab on Profile** (`webapp/components/Settings.tsx`, new `DataSettings`) — read-only display of the user's onboarding answers, grouped into Demographics / Goals & Symptoms / Assessment / Profile. Pulls from existing `users_profile.quiz_answers` JSONB (no new table; persistence already done by `funnel/api/provision-account.js`). Forward-only — pre-`provision-account.js` users see "No profile data found".
- **`supabase/migrations/20260601_users_profile_rls.sql`** — `ENABLE ROW LEVEL SECURITY` on `users_profile` + `SELECT` policy `auth.uid() = id` so the webapp's anon client can read the row under the user's JWT. Server-side writers (`funnel/api/{provision-account,create-user}.js`) use `SUPABASE_SERVICE_ROLE_KEY` (bypass RLS) so ingestion is unaffected.
- **`webapp/scripts/copy-screens.mjs`** — `predev`/`prebuild` hook copies `funnel/funnel-v2/screens.json` → `webapp/public/data/screens.json`. Question labels in Data tab come from that file (with `Question N` fallback). Fails loudly with actionable error if source missing (e.g. partial-tree deploy without `funnel/`).
- **Terms sub-tab populated** — 4 anchor links to `/legal/{terms-of-use,privacy-policy,subscription-policy,cookie-policy}.html` on the funnel domain, opening in new tabs (`target="_blank" rel="noopener noreferrer"`). Built from `VITE_FUNNEL_URL` so a single env var stays source of truth across Login.tsx + Settings.tsx.
- **`overflow-x-auto` + `whitespace-nowrap`** on the Settings tab row — 4 tabs scroll cleanly on small phones instead of clipping or wrapping.

### Changed (Issue #52)
- **`Profile` sub-tab renamed to `Privacy`** (`ProfileSettings` → `PrivacySettings`) — same component, same contents (email read-only, password change, Log Out). Sidebar entry stays labelled "Profile" and the page hero/heading are unchanged.
- **Default Settings sub-tab → `Data`** (was `Profile`) — users land on their onboarding answers first; Privacy/Access/Terms are one click away.

### Fixed (Issue #52 — related cleanup)
- **Stale `VITE_FUNNEL_URL` fallback in 3 places** (`webapp/.env.local.example:18`, `webapp/components/Login.tsx:7`, the new `Settings.tsx` Terms tab) — value `https://ai-dopamine-cursor.vercel.app/funnel/` was set in March 2026 and never updated when PR #49 (`funnels/` flatten) removed the `/funnel/` prefix. Hardcoded URLs everywhere else in the repo (CORS allowlists in `funnel/api/*.js`, `scripts/smoke-test.sh`, `webapp/components/ProGate.tsx`) have used `https://ai-dopamine-addict.vercel.app` since #41 (April 2026); all three fallbacks now match. Side effect: also fixes the Login "Start my Compass journey" link which was 404'ing in prod whenever the env var wasn't explicitly set.

### Changed (Issue #52 — post-merge follow-ups)
- **Minimalist Terms sub-tab visual** (`webapp/components/Settings.tsx`, commit `e1e3053`) — dropped the white card + shadow wrapper and the per-row external-link SVG icon (×4 visual noise). Links are now plain text in a tight vertical list (`text-gray-600` → `hover:text-purple-700` + underline). Matches the read-only character of the surrounding tabs.
- **Context-aware "Back to Mind Compass" in legal pages** (commit `c4b99ad`) — webapp Terms tab now appends `?return=webapp` to legal-page hrefs. Each of `funnel/legal/{terms-of-use,privacy-policy,subscription-policy,cookie-policy}.html` got a small inline `<script>` that reads the query param and rewrites `a.back-link.href` to `https://mind-compass-webapp.vercel.app/` when present. Funnel-context visits (paywall footer, onboarding) keep the default `/` → funnel home, so the existing flow is unchanged.

### Fixed (Issue #50 — workstream A)
- **Cancellation doc/product mismatch** (`funnel/legal/terms-of-use.html` §6.3 + `subscription-policy.html` §5) — docs said email-only cancellation despite an in-app cancel flow shipping in `webapp/components/CancelFlow.tsx` + `Settings.tsx`. Now describes the real path (`Sidebar Profile → Access tab, then click Cancel`); email kept as alternative. Closes audit Critical #3 (CA ARL / FTC Click-to-Cancel violation) at the documentation layer.
- **Privacy Policy §11 timeline contradiction** — §5 said 45 days (CCPA), §11 said 30 days (general). Now reads `30 days under GDPR, 45 days for California (CCPA)`.
- **Subscription Policy §4 currency claim** — was implicitly EUR-only; actual paywall shows USD/EUR/GBP/CAD/AUD per `engine/app.js DISCLAIMERS` map. Now lists the 5 detected currencies explicitly.

### Added (Issue #50 — workstream A)
- **Medical disclaimer callout box** (`.medical-disclaimer` CSS class — amber bg `#FEF3C7`, `#F59E0B` left border, `#78350F` text) at the top of `terms-of-use.html` + `subscription-policy.html`. Most "conspicuous" treatment for the regulatory disclaimer requirement (~8.5:1 contrast, WCAG AAA). Privacy + Cookie deliberately excluded as data docs.
- **Terms §2 Eligibility** — explicit 18+ representation; renumbered §2 → §3 through §17 → §18 across the file (single internal cross-ref `Section 16.1` → `Section 17.1` in §13.2 updated; no external code/doc references Terms sections by number).
- **Trade-name pre-incorporation disclosure** added to `subscription-policy.html` + `cookie-policy.html` footers, matching the wording already present in `privacy-policy.html` footer + `terms-of-use.html` §17.5.

### Changed (Issue #48)
- **Flattened funnel directory layout** — `funnel/funnels/v1/` → `funnel/funnel-v1/` and `funnel/funnels/v2/` → `funnel/funnel-v2/` (`git mv`, history preserved). Files now live where the public URL says they live; no symlink, no rewrite, no nested `funnels/` wrapper. Public URLs `/funnel-v1/` and `/funnel-v2/` unchanged → zero SEO/marketing breakage.
- **`../../` → `../` inside moved files** (16 lines across `funnel-v{1,2}/index.html` and `funnel-v{1,2}/screens.json`) — paths now correctly resolve from the new one-level-deep location instead of relying on browser path-clamping.
- **`engine/app.js` funnel-version regex deduplicated** — two call sites (profile-collection + provision-account flows) both had a dead `/funnels/v2/` fallback regex from the old layout; simplified to single `/funnel-([^/]+)/` match in both places.
- **`.claude/commands/create-funnel.md` Step 7 rewritten** — adding a new funnel no longer requires a `vercel.json` rewrite; the convention is now `funnel/funnel-<slug>/` and Vercel serves it directly.

### Removed (Issue #48)
- **`funnel/funnel-v2` symlink** — was added in #e06d309 to make localhost match production; now obsolete since both serve directly.
- **4 `/funnel-v{1,2}/` rewrites from `funnel/vercel.json`** — flat layout means URL == path, no rewrite needed; only `/legal/:path+` rewrite remains.
- **Dead `/funnels/v2/` regex** (`engine/app.js`, 2 occurrences) — that URL shape never existed in production and no longer exists locally.

### Changed (Issue #46)
- **Legal pages rewritten for pre-incorporation reality** (`funnel/legal/{terms-of-use,privacy-policy,subscription-policy,cookie-policy}.html`) — operator name `Compass Limited` / `Mind Compass Ltd` → `Mind Compass` (trade name); dropped fake addresses (`Flat/Office XXX, Limassol`, `123 Wellness Street, London`) and placeholder registration numbers; LCIA/JAMS arbitration removed (no entity to bind), replaced with `§12.1 Informal Resolution` + `§12.2 Court Jurisdiction`; `§16.1 Governing Law` keeps Cyprus + mandatory consumer-protection caveat
- **Subscription Policy genericised** — `§2 Subscription Plans` no longer lists "7-Day / 1-Month / 3-Month" names or prices ("displayed at the time of purchase"); `§6 Refunds` says "where expressly advertised on the offer or checkout page" + statutory rights caveat
- **`§1 Service` + `§9.2`** — explicit not-therapy framing: *"not a substitute for professional medical advice, diagnosis, treatment, therapy, mental health care, or any other professional service"*
- **`§16.5 Legal Status` added** — single explicit pre-incorporation disclosure (`"Mind Compass is currently operated as a trade name… A registered legal entity, registered office address, and company registration number will be added upon incorporation"`), no per-page banner clutter
- **`funnel/funnels/{v1,v2}/screens.json` `companyInfo` consolidated** — both funnels now `{ name: "Mind Compass", links: [...] }`; v1 fake `support@mind-compass.app` email gone, paywall fallback disclaimer matches v2
- **Legal pages moved to shared `funnel/legal/`** (`git mv` from `funnel/funnels/v2/`) — single source of truth; v1, v2, and future funnels link to `/legal/*` via the shared `LEGAL_PATHS` map
- **Paywall in-screen disclaimer (`engine/app.js DISCLAIMERS`) kept with specific prices + VAT** — required by App Store §3.1.2(a) / EU CRD Art. 8(2) / FTC ROSCA for pre-purchase disclosure adjacent to the CTA; only the long-form policy docs are now generic

### Fixed (Issue #46)
- **Broken `#hash` policy links in `companyFooter`** (orphan from Issue #26) — paywall company footer rendered `<a href="#terms-of-use">` etc., which scrolled in-page instead of opening the policy; now resolves to real `/legal/*.html` via shared `LEGAL_PATHS`
- **`legalDisclaimer` nested-anchor risk** — old regex map could double-link "Terms of Use" inside the longer "Terms of Use and Service" phrase; new `/Terms of Use(?: and Service)?/g` pattern matches both forms once
- **`companyFooter` empty `<address>` element** — now omitted entirely when `companyInfo.address` is absent (no empty `<p>` rendered)

### Added (Issue #46)
- **`LEGAL_PATHS` const** (`funnel/engine/app.js`) — single source of truth for funnel → legal-page URLs, used by both `legalDisclaimer()` and `companyFooter()`
- **`log.warn` on unknown legal link names** in `companyFooter` — surfaces typos in `screens.json companyInfo.links` to the dev console during QA instead of silently rendering a dead `#` link
- **`funnel/vercel.json` `/legal/:path+` rewrite** — explicit (functionally a no-op, but documents intent + insurance against future config drift)
- **301 redirects** from old `/funnel-v2/{terms-of-use,privacy-policy,subscription-policy,cookie-policy}.html` paths → new `/legal/...` so any ad/App Store/indexed link survives the move
- **Adjacent-sibling CSS selector** (`.company-footer__name + .footer-links`) — preserves the visual gap when the address line is absent (pre-incorporation), zero behaviour change when the address returns

### Added (Issue #44)
- **Hand-drawn SVG hero illustrations across all 5 tabs** (`webapp/components/HeroVariants.tsx`) — replaces realistic PNG headers with vector heroes sharing one visual language (sunset palette, layered purple mountains, green hills, bottom-fade composition). One focal element per tab:
  - **Plan** — trail of stones winding through hills (`PlanTrail`)
  - **Progress** — snow-capped peak with planted flag (`ProgressPeak`)
  - **Coach** — striped lighthouse with light beam (`CoachLighthouse`)
  - **Help** — deeply-rooted tree (`HelpTree`)
  - **Profile** — evening campfire with rising sparks (`ProfileCampfire`)
- **Subtle per-element CSS animations** (`webapp/src/index.css`) — stones wobble (top stones seek balance), flag flutters via asymmetric keyframes, 3 lighthouse beams pulse out of phase, tree canopy sways + wind streaks drift across sky, campfire flames flicker + glow breathes + sparks rise periodically; all respect `prefers-reduced-motion`
- **Cross-fade between tabs via View Transitions API** — `withTransition()` helper in `App.tsx` wraps every state setter that swaps tab content (`changeView`, `grantUpsellAccess`, background subscription sync); browser snapshots old + new view and animates them out/in simultaneously (350 ms `cubic-bezier(0.4, 0, 0.2, 1)`); graceful fallback to instant switch on Safari < 18 / older Chrome / Firefox
- **ProGate paywall hero preview** — locked Coach/Help tabs show the corresponding hero illustration behind the lock at `opacity-40 grayscale pointer-events-none`, anchored to the top in the same position as the unlocked tab; explicit `HERO_BY_FEATURE` map so adding future PRO features doesn't silently inherit the wrong illustration
- **Plan eyebrow dynamic "Day X"** — eyebrow text now reads `Day {activePlanDay}`, synced to the orange-glowing active stone
- **Greeting extended to 4 periods** (`Dashboard.tsx`) — now covers `Good night` (22:00–04:59), `Good morning`, `Good afternoon`, `Good evening`

### Changed (Issue #44)
- **Settings tab renamed to Profile** — mobile bottom nav + desktop sidebar both labelled "Profile"; page heading uses `ProfileCampfire` hero with "Your Space / Profile" overlay; outer layout restructured from nested flex chain to a single `overflow-y-auto` container
- **Help tab redesigned** — removed `StageProgress` indicator (PAUSE/LOCATE/ACT/REFLECT bar); `PauseStage.tsx` layout flowed (hero at top via `HelpTree`, content centered below); heading "3 minutes is enough / to weaken the urge" forced 2 lines; footnote "Urges rise and fall like waves…" moved under the button as small gray; timer scaled −5%; removed "You don't need to decide right now." subtitle
- **AICoach skips initial-mount auto-scroll** — `useRef` tracks previous messages length; effect only scrolls when length grows, so the hero header is visible on first tab open instead of being scrolled past
- **ProGate copy + contrast tweaks** — lock circle `bg-purple-100 → bg-purple-200`, icon `text-purple-600 → text-purple-700`; description text `text-gray-500 → text-gray-600`; Urge Help description now includes "science-backed techniques"
- **Progress far mountain** — custom darker gradient (`pp-mtn-far-bold`: `#D8C7F5 → #BFA8EE`) + `opacity="0.75"` so the snow-capped peak stands out from the sky while staying lighter than the mid range
- **Bottom-fade gradient smoothed** — 6 stops instead of 4 (`0/60/74/84/92/100%`) for a more gradual blend into the page background
- **Hero title overlays shifted +25 px down** from the original `top-4 md:top-8` baseline (now `top-[41px] md:top-[57px]`) so eyebrow + h2 don't sit too close to the device notch

### Fixed (Issue #44)
- **iOS safe-area handling** — `App.tsx` outer container now uses `h-screen h-dvh` (dynamic viewport on Safari 15.4+ / Chrome 108+); `main` pb extends to `calc(4.5rem + env(safe-area-inset-bottom))`; `Sidebar.tsx` mobile nav replaces the broken `pb-safe` utility (silently dropped by Tailwind v4) with inline `style` using `calc(4.5rem + env(safe-area-inset-bottom))` for both height and `padding-bottom`, so icons sit above the home indicator on notched iPhones
- **Settings Log Out button cut off** by mobile nav on small viewports — fixed via the safe-area work above plus larger scroll-area `pb-[calc(env(safe-area-inset-bottom)+8rem)]`

### Removed (Issue #44)
- **`webapp/components/JourneyHero.tsx`** — replaced by `PlanTrail` in `HeroVariants.tsx`
- **`webapp/public/illustrations/{dashboard,coach,urge}.png`** — orphan PNG assets no longer referenced after the SVG hero swap

### Added (Issue #41)
- **Post-checkout upsell screen** — shown between checkout and account creation; hero image, AI Coach + AI Help feature cards, social proof, 1-month/3-month price toggle, sticky upgrade CTA
- **One-click upsell charge** (`funnel/api/create-upsell.js`) — server-side Stripe subscription schedule (intro price × 1 month → regular recurring) off existing payment method; logs to `upsell_errors` table on failure; writes subscription row to Supabase immediately (no webhook wait)
- **Multi-currency pricing** — `Currency.detect()` reads `navigator.language` to pick USD/EUR/GBP/CAD/AUD; EUR users keep original `screens.json` prices unchanged; non-EUR users get dynamically injected prices on paywall and checkout
- **`funnel/api/provision-account.js`** — new endpoint called right after `stripe.confirmPayment()` succeeds; creates the Supabase auth user + profile row immediately so the DB record exists before the user reaches account creation; returns a live session (`access_token` + `refresh_token`); idempotent (handles already-existing users)
- **Progress stepper on account creation** — 3-step visual (Choose Plan → Activate → Create Account) replaces the old icon+headline block; step 3 highlighted as current
- **Auto-open Welcome lesson for new users** — on first ever login (no `user_app_state` row), Plan28 automatically opens the Day 0 Welcome lesson so new users land straight in the core experience

### Changed (Issue #41)
- **`create-user.js` made idempotent** — common path is now "user already exists" (provisioned after checkout); finds user by email, calls `admin.updateUserById({ password })`, upserts profile, signs in; falls back to full create if provision-account was skipped
- **Account creation replaces thank_you screen** — `thank_you` removed from funnel sequence; flow is now `checkout → upsell → create_account → app_dashboard`; email field is editable; screen shows progress stepper at step 3
- **`upsell_errors` table** — new Supabase table tracking no-PM and charge-failure events per email/customer/currency
- **Localhost funnel URL standardised** — `funnel/funnel-v2` symlink added (`→ funnels/v2`); dev server now started from `funnel/` dir; localhost URL `http://localhost:8080/funnel-v2/` now matches production `https://ai-dopamine-addict.vercel.app/funnel-v2/`
- **Upsell access cached in localStorage** (`mc_has_upsell`) — initial state seeded from cache so Pro badges on Coach/Help tabs render correctly on reload without a flash

### Fixed (Issue #41)
- **Upsell CTA button unresponsive on iOS** — `position: fixed` elements don't bubble touch events to delegated ancestor; fixed with direct `{once: true}` listeners via `initUpsell()`
- **Checkout payment method not saved to Stripe customer** — missing `setup_future_usage: 'off_session'` on PaymentIntent meant `create-upsell` found zero saved cards (`no_pm`); now set on PI after invoice finalization
- **Upsell currency mismatch** — `Currency.detect()` could return a different currency than the one used for the core subscription; `create-upsell` now reads currency from the customer's active subscriptions to avoid Stripe's "cannot combine currencies" error
- **Settings showing only one subscription** — query used `.limit(1).single()`; changed to full array + `SubscriptionCard` per row so both core and upsell subscriptions display
- **Upsell features locked after purchase** — webhook fires 2–10s after client redirect; fixed with Supabase direct write in `create-upsell.js` + 8s retry query in webapp
- **Screen transitions not scrolling to top** — `appEl.scrollTop = 0; window.scrollTo(0, 0)` added to `App.render()` so upsell/account creation stepper is visible on landing
- **API paths broken on `/funnels/v2/` direct URL** — relative paths like `api/create-checkout` resolved incorrectly; changed to root-relative `/api/create-checkout`
- **Invalid `currency` param on `stripe.customers.create`** — Stripe Customer object has no currency field; removed

### Added (Issue #36)
- **`day_completions` Supabase table** — stores `lesson_completed_at` and `all_tasks_completed_at` per (user, plan cycle, day); migration in `supabase/migrations/20260513_day_completions.sql`
- **Two-tier stone completion logic** — stone turns green immediately when all tasks (lesson + morning + evening) are done same-session; turns green next calendar day if only the lesson was finished
- **`getRequiredTaskKeys` helper** (`planData.ts`) — returns the full set of required task keys for a day, used to determine full-day completion
- **"Come back tomorrow" banner** — informational amber banner inside the lesson sheet when the user opens the active day after fully completing the previous day in the same session

### Changed (Issue #36)
- **Journey stone progression** — `activePlanDay` now derived from `day_completions` (first day without `lesson_completed_at`), replacing streak/check-in-based `currentPlanDay`
- **Accordion task states** — simplified to binary emerald (complete) / stone-300 (incomplete); removed the gradient `calculateCheckmarkColor` function
- **Auto-scroll** — journey path re-scrolls to the active stone on every tab open (effect dependency changed from `[]` to `[activePlanDay]`); Plan28 remounts on tab switch so this also fires on re-entry
- **`loadUserData` parallelized** — `plan_progress` and `day_completions` fetches now run in a single `Promise.all`
- **`DayCompletion` type** — extracted to `planData.ts` as the single source of truth; removed duplicate inline definitions from `App.tsx` and `Plan28.tsx`

### Added (Day 0 welcome session)
- **Day 0 welcome lesson** — 9-section motivational session (5 min): "You're already different" hook, outcome promise (focus/confidence/sleep/intimacy/time), 3-pillar science explainer (environment design, urge surfing, identity shift), James Clear quote, social proof milestones (Day 7/14/28), pro tip on consistency, 4-option personalisation question, 28-day roadmap summary, completion screen
- **Auto-open on Day 0** — lesson player opens immediately when user views Day 0; no task list shown (welcome-only layout)

### Added (Issue #37)
- **Interactive lesson player** — full-screen overlay (`LessonPlayer.tsx`) replaces the static "Tip of the Day" callout; walks users through all lesson sections step-by-step (7 types: intro, content, question, quote, proTip, summary, complete)
- **Floating glass CTA** — Continue/Complete button always visible in a frosted footer (`backdrop-blur-2xl`, `backdrop-saturate-150`, 80% white) so content scrolling never hides the next action
- **Question gate** — Continue button disabled until an answer is selected; re-enables on tap; state resets cleanly between question sections via `key={sectionIndex}` remount
- **Lesson completion persisted** — completion writes task key `'lesson'` to `plan_progress` via existing `onTaskToggle`; zero schema changes; survives page reload and re-login
- **Completed state + replay** — if lesson already done, player opens to a completion screen with "Replay lesson" option; progress bar shows 100%
- **Lesson card in day sheet** — shows title, duration, Start/Review button; completed checkmark via `CheckCircle2`; lesson always rendered first in the day sheet (above Morning Protocol)
- **Day 0 welcome lesson** — lookup handles `lessonNumber: 0` (no `day` field) via `(l.day ?? l.lessonNumber) === day.day`

### Changed (Issue #37)
- **Day sheet order** — lesson card now first, followed by Morning Protocol, Evening Protocol, Daily Check-In
- **Check-in completion signal** — `tasksCompleted` now requires `isLessonCompleted && isMorningComplete && isEveningComplete` for the current day
- **Tip of the Day removed** — `tipOfTheDay` amber callout and `isTipRead` state replaced by the lesson card

### Added (Issue #34)
- **Help tab redesigned as 4-stage urge journey** — `Pause → Locate → Act → Reflect` orchestrated by [`webapp/components/UrgeHelp.tsx`](webapp/components/UrgeHelp.tsx); state machine + per-stage components in `webapp/components/urgeHelp/`
- **Pause stage** — fixed 3-min countdown ring (was 60s), reframe copy "3 minutes is all your brain needs to weaken the urge", skip-ahead button preserved
- **Locate stage** — feeling picker as bottom sheet; tap a feeling → slide-up sheet with optional 1–10 intensity slider + Continue; sheet height measured live via `ResizeObserver` so grid padding always fits
- **Act stage** — 10-action grid grouped by 4 categories (Reset / Ground / Protect / Reframe), category-tinted icons, stagger-fade entrance, "Best fit" badge on top 2 actions matched to selected feeling
- **10 evidence-based action mini-screens** in `webapp/components/urgeActions/` — each has its own `<ActionScreenShell>` (header + interactive area + Done/Back footer): Box Breathing (4-4-4-4 × 5 cycles, animated breathing circle), Cold Water (3-step instructional), Physical Burst (tap-counter to 20 with milestone copy), 5-4-3-2-1 Grounding (tap-anywhere-on-active-card, auto-advance per sense, completion banner with 1.4s auto-route), HALT Check (4 toggles → priority-ordered recommendation), Leave the Room (60s reorient with pulsing dot), Phone Away (15-min soft timer), Urge Journal (3-field form persisted to `mc.urge_journal.v1`), Future-Self Letter (first-time guided write → display + Edit), Play the Tape (5-scene auto-advancing visualization with per-scene pacing 8/8/7/9/6s + tap-to-skip + discoverability hint)
- **Reflect stage** — three terminal options (passed / still here / talk it through); only `passed` and `escalated` log entries (`still_here` is mid-session feedback, doesn't inflate counter); "passed" → sparkle celebration overlay, +1 to Urges Surfed counter
- **AI Coach modal** ([`webapp/components/urgeHelp/CoachModal.tsx`](webapp/components/urgeHelp/CoachModal.tsx)) — slide-up sheet over Help, dismissible without losing stage state; reuses the dedicated Coach view's chat history (continuous conversation across surfaces); seeded with `currentUrgeContext: { stage, feeling, intensity, actionAttempted, elapsedSec }` so Claude's first reply is targeted
- **Urges Surfed Dashboard tile** — third tile sibling of Streak + Check-in (rose-tinted on mobile single-row, full-purple desktop card); decorative wave SVG matches Streak chart stroke weight
- **localStorage persistence** ([`webapp/src/lib/urgeLog.ts`](webapp/src/lib/urgeLog.ts)) — versioned keys `mc.urge_log.v1` (urge sessions), `mc.urge_journal.v1` (structured trigger/intensity/note), `mc.future_self_letter.v1` (3-field letter); all reads/writes wrapped in `try/catch` with `logger.warn` on failure (Supabase migration deferred to follow-up)
- **Urge data registry** ([`webapp/data/urgeData.ts`](webapp/data/urgeData.ts)) — pure data module with `FEELINGS` (7 feelings + context lines), `URGE_ACTIONS` (10 actions + `recommendedFor: FeelingId[]` mapping), `URGE_CATEGORY_META` (tints/labels per category)
- **`UrgeAction`, `UrgeLogEntry`, `UrgeContextSeed`, `Feeling`, `UrgeOutcome`** types added to [`webapp/types.ts`](webapp/types.ts)
- **Screen-reader stage announcer** — `<StageProgress>` emits `aria-live="polite"` "Stage X of N: name" so SR users get clear orientation

### Changed (Issue #34)
- **`AICoach` props extended** with optional `currentUrgeContext?: UrgeContextSeed | null` and `compact?: boolean`; when seed present, system context prepends an "ACTIVE URGE SESSION" block so Claude responds with awareness of the live state (`compact` strips the edge-to-edge header for in-modal rendering)
- **Dashboard `Urge Help` banner** — re-tinted rose (was purple) to telegraph "panic button" without drowning the dashboard's purple palette
- **`UrgeHelpProps`** — dropped dead `onChangeView` prop; component now receives `chatHistory` + `setChatHistory` + `checkInHistory` from `App.tsx` to pipe Coach state through to the modal

### Fixed (Issue #34)
- **Stale 60s timer + 4 generic techniques** replaced by evidence-based architecture (per Marlatt's urge surfing model)
- **Stale closure in Grounding auto-advance** — original prototype read closure-captured `checks` value inside `setTimeout`, blocking next-sense unlock; rewritten to branch on the freshly-computed `next[i]` and call `setActiveIdx(i + 1)` directly
- **`setState`-inside-`setState` anti-pattern in Box Breathing** — split into two `useEffect`s (one ticks `secondsLeft`, one advances phase/cycle on `secondsLeft === 0`) so React 18 StrictMode no longer double-invokes phase increments
- **Race condition in Locate sheet** — picking a different feeling during the 240ms close animation no longer clobbers the new selection (exit timer cancelled on fresh pick)
- **Magic-number padding** in Locate grid — `pb-72` replaced with live `ResizeObserver`-driven measurement so localized copy never clips the last card

- **Anthropic Claude integration** — AI Coach and Daily Insight now use Claude Haiku 4.5 (`claude-haiku-4-5`) via two new Vercel serverless functions: `webapp/api/coach.js` (multi-turn chat) and `webapp/api/daily-insight.js` (single-shot)
- **Multi-turn coach memory** — Coach now receives the last 10 chat messages as `messages[]`, so responses build on prior turns instead of treating each message as one-shot
- **Supabase JWT auth on AI endpoints** — both endpoints require `Authorization: Bearer <access_token>`; server verifies via `supabase.auth.getUser(token)` and returns 401 on missing/invalid tokens
- **Shared serverless helpers** (`webapp/api/_lib/`) — `cors.js` (regex allowlist for prod + Vercel previews + localhost:3000), `auth.js` (Supabase JWT verifier), `anthropic.js` (Anthropic client + retry helper + text extractor)
- **Server-side retry** — exponential backoff for 429 / 5xx responses (2 retries with jitter), mirroring previous Gemini retry behavior

### Changed (Issue #31)
- **`webapp/services/geminiService.ts` → `webapp/services/claudeService.ts`** — rewrites SDK calls as `fetch('/api/coach' | '/api/daily-insight')` wrappers; public signatures unchanged except `getCoachResponse` accepts an optional `history: ChatMessage[]` argument
- **`webapp/prompts/aiCoach.ts`** — `buildCoachSystemPrompt(context)` now returns just the system instructions (was `buildCoachSystemPrompt(message, context)` with user message inlined); chat history is passed separately
- **`webapp/prompts/dailyInsight.ts`** — split into `buildDailyInsightSystem()` and `buildDailyInsightUserMessage(checkIn)` to fit Anthropic's `system` + `messages[]` API shape
- **`webapp/.env.local.example`** — replaces `VITE_GEMINI_API_KEY` block with `ANTHROPIC_API_KEY` block; documents that the key is server-side only (no `VITE_` prefix)
- **`webapp/package.json`** — `@google/genai` removed, `@anthropic-ai/sdk` added

### Removed (Issue #31)
- `@google/genai` dependency, `GoogleGenAI` SDK code, `VITE_GEMINI_API_KEY` references

### Added (Issue #27)
- **Checkout prefetch** — `prefetchCheckout()` fires `/api/create-checkout` in the background the moment the paywall renders; `stripe.elements({ clientSecret })` pre-initialized as soon as the PI resolves, giving Stripe a head-start loading payment form assets before the user reaches checkout
- **Tier-change re-prefetch** — clicking a different pricing plan aborts the in-flight prefetch and starts a fresh one immediately via `AbortController`; `initStripe()` awaits the prefetch promise (instant if already resolved) then falls back to a fresh fetch with zero regression risk
- **Apple Pay / Google Pay** — automatically surfaces in Stripe Payment Element on supported devices; requires one-time domain registration in Stripe Dashboard → Settings → Payment Method Domains (no code changes needed)
- **Smoke test** (`scripts/smoke-test.sh`) — 5-category post-deploy check: (1) page health (HTTP 200 + correct title for funnel and webapp), (2) `create-checkout` returns `clientSecret` and rejects missing fields; webhook rejects unsigned POST, (3) Supabase `subscriptions` table readable via service role, (4) full E2E Stripe mock purchase → Supabase row appears within 20 s, (5) `Login.tsx` hash-before-session order and `signOut()` present
- **Auto smoke test on push** (`.claude/settings.json`) — Claude Code PostToolUse hook runs smoke test automatically after every `git push`

### Fixed (Issue #27)
- **New buyer logged in as previous user** — `Login.tsx` `tryAutoAuth` was calling `getSession()` before reading URL hash tokens; a cached session from a prior user was returned before the new buyer's tokens were consumed. Fixed by checking URL hash first, then calling `supabase.auth.signOut()` before `setSession()` so the correct user is always active after a purchase redirect
- **"No active subscription found" for new users** — three-part root cause: (1) Stripe webhook URL pointed to decommissioned Vercel project (corrected in Stripe Dashboard); (2) `STRIPE_WEBHOOK_SECRET` was missing from Vercel env vars (added); (3) Vercel's default JSON body parser converted `req.body` to an object before `stripe.webhooks.constructEvent()` could verify the HMAC signature — fixed with `export const config = { api: { bodyParser: false } }` and a `getRawBody()` stream reader
- **Subscription ID null for some invoices** — `invoice.subscription` moved to `invoice.parent.subscription_details.subscription` in Stripe API 2025-03+; webhook now resolves via three-path fallback: old field → new field → live `subscriptions.list` API call
- **Orphaned subscription schedules** — `create-checkout` now lists and cancels any `active`/`not_started` schedules for the customer before creating a new one, preventing dangling Stripe objects from paywall prefetch bursts or tier switches

### Security (Issue #27)
- CORS on `create-checkout` and `create-user` restricted from wildcard `*` to `https://ai-dopamine-addict.vercel.app`
- `quizAnswers` payload capped at 50 KB in `create-user` — oversized JSONB rejected at API boundary before reaching Supabase
- Removed `whsec_todo` placeholder bypass from webhook signature check — secret must be a real value; placeholder can no longer silently skip HMAC verification

### Added (Issue #22)
- **Purple visual theme** — full color system overhaul; emerald/stone replaced with purple/gray across all components
- **Edge-to-edge illustration headers** — Dashboard, AI Coach, Urge Help, and Login now open with full-width hero images (gradient fade into background)
- **Tailwind v3 (Play CDN)** — upgraded from v2 CDN; unlocks full token support (`purple-*`, `rose-*`, arbitrary values)
- **Time-based greeting** — Dashboard shows "Good morning / afternoon / evening" based on current hour
- **Settings in main nav** — Settings moved from sidebar footer/mobile header into primary nav (both desktop and mobile bottom bar); replaces "Future" placeholder

### Fixed (Issue #22)
- **Logout bypassed app state reset** — new Log Out button in Settings was calling `supabase.auth.signOut()` directly; fixed by wiring `onLogout` prop through `Settings` → `ProfileSettings` so full state cleanup runs
- **Mobile content hidden behind bottom nav** — `pb-[4.5rem] md:pb-0` was accidentally removed from `<main>` during redesign; restored
- **Urge Help shortcut used global event bus** — Dashboard's "Urge Help" quick button was dispatching a `CustomEvent` on `window`; replaced with direct `onChangeView` prop call

### Changed (Issue #22)
- **Desktop sidebar** — logout button restored to footer; redundant `MobileHeader` removed
- **Plan28 `completedTasks`/`onTaskToggle`** — changed from optional to required props (always provided by App.tsx)

### Added (Issue #21)
- **Supabase data persistence** — all webapp user data now survives page refresh: check-ins, plan task completions, AI coach conversation history
- **`check_ins` table** — each daily check-in (status, triggers, emotions, reaction, coping strategies, notes, AI insight, time of day) inserted on completion; loaded on login ordered by date
- **`plan_progress` table** — individual task completions stored per day per plan cycle (`plan_started_at`); reconstructed into `Record<number, Set<string>>` on login; optimistic UI update fires before DB write
- **`user_app_state` table** — single row per user storing active `plan_started_at`; auto-created on first login; supports plan restart (old rows preserved, new cycle timestamp scopes queries)
- **`coach_messages` table** — full AI coach conversation upserted after each assistant reply (jsonb array, one row per user); welcome message excluded from storage, always prepended at load time

### Fixed (Issue #21)
- **Page-refresh logout** — added `supabase.auth.getSession()` as first check in `Login.tsx` auto-auth; native Supabase session (persisted in `sb-*` localStorage keys) now restores without re-login
- **Coach messages stale-closure bug** — upsert used closure-captured `messages` state which could be stale on rapid sends; replaced with `messagesRef` kept current via `useEffect`

### Changed (Issue #21)
- `Plan28` `completedTasks` and `onTaskToggle` props changed from optional to required (always provided by `App.tsx`)

### Added (Issue #20)
- **Settings → Access tab** — live subscription data from Supabase `subscriptions` table: plan label, amount paid, begin date, renewal/access-until date, active/cancelled badge
- **Cancel Membership flow** — single-step confirmation modal; calls `POST /api/cancel-subscription` which sets `cancel_at_period_end: true` in Stripe and mirrors to Supabase; user retains access until period end
- **Renew Subscription** — green button shown when subscription is cancelled; calls `POST /api/renew-subscription` which flips `cancel_at_period_end: false` in Stripe and Supabase; UI reverts to active state immediately
- **Settings → Profile tab** — email pre-filled from Supabase auth (read-only); password change via `supabase.auth.updateUser({ password })` with validation and success/error feedback
- **`webapp/api/cancel-subscription.js`** — ownership-verified cancellation endpoint; releases Stripe subscription schedule if present before updating, logs schedule+subscription IDs on partial failure
- **`webapp/api/renew-subscription.js`** — ownership-verified renewal endpoint; re-enables auto-renew on an already-cancelled subscription
- **Webhook enrichment** (`funnel/api/webhook.js`) — `invoice.payment_succeeded` now writes `current_period_end`, `plan_label`, `cancel_at_period_end: false` to `subscriptions` table; resolves human-readable label from `PRICE_LABEL_MAP` with `description` fallback

### Fixed (Issue #20)
- **Stripe schedule error on cancel** — subscriptions managed by a schedule rejected direct `cancel_at_period_end` update; fixed by releasing the schedule first
- **Button text invisible** — `Button.tsx` used `text-stone-50`/`stone-*`/`rose-*` (Tailwind v3-only); replaced with `text-white`/`gray-*`/`red-*` (v2-compatible)
- **Cancel API on wrong domain** — `CancelFlow` called `/api/cancel-subscription` as relative URL; this resolved to the webapp domain (`mind-compass-webapp.vercel.app`) not the funnel project; fixed by adding the endpoint to `webapp/api/`
- **`paid_at` null crash in webhook** — `new Date(null * 1000)` stored Unix epoch `1970-01-01`; guarded to store `null` when `status_transitions.paid_at` is missing

### Security (Issue #20)
- CORS on `cancel-subscription` and `renew-subscription` restricted from wildcard `*` to `https://mind-compass-webapp.vercel.app`

### Added (Issue #19)
- **Structured quiz data in `users_profile`** — 10 new queryable columns written on account creation: `gender`, `age_group`, `main_challenge`, `goal`, `score_overall`, `score_dopamine_sensitivity`, `score_emotional_regulation`, `score_pattern_stage`, `score_physical_impact`, `funnel_version`
- **Dev mock for account creation** — on localhost, `handleAccountFormSubmit` skips the `/api/create-user` API call and navigates forward; real API runs on Vercel only
- **Dev mock for Stripe checkout** — on localhost, checkout screen shows a "Complete Payment (Mock)" button that skips Stripe and goes to the next screen
- **`isDev()` helper** — module-level utility in `app.js` for detecting localhost; replaces duplicate `isLocalhost` checks

### Fixed (Issue #19)
- **Gender not saved** — was reading `State.getAnswer('gender_selection')` but gender is stored under `'landing'` key by `handleGenderSelect`
- **`funnel_version` always null on Vercel** — regex only matched `/funnels/v2/` (localhost path); added second pattern to match `/funnel-v2/` (Vercel rewrite URL)
- **Vercel routing infinite load** — `fetch('config.json')` from URL `/funnel-v2` resolved to `/config.json` (wrong path); fixed by redirecting `/funnel-v2` → `/funnel-v2/` and rewriting `/funnel-v2/:path+` → `/funnels/v2/:path+` so relative fetches resolve correctly
- **Root URL 404** — `https://ai-dopamine-cursor.vercel.app/` now redirects to `/funnel-v2/`

### Changed (Issue #19)
- `create-user.js` text fields (`gender`, `age_group`, `main_challenge`, `goal`, `funnel_version`) clipped to 100/20 chars before insert to guard against oversized payloads silently failing the non-fatal profile write
- `profileError` log now includes `profileError.code` for easier Supabase debugging

### Added (Issue #18)
- **Timer persistence across page refreshes** — countdown timer stores expiry timestamp in `localStorage` (`mc_discount_expiry`); on reload, resumes from remaining time rather than resetting to 10:00
- **Timer expiry behavior** — when countdown hits 00:00: promo ticket hidden, `.discount-expired` CSS class applied to paywall; pricing cards revert to full (original) price, discounted price and per-day badge hidden; expired state persists across reloads
- **`maestro` and `discover` payment icons** — were missing from engine icon set despite being referenced in v2 screens.json
- **CSS architecture rules in CLAUDE.md** — explicit `width: 100%` over `align-items: stretch`, hard-refresh reminder, canonical data source for paywall content

### Fixed (Issue #18)
- **Paywall element widths** — first-section elements (before/after, promo ticket, context tags, CTA) were narrower than second section; fixed by adding `width: 100%; box-sizing: border-box` to `.paywall > *` instead of relying on `align-items: stretch` cascade
- **AMEX icon clipping** — complex path-based SVG was clipping "EXPRESS" at small display sizes; replaced with clean text-based card rendering "AMEX" (same approach as Discover icon)
- **Personalized headline** — was incorrectly appending `for {gender} {ageGroup}` text that was removed in Issue #17; reverted to "Your Porn Addiction Recovery Plan is ready!"
- **EUR pricing in v2 paywall** — migration used wrong source (pre-Issue-#17 USD data); all 3 tiers now use correct EUR amounts (7-day €10.50, 1-month €19.99, 3-month €34.99)
- **Legal disclaimer** — updated to EUR amounts and correct support email `support@mind-compass.app`
- **Timer NaN display** — corrupt or non-numeric `localStorage` value caused `NaN:NaN` countdown display; added `isNaN` guard that clears the corrupt key and starts fresh

### Changed (Issue #18)
- Payment icons upgraded from simplified 48×32 placeholder SVGs to proper branded 780×500 SVGs (Visa, Mastercard, Apple Pay, PayPal); icons sized to 31×20px with `flex-wrap: nowrap`
- `.cta-button` shape updated to pill (border-radius: 50px), uppercase, letter-spacing
- Tighter spacing between pricing cards and primary CTA button

### Removed (Issue #18)
- Dead `.before-after { display: grid }` CSS block — pre-Issue-#17 orphan that was overriding the new `ba-*` layout
- Orphaned `.progress-bar-mini__fill` CSS rules (parent `.progress-bar-mini` was already deleted)
- Stale `subscriptionNote` field from v2 `screens.json` — never rendered by engine, contained wrong USD pricing
- Dead `defaultSelectedTier` field from v2 `screens.json` — engine never read it (hardcoded fallback `'1_month'`)



### Added (Issue #26)
- **Legal policy pages** — 4 standalone HTML pages: Terms of Use, Privacy Policy, Subscription Policy, Cookie Policy
- **Clickable policy links** — landing screen legal text now links to real policy pages (opens in new tab)

### Changed (Issue #26)
- `legalDisclaimer()` links updated from `#hash` anchors to actual HTML files with `target="_blank" rel="noopener noreferrer"`
- Paywall company info synced: "Chesmint Limited" → "Compass Limited", address and email updated

### Added (Issue #25)
- **Paywall screen restored** — full pricing page back in v2 flow: pricing tiers (EUR), before/after comparison, FAQ, testimonials, money-back guarantee, company footer
- **Personalized paywall headline** — `personalizedHeadline()` now uses `PersonalizedText.replace()` for `{gender}` and `{ageGroup}` substitution, consistent with goal_timeline and plan_ready
- **Gender-aware before/after images** — paywall picks `before_state_male.png` / `before_state_female.png` based on quiz gender selection

### Changed (Issue #25)
- Funnel v2 sequence: `scratch_card → paywall → checkout` (was `scratch_card → checkout`)

### Removed (Issue #25)
- Dead data from paywall screens.json: `personalizedInfo`, `trustElements.goals` (duplicate of `goalsList`), `trustElements.lifeComparison` (duplicate of `contrastLists`)

### Added
- **Funnel v2 UI/UX redesign** (Issue #24)
  - Testimonial horizontal carousel with auto-scroll, touch/mouse drag, dot navigation
  - Profile illustration — SVG character with 4 emotional states based on score level
  - Personalized diagnostic text generator (`getDetailedDescription`) — 3-part level-based copy
  - SVG icons for checkbox lists replacing emoji icons (couple, shield, bicep, target, heart, trophy, lightning, meditation, flame, bird)
  - Animated map pins with staggered pinDrop animation on social proof screen
  - Scratch card ticket shape with CSS notch pseudo-elements, pulsing instruction, confetti on reveal
  - Likert scale redesign — full-screen layout, bottom-anchored scale, external labels
  - University logo cards with prefix/name typographic split
  - Recovery chart — single cubic bezier S-curve, dotted grid, "Today"/"After using Mind Compass" badges
  - Dysregulation bar level badges on profile summary

### Changed
- **Funnel v2 layout & components** (Issue #24)
  - Global content alignment: centered → left-aligned with per-screen overrides
  - Back button: removed text label, icon-only
  - Answer cards: removed right arrows, centered labels
  - Checkbox answers: flat list style with separator lines, label before checkbox
  - Landing screen: centered text, black colors, top margin
  - Welcome interstitial: 🙏 emoji, disclaimer below bullets, rounded card with purple checkmarks
  - Goal timeline: 6-bar chart with color gradient and Goal badge
  - Continue buttons wrapped in `continue-container` for consistent fixed positioning
  - Social proof headline: "2,500,000" → "100,000"
  - CBT headline: "reviewed by" → "designed in collaboration with"
  - Profile summary: compact layout, purple metric icons
  - Plan creation: line break in dynamic subheadline

### Removed
- **Old paywall screen** (Issue #24) — removed from v2 sequence and screens.json (using shared checkout screen instead)

### Fixed
- **Event listener cleanup** (Issue #24) — TestimonialCarousel uses AbortController to remove all listeners on screen transition
- **Scratch card accumulation** (Issue #24) — added `isRevealed` guard to stop scratch events after discount reveal
- **Confetti performance** (Issue #24) — batch DOM insertion via DocumentFragment
- **Unescaped profile description** (Issue #24) — `levelDesc` now passes through `Security.escapeHtml()`

### Added
- **Mind Compass funnel v2** (Issue #16, `funnel/liven-funnel-2/`)
  - Complete quiz-to-paywall funnel: 54 screens, 36 questions (27 likert + 9 mixed type)
  - Real scoring engine: 4 sub-metrics (dopamine_sensitivity, emotional_regulation, pattern_stage, physical_impact) calculated from user answers Q1-Q14, overall score from Q1-Q27
  - Personalized text system: `{name}`, `{gender}`, `{ageGroup}` placeholders dynamically replaced throughout the funnel
  - New screen types: `age_selection`, `timeline_chart` (bar chart with dynamic months), `recovery_curve` (SVG bezier chart with gradient), `scratch_card` (HTML5 Canvas scratch-to-reveal + discount modal)
  - Paywall with before/after comparison, personalized challenge/goal from quiz answers, countdown timer, life comparison cards, FAQ accordion, testimonials, 3 pricing tiers
  - Data-driven architecture: all content in `funnel-data.json`, single `app.js` renders dynamically
- **Paywall UI redesign** (Issue #17)
  - New sticky minimal paywall header (timer + CTA only) — replaces generic header; `Components.paywallHeader()` renders `.paywall-header` fixed bar; `CountdownTimer.updateDisplay()` now uses `querySelectorAll` to sync both header timer and promo ticket timer simultaneously
  - New `question_age` screen (single-choice: 18–24, 25–34, 35–44, 45–54, 55+) inserted as second screen after landing
  - `Components.beforeAfter()` — two-column grid with before/after photos, metric rows with progress bars; After image uses `background-image` div technique for reliable zoom/crop without layout-flow issues
  - `Components.personalizedHeadline()` — "Your Dopamine Reset Plan for men {ageGroup} is ready!" with primary-color highlight span; reads `question_age` answer from State with fallback
  - `Components.promoTicket()` — ticket-style card with promo code pill + live countdown timer digits; promo code format updated to `Name_Apr2026` (was `NAME_APR_50`)
  - `Components.contextTags()` — two-chip row showing main challenge and goal pulled from quiz answers with icon + value labels
  - `Components.goalsList()` — "Our goals" heading + 8-item green-checkmark list from JSON
  - `Components.statsWithChart()` — section heading, SVG arc/semicircle chart (3 concentric arcs at 45%/77%/83%), 3 stat callout blocks with large primary-color percentages
  - `Components.contrastLists()` — "Without Compass" grey ✕ card vs "With Compass" green-bordered ✓ card from JSON
  - `Components.secondCtaBlock()` — duplicate pricing + CTA after testimonials section, now also renders legal disclaimer and payment icons for full trust context
  - Redesigned `Components.pricingCard()` — radio-button style (flex row), per-day price in right-side grey badge, MOST POPULAR as full-width header bar above the card
  - Redesigned `Components.moneyBackGuarantee()` — full bordered card with medal SVG badge bottom-right and "Learn more" link
  - Updated `Components.faqAccordion()` — heading changed to "People often ask", `?` circle icon badge per question
  - Updated `Components.testimonialCard()` — orange stars, `handle` field right-aligned beside author name
  - Official brand SVGs for all payment icons (Visa, Mastercard, Amex, Apple Pay, Maestro, Discover) using standardized `viewBox="0 0 780 500"` coordinate space — Apple Pay includes correct two-path Apple logo with leaf; Discover renders "DISC**O**VER" with orange O; Maestro uses overlapping circles with computed purple lens overlap
  - `Components.legalDisclaimer()` — escapes input, then regex-replaces policy names with `<a>` links to prevent XSS from raw HTML in JSON
  - JSON: added `beforeAfter`, `contextTags`, `goalsList`, `contrastLists`, `legalDisclaimer` (plain text), `companyInfo`; updated FAQ, testimonials, statistics; `legalDisclaimer` stores plain text only (links added dynamically by component)
  - New CSS sections: `.paywall-header`, `.before-after`/`.ba-*`, `.paywall-headline`, `.promo-ticket`, `.context-tags`, `.pricing-card` (radio redesign), `.goals-list-section`, `.stats-section`/`.stats-chart`, `.contrast-lists`, `.money-back-card`, `.ba-image--after` (background-image zoom variant), updated FAQ/testimonial styles
  - `paywall-audit.md` — mobile layout audit documenting per-section issues and recommended fixes for 375–429px and sub-375px breakpoints

### Changed
- **Funnel directory restructure** (Issue #16) — moved original funnel to `funnel/liven-funnel-1/`, new funnel in `funnel/liven-funnel-2/`
- **Vercel routing** (Issue #16) — `funnel/vercel.json` updated with rewrites for `/liven-funnel-1` and `/liven-funnel-2`
- `webapp/App.tsx` — reverted dev shortcut; login required again

### Fixed
- **Gender personalization bug** (Issue #16) — gender comparison was case-sensitive (`'male' === 'Male'` → always "women"); fixed with `.toLowerCase()`
- **Pay button retry** (Issue #16) — removed `{ once: true }` from Stripe pay button listener; failed payments can now retry without page refresh
- **Thank-you screen price** (Issue #16) — `selectedTier.discountedPrice` didn't exist in JSON; added `|| price` fallback
- **Pricing card radio** (Issue #16) — `handlePricingCardClick` now toggles `pricing-card__radio--selected` on inner radio element
- **Stripe double-init** (Issue #16) — added `_stripeInitializing` guard with reset on error and navigation
- **Countdown timer** (Issue #16) — `Components.countdownTimer()` was never called in paywall renderer; now renders before pricing
- **Goal timeline / recovery curve navigation** (Issue #16) — added `timeline_chart` and `recovery_curve` to `isNonQuestion` list in `handleContinueClick`
- **CBT interstitial crash** (Issue #16) — guarded `screenData.content.expertReview` access with null check
- **`getAnswer()` falsy values** (Issue #16) — changed `|| null` to `?? null` to preserve valid falsy answers
- **CSS variables** (Issue #16) — defined 7 missing aliases (`--color-text`, `--color-card-bg`, `--color-bg`, `--color-primary-dark`, `--shadow-md`, `--radius-full`, `--font-size-base`); removed duplicate `--color-success`
- **Typos** (Issue #16) — "by practicing therapist" → "by a practicing therapist"; pricePerDay `$0.88` → `$0.89`
- **Paywall header timer color** (Issue #17) — timer digits appeared grey because `.paywall-header__timer .countdown-timer__digits` descendant selector never matched (both classes on same element); fixed by applying `color: var(--color-primary); font-size: 28px` directly to `.paywall-header__timer`
- **Legal disclaimer raw HTML** (Issue #17) — `legalDisclaimer` JSON field contained raw `<a>` HTML that was escaped by `Security.escapeHtml()` and rendered as visible text; fixed by storing plain text in JSON and generating links in `Components.legalDisclaimer()`
- **XSS in legal disclaimer** (Issue #17) — `${screenData.legalDisclaimer}` was interpolated raw into DOM; routed through `Components.legalDisclaimer()` which escapes input before link injection
- **Dead `googlepay` icon mapping** (Issue #17) — `iconKeyMap` entry `'googlepay': 'googlepay'` referenced a non-existent SVG definition causing black-circle fallback; entry removed

### Added
- **Stripe checkout screen** (Issue #11)
  - New `checkout` screen inserted between paywall and `thank_you` — custom branded order summary + embedded Stripe Payment Element (cards, Apple Pay, Google Pay, PayPal)
  - `funnel/api/create-checkout.js`: serverless function creates Stripe Customer (deduped by email) + 2-phase Subscription Schedule (intro price × 1 period → regular price forever), finalizes draft invoice to obtain PaymentIntent `client_secret`
  - `funnel/api/webhook.js`: handles `invoice.payment_succeeded` → upserts `subscriptions` row in Supabase; logs warning when signature verification is bypassed
  - `funnel/app.js`: `Screens.checkout()` renders order summary card with tier name, original price, discount row, promo code badge, and "Total today"; `App.initStripe()` POSTs to `/api/create-checkout`, mounts Payment Element, wires pay button with `{ once: true }` listener and `return_url` for 3DS/redirect payment methods
  - `funnel/index.html`: Stripe.js CDN script added
  - `funnel/styles.css`: checkout screen styles (`.checkout__summary`, `.checkout__payment-element`, `.checkout__secure-footer`, etc.)
  - `funnel/package.json`: `stripe ^14` dependency
  - URL hash navigation for dev: `#checkout`, `#paywall`, `#email_capture`, etc. jump directly to any screen without clicking through the funnel

### Fixed
- **Mobile viewport layout** (Issue #10)
  - All 5 answer options now fit on-screen without scrolling on 375px phones — trimmed header chrome (~156px saved via tighter header, progress bar, nav, question text, card padding, and gap)
  - Continue/CTA button is now a fixed floating pill at the bottom of the viewport on all non-paywall screens (always reachable even when 6+ options overflow)
  - Legal disclaimer on landing screen sits directly below the gender cards instead of being pushed to the viewport bottom
  - Button container uses `left: 50%; transform: translateX(-50%); width: calc(100% - 32px)` so it never overflows or clips on any iPhone width
  - Three responsive tiers: `< 374px` (SE), `375px–428px` (most iPhones), shared CTA behavior at `≤ 768px`; paywall screens are fully excluded via `:not(.paywall-screen)` selectors

### Added
- **Seamless post-purchase auth handoff** (Issue #14)
  - Funnel now passes `access_token` + `refresh_token` via URL hash fragment (`#access_token=...&refresh_token=...`) on post-purchase redirect to the webapp
  - `webapp/components/Login.tsx`: `tryAutoAuth` reads hash tokens first (cross-origin), strips them from the URL via `history.replaceState` immediately after consumption, then falls through to the localStorage fallback for same-origin local dev
  - Users land directly on the 28-day plan after purchase — no manual login required

### Changed
- **Editable email on account creation** (Issue #14)
  - Email field on `account_creation` screen is now editable (was read-only) — users can correct a pre-filled typo before account creation
  - Real-time validation: submit stays disabled until email format is valid **and** all password requirements pass
  - `handleAccountFormSubmit` reads email from the DOM input and syncs it back to State so promo code generation and name-fallback logic stay consistent

### Fixed
- **Duplicate email UX** (Issue #14)
  - "Already registered" errors now surface inline on the form (instead of a generic toast) with a clickable "log in directly" link pointing to the webapp login screen
  - Submit button is restored after the error so users can correct the email and retry without reloading

### Added
- **Webapp merge into monorepo** (Issue #13)
  - Replaced `webapp/` placeholder scaffold with the working Mind-Compass React + Vite app
  - Added product modules: Dashboard, Daily Check-In, AI Coach, Urge Help, 28-day Plan, Settings
  - Added webapp data/prompts/services structure (`data/`, `prompts/`, `services/`, `components/`)
  - Added Supabase webapp client bootstrap (`webapp/src/lib/supabase.ts`) for login/session integration
  - Added lightweight shared client logger (`webapp/src/lib/logger.ts`) for consistent warn/error reporting

### Changed
- **Issue #13 post-merge auth flow hardening**
  - `funnel/app.js`: post-account-creation redirect points to deployed webapp URL (`https://mind-compass-webapp.vercel.app`)
  - `webapp/components/Login.tsx`: production login replaces fake login; supports silent token restore from funnel (`compass_access_token` + `compass_refresh_token`)
  - `webapp/components/Login.tsx`: funnel entry URL is now configurable via `VITE_FUNNEL_URL` (with fallback)
  - `webapp/.env.local.example`: documented `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`, and optional `VITE_FUNNEL_URL`
  - `webapp/services/geminiService.ts`: tightened error typing (`unknown` + narrowing), removed unsafe `any` paths

### Fixed
- **Issue #13 white-screen regression**
  - Prevented app bootstrap crash when `VITE_GEMINI_API_KEY` is missing by making Gemini client init resilient
  - Replaced temporary debug instrumentation added during troubleshooting with clean production code
  - `webapp/App.tsx`: logout now null-guards Supabase client (`supabase?.auth.signOut()`) to avoid runtime errors in unconfigured environments

### Security
- Kept Supabase service-role usage scoped to serverless function (`funnel/api/create-user.js`); webapp uses anon client credentials only

### Removed
- Removed debugging instrumentation used for runtime white-screen diagnosis from webapp runtime files

### Added
- **User creation flow + Supabase backend** (Issue #12, commit `eddfa69`)
  - `thank_you` screen: animated SVG checkmark, selected plan summary, promo code display
  - `create_account` screen: read-only pre-filled email, password + confirm fields, real-time requirement indicators (8+ chars, 1 number, 1 uppercase), submit disabled until all pass
  - `app_dashboard` screen: placeholder welcome screen for future main product
  - `funnel/api/create-user.js`: Vercel serverless function — creates Supabase auth user + `users_profile` record, returns access token
  - `funnel/package.json`: `@supabase/supabase-js ^2` dependency for serverless function
  - `webapp/`: Next.js scaffold for future main product (`page.tsx`, `layout.tsx`, `lib/supabase.ts`)
  - New state field: `accountCreated: false`
  - New event handlers: `handleAccountFormInput()` (real-time validation), `handleAccountFormSubmit()` (async API call)
  - New CSS: thank-you checkmark animation (`stroke-dasharray`), account creation form, app dashboard placeholder

### Changed
- `Events.handleCtaClick()`: paywall `payment` screen now navigates to `thank_you` (was: showed success toast); `confirmation` screen navigates to `create_account`
- `funnel/liven-funnel-analysis.json`: paywall screen gains `nextScreenLogic: "thank_you"`; added 4 new screen definitions (`thank_you`, `create_account`, `app_dashboard`)

### Added
- **Compass Funnel App** (`funnel/`) - Interactive quiz funnel with multi-screen architecture
  - Landing screen with gender selection (Male/Female cards)
  - 3D cartoon-style character images (generated)
  - Purple theme with CSS variables for easy customization
  - JSON-driven content from `liven-funnel-analysis.json`
  - State management with localStorage persistence
  - Multi-screen router with history-based back navigation
  - Mobile-first responsive design
  - Accessibility: keyboard navigation, ARIA labels

- **Question screen types** (Issue #2 / YEV-6)
  - Single choice (`icon_list`, `text_list`) - tap to select and auto-advance
  - Multiple choice (`checkbox_list`, `icon_checkbox_list`) - toggle selections + Continue button
  - Likert scale (1-5 rating) - icon-based with auto-advance
  - Text input field with auto-select for "Type your answer" options

- **Interstitial screens** (Issue #5 / YEV-9)
  - Trust building (interstitial_1): heart icon info card + checkmark bullet list
  - Educational (interstitial_2): research citation + image placeholder
  - Credibility (interstitial_3): 3 university logo SVG badges (Harvard, Oxford, Cambridge)
  - CBT diagram (interstitial_4): circular Thoughts/Feelings/Behavior SVG + therapist card
  - Social proof (interstitial_5): world map SVG with animated avatar markers + "2.5M users"
  - 3 renderers: `trustBuilding()`, `educational()`, `socialProof()`
  - 9 new components: infoCard, checkmarkBullets, researchCitation, imagePlaceholder, universityLogos, cbtDiagram, expertBadge, therapistCard, worldMap

- **Form capture & personalized results screens** (Issue #8 / YEV-10 split)
  - Email capture gate (`email_capture`): email input with regex validation, lock icon, privacy note, disabled Continue until valid
  - Name capture gate (`name_capture`): text input, disabled Continue until non-empty
  - Profile summary (`profile_summary`): dynamic sections from JSON + user name pulled from State; checkmark focus-area list
  - Goal timeline (`goal_timeline`): single-choice text_list with "Recommended" badge on first option, auto-advance on tap
  - `Events.handleFormInput()` — validates email (regex) / name (non-empty), toggles Continue button
  - `handleContinueClick()` extended — stores form values via `State.recordAnswer()` before navigating; bypasses `hasAnswers` for form gates
  - `Icons.lock` added — padlock SVG for privacy indicator
  - 3 new CSS sections: `.form-capture`, `.profile-summary`, `.recommended-badge`

- **Loading/transition screens** (Issue #7 / YEV-10 split)
  - Social proof loading (loading_1): circular progress animation + "534,568 people" text, auto-advances after ~3s
  - Engagement loading (profile_creation): progress checklist + 3 overlay engagement modals + 2 Trustpilot testimonials
  - Engagement loading (plan_creation_v2): progress checklist + 1 engagement modal
  - `LoadingController` — timed animation sequencer with pause/resume for modal interrupts
  - 2 renderers: `loadingSocialProof()`, `loadingEngagement()`
  - 4 new components: circularProgress, progressChecklist, engagementModal, testimonialCard
  - CSS animations: `checkmarkPop`, `fadeIn/fadeOut`, `modalSlideUp`

- **Value proposition & paywall screens** (Issue #9)
  - Plan ready (`plan_ready`): feature list + "Get my plan" CTA
  - Paywall (`paywall`): countdown timer (10:00 loop), promo code badge, 3 pricing tiers, FAQ accordion, testimonials, trust elements
  - `CountdownTimer` controller — real-time MM:SS with infinite loop, cleanup on unmount
  - 14 new components: featureList, ctaButton, countdownTimer, promoCodeBadge, pricingCard, paymentIcons, mediaLogos, statisticsBlock, awardBadge, moneyBackGuarantee, faqAccordion, companyFooter
  - State: `selectedTier`, `openFaqIndex`
  - Payment icons: Visa, Mastercard, Amex, Apple Pay, Google Pay, PayPal SVGs

- **Toast notifications**
  - `App.showToast(type, message)` — generic toast with `error` / `success` variants
  - `App.showError()` / `App.showSuccess()` convenience wrappers
  - Delegated close handler (no inline onclick)

- **Icon library** - 19 Lucide-inspired inline SVGs + 17 emoji mappings
  - Relationship: people, heart, rings, link, handshake, broken_heart
  - Actions: thumbs_up, thumbs_down, smile, lightning, hand_stop, checkmark, question, prohibited, puzzle
  - Likert: thumbs_down_x, thumbs_up_star
  - Emoji sets for wellbeing, improvement areas, and goals

- **Navigation**
  - History stack in State (`pushHistory`/`popHistory`) for accurate back navigation
  - Back button uses history, falls back to landing
  - Progress bar auto-calculates total from `questionNumber` fields

- **Security features**
  - XSS protection via `Security.escapeHtml()` utility
  - Debug logging disabled by default (`CONFIG.debug: false`)

- **Developer tooling**
  - `CONFIG.debug` flag to toggle console logging
  - Centralized `log.info/warn/error` utilities
  - Fallback data if JSON fails to load (landing + question_1)
  - `App.showToast()` / `showError()` / `showSuccess()` for non-blocking notifications
  - Multiple JSON path fallback for different server configs

- **CSS design tokens**
  - `--color-success`, `--color-error`, `--color-urgent`, `--color-promo` for status/urgency
  - `--color-primary-rgb` for rgba() usage (91, 91, 214)

- **Project tooling**
  - `.claude/commands/explore.md` - Exploration slash command
  - `.claude/commands/document.md` - Auto-close GitHub issue after documentation
  - `CLAUDE.md` - Dev workflow, test credentials, GitHub integration docs

### Changed
- `handleContinueClick` skips answer validation for interstitial, transition, personalized_results, value_proposition screens
- `App.render()` cleans up LoadingController and CountdownTimer before DOM swap

### Fixed
- **Timer reset on paywall** — pricing/FAQ clicks use targeted DOM updates instead of full re-render; countdown no longer restarts
- **Keyboard accessibility** — pricing cards and FAQ questions now respond to Enter/Space
- **Toast close** — delegated handler replaces inline onclick; consistent event delegation
- **Success toast** — paywall CTA uses `showSuccess()` (green) instead of `showError()` (red)
- Hardcoded green color replaced with `var(--color-success)` CSS variable
- `--color-primary-rgb` defined in `:root` (expert badge background was transparent)
- Citation year now escaped via `Security.escapeHtml()`
- Testimonial star color uses `var(--color-success)` instead of hardcoded `#22c55e`
- Testimonial star rating capped to max 5

### Files Added
```
funnel/
├── index.html      # Entry point with favicon
├── styles.css      # Purple theme, mobile-first, 15+ component styles
├── app.js          # Router, state, components, 9 screen renderers, LoadingController
└── assets/
    ├── male.png    # Cartoon male character
    └── female.png  # Cartoon female character
```

## [1.0.0] - 2026-02-02

### Added
- Initial project setup
- Funnel capture automation (Puppeteer)
- PDF generation from screenshots
- Liven funnel analysis JSON
- Project documentation (README, CONTEXT, ARCHITECTURE, CLAUDE.md)
- GitHub repository sync
