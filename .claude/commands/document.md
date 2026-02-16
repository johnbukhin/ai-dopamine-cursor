# Update Documentation Task

You are updating documentation after code changes.

## 1. Identify Changes
- Check git diff or recent commits for modified files
- Identify which features/modules were changed
- Note any new files, deleted files, or renamed files

## 2. Verify Current Implementation
**CRITICAL**: DO NOT trust existing documentation. Read the actual code.

For each changed file:
- Read the current implementation
- Understand actual behavior (not documented behavior)
- Note any discrepancies with existing docs

## 3. Update Relevant Documentation

- **CHANGELOG.md**: Add entry under "Unreleased" section
  - Use categories: Added, Changed, Fixed, Security, Removed
  - Be concise, user-facing language

## 4. Documentation Style Rules

✅ **Concise** - Sacrifice grammar for brevity
✅ **Practical** - Examples over theory
✅ **Accurate** - Code verified, not assumed
✅ **Current** - Matches actual implementation

❌ No enterprise fluff
❌ No outdated information
❌ No assumptions without verification

## 5. Close Related GitHub Issue

After documentation is updated, close the related GitHub issue so it syncs to Linear automatically.

1. Identify the issue number from the PLAN file, CHANGELOG entry, or ask the user
2. Get the GitHub token and repo info:
   ```bash
   source ~/.bashrc && echo $GITHUB_TOKEN
   git remote -v  # to get owner/repo
   ```
3. Close the issue via GitHub API:
   ```bash
   curl -s -X PATCH "https://api.github.com/repos/{owner}/{repo}/issues/{number}" \
     -H "Authorization: token $GITHUB_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"state": "closed"}'
   ```
4. Confirm to the user that the issue was closed (include issue number and title)

## 6. Ask if Uncertain

If you're unsure about intent behind a change or user-facing impact, **ask the user** - don't guess.
