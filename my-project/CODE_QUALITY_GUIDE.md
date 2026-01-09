# Code Quality Tools Guide

## Overview

Your project now has **automated code quality enforcement** using industry-standard tools:

1. **Prettier** - Automatic code formatting
2. **ESLint** - Code linting and best practices
3. **Husky** - Git hooks for pre-commit checks
4. **lint-staged** - Run linters only on staged files

---

## 🎨 Prettier - Code Formatting

### What is Prettier?

Prettier is an **opinionated code formatter** that enforces a consistent code style. No more debates about tabs vs spaces, semicolons, or line length!

### Configuration

**File:** `.prettierrc`

```json
{
  "semi": true,                // Use semicolons
  "trailingComma": "es5",      // Trailing commas where valid in ES5
  "singleQuote": true,         // Single quotes instead of double
  "printWidth": 100,           // Line wrap at 100 characters
  "tabWidth": 2,               // 2 spaces per indentation
  "useTabs": false,            // Use spaces, not tabs
  "arrowParens": "avoid",      // Omit parens when possible: x => x
  "bracketSpacing": true,      // Spaces in object literals: { foo: bar }
  "endOfLine": "lf"            // Unix line endings
}
```

### Commands

```bash
# Format all files
npm run format

# Check if files are formatted (doesn't modify)
npm run format:check

# Format specific files
npx prettier --write src/components/MyComponent.jsx
```

### Before/After Examples

**Before (inconsistent):**
```javascript
const user={name:"John",  age:  30  }
function greet( name ){
return "Hello "+name
}
```

**After (Prettier):**
```javascript
const user = { name: 'John', age: 30 };
function greet(name) {
  return 'Hello ' + name;
}
```

---

## 🔍 ESLint - Code Linting

### What is ESLint?

ESLint **finds and fixes problems** in your JavaScript/TypeScript code. It catches:
- Bugs (unused variables, unreachable code)
- Best practices violations
- Code style issues (when integrated with Prettier)

### Configuration

**File:** `eslint.config.js`

Key rules enabled:
```javascript
{
  // Error Prevention
  'no-unused-vars': 'warn',           // Warn about unused variables
  'no-console': ['warn', { allow: ['warn', 'error'] }],  // Warn about console.log
  'no-debugger': 'warn',              // Warn about debugger statements
  'no-var': 'error',                  // Don't use var, use let/const
  'prefer-const': 'warn',             // Use const when possible

  // React Hooks
  'react-hooks/rules-of-hooks': 'error',      // Enforce Hook rules
  'react-hooks/exhaustive-deps': 'warn',      // Warn about missing deps

  // Prettier Integration
  'prettier/prettier': 'warn',        // Show Prettier issues as warnings
}
```

### Commands

```bash
# Lint all files
npm run lint

# Lint and auto-fix issues
npm run lint:fix

# Lint specific files
npx eslint src/components/MyComponent.jsx --fix
```

### Example Issues Caught

**1. Unused Variables:**
```javascript
const name = 'John';  // ⚠️ Warning: 'name' is assigned but never used
const age = 30;
console.log(age);
```

**2. Missing React Hook Dependencies:**
```javascript
useEffect(() => {
  fetchData(userId);  // ⚠️ Warning: 'userId' should be in dependency array
}, []);
```

**3. Using var instead of const/let:**
```javascript
var count = 0;  // ❌ Error: Use 'let' or 'const' instead of 'var'
```

---

## 🪝 Husky - Git Hooks

### What is Husky?

Husky runs scripts **before you commit**, ensuring code quality before it enters the repository.

### Configuration

**File:** `.husky/pre-commit`

```bash
#!/usr/bin/env sh
npx lint-staged
```

### What Happens on Commit

1. You run `git commit`
2. Husky intercepts the commit
3. Runs lint-staged on your changed files
4. If all checks pass → commit succeeds ✅
5. If checks fail → commit is blocked ❌

### Bypassing Hooks (Use Sparingly!)

```bash
# Skip pre-commit hooks (not recommended!)
git commit --no-verify -m "message"
```

---

## 🎯 lint-staged - Efficient Linting

### What is lint-staged?

lint-staged runs linters **only on staged files** (files you're committing), not the entire codebase. This makes commits fast!

### Configuration

**In package.json:**

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",         // Fix ESLint issues
      "prettier --write"      // Format with Prettier
    ],
    "*.{json,css,md}": [
      "prettier --write"      // Format non-code files
    ]
  }
}
```

### How It Works

```bash
# 1. Stage files
git add src/components/MyComponent.jsx

# 2. Commit (triggers lint-staged)
git commit -m "Update component"

# 3. lint-staged runs:
# ✓ eslint --fix src/components/MyComponent.jsx
# ✓ prettier --write src/components/MyComponent.jsx
# ✓ Automatically re-stages formatted files
# ✓ Commit succeeds
```

---

## 🚀 Workflow Examples

### Daily Development Workflow

```bash
# 1. Make changes to files
# (edit MyComponent.jsx)

# 2. Run linter manually (optional)
npm run lint:fix

