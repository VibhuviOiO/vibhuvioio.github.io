---
title: AWS Bedrock — Dev Profile
description: One container, ~/.aws mounted read-only, four short curls that isolate config / chat / embeddings / health — prove Bedrock reachability before adding any platform on top.
duration: "30m"
readingTime: "10m"
labTime: "20m"
order: 1
---

## Project Files

```project
name: lite-llm-dev-bedrock
docker-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/dev-bedrock/docker-compose.yml
litellm_config.yaml: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/dev-bedrock/litellm_config.yaml
env.example: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/dev-bedrock/env.example
```

---

## Why a separate dev profile

Most Bedrock setup pain has nothing to do with LiteLLM — it is AWS-side. The common failure modes:

- IAM identity has no `bedrock:InvokeModel` permission
- Model access not requested or approved in the Bedrock console
- The region you're calling does not host the model you picked
- Credentials missing, expired, or scoped to a different account
- AWS SSO session timed out and the host stopped refreshing credentials

If you add Postgres, Redis, fallbacks, and an admin UI on top of all of that on day one, the failure surface is roughly five times wider. You stop being able to answer the simple question, *"is Bedrock reachable from this container right now?"*

This dev profile strips every non-essential layer. **One container. One config. Four curls.** If any of them fails, you know exactly which layer to fix.

---

## What you're running

A single container, with your local AWS credentials mounted read-only:

- `litellm` — the LiteLLM proxy on `http://localhost:4002`, `~/.aws` mounted at `/root/.aws:ro`

No Postgres. No Redis. No volumes. No model pull jobs. No UI.

Two model aliases, named on purpose to match OpenAI client defaults:

| Alias | Backing Bedrock model | Why this alias |
|-------|------------------------|----------------|
| `gpt-4o-mini` | `bedrock/amazon.nova-micro-v1:0` | Drop-in for code already calling `gpt-4o-mini` |
| `text-embedding-3-large` | `bedrock/amazon.titan-embed-text-v2:0` | Drop-in for code already calling `text-embedding-3-large` |

The alias renaming is a small detail with a big payoff: code that already calls OpenAI keeps working unchanged once `base_url` and the auth token point at this gateway.

---

## What this is NOT

- Not a production deployment — no TLS, no rate limiting, no secret manager, no autoscaling
- Not a benchmark — Nova Micro is picked because it's cheap and fast to invoke
- Not a replacement for the production stack — it's the smaller stack you debug *first* so the production stack only has to fight its own bugs

The production shape is the next phase: [Bedrock Prod Profile](./prod-profile).

---

## Dev vs prod — what actually differs

The Bedrock side is identical between the two profiles. Same model entries, same `aws_region_name`, same `~/.aws` mount, same auth flow. Everything that differs is platform infrastructure **around** the gateway:

| Concern | dev-bedrock (this lesson) | prod-bedrock |
|---------|--------------------------|--------------|
| Port | `4002` | `4003` |
| Services | `litellm` only | `litellm` + `postgres` + `redis` (both healthchecked) |
| Admin UI (`/ui/`) | Not available (needs Postgres) | Available |
| Virtual keys / budgets | Not available | Available |
| Response cache | Off | On, Redis-backed |
| `num_retries` | `1` | `2` |
| `fallbacks` | None | Declared in `router_settings` |
| `set_verbose` | `true` (loud logs for debug) | `false` (quieter logs) |
| Volumes | None | `postgres_data`, `redis_data` |
| AWS auth | `~/.aws:/root/.aws:ro` | Same |

This table is the most useful thing in the dev/prod split. If a Bedrock call fails in **prod** but works in **dev**, the bug is in the surrounding infrastructure. If it fails in **dev**, the bug is AWS-side.

---

## Deploy

1. **Download All** the project files into a new folder
2. Make sure `~/.aws` exists with a working profile on your host
3. Copy `env.example` to `.env` — change `LITELLM_MASTER_KEY` to something strong

```bash
cp env.example .env

docker compose --env-file .env -f docker-compose.yml up -d
```

You should see one container running:

```bash
docker ps --filter name=lite-llm-dev-bedrock
```

