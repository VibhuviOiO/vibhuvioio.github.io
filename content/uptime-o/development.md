---
title: Development
description: Development workflow, useful scripts, and how to run backend or frontend independently.
order: 16
---

# Development

UptimeO is a JHipster-generated application. The backend lives in `uptime-o/src/main/java`, the React frontend in `uptime-o/src/main/webapp`, and the Go agent in `uptime-o-api-agent/`.

## Typical Dev Workflow

Run these two commands in separate terminals for the standard local experience:

```bash
# Terminal 1 — backend
cd uptime-o
./mvnw -P-webapp

# Terminal 2 — frontend
cd uptime-o
npm start
```

Then open `http://localhost:9000`. The frontend proxies API calls to `http://localhost:8080` and reloads automatically when you edit TypeScript, Sass, or Java files.

## Running Backend Only

To start only the Spring Boot application without building the frontend:

```bash
cd uptime-o
./mvnw -P-webapp
```

Useful backend-only variants:

```bash
# Debug backend on port 8000
npm run backend:debug

# Run backend unit tests
npm run backend:unit:test

# Generate API code from openapi/api.yml
./mvnw generate-sources
```

## Running Frontend Only

To start only the webpack dev server (it still expects the backend on port `8080`):

```bash
cd uptime-o
npm start
```

Other frontend scripts:

```bash
# Run unit tests in watch mode
npm test

# Run unit tests once (CI style)
npm run test-ci

# Build production bundle
npm run webapp:prod

# Build development bundle
npm run webapp:build:dev
```

## Hot Module Replacement (HMR)

`npm start` enables HMR via `WEBPACK_DEV_SERVER_HOT=true`. Most React component and Sass changes reload in the browser without a full page refresh.

If HMR stops working:

1. Stop `npm start` and restart it.
2. Clear the webpack cache: `npm run cleanup && npm start`.
3. Delete `node_modules/.cache` if it exists.

## Useful npm Scripts

| Script | What it does |
|---|---|
| `npm start` | Start the webpack dev server on port `9000` |
| `npm run backend:start` | Start the backend via Maven |
| `npm run watch` | Run frontend and backend together with `concurrently` |
| `npm test` | Run Jest unit tests in watch mode |
| `npm run test:watch` | Same as `npm test` |
| `npm run e2e:serve` | Serve the app on alternate ports for E2E testing |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint and auto-fix issues |
| `npm run java:docker:dev` | Build a development Docker image |
| `npm run java:docker:prod` | Build a production Docker image |
| `npm run java:jar:prod` | Build a production jar |

## Branding Environment Variables

You can re-brand the application at runtime by setting environment variables before starting the backend. These values drive the browser tab title, SEO meta tags, header/sidebar logo, and footer text.

| Variable | Default | Used for |
|---|---|---|
| `WEBSITE_TITLE` | `UptimeO` | Page title, header/sidebar brand text |
| `WEBSITE_DESCRIPTION` | `Uptime Monitoring and Observability Platform` | `<meta name="description">` |
| `WEBSITE_KEYWORDS` | `uptime,monitoring,observability,http,heartbeat` | `<meta name="keywords">` |
| `WEBSITE_AUTHOR` | `UptimeO Team` | `<meta name="author">` |
| `WEBSITE_FAVICONPATH` | `/favicon.ico` | Browser favicon |
| `WEBSITE_LOGOPATH` | `/content/images/logo.png` | Header/sidebar logo |
| `WEBSITE_LOGOWIDTH` | `50` | Logo width in pixels |
| `WEBSITE_LOGOHEIGHT` | `30` | Logo height in pixels |
| `WEBSITE_FOOTERTITLE` | `Powered by UptimeO` | Footer title |

Place custom logo/favicon files under `src/main/webapp/content/images/` and reference them with `WEBSITE_LOGOPATH`/`WEBSITE_FAVICONPATH`.

```bash
export WEBSITE_TITLE="AcmeOps"
export WEBSITE_DESCRIPTION="Acme operational observability"
export WEBSITE_LOGOPATH="/content/images/logo.png"
export WEBSITE_FOOTERTITLE="Powered by AcmeOps"
./mvnw -P-webapp
```

For Docker deployments, pass the same variables to the container.

## Next Steps

- [Testing guide](/products/uptime-o/docs/testing)
- [Deployment guide](/products/uptime-o/docs/deployment)
- [Agent installation](/products/uptime-o/docs/agent-installation)
