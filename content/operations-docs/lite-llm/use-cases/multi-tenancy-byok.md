---
title: "SaaS Multi-Tenancy and BYOK"
description: "Per-customer virtual keys, per-customer model access lists, per-customer budgets — plus Bring-Your-Own-Key so end customers can pass their own provider API keys through the gateway."
order: 13
---

> **Tip:** Multi-tenancy is the difference between a tool a team uses and a product a business sells. BYOK is the difference between "we will pay for it" and "you pay your provider, we just route it."

## What this use case covers

- **Per-customer virtual keys** issued from the gateway, scoped to the customer's tenant.
- **Per-customer model access lists** — not every customer plan unlocks every model.
- **Per-customer budgets** so one customer's runaway agent cannot impact another.
- **Bring-Your-Own-Key (BYOK)**: end customers configure their own OpenAI / Anthropic / Bedrock keys, the gateway passes requests through using those keys, the platform never holds the credentials.
- Tenant-aware **audit logs** and **usage reports**.

## Why it matters

SaaS pricing, contractual model commitments, and enterprise procurement all require a multi-tenant shape. BYOK additionally unlocks customers that cannot or will not let a vendor hold their provider credentials.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

See also the related [authentication beyond bearer tokens](./auth-beyond-bearer) use case. Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
