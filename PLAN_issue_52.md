# Profile Tab Restructure — Implementation Plan

**Overall Progress:** `95%`

**Issue:** [#52](https://github.com/johnbukhin/ai-dopamine-cursor/issues/52)
**Branch:** `feat/issue-52-profile-tab-restructure`

## TLDR
Restructure the Settings page (sidebar entry "Profile") from **Profile / Access / Terms** into **Data / Privacy / Access / Terms**. Surface onboarding answers in a new read-only Data tab, rename current Profile → Privacy, and populate Terms with links to the four existing legal pages.

## Critical Decisions
- **Storage:** Reuse existing `users_profile.quiz_answers` (JSONB) — no new table needed; `funnel/api/provision-account.js` already persists answers forward-only.
- **Backfill:** Forward-only — pre-existing users with no `quiz_answers` row see an empty-state message.
- **Delete Account:** Descoped from this issue.
- **Legal pages:** Linked from funnel domain via `import.meta.env.VITE_FUNNEL_URL`, opened in new tab.
- **Data tab UX:** Grouped sections (Demographics / Goals & Symptoms / Assessment / Profile), read-only.
- **Question labels:** Sourced from `screens.json`, copied to webapp at build time. Fallback to `Question N` for unmapped keys.
- **Mobile tabs:** `overflow-x-auto` horizontal scroll for the 4-tab row.
- **RLS:** Separate migration enabling RLS + `auth.uid() = id` SELECT policy on `users_profile` (assumes table already exists).
- **Default sub-tab:** `Data`.

## Tasks

- [ ] 🟨 **Step 1: RLS migration for `users_profile`**
  - [x] 🟩 Audit current readers of `users_profile` — `funnel/api/create-user.js` + `funnel/api/provision-account.js` both use `SERVICE_ROLE_KEY` (bypass RLS). Safe to enable.
  - [x] 🟩 Created `supabase/migrations/20260601_users_profile_rls.sql` with `ENABLE ROW LEVEL SECURITY` + SELECT policy `auth.uid() = id`
  - [ ] 🟥 Apply migration to Supabase Dashboard (deferred to verification step)

- [x] 🟩 **Step 2: Build-time copy of `screens.json` into webapp**
  - [x] 🟩 Created `webapp/scripts/copy-screens.mjs` — copies into `webapp/public/data/screens.json` (served as static asset, fetched at runtime to keep JS bundle small)
  - [x] 🟩 Added `prebuild` + `predev` hooks in `webapp/package.json`
  - [x] 🟩 Added `public/data/screens.json` to `webapp/.gitignore`
  - [x] 🟩 Verified output: 47KB file generated

- [x] 🟩 **Step 3: `<DataSettings />` component**
  - [x] 🟩 Added `DataSettings` to `webapp/components/Settings.tsx`: fetches `users_profile` row via anon Supabase client
  - [x] 🟩 Loads `/data/screens.json` via `fetch()` at component mount; builds `id → headline` map with `Question N` fallback via `labelFor()`
  - [x] 🟩 Renders 4 sections: Demographics, Goals & Symptoms (q30–34), Assessment (5 pre-computed scores), Profile
  - [x] 🟩 Empty-state + loading + error states all handled

- [x] 🟩 **Step 4: Rename `ProfileSettings` → `PrivacySettings`**
  - [x] 🟩 Renamed component, updated switch case, updated `<h2>` heading

- [x] 🟩 **Step 5: Populate `<TermsSettings />` with legal links**
  - [x] 🟩 4 anchor links built from `import.meta.env.VITE_FUNNEL_URL` + `/legal/*.html`, `target="_blank" rel="noopener noreferrer"`, with external-link icon
  - [x] 🟩 `LEGAL_LINKS` const keeps the list maintainable

- [x] 🟩 **Step 6: Settings shell — type, tabs, default**
  - [x] 🟩 `SettingsTab` type → `'Data' | 'Privacy' | 'Access' | 'Terms'`
  - [x] 🟩 Default state → `'Data'`
  - [x] 🟩 `renderContent()` switch updated
  - [x] 🟩 4 `<TabButton />`s in correct order + `whitespace-nowrap` for clean wrapping
  - [x] 🟩 `overflow-x-auto` on tabs container

- [ ] 🟨 **Step 7: Local verification**
  - [x] 🟩 `npm run build` — prebuild copied screens.json, TS compiled, Vite built, `dist/data/screens.json` present
  - [x] 🟩 Smoke test: 7/9 pass. 2 failures are env-only (missing `SUPABASE_SERVICE_ROLE_KEY` in funnel/.env.local) — unrelated to this change. Auth logic checks both pass.
  - [ ] 🟥 Apply RLS migration in Supabase Dashboard (manual step before deploy)
  - [ ] 🟥 Manual browser verification of all 4 tabs (deferred to `/verify` or `/peer-review` stage)
