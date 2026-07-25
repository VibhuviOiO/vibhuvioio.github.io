---
title: Getting Started
description: What UptimeO is, its features, and the prerequisites for running it locally.
order: 1
---

# Getting Started

UptimeO is a self-hosted uptime observability platform. It combines a Spring Boot management backend, a React admin console, lightweight Go monitoring agents, public and private status pages, and analytics — all backed by PostgreSQL.

## Features

- **Multi-region synthetic monitoring** — assign HTTP/HTTPS monitors to distributed agents and collect heartbeats from many locations.
- **Public & private status pages** — publish service health and incident history to internal teams or external customers.
- **Distributed Go agents** — agents poll the API for configuration, execute checks, and submit heartbeats with retry and persistent queueing.
- **Response-time analytics** — view availability percentages, latency trends, and status history across regions and datacenters.
- **Audit log & data retention** — track changes and manage retention policies for heartbeats and audit events.
- **Smart notifications** — Slack and email alerts for outages, high latency, and agent health issues.

## Architecture Overview

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   React UI      │──────▶  Spring Boot   │◀─────▶   PostgreSQL   │
│ (port 8080)     │      │  (port 8080)   │      │   (port 5432)  │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                    ▲
                                    │ HTTP + API key
                           ┌─────────────────┐
                           │   Go Agent(s)   │
                           │ execute monitors│
                           └─────────────────┘
```

## Deployment Modes

- **Managed mode** (recommended): The central backend owns monitors, agents, and schedules. Agents poll for configuration and report heartbeats over HTTP.
- **Standalone mode**: Agents write heartbeats directly to PostgreSQL without a backend. Useful for headless or embedded deployments.

This documentation focuses on managed mode because it unlocks the web UI, agent auto-assignment, analytics, and status pages.

## Prerequisites

You only need Docker:

| Tool | Version | Purpose |
|---|---|---|
| Docker | 24+ | Runs the app, PostgreSQL, and agents |
| Docker Compose | 2+ | Multi-service stacks |

Verify your environment:

```bash
docker -v
docker compose version
```

## First Login

After completing the [installation](/products/uptime-o/docs/installation), open the console at `http://localhost:8080`.

Sign in with the default administrator account, then change the password immediately:

- **Username:** `admin`
- **Password:** `admin`

Once logged in, the overview dashboard shows the current health of regions, datacenters, and monitors.

## What to Do Next

1. [Install UptimeO](/products/uptime-o/docs/installation).
2. [Connect your first agent](/products/uptime-o/docs/first-agent).
3. [Create HTTP monitors](/products/uptime-o/docs/http-monitors) and assign them to agents.
