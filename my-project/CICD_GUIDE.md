# CI/CD Pipeline Guide

## Overview

Your project now has a **fully automated CI/CD pipeline** using GitHub Actions. Every push and pull request automatically runs quality checks, tests, and builds.

---

## 🚀 What is CI/CD?

**CI (Continuous Integration):**
- Automatically test code when pushed
- Catch bugs early, before they reach production
- Ensure code quality standards

**CD (Continuous Deployment):**
- Automatically deploy passing code
- No manual deployment steps
- Faster releases, less human error

---

## 📋 Pipeline Overview

### On Every Push/PR:

```
1. Code Pushed to GitHub
         ↓
2. GitHub Actions Triggered
         ↓
3. Quality Checks Job
   • ✅ Format check (Prettier)
   • ✅ Lint (ESLint)
   • ✅ Type check (TypeScript)
   • ✅ Run tests (Vitest)
   • ✅ Coverage report
         ↓
4. Build Job (if checks pass)
   • ✅ Production build
   • ✅ Upload artifacts
         ↓
5. Deploy Job (optional, main branch only)
   • ✅ Deploy to hosting
```

---

## 🛠️ Workflow Files

### 1. Main CI Workflow

**File:** `.github/workflows/ci.yml`

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**What it does:**

#### Job 1: Quality Checks (Parallel)
```yaml
- Code formatting check (Prettier)
- Linting (ESLint)
- TypeScript type checking
- Unit tests (Vitest)
- Test coverage report
```

#### Job 2: Build (After checks pass)
```yaml
- Install dependencies
- Run production build
- Upload build artifacts (kept for 7 days)
```

#### Job 3: Deploy (Optional, main only)
```yaml
- Download build artifacts
- Deploy to hosting platform
```

**Run time:** ~3-5 minutes

---

### 2. Dependency Check Workflow

**File:** `.github/workflows/dependency-check.yml`

**Triggers:**
- Weekly schedule (Mondays at 9 AM UTC)
- Manual trigger
- Pull requests (dependency review)

**What it does:**
- Security audit (npm audit)
- Check for outdated packages
- Review new dependencies in PRs

**Run time:** ~1-2 minutes

---

## 🎯 How to Use

### Daily Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# (edit files)

# 3. Run checks locally (optional, but recommended)
npm run format
npm run lint:fix
npm run type-check
npm test

# 4. Commit and push
git add .
git commit -m "Add my feature"
git push origin feature/my-feature

# 5. GitHub Actions runs automatically!
# Go to GitHub → Actions tab to watch
```

### Creating a Pull Request

```bash
# 1. Push your branch
git push origin feature/my-feature

# 2. Go to GitHub and create PR

# 3. CI runs automatically
# ✅ All checks must pass before merge

# 4. Review status at bottom of PR:
# ✓ CI / quality-checks — Passed
# ✓ CI / build — Passed

# 5. Once approved and checks pass, merge!
```

---

## 📊 Understanding Workflow Status

### In GitHub UI:

#### Actions Tab
- See all workflow runs
- Click run to see details
- View logs for each step

#### Pull Request
- Status checks shown at bottom
- ✅ Green checkmark = passed
- ❌ Red X = failed
- 🟡 Yellow dot = running

#### Commit Page
- Shows status next to commit
- Click for details

### Status Indicators

```
✅ All checks passed    - Ready to merge!
❌ Some checks failed   - Fix issues before merge
🟡 Checks running       - Wait for completion
⚪ No checks            - Workflow not triggered
```

---

## 🔧 Configuration

### Adding Secrets

For deployment, add secrets to GitHub:

1. Go to: **Repository → Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Add secrets:

```
Name: VITE_API_BASE_URL
Value: https://api.yourapp.com

Name: DEPLOY_TOKEN
Value: your-deployment-token
```

**Usage in workflow:**
```yaml
env:
  VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
```

---

### Branch Protection Rules

Protect `main` branch from bad code:

1. Go to: **Settings → Branches → Add rule**
2. Branch pattern: `main`
3. Enable:
   - ✅ **Require status checks to pass**
     - Select: `CI / quality-checks`
     - Select: `CI / build`
   - ✅ **Require branches to be up to date**
   - ✅ **Require pull request reviews**
   - ✅ **Dismiss stale PR reviews**

**Result:** Can't merge to main if CI fails!

---

## 🚨 Troubleshooting

### Issue: Tests fail in CI but pass locally

**Possible causes:**
1. Different Node versions
2. Missing environment variables
3. Timezone differences

**Solutions:**
```yaml
# Match Node version
- uses: actions/setup-node@v4
  with:
    node-version: 20.x  # Same as local

# Add environment variables
env:
  TZ: 'UTC'
  NODE_ENV: 'test'
```

---

### Issue: "npm ci" command fails

**Error:** `package-lock.json` out of sync

**Solution:**
```bash
# Locally:
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

