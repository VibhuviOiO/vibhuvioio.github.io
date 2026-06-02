# AI Cost Recipes

Concrete recipes you can run after `fastforge add ai-telemetry`. These all assume the collector stack is up (`docker compose -f infra/docker-compose.otel.yml up -d`) and your app is emitting spans with `ai.cost_usd`, `ai.tenant_id`, `gen_ai.system`, and `gen_ai.request.model`.

## Recipe 1 — Per-tenant spend dashboard in Grafana

**Goal**: see USD spent per tenant, last 24h, broken down by model.

**Setup**: derive a metric from the span attribute using the OTel collector's `spanmetrics` connector. Add this to your `infra/otel/otel-collector.yaml`:

```yaml
connectors:
  spanmetrics:
    histogram:
      explicit:
        buckets: [0.001, 0.01, 0.1, 1.0]
    dimensions:
      - name: ai.tenant_id
      - name: gen_ai.system
      - name: gen_ai.request.model
    exemplars:
      enabled: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/tempo, spanmetrics]
    metrics:
      receivers: [spanmetrics]
      processors: [batch]
      exporters: [prometheus]
```

**Promql** (in Grafana):

```promql
sum by (ai_tenant_id, gen_ai_request_model) (
  rate(ai_cost_usd_total[24h])
) * 86400
```

Pivot table = tenants × models × $/day. Ship to your finance team weekly.

## Recipe 2 — Alert when a tenant burns > $50/hour

**Goal**: page the on-call when one customer's LLM usage spikes.

```yaml
# infra/otel/prometheus.yml
groups:
  - name: ai-cost
    rules:
      - alert: TenantSpendSpike
        expr: |
          sum by (ai_tenant_id) (
            rate(ai_cost_usd_total[5m])
          ) * 3600 > 50
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Tenant {{ $labels.ai_tenant_id }} burning > $50/hr"
          description: "Current rate {{ $value | humanize }} USD/hr"
```

Wire Alertmanager to Slack/PagerDuty. The first time you see this fire, you'll thank yourself.

## Recipe 3 — Find your 10 most expensive code paths

**Goal**: which endpoint generates the most LLM spend? Often surprising.

**Tempo TraceQL**:

```traceql
{ span.ai.cost_usd > 0 }
| sum_over_time(span.ai.cost_usd) by (span.name, resource.service.name)
| topk(10)
```

Run weekly. The output usually identifies one runaway loop you forgot about.

## Recipe 4 — Daily cost report email

**Goal**: email a PDF every morning with yesterday's spend by tenant.

Quick & dirty cron in your app:

```python
# app/jobs/daily_cost_report.py
from datetime import date, timedelta
import httpx

async def run():
    q = """
    sum by (ai_tenant_id) (
      increase(ai_cost_usd_total[24h])
    )
    """
    async with httpx.AsyncClient() as c:
        r = await c.get(
            "http://prometheus:9090/api/v1/query",
            params={"query": q},
        )
    rows = r.json()["data"]["result"]
    rows.sort(key=lambda x: float(x["value"][1]), reverse=True)

    body = f"Date: {date.today() - timedelta(days=1)}\n\n"
    body += "\n".join(
        f"{row['metric']['ai_tenant_id']:30s} ${float(row['value'][1]):>10.2f}"
        for row in rows
    )
    await send_email("finance@company.com", "AI spend yesterday", body)
```

## Recipe 5 — Chargeback / showback

**Goal**: bill customers for AI usage at margin.

```sql
-- Run nightly against Prometheus (or your TSDB of choice)
SELECT
  ai_tenant_id          AS customer_id,
  SUM(ai_cost_usd_total) AS raw_cost_usd,
  SUM(ai_cost_usd_total) * 1.30 AS billed_usd  -- 30% margin
FROM ai_cost_usd_total
WHERE date = CURRENT_DATE - 1
GROUP BY ai_tenant_id;
```

Push to your billing system (Stripe metered usage, Lago, Orb). With `ai-telemetry` tagging every span with `ai.tenant_id`, your chargeback story is one query away — no separate accounting layer needed.

## Recipe 6 — Cost cap per request

**Goal**: prevent a single agent run from burning $500.

```python
# app/ai/middleware/cost_cap.py
from app.ai.telemetry.spans import ai_span
from contextvars import ContextVar

_request_cost = ContextVar[float]("request_cost", default=0.0)
COST_CAP_USD = 5.0

class CostCapExceeded(Exception): ...

async def record_cost(usd: float) -> None:
    new_total = _request_cost.get() + usd
    _request_cost.set(new_total)
    if new_total > COST_CAP_USD:
        raise CostCapExceeded(f"Request exceeded ${COST_CAP_USD}")
```

Hook into `ai_span`'s `__exit__` to call `record_cost(span.attributes["ai.cost_usd"])`. The next LLM call in the request will refuse to start.

## Recipe 7 — Compare two gateway providers, side by side

**Goal**: prove which provider is cheaper for YOUR workload, not the brochure.

1. Run prod traffic through litellm for a week → record total `ai_cost_usd_total`
2. Switch `AI_GATEWAY_PROVIDER=bifrost`, repeat
3. Diff:

```promql
sum(increase(ai_cost_usd_total{gen_ai_system="openai"}[7d]))
```

Same workload, different gateway, real dollars. End the vendor argument with data.

## Recipe 8 — Embedding cache hit-rate

**Goal**: prove your embedding cache is paying for itself.

Wrap your `embedder.embed()` calls in a custom span and add a `cache.hit` attribute:

```python
from app.ai.telemetry.spans import ai_span

async def cached_embed(text: str) -> list[float]:
    key = sha256(text.encode()).hexdigest()
    cached = await cache.get(key)
    with ai_span("embedding.lookup", attributes={"cache.hit": cached is not None}):
        if cached:
            return cached
        vec = await embedder.embed(text)
        await cache.set(key, vec)
        return vec
```

PromQL:
```promql
sum(rate(embedding_lookup_total{cache_hit="true"}[5m]))
/ sum(rate(embedding_lookup_total[5m]))
```

If hit rate < 60%, your TTL is too short or your text changes too often.

## Anti-patterns

- **Don't tag with PII** — `ai.tenant_id="user-email@..."` will leak through Tempo/Grafana. Use opaque IDs.
- **Don't drop unknown-model spans** — pricing returns `None` for unknown models; the span still ships. Filter only at the dashboard layer, not at emission.
- **Don't sample AI spans** — they're rare and expensive. Sample HTTP spans, keep all AI spans.
- **Don't cap per user without a clear UX** — return a structured `429 cost_cap_exceeded` body so the client can render a real message.
