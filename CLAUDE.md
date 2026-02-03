# Project Instructions for Claude

## Test Credentials for Funnel Analysis

When capturing funnels, filling forms, or testing user flows:

- **Email**: `test@testtest1.com` (increment number if already used: `test2@testtest1.com`, `test3@testtest1.com`, etc.)
- **Name**: `Test User`
- **Phone**: `+1234567890` (if needed)

## Funnel Analysis Guidelines

When analyzing quiz funnels or onboarding flows:

1. Always use the test credentials above for form fields
2. If an email is rejected (already registered), increment the number and retry
3. Capture screenshots at each step with `encoded: true` for file saving
4. Document all screen types, question formats, and conversion tactics
5. Pay attention to:
   - Progress indicators
   - CTA button text
   - Trust signals and social proof
   - Urgency/scarcity elements
   - Pricing structures on paywalls

## Development Workflow for Funnel App

After making code changes to `funnel/`:

1. **Restart the server** (always do this after code changes):
   ```bash
   lsof -ti:8080 | xargs kill -9 2>/dev/null || true && cd /Users/yevhen/cursor-projects/ClaudeCode && python3 -m http.server 8080 &
   ```

2. **Provide test URL**: http://localhost:8080/funnel/

3. **Tell user**: "Open browser console (Cmd+Option+I) to check for errors"

### Testing Checklist (before marking task done)

- [ ] Server restarted with latest code
- [ ] Page loads without console errors
- [ ] Primary user flow works (click through screens)
- [ ] Back navigation works
- [ ] Progress bar updates correctly

### GitHub Integration

- Use GitHub API directly (not `gh` CLI)
- Token stored in `~/.bashrc` as `GITHUB_TOKEN`
- Get repo info: `git remote -v`
- Create issues via: `curl -X POST https://api.github.com/repos/{owner}/{repo}/issues`
