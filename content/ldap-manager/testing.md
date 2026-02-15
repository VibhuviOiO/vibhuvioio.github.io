---
title: Testing Guide
description: "Complete testing guide for LDAP Manager: E2E testing with Playwright, test coverage, and running tests."
---

# Testing Guide


Comprehensive guide to testing LDAP Manager with backend unit tests and frontend E2E tests.


## Test Coverage Overview


LDAP Manager has **199 total tests** with comprehensive coverage across backend and frontend.


### Test Statistics

- **Backend Tests:** 104 tests (97% pass rate, >80% code coverage target)
- **Frontend E2E Tests:** 95 tests (100% pass rate)
- **Total:** 199 tests
- **Browsers:** Chrome, Firefox, Safari (E2E)
- **Coverage:** Security, LDAP operations, API endpoints, UI workflows


## Backend Testing


### Running Backend Tests


```
cd backend

# Install test dependencies
pip install -r requirements-test.txt

# Run all tests with coverage
pytest --cov=app --cov-report=html --cov-report=term-missing

# Run specific test file
pytest tests/test_password_cache.py -v

# Run with verbose output
pytest -v

# View HTML coverage report
open htmlcov/index.html
```


### Backend Test Suite (104 tests)


#### Password Cache Tests (24 tests)

- Fernet encryption key generation and storage
- Password encryption and decryption
- TTL expiration and automatic cleanup
- Cache file permissions (0600)
- Multi-cluster password isolation


#### Node Selector Tests (19 tests)

- READ operations use last→second→first node order
- WRITE operations always use first node
- Automatic failover on node failure
- Socket connectivity checks
- Single-node cluster handling


#### LDAP Client Tests (20 tests)

- Connection and authentication
- Search operations with pagination
- Add, modify, delete operations
- Group membership management
- Error handling and timeouts


#### API Endpoints Tests (25 tests)

- LDAP injection protection
- Authentication and authorization
- Entry CRUD operations
- Group membership endpoints
- Read-only cluster enforcement


#### Connection Pool Tests (15 tests)

- Connection reuse and TTL
- Stale connection cleanup
- Thread safety
- Pool statistics


#### Configuration Validation Tests (25+ tests)

- Pydantic schema validation
- Port range validation
- Host/nodes XOR constraint
- Duplicate cluster name detection


### Security Testing


Dedicated tests for security features:

- ✅ Password never stored in plaintext
- ✅ LDAP injection attempts blocked
- ✅ Invalid credentials handled properly
- ✅ TTL expiration enforced
- ✅ File permissions verified


## Frontend E2E Testing


### Running E2E Tests


```
cd frontend

# Install dependencies
npm install

# Run E2E tests (all browsers)
npx playwright test

# Run in headed mode (watch tests run)
npx playwright test --headed

# Run specific test file
npx playwright test tests/e2e/dashboard.spec.ts

# Run in specific browser
npx playwright test --project=chromium
```


### Frontend Test Categories (95 tests)


### Dashboard Tests (5 tests)

- Cluster listing display
- Navigation to cluster details
- Health status indicators
- Cluster information display


### Cluster Details Tests (8 tests)

- View switching (Users, Groups, OUs, All)
- Search functionality
- Pagination controls
- Entry display


### User Creation Tests (7 tests)

- Form validation
- Custom fields display
- Dropdown options
- Auto-fill fields
- Required field validation


### Column Settings Tests (4 tests)

- Show/hide columns
- localStorage persistence
- Default visibility
- Settings dialog


### User Lifecycle Tests (3 tests)

- Create user
- Verify user exists
- Delete user


### User Edit Tests (11 tests)

- Field updates
- Validation
- Disabled fields (uid, uidNumber)
- Save changes


### Password Change Tests (11 tests)

- Policy validation
- Confirmation matching
- shadowLastChange update
- Error handling


### Complete Lifecycle Tests (5 tests)

- Create → Edit → Password Change → Delete
- Full user workflow


## Setup


### Prerequisites

- Node.js 20+
- LDAP Manager running locally
- Test LDAP server configured


### Install Playwright


```
cd frontend
npm install
npx playwright install
```


This installs Playwright and downloads browser binaries (Chrome, Firefox, Safari).


