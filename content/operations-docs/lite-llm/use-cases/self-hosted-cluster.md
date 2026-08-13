---
title: "Self-Hosted LLM Cluster (vLLM / TGI) Behind the Gateway"
description: "For teams with on-prem GPUs — same OpenAI-compatible alias trick, weights running locally, hybrid cloud + on-prem in one gateway, routing by cost or compliance."
order: 16
---

> **Tip:** The cleanest argument for an AI gateway is the hybrid story: cloud models for breadth, on-prem models for sensitive workloads, one base URL for application code.

## What this use case covers

- **vLLM** or **Text Generation Inference (TGI)** serving open-weights models on local GPUs.
- The **same OpenAI-compatible alias trick** the rest of the course uses, applied to a self-hosted backend.
- **Hybrid routing**: cloud + on-prem behind a single gateway, with traffic split by cost, latency, or compliance class.
- **GPU autoscaling** notes (KEDA / Karpenter) and **zero-downtime model swaps**.

## Why it matters

Some workloads cannot leave the network. Some cannot afford to. Some teams have GPUs sitting idle. The gateway makes all three problems the same problem, with the same solution shape.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

Until then, the [Ollama setup](../ollama/setup) is the simplest local-model substrate. Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
