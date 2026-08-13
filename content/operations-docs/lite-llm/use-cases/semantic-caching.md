---
title: "Semantic Caching"
description: "The \"stop paying twice\" shape — Redis-backed semantic cache with embedding-based lookup, similarity-threshold tuning, and measurable cost and latency deltas on repeated prompts."
order: 6
---

> **Tip:** This use case builds directly on the [Bedrock prod profile](../bedrock/prod-profile), which already runs Redis for response caching. The next step is adding *semantic* (embedding-based) lookup on top of exact-match.

## What this use case covers

- **Exact-match cache** vs **semantic cache** — what each one catches and what it misses.
- **Embedding-based lookup** in Redis, with a similarity threshold you can tune.
- **Measuring the delta**: p50/p95 latency, cost per 1k requests, and hit rate — with concrete numbers from real workload shapes.
- Honest **cache limits** per workload (chat, RAG, agent loop) so you do not oversell the win.

## Why it matters

The fastest cost win in any LLM platform is "stop paying twice for the same answer." But exact-match caches catch almost nothing in real traffic — users phrase things slightly differently each time. Semantic caching closes that gap, and is one of the few changes that improves cost *and* latency at the same time.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

Until then, the [Bedrock prod profile](../bedrock/prod-profile) Redis layer is the substrate this will plug into. Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
