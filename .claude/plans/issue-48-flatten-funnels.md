# Feature Implementation Plan — Issue #48: Flatten funnels/ architecture

**Overall Progress:** `100%`

## TLDR
Remove the two shims (symlink + Vercel rewrites) that map public URL `/funnel-v2/` → real files in `funnels/v2/`. Rename `funnels/v1` → `funnel-v1` and `funnels/v2` → `funnel-v2` so the directory layout matches the URL. Public URLs unchanged → zero SEO/marketing breakage.

## Critical Decisions
- **Flat layout, not `funnels/funnel-v2/`** — any wrapper level keeps the URL/path mismatch and the shims stay needed. The point is to make URL == path.
- **Delete the dead `/funnels/v2/` regex in `engine/app.js`** — after flatten, that URL shape never exists anywhere. Per CLAUDE.md, no fallbacks for impossible scenarios.
- **`git mv` for directory renames** — preserves history. The relative-path edits inside the moved files are separate (`git mv` doesn't rewrite file contents).
- **No rollout dance** — rewrites → direct files is transparent (same URL, same response). Smoke test after deploy proves it.
- **Out of scope:** `CHANGELOG.md` (historical), `PLAN_issue_41.md` (stale, leave), `CONTEXT.md` ASCII tree (already stale for unrelated reasons), `README.md`/`CONTEXT.md` URL-only refs (no change needed).

## Notes during execution
- **`engine/app.js` `../../` paths kept as-is** — Browser resolves `..` from URL root as root (idempotent), so `../../assets/foo.png` from `/funnel-v2/` still resolves to `/assets/foo.png` correctly. The engine is shared across all funnels and the overkill `..` provides resilience to future nested layouts. Not in scope to touch.
- **Bonus doc updates** — `create-funnel.md` had Step 7 ("Add route to vercel.json") which is now obsolete since flat layout means no rewrites needed for new funnels. Updated to reflect new convention (`funnel-<slug>/` as the canonical pattern).
- **Pre-existing `favicon.ico` 404** — File never existed in repo. Not caused by this refactor, not in scope.

## Tasks

- [x] 🟩 **Step 1: Rename directories with `git mv`**
  - [x] 🟩 `git mv funnel/funnels/v1 funnel/funnel-v1-tmp`
  - [x] 🟩 `git rm funnel/funnel-v2` (delete symlink)
  - [x] 🟩 `git mv funnel/funnels/v2 funnel/funnel-v2`
  - [x] 🟩 `git mv funnel/funnel-v1-tmp funnel/funnel-v1`
  - [x] 🟩 `rmdir funnel/funnels`
  - [x] 🟩 Verify: `ls funnel/funnel-v1/ funnel/funnel-v2/` shows expected files

- [x] 🟩 **Step 2: Fix `../../` → `../` in moved files (16 lines total)**
  - [x] 🟩 `funnel/funnel-v1/index.html` — 3 lines
  - [x] 🟩 `funnel/funnel-v2/index.html` — 9 lines
  - [x] 🟩 `funnel/funnel-v1/screens.json` — 2 lines
  - [x] 🟩 `funnel/funnel-v2/screens.json` — 2 lines
  - [x] 🟩 Verify: `grep -rn "\.\./\.\." funnel/funnel-v1 funnel/funnel-v2` → no matches

- [x] 🟩 **Step 3: Trim `funnel/vercel.json`**
  - [x] 🟩 Remove 4 rules from `rewrites[]` (`/funnel-v{1,2}/` and `/funnel-v{1,2}/:path+`)
  - [x] 🟩 Preserve: all `redirects[]`, `/legal/:path+` rewrite, all `headers[]`
  - [x] 🟩 Verify: JSON valid, rewrites array has only `/legal/:path+`

- [x] 🟩 **Step 4: Clean dead regex in `funnel/engine/app.js`**
  - [x] 🟩 Delete the `\/funnels\/([^/]+)\/` regex line (line 4967, in profile-collection flow)
  - [x] 🟩 Same simplification at second copy (line 5489, in provision-account flow — caught by peer review)
  - [x] 🟩 Simplify to single match: `\/funnel-([^/]+)/`
  - [x] 🟩 Update comment to describe one URL shape

- [x] 🟩 **Step 5: Update documentation references**
  - [x] 🟩 `CLAUDE.md` — `funnel/funnels/v2/screens.json` → `funnel/funnel-v2/screens.json`
  - [x] 🟩 `.claude/commands/create-funnel.md` — paths + Step 7 obsolescence
  - [x] 🟩 `.claude/commands/create-ob-screen.md` — all `<funnel>` placeholders + example paths

- [x] 🟩 **Step 6: Local verification**
  - [x] 🟩 Restart local server
  - [x] 🟩 `http://localhost:8080/funnel-v2/` → `<title>Mind Compass</title>` ✓
  - [x] 🟩 `http://localhost:8080/funnel-v1/` → `<title>Mind Compass</title>` ✓
  - [x] 🟩 `/engine/styles.css`, `/engine/app.js`, `/legal/terms-of-use.html` → 200
  - [x] 🟩 `favicon.ico` → 404 (pre-existing, not caused here)

- [x] 🟩 **Step 7: Pre-PR sanity**
  - [x] 🟩 `git status` — confirmed all 16 file renames detected by git
  - [x] 🟩 `git diff --stat` — 9 files modified, −29 net lines
  - [x] 🟩 `grep` for stale refs — clean (only in CHANGELOG/historical plans, as expected)
