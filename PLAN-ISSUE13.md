# Issue #13: Merge Mind-Compass into webapp/ (Vite+React+Supabase)

**Overall Progress:** `100%`
**Issue:** #13

## TLDR
Replace the current Next.js scaffold in `webapp/` with the working Mind-Compass Vite+React app, wire real Supabase authentication (replacing the fake login), and update the funnel to redirect users to the webapp after account creation.

## Critical Decisions
- **Full replacement**: Delete all Next.js scaffold files; copy Mind-Compass source wholesale into `webapp/`
- **Supabase as auth source of truth**: Replaces Mind-Compass fake `onLogin()` callback; session managed via `@supabase/supabase-js`
- **Token handoff via localStorage**: Funnel stores `compass_access_token` + `compass_refresh_token`; webapp reads them on mount to auto-authenticate via `supabase.auth.setSession()`
- **Funnel redirect**: `CONFIG.webappUrl` in `funnel/app.js` — empty string → fallback to `app_dashboard` (local dev); non-empty → `window.location.href` redirect (production)
- **Gemini key**: Renamed to `VITE_GEMINI_API_KEY`; `geminiService.ts` updated to use `import.meta.env.VITE_GEMINI_API_KEY`
- **Separate Vercel project**: `webapp/` deployed independently from the funnel, root directory = `webapp`, framework = Vite

## Tasks:

- [x] 🟩 **Step 1: Clone Mind-Compass and copy source into webapp/**
  - [x] 🟩 `git clone https://github.com/oleksukh/Mind-Compass /tmp/mind-compass`
  - [x] 🟩 Delete current Next.js files from `webapp/` (`next.config.js`, `src/app/`, `src/lib/`)
  - [x] 🟩 Copy into `webapp/`: `index.html`, `index.tsx`, `App.tsx`, `types.ts`, `constants.ts`, `vite.config.ts`, `tsconfig.json`
  - [x] 🟩 Copy `components/`, `services/`, `prompts/`, `data/` directories into `webapp/`

- [x] 🟩 **Step 2: Build new package.json**
  - [x] 🟩 Replace `webapp/package.json` with Vite-based config
  - [x] 🟩 Dependencies: `react@19`, `react-dom@19`, `@google/genai`, `lucide-react`, `date-fns`, `@supabase/supabase-js`
  - [x] 🟩 DevDependencies: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/node`
  - [x] 🟩 Scripts: `dev`, `build`, `preview`

- [x] 🟩 **Step 3: Create Supabase client**
  - [x] 🟩 Create `webapp/src/lib/supabase.ts`
  - [x] 🟩 Initialize with `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`

- [x] 🟩 **Step 4: Replace fake Login with Supabase auth**
  - [x] 🟩 Rewrite `webapp/src/components/Login.tsx`
  - [x] 🟩 On mount: read `compass_access_token` + `compass_refresh_token` from localStorage → call `supabase.auth.setSession()` → if success, call `onLogin()` (skip login UI)
  - [x] 🟩 If no tokens: show login form (email + password fields)
  - [x] 🟩 Form submit: call `supabase.auth.signInWithPassword({ email, password })` → on success call `onLogin()`
  - [x] 🟩 Show error message on failed sign-in

- [x] 🟩 **Step 5: Update App.tsx auth flow**
  - [x] 🟩 Import Supabase client
  - [x] 🟩 Replace `isLoggedIn` boolean with Supabase session state (keep existing `useState` pattern, just source it from Supabase)
  - [x] 🟩 `handleLogout`: call `supabase.auth.signOut()` + clear `compass_access_token` / `compass_refresh_token` from localStorage

- [x] 🟩 **Step 6: Update geminiService.ts**
  - [x] 🟩 Replace `process.env.API_KEY` / `process.env.GEMINI_API_KEY` with `import.meta.env.VITE_GEMINI_API_KEY`

- [x] 🟩 **Step 7: Update funnel create-user.js — return refresh_token**
  - [x] 🟩 In the success response, add `refresh_token: session?.session?.refresh_token`

- [x] 🟩 **Step 8: Update funnel app.js — redirect after account creation**
  - [x] 🟩 Add `webappUrl: ''` to `CONFIG` (empty = local dev fallback)
  - [x] 🟩 In `handleAccountFormSubmit`: after storing `compass_access_token`, also store `compass_refresh_token`
  - [x] 🟩 After successful account creation: if `CONFIG.webappUrl` is non-empty → `window.location.href = CONFIG.webappUrl`; else → navigate to `app_dashboard` as before

- [x] 🟩 **Step 9: Create webapp/.env.local.example**
  - [x] 🟩 Document all required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`
  - [x] 🟩 Include comment with Vercel setup instructions

- [x] 🟩 **Step 10: Verify build**
  - [x] 🟩 `npm install` in `webapp/`
  - [x] 🟩 `npm run build` passes with no errors
  - [x] 🟩 JS/TS type errors resolved
