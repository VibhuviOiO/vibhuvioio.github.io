# AI Telemetry — Cost & Trace Visibility for AI Calls

`fastforge add ai-telemetry` turns every AI call in your app into an OpenTelemetry span tagged with **token usage**, **USD cost**, **tenant ID**, and a **W3C trace context** propagated downstream to your AI gateway.

This is the missing piece that makes the AI cost-visibility story real: you can finally answer "which tenant burned $4,200 on gpt-4o yesterday, and on what code path?".

## Prerequisites

- A FastForge project with AI scaffolding (`fastforge new` → kind=`ai-app`, or `fastforge add ai-app`)
- Docker for the local OTel + Tempo + Prometheus stack

## Add it

```bash
cd my-ai-app
fastforge add ai-telemetry
```

## What gets generated

```
app/ai/telemetry/
├── __init__.py
├── spans.py          # AITracingProxy + ai_span() contextmanager
├── pricing.py        # USD cost table + AI_PRICING_OVERRIDES env support
├── tenant.py         # ContextVar + TenantContextMiddleware
└── propagation.py    # traced_httpx_client() — injects traceparent header

infra/
├── docker-compose.otel.yml
└── otel/
    ├── otel-collector.yaml
    ├── tempo.yaml
    └── prometheus.yml
```

The generator also:

- Wraps `create_gateway_client()`, `create_embedding_provider()`, and `create_vector_store()` factories with `AITracingProxy` — **every** provider method (`generate`, `chat`, `embed`, `query`, …) now emits a span automatically. No per-provider edits.
- Adds `ai_telemetry_enabled` + `ai_tenant_header` to `AISettings`
- Registers `TenantContextMiddleware` in `app/main.py`
- Appends OTel dependencies to `pyproject.toml`
- Records the capability in `.fastforge.json` so `fastforge audit` and `fastforge upgrade` know it's installed

## Span attributes (OTel semantic conventions)

| Attribute | Example | Source |
|---|---|---|
| `gen_ai.system` | `openai` | provider name from settings |
| `gen_ai.request.model` | `gpt-4o` | call argument |
| `gen_ai.usage.input_tokens` | `1240` | provider response |
| `gen_ai.usage.output_tokens` | `380` | provider response |
| `gen_ai.usage.total_tokens` | `1620` | sum |
| `ai.cost_usd` | `0.00690` | pricing table lookup |
| `ai.tenant_id` | `acme-corp` | `X-Tenant-Id` header → ContextVar |
| `ai.category` | `gateway` \| `embedding` \| `vector_store` | factory kind |
| `ai.provider` | `litellm` | settings.gateway_provider |

## Pricing model

Hardcoded USD per 1M tokens for `openai`, `gemini`, `bedrock`, `cohere`. Override or add models with an env var:

```bash
export AI_PRICING_OVERRIDES='{"openai":{"gpt-4o":{"input":2.5,"output":10.0}}}'
```

Unknown models return `None` (the span still ships, just without `ai.cost_usd`). Self-hosted providers like `local` have no entry and never produce a cost — that's intentional.

## Tenant attribution

Send your tenant on the request:

```bash
curl -H 'X-Tenant-Id: acme-corp' https://api.example.com/search
```

`TenantContextMiddleware` reads the header, stores it in a `ContextVar`, and every span inside that request gets `ai.tenant_id="acme-corp"`. Group costs by tenant in Tempo/Grafana with a single `groupby(ai.tenant_id, sum(ai.cost_usd))`.

## Distributed tracing to your AI gateway

For outbound calls to a gateway (litellm, bifrost, OpenRouter, etc.), use the generated helper:

```python
from app.ai.telemetry.propagation import traced_httpx_client

async with traced_httpx_client(base_url="https://gateway.internal") as http:
    resp = await http.post("/v1/chat/completions", json=payload)
```

The W3C `traceparent` header is injected automatically, so spans on the gateway side join the same trace.

## Boot the collector stack

```bash
docker compose -f infra/docker-compose.yml -f infra/docker-compose.otel.yml up -d
```

This brings up:

- **otel-collector** on `:4317` (OTLP gRPC) and `:4318` (OTLP HTTP)
- **tempo** on `:3200` (trace storage + query API)
- **prometheus** on `:9090` (metrics derived from spans)

Point your app at the collector:

```env
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
OTEL_SERVICE_NAME=my-ai-app
```

## Verify it works

```bash
# 1. Send a tagged request
curl -H 'X-Tenant-Id: demo' http://localhost:8000/api/search?q=hello

# 2. Query Tempo for spans with cost
curl 'http://localhost:3200/api/search?tags=ai.cost_usd'
```

You should see spans like:

```
ai.gateway.generate  duration=842ms  ai.tenant_id=demo  ai.cost_usd=0.00328
```

## What this unlocks

- **Per-tenant cost dashboards** in Grafana from one Tempo query
- **Cost alerts** (Prometheus: `sum by (tenant) (rate(ai_cost_usd_total[5m])) > 0.50`)
- **Trace-driven chargeback** — link every dollar to a request, a tenant, and a code path
- **Vendor comparison** — switch `AI_GATEWAY_PROVIDER`, replay traffic, diff the cost
