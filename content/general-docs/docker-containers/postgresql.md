---
title: PostgreSQL with Adminer
description: Run PostgreSQL database with Adminer web UI using Docker Compose
---

# PostgreSQL with Adminer

Run PostgreSQL database with a web-based management interface.

## Docker Compose

```yaml
---
version: '3'
services:
  postgresql:
    image: postgres:11.4
    container_name: postgres
    volumes:
      - ct-data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports: ['5432:5432']
    networks: ['stack']
    healthcheck:
      test: curl -s https://localhost:5432 >/dev/null; if [[ $$? == 52 ]]; then echo 0; else echo 1; fi
      interval: 30s
      timeout: 10s
      retries: 5
  adminer:
    image: adminer
    container_name: adminer
    restart: always
    ports: ['8080:8080']
    networks: ['stack']

volumes:
  ct-data:
networks:
  stack:
```

## Usage

### Start the containers

```bash
docker compose up -d
```

### Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| PostgreSQL | localhost:5432 | postgres / postgres |
| Adminer | http://localhost:8080 | System: PostgreSQL |

### Initialize with Data

Uncomment the init script line to load data on first run:

```yaml
volumes:
  - ct-data:/var/lib/postgresql/data/
  - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # Uncomment for data initialization
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| POSTGRES_USER | postgres | Database superuser |
| POSTGRES_PASSWORD | postgres | Superuser password |

## Persistent Data

Data is stored in the named volume `ct-data`. To reset:

```bash
docker compose down -v
docker volume rm postgres_ct-data
```
