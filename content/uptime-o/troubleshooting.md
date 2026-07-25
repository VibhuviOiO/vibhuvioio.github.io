---
title: Troubleshooting
description: Common issues and fixes.
order: 14
---

# Troubleshooting

## Backend will not start

Check the app logs for database connection errors:

```bash
docker logs -f uptimeo-app
```

Common causes:

- PostgreSQL is not healthy yet — wait for the health check to pass.
- `SPRING_DATASOURCE_URL` does not match your PostgreSQL host or container name.
- `JWT_BASE64_SECRET` is missing or shorter than 64 bytes — generate one with `openssl rand -base64 64`.

## Login returns HTTP 500

Make sure `SPRING_DATASOURCE_HIKARI_AUTO_COMMIT=false` is set on the app container. With HikariCP's default `autoCommit=true`, `/api/authenticate` fails.

## Agent reports no heartbeats

1. Confirm the agent is running and has leadership:

```bash
docker logs agent-us-east-1 | grep "Acquired leadership"
```

2. Verify the agent has assigned monitors in the UI.
3. Check that `API_BASE_URL` is reachable from the agent container — use `http://host.docker.internal:8080`, not `http://localhost:8080`, when the app runs on the same Docker host.
4. Confirm `API_KEY` is valid and has not expired.

## Status page is empty

- Make sure the status page includes monitors that have heartbeats.
- Confirm the page is enabled: **Status Pages → your page → Enable Public Status Page**, then open `http://localhost:8080/status/<slug>`.

## Partition missing error

Create today's partition manually:

```sql
SELECT create_daily_partition();
```

## Reset Everything

From the directory with the Compose file:

```bash
docker compose down -v
docker compose up -d
```
