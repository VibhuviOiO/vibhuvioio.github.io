---
title: "MCP (Model Context Protocol) Routing Through the Gateway"
description: "Emerging standard in late 2025/early 2026 — the gateway as an MCP hub, fronting tools and context providers the same way it fronts models."
order: 18
---

> **Tip:** MCP is the most interesting new protocol in the LLM space since the OpenAI Chat API. The gateway as MCP hub is the natural next layer.

## What this use case covers

- A short **MCP primer**: what the protocol is, what problem it solves, why it is showing up everywhere in 2026.
- The **gateway as an MCP hub**: tools, resources, and context providers registered once, available to every client.
- **Per-key MCP policies**: which tools and resources each virtual key can reach.
- The **honest gaps** while the protocol stabilizes — what works today and what will change.

## Why it matters

MCP turns "every agent reimplements every tool" into "every agent points at the same MCP hub." The gateway is the obvious place for that hub to live, because it already owns identity, budgets, and audit.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video, once the protocol stabilizes further.

Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