---

### Issue: Build artifacts not found

**Check:**
1. Build completed successfully
2. Path is correct in upload action
3. Path matches in download action

**Example:**
```yaml
# Upload
- uses: actions/upload-artifact@v4
  with:
    name: build-files
    path: my-project/dist/  # Must match actual build output

# Download
- uses: actions/download-artifact@v4
  with:
    name: build-files  # Must match upload name
    path: my-project/dist
```

---

### Issue: Workflow not triggering

**Check:**
1. Workflow file is in `.github/workflows/`
2. File has `.yml` or `.yaml` extension
3. Syntax is valid YAML
4. Trigger conditions match your action

**Test locally:**
```bash
# Install act
brew install act  # macOS
choco install act-cli  # Windows

# Run workflow
act push
```

---

## 📈 Monitoring & Notifications

### Email Notifications

GitHub sends emails on:
- ❌ Workflow failures (default: enabled)
- ✅ Workflow successes (default: disabled)

**Configure:** Settings → Notifications → Actions

---

### Status Badges

Add to your README:

```markdown
![CI](https://github.com/YOUR_USERNAME/LMREACTV3/workflows/CI/badge.svg)
![Dependency Check](https://github.com/YOUR_USERNAME/LMREACTV3/workflows/Dependency%20Check/badge.svg)
```

**Result:** Shows real-time status in README

---

## 🎓 Best Practices

### 1. Keep Workflows Fast

```yaml
# ✅ Good: Use caching
- uses: actions/setup-node@v4
  with:
    cache: 'npm'

# ✅ Good: Parallel jobs
jobs:
  test:
    # runs in parallel with...
  lint:
    # other job

# ❌ Bad: Sequential when parallel is possible
```

---

### 2. Fail Fast

```yaml
# Stop on first error
strategy:
  fail-fast: true

# Or continue on error for non-critical checks
- run: npm audit
  continue-on-error: true
```

---

### 3. Use Proper Secrets

```yaml
# ✅ Good: Use secrets
env:
  API_KEY: ${{ secrets.API_KEY }}

# ❌ Bad: Hardcode secrets
env:
  API_KEY: 'abc123'  # Never do this!
```

---

### 4. Clean Up Artifacts

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build-files
    path: dist/
    retention-days: 7  # Auto-delete after 7 days
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for React)

```yaml
- name: Deploy to Vercel
  run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

**Setup:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` locally to link project
3. Get token: `vercel token create`
4. Add token to GitHub secrets

---

### Option 2: Netlify

```yaml
- name: Deploy to Netlify
  run: npx netlify deploy --prod --dir=dist
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

### Option 3: AWS S3 + CloudFront

```yaml
- name: Deploy to S3
  run: |
    aws s3 sync dist/ s3://your-bucket --delete
    aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }}
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

---

### Option 4: GitHub Pages

```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./my-project/dist
```

---

## 💰 Costs

### GitHub Actions Pricing

**Public Repositories:**
- ✅ **FREE** unlimited minutes

**Private Repositories:**
- ✅ **2,000 minutes/month FREE**
- After free tier: **$0.008/minute**

**This Project:**
- ~5 minutes per workflow run
- ~20-40 runs per week (depending on activity)
- **Free tier is usually sufficient!**

---

## 🔮 Advanced Features

### 1. Matrix Strategy (Test Multiple Versions)

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
    os: [ubuntu-latest, windows-latest, macos-latest]

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

---

### 2. Conditional Jobs

```yaml
deploy:
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  # Only deploys on main branch pushes
```

---

### 3. Manual Approval

```yaml
deploy:
  environment:
    name: production
    url: https://yourapp.com
  # Requires manual approval in GitHub UI
```

---

### 4. Slack Notifications

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

---

## 📚 Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Action Marketplace](https://github.com/marketplace?type=actions)
- [Act - Local Testing](https://github.com/nektos/act)

---

## ✨ Summary

### What You Have:

✅ **Automated Quality Checks**
- Format, lint, type check, tests

✅ **Automated Builds**
- Production build on every push

✅ **Branch Protection**
- Can't merge failing code

✅ **Security Monitoring**
- Weekly dependency checks

✅ **Ready for Deployment**
- Deployment step ready to enable

### Benefits:

- 🚀 **Faster Development** - Catch issues early
- 🔒 **Better Quality** - Automated standards enforcement
- 📊 **Transparency** - See all checks in PR
- ⚡ **Quick Feedback** - Know if code works in ~5 min
- 🤝 **Team Confidence** - Code is always tested

### Next Steps:

1. **Push code** - CI runs automatically!
2. **Watch Actions tab** - See your pipeline in action
3. **Enable deployment** - When ready to deploy
4. **Add status badges** - Show CI status in README

**You now have a professional FAANG-level CI/CD pipeline!** 🎉
