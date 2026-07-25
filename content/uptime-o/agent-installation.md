---
title: Agent Installation
description: Create an agent in UptimeO, generate an API key, and run the agent with Docker.
order: 12
---

# Agent Installation

The UptimeO monitoring agent is a lightweight Go binary that executes HTTP monitors and submits heartbeats to the backend. It is distributed as the `vibhuvioio/uptimeo-agent` Docker image. This guide covers creating an agent record, generating an API key, and running one or more agents.

## 1. Create an Agent in the UI

Start the UptimeO server and log in as `admin`, then go to **Agents** in the sidebar and click **New Agent**.

Fill in the agent details:

- **Name** — e.g. `agent-us-east-1`
- **Datacenter** — optional; pick from the searchable list to group agents by physical location
- **Description** — optional

Save the agent. Copy the numeric **Agent ID** for the next steps.

## 2. Generate an API Key

Navigate to **Admin → API Keys** and create a new key.

Copy the key value immediately — it is shown only once. The key prefix is `uptimeo_`.

## 3. Run with Docker

Run a single agent:

```bash
docker run -d \
  --name agent-us-east-1 \
  -e API_BASE_URL="http://host.docker.internal:8080" \
  -e API_KEY="uptimeo_YOUR_API_KEY" \
  -e AGENT_ID=1 \
  -e CONFIG_RELOAD_INTERVAL="1m" \
  --restart unless-stopped \
  vibhuvioio/uptimeo-agent:latest
```

`host.docker.internal` lets the container reach an app running on your Docker host. On Linux, use the host's bridge IP instead.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `API_BASE_URL` | Yes | UptimeO server URL |
| `API_KEY` | Yes | API key from UptimeO admin |
| `AGENT_ID` | Yes | Agent ID from the UI |
| `HEALTH_PORT` | No | Health check port (default: `9090`) |
| `QUEUE_PATH` | No | Persistent queue file path (default: `/data/queue`) |
| `CONFIG_RELOAD_INTERVAL` | No | How often to poll for new monitors (default: `24h`) |

Valid interval examples: `1m`, `5m`, `1h`, `24h`.

## 4. Run Multiple Agents

For several agents (e.g. one per region), use a small Compose file — one service per agent:

```yaml
name: uptimeo-agents

services:
  agent-us-east:
    image: vibhuvioio/uptimeo-agent:latest
    environment:
      AGENT_ID: "1"
      API_BASE_URL: http://host.docker.internal:8080
      API_KEY: ${UPTIMEO_API_KEY_US_EAST}
      CONFIG_RELOAD_INTERVAL: 1m
    restart: unless-stopped

  agent-eu-west:
    image: vibhuvioio/uptimeo-agent:latest
    environment:
      AGENT_ID: "2"
      API_BASE_URL: http://host.docker.internal:8080
      API_KEY: ${UPTIMEO_API_KEY_EU_WEST}
      CONFIG_RELOAD_INTERVAL: 1m
    restart: unless-stopped
```

```bash
docker compose up -d
docker compose logs -f
```

## 5. Verify the Agent

Check the agent health endpoint (map the port if you need it on the host):

```bash
docker logs agent-us-east-1
```

In the logs, look for:

- `Acquired leadership` — the agent is active
- Successful heartbeat posts
- `Successfully flushed X queued heartbeats` if the queue had backlog

Query recent heartbeats in PostgreSQL:

```sql
SELECT id, monitor_id, agent_id, executed_at, success, response_time_ms
FROM api_heartbeats
ORDER BY executed_at DESC
LIMIT 10;
```

## Resilience Features

The agent is designed for unreliable networks:

- **Automatic retry** — exponential backoff for API failures
- **Persistent queue** — heartbeats are saved to disk if the API is unavailable
- **Graceful recovery** — the queue auto-flushes when the API returns
- **No data loss** — the agent does not crash due to API downtime

## Troubleshooting

| Symptom | Fix |
|---|---|
| Agent won't start | Verify `API_BASE_URL` is reachable, `API_KEY` is valid, and `AGENT_ID` exists |
| `connection refused` to the app | Use `http://host.docker.internal:8080` instead of `http://localhost:8080` — `localhost` inside a container is the container itself |
| No heartbeats | Ensure the agent has monitors assigned in the UI and that monitors are reachable from the agent host |
| Queue not flushing | Check API connectivity and API key permissions; review logs for `Failed to flush heartbeat queue` |

## Next Steps

- [Create HTTP monitors](/products/uptime-o/docs/http-monitors)
- [Deployment guide](/products/uptime-o/docs/deployment)
- [Uptime analytics](/products/uptime-o/docs/uptime-analytics)
