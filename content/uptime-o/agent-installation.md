---
title: Agent Installation
description: Create an agent in UptimeO, generate an API key, and run the Go agent locally or with Docker.
order: 12
---

# Agent Installation

The UptimeO monitoring agent is a lightweight Go binary that executes HTTP monitors and submits heartbeats to the backend. This guide covers creating an agent record, generating an API key, and running the agent locally or in Docker.

## 1. Create an Agent in the UI

Start the UptimeO server and log in as `admin`, then go to **Internet Insights → Agents** and click **Create**.

Fill in the agent details:

- **Name** — e.g. `agent-us-east-1`
- **Region** — e.g. `us-east`
- **Datacenter** — e.g. `us-east-1a`
- **Description** — optional

Save the agent. The detail page shows the numeric **Agent ID**; copy it for the next step.

## 2. Generate an API Key

Navigate to **Management → API Keys** and create a new key.

Copy the key value immediately — it is shown only once. The key prefix is `uptimeo_`.

## 3. Build and Run Locally

From the repository root:

```bash
cd uptime-o-api-agent
go build -o agent ./cmd/agent
```

Set the required environment variables and run the agent:

```bash
export API_BASE_URL="http://localhost:8080"
export API_KEY="uptimeo_YOUR_API_KEY"
export AGENT_ID=1
export CONFIG_RELOAD_INTERVAL="1m"
./agent
```

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

## 4. Run with Docker

Build the agent image:

```bash
cd uptime-o-api-agent
docker build -t uptimeo-api-agent:latest .
```

Run a single agent:

```bash
docker run --rm -p 9090:9090 \
  -e API_BASE_URL="http://host.docker.internal:8080" \
  -e API_KEY="uptimeo_YOUR_API_KEY" \
  -e AGENT_ID=1 \
  -e CONFIG_RELOAD_INTERVAL="1m" \
  uptimeo-api-agent:latest
```

Run the published image directly:

```bash
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
  ghcr.io/vibhuvioio/uptimeo-agent:latest
```

## 5. Multi-Agent Docker Compose Setup

The `uptime-o-api-agent/` directory includes a `multiple-agents-compose.yml` file. Update it with your API key and agent IDs, then start all agents:

```bash
cd uptime-o-api-agent
export API_KEY="uptimeo_YOUR_API_KEY"
docker compose -f multiple-agents-compose.yml up -d
```

View logs:

```bash
docker compose -f multiple-agents-compose.yml logs -f
```

## 6. Verify the Agent

Check the agent health endpoint:

```bash
curl http://localhost:9090/healthz
```

In the agent logs, look for:

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

The Go agent is designed for unreliable networks:

- **Automatic retry** — exponential backoff for API failures
- **Persistent queue** — heartbeats are saved to disk if the API is unavailable
- **Graceful recovery** — the queue auto-flushes when the API returns
- **No data loss** — the agent does not crash due to API downtime

## Troubleshooting

| Symptom | Fix |
|---|---|
| Agent won't start | Verify `API_BASE_URL` is reachable, `API_KEY` is valid, and `AGENT_ID` exists |
| No heartbeats | Ensure the agent has monitors assigned in the UI and that monitors are reachable from the agent host |
| Queue not flushing | Check API connectivity and API key permissions; review logs for `Failed to flush heartbeat queue` |

## Next Steps

- [Create HTTP monitors](/products/uptime-o/docs/http-monitors)
- [Deployment guide](/products/uptime-o/docs/deployment)
- [Uptime analytics](/products/uptime-o/docs/uptime-analytics)
