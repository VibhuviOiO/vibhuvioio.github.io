---
title: Troubleshooting
description: Common issues and fixes.
order: 14
---

# Troubleshooting

## Backend will not start

Check the logs for database connection errors:

```bash
docker compose -f docker/docker-compose-ghcr.yml logs -f uptimeo-app
```

Common causes:

- PostgreSQL is not healthy yet — wait for the health check to pass.
- `SPRING_DATASOURCE_URL` does not match the Postgres container name.
- The external `uptimeo` network is missing when using split Compose files:

```bash
docker network create uptimeo
```

## Agent reports no heartbeats

1. Confirm the agent is running and has leadership:

```bash
docker logs agent-us-east-1 | grep "Acquired leadership"
```

2. Verify the agent has assigned monitors in the UI.
3. Check that `API_BASE_URL` is reachable from the agent container.
4. Confirm `API_KEY` is valid and has not expired.

## Status page is empty

- Make sure the status page includes monitors that have heartbeats.
- Check the status page container can reach PostgreSQL:

```bash
docker logs uptimeo-status
```

## Partition missing error

Create today's partition manually:

```sql
SELECT create_daily_partition();
```

## Reset Everything

```bash
docker compose -f docker/docker-compose-ghcr.yml down -v
docker compose -f docker/docker-compose-ghcr.yml up -d
```
