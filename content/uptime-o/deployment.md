---
title: Deployment
description: Run UptimeO in production with the published Docker images.
order: 11
---

# Deployment

UptimeO is deployed from published Docker images — no build step required:

| Image | Purpose |
|---|---|
| `vibhuvioio/uptimeo` | Application (backend, console, status pages) |
| `vibhuvioio/uptimeo-agent` | Monitoring agent |

Both are also mirrored on GitHub Container Registry (`ghcr.io/vibhuvioio/uptimeo`, `ghcr.io/vibhuvioio/uptimeo-agent`).

## All-in-One Compose (recommended)

The quickest production setup is the all-in-one Compose file — PostgreSQL and the app on an internal network:

```bash
curl -O https://vibhuvioio.com/files/uptimeo/docker-compose.yml
docker compose up -d
```

The app is available at `http://localhost:8080`. See [Installation](/products/uptime-o/docs/installation) for branding overrides and adding an agent service.

## Run Against an Existing PostgreSQL

If you already run PostgreSQL, start just the app container:

```bash
docker run -d \
  --name uptimeo-app \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://your-db-host:5432/uptimeo" \
  -e SPRING_DATASOURCE_USERNAME=uptimeo \
  -e SPRING_DATASOURCE_PASSWORD=uptimeo \
  -e SPRING_LIQUIBASE_ENABLED=true \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_HIKARI_AUTO_COMMIT=false \
  -e JWT_BASE64_SECRET="your-64-byte-base64-secret" \
  vibhuvioio/uptimeo:latest
```

> **Important:** Keep `SPRING_DATASOURCE_HIKARI_AUTO_COMMIT=false`. With HikariCP's default `autoCommit=true`, Spring's transaction manager cannot commit/rollback read-only transactions, causing `/api/authenticate` to return HTTP 500.

Liquibase runs migrations automatically on startup, so upgrades only require pulling a newer image and restarting the container.

### Useful Environment Variables

| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | JDBC URL of your PostgreSQL database |
| `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` | Database credentials |
| `JWT_BASE64_SECRET` | 64-byte base64 secret for signing tokens (`openssl rand -base64 64`) |
| `WEBSITE_TITLE` | Browser tab and header title |
| `WEBSITE_LOGOPATH` | Logo URL (navbar and status pages) |
| `WEBSITE_FAVICONPATH` | Favicon URL |
| `WEBSITE_FOOTERTITLE` | Footer text |
| `JAVA_OPTS` | e.g. `-Xms512m -Xmx1024m -XX:+UseG1GC` |

## Run an Agent Container

After creating an agent and an API key in the UI (see [Agent Installation](/products/uptime-o/docs/agent-installation)):

```bash
docker run -d \
  --name agent-us-east-1 \
  -e AGENT_ID="1" \
  -e API_BASE_URL="http://your-uptimeo-host:8080" \
  -e API_KEY="uptimeo_YOUR_API_KEY" \
  -e QUEUE_PATH="/data/queue" \
  -e CONFIG_RELOAD_INTERVAL="1m" \
  -v "$(pwd)/data/agent-us-east-1:/data" \
  --restart unless-stopped \
  vibhuvioio/uptimeo-agent:latest
```

If the app runs on the same Docker host, use `http://host.docker.internal:8080` as `API_BASE_URL` (on Linux, use the host's bridge IP instead).

## Backups

Back up PostgreSQL regularly:

```bash
docker exec uptimeo-postgres pg_dump -U uptimeo -d uptimeo > uptimeo-backup.sql
```

Restore from backup:

```bash
docker exec -i uptimeo-postgres psql -U uptimeo -d uptimeo < uptimeo-backup.sql
```

## Next Steps

- [Agent installation](/products/uptime-o/docs/agent-installation)
- [Status pages](/products/uptime-o/docs/status-pages)
