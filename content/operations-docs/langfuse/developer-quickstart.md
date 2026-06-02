---
title: Developer Quickstart
description: Run the latest self-hosted Langfuse locally with a single Docker Compose stack.
duration: "35m"
readingTime: "10m"
labTime: "25m"
order: 2
---

# Developer Quickstart

Use this lesson when you want the fastest path to a working self-hosted Langfuse setup on one machine.

By the end of this guide, you will have:

- the Langfuse web UI running on `http://localhost:3000`
- the worker, Postgres, ClickHouse, Redis, and MinIO containers running together
- a local stack ready for SDK tracing experiments

Use this setup when:

- you want a fast local sandbox
- you are validating SDK integration in an application
- you want a lightweight proof of concept on one machine
- you need one Compose file with inline defaults for quick testing

Do not treat this setup as production-ready. It is intentionally optimized for quick local evaluation, not for long-term operations.

---

## What You Are Running

This quickstart brings up six services:

- **Langfuse web** for the browser UI and application endpoints
- **Langfuse worker** for background jobs and async processing
- **Postgres** for transactional application data
- **ClickHouse** for analytics and event-heavy workloads
- **Redis** for caching and queue coordination
- **MinIO** for S3-compatible object storage

At a high level, the stack looks like this:

```text
Application SDKs
	   |
	   v
   Langfuse Web  <---->  Langfuse Worker
	   |                     |
	   |                     +--> Redis
	   |                     +--> ClickHouse
	   |
	   +--> Postgres
	   +--> MinIO
```

Two details matter for understanding the setup:

- `CLICKHOUSE_CLUSTER_ENABLED: false` keeps ClickHouse in standalone mode for one machine
- Postgres stores transactional data while ClickHouse stores analytics-oriented data

---

## Project Files

```project
name: langfuse-developer-quickstart
docker-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/langfuse/developer-quickstart/docker-compose.yml
```

---

## Before You Start

You only need Docker Compose and a machine with enough memory to run six containers comfortably.

The Compose file exposes these local entry points:

- Langfuse UI at `http://localhost:3000`
- MinIO S3 API at `http://localhost:9090`
- MinIO Console at `http://localhost:9091`
- Postgres at `127.0.0.1:5432`
- Redis at `127.0.0.1:6379`
- ClickHouse HTTP at `127.0.0.1:8123`

Before you launch the stack:

- make sure ports `3000`, `5432`, `6379`, `8123`, `9090`, and `9091` are free on your machine
- expect the images to use `latest` tags
- expect inline local credentials inside the Compose file

---

## Deploy

1. Use **Download All** in the Project Files section above to save `docker-compose.yml` into a new folder, for example `langfuse-developer-quickstart/`
2. Open a terminal in that folder
3. Start the full stack

```bash
docker compose up -d
```

Then confirm that all containers came up:

```bash
docker compose ps
```

Expected services:

```bash
NAME                  STATUS
langfuse-postgres     running (healthy)
langfuse-clickhouse   running (healthy)
langfuse-redis        running (healthy)
langfuse-minio        running (healthy)
langfuse-worker       running
langfuse-web          running
```

If some services are still starting, wait a few seconds and run `docker compose ps` again. Langfuse depends on the backing services becoming healthy first.

---

## Verify

Open `http://localhost:3000` in your browser. The Langfuse web app should load after Postgres, Redis, ClickHouse, and MinIO report healthy and the startup sequence finishes.

Use this quick verification order:

1. Check `docker compose ps`
2. Open the UI in the browser
3. If the UI is not ready, inspect the web and worker logs

If the UI is still starting, inspect the web and worker logs:

```bash
docker compose logs langfuse-web --tail 50
docker compose logs langfuse-worker --tail 50
```

You can also probe the dependencies directly:

```bash
curl http://127.0.0.1:8123/ping
redis-cli -a myredissecret ping
```

Expected response:

```bash
Ok
PONG
```

---

## Configuration Defaults

This quickstart is deliberately self-contained. The Compose file includes inline defaults so you can copy, run, and test immediately:

```yaml
NEXTAUTH_URL: http://localhost:3000
DATABASE_URL: postgresql://postgres:postgres@postgres:5432/postgres
NEXTAUTH_SECRET: developer-quickstart-secret
SALT: developer-quickstart-salt
ENCRYPTION_KEY: "0000000000000000000000000000000000000000000000000000000000000000"
REDIS_AUTH: myredissecret
MINIO_ROOT_USER: minio
MINIO_ROOT_PASSWORD: miniosecret
```

> **Warning:** Replace these defaults before using this stack anywhere beyond local experimentation.

The main trade-offs are straightforward:

- fast to start because everything is inline
- easy to demo because there is one Compose file
- not hardened because secrets, image tags, and storage choices are tuned for convenience

---

## What This Guide Does Not Solve

This page is intentionally not trying to cover:

- high availability
- external secret management
- backup and restore workflows
- production hardening

Those topics belong in a larger single-node or production course path later.

---

## Common Issues

### Port already in use

The stack binds several local ports. If one is already taken, the containers may fail to start cleanly.

```bash
lsof -i :3000
lsof -i :5432
```

If one is busy, change the published port in `docker-compose.yml` and start the stack again.

### Web UI does not open yet

Langfuse waits for Postgres, MinIO, Redis, and ClickHouse health checks before the app becomes usable.

```bash
docker compose ps
docker compose logs postgres --tail 50
docker compose logs clickhouse --tail 50
```

Wait until the dependency containers report healthy, then reload the page.

### You want a cleaner setup for team use

This quickstart is intentionally simpler than a hardened single-node deployment:

- credentials are inline
- image tags track `latest`
- there is no backup or restore workflow
- there is no external secret management

Use it for local evaluation, not as a production baseline.

---

## Next Step

- Repoint your application SDK to `http://localhost:3000` and start sending local traces into this stack
- Return to the [course overview](./overview) if you want the higher-level context for this setup