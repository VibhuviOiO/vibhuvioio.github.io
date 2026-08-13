---
title: "Streaming + Function-Calling Parity"
description: "Function calling shapes differ between OpenAI, Anthropic, Bedrock, and Gemini — the gateway abstracts the wire format so a single client works against three providers."
order: 10
---

> **Tip:** Function calling is where provider abstractions usually break. This use case proves the gateway holds the abstraction, including under streaming.

## What this use case covers

- A **single OpenAI-style tool/function call** sent through the gateway and answered correctly by **OpenAI, Anthropic, and Bedrock** without per-provider client code.
- **Streaming function calls** — the harder shape, where wire formats diverge most.
- A short **wire-format diff** showing what the gateway is translating on your behalf.
- The **honest gaps**: which providers do not yet support which features, and how the gateway surfaces those gracefully.

## Why it matters

The promise of an OpenAI-compatible API is that a single client works against any provider. Function calling is the test that promise actually holds.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

Until then, the [multi-provider free gateway](../free-gateway/multi-provider) is the substrate this builds on. Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