# 3. Run tests (optional)
npm test

# 4. Stage your changes
git add src/components/MyComponent.jsx

# 5. Commit (hooks run automatically!)
git commit -m "Add new feature"

# Output:
# ✓ ESLint fixes applied
# ✓ Prettier formatting applied
# ✓ Files re-staged
# ✓ Commit successful
```

### Before Pushing to Remote

```bash
# Run all checks manually
npm run format:check    # Check formatting
npm run lint            # Check for lint issues
npm run type-check      # Check TypeScript types
npm test               # Run all tests

# If everything passes, push
git push
```

---

## 🛠️ IDE Integration

### VS Code Setup (Recommended)

**Install Extensions:**
1. ESLint (dbaeumer.vscode-eslint)
2. Prettier - Code formatter (esbenp.prettier-vscode)

**Settings (.vscode/settings.json):**
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

**Benefits:**
- ✅ Auto-format on save
- ✅ See lint errors inline
- ✅ Auto-fix ESLint issues on save
- ✅ Consistent team experience

---

## 🔧 Customization

### Changing Prettier Rules

Edit `.prettierrc`:

```json
{
  "semi": false,              // No semicolons
  "singleQuote": false,       // Use double quotes
  "printWidth": 80,           // Shorter lines
  "tabWidth": 4               // 4 spaces
}
```

### Disabling Specific ESLint Rules

In `eslint.config.js`:

```javascript
rules: {
  'no-console': 'off',        // Allow console.log
  'react-hooks/exhaustive-deps': 'off',  // Disable deps warning
}
```

### Ignoring Files

**Prettier (.prettierignore):**
```
dist/
build/
node_modules/
*.min.js
```

**ESLint:**
```javascript
// In eslint.config.js
globalIgnores(['dist', 'build', '**/*.min.js'])
```

---

## 📊 Benefits

### 1. Consistency Across Team

**Before:**
```javascript
// Developer A
const obj={a:1,b:2}

// Developer B
const obj = {
  a: 1,
  b: 2
};
```

**After (Prettier):**
```javascript
// Everyone
const obj = { a: 1, b: 2 };
```

### 2. Catch Bugs Early

```javascript
// ESLint catches this before runtime
const user = fetchUser();
console.log(user.name);  // ⚠️ user might be undefined
```

### 3. Better Code Reviews

- No more comments about formatting
- Focus on logic, not style
- Automated feedback before human review

### 4. Faster Onboarding

New developers don't need to learn code style - it's enforced automatically!

---

## 🎓 Best Practices

### Do's ✅

1. **Format before committing:**
   ```bash
   npm run format
   git add .
   git commit -m "message"
   ```

2. **Fix lint issues immediately:**
   ```bash
   npm run lint:fix
   ```

3. **Trust the tools:**
   - Don't fight Prettier's formatting
   - Fix ESLint warnings, don't disable them

4. **Keep config consistent:**
   - One `.prettierrc` for the whole project
   - Same ESLint rules for everyone

### Don'ts ❌

1. **Don't bypass hooks without reason:**
   ```bash
   git commit --no-verify  # ❌ Only in emergencies
   ```

2. **Don't disable rules globally:**
   ```javascript
   /* eslint-disable */  // ❌ Fix the issues instead
   ```

3. **Don't format manually:**
   - Use `npm run format`, not manual spacing

4. **Don't commit unformatted code:**
   - Hooks prevent this, but be aware

---

## 🔍 Troubleshooting

### Issue: "Prettier conflicts with ESLint"

**Solution:** We already configured this with `eslint-config-prettier`. ESLint handles logic, Prettier handles formatting.

### Issue: "Hooks not running"

**Solution:**
```bash
# Reinstall hooks
npm run prepare

# Check hook file
cat .husky/pre-commit

# Make sure it's executable (Git Bash)
chmod +x .husky/pre-commit
```

### Issue: "lint-staged too slow"

**Solution:**
- Only stage files you changed
- Don't run tests in pre-commit (run in CI instead)
- Use `--max-warnings 0` carefully

---

## 📝 Summary

### What You Have Now:

✅ **Prettier** - Automatic code formatting (no more style debates!)
✅ **ESLint** - Catch bugs and enforce best practices
✅ **Husky** - Pre-commit hooks (blocks bad commits)
✅ **lint-staged** - Fast, efficient linting (only staged files)

### NPM Scripts:

```bash
npm run format          # Format all files
npm run format:check    # Check formatting
npm run lint            # Lint all files
npm run lint:fix        # Lint and fix
```

### Automatic Process:

```
Make changes → Stage files → Commit
                    ↓
              Pre-commit hook
                    ↓
        ESLint fix + Prettier format
                    ↓
              Commit succeeds ✓
```

### Result:

🎯 **Consistent, high-quality code automatically!**

No more:
- ❌ "Why did you use tabs?"
- ❌ "You forgot a semicolon"
- ❌ "This variable is unused"

Now:
- ✅ Automatic formatting
- ✅ Automatic fixes
- ✅ Consistent codebase
- ✅ FAANG-level code quality!
