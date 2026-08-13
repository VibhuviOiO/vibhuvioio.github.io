---
title: Use Cases — What's Next
description: The publishing/video roadmap built on top of the four core profiles — cost governance, semantic cache, observability, guardrails, multi-tenancy, and the gap list of what real platform teams hit in the first 90 days.
duration: "10m"
readingTime: "10m"
labTime: "0m"
order: 1
---

The first six phases of this course gave you the four runnable profiles that everything else is built on top of:

- [Ollama](../ollama/setup) — the local learning shape
- [Provider smoke tests](../providers/smoke-tests) — direct provider validation
- [Multi-provider free gateway](../free-gateway/multi-provider) — five free providers, one endpoint, fallback you can trigger
- [Bedrock dev profile](../bedrock/dev-profile) — the smallest verifiable enterprise setup
- [Bedrock prod profile](../bedrock/prod-profile) — the three-service production-shape stack

This page is the roadmap for what comes next. Each item below maps to a future runnable use-case folder in the same repo. The order is intentional — each one builds on what the previous one proved, and each one is shareable as its own standalone post.

> **Note:** This roadmap is actively in development. Lessons will be added here as each use case ships. Subscribe to the [infinite-containers](https://github.com/VibhuviOiO/infinite-containers) repo to be notified.

---

## Planned — next in the series

### 5. Cost Governance with Virtual Keys + Budgets — the CFO shape

The [Bedrock prod profile](../bedrock/prod-profile) UI already supports this; this use case is the dedicated story:

- Issue keys per team or per app
- Set spend budgets, set TPM/RPM
- Watch the gateway block requests when a budget is exceeded
- Add showback / chargeback reporting (monthly per-cost-center attribution)

### 6. Semantic Caching — the "stop paying twice" shape

Add Redis-backed semantic cache (embedding-based lookup, not just exact-match) and measure the latency and cost delta on repeated prompts with concrete numbers.

- Exact-match vs semantic cache
- Similarity threshold tuning
- Cache invalidation: TTL, manual flush, model-version-keyed
- The honest limit: chat workloads cache poorly, eval and batch enrichment cache beautifully

### 7. Observability + Per-Key Analytics — the platform-team shape

Ship LiteLLM logs and Prometheus metrics into Grafana, plus Langfuse for trace-level visibility:

- The four standard dashboards: cost, error rate, latency, per-key usage
- Alerting on cost cliffs, error-rate cliffs, latency cliffs
- The on-call runbook for an AI gateway

### 8. PII Redaction + Guardrails — the legal/security shape

- Microsoft Presidio for PII detection at the gateway
- Prompt-injection detection on inbound: pattern, classifier, both
- Content filtering on outbound: blocklists, classifiers, model-as-judge
- Per-key guardrail policies (some teams need stricter rules)
- Brief compliance-posture note: SOC2, HIPAA, GDPR

---

## Production-grade gap list — what real teams hit in the first 90 days

These are the things real platform teams encounter that the current four profiles do not yet cover. Each is a strong standalone use case.

### 9. Multi-region / multi-account failover

Same Bedrock model deployed in two regions, automatic failover when one region degrades. Or two AWS accounts with different IAM postures for blast-radius isolation.

### 10. Streaming + tool/function calling parity across providers

Function calling shapes differ between OpenAI, Anthropic, Bedrock, Gemini. The gateway abstracts the wire format; the demo proves a single client works against three providers.

### 11. A/B testing and shadow traffic

Send a percentage of traffic to a new model, log both responses, compare quality offline. Canary rollout for a model swap without touching application code.

### 12. Authentication beyond bearer tokens

- JWT validation
- OIDC integration (Okta, Auth0, Cognito, Azure AD)
- Mapping end-user identity (not just app identity) to virtual keys

Required for any B2B SaaS where each end customer needs separate accountability.

### 13. SaaS multi-tenancy and BYOK

- Per-customer virtual keys
- Per-customer model access lists
- Per-customer budgets
- Bring-your-own-key (BYOK) — let end customers pass their own provider API keys through the gateway

### 14. Embeddings + Vector DB for RAG

Gateway in front of both the embedding model and the chat model. Show the full RAG loop with Pinecone / Qdrant / pgvector behind the gateway. Includes the embedding-cost question (run once, cache forever).

### 15. Image, Audio, and Multimodal Routing

Same gateway, multiple modalities. Vision models, Whisper-style audio, image generation. Demonstrates the OpenAI-compatible API is not just a chat surface.

### 16. Self-Hosted LLM Cluster (vLLM / TGI) Behind the Gateway

For teams with on-prem GPUs. Same OpenAI-compatible alias trick, model weights running locally. Hybrid pattern: cloud + on-prem in the same gateway, routing by cost or compliance.

### 17. CI/CD and Config-As-Code

- Schema validation in CI
- Dry-run testing for model list changes
- Staged rollout (dev → staging → prod)
- GitOps for the model list (Flux, ArgoCD)
- Disaster recovery and config rollback

### 18. MCP (Model Context Protocol) Routing

Emerging standard in late 2025 / early 2026. Gateway as MCP hub. Worth a use case once the protocol stabilizes.

### 19. Realtime / WebSocket APIs

OpenAI Realtime, Bedrock Realtime, gateway proxy patterns for bi-directional streaming. Different shape than HTTP request/response.

### 20. Agent Frameworks Behind the Gateway

LangGraph / CrewAI / AutoGen pointed at a single base URL. The gateway gives the agent loop optionality, fallback, and cost governance the agent frameworks themselves do not provide.

### 21. Cost Showback / Chargeback Automation

Monthly per-team email with model breakdown, anomaly flags, budget burndown. Connects the engineering surface to the finance surface.

### 22. Load Testing and Capacity Planning for the Gateway Itself

The gateway is on the hot path. k6 / Locust against the proxy, profiling the Postgres and Redis ceilings, deciding where horizontal scaling starts to matter. Most teams skip this until the first incident.

---

## How each use case is packaged

Each future use case follows the same shape as the current four folders:

- Its own folder under `lite-llm/`
- Its own `docker-compose.yml`, `env.example`, `litellm_config.yaml`, `README.md`
- Its own course lesson here on VibhuviOiO with project files pulled from raw GitHub
- A blog walkthrough and a video at the same time

---

## The recurring framing

Across every future lesson, two things stay constant:

**"Production-grade is a checklist, not a binary."** Every use case will ship with an honest gap table — what's actually production-grade in the box, and what is explicitly NOT here. No vendor-pitch tone.

**"The smallest verifiable thing that works, then layer."** Each use case proves one new behavior on top of the previous shape. Never mix five new concerns into one folder.

---

## How to follow along

- Star [infinite-containers](https://github.com/VibhuviOiO/infinite-containers) on GitHub to get notified when a new use case lands
- Each lesson will appear in this sidebar as it ships
- The four base profiles in this course will keep being the foundation everything else builds on top of
