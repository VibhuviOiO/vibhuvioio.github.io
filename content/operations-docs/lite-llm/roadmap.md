---
title: "Course Roadmap"
description: What you'll deploy, configure, and operate — and who this course is for.
duration: "15m"
readingTime: "15m"
labTime: "0m"
order: 1
---

This course is not a "what is an AI gateway" introduction — plenty of those already exist. It's a hands-on platform-engineering guide: you deploy real LiteLLM gateways, prove fallback works on purpose, wire enterprise providers, and graduate from a laptop-shape stack to a production-shape stack.

Every lesson maps to a runnable folder in the [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm) repo. Each step builds on the last and is shareable as its own standalone post.

## The gateway pattern in one diagram

___LITELLM_GATEWAY_FLOW___

One stable OpenAI-compatible contract for your apps. Routing, retries, fallback, spend control, and cache live behind that contract — none of it inside application code.

## What this course is not

- A LiteLLM documentation rewrite — the docs are referenced, not regurgitated
- A "build a chatbot in 30 days" course — the audience already ships software
- Framework-of-the-month — the curriculum is structured around the gateway pattern
- Theory-heavy — every lesson follows download → run → verify → understand

## Who this course is for

| Role | What You'll Get |
|------|-----------------|
| **Platform / Infra Engineers** | Operate model access as infrastructure: routing, fallback, virtual keys, cache |
| **SREs** | Understand the failure modes before the on-call rotation starts |
| **ML Platform Teams** | Move from notebook-era model serving to production-era model serving |
| **Engineering Managers** | Evaluate build-vs-buy with enough depth to back the decision |
| **Senior App Developers** | Have the actual answer when "AI infrastructure" questions land on your desk |

## Prerequisites

You'll get the most out of this course if you're comfortable with:

- **Docker and Docker Compose** — multi-service stacks, healthchecks, volumes
- **Linux command line** — editing files, running `curl`, reading container logs
- **REST APIs and JSON** — what `curl -X POST` does, what a bearer token is
- **Basic AWS** (for the Bedrock modules) — IAM, regions, profile config

You do **not** need ML, embeddings, or LangChain experience to take this course.

## What you'll build

### Local Gateway — Ollama
**Duration:** 35 minutes

- LiteLLM proxy in five minutes with no cloud keys
- Ollama as the local model backend (`qwen2.5:0.5b`, `smollm2:135m`)
- The model-alias trick: `gpt-4o-mini` pointing at a local model
- Fallback you can trigger on demand (the deliberately broken alias)
- The LiteLLM admin UI and why Postgres lives even in the "local" stack

### Provider Smoke Tests
**Duration:** 25 minutes

- Direct Python tests for Gemini, Groq, OpenRouter, Hugging Face, Cloudflare
- Why you prove the provider key works *before* you wire the gateway
- Per-provider gotchas: Cloudflare's `account_id`, HF cold starts, OpenRouter free-model churn

### Multi-Provider Free Gateway
**Duration:** 40 minutes

- Five hosted free-tier providers behind one OpenAI-compatible endpoint
- Routing strategies, declared fallback chains, per-request fallback override
- `mock_testing_fallbacks` to demo fallback on a healthy route
- Streaming fallback, and the mid-stream limitation
- Open WebUI as the chat surface a non-engineer can demo

### AWS Bedrock — Dev Profile
**Duration:** 30 minutes

- The smallest verifiable Bedrock setup — one container, `~/.aws` mounted
- The four curls that isolate config / chat / embeddings / health
- The seven Bedrock failure modes, ordered by likelihood

### AWS Bedrock — Prod Profile
**Duration:** 45 minutes

- Three-service topology: gateway + Postgres + Redis with healthchecks
- `STORE_MODEL_IN_DB=True` and the admin UI as the operating surface
- Virtual keys, budgets, per-key TPM/RPM, Redis response cache
- IAM-role-ready auth and the laptop → real server promotion checklist
- The honest "what is NOT here" gap table

### Use Cases — What's Next
**Duration:** 10 minutes

- The publishing/video roadmap built on top of the four core profiles
- Cost governance, semantic cache, observability, guardrails, multi-tenancy
- What's already runnable, what's planned, what real teams hit in the first 90 days

## The full curriculum

The five hands-on modules above are the spine of the course. Around them sits the wider [LLM Platform Engineering With LiteLLM](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/COURSE.md) curriculum — 18 modules covering every gateway concern a real platform team eventually owns:

- **Foundations** — the gateway pattern, the OpenAI-compatible contract, where LiteLLM fits vs Cloudflare / Kong / Portkey
- **Local-First With Ollama** → **Multi-Provider Routing** → **Bedrock Dev** → **Bedrock Prod** — the runnable spine
- **Other Enterprise Providers** — Azure OpenAI, Vertex AI, Anthropic direct, Cohere / Mistral
- **Cost Governance** — virtual keys, budgets, showback / chargeback
- **Caching** — exact-match and semantic, with honest cache-limit tables
- **Observability** — logs, Prometheus, Langfuse, the four standard dashboards
- **Guardrails, PII & Compliance** — Presidio, prompt-injection detection, SOC2 / HIPAA / GDPR posture
- **Authentication & Multi-Tenancy** — JWT, OIDC, BYOK, per-tenant budgets
- **Advanced Routing** — A/B and shadow traffic, canary, latency- and cost-aware, multi-region failover
- **Beyond Text** — embeddings + RAG, image, audio, multimodal, function-calling parity
- **Self-Hosted Models At Scale** — vLLM, TGI, GPU autoscaling, hybrid cloud + on-prem
- **Emerging Standards** — MCP, agent frameworks, realtime APIs
- **CI/CD & Config-as-Code** — schema validation, staged rollout, GitOps, disaster recovery
- **Load Testing & Capacity** — k6 / Locust, Postgres / Redis ceilings, when to scale horizontally
- **Capstone** — end-to-end B2B SaaS deployment with real IAM, real SLAs, real drills
- **Career & Communication** — system design interviews, portfolio shape, public content

Modules with a 🔒 **Soon** badge in the sidebar are part of the published index but ship as content lands. The runnable spine above is available today.

## How each lesson is packaged

Every lesson has the same three artifacts. This is what keeps the course from becoming a slide deck:

1. **A runnable repo folder** in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm)
2. **Project files** rendered inline — Compose file, LiteLLM config, env example, all pulled from raw GitHub
3. **One concrete decision** the student makes by the end ("which routing strategy fits my workload", "where does TLS live", "is Postgres overkill at my scale yet")

## Next Steps

- [Local Gateway — Ollama](./ollama/setup) — the smallest honest gateway, with fallback you can trigger
