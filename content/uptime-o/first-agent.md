---
title: First Agent
description: Create an agent in UptimeO and connect a monitoring agent.
order: 3
---

# First Agent

Agents execute monitors and send heartbeats to the backend. In managed mode, an agent polls the UptimeO API for its monitor assignments.

## 1. Create the Agent Record

In the UptimeO console, go to **Agents** in the sidebar and click **New Agent**.

![Agents list](/img/uptime-o/agents-01-list.png)

![Create agent form](/img/uptime-o/agents-02-create.png)

Save the agent ID shown after creation. You will need it when starting the agent process.

## 2. Create an API Key

Navigate to **Admin → API Keys** and create a new key.

![API keys page](/img/uptime-o/account-01-api-keys.png)

![Create API key](/img/uptime-o/account-02-create-api-key.png)

Copy the key value immediately — it is shown only once.

## 3. Run the Agent

Run the published agent image with Docker:

```bash
docker run -d \
  --name agent-us-east-1 \
  -e API_BASE_URL="http://host.docker.internal:8080" \
  -e API_KEY="uptimeo_YOUR_API_KEY" \
  -e AGENT_ID=1 \
  -e CONFIG_RELOAD_INTERVAL=1m \
  --restart unless-stopped \
  vibhuvioio/uptimeo-agent:latest
```

`host.docker.internal` lets the container reach an app running on your Docker host (on Linux, use the host's bridge IP instead).

## 4. Verify

Check the agent logs for `Acquired leadership` and successful heartbeat posts:

```bash
docker logs -f agent-us-east-1
```

Then create a monitor and assign it to the agent in the UI.
