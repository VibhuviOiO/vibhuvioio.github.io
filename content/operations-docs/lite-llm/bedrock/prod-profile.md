---
title: AWS Bedrock — Prod Profile
description: The same Bedrock model list, now in three-service production shape — Postgres for the admin UI and virtual keys, Redis for the response cache, healthchecks, IAM-role-ready auth, and an honest gap table.
duration: "45m"
readingTime: "15m"
labTime: "30m"
order: 2
---

## Project Files

```project
name: lite-llm-prod-bedrock
docker-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/prod-bedrock/docker-compose.yml
litellm_config.yaml: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/prod-bedrock/litellm_config.yaml
env.example: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/prod-bedrock/env.example
```

---

## What "production-grade" means here

This stack is **production-grade in shape**. Three-service topology that mirrors how LiteLLM is designed to run in production. Healthchecks on every service. `depends_on` with `condition: service_healthy`. Cache wired in. Admin UI working with model management persisted in Postgres.

It is **ready for internal-network deployment** as soon as you:

- Swap the local `~/.aws` mount for an instance/task IAM role
- Source the master key from a secret manager
- Put a reverse proxy in front for TLS

It is **NOT** internet-facing on day one. There is no TLS, no secret manager, no Postgres backup story in this Compose file. Those belong to your environment, not to this repo.

The honest version of "production-grade" is a checklist with two columns. This lesson fills the left column. The right column is environment-specific.

---

## What's actually production-grade in the box

**Three-service topology with proper dependency ordering.** Postgres and Redis come up first. Both expose healthchecks. LiteLLM `depends_on` them with `condition: service_healthy`, so the gateway never starts before its dependencies are ready. LiteLLM itself has a healthcheck against `/health/liveliness` with a 90s `start_period` to absorb first-boot Prisma migrations.

**Model management in the UI.** `STORE_MODEL_IN_DB=True` makes the admin UI write model edits to Postgres instead of the YAML file. You can add, edit, or remove a model without redeploying the container. The YAML becomes the bootstrap; the UI becomes the operating surface.

**Virtual keys and budgets.** Each downstream team or application gets its own key, scoped to specific models, with monthly budget caps and TPM/RPM rate limits. The master key in `.env` is the **operator** key — it is not the key your applications use.

**Bedrock auth that lifts cleanly to the cloud.** Locally, `~/.aws:/root/.aws:ro` is mounted in. In production, you delete the mount and the EC2 instance profile / ECS task role / EKS IRSA takes over automatically — `boto3` finds the role itself. **No config changes.**

**Response cache.** `cache: true` with Redis-backed storage cuts duplicate Bedrock invocation cost and latency on workloads with repeated prompts (eval harnesses, batch enrichment, retry loops).

**Honest log volume.** `set_verbose: false`. The dev profile is loud on purpose; this one is not.

---

## What is explicitly NOT here

The honest gap list, with where to add each item:

| Gap | Why it matters | Where to add it |
|-----|----------------|-----------------|
| TLS termination | Bearer tokens cannot ride over plain HTTP in public networks | Reverse proxy (Nginx, Caddy, ALB, Cloudflare) in front |
| Secret management | `LITELLM_MASTER_KEY` in `.env` is a laptop pattern | AWS Secrets Manager / SSM / Vault, sourced at deploy |
| Postgres backups | The `postgres_data` volume is your only copy | RDS snapshots, or `pg_dump` cron + offsite |
| Resource limits | Compose has none; a runaway call can OOM the host | `deploy.resources.limits` (Swarm) or k8s requests/limits |
| Network policy | Postgres/Redis are reachable from any container on the network | Bind to an internal-only network |
| Observability | You will fly blind during the first incident | Ship logs to your aggregator; expose Prometheus |
| Per-key rate limit defaults | UI supports it, but no defaults are seeded | Set TPM/RPM and monthly budget when minting each key |
| Guardrails (PII, prompt injection) | Not wired in | LiteLLM guardrails section, or pre/post middleware |

If your "production" is internal-network deployment behind your existing ingress and IAM, this stack is ready as soon as you handle TLS, secrets, and the IAM-role swap. If your "production" is internet-facing customer endpoints, the table above is the remaining checklist.

> **Security:** Neither version of that answer is shameful. It is just specific to your environment.

---

## Deploy

```bash
cp env.example .env

docker compose --env-file .env -f docker-compose.yml up -d
```

> **Tip:** First boot runs Prisma migrations. The `litellm` healthcheck has a 90-second `start_period` to absorb that. Expect `(health: starting)` for the first minute.

Check all three services are healthy:

```bash
docker ps --filter name=lite-llm-prod-bedrock
```

```text
lite-llm-prod-bedrock              Up (healthy)
lite-llm-prod-bedrock-postgres     Up (healthy)
lite-llm-prod-bedrock-redis        Up (healthy)
```

---

## The five-step test sequence

Each step answers one specific question. The first one that fails tells you which layer broke.

