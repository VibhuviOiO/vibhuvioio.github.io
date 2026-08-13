---
title: "Authentication Beyond Bearer Tokens"
description: "JWT validation, OIDC integration, and mapping end-user identity (not just app identity) to virtual keys — required for any B2B SaaS where each customer needs separate accountability."
order: 12
---

> **Tip:** Bearer tokens are fine for internal tools. The moment external users are involved, the gateway needs a real identity story.

## What this use case covers

- **JWT validation** at the gateway, with key-rotation and revocation handled correctly.
- **OIDC integration** with the common identity providers — Okta, Auth0, Cognito, Azure AD.
- **End-user identity → virtual key mapping**: each end customer gets their own usage attribution, budget, and audit trail, even though the application only talks to the gateway with one connection.
- The **trade-off** between per-tenant keys, per-user keys, and a hybrid model with claims-based attribution.

## Why it matters

Cost attribution, audit trails, and abuse mitigation all require knowing *who* made a request, not just *which app* made it. Bearer tokens never carry that information.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

See also the related [SaaS multi-tenancy and BYOK](./multi-tenancy-byok) use case. Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
