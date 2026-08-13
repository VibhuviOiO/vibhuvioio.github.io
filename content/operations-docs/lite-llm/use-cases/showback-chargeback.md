---
title: "Cost Showback / Chargeback Automation"
description: "The reporting half of cost governance — monthly per-team email with model breakdown, anomaly flags, budget burndown — connecting the engineering surface to the finance surface."
order: 21
---

> **Tip:** Showback is when finance sees the bill broken out by team. Chargeback is when each team's budget actually pays it. The gateway holds the data for both.

## What this use case covers

- The **monthly reporting job**: per-team / per-cost-center cost breakdown, by model, by day.
- **Anomaly flags**: spend up >50% week over week, key approaching budget, model usage outside expected pattern.
- **Budget burndown** charts that a non-engineer can read.
- The **delivery shape** — email digest, Slack post, dashboard link — chosen by audience.
- The **finance integration**: exporting the right CSV / API payload for the chargeback system that already exists.

## Why it matters

Engineering is judged on shipping. Finance is judged on attribution. Showback / chargeback is the artifact that makes both sides happy without either having to learn the other's tools.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

See also the related [cost governance](./cost-governance) use case, which is the enforcement half of the same story. Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
