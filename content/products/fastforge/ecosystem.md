# Ecosystem Overview

FastForge generates the application. The ecosystem around it makes the application observable, cost-controlled, and deployable.

This page describes the whole stack so you know what to build outside the CLI.

## The picture

```
        Client
          │
          ▼
   ┌──────────────────────┐
   │  FastForge App       │ ← built with `fastforge new`
   │  (FastAPI + AI)      │
   └──┬───────────────┬───┘
      │               │
      ▼               ▼
 ┌──────────┐   ┌──────────────┐
 │ Redis    │   │ AI Gateway   │ ← litellm or bifrost
 │ Cache    │   │              │
 └──────────┘   └──┬───────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
    ┌──────┐  ┌──────┐   ┌────────┐
    │OpenAI│  │Gemini│   │Bedrock │
    └──────┘  └──────┘   └────────┘

         ↓ OpenTelemetry (OTLP gRPC)

   ┌────────────────────────────────────┐
   │  OTel Collector (separate stack)   │
   └──┬────────────┬───────────┬────────┘
      ▼            ▼           ▼
   ┌─────┐    ┌──────────┐  ┌──────────┐
   │Tempo│    │Prometheus│  │   Cost   │
   │     │    │          │  │ Dashboard│
   └─────┘    └──────────┘  └──────────┘
        ↓          ↓             ↓
        └──── Grafana ───────────┘
```

## What FastForge owns

| Layer | FastForge command |
|---|---|
| FastAPI app (routes, services, repositories) | `fastforge new` |
| AI gateway integration | `fastforge new` (kind=ai-app) |
| Embeddings strategy | `fastforge new` |
| Vector store strategy | `fastforge new` |
| Redis cache | `fastforge new` (cache=redis) |
| Structured logging | `fastforge new` (logging=structlog+json) |
| OTel HTTP instrumentation | `fastforge add observability` |
| Prometheus `/metrics` endpoint | `fastforge add observability` |
| Docker + debug compose | `fastforge new` |
| K8s / Helm manifests | `fastforge deploy k8s` / `helm` |

## What lives outside FastForge

| Component | Where to host | Why outside the CLI |
|---|---|---|
| OTel Collector | Sibling docker-compose / k8s | One per environment, shared across apps |
| Tempo (traces) | Sibling docker-compose / k8s | Storage layer, not per-app |
| Prometheus / Mimir (metrics) | Sibling docker-compose / k8s | Storage layer, not per-app |
| Grafana (dashboards) | Sibling docker-compose / k8s | Visualization, not per-app |
| **Cost dashboard** | A separate FastForge-generated app | A consumer of OTel data, not a generator output |
| LLM hosting (vLLM, llama.cpp) | Sibling deployment | Infra concern, not app concern |

## Build order

1. `fastforge new` your first app
2. `fastforge add observability` to enable OTel emission
3. Stand up the **observability stack** (collector + Tempo + Prometheus + Grafana) as a separate compose
4. Point your app at the collector via `OTEL_EXPORTER_OTLP_ENDPOINT`
5. Build the **cost dashboard** as a second FastForge app that reads from Tempo/Prometheus
6. Iterate: every new FastForge app gets observability for free; the dashboard becomes the operational pane of glass

## Why this separation matters

- **Single responsibility**: the CLI generates apps; the ecosystem stores and visualizes their data
- **Multi-tenant safety**: one collector + dashboard serves N apps without coupling
- **Upgradeable**: change the collector backend (Tempo → Honeycomb → Datadog) without touching apps
- **Self-hosted by default**: every component can run in your VPC
