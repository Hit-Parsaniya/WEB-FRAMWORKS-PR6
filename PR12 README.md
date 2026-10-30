# Practical 12: CI/CD Pipeline with GitHub Actions

[![CI Pipeline](https://github.com/Hit-Parsaniya/WEB-FRAMWORKS-PR6/actions/workflows/ci.yml/badge.svg)](https://github.com/Hit-Parsaniya/WEB-FRAMWORKS-PR6/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/node-18%20%7C%2020%20%7C%2022-brightgreen)](https://nodejs.org/)
[![Test Suite](https://img.shields.io/badge/tests-Jest%20%26%20Supertest-blue)](https://jestjs.io/)
[![Linter](https://img.shields.io/badge/code%20quality-ESLint-purple)](https://eslint.org/)

**Course**: ADVANCED WEB DEVELOPMENT FRAMEWORKS (ITUE301)  
**CO/PO Mapping**: CO5 / PO3, PO5  
**Objective**: To automate testing and code quality verification of the full-stack Task Management application using a Continuous Integration (CI) pipeline with GitHub Actions.

---

## 📑 Table of Contents
1. [Architecture & Workflow Diagram](#-architecture--workflow-diagram)
2. [Quick Start & Local Verification](#-quick-start--local-verification)
3. [Lab Session Step-by-Step Implementation](#-lab-session-step-by-step-implementation)
4. [Demonstration: Deliberate Test Failure vs. Passing Pipeline](#-demonstration-deliberate-test-failure-vs-passing-pipeline)
5. [Key Questions & Technical Analysis](#-key-questions--technical-analysis)
6. [Supplementary Problems Implemented](#-supplementary-problems-implemented)
7. [GitHub Repository Setup & Push Guide](#-github-repository-setup--push-guide)
8. [Interactive Pipeline Report Dashboard](#-interactive-pipeline-report-dashboard)

---

## 🏗️ Architecture & Workflow Diagram

```mermaid
graph TD
    A[git push origin main / Pull Request] --> B[GitHub Actions Runner: ubuntu-latest]
    
    subgraph Job 1: lint [Code Quality & Lint Check]
        C1[actions/checkout@v4] --> C2[actions/setup-node@v4: Node 18]
        C2 --> C3[npm install dependencies]
        C3 --> C4[npm run lint: ESLint Check]
    end
    
    B --> Job 1: lint
    Job 1: lint -- "Success (Needs Lint Pass)" --> Job 2: build-and-test

    subgraph Job 2: build-and-test [Automated Build & Testing]
        D1[actions/checkout@v4] --> D2[actions/setup-node@v4: Node 18]
        D2 --> D3[npm install: Backend Dependencies]
        D3 --> D4[npm test: Jest & Supertest Suite]
        D4 --> D5[Report Status: Pass or Fail]
    end

    Job 2: build-and-test --> E{Status Check}
    E -- "Assertion Passed (Exit 0)" --> F[🟢 Green Checkmark: Pipeline Passed]
    E -- "Assertion Failed (Exit 1)" --> G[🔴 Red X: Pipeline Failed]
```

### ASCII Workflow View
```text
  Developer Push / PR
          |
          v
  GitHub Actions Event Trigger (on: [push, pull_request] -> main)
          |
          v
  Job 1: lint (ESLint Quality Validation)
  ├── 1. actions/checkout@v4
  ├── 2. actions/setup-node@v4 (Node.js 18)
  ├── 3. npm install
  └── 4. npm run lint (ESLint v10 syntax & scope analysis)
          |
          v (Only if Job 1 passes)
  Job 2: build-and-test (needs: [lint])
  ├── 1. actions/checkout@v4
  ├── 2. actions/setup-node@v4 (Node.js 18 + npm dependency cache)
  ├── 3. npm install (Installs Jest, Supertest, Express, etc.)
  ├── 4. npm test (Executes API regression test suite)
  └── 5. Report pass/fail status
          |
          +-----> [Exit 0] ➔ 🟢 Green Checkmark (Build Passing)
          +-----> [Exit 1] ➔ 🔴 Red X Mark (Build Failing)
```

---

## ⚡ Quick Start & Local Verification

Before committing to GitHub, you can verify both linting and automated tests locally:

```bash
# 1. Run automated Jest tests from the project root
npm test

# 2. Run ESLint code quality checks from the project root
npm run lint

# 3. Alternatively, navigate into backend directory
cd backend
npm test
npm run lint
```

---

## 🧪 Lab Session Step-by-Step Implementation

### Step 1: Install Testing Library in Backend Project
Testing dependencies (`jest` and `supertest`) along with `eslint` were installed:
```bash
cd backend
npm install --save-dev jest supertest eslint
```
Configured in `backend/package.json`:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest --detectOpenHandles --forceExit",
  "lint": "eslint .",
  "test:events": "node test-events.js"
}
```

### Step 2: Write Automated API Test Suite
A comprehensive test suite was created in `backend/tests/api.test.js` using Jest and Supertest. It isolates external MongoDB instances using Jest mocks, guaranteeing fast, hermetic, 100% reproducible execution in CI runners:

```javascript
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const _Task = require('../models/Task');

// Mock Task model for deterministic, lightning-fast test execution in CI
jest.mock('../models/Task', () => ({
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: 'task-test-1', title: 'Complete Practical 12 CI/CD', completed: false },
        { _id: 'task-test-2', title: 'Configure GitHub Actions Workflow', completed: true },
      ]),
    }),
  }),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

describe('Practical 12 - CI/CD Pipeline API Test Suite', () => {
  let validToken;

  beforeAll(() => {
    const secret = process.env.JWT_SECRET || 'pr11_super_secret_jwt_key_2026_antigravity';
    validToken = jwt.sign(
      { id: 'ci-user-123', email: 'student-ci@example.com' },
      secret,
      { expiresIn: '1h' }
    );
  });

  // Test 1 (Lab Core Step 2): GET /tasks returns 200
  test('GET /tasks returns 200 with task list', async () => {
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('title');
  });

  // Test 2 (Student Assignment): Second endpoint (GET /)
  test('GET / returns 200 with backend metadata', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('message');
  });

  // Test 3: Unauthenticated request security validation
  test('GET /tasks returns 401 when Authorization token is missing', async () => {
    const res = await request(app).get('/tasks');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });

  // Test 4: Health check endpoint
  test('GET /health returns health metrics structure', async () => {
    const res = await request(app).get('/health');

    expect([200, 503]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('timestamp');
  });

  // Test 5: Validation error response
  test('POST /auth/register returns 400 when payload is invalid', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'invalid-email', password: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});
```

### Step 3: Create GitHub Actions Workflow File (`.github/workflows/ci.yml`)
The workflow file is positioned at `.github/workflows/ci.yml` and structured as follows:

```yaml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    name: Code Quality & Lint Check
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js runtime (v18)
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm install

      - name: Run ESLint
        run: npm run lint

  build-and-test:
    name: Build & Run Automated Tests
    runs-on: ubuntu-latest
    needs: [lint]
    defaults:
      run:
        working-directory: backend

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js runtime (v18)
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install backend dependencies (npm install)
        run: npm install

      - name: Execute automated API test suite (npm test)
        run: npm test

      - name: Report CI Pipeline Status
        if: always()
        run: |
          echo "=========================================="
          echo " CI Pipeline Execution Completed"
          echo " Job Status: ${{ job.status }}"
          echo "=========================================="
```

---

## 💥 Demonstration: Deliberate Test Failure vs. Passing Pipeline

### Step 5: Deliberate Test Failure (Red X ❌)
To demonstrate pipeline failure detection, we deliberately change the expected status code in `backend/tests/api.test.js`:

```javascript
// DELIBERATE FAILURE: Change expected status 200 to 500
expect(res.statusCode).toBe(500);
```

#### GitHub Actions Runner Console Log (Failed Run):
```text
> pr12-backend@1.0.0 test
> jest --detectOpenHandles --forceExit

FAIL tests/api.test.js
  Practical 12 - CI/CD Pipeline API Test Suite
    × GET /tasks returns 200 with task list (90 ms)
    √ GET / returns 200 with backend metadata (11 ms)
    √ GET /tasks returns 401 when Authorization token is missing (11 ms)
    √ GET /health returns health metrics structure (10 ms)
    √ POST /auth/register returns 400 when payload is invalid (20 ms)

  ● Practical 12 - CI/CD Pipeline API Test Suite › GET /tasks returns 200 with task list

    expect(received).toBe(expected) // Object.is equality

    Expected: 500
    Received: 200

      48 |     // DELIBERATE TEST FAILURE FOR PRACTICAL 12 STEP 5 DEMONSTRATION:
      49 |     // Changing expected status code from 200 to 500 causes Jest assertion failure
    > 50 |     expect(res.statusCode).toBe(500);
         |                            ^
      51 |     expect(Array.isArray(res.body)).toBe(true);

      at Object.toBe (tests/api.test.js:50:28)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 4 passed, 5 total
Snapshots:   0 total
Time:        1.025 s
Error: Process completed with exit code 1.
##[error]Process completed with exit code 1.
```
> **Status on GitHub**: ❌ **Job failed: Build & Run Automated Tests** (Red X displayed next to the commit).

---

### Step 6: Fixed Test (Green Checkmark ✔️)
The expected status code is corrected back to `200`:
```javascript
expect(res.statusCode).toBe(200);
```

#### GitHub Actions Runner Console Log (Passed Run):
```text
> pr12-backend@1.0.0 test
> jest --detectOpenHandles --forceExit

PASS tests/api.test.js
  Practical 12 - CI/CD Pipeline API Test Suite
    √ GET /tasks returns 200 with task list (98 ms)
    √ GET / returns 200 with backend metadata (10 ms)
    √ GET /tasks returns 401 when Authorization token is missing (10 ms)
    √ GET /health returns health metrics structure (7 ms)
    √ POST /auth/register returns 400 when payload is invalid (16 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        1.004 s, estimated 2 s
Ran all test suites.

==========================================
 CI Pipeline Execution Completed
 Job Status: success
==========================================
```
> **Status on GitHub**: 🟢 **All checks have passed** (Green checkmark displayed next to the commit).

---

## 🔍 Key Questions & Technical Analysis

### Q1: What is the difference between Continuous Integration and Continuous Deployment, and which one does this practical actually demonstrate?
**Answer**:
- **Continuous Integration (CI)**:
  - CI is the software engineering practice where developers frequently commit and merge their code changes into a shared central repository (such as `main`).
  - Upon every push or pull request, an automated pipeline triggers to build the code, check code formatting/style (linting), and run automated unit and integration tests.
  - The objective of CI is **defect detection and regression prevention early in the lifecycle**.
- **Continuous Deployment (CD)**:
  - CD is the automated extension of CI where any change that passes the CI test suite is automatically deployed straight into the production environment (e.g., AWS, Kubernetes cluster, Docker registry, Vercel) without any human approval or manual intervention.
  - (Note: *Continuous Delivery* produces deployable artifacts that can be deployed to production with a 1-click manual trigger).
- **Which one this practical demonstrates**:
  - This practical exclusively demonstrates **Continuous Integration (CI)**.
  - It automates dependency provisioning (`npm install`), code quality validation (ESLint), and automated API testing (`npm test`), reporting a pass/fail status on GitHub. It does *not* automatically push container images to a registry or deploy the application to a cloud host.

---

### Q2: Why does running tests automatically on every push catch problems earlier than testing manually before a release?
**Answer**:
1. **Immediate Feedback Loop ("Shift-Left" Testing)**:
   - When a test fails in CI, the developer receives an alert within minutes of pushing. Because the developer just wrote that exact code, context is fresh in their memory, making diagnosis fast and low-effort.
   - In contrast, manual testing before a release happens weeks or months after code was written.
2. **Granular Fault Localization**:
   - Automated CI tests evaluate small, incremental commits (usually 1–5 modified files). If a regression occurs, the exact offending commit is instantly identified (`git bisect` or commit history).
   - In a release-time manual test, hundreds of unrelated commits are batched together. Pinpointing which specific commit introduced a subtle defect requires tedious reverse-engineering.
3. **Eliminates Human Error & Fatigue**:
   - Manual testers cannot realistically execute every edge-case test across authentication, database constraints, and API status codes for every minor patch.
   - Automated CI runs the exact same exhaustive test suite deterministically every single time.
4. **Prevents Broken Code Merges via Branch Protection**:
   - CI can be required as a status check on GitHub pull requests. If tests fail, GitHub blocks merging into `main`, keeping the production branch always releasable.

---

### Q3: What would happen to the pipeline if the test file path were incorrect — would the workflow fail at the same step as a genuine test failure?
**Answer**:
- **Does it fail at the same step?**: **YES**.
  - Both errors cause the test runner (Jest) to terminate with a non-zero exit code (`exit code 1`).
  - Because GitHub Actions terminates a step whenever a command exits with a non-zero code, both will mark the **`Run npm test`** step with a red cross (❌).
- **Is the failure nature the same?**: **NO, fundamentally different**:
  - **Case 1: Genuine Test Failure**:
    - The runner successfully finds the test files and executes the test suites.
    - An assertion check fails (e.g., received `200` but expected `500`).
    - The log outputs an **AssertionError** with expected vs received values and points directly to the line of business code or test logic that failed.
  - **Case 2: Incorrect Test Path Failure**:
    - The runner fails during the **test suite discovery phase** before running any test assertions.
    - Jest outputs:
      ```text
      No tests found matching "backend/nonexistent/path.test.js"
      Pattern: backend/nonexistent/path.test.js - 0 matches
      ```
    - Or Node throws `Error: Cannot find module` or `ENOENT: no such file or directory`.
- **Diagnostic Importance**: In CI/CD logs, developers must examine the console output to determine whether they broke application functionality (Case 1) or made a filesystem/configuration typo in their build scripts (Case 2).

---

## 🛠️ Supplementary Problems Implemented

### 1. ESLint Code Quality Job (`lint`)
Implemented as a separate, prior job in `.github/workflows/ci.yml`:
- Runs static code analysis before the test job.
- The `build-and-test` job defines `needs: [lint]`, guaranteeing that tests only run if the code passes clean linting rules.

### 2. Pull Request Triggers (`pull_request`)
Configured in `.github/workflows/ci.yml` under `on:`:
```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```
Ensures that any contributor opening a Pull Request against `main` has their code tested automatically before branch merging.

### 3. Pipeline Status Badge
Added at the very top of this README. Replace `USERNAME/REPOSITORY` with your GitHub details:
```markdown
[![CI Pipeline](https://github.com/Hit-Parsaniya/WEB-FRAMWORKS-PR6/actions/workflows/ci.yml/badge.svg)](https://github.com/Hit-Parsaniya/WEB-FRAMWORKS-PR6/actions/workflows/ci.yml)
```

---

## 🚀 GitHub Repository Setup & Push Guide

To link your local project to your GitHub account and see the Actions tab run live:

```bash
# 1. Check git status
git status

# 2. Stage all files (workflow, tests, backend, frontend, documentation)
git add .

# 3. Create initial CI commit
git commit -m "ci: setup GitHub Actions CI pipeline with Jest testing and ESLint"

# 4. Set default branch to main
git branch -M main

# 5. Link your GitHub remote repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git

# 6. Push code to GitHub
git push -u origin main
```

Once pushed, open your repository on GitHub and click the **Actions** tab to see your pipeline running automatically!

---

## 🖥️ Interactive Pipeline Report Dashboard

An interactive dashboard has been generated in [`docs/github_actions_report.html`](./docs/github_actions_report.html). You can double-click and open it in any web browser to view:
- Interactive toggle between **Run #1 (Deliberate Failure)** and **Run #2 (Fixed Pipeline)**.
- Visual execution DAG graphs with step durations.
- ANSI-formatted console logs.
- Lab viva and technical summary cards.
