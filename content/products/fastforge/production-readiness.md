# Production Readiness

This page documents what is production-grade in FastForge-generated apps today, and what is intentionally left for the developer.

## What FastForge guarantees in generated code

### Architecture

- SOLID separation: routes → services → repositories
- Async I/O end-to-end (FastAPI + httpx + asyncpg + motor + aiokafka)
- Dependency injection via FastAPI `Depends()`
- Pydantic-settings for environment-driven config (12-factor)

### Reliability

- Structured logging (structlog, JSON) with request IDs
- Security headers middleware
- CORS configuration
- Async lifespan with graceful shutdown
- AI lifespan is fail-open: missing providers do not block app startup

### Quality

- pytest + pytest-asyncio + pytest-cov
- ruff linting (replaces flake8 + isort + black)
- 80%+ baseline coverage out of the box
- All AI scaffolding passes `python -m compileall app/ai`

### Containerization

- Slim Dockerfile, non-root user, healthcheck
- `docker-compose.debug.yml` with debugpy and auto-reload
- `infra/docker-compose.yml` for local backing services

### AI infrastructure (when enabled)

- Strategy + Registry pattern — providers are hot-swappable via env vars
- 2 gateways, 6 embedding providers, 5 vector stores
- Pinned dependency versions injected into `pyproject.toml`
- Vector store collection names are whitelist-validated (SQL-injection safe)
- Vector queries use parameter binding, not string interpolation
- pgvector / opensearch / qdrant honor `AI_EMBEDDING_DIMENSIONS` (no hardcoded 1536)
- Synchronous SDK calls (chromadb, qdrant, opensearch, bedrock, huggingface) wrapped in `asyncio.to_thread`
- Vertex AI stubs raise `NotImplementedError` instead of returning silent success

## What the developer must add

These are intentional scope boundaries:

- Tenant / API-key authentication
- Per-tenant data isolation
- Domain-specific business logic
- Rate limiting and quota enforcement
- Long-term observability backend (OTel collector, exporter, dashboards)
- CI/CD secrets and environment-specific config
- Production database migrations and seeding

## Validation checklist

Run after every generation:

```bash
python3 -m pip install -e ".[dev]"
python3 -m pytest tests/
python3 -m compileall app
python3 -m uvicorn app.main:app --port 8000     # then curl /health
fastforge doctor
```

If any of these fail, do not ship.

## CVE and audit

```bash
fastforge audit                # capability drift + CVE scan
fastforge secure scan          # Trivy on Docker image
fastforge secure sbom          # CycloneDX SBOM
```

## Cloud Run guidance for ML/search workloads

- Use async client SDKs and a single instance per provider held by lifespan
- Start at concurrency `250`, tune by p95 latency and error rate
- Use Serverless VPC connector + private egress for Vertex AI
- Keep Cloud Run region aligned with Vertex resources

## Known limitations

- `fastforge upgrade` is a stub for first-version projects (no deltas yet)
- Web playground not yet available
- No first-party Stripe / Clerk / Langfuse plugins yet
- No `fastforge ship` one-command deploy yet (deploy commands generate manifests only)

These are tracked on the roadmap.
