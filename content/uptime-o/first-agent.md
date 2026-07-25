---
title: First Agent
description: Create an agent in UptimeO and connect a Go monitoring agent.
order: 3
---

# First Agent

Agents execute monitors and send heartbeats to the backend. In managed mode, an agent polls the UptimeO API for its monitor assignments.

## 1. Create the Agent Record

In the UptimeO console, go to **Internet Insights → Agents** and click **Create**.

![Agents list](/img/uptime-o/agents-01-list.png)

![Create agent form](/img/uptime-o/agents-02-create.png)

Save the agent ID shown after creation. You will need it when starting the agent process.

## 2. Create an API Key

Navigate to **Management → API Keys** and create a new key.

![API keys page](/img/uptime-o/account-01-api-keys.png)

![Create API key](/img/uptime-o/account-02-create-api-key.png)

Copy the key value immediately — it is shown only once.

## 3. Run the Agent

You can run the agent with Docker:

```bash
docker run --rm \
  -e API_BASE_URL="http://host.docker.internal:8080" \
  -e API_KEY="uptimeo_YOUR_API_KEY" \
  -e AGENT_ID=1 \
  -e CONFIG_RELOAD_INTERVAL=1m \
  ghcr.io/vibhuviOiO/uptimeo-agent:latest
```

Or build and run it locally:

```bash
cd uptime-o-api-agent
go build -o agent ./cmd/agent
export API_BASE_URL="http://localhost:8080"
export API_KEY="uptimeo_YOUR_API_KEY"
export AGENT_ID=1
./agent
```

## 4. Verify

Check the agent logs for `Acquired leadership` and successful heartbeat posts. Then create a monitor and assign it to the agent in the UI.
