---
title: Multi-Provider Free Gateway
description: Five hosted free-tier providers behind one OpenAI-compatible endpoint, with declared fallback chains, per-request overrides, streaming fallback, and an opt-in chat UI.
duration: "40m"
readingTime: "15m"
labTime: "25m"
order: 1
---

## Project Files

```project
name: lite-llm-free-models
docker-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/free-models-gateway/docker-compose.yml
litellm_config.yaml: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/free-models-gateway/litellm_config.yaml
env.example: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/free-models-gateway/env.example
```

---

## What you're running

One LiteLLM container exposes six model aliases on port `4004`. One optional Open WebUI container (gated by a Compose profile) exposes a chat UI on port `3004`.

| Alias | Provider | Model |
|-------|----------|-------|
| `free-chat` | Gemini | `gemini-2.5-flash` (primary route) |
| `free-chat-groq` | Groq | `llama-3.3-70b-versatile` |
| `free-chat-openrouter` | OpenRouter | `openai/gpt-oss-20b:free` |
| `free-chat-cloudflare` | Cloudflare Workers AI | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |
| `free-chat-huggingface` | Hugging Face | `Qwen/Qwen2.5-7B-Instruct` |
| `free-dummy-chat` | (broken on purpose) | `gemini/not-a-real-model` |

Apps call `free-chat` only. The gateway decides whether it lands on Gemini, Groq, OpenRouter, Cloudflare, or HF — and the per-provider aliases exist for pinning when you want to.

---

## What this is NOT

- Not production — no TLS, no rate limiting, no secret manager
- Not a multi-region SLO — fallback hides single-provider hiccups, not a global outage of all five
- Not a benchmark — no quality, latency, or cost comparison here
- Not a "best free model" guide — these are common free-tier defaults that happen to work today

Production shape (virtual keys, budgets, cache, observability) is covered in [Phase 6 — Bedrock Prod Profile](../bedrock/prod-profile).

---

## The routing config that does the work

```yaml
router_settings:
  routing_strategy: simple-shuffle
  num_retries: 1
  timeout: 60
  fallbacks:
    - free-chat: [free-chat-groq, free-chat-openrouter, free-chat-cloudflare, free-chat-huggingface]
    - free-dummy-chat: [free-chat, free-chat-groq, free-chat-openrouter, free-chat-cloudflare, free-chat-huggingface]
```

Routing lives in YAML, not in application code. That is the whole point of an AI gateway.

---

## Deploy

1. **Download All** the project files into a new folder
2. Copy `env.example` to `.env` and fill in the provider keys you proved in [Phase 3](../providers/smoke-tests)
3. Start the gateway:

```bash
cp env.example .env

docker compose --env-file .env -f docker-compose.yml up -d
```

> **Tip:** Only fill in the providers you have keys for. The gateway boots even with subset keys — the aliases for missing providers will fail at call-time, not at startup.

Verify the alias list:

```bash
set -a
source .env
set +a

curl "http://localhost:${LITELLM_PORT:-4004}/v1/models" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

Expected — six entries:

```text
free-chat
free-chat-groq
free-chat-openrouter
free-chat-cloudflare
free-chat-huggingface
free-dummy-chat
```

> **Note:** `/v1/models` only proves the config loaded. It does **not** prove any provider key works. That's the next call.

---

## Lab 1: Pin a single provider

Each provider-specific alias bypasses the routing pool and pins the request to that one provider. Useful for debugging, cost control, licence choice, or comparing answers across providers.

```bash
curl "http://localhost:${LITELLM_PORT:-4004}/v1/chat/completions" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "free-chat-cloudflare",
    "messages": [{"role": "user", "content": "Reply in one sentence: pinned to Cloudflare."}]
  }'
```

Repeat for each provider you have a key for. The cheap, boring proof that the gateway can reach each one.

---

## Lab 2: Fallback via the dummy alias

`free-dummy-chat` points at a model name Gemini will reject. The first hop always fails, and the router walks the fallback list until something answers.

```bash
curl "http://localhost:${LITELLM_PORT:-4004}/v1/chat/completions" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "free-dummy-chat",
    "messages": [{"role": "user", "content": "Say fallback worked in one sentence."}]
  }'
