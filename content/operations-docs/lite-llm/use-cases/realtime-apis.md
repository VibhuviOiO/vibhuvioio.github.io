---
title: "Realtime / WebSocket APIs"
description: "OpenAI Realtime, Bedrock Realtime, and gateway proxy patterns for bi-directional streaming — a different shape than HTTP request/response."
order: 19
---

> **Tip:** Realtime APIs are bi-directional and long-lived. The gateway pattern has to change accordingly — connection pooling, idle eviction, and per-key concurrency replace per-request rate limits.

## What this use case covers

- A short tour of **OpenAI Realtime** and **Bedrock Realtime** wire formats.
- The **gateway proxy patterns** that work for bi-directional WebSockets — connection pooling, idle eviction, backpressure.
- **Per-key concurrency** as the rate-limit primitive (not TPM/RPM).
- The **observability gap** that opens up with long-lived connections and how to close it.

## Why it matters

Voice agents, live transcription, and interactive copilots are all moving to realtime APIs. A gateway that only speaks HTTP request/response will quietly become the bottleneck the moment a product team picks up one of those workloads.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
