# AI App Kinds

When you generate an AI app with FastForge, you pick one **app kind** — the orchestrator that wires gateway + embeddings + vector store into a use case. Three ship by default.

| Kind | Generated module | What it does |
|---|---|---|
| `semantic_search` | `app/ai/app_kinds/semantic_search.py` | Embed-on-write + similarity query |
| `rag` | `app/ai/app_kinds/rag.py` | Retrieve → augment → generate |
| `agent` | `app/ai/app_kinds/agent.py` | Tool-calling loop with memory |

Pick one per app. Need multiple? Run multiple apps — they share the same generated `app/ai/` infrastructure.

## semantic_search

The simplest. You write documents → they get embedded → you query by text → you get back the most similar documents.

**When to choose:**
- Internal search ("find docs about retry logic")
- Deduplication ("is this ticket a duplicate?")
- Recommendations ("more like this")
- Anything that doesn't need an LLM at query time

**Generated route:**
```
POST /api/ai/documents      → embed + store
GET  /api/ai/search?q=...   → top-k similar docs
```

**Generated code shape:**
```python
# app/ai/app_kinds/semantic_search.py
class SemanticSearch:
    def __init__(self, embeddings, vector_store):
        self.embeddings = embeddings
        self.vector_store = vector_store

    async def index(self, doc_id: str, text: str, metadata: dict):
        vec = await self.embeddings.embed(text)
        await self.vector_store.upsert(id=doc_id, vector=vec, metadata=metadata)

    async def search(self, query: str, top_k: int = 10) -> list[dict]:
        vec = await self.embeddings.embed(query)
        return await self.vector_store.query(vector=vec, top_k=top_k)
```

**No LLM call at query time** = cheapest pattern, sub-100ms latency.

## rag

Retrieve documents, stuff them into a prompt, ask the LLM. The canonical "chatbot over my docs" pattern.

**When to choose:**
- Support bots over a knowledge base
- "Explain this code/document" features
- Q&A where users want answers, not links

**Generated route:**
```
POST /api/ai/chat
{ "question": "How do I configure retries?", "top_k": 5 }
```

**Generated pipeline:**
```python
# app/ai/app_kinds/rag.py
class RAG:
    def __init__(self, embeddings, vector_store, gateway):
        ...

    async def answer(self, question: str, top_k: int = 5) -> dict:
        # 1. retrieve
        q_vec = await self.embeddings.embed(question)
        docs = await self.vector_store.query(vector=q_vec, top_k=top_k)

        # 2. augment
        context = "\n\n".join(d["content"] for d in docs)
        prompt = RAG_PROMPT.format(context=context, question=question)

        # 3. generate
        result = await self.gateway.chat(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )
        return {
            "answer": result["content"],
            "citations": [d["metadata"]["source"] for d in docs],
            "usage": result["usage"],
        }
```

**Customize the prompt** in `app/ai/app_kinds/prompts.py` — keep it under source control so you can A/B test prompt changes.

**Tuning knobs:**

| Knob | Default | Effect |
|---|---|---|
| `top_k` | 5 | Higher = more context = more cost + slower |
| Reranker | off | Add cohere reranker for better top-k quality |
| Model | `gpt-4o-mini` | Swap to `gpt-4o` for higher quality at 6× cost |

**Cost profile per question** (1 embed + 1 LLM call):
- ~500 token question embed: ~$0.00001
- 5 docs × 500 tokens context + 200 token answer with gpt-4o-mini: ~$0.0005
- **= ~$0.50 per 1000 questions** at the default settings

## agent

Tool-calling loop. The LLM picks tools, you execute them, feed results back, repeat until done.

**When to choose:**
- Multi-step automation ("file a ticket, then notify on-call, then update the runbook")
- Workflows where the LLM should decide order
- When users give vague goals you decompose at runtime

**Generated route:**
```
POST /api/ai/agent
{ "goal": "Create a support ticket for the API timeout issue and notify @oncall" }
```

**Generated loop:**
```python
# app/ai/app_kinds/agent.py
class Agent:
    def __init__(self, gateway, tools: list[Tool]):
        ...

    async def run(self, goal: str, max_steps: int = 10) -> dict:
        messages = [{"role": "user", "content": goal}]
        for step in range(max_steps):
            result = await self.gateway.chat(
                model="gpt-4o",
                messages=messages,
                tools=[t.schema for t in self.tools],
            )
            if result.get("tool_calls"):
                for call in result["tool_calls"]:
                    tool_result = await self._execute(call)
                    messages.append({"role": "tool", "content": tool_result})
            else:
                return {"answer": result["content"], "steps": step + 1}
        return {"answer": "max steps reached", "steps": max_steps}
```

**Add a tool:**
```python
# app/ai/tools/create_ticket.py
from app.ai.agent import tool

@tool(name="create_ticket", description="Create a Jira ticket")
async def create_ticket(title: str, body: str, assignee: str) -> str:
    ticket_id = await jira.create(title, body, assignee)
    return f"Created {ticket_id}"
```

**Cost warning:** agent loops can spiral. Always set `max_steps` and a per-tenant budget alert. With `ai-telemetry` enabled, every step is one span with `ai.cost_usd` — sum them per request to enforce a budget.

## Switching kinds later

You **can** run multiple kinds in one app — just add the modules manually. The first kind is generated for you to keep `fastforge new` simple.

```python
# app/main.py — add another kind by hand
from app.ai.app_kinds.semantic_search import SemanticSearch
from app.ai.app_kinds.rag import RAG  # added later

app.include_router(semantic_search_router)
app.include_router(rag_router)        # added later
```

## Telemetry: cost-per-request

With `ai-telemetry`, every kind emits a parent span you can use to compute end-to-end cost:

| Kind | Spans per request | Typical cost |
|---|---|---|
| `semantic_search` | 1 embed + 1 vector query | $0.00001 |
| `rag` | 1 embed + 1 vector query + 1 gateway chat | $0.0005 |
| `agent` | 1 chat per step (N steps) | $0.001 – $0.05 |

Sum `ai.cost_usd` over child spans of a single trace to get per-request cost; group by `ai.tenant_id` for per-tenant cost.

## See also

- [AI Ecosystem](ai-ecosystem)
- [AI Telemetry](ai-telemetry) — turn on cost & trace visibility
- [AI Cost Recipes](ai-cost-recipes) — alert when cost > $X, per-tenant dashboards
