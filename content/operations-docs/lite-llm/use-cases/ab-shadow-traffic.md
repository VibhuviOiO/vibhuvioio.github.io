---
title: "A/B Testing and Shadow Traffic"
description: "Send a percentage of traffic to a new model, log both responses, compare quality offline — and canary a model swap without touching application code."
order: 11
---

> **Tip:** Model swaps are the most common change in an LLM platform and the most under-tested. Shadow traffic and canaries move the risk to the gateway, where it belongs.

## What this use case covers

- **Percentage-based shadow traffic**: send N% of requests to a new candidate model in parallel, return the original response to the user, log both.
- **Offline quality comparison** of the shadow output — eval prompts, similarity scoring, human review queue.
- **Canary rollout** for a model swap: 1% → 10% → 50% → 100%, with auto-rollback on error-rate or latency regression.
- All of it driven by **gateway config**, not application code.

## Why it matters

When a model upgrade silently regresses on the team's hardest prompts, the only safe rollout is the one where you saw the regression in shadow before any real user hit it.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
