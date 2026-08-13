---
title: "Multi-Region / Multi-Account Failover"
description: "Same Bedrock model deployed in two regions with automatic failover, or two AWS accounts with different IAM postures for blast-radius isolation."
order: 9
---

> **Tip:** Region failover is the first real reliability conversation after a gateway has been live for a quarter. This use case packages it as something you can run, not just diagram.

## What this use case covers

- The **same Bedrock model deployed in two AWS regions**, fronted by a single LiteLLM alias.
- **Automatic failover** when one region degrades — circuit-breaker thresholds, recovery probes, and what counts as "degraded."
- **Two AWS accounts** with different IAM postures, for **blast-radius isolation** between environments or tenants.
- The trade-off between **active-active**, **active-passive**, and **regional pinning** — and when each one is the right call.

## Why it matters

Provider outages are not rare. Region outages are not rare. Account-level IAM mistakes are not rare. A gateway without a failover story is a gateway with one bad day from a public incident.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

Until then, the [Bedrock prod profile](../bedrock/prod-profile) is the single-region baseline this builds on. Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
