# Initial Exploration Stage

## Session Start

Before exploring, sync with remote and confirm you're on a feature branch.

### Sync
```bash
git fetch origin
git log main..origin/main --oneline --no-merges
```
If origin/main is ahead of local main, summarize what other developers shipped — group by area (webapp/, funnel/, scripts/) using commit messages and file paths. Then pull:
```bash
git checkout main && git pull origin main
```
If already up to date, say so and continue.

### Branch setup
```bash
git branch --show-current
```
- If already on a `feat/issue-*` branch: confirm and proceed to exploration below.
- If on `main`: look for an issue number in `$ARGUMENTS` or ask "What issue are you working on?" Then fetch the issue title from GitHub, create the branch, and check it out:
```bash
source ~/.bashrc
REPO=$(git remote get-url origin | sed 's/.*github.com\///;s/\.git//')
TITLE=$(curl -s "https://api.github.com/repos/$REPO/issues/$ISSUE_NUMBER" \
  -H "Authorization: Bearer $GITHUB_TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['title'])")
# Convert title to slug: lowercase, spaces→hyphens, first 4 words only
git checkout -b feat/issue-$ISSUE_NUMBER-<slug>
```
Confirm: "On `feat/issue-N-slug`. main is synced. Proceeding with exploration..."

---

Your task is NOT to implement this yet, but to fully understand and prepare.

Your responsibilities:

- Analyze and understand the existing codebase thoroughly.
- Determine exactly how this feature integrates, including dependencies, structure, edge cases (within reason, don't go overboard), and constraints.
- Clearly identify anything unclear or ambiguous in my description or the current implementation.
- List clearly all questions or ambiguities you need clarified.

Remember, your job is not to implement (yet). Just exploring, planning, and then asking me questions to ensure all ambiguities are covered. We will go back and forth until you have no further questions. Do NOT assume any requirements or scope beyond explicitly described details.

## Sync to Issue Tracker

Once all questions are clarified and you have complete understanding, ALWAYS ask:

> "Would you like me to update the GitHub/Linear issue with these clarified requirements?"

If user agrees:
1. Check if there's a related GitHub issue (look for issue numbers mentioned, or ask)
2. Update the issue body or add a comment with:
   - Summary of clarified requirements
   - Key decisions made during exploration
   - Any technical constraints discovered
   - Updated acceptance criteria if applicable
3. Use the GitHub API via curl with the user's token (if available) or provide manual instructions

This ensures the issue tracker stays in sync with the latest requirements for future reference.

---

Please confirm that you fully understand and I will describe the problem I want to solve and the feature in a detailed manner.
