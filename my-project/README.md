# Lane Management System (LMREACTV3)

![CI](https://github.com/YOUR_USERNAME/LMREACTV3/workflows/CI/badge.svg)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-40%20Passing-success.svg)]()
[![Coverage](https://img.shields.io/badge/Coverage-96%25-brightgreen.svg)]()

A modern, high-performance React application for managing logistics lanes with 2FA authentication, built to **FAANG industry standards**.

## ✨ Features

- 🔐 **Secure Authentication** - Email-based 2FA with JWT tokens
- 📊 **Lane Management** - Create, edit, validate, and track logistics lanes
- 📈 **Dashboard Analytics** - Real-time statistics and visualizations
- 🎨 **Modern UI** - Tailwind CSS with responsive design
- ⚡ **High Performance** - Code splitting, lazy loading, optimized bundles
- 🔒 **Type Safe** - TypeScript with strict mode
- 🧪 **Well Tested** - 40 tests with 96%+ coverage
- 🚀 **CI/CD Ready** - Automated testing and deployment
- 📱 **Mobile Friendly** - Responsive across all devices

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/LMREACTV3.git
cd LMREACTV3/my-project

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.development

# Update .env.development with your API URL
# VITE_API_BASE_URL=http://localhost:8080/api

# Start development server
npm run dev
```

Visit http://localhost:5173

### Build for Production

```bash
# Type check, lint, test, and build
npm run build

# Preview production build
npm run preview
```

---

## 📚 Table of Contents

- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [Development Workflow](#-development-workflow)
- [Testing](#-testing)
- [Code Quality](#-code-quality)
- [Performance](#-performance)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)

---

## 📁 Project Structure

```
my-project/
├── .github/
│   └── workflows/          # CI/CD pipelines
│       ├── ci.yml         # Main CI/CD workflow
│       └── dependency-check.yml
├── .husky/                # Git hooks
│   └── pre-commit        # Pre-commit quality checks
├── dist/                 # Production build output
├── src/
│   ├── api/             # API client & configuration
│   │   ├── api.js       # API endpoints
│   │   ├── auth.js      # Authentication API
│   │   └── axios_helper.js  # Axios configuration
│   ├── components/      # Reusable components
│   │   ├── ErrorBoundary.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── Header.jsx
│   │   └── ...
│   ├── context/         # React context providers
│   │   └── AuthContext.jsx
│   ├── hooks/           # Custom React hooks
│   │   └── useErrorHandler.ts
│   ├── pages/           # Page components (lazy loaded)
│   │   ├── Dashboard.jsx
│   │   ├── LoginPage.jsx
│   │   └── ...
│   ├── test/            # Test configuration
│   │   └── setup.js
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── errorLogger.ts
│   │   └── validation.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── .env.example         # Environment variables template
├── .prettierrc          # Prettier configuration
├── eslint.config.js     # ESLint configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies & scripts
```

---

## 🛠️ Available Scripts

### Development

```bash
npm run dev              # Start development server
npm run preview          # Preview production build locally
```

### Building

```bash
npm run build            # Type check + build for production
npm run build:analyze    # Build with bundle analysis
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run format           # Format code with Prettier
npm run format:check     # Check if code is formatted
npm run type-check       # TypeScript type checking
```

### Testing

```bash
npm test                 # Run tests in watch mode
npm test -- --run        # Run tests once
npm run test:ui          # Open test UI
npm run test:coverage    # Generate coverage report
```

---

## 🌍 Environment Variables

Create `.env.development` for local development:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api

# App Configuration
VITE_APP_NAME=Lane Management System
VITE_APP_VERSION=1.0.0

# Development Settings
VITE_ENABLE_DEBUG=true
```

For production, create `.env.production` or use CI/CD secrets.

**Important:** Never commit `.env` files with real credentials!

---

## 💻 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/my-new-feature
```

### 2. Make Changes

- Write code following existing patterns
- Add tests for new functionality
- Keep changes focused and atomic

### 3. Quality Checks (Automatic on Commit)

```bash
# Pre-commit hook runs automatically:
# ✓ ESLint --fix
# ✓ Prettier --write

git add .
git commit -m "Add new feature"
```

### 4. Push and Create PR

```bash
git push origin feature/my-new-feature
```

GitHub Actions will automatically:
- ✅ Run all tests
- ✅ Check code formatting
- ✅ Verify TypeScript types
- ✅ Build production bundle
- ✅ Generate coverage report

---

## 🧪 Testing

### Running Tests

```bash
# Watch mode (for development)
npm test

# Run once (for CI/CD)
npm test -- --run

# With coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

### Writing Tests

```javascript
// Component test example
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Test Coverage

Current coverage: **96%+**

```bash
# Generate HTML report
npm run test:coverage

# Open coverage report
open coverage/index.html
```

---

## 🎨 Code Quality

### ESLint

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

Rules enforced:
- React hooks rules
- No unused variables
- Consistent code style
- TypeScript best practices

### Prettier

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

Configuration in `.prettierrc`:
- Single quotes
- 2 space indentation
- Semicolons
- 100 character line width

### Pre-commit Hooks

Husky runs quality checks before each commit:
1. ESLint fixes
2. Prettier formatting

To bypass (not recommended):
```bash
git commit --no-verify
```

---

## ⚡ Performance

### Current Performance

- **Initial Load:** ~97 KB (gzipped)
- **Time to Interactive:** ~1-1.5 seconds
- **Lighthouse Score:** 90+ (Performance)

### Optimizations Implemented

1. **Code Splitting**
   - Each route is a separate chunk
   - Loaded only when needed

2. **Lazy Loading**
   - React.lazy() for all routes
   - Suspense with loading states

3. **Vendor Chunking**
   - React framework separate
   - Utilities separate
   - UI libraries separate

4. **Bundle Optimization**
   - Minification with Terser
   - Tree-shaking
   - CSS extraction

### Analyzing Bundle

```bash
# Build with analysis
npm run build:analyze

# Open the visualization
open dist/stats.html
```

See [PERFORMANCE_GUIDE.md](PERFORMANCE_GUIDE.md) for details.

---

## 🚀 Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Option 3: GitHub Pages

```yaml
# Already configured in .github/workflows/ci.yml
# Uncomment the deploy job
```

### Environment Variables for Production

Set these in your hosting provider:
- `VITE_API_BASE_URL` - Your production API URL
- Any other secrets needed

---

## 📖 Documentation

### Core Guides

- [ERROR_HANDLING_GUIDE.md](ERROR_HANDLING_GUIDE.md) - Error handling patterns
- [TYPESCRIPT_GUIDE.md](TYPESCRIPT_GUIDE.md) - TypeScript usage
- [CODE_QUALITY_GUIDE.md](CODE_QUALITY_GUIDE.md) - Code quality tools
- [CICD_GUIDE.md](CICD_GUIDE.md) - CI/CD pipeline
- [PERFORMANCE_GUIDE.md](PERFORMANCE_GUIDE.md) - Performance optimization

### Quick References

- [PROGRESS_SUMMARY.md](PROGRESS_SUMMARY.md) - Development progress
- [TYPESCRIPT_SUMMARY.md](TYPESCRIPT_SUMMARY.md) - TypeScript quick ref
- [CICD_SUMMARY.md](CICD_SUMMARY.md) - CI/CD quick ref
- [PERFORMANCE_SUMMARY.md](PERFORMANCE_SUMMARY.md) - Performance metrics

---

## 🛠️ Tech Stack

### Core

- **React 19.1** - UI library
- **Vite 7.0** - Build tool & dev server
- **React Router 7.12** - Client-side routing
- **TypeScript 5.9** - Type safety

### Styling

- **Tailwind CSS 4.1** - Utility-first CSS
- **Lucide React** - Icon library

### Data & State

- **Axios 1.10** - HTTP client
- **JWT Decode 4.0** - Token handling
- **React Context** - Global state

### Development Tools

- **Vitest 4.0** - Testing framework
- **React Testing Library** - Component testing
- **ESLint 9.30** - Linting
- **Prettier 3.7** - Code formatting
- **Husky 9.1** - Git hooks
- **lint-staged 16.2** - Pre-commit linting

### CI/CD

- **GitHub Actions** - Automated workflows
- **Codecov** - Coverage reporting

---

## 🏗️ Architecture

### High-Level Overview

```
┌─────────────────────────────────────────┐
│           User Browser                  │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│        React Application                │
│  ┌───────────────────────────────────┐ │
│  │  Routes (Lazy Loaded)             │ │
│  │  • Login                          │ │
│  │  • Dashboard                      │ │
│  │  • Lanes                          │ │
│  │  • Accounts                       │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │  Context (Global State)           │ │
│  │  • AuthContext                    │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │  API Layer                        │ │
│  │  • Axios Instance                 │ │
│  │  • Error Interceptors             │ │
│  │  • Token Management               │ │
│  └───────────────────────────────────┘ │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│        Backend API                      │
│        (Spring Boot)                    │
└─────────────────────────────────────────┘
```

### Data Flow

```
User Action
    ↓
Component
    ↓
API Call (axios)
    ↓
Interceptor (add auth token)
    ↓
Backend API
    ↓
Response
    ↓
Interceptor (log errors)
    ↓
Component (update state)
    ↓
Re-render
```

---

## 📄 License

This project is private and proprietary.

---

## 📞 Support

For questions or issues:
- Create an issue in GitHub
- Contact the development team
- Check the documentation guides

---

## 🎯 Project Status

**Current Version:** 1.0.0
**Status:** Production Ready ✅
**Test Coverage:** 96%+
**Performance:** Optimized 🚀

### Completed Features

- ✅ Authentication & Authorization
- ✅ Lane Management
- ✅ Dashboard Analytics
- ✅ Account Management
- ✅ File Upload
- ✅ Error Handling
- ✅ TypeScript Integration
- ✅ Testing Suite
- ✅ CI/CD Pipeline
- ✅ Performance Optimizations

### Roadmap

- [ ] React Query integration
- [ ] Accessibility improvements
- [ ] Advanced security features
- [ ] Analytics & monitoring

---

**Built to FAANG industry standards** 🚀
