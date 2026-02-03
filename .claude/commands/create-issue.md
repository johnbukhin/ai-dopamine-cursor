# Create Issue

User is mid-development and thought of a bug/feature/improvement. Capture it fast so they can keep working.

## Your Goal

Create a complete issue with:
- Clear title
- TL;DR of what this is about
- Current state vs expected outcome
- Relevant files that need touching
- Risk/notes if applicable
- Proper type/priority/effort labels

## How to Get There

**Ask questions** to fill gaps - be concise, respect the user's time. They're mid-flow and want to capture this quickly. Usually need:
- What's the issue/feature
- Current behavior vs desired behavior
- Type (bug/feature/improvement) and priority if not obvious

Keep questions brief. One message with 2-3 targeted questions beats multiple back-and-forths.

**Search for context** only when helpful:
- Web search for best practices if it's a complex feature
- Grep codebase to find relevant files
- Note any risks or dependencies you spot

**Skip what's obvious** - If it's a straightforward bug, don't search web. If type/priority is clear from description, don't ask.

**Keep it fast** - Total exchange under 2min. Be conversational but brief. Get what you need, create ticket, done.

## Behavior Rules

- Be conversational - ask what makes sense, not a checklist
- Default priority: normal, effort: medium (ask only if unclear)
- Max 3 files in context - most relevant only
- Bullet points over paragraphs

## GitHub Integration

After drafting the issue, ask: **"Want me to create this in GitHub?"**

If yes:
1. Check if `GITHUB_TOKEN` env var exists
2. Get repo info from `git remote -v`
3. Create issue via GitHub API:
   ```bash
   curl -s -X POST https://api.github.com/repos/{owner}/{repo}/issues \
     -H "Authorization: Bearer $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github+json" \
     -d '{"title": "...", "body": "..."}'
   ```
4. Return the issue URL to user

If no token configured, inform user to set `GITHUB_TOKEN` in their shell profile.
