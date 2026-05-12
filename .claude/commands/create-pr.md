# Create Pull Request

Open a GitHub PR for the current feature branch. Run this after `/review` passes, before `/document`.

## Step 1 — Confirm state

```bash
git branch --show-current
git log main..HEAD --oneline --no-merges
```

If on `main` or no commits ahead of main, stop: "Check out a feature branch and commit your changes first."

## Step 2 — Push branch

```bash
git push -u origin $(git branch --show-current)
```

## Step 3 — Resolve issue number and title

Parse issue number from branch name (`feat/issue-N-*`). Fetch the issue title:

```bash
source ~/.bashrc
REPO=$(git remote get-url origin | sed 's/.*github.com\///;s/\.git//')
curl -s "https://api.github.com/repos/$REPO/issues/$ISSUE_NUMBER" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['title'])"
```

## Step 4 — Generate PR body

Summarize commits on this branch:

```bash
git log main..HEAD --oneline --no-merges
```

Build body with: one-sentence summary of what changed, `Closes #N`, bulleted commit list, "Smoke test runs automatically on push via Claude Code hook."

Ask: "Any extra context to add, or good to submit?"

## Step 5 — Create PR

```bash
curl -s -X POST "https://api.github.com/repos/$REPO/pulls" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{"title":"feat: <issue title> (#N)","body":"<body>","head":"<branch>","base":"main"}'
```

Return the PR URL. Remind: "After it's merged, run `/document` to update the CHANGELOG."
