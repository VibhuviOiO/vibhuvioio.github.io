# Create an Application

This is the canonical workflow for using FastForge to create a new production-grade service.

## Workflow

```
[Client Prompt]
      ↓
[Answer Sheet]
      ↓
fastforge new
      ↓
fastforge add <capability> ...
      ↓
Implement business logic
      ↓
Validate → Deploy
```

## Step 1 — Translate the client prompt to an answer sheet

For every new client, fill in this short matrix:

| Question | Example |
|---|---|
| Project name | `searchapi` |
| Project kind | `standalone` |
| Python version | `3.13` |
| HTTP port | `8000` |
| Domain model name | `item` |
| Database | `none` / `postgres` / `mongodb` |
| Cache | `redis` |
| Streaming | `none` / `kafka` |
| Secrets | `none` / `vault` |
| Logging | `structlog` + `json` + `stdout` |
| Docker / Debug compose | `yes` / `yes` |
| AI capability | `semantic_search` / `rag` / `agent` |
| Embedding provider | `openai` / `gemini` / `bedrock` |
| Vector store | `vertex_ai` / `chromadb` / `pgvector` |

## Step 2 — Generate

```bash
fastforge new
```

Answer the prompts using your matrix. The generator outputs:

- `app/` — SOLID architecture (routes, services, repositories, middleware)
- `tests/` — pytest with async client
- `Dockerfile`, `docker-compose.debug.yml`
- `infra/docker-compose.yml`
- `app/ai/` (when AI selected) — gateway, embeddings, vector store, lifespan
- `app/api/routes/ai.py` (auto-wired into `app/main.py`)
- `README.md` with an AI runbook section (Vertex envs, Cloud Run guidance)

## Step 3 — Add platform capabilities

```bash
fastforge add observability
fastforge add postgres        # if database needed later
fastforge add kafka           # if streaming needed later
fastforge add auth            # if auth needed
```

## Step 4 — Implement business logic

FastForge intentionally does not write your domain logic. You should add:

- Tenant / API key authentication
- Client metadata cache adapter (parameter mapping, output field filters)
- Query rewriting and embedding orchestration
- Provider strategy implementations
- OpenTelemetry spans across orchestration stages

## Step 5 — Validate before committing

```bash
python3 -m pip install -e ".[dev]"
python3 -m pytest tests/
python3 -m compileall app
python3 -m uvicorn app.main:app --port 8000  # smoke check /health
fastforge doctor
```

## Step 6 — Deploy

```bash
fastforge deploy local    # local Docker
fastforge deploy k8s      # Kubernetes manifests
fastforge deploy helm     # Helm chart
```

## Tips

- Keep your answer sheet versioned per client.
- Run `fastforge doctor` before every commit.
- Re-running `fastforge new` is destructive — generate in a fresh folder.
- Use `fastforge upgrade` (when applicable) to bring older projects up to current defaults.
