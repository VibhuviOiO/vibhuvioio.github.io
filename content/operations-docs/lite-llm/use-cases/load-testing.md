---
title: "Load Testing and Capacity Planning for the Gateway"
description: "The gateway is on the hot path — k6 / Locust against the proxy, profiling the Postgres and Redis ceilings, deciding where horizontal scaling starts to matter."
order: 22
---

> **Tip:** Most teams skip load testing the gateway until the first incident. The honest version of this use case is the one that runs the test *before* that incident.

## What this use case covers

- **k6 and Locust scripts** pointed directly at the LiteLLM proxy, with realistic prompt mixes.
- **Profiling the Postgres ceiling** — the admin DB is usually the first thing to wobble.
- **Profiling the Redis ceiling** — cache lookups under load are deceptively expensive.
- Deciding **where horizontal scaling starts to matter**: one big container, three medium ones, or a real autoscaling group.
- A short **capacity-planning conversation** template you can take to the platform leadership meeting.

## Why it matters

The gateway is on the hot path for every model call in the company. The cost of the first outage is usually larger than the cost of the load-testing day that would have prevented it.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
