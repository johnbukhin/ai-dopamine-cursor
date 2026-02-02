# Setting Up Remote Repository

This guide will help you connect your local git repository to a remote repository (GitHub, GitLab, etc.) so you can sync your code and collaborate.

## Step 1: Create Remote Repository

### GitHub
1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name it: `ClaudeCode` (or your preferred name)
4. Choose visibility (Public/Private)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### GitLab
1. Go to [GitLab](https://gitlab.com) and sign in
2. Click "New project" → "Create blank project"
3. Name it: `ClaudeCode`
4. Choose visibility
5. **DO NOT** initialize with README
6. Click "Create project"

### Other Platforms
Follow similar steps for Bitbucket, Azure DevOps, etc.

## Step 2: Connect Local to Remote

After creating the remote repository, you'll get a URL. Use one of these commands:

### HTTPS (Recommended for beginners)
```bash
cd /Users/yevhen/cursor-projects/ClaudeCode
git remote add origin https://github.com/YOUR_USERNAME/ClaudeCode.git
```

### SSH (If you have SSH keys set up)
```bash
cd /Users/yevhen/cursor-projects/ClaudeCode
git remote add origin git@github.com:YOUR_USERNAME/ClaudeCode.git
```

Replace `YOUR_USERNAME` with your actual GitHub/GitLab username.

## Step 3: Verify Remote

```bash
git remote -v
```

You should see:
```
origin  https://github.com/YOUR_USERNAME/ClaudeCode.git (fetch)
origin  https://github.com/YOUR_USERNAME/ClaudeCode.git (push)
```

## Step 4: Push to Remote

```bash
git push -u origin main
```

If you're using `master` as your default branch:
```bash
git push -u origin master
```

You may be prompted for credentials:
- **HTTPS**: Username and Personal Access Token (not password)
- **SSH**: Should work automatically if keys are set up

## Step 5: Verify

1. Go to your remote repository in the browser
2. You should see all your files including:
   - README.md
   - CONTEXT.md
   - ARCHITECTURE.md
   - All code files
   - Screenshots

## Future Sync Workflow

### Pushing Changes
```bash
git add .
git commit -m "Description of changes"
git push
```

### Pulling Changes (if working from multiple machines)
```bash
git pull
```

## Troubleshooting

### Authentication Issues (HTTPS)
If you get authentication errors:
1. Use a Personal Access Token instead of password
2. For GitHub: Settings → Developer settings → Personal access tokens → Generate new token
3. Use the token as your password when prompted

### Branch Name Mismatch
If your local branch is `main` but remote expects `master`:
```bash
git branch -M main
git push -u origin main
```

Or rename to match remote:
```bash
git branch -M master
git push -u origin master
```

### Already Has Remote
If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin YOUR_NEW_URL
```

## Benefits of Remote Repository

✅ **Backup**: Your code is safely stored in the cloud
✅ **Collaboration**: Multiple AI models can work with the same codebase
✅ **Version History**: Complete history of all changes
✅ **Accessibility**: Access from anywhere
✅ **Documentation**: All context and docs in one place

## Next Steps

Once your remote is set up:
1. Share the repository URL with AI assistants
2. They can clone and work with the full context
3. All changes sync automatically
4. Multiple models can collaborate on the same codebase