```

A successful response shows the underlying provider model that actually answered, in the `model` field. The client never had to know the first route failed.

---

## Lab 3: Fallback on a healthy route — `mock_testing_fallbacks`

The dummy alias works once. The cleaner pattern for demos, talks, and CI is the request-time flag — it forces the primary to fail on an otherwise-healthy route, with no config change:

```bash
curl "http://localhost:${LITELLM_PORT:-4004}/v1/chat/completions" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "free-chat",
    "mock_testing_fallbacks": true,
    "messages": [{"role": "user", "content": "Say second provider answered in one sentence."}]
  }'
```

You can also override the fallback list per request:

```bash
curl "http://localhost:${LITELLM_PORT:-4004}/v1/chat/completions" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "free-chat",
    "fallbacks": ["free-chat-groq"],
    "mock_testing_fallbacks": true,
    "messages": [{"role": "user", "content": "Say Groq answered in one sentence."}]
  }'
```

The per-request override wins over the YAML default.

---

## Lab 4: Streaming still falls back

Same flag, with `stream: true`:

```bash
curl -N "http://localhost:${LITELLM_PORT:-4004}/v1/chat/completions" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "free-chat",
    "stream": true,
    "mock_testing_fallbacks": true,
    "messages": [{"role": "user", "content": "stream one short sentence about fallback"}]
  }'
```

You'll get standard SSE `data: {...}` chunks ending in `data: [DONE]`, served by a fallback provider — even though the primary was forced to fail before the first chunk.

> **Warning:** What this does **not** do — mid-stream provider switch after chunks have already started flowing. Once a provider has sent its first token, the request stays on that provider. That's a fair and intentional limit.

---

## Two UIs, two different questions

```text
http://localhost:4004/ui/     LiteLLM admin UI    "is the gateway healthy?"
http://localhost:3004         Open WebUI chat     "can a human actually chat through it?"
```

### LiteLLM admin UI

The proxy serves its own admin UI at `/ui/`. Log in with the master key (used as both username and password). With Postgres in this stack, the UI shows:

- The six aliases from `/v1/models`
- A Test Key playground for one-off chat calls against any alias
- Request logs for the running process
- Virtual key management (covered in detail in [Phase 6](../bedrock/prod-profile))

### Open WebUI chat — opt-in via Compose profile

Open WebUI is a ChatGPT-style browser UI. It's wired under a `ui` profile so the default `docker compose up -d` stays lean:

```bash
docker compose --env-file .env --profile ui up -d
```

Open [http://localhost:3004](http://localhost:3004). The model picker auto-discovers every alias from the gateway's `/v1/models`. In one window you can:

- Pick `free-chat` for smart routing with fallback
- Pick any `free-chat-<provider>` to pin one provider
- Pick `free-dummy-chat` and watch the chat reply normally even though the first hop failed inside the gateway

This UI is "can a human actually chat through this and feel the fallback recovery for themselves." Demoing fallback by `curl` is fine for engineers — demoing it in a chat window is what makes a stakeholder nod.

---

## Common Issues

### Open WebUI shows `unhealthy` but the page works

The Open WebUI image ships a healthcheck that assumes auth is on. With `WEBUI_AUTH=False` (the default here for friction-free local testing) the probe can fail even though the UI serves HTTP 200. Ignore the healthcheck status — load the page and confirm directly.

### `Provider NotFoundError` on `free-chat-cloudflare`

You set `CLOUDFLARE_API_TOKEN` but not `CLOUDFLARE_ACCOUNT_ID`. Both are required.

### `free-chat` keeps landing on the same provider

`routing_strategy: simple-shuffle` is random per-request, not round-robin. Across many requests the load spreads. Across a handful of requests it can look sticky.

### `408 Timeout` from Hugging Face

Free HF inference has cold starts. Re-run, or remove HF from the fallback chain for demos.

---

## Next Steps

- [AWS Bedrock — Dev Profile](../bedrock/dev-profile) — the smallest verifiable enterprise-cloud setup, with the four curls that isolate every failure mode
