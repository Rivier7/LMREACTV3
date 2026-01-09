# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the LMREACTV3 project.

## Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**

#### Quality Checks
- ✅ Code formatting check (Prettier)
- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Unit tests (Vitest)
- ✅ Test coverage report

#### Build
- ✅ Production build
- ✅ Upload build artifacts

#### Deploy (Optional)
- 🔄 Deploy to hosting (commented out, ready to enable)

**Status Badge:**
```markdown
![CI](https://github.com/YOUR_USERNAME/LMREACTV3/workflows/CI/badge.svg)
```

---

### 2. Dependency Check (`dependency-check.yml`)

**Triggers:**
- Schedule: Every Monday at 9 AM UTC
- Manual trigger (workflow_dispatch)
- Pull requests (dependency review only)

**Jobs:**

#### Security Audit
- ✅ npm audit for vulnerabilities
- ✅ Check for outdated packages

#### Dependency Review (PR only)
- ✅ Review new dependencies
- ✅ Check for security issues

---

## Workflow Visualization

```
┌─────────────────┐
│   Push/PR       │
└────────┬────────┘
         │
    ┌────▼─────┐
    │   CI    │
    └────┬─────┘
         │
    ┌────▼──────────────┐
    │ Quality Checks    │
    │ • Format          │
    │ • Lint            │
    │ • Type Check      │
    │ • Tests           │
    │ • Coverage        │
    └────┬──────────────┘
         │
    ┌────▼──────────────┐
    │     Build         │
    │ • npm run build   │
    │ • Upload artifact │
    └────┬──────────────┘
         │
    ┌────▼──────────────┐
    │  Deploy (opt)     │
    │ • Production only │
    └───────────────────┘
```

---

## Setting Up

### 1. Enable Actions
1. Go to your GitHub repository
2. Click "Actions" tab
3. Enable workflows if prompted

### 2. Add Secrets (for deployment)

Go to: Repository Settings → Secrets and variables → Actions

Add these secrets:
- `VITE_API_BASE_URL` - Your production API URL
- Other deployment secrets as needed

### 3. Enable Branch Protection

Protect `main` branch:
1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - Select checks: CI / quality-checks, CI / build
   - ✅ Require pull request reviews

---

## Local Testing

Test workflows locally with [act](https://github.com/nektos/act):

```bash
# Install act
# macOS: brew install act
# Windows: choco install act-cli

# Run CI workflow
act push

# Run specific job
act -j quality-checks

# List workflows
act -l
```

---

## Monitoring

### View Workflow Runs
- Go to "Actions" tab in your repository
- Click on workflow name to see runs
- Click on run to see details

### Notifications
- GitHub will email you on workflow failures
- Configure in: Settings → Notifications → Actions

### Status Checks
- PRs show status checks at the bottom
- Merge button disabled if checks fail
- Click "Details" to see logs

---

## Troubleshooting

### Issue: "npm ci" fails

**Solution:**
```bash
# Ensure package-lock.json is committed
git add package-lock.json
git commit -m "Add package-lock.json"
```

### Issue: Tests fail in CI but pass locally

**Possible causes:**
1. Missing environment variables
2. Different Node versions
3. Timezone issues

**Solution:**
- Add environment variables to workflow
- Match Node version locally and in CI
- Use UTC in tests

### Issue: Build artifacts not uploading

**Check:**
- Path is correct: `my-project/dist/`
- Build completed successfully
- Artifacts action has proper permissions

---

## Best Practices

1. **Keep workflows fast** - Parallel jobs when possible
2. **Use caching** - Cache npm dependencies
3. **Fail fast** - Stop on first error
4. **Security** - Never commit secrets, use GitHub Secrets
5. **Artifacts** - Clean up old artifacts (retention-days)

---

## Costs

GitHub Actions is **free** for public repositories.

For private repositories:
- 2,000 minutes/month free
- After that: $0.008/minute

This project uses ~5-10 minutes per workflow run.

---

## Future Enhancements

- [ ] Add E2E tests (Playwright/Cypress)
- [ ] Deploy preview for PRs
- [ ] Lighthouse CI for performance
- [ ] Automated dependency updates (Renovate/Dependabot)
- [ ] Docker image building
- [ ] Slack notifications
