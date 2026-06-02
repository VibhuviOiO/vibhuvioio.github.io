# Vector Store Providers

Vector stores hold your embeddings and run similarity search. Five providers ship; pick by deployment shape, not by hype.

## Comparison table

| Provider | Deployment | Hybrid search | Best for |
|---|---|---|---|
| `chromadb` | Embedded or single-node | No (vector only) | Local dev, prototypes, < 1M vectors |
| `pgvector` | Postgres extension | Yes (SQL + vector) | You already run Postgres |
| `qdrant` | Self-hosted cluster | Yes (filtering + payload) | High-throughput self-hosted prod |
| `opensearch` | Self-hosted cluster | Yes (BM25 + vector + filters) | Combined keyword + vector ("RAG with citations") |
| `vertex_ai` | Managed (GCP) | Yes | GCP-native, no ops |

## Decision tree

```
Start
 │
 ├─ Already use Postgres in this app?           → pgvector
 ├─ Need BM25 + vector hybrid in one query?     → opensearch
 ├─ On GCP, no-ops policy?                      → vertex_ai
 ├─ > 50M vectors with high QPS?                → qdrant
 ├─ Dev / prototype / single replica?           → chromadb
 └─ Default for "FastAPI + Postgres" stack      → pgvector
```

## Switch provider

```env
AI_VECTOR_STORE_PROVIDER=pgvector       # or chromadb | qdrant | opensearch | vertex_ai
AI_PGVECTOR_DSN=postgresql://user:pass@db:5432/mydb
```

## What gets generated

```
app/ai/vector_store/
├── registry.py                  # create_vector_store(settings)
├── chromadb_provider.py
├── pgvector_provider.py
├── qdrant_provider.py
├── opensearch_provider.py
└── vertex_ai_provider.py
```

The protocol:

```python
class VectorStoreProvider(Protocol):
    async def initialize(self) -> None: ...
    async def upsert(self, *, id: str, vector: list[float], metadata: dict) -> None: ...
    async def add_documents(self, items: list[dict]) -> None: ...
    async def query(self, *, vector: list[float], top_k: int = 10,
                    filter: dict | None = None) -> list[dict]: ...
    async def search(self, *, text: str, top_k: int = 10) -> list[dict]: ...  # hybrid only
    async def delete(self, *, id: str) -> None: ...
```

Providers that don't support `search` (chromadb) raise `NotImplementedError` — your app code should call `query` after embedding the text itself.

## Per-provider notes

### chromadb

```env
AI_VECTOR_STORE_PROVIDER=chromadb
AI_CHROMADB_PATH=./data/chroma          # embedded mode
# or:
AI_CHROMADB_HOST=http://chroma:8000     # client/server mode
```

Embedded mode = SQLite under the hood. Fine for < 100k vectors. Above that, run chromadb as a service or move to qdrant.

### pgvector

```env
AI_VECTOR_STORE_PROVIDER=pgvector
AI_PGVECTOR_DSN=postgresql://...
AI_PGVECTOR_TABLE=documents             # default: ai_vectors
AI_PGVECTOR_DIM=1536                    # must match your embedding model
```

The generated provider creates an HNSW index on first `initialize()`. Reuse your existing Postgres — one less service to operate.

**Sweet spot**: 100k – 10M vectors, latency 5–50 ms with HNSW.

### qdrant

```env
AI_VECTOR_STORE_PROVIDER=qdrant
AI_QDRANT_URL=http://qdrant:6333
AI_QDRANT_COLLECTION=docs
AI_QDRANT_API_KEY=...                   # optional, if auth enabled
```

Purpose-built. Best raw throughput. Run as a stateful service with persistent volume + replicas.

### opensearch

```env
AI_VECTOR_STORE_PROVIDER=opensearch
AI_OPENSEARCH_URL=https://opensearch:9200
AI_OPENSEARCH_INDEX=docs
AI_OPENSEARCH_USER=admin
AI_OPENSEARCH_PASSWORD=...
```

The hybrid search story: BM25 + vector in a single query, with filters and faceting. Choose this when your users need both keyword precision ("error code E1043") and semantic recall ("login is broken").

### vertex_ai

```env
AI_VECTOR_STORE_PROVIDER=vertex_ai
AI_VERTEX_AI_INDEX_ID=projects/.../indexes/...
AI_VERTEX_AI_ENDPOINT_ID=projects/.../indexEndpoints/...
GOOGLE_APPLICATION_CREDENTIALS=/secrets/sa.json
```

Managed. No ops. Spendy at scale but zero pages.

## Sizing: how many vectors fit?

Memory for HNSW index ≈ `4 * dim * num_vectors * (M + 1)` bytes (M = graph degree, default 16).

| Vectors | dim=384 | dim=768 | dim=1536 |
|---|---|---|---|
| 100k | ~26 MB | ~52 MB | ~104 MB |
| 1M | ~260 MB | ~520 MB | ~1 GB |
| 10M | ~2.6 GB | ~5.2 GB | ~10 GB |

Add ~20% for payload + ID maps. Plan RAM, not disk — HNSW is RAM-bound.

## Hybrid search (BM25 + vector)

If users type both keywords *and* concepts, hybrid wins. The two providers that support it natively:

- **opensearch**: `_search` with both `match` and `knn` clauses, reciprocal-rank-fusion via plugin
- **qdrant**: payload filters + vector, or fast-rerank with sparse + dense vectors

For chromadb/pgvector, you can fake it with two queries (one BM25 via Postgres `tsvector`, one vector) and rank-merge in your app.

## Adding a custom provider

```python
# app/ai/vector_store/weaviate_provider.py
from app.ai.vector_store.registry import register_vector_store


@register_vector_store("weaviate")
class WeaviateProvider:
    def __init__(self, settings):
        ...

    async def initialize(self):
        ...

    async def add_documents(self, items):
        ...

    async def query(self, *, vector, top_k=10, filter=None):
        ...
```

Then `AI_VECTOR_STORE_PROVIDER=weaviate`. See [Authoring a Plugin](authoring-a-plugin) to ship it as a package.

## Telemetry

When `ai-telemetry` is enabled, `query`, `search`, `upsert`, `add_documents`, `delete` all emit spans tagged with:

- `ai.category` = `vector_store`
- `ai.provider` = `pgvector` (or whichever)
- Latency (built-in)
- `ai.tenant_id` from request header

`ai.cost_usd` is **not** set for vector store calls — self-hosted vector stores have no per-call price. Only the gateway and embedding spans carry cost.

## See also

- [AI Embedding Providers](ai-providers-embeddings)
- [AI App Kinds](ai-app-kinds) — how RAG/semantic_search use the vector store
- [AI Telemetry](ai-telemetry)
