# AI Ecosystem

FastForge generates a complete, hot-swappable AI stack — four pluggable layers wired into a FastAPI app, with cost & trace visibility built in.

> **One command**
> ```bash
> fastforge new              # answer "yes" to AI capabilities
> fastforge add ai-telemetry # add cost & trace attribution
> ```

## The four layers

```
┌─────────────────────────────────────────────────────────────┐
│  App Kind        semantic_search │ rag │ agent              │
├─────────────────────────────────────────────────────────────┤
│  Gateway         litellm │ bifrost                          │
├─────────────────────────────────────────────────────────────┤
│  Embeddings      openai │ gemini │ cohere │ bedrock │       │
│                  huggingface │ local                        │
├─────────────────────────────────────────────────────────────┤
│  Vector Store    chromadb │ pgvector │ qdrant │             │
│                  opensearch │ vertex_ai                     │
└─────────────────────────────────────────────────────────────┘
        + Telemetry (OTel spans, USD cost, tenant id)
```

Each layer has a **registry pattern**: a factory function (`create_gateway_client`, `create_embedding_provider`, `create_vector_store`) reads `AISettings.<x>_provider` and returns the active implementation. Switch providers by changing one env var — no code edits.

## Layer 1 — Gateway

The LLM gateway is the single egress point for chat/completion/streaming requests.

| Provider | Use when | Notes |
|---|---|---|
| `litellm` | You want a single SDK for OpenAI, Anthropic, Bedrock, Gemini, … | Default. Most mature. |
| `bifrost` | You want self-hosted LLM proxy with quota / rate-limit policies | Pair with `traced_httpx_client` for distributed tracing |

**Generated files:**
```
app/ai/gateway/
├── registry.py          # create_gateway_client(settings)
├── litellm_client.py
└── bifrost_client.py
```

Switch provider:
```env
AI_GATEWAY_PROVIDER=litellm   # or bifrost
```

## Layer 2 — Embeddings

Turns text into vectors. Six providers ship by default.

| Provider | Best for | Cost per 1M tokens (input) |
|---|---|---|
| `openai` | Quality + ubiquity (`text-embedding-3-small`/`-large`) | $0.02 / $0.13 |
| `gemini` | Google ecosystem | $0.025 |
| `cohere` | Multilingual + reranking | $0.10 |
| `bedrock` | AWS-native (Titan) | varies |
| `huggingface` | Self-hosted | $0 |
| `local` | Air-gapped, fully offline | $0 |

Switch provider:
```env
AI_EMBEDDING_PROVIDER=openai
```

## Layer 3 — Vector Store

Stores embeddings and runs similarity search.

| Provider | Best for |
|---|---|
| `chromadb` | Local dev, single-node prod | 
| `pgvector` | Already using Postgres |
| `qdrant` | High-performance, self-hosted |
| `opensearch` | Combined keyword + vector hybrid search |
| `vertex_ai` | GCP-native, managed |

Switch provider:
```env
AI_VECTOR_STORE_PROVIDER=pgvector
```

## Layer 4 — App Kind

The orchestrator that wires the three layers above into a use case. Pick one.

| Kind | What it builds | When to choose |
|---|---|---|
| `semantic_search` | embed-on-write + similarity query API | Internal search, deduplication, recommendations |
| `rag` | retrieve → augment → generate pipeline | Chatbots over your docs, support assistants |
| `agent` | tool-calling loop with memory | Automation, multi-step workflows |

Generated files (e.g. for RAG):
```
app/ai/app_kinds/rag/
├── pipeline.py          # retrieve → augment → generate
├── prompts.py
└── schemas.py
```

## Telemetry (cross-cutting)

`fastforge add ai-telemetry` wraps every provider call with an OpenTelemetry span carrying:

- `gen_ai.system`, `gen_ai.request.model`
- `gen_ai.usage.input_tokens` / `output_tokens` / `total_tokens`
- `ai.cost_usd` (USD computed from a pricing table you can override)
- `ai.tenant_id` (from the `X-Tenant-Id` header, propagated via `ContextVar`)
- W3C `traceparent` injected on outbound httpx calls

See [AI Telemetry](ai-telemetry) for the full attribute table, pricing overrides, and collector stack.

## Settings shape

Every AI app gets a single `AISettings` Pydantic model in `app/ai/config.py`:

```python
class AISettings(BaseSettings):
    gateway_provider:      str = "litellm"
    embedding_provider:    str = "openai"
    vector_store_provider: str = "chromadb"

    # provider-specific keys live below — generated based on selections
    openai_api_key:        SecretStr | None = None
    pgvector_dsn:          str | None = None
    # ...

    # added by `fastforge add ai-telemetry`
    ai_telemetry_enabled:  bool = True
    ai_tenant_header:      str = "X-Tenant-Id"

    model_config = {"env_prefix": "AI_"}
```

All keys are env-driven (`AI_OPENAI_API_KEY`, `AI_GATEWAY_PROVIDER`, …) so the same image runs locally, in staging, and in prod without code changes.

## Lifespan & wiring

The generator patches `app/main.py` to:

1. Import the AI router + AI lifespan
2. Compose AI lifespan with the existing FastAPI lifespan (`merged_lifespan`)
3. Add the AI router under `/api/ai/*`
4. Fail-open: if a provider fails to init (missing key, unreachable Qdrant), the app still boots and logs `ai_lifespan_disabled`. Other endpoints keep working.

This is intentional — you should never have a missing OpenAI key take down `/health`.

## Recipe map

| You want to… | Run this | Read this |
|---|---|---|
| Build internal semantic search over your docs | `fastforge new` → ai_app_kind=`semantic_search` | [Create an Application](create-application) |
| Build a RAG chatbot over a knowledge base | `fastforge new` → ai_app_kind=`rag` | [AI Runbook](ai-runbook) |
| Show per-tenant LLM spend in Grafana | `fastforge add ai-telemetry` | [AI Telemetry](ai-telemetry) |
| Swap from OpenAI to a local model | edit `.env` only | [AI Runbook](ai-runbook) |
| Add a new vector store provider | author a plugin | [Authoring a Plugin](authoring-a-plugin) |

## What this stack is NOT

Honest scope:

- **Not** a hosted gateway. FastForge generates code; you run it.
- **Not** a model evaluation harness. Use `promptfoo` / `lm-eval-harness` alongside.
- **Not** a fine-tuning pipeline. Out of scope by design.
- **Not** locked to any vendor. Every layer is hot-swappable by design.

## Next steps

1. [Create an Application](create-application) — generate your first AI app
2. [AI Runbook](ai-runbook) — env vars, lifespan internals, troubleshooting
3. [AI Telemetry](ai-telemetry) — turn on cost & trace visibility
4. [Authoring a Plugin](authoring-a-plugin) — add your own gateway, embedder, or vector store
