# AI Gateway Providers

The gateway is the **single egress point** for every LLM call. Two providers ship by default; both implement the same `GatewayClient` protocol so the rest of your app never knows which one is wired in.

## Why a gateway at all?

Without a gateway, every part of your app talks directly to OpenAI / Anthropic / Bedrock. That means:

- Provider keys leak across modules
- No central place to rate-limit, retry, or cache
- Switching providers means a code change
- Cost & traffic data are scattered

The gateway pattern fixes all four. Your code calls `gateway.chat(...)`; the gateway decides which vendor, applies retries, and emits one OTel span per call.

## What ships

```
app/ai/gateway/
├── registry.py            # create_gateway_client(settings) — picks provider from env
├── litellm_client.py      # OpenAI, Anthropic, Bedrock, Gemini, … via litellm SDK
└── bifrost_client.py      # Self-hosted LLM proxy (HTTP)
```

Switch with one env var:

```env
AI_GATEWAY_PROVIDER=litellm   # or bifrost
```

## litellm — default

[litellm](https://github.com/BerriAI/litellm) is a Python SDK that exposes 100+ models behind one OpenAI-compatible API.

**Choose litellm when:**
- You want the shortest path to a working LLM call
- You may switch between OpenAI ↔ Anthropic ↔ Bedrock ↔ Gemini without rewriting prompts
- You are happy running provider SDKs in-process

**Pros:** zero extra infrastructure, model name acts as the routing key (`gpt-4o`, `claude-3-5-sonnet`, `bedrock/anthropic.claude-3`), streaming + function-calling work out of the box.

**Cons:** rate-limits and retries are per-process (no global throttle across replicas), provider keys live in your app's env.

**Env needed:**
```env
AI_GATEWAY_PROVIDER=litellm
AI_OPENAI_API_KEY=sk-...
AI_ANTHROPIC_API_KEY=sk-ant-...
# ... per provider you use
```

## bifrost — self-hosted proxy

[bifrost](https://github.com/maximhq/bifrost) is a self-hosted LLM proxy with quota, rate-limiting, and caching policies.

**Choose bifrost when:**
- You need **global** rate limits across replicas (e.g. "free tier = 100 req/day across the entire fleet")
- You want a single audited surface for compliance (PII, prompt logging)
- You want to cache responses by prompt hash
- You want to enforce per-tenant quotas centrally

**Pros:** keys live on the proxy not the app, global throttle, response caching, model fallback policies.

**Cons:** one more service to operate. One more network hop.

**Env needed:**
```env
AI_GATEWAY_PROVIDER=bifrost
AI_BIFROST_URL=http://bifrost.internal:8080
AI_BIFROST_API_KEY=...
```

For distributed tracing into the proxy, the generated client uses `traced_httpx_client()` from `app/ai/telemetry/propagation.py` — the W3C `traceparent` is injected automatically so spans on the bifrost side join the same trace. See [AI Telemetry](ai-telemetry).

## Decision tree

```
Start
 │
 ├─ One service, dev/single replica?           → litellm
 ├─ Need cost cap across all replicas?         → bifrost
 ├─ Compliance requires central prompt log?    → bifrost
 ├─ Need cache by prompt hash?                 → bifrost
 └─ Want the fewest moving parts?              → litellm
```

You can also run **both** in different environments: litellm in dev, bifrost in staging/prod. Same code; only `AI_GATEWAY_PROVIDER` changes.

## Adding a custom gateway

When a third-party gateway (OpenRouter, Helicone, Portkey, your own) doesn't ship, write a plugin.

The protocol is small:

```python
# app/ai/gateway/openrouter_client.py
from app.ai.gateway.registry import register_gateway


@register_gateway("openrouter")
class OpenRouterClient:
    def __init__(self, settings):
        self.api_key = settings.openrouter_api_key
        self.base = "https://openrouter.ai/api/v1"

    async def chat(self, *, model: str, messages: list[dict], **kwargs):
        # call OpenRouter, return {"content": ..., "usage": {"input_tokens": ..., "output_tokens": ...}}
        ...

    async def stream(self, *, model: str, messages: list[dict], **kwargs):
        ...
```

Required methods:

| Method | Returns | Notes |
|---|---|---|
| `chat` | dict with `content` + `usage` | sync result |
| `stream` | async iterator of chunks | optional but recommended |
| `generate` / `completion` | provider-specific | optional |

The shape of `usage` matters — `ai-telemetry` reads `input_tokens` / `output_tokens` / `total_tokens` to compute `ai.cost_usd`. If your gateway returns a different shape, extend [pricing.py](ai-telemetry) or normalize in your client.

To ship it as a reusable package, see [Authoring a Plugin](authoring-a-plugin). Register under entry-point group `fastforge.generators` with name like `gateway-openrouter`.

## Verifying it works

```bash
fastforge new                # answer yes to AI, pick litellm or bifrost
cd <app>
fastforge add ai-telemetry   # so you can see cost per call
docker compose -f infra/docker-compose.yml -f infra/docker-compose.otel.yml up -d
curl -X POST localhost:8000/api/ai/chat \
     -H 'X-Tenant-Id: demo' \
     -d '{"model":"gpt-4o-mini","prompt":"hello"}'
# query tempo at :3200 — span shows ai.cost_usd
```

## Cost & latency comparison

| Metric | litellm (direct) | bifrost (proxy) |
|---|---|---|
| Extra latency | 0 | +10–30 ms |
| Failure modes | provider down | provider OR proxy down |
| Cost cap | per-process | global |
| Cache hit | none built-in | yes |
| Operational cost | $0 | runs as a service |

## See also

- [AI Ecosystem](ai-ecosystem) — full architecture overview
- [AI Telemetry](ai-telemetry) — wrap every gateway call with cost + trace
- [Authoring a Plugin](authoring-a-plugin) — ship your own gateway client
