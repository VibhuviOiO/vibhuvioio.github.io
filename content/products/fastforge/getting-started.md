# Getting Started

FastForge is a production-grade FastAPI project generator. You go from `pip install` to a running, dockerized API in under two minutes.

## 1. Install

```bash
pip install fastforge-cli
```

Verify:

```bash
fastforge --help
```

If the `fastforge` binary is not on your PATH, run via the interpreter:

```bash
python3 -m fastforge.cli --help
```

## 2. Create your first project

```bash
fastforge new
```

Pick:

- Project kind: standalone
- Cache: redis (recommended)
- Logging: structlog + json + stdout
- Docker: yes (+ debug)

Optional — AI capabilities:

- AI app kind: semantic_search
- Gateway: litellm
- Embeddings: openai / gemini / bedrock
- Vector store: vertex_ai / chromadb / pgvector / qdrant / opensearch

## 3. Run locally (no virtualenv needed)

```bash
cd <your-project>
docker compose -f docker-compose.debug.yml up --build
```

Open:

- http://localhost:8000/docs
- http://localhost:8000/health

## 4. Run with a virtualenv

```bash
python3 -m pip install -e ".[dev]"
python3 -m pytest tests/
python3 -m uvicorn app.main:app --reload --port 8000
```

## 5. Validate the generated app

```bash
python3 -m compileall app
python3 -m pytest tests/ --tb=short
fastforge doctor
```

## 6. Evolve

```bash
fastforge add model order
fastforge add postgres
fastforge add observability
fastforge ci github
fastforge deploy k8s
```

That is it — you now have a SOLID FastAPI service with logging, Docker, tests, and an evolution path.