```text
CONTAINER ID   IMAGE                              STATUS
abc123         ghcr.io/berriai/litellm:main-stable   Up
```

---

## The four curls that isolate each layer

Each call answers one question. **Run them in order.** The first one that fails tells you which layer is broken.

### 1. Did LiteLLM parse the config?

```bash
set -a
source .env
set +a

curl "http://localhost:${LITELLM_PORT:-4002}/v1/models" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

Expected — a JSON object listing `gpt-4o-mini` and `text-embedding-3-large`.

If this fails, the gateway never started cleanly. Read `docker compose logs -f litellm`. It is almost always a YAML mistake in `litellm_config.yaml` or a missing env variable.

> **Note:** This call does **not** prove AWS works — only that the config file loaded.

### 2. Does Bedrock chat actually work?

```bash
curl "http://localhost:${LITELLM_PORT:-4002}/v1/chat/completions" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Reply with one short sentence: Bedrock works."}
    ]
  }'
```

A successful response proves three things at once:

- AWS credentials are mounted into the container
- IAM allows `bedrock:InvokeModel` on Nova Micro
- The region you set hosts Nova Micro

If it fails here, jump to the failure-mode checklist below **before** touching any LiteLLM setting.

### 3. Do Bedrock embeddings work?

```bash
curl "http://localhost:${LITELLM_PORT:-4002}/v1/embeddings" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-3-large",
    "input": "LiteLLM dev Bedrock embedding test"
  }'
```

> **Security:** Embedding access is a **separate** model-access toggle in the Bedrock console. This call can fail even when chat already works. That's a common surprise.

### 4. Does the gateway think the providers are healthy?

```bash
curl "http://localhost:${LITELLM_PORT:-4002}/health" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

`/health` does a minimal upstream probe per model. Treat this as the single-shot sanity check before pointing an application at the gateway.

---

## The seven Bedrock failure modes — ordered by likelihood

When `/v1/models` returns `200` but chat or embeddings fail, the bug is almost always one of these. Walk them in order:

1. **Credentials not mounted.** Inside the container:
   ```bash
   docker exec -it lite-llm-dev-bedrock ls /root/.aws
   ```
   If empty, the host `~/.aws` is missing or the volume mount failed.

2. **Wrong profile.** The container reads `AWS_PROFILE` from `.env`. If your host uses a non-default profile, set it explicitly.

3. **Expired SSO / STS credentials.** If you use AWS SSO:
   ```bash
   aws sso login --profile default
   docker compose restart litellm
   ```

4. **Missing IAM permission.** Attach a policy granting `bedrock:InvokeModel` (and `bedrock:InvokeModelWithResponseStream` if you plan to stream) on the specific model ARNs.

5. **Model access not granted.** AWS Console → Bedrock → Model access → request and wait for approval for Nova Micro and Titan Embed v2.

6. **Wrong region.** Not every Bedrock model is in every region:
   ```bash
   aws bedrock list-foundation-models --region us-east-1
   ```

7. **Region mismatch between env vars.** LiteLLM reads `AWS_REGION_NAME`. The AWS SDK also looks at `AWS_REGION` and `AWS_DEFAULT_REGION`. This compose sets both `AWS_REGION_NAME` and `AWS_REGION` — keep them aligned.

> **Lab:** Only after all seven check out is it worth reading verbose LiteLLM logs.

---

## Why this matters for platform teams

The dev profile is where you build the **muscle** for AI infrastructure. It is the smallest place where you can:

- Prove AWS Bedrock reachability without a Postgres dependency
- Prove the OpenAI-compatible alias trick does what existing client code expects
- Iterate on `litellm_config.yaml` quickly — restart in two seconds, re-run four curls

Then, when you graduate to the production-shape stack with Postgres, Redis, fallbacks, virtual keys, and the admin UI, you do not have to ask, *"is Bedrock the problem?"* That question is already answered.

---

## Next Steps

- [AWS Bedrock — Prod Profile](./prod-profile) — same Bedrock model list, now wrapped in Postgres + Redis + admin UI + virtual keys + response cache
