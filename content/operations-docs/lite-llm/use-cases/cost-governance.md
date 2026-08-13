---
title: "Cost Governance with Virtual Keys + Budgets"
description: "The CFO shape — issue per-team/per-app virtual keys, set spend budgets and TPM/RPM, watch the gateway block overspend, and bolt on showback/chargeback reporting."
order: 5
---

> **Tip:** This use case extends the [Bedrock prod profile](../bedrock/prod-profile) — its UI already supports virtual keys + budgets. This page is the dedicated story that turns the platform feature into a CFO-grade governance flow.

## What this use case covers

- Issue **virtual keys** per team or per app (master key vs operator key vs app key).
- Set **spend budgets** (USD/day, USD/month) and rate limits (TPM, RPM) on each key.
- Watch the gateway **block requests** the moment a budget is exceeded — no app-side checks required.
- Add **showback / chargeback** reporting: monthly per-cost-center attribution that finance can actually reconcile.

## Why it matters

A real LLM bill explodes in two ways: a single team running away with cost, or no idea which team owns which dollar. Virtual keys + per-key budgets turn the gateway into the enforcement boundary, so cost is governed at the platform layer instead of at every application.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

In the meantime:

- The [Bedrock prod profile](../bedrock/prod-profile) already exposes the UI controls this story will narrate.
- The full publishing roadmap lives in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
- See also the related [showback / chargeback automation](./showback-chargeback) use case, which is the reporting half of the same story.
