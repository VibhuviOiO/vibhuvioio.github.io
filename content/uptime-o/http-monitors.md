---
title: HTTP Monitors
description: Configure HTTP and HTTPS monitors.
order: 6
---

# HTTP Monitors

Monitors define the endpoints you want to watch. Each monitor records a heartbeat on every run, including success/failure and response time.

## Create a Monitor

Go to **Monitors** and click **New Monitor**.

![Monitors list](/img/uptime-o/monitors-01-list.png)

![Create monitor form](/img/uptime-o/monitors-02-create.png)

A monitor needs:

- **Name**: A friendly label
- **URL**: The endpoint to check
- **Method**: `GET`, `POST`, etc.
- **Type**: `HTTP` or `HTTPS`
- **Schedule**: How often to run

## Assign to Agents

A monitor only runs when it is assigned to an agent.

![Assigned monitor](/img/uptime-o/monitors-03-assigned.png)

After assignment, the agent will pick up the monitor on its next config reload and start sending heartbeats.

## Monitor Detail

Open a monitor to see live KPIs, the response-time overview across all assigned agents, per-agent breakdowns, and recent checks.

![Monitor detail](/img/uptime-o/monitors-04-detail.png)
