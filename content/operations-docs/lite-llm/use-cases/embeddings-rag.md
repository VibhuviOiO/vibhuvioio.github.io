---
title: "Embeddings + Vector DB for RAG"
description: "Gateway in front of both the embedding model and the chat model — the full RAG loop with Pinecone, Qdrant, or pgvector, including the embedding-cost question."
order: 14
---

> **Tip:** RAG with the gateway in front of *both* the embedding call and the chat call is the cleanest seam — one place for cost, one place for retries, one place to swap providers.

## What this use case covers

- The **full RAG loop**: chunk → embed (via gateway) → store (Pinecone / Qdrant / pgvector) → retrieve → augment → chat (via gateway).
- **Gateway in front of the embedding model**, not just the chat model — so embedding cost and rate limits land in the same dashboards.
- The **embedding-cost question**: run once, cache forever (with proper version keys).
- A short comparison of **Pinecone vs Qdrant vs pgvector** for the use case at hand.

## Why it matters

RAG is the most common LLM workload after chat. Without the gateway in the embedding path, half the cost and half the failure modes are invisible.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

The companion courses on [Qdrant](../../qdrant/overview), [Pinecone](../../pinecone/overview), and [Milvus](../../milvus/overview) are good prerequisites. Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
