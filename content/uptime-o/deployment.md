---
title: Deployment
description: Build production artifacts, Docker images, and run UptimeO with containers.
order: 11
---

# Deployment

This guide covers production packaging for UptimeO: building a jar, building a Docker image, running the container against Postgres, and running the API agent container.

## Build a Production Jar

From the `uptime-o/` directory:

```bash
cd uptime-o
./mvnw -Pprod clean verify
```

This concatenates and minifies the frontend assets, compiles the backend, and produces a single executable jar:

```bash
ls target/*.jar
```

Run the jar:

```bash
java -jar target/uptime-o-*.jar
```

Then open `http://localhost:8080`.

## Build a Docker Image

You can build a production Docker image with npm:

```bash
cd uptime-o
npm run java:docker:prod
```

Or directly with Maven:

```bash
./mvnw verify -DskipTests -Pprod jib:dockerBuild
```

Both commands produce a local image tagged `uptimeo:latest`.

For ARM64 machines such as Apple Silicon:

```bash
npm run java:docker:arm64
```

## Run the Container with Postgres

Make sure the `uptimeo` network and Postgres are running:

```bash
cd docker
docker network create uptimeo || true
docker compose -f postgres.yml up -d
```

Then start the UptimeO container:

```bash
cd docker
docker compose -f app.yml up -d
```

The app is available at `http://localhost:8080`.

### Environment Variables for Containers

The `docker/app.yml` file already sets common values. Override them as needed:

```yaml
environment:
  SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/uptimeo
  SPRING_DATASOURCE_USERNAME: uptimeo
  SPRING_DATASOURCE_PASSWORD: uptimeo
  SPRING_LIQUIBASE_ENABLED: true
  SPRING_PROFILES_ACTIVE: prod,api-docs
  SPRING_DATASOURCE_HIKARI_AUTO_COMMIT: "false"
  WEBSITE_TITLE: "UptimeO"
  WEBSITE_FOOTERTITLE: "Powered by UptimeO"
  JAVA_OPTS: "-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

> **Important:** Set `SPRING_DATASOURCE_HIKARI_AUTO_COMMIT=false`. With HikariCP's default `autoCommit=true`, Spring's transaction manager cannot commit/rollback read-only transactions, causing `/api/authenticate` to return HTTP 500.

Pass extra variables on the command line:

```bash
docker run -d \
  --name uptimeo-app \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://host.docker.internal:5432/uptimeo" \
  -e SPRING_DATASOURCE_USERNAME=uptimeo \
  -e SPRING_DATASOURCE_PASSWORD=uptimeo \
  -e SPRING_LIQUIBASE_ENABLED=true \
  -e SPRING_DATASOURCE_HIKARI_AUTO_COMMIT=false \
  --network uptimeo \
  uptimeo:latest
```

## Run the API Agent Container

After creating an agent and API key in the UI (see [Agent Installation](/products/uptime-o/docs/agent-installation)), run the agent container. Use the local image built earlier, or pull the published image:

```bash
# Local image
docker run -d \
  --name agent-us-east-1 \
  --network host \
  -e AGENT_ID="1" \
  -e API_BASE_URL="http://host.docker.internal:8080" \
  -e API_KEY="uptimeo_YOUR_API_KEY" \
  -e QUEUE_PATH="/data/queue" \
  -e CONFIG_RELOAD_INTERVAL="1m" \
  -v "$(pwd)/tmp/data/agent-us-east-1:/data" \
  --restart unless-stopped \
  uptimeo-api-agent:latest

# Or use the published image
# ghcr.io/vibhuvioio/uptimeo-agent:latest
```

On Linux you may need to use the container IP or bridge network instead of `host.docker.internal`.

## Full Stack with Docker Compose

For a managed stack that includes Postgres, backend, status page, and one agent, use:

```bash
cd UptimeO
cat > .env <<EOF
SPRING_PROFILES_ACTIVE=prod
SPRING_LIQUIBASE_ENABLED=true
EOF
docker compose -f docker/docker-compose-ghcr.yml up -d
```

Services:

| Service | URL |
|---|---|
| UptimeO app | `http://localhost:8080` |
| Status page | `http://localhost:8077` |
| PostgreSQL | `localhost:5432` |

## Backups

Back up PostgreSQL regularly:

```bash
docker exec postgres pg_dump -U uptimeo -d uptimeo > uptimeo-backup.sql
```

Restore from backup:

```bash
docker exec -i postgres psql -U uptimeo -d uptimeo < uptimeo-backup.sql
```

## Next Steps

- [Agent installation](/products/uptime-o/docs/agent-installation)
- [Status pages](/products/uptime-o/docs/status-pages)
- [Prometheus integration](/products/uptime-o/docs/prometheus-integration)
