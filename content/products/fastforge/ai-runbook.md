# AI Runbook

When you enable AI capabilities, FastForge generates a complete AI infrastructure layer and auto-wires it into your FastAPI app.

## What gets generated

```
app/ai/
├── config.py                 # Pydantic settings (AI_* env vars)
├── lifespan.py               # Provider lifecycle (init + cleanup)
├── dependencies.py           # FastAPI Depends() wiring
├── gateway/                  # LLM gateway (litellm / bifrost)
├── embeddings/               # openai / gemini / cohere / huggingface / bedrock / local
├── vector_store/             # vertex_ai / chromadb / opensearch / pgvector / qdrant
└── app_kinds/                # semantic_search / rag / agent orchestrators

app/api/routes/ai.py          # Example route (auto-wired into app/main.py)
```

## Auto-wiring

The AI generator patches `app/main.py` to:

1. Import the AI router and AI lifespan
2. Replace `lifespan=lifespan` with a composed `merged_lifespan`
3. Include the AI router in `create_app()`
4. Fail-open if AI providers fail to initialize (logged as `ai_lifespan_disabled`) so the app still boots locally

## Minimum environment

Set these in `.env.staging`:

```env
AI_GATEWAY_PROVIDER=litellm
AI_EMBEDDING_PROVIDER=<openai|gemini|bedrock|...>
AI_VECTOR_STORE_PROVIDER=<vertex_ai|chromadb|pgvector|...>
```

Provider-specific keys are listed in the generated `.env.example`.

## Add cost & trace visibility

Once AI is wired, run `fastforge add ai-telemetry` to get OTel spans tagged with token usage, USD cost, and tenant ID around every AI call. See [AI Telemetry](ai-telemetry) for details.

## Vertex AI on Cloud Run

For production search latency:

1. Use a Serverless VPC Access connector
2. Route egress through the VPC for Google APIs
3. Keep Cloud Run and Vertex resources in the same region
4. Start Cloud Run concurrency at **250** for async I/O workloads, then tune by p95 latency and error rate
5. Avoid manual connection pooling — Google SDKs handle it natively

## Verify AI is wired

```bash
python3 -m uvicorn app.main:app --port 8000
curl http://localhost:8000/health
curl http://localhost:8000/openapi.json | grep -i '"/ai/'
```

You should see the `/ai/search/`, `/ai/rag/`, or `/ai/agent/` path depending on the app kind selected.

## Replaceable providers

All AI components follow the Strategy + Registry pattern. To switch providers:

1. Update `AI_*` env vars
2. Restart the app
3. No code changes required

To add a new provider, drop a module in `app/ai/<gateway|embeddings|vector_store>/` that registers itself via the registry pattern.
