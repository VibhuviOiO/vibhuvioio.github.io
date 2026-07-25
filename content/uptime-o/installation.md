---
title: Installation
description: Run UptimeO with Docker — PostgreSQL and the app in one command, no build required.
order: 2
---

# Installation

UptimeO is distributed as ready-to-run Docker images — no source checkout or build toolchain needed:

- `vibhuvioio/uptimeo` — the application (backend + console + status pages)
- `vibhuvioio/uptimeo-agent` — the monitoring agent

## Deploy in Seconds

Download the all-in-one Compose file (PostgreSQL + app) and start it:

```bash
curl -O https://vibhuvioio.com/files/uptimeo/docker-compose.yml
docker compose up -d
```

Then open `http://localhost:8080` and sign in with `admin` / `admin` (change the password immediately under **Account → Password**).

The file ships with example branding (title, logo, favicon, footer). Set your own via environment variables or a `.env` file next to the Compose file — every value has a `${VARIABLE:-default}` override, e.g. `WEBSITE_TITLE`, `WEBSITE_LOGOPATH`, `WEBSITE_FAVICONPATH`, `WEBSITE_FOOTERTITLE`. Generate a real JWT secret before going live:

```bash
openssl rand -base64 64 | tr -d '\n'   # set as JWT_BASE64_SECRET
```

To add a monitoring agent later, follow the commented `agent` service at the bottom of the file: create an agent and an API key in the UI, set `UPTIMEO_AGENT_ID` and `UPTIMEO_API_KEY`, uncomment the service, and re-run `docker compose up -d`.

## Verify

```bash
curl http://localhost:8080/management/health
```

You should see `{"status":"UP"}`. The database schema is created and migrated automatically on first start.

## Stop and Reset

```bash
docker compose down        # stop, keep data
docker compose down -v     # stop and delete all data
```

## Next Steps

- [Connect your first agent](/products/uptime-o/docs/first-agent)
- [Create HTTP monitors](/products/uptime-o/docs/http-monitors)
- [Production deployment options](/products/uptime-o/docs/deployment)
