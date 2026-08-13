---
title: "Agent Frameworks Behind the Gateway"
description: "LangGraph, CrewAI, AutoGen pointed at a single base URL — the gateway gives the agent loop optionality, fallback, and cost governance the frameworks themselves do not provide."
order: 20
---

> **Tip:** Agent frameworks are great at orchestration and weak at platform concerns. The gateway fills the gap.

## What this use case covers

- **LangGraph**, **CrewAI**, and **AutoGen** all configured against the same `OPENAI_BASE_URL` — the gateway.
- What the gateway gives the agent loop that the framework does not: **fallback**, **cost governance**, **per-key budgets**, **observability**, and **audit**.
- A working agent that uses **three providers** through the gateway without per-provider code.
- The **cost-blow-up failure mode** specific to agents (loops, retries, tool-call cascades) and how budgets cap it.

## Why it matters

Agents are the workload most likely to surprise the cost dashboard. The gateway is the cheapest place to make that surprise bounded and observable.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
