# Feature Implementation Plan — Issue #14

**Overall Progress:** `80%`

## TLDR
Fix the broken post-purchase auth handoff (cross-origin localStorage → URL hash) so users land directly on the 28-day plan after buying. Also make the email field editable on the account creation screen so users can correct typos before the account is created.

## Critical Decisions
- **Token transport**: URL hash fragment (`#access_token=...&refresh_token=...`) instead of localStorage — the only mechanism that works cross-origin without a server round-trip.
- **Hash cleanup**: `history.replaceState` immediately after consuming tokens — keeps URL clean and tokens out of browser history.
- **localStorage kept as fallback**: Still written in funnel for local dev (same-origin). `tryAutoAuth` checks hash first, localStorage second.
- **Email field**: Plain editable input (remove `readonly`) — simpler, no "Edit" toggle needed.
- **Email in submit**: Read from DOM input, not `State.getAnswer('email_capture')`. Update State so promo code / name fallback logic stays consistent.
- **Duplicate email error**: Show inline on form, restore submit button — user corrects email and retries.

---

## Tasks

- [x] 🟩 **Step 1: Funnel — pass tokens via URL hash on redirect**
  - [x] 🟩 In `handleAccountFormSubmit()`: after receiving `access_token` + `refresh_token`, build redirect URL as `CONFIG.webappUrl + '#access_token=' + encodeURIComponent(accessToken) + '&refresh_token=' + encodeURIComponent(refreshToken)`
  - [x] 🟩 Keep existing `localStorage.setItem` writes (same-origin fallback for local dev)
  - [x] 🟩 Local dev branch (`CONFIG.webappUrl` is empty) is unchanged — still navigates to `app_dashboard`

- [x] 🟩 **Step 2: Webapp — consume hash tokens in `tryAutoAuth`**
  - [x] 🟩 In `Login.tsx` `tryAutoAuth()`: parse `window.location.hash` with `URLSearchParams` (strip leading `#`)
  - [x] 🟩 If hash contains `access_token` + `refresh_token`: call `supabase.auth.setSession()`, then `history.replaceState(null, '', window.location.pathname)` to clean URL
  - [x] 🟩 On success: call `onLogin()` and return
  - [x] 🟩 On failure (invalid/expired hash tokens): clear hash via `history.replaceState`, fall through to localStorage check
  - [x] 🟩 Existing localStorage check remains as second fallback (unchanged)

- [x] 🟩 **Step 3: Funnel — make email field editable**
  - [x] 🟩 In `Screens.createAccount()`: remove `readonly`, `tabindex="-1"`, and `create-account__input--readonly` class from email input; add `autocomplete="email"` and `data-field="email"`
  - [x] 🟩 In `handleAccountFormInput()`: add email format validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`); include valid email in `canSubmit` check (alongside password requirements)

- [x] 🟩 **Step 4: Funnel — update submit to use corrected email**
  - [x] 🟩 In `handleAccountFormSubmit()`: read email from `document.getElementById('account-email')?.value.trim()` instead of `State.getAnswer('email_capture')`
  - [x] 🟩 Call `State.recordAnswer('email_capture', correctedEmail)` before promo code generation
  - [x] 🟩 On Supabase "User already registered" error: show message on form, re-enable submit button so user can fix email and retry

- [ ] 🟥 **Step 5: Verify & push**
  - [ ] 🟥 Restart local funnel server and smoke-test both flows (new account → hash redirect, direct webapp login)
  - [ ] 🟥 Verify URL hash is stripped from webapp after auto-auth
  - [ ] 🟥 Verify editable email: format validation gates submit, corrected email is used for account creation
  - [ ] 🟥 Commit and push; confirm Vercel deploys both funnel and webapp
