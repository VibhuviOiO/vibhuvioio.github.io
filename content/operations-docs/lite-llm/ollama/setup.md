---
title: Local Gateway with Ollama
description: Deploy LiteLLM + Ollama in Docker Compose with a deliberately broken alias to prove fallback recovery — no cloud keys required.
duration: "35m"
readingTime: "10m"
labTime: "25m"
order: 1
---

## Project Files

```project
name: lite-llm-ollama
docker-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/ollama/docker-compose.yml
litellm_config.yaml: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/ollama/litellm_config.yaml
env.example: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/ollama/env.example
```

---

## What you're running

Four kinds of containers, no cloud credentials:

- **LiteLLM proxy** — OpenAI-compatible API and admin UI on port `4001`
- **Ollama** — runs local open-source models
- **Postgres** — required for the LiteLLM admin UI
- **Model pull jobs** — download tiny Ollama models, then exit

Model aliases the gateway exposes:

| Alias | Backing model | Purpose |
|-------|----------------|---------|
| `local-free-chat` | `ollama_chat/qwen2.5:0.5b` | Primary local model |
| `local-tiny-chat` | `ollama_chat/smollm2:135m` | Secondary fallback model |
| `local-dummy-chat` | `ollama_chat/not-a-real-model` | Intentionally broken — proves fallback |
| `gpt-4o-mini` | `ollama_chat/qwen2.5:0.5b` | Alias trick — drop-in for OpenAI clients |

The dummy model exists to fail. That is the point — it lets you prove fallback works without waiting for a real outage.

---

## What this is NOT

- Not a production deployment — no TLS, no secret manager, no rate limiting, no autoscaling
- Not a benchmark — models are intentionally tiny so the demo starts fast on a laptop
- Not a replacement for a managed provider — it's the learning shape that makes the managed provider easier to debug later

If you want the production shape, that's [Phase 6 — Bedrock Prod Profile](../bedrock/prod-profile).

---

## Deploy

1. Use **Download All** in the Project Files section above to save all three files into a new folder, e.g. `lite-llm-ollama/`
2. Copy `env.example` to `.env` and adjust the master key if you like
3. Open a terminal in that folder

```bash
cp env.example .env

docker compose --env-file .env -f docker-compose.yml down --remove-orphans
docker compose --env-file .env -f docker-compose.yml up -d
```

> **Tip:** Use `down --remove-orphans` after changing one-off model pull services. Do **not** add `-v` unless you intentionally want to remove downloaded Ollama model data.

Watch the containers come up:

```bash
docker ps -a
```

A healthy run should look roughly like this:

```bash
lite-llm-ollama-proxy             Up (running)
lite-llm-ollama                   Up (healthy)
lite-llm-ollama-postgres          Up (healthy)
lite-llm-ollama-pull-primary      Exited (0)
lite-llm-ollama-pull-secondary    Exited (0)
```

> **Note:** The pull containers are supposed to exit with code `0`. They are setup jobs, not long-running services.

---

## Verify the model aliases

```bash
set -a
source .env
set +a

curl "http://localhost:${LITELLM_PORT:-4001}/v1/models" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

Expected — four aliases loaded from the config:

```text
local-free-chat
local-tiny-chat
local-dummy-chat
gpt-4o-mini
```

> **Note:** `/v1/models` only proves LiteLLM parsed the config. It does **not** prove any provider works yet — that's the next call.

---

## Lab 1: Real model works

```bash
curl "http://localhost:${LITELLM_PORT:-4001}/v1/chat/completions" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "local-free-chat",
    "messages": [
      {"role": "user", "content": "Reply with one short sentence: LiteLLM local works."}
    ]
  }'
```

The end-to-end path proven by this call:

```text
curl ──► LiteLLM ──► Ollama ──► qwen2.5:0.5b
```

---

## Lab 2: Fallback on purpose

Now call the broken alias:

```bash
curl "http://localhost:${LITELLM_PORT:-4001}/v1/chat/completions" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "local-dummy-chat",
    "messages": [
      {"role": "user", "content": "Say fallback worked in one short sentence."}
    ]
  }'
```

`local-dummy-chat` points at `ollama_chat/not-a-real-model`, so the first hop always fails. LiteLLM then walks the configured fallback list:

```yaml
router_settings:
  num_retries: 0
  fallbacks:
    - local-dummy-chat: [local-free-chat, local-tiny-chat]
```

A successful response shows the *actual* fallback model in the `model` field:

```json
{
  "model": "ollama_chat/qwen2.5:0.5b",
  "choices": [ { "message": { "content": "Fallback worked." } } ]
}
```

> **Lab:** You asked for `local-dummy-chat`. The gateway answered with `qwen2.5:0.5b`. That is the moment the gateway earned its job.

`num_retries: 0` is set deliberately for the learning path so failures move to fallback immediately. In production you might choose differently.

---

## Lab 3: Open the LiteLLM admin UI

The UI is at:

```text
http://localhost:4001/ui/
```

Use the `LITELLM_MASTER_KEY` value from `.env` as the password.

> **Note:** One subtle lesson — the API can answer without Postgres, but the LiteLLM **UI/admin features** need a database. That's why this local stack includes Postgres even though the simplest API-only proxy does not strictly need it.

In the UI, the model health table may initially show:

```text
Health Status: none
Last Check:    None
Last Success:  None
```

That doesn't mean the models are healthy or unhealthy — it means health checks haven't run yet. Trigger one from the UI. The real aliases should succeed. The dummy alias may fail when checked directly, while the API fallback test still recovers. Both behaviors are correct.

---

## Common Issues

### Pull containers stuck in `Created`

The Ollama daemon takes a moment to become healthy. The pull jobs wait on `condition: service_healthy`. Give it 10–30 seconds and re-run `docker ps -a`.

### `connection refused` from LiteLLM to Ollama

```bash
docker compose logs ollama
```

If Ollama crashed during model download (out-of-memory on a small laptop), drop one of the models:

```bash
# In .env — remove the secondary model
OLLAMA_MODEL_SECONDARY=
```

Then restart.

### Health checks all fail in the UI

The health check calls the underlying provider. For `local-dummy-chat` that returns an error because the model genuinely doesn't exist — that is expected. The API fallback path still works.

---

## Next Steps

- [Provider Smoke Tests](../providers/smoke-tests) — prove free-tier provider keys directly, before wiring the gateway
