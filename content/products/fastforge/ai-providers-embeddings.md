# Embedding Providers

Six embedding providers ship by default. Pick one from a single env var; switch later by changing that env var.

## Comparison table

| Provider | Default model | Dimensions | Cost / 1M input tokens | Best for |
|---|---|---|---|---|
| `openai` | `text-embedding-3-small` | 1536 | $0.02 | Default, best quality/cost ratio |
| `openai` | `text-embedding-3-large` | 3072 | $0.13 | Highest retrieval quality |
| `gemini` | `text-embedding-004` | 768 | $0.025 | Google ecosystem, multimodal roadmap |
| `cohere` | `embed-english-v3.0` | 1024 | $0.10 | Multilingual + native reranker |
| `bedrock` | `amazon.titan-embed-text-v2` | 1024 | ~$0.02 | AWS-native, IAM, no third-party key |
| `huggingface` | `sentence-transformers/all-MiniLM-L6-v2` | 384 | $0 (self-hosted) | Offline, low latency, free |
| `local` | configurable | varies | $0 | Air-gapped / dev |

Prices as of 2025-Q4. Always verify on the provider's pricing page before committing.

## The dimension trade-off

Embedding **dimensions** = vector length. Higher dimensions usually mean better retrieval quality but cost more in:

- **Storage** (linear) — 3072-d vectors are 4× bigger than 768-d
- **Query latency** (cosine sim cost scales with d)
- **Memory in HNSW / IVF indexes**

Rule of thumb for a corpus of N documents:

| Corpus size | Recommended dim |
|---|---|
| < 100k docs | 1536 or higher — quality matters more than cost |
| 100k – 10M | 768–1536 — sweet spot |
| > 10M | 384–768 — switch to a smaller model or run dimensionality reduction |

## Quality vs cost — the honest answer

For most internal search / RAG use cases:

1. **Start with `text-embedding-3-small`** ($0.02 / 1M, 1536-d). It is the unambiguous default.
2. **Move to `-large` only if** retrieval@10 measurably improves on your eval set. Expect 5–15% relative gain at 6.5× cost.
3. **Move to `huggingface`/`local` only if** you have a data-residency requirement OR > $500/month in embedding spend.

Do **not** pick by vendor preference. Pick by your eval set.

## Switch provider

```env
AI_EMBEDDING_PROVIDER=openai           # or gemini | cohere | bedrock | huggingface | local
AI_OPENAI_API_KEY=sk-...               # required when openai
AI_OPENAI_EMBED_MODEL=text-embedding-3-small  # optional override
```

## What gets generated

```
app/ai/embeddings/
├── registry.py                 # create_embedding_provider(settings)
├── openai_provider.py
├── gemini_provider.py
├── cohere_provider.py
├── bedrock_provider.py
├── huggingface_provider.py    # spins up a sentence-transformers model
└── local_provider.py
```

Every provider exposes:

```python
class EmbeddingProvider(Protocol):
    async def embed(self, text: str) -> list[float]: ...
    async def embed_batch(self, texts: list[str]) -> list[list[float]]: ...
```

The default `embed_batch` chunks at the provider's max-batch limit and calls in parallel.

## Cost ceiling — math you should do once

Cost per document = `cost_per_1M * tokens_per_doc / 1_000_000`.

A typical 1-page doc (~500 tokens):

| Provider | Cost / 1k docs | Cost / 1M docs |
|---|---|---|
| openai 3-small | $0.01 | $10 |
| openai 3-large | $0.065 | $65 |
| gemini 004 | $0.0125 | $12.50 |
| cohere v3 | $0.05 | $50 |
| bedrock titan v2 | ~$0.01 | ~$10 |
| huggingface/local | $0 | $0 (+ GPU/CPU time) |

**Re-embedding the corpus every quarter is normal.** Budget for it.

## Hybrid approach — embed once, search many

If you have multiple downstream tasks (search, dedup, classification), embed each document **once** with the best model you can afford and store the vector. Don't re-embed for every task.

This is why `pgvector` is popular: the embedding lives next to your business data and you query it from SQL.

## Air-gapped / offline (`huggingface` & `local`)

Pick `huggingface` for sentence-transformers models (model is downloaded on first run, then cached). Pick `local` for a model you host elsewhere (e.g. behind a private endpoint).

```env
AI_EMBEDDING_PROVIDER=huggingface
AI_HUGGINGFACE_MODEL=sentence-transformers/all-MiniLM-L6-v2  # 384-d, ~80MB
```

Expect 5–50ms per embedding on CPU for `MiniLM-L6-v2`. Use `gte-large` (1024-d) for higher quality, ~2× slower.

## Adding a custom provider

```python
# app/ai/embeddings/voyage_provider.py
from app.ai.embeddings.registry import register_embedding


@register_embedding("voyage")
class VoyageProvider:
    def __init__(self, settings):
        self.client = ...  # init Voyage client

    async def embed(self, text: str) -> list[float]:
        ...

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        ...
```

Then set `AI_EMBEDDING_PROVIDER=voyage`. To ship as a reusable plugin, see [Authoring a Plugin](authoring-a-plugin).

## Telemetry

When `ai-telemetry` is enabled, every `embed` / `embed_batch` call emits a span tagged with:

- `gen_ai.system` = `openai`
- `gen_ai.request.model` = `text-embedding-3-small`
- `gen_ai.usage.input_tokens` = N
- `ai.cost_usd` = computed from pricing table
- `ai.tenant_id` = from request header

So you can answer "how much did tenant X spend on embeddings last week?" with one Tempo/Grafana query.

## See also

- [AI Ecosystem](ai-ecosystem)
- [AI Vector Store Providers](ai-providers-vector-store) — where these vectors live
- [AI Telemetry](ai-telemetry)
