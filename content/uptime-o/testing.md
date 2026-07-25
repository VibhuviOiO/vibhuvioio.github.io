---
title: Testing
description: How to run backend, frontend, and end-to-end tests for UptimeO.
order: 17
---

# Testing

UptimeO has three test layers: Spring Boot integration/unit tests, React/Jest frontend unit tests, and Playwright end-to-end tests.

## Backend Tests

Run the full Maven test suite from the `uptime-o/` directory:

```bash
cd uptime-o
./mvnw verify
```

This compiles the application, runs unit and integration tests, and produces a coverage report.

For a quieter CI-style run:

```bash
npm run backend:unit:test
```

To run only the Java tests without the frontend build:

```bash
./mvnw -P-webapp test
```

## Frontend Unit Tests

Frontend tests use Jest and are located near the components they test.

Run them in interactive watch mode:

```bash
cd uptime-o
npm test
```

Run them once and update snapshots:

```bash
npm run test-ci
```

Run with coverage:

```bash
npm run jest
```

## End-to-End Tests

E2E tests live in the `e2e/` directory at the repository root and use Playwright.

### 1. Start the E2E dev server

From `uptime-o/`:

```bash
cd uptime-o
npm run e2e:serve
```

This starts the frontend and backend on alternate ports so the default dev server is not blocked.

### 2. Run the E2E tests

From the `e2e/` directory in a second terminal:

```bash
cd e2e
npx playwright test
```

Run tests in headed mode for debugging:

```bash
npx playwright test --headed
```

Run a specific test file:

```bash
npx playwright test tests/login.spec.ts
```

### E2E troubleshooting

- Make sure `npm run e2e:serve` is running and reachable on `http://localhost:9001`.
- Install Playwright browsers if needed: `npx playwright install`.
- Check `e2e/test-results/` for traces and screenshots after failures.

## Code Quality

Run ESLint from the `uptime-o/` directory:

```bash
npm run lint
npm run lint:fix
```

For SonarQube analysis, start the local Sonar server:

```bash
docker compose -f src/main/docker/sonar.yml up -d
```

Then run:

```bash
./mvnw -Pprod clean verify sonar:sonar -Dsonar.login=admin -Dsonar.password=admin
```

## Next Steps

- [Deployment guide](/products/uptime-o/docs/deployment)
- [Agent installation](/products/uptime-o/docs/agent-installation)
