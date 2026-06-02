# Use Cases

These are the **current, tested** FastForge use-cases. Each one ships as a built-in preset inside the `fastforge-cli` package, mirrored at `examples/use-cases/` in the repo and validated by `tests/smoke_ecosystem.py`.

Two ways to generate from a preset:

```bash
# Built-in preset (works after `pip install fastforge-cli`, no repo clone)
fastforge new --preset <name>

# Override the project name from the preset
fastforge new --preset <name> --name my-service

# Custom preset file (JSON or YAML)
fastforge new --from-file ./my-preset.fastforge.json
fastforge new --from-file ./my-preset.fastforge.yaml
```

List all available built-in presets:

```bash
fastforge list-presets
```

## 1. Simple FastAPI service

Use when: you need a clean CRUD API with Docker, tests, logging, and health checks.

Create:

```bash
fastforge new --preset simple-fastapi
```

Preset: `examples/use-cases/simple-fastapi.fastforge.json`

`.fastforge.json` focus:

```json
{
	"use_case": "simple_fastapi",
	"kind": "standalone",
	"database": "none",
	"cache": "none",
	"streaming": "none"
}
```

Test:

```bash
cd simple-fastapi
python3 -m pip install -e ".[dev]"
python3 -m pytest -q
python3 -m compileall app
python3 -m uvicorn app.main:app --port 8000
```

## 2. PostgreSQL API

Use when: you need a business API backed by Postgres with Redis and better local dev tooling.

Create:

```bash
fastforge new --preset postgres-api
```

Preset: `examples/use-cases/postgres-api.fastforge.json`

`.fastforge.json` focus:

```json
{
	"use_case": "postgres_api",
	"database": "postgres",
	"cache": "redis",
	"secrets": "vault",
	"docker_debug": "yes"
}
```

Test:

```bash
cd postgres-api
python3 -m pip install -e ".[dev]"
python3 -m pytest -q
python3 -m compileall app
docker compose -f infra/docker-compose.yml up -d
```

## 3. Event-driven service

Use when: your API publishes or consumes events and still needs a normal CRUD/data layer.

Create:

```bash
fastforge new --preset event-service
```

Preset: `examples/use-cases/event-service.fastforge.json`

`.fastforge.json` focus:

```json
{
	"use_case": "event_service",
	"database": "postgres",
	"cache": "redis",
	"streaming": "kafka"
}
```

Test:

```bash
cd event-service
python3 -m pip install -e ".[dev]"
python3 -m pytest -q
python3 -m compileall app
docker compose -f infra/docker-compose.yml up -d
```

## 4. AI semantic search

Use when: you want a search API over products, docs, tickets, or internal knowledge.

Create:

```bash
fastforge new --preset semantic-search
```

Preset: `examples/use-cases/semantic-search.fastforge.json`

`.fastforge.json` focus:

```json
{
	"use_case": "semantic_search",
	"ai_app_kind": "semantic_search",
	"llm_gateway": "litellm",
	"embeddings_provider": "openai",
	"vector_store": "chromadb"
}
```

Test:

```bash
cd semantic-search
python3 -m pip install -e ".[dev]"
python3 -m pytest -q
python3 -m compileall app
python3 -m uvicorn app.main:app --port 8000
```

## 5. RAG app with observability and AI telemetry

Use when: you want a retrieval + generation API with HTTP traces, AI spans, token usage, and USD cost visibility.

Create:

```bash
fastforge new --preset rag-observable
```

Preset: `examples/use-cases/rag-observable.fastforge.json`

`.fastforge.json` focus:

```json
{
	"use_case": "rag_observable",
	"observability": "enabled",
	"ai_app_kind": "rag",
	"ai_telemetry": {
		"version": "1.0.0",
		"tenant_header": "X-Tenant-Id"
	}
}
```

Test:

```bash
cd rag-observable
python3 -m pip install -e ".[dev]"
python3 -m pytest -q
python3 -m compileall app
docker compose -f infra/docker-compose.yml -f infra/docker-compose.grafana.yml up -d
docker compose -f infra/docker-compose.yml -f infra/docker-compose.otel.yml up -d
python3 -m uvicorn app.main:app --port 8000
```

## 6. Observable API (no AI)

Use when: you need Postgres + Redis with full Grafana observability (Prometheus, Loki, Tempo) but no AI features.

Create:

```bash
fastforge new --preset observable-api
# Or pass the equivalent YAML preset directly:
fastforge new --from-file examples/use-cases/observable-api.fastforge.yaml
```

Preset: `examples/use-cases/observable-api.fastforge.json`

`.fastforge.json` focus:

```json
{
	"use_case": "observable_api",
	"database": "postgres",
	"cache": "redis",
	"observability": "enabled"
}
```

Test:

```bash
cd observable-api
python3 -m pip install -e ".[dev]"
python3 -m pytest -q
python3 -m compileall app
docker compose -f infra/docker-compose.yml -f infra/docker-compose.grafana.yml up -d
python3 -m uvicorn app.main:app --port 8000
```

## Quick validation for all documented use-cases

Run the repo smoke harness:

```bash
python3 tests/smoke_ecosystem.py
```

It generates and validates all six use-cases listed above.

## Notes

- The manifest files under `examples/use-cases/` are **reference presets**. They show the expected selected properties for each use-case.
- Presets can be written in JSON (`.fastforge.json`) or YAML (`.fastforge.yaml` / `.fastforge.yml`). Both formats are equivalent.
- `fastforge new --preset <name>` and `fastforge new --from-file <path>` both load presets non-interactively and apply AI / observability follow-up generators when those keys are present.
- Agent apps are not listed here because the current package does not scaffold them end-to-end yet.
