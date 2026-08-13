---
title: "Observability + Per-Key Analytics"
description: "The platform-team shape — ship LiteLLM logs and Prometheus metrics into Grafana, add Langfuse for trace-level visibility, and build the four dashboards every gateway needs."
order: 7
---

> **Tip:** This use case turns the gateway from a black box into a debuggable system. The four dashboards below are the minimum viable observability stack for any LLM gateway in production.

## What this use case covers

- **Log shipping**: LiteLLM access logs into Loki / Datadog / CloudWatch with structured fields (key id, model, latency, tokens, cost).
- **Prometheus metrics** exported by the proxy, scraped, and rendered in Grafana.
- **Langfuse** for trace-level visibility — request, prompt, response, tool calls, and cost all linked in one timeline.
- The **four standard dashboards** every gateway needs:
  1. **Cost** (per key, per model, per day)
  2. **Error rate** (per provider, per model)
  3. **Latency** (p50 / p95 / p99 per model)
  4. **Per-key usage** (TPM, RPM, budget burn)
- **Alerts on cliffs that matter**: cost spike, error-rate jump, p95 regression, key over budget.

## Why it matters

Without observability, the gateway is one outage away from a "we have no idea what happened" postmortem. With the four dashboards above, every incident has a starting point and every cost question has an answer in under a minute.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md). The companion course on [Langfuse](../../langfuse/overview) is a good prerequisite.
