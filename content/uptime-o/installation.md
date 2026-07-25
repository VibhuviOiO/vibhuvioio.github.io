---
title: Installation
description: Step-by-step local installation of UptimeO from source.
order: 2
---

# Installation

This guide walks through running UptimeO from source on your local machine. You will start PostgreSQL with Docker Compose, run the Spring Boot backend, run the React frontend, and log in to the console.

## 1. Clone the Repository

```bash
git clone https://github.com/VibhuviOiO/UptimeO.git
cd UptimeO
```

The two main code directories are:

- `uptime-o/` — Spring Boot backend + React frontend
- `uptime-o-api-agent/` — Go monitoring agent

## 2. Start PostgreSQL

Create the Docker network that the Compose files expect, then start Postgres:

```bash
docker network create uptimeo
cd docker
docker compose -f postgres.yml up -d
```

Postgres is exposed on `localhost:5432` with:

- **Database:** `uptimeo`
- **User:** `uptimeo`
- **Password:** `uptimeo`

To wipe data and start fresh:

```bash
docker compose -f postgres.yml down -v
rm -rf tmp/pgdata
docker compose -f postgres.yml up -d
```

## 3. Run the Backend

Open a terminal in the `uptime-o/` directory and start the backend without the webapp profile:

```bash
cd uptime-o
./mvnw -P-webapp
```

The `-P-webapp` flag disables the frontend build profile so Maven only compiles and runs the Spring Boot application. The backend starts on `http://localhost:8080` and runs Liquibase migrations automatically.

## 4. Run the Frontend

Open a second terminal in the `uptime-o/` directory and start the webpack dev server:

```bash
cd uptime-o
npm start
```

The dev server starts on `http://localhost:9000` and proxies API requests to `http://localhost:8080`. Hot Module Replacement (HMR) is enabled by default.

## 5. Log In and Verify

Open `http://localhost:9000` in your browser and sign in:

- **Username:** `admin`
- **Password:** `admin`

You should see the UptimeO dashboard. Verify the backend health endpoint:

```bash
curl http://localhost:8080/management/health
```

## Useful Commands

```bash
# Watch backend logs
cd uptime-o && ./mvnw -P-webapp

# Watch frontend logs
cd uptime-o && npm start

# Stop Postgres
cd docker && docker compose -f postgres.yml down
```

## Next Steps

- [Development workflow](/products/uptime-o/docs/development)
- [Connect your first agent](/products/uptime-o/docs/first-agent)
- [Create HTTP monitors](/products/uptime-o/docs/http-monitors)