## Running Tests


### Run All Tests


```
npx playwright test
```


### Run Specific Browser


```
# Chrome only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Safari only
npx playwright test --project=webkit
```


### Run Specific Test File


```
npx playwright test user-lifecycle.spec.ts
```


### Run with UI (Interactive Mode)


```
npx playwright test --ui
```


Opens Playwright UI for interactive test running and debugging.


### Run in Headed Mode (See Browser)


```
npx playwright test --headed
```


### View HTML Report


```
npx playwright show-report
```


## Test Organization


```
frontend/tests/e2e/
├── dashboard.spec.ts                # Dashboard tests (5)
├── cluster-details.spec.ts          # Cluster view tests (8)
├── user-creation.spec.ts            # Form UI tests (7)
├── user-creation-simple.spec.ts     # Form validation (3)
├── column-settings.spec.ts          # Column preferences (4)
├── user-lifecycle.spec.ts           # Full E2E lifecycle (3)
├── user-edit.spec.ts                # Edit functionality (11)
├── password-change.spec.ts          # Password change (11)
└── user-lifecycle-complete.spec.ts  # Complete workflow (5)
```


## Writing Tests


### Example Test


```
import { test, expect } from '@playwright/test';

test('should display cluster list', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Check if clusters are displayed
  await expect(page.locator('.cluster-card')).toBeVisible();
  
  // Verify cluster name
  await expect(page.locator('text=Production LDAP')).toBeVisible();
});
```


### Test Structure


```
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('http://localhost:5173');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
  });
});
```


## Test Configuration


### playwright.config.ts


```
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```


## Debugging Tests


### Debug Mode


```
npx playwright test --debug
```


Opens Playwright Inspector for step-by-step debugging.


### Pause Test


```
test('debug test', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.pause(); // Pauses execution
  // Continue debugging in browser
});
```


### Screenshots on Failure


```
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```


## CI/CD Integration


### GitHub Actions Example


```
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Install Playwright
        run: cd frontend && npx playwright install --with-deps
      - name: Run tests
        run: cd frontend && npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
```


## Best Practices


### Test Writing

- Use descriptive test names
- Keep tests independent
- Clean up test data
- Use page object pattern for complex pages
- Avoid hard-coded waits


### Selectors

- Prefer data-testid attributes
- Use role-based selectors
- Avoid CSS selectors that may change
- Use text content for stable elements


### Example: Good Selectors


```
// Good - data-testid
await page.locator('[data-testid="create-user-button"]').click();

// Good - role
await page.getByRole('button', { name: 'Create User' }).click();

// Good - text
await page.locator('text=Create User').click();

// Bad - CSS class (may change)
await page.locator('.btn-primary').click();
```


## Test Data Management


### Test User Creation


```
const testUser = {
  uid: `testuser_${Date.now()}`,
  cn: 'Test User',
  mail: 'test@example.com',
  password: 'Test123!@#'
};

// Create user
await createUser(page, testUser);

// Verify user
await expect(page.locator(`text=${testUser.uid}`)).toBeVisible();

// Cleanup
await deleteUser(page, testUser.uid);
```


## Performance Testing


### Measure Page Load


```
test('page load performance', async ({ page }) => {
  const start = Date.now();
  await page.goto('http://localhost:5173');
  const loadTime = Date.now() - start;
  
  expect(loadTime).toBeLessThan(3000); // 3 seconds
});
```


## Accessibility Testing


### Install axe-playwright


```
npm install --save-dev @axe-core/playwright
```


### Run Accessibility Tests


```
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await injectAxe(page);
  await checkA11y(page);
});
```


## Troubleshooting


### Tests Failing Locally

- Ensure LDAP Manager is running
- Check LDAP server is accessible
- Verify config.yml is correct
- Clear browser cache
- Update Playwright browsers


### Flaky Tests

- Add proper waits for elements
- Use `waitForLoadState`
- Increase timeout for slow operations
- Check for race conditions


### Update Browsers


```
npx playwright install
```


## Resources

- Playwright Documentation
- Playwright Best Practices
- Debugging Guide
- CI/CD Integration


## Next Steps

- Learn about development setup
- Explore all features
- Contribute on GitHub