```bash
set -a
source .env
set +a
```

### 1. Did the gateway parse the config?

```bash
curl "http://localhost:${LITELLM_PORT:-4003}/v1/models" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

### 2. Does Bedrock chat work? (also proves credentials, IAM, region simultaneously)

```bash
curl "http://localhost:${LITELLM_PORT:-4003}/v1/chat/completions" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Reply: prod Bedrock works."}]
  }'
```

### 3. Does embedding access work? (separate model-access toggle)

```bash
curl "http://localhost:${LITELLM_PORT:-4003}/v1/embeddings" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-3-large",
    "input": "prod Bedrock embedding test"
  }'
```

### 4. Does Redis cache observably reduce latency on the second call?

Repeat step 2. Compare wall time on the first and second response. With cache enabled, the second call returns in tens of milliseconds.

```bash
time curl -s "http://localhost:${LITELLM_PORT:-4003}/v1/chat/completions" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role":"user","content":"deterministic prompt for cache test"}]
  }' > /dev/null
```

### 5. Does the gateway think upstream is healthy?

```bash
curl "http://localhost:${LITELLM_PORT:-4003}/health" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

When all five pass, you have a Bedrock gateway an internal team can start hitting today.

---

## Lab: Issue your first virtual key

Open the admin UI:

```text
http://localhost:4003/ui/
```

Log in with `LITELLM_MASTER_KEY` (used as both username and password).

1. **Virtual Keys** → **+ Create New Key**
2. Set `models` → `gpt-4o-mini`
3. Set `max_budget` → `5` (USD) and `budget_duration` → `monthly`
4. Set `tpm_limit` → `10000`, `rpm_limit` → `60`
5. Generate. Copy the key (it's only shown once).

Test the new key — *not* the master key:

```bash
curl "http://localhost:4003/v1/chat/completions" \
  -H "Authorization: Bearer <virtual-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role":"user","content":"Hello from a virtual key."}]
  }'
```

Now you have:

- An operator key (master) you keep
- An application key (virtual) you hand to a team — scoped, budgeted, rate-limited

That separation is the whole point of running Postgres alongside the gateway.

---

## Adding a real fallback partner

The shipped config has the fallback block commented because the dev/prod sample only has one chat model and one embedding model. When your team approves a second chat model (e.g. Claude Haiku) and a second embedding model (e.g. Cohere Embed), uncomment and wire:

```yaml
router_settings:
  routing_strategy: simple-shuffle
  num_retries: 2
  timeout: 30
  fallbacks:
    - gpt-4o-mini: [bedrock-claude-haiku]
    - text-embedding-3-large: [bedrock-cohere-embed]
```

> **Warning:** Self-referential fallbacks like `gpt-4o-mini: [gpt-4o-mini]` are no-ops. Don't ship them — they make you think you have fallback when you don't.

---

## Promoting to a real server

When this moves from a laptop to a real environment, the changes are localized:

1. Swap `~/.aws:/root/.aws:ro` for an EC2 instance profile / ECS task role / EKS IRSA. `boto3` finds the role automatically — no app or config change.
2. Source `LITELLM_MASTER_KEY` and `POSTGRES_PASSWORD` from your secret manager at deploy time, not from a checked-in `.env`.
3. Put Nginx, Caddy, or an ALB in front for TLS termination.
4. Move Postgres to RDS (or your managed Postgres) for backups and HA.
5. Move Redis to ElastiCache (or your managed Redis) for failover.
6. Ship LiteLLM logs to your aggregator and expose Prometheus metrics. LiteLLM has built-in exporters — enable them in `litellm_settings`.

The compose file, the config file, the alias structure, and the admin UI **stay the same shape**. That is the entire reason to validate this stack locally first.

---

## Why this matters for platform teams

The hardest part of LLM infrastructure in 2026 is not picking a model. It is **operating model access as infrastructure**: optionality, fallback, spend control, observability, provider swaps without app rewrites, per-team isolation without per-team accounts at the provider.

This is the smallest local stack where you can practice all of those at once:

- **Optionality** — aliases mean swapping `gpt-4o-mini` from Nova Micro to Claude Haiku is a UI edit, not a deploy
- **Fallback** — the YAML shape is ready; just point each alias at a real second model
- **Spend control** — virtual keys + per-key budgets + per-key TPM/RPM
- **Observability** — the admin UI shows per-key spend, request counts, errors
- **Provider swap** — apps speak OpenAI; the gateway speaks Bedrock; tomorrow it speaks something else without the apps noticing
- **Per-team isolation** — every team gets a virtual key against the same Bedrock account; no per-team AWS accounts needed

If you can run those reliably here, the production deploy is bookkeeping.

---

## Next Steps

- [Use Cases — What's Next](../use-cases/roadmap) — cost governance, semantic cache, observability, guardrails, multi-tenancy, and the gap list of what real platform teams hit in the first 90 days
