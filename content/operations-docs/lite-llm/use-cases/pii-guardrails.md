---
title: "PII Redaction + Guardrails"
description: "The legal/security shape — Presidio-based PII detection at the gateway, prompt-injection detection inbound, content filtering outbound, and per-key guardrail policies."
order: 8
---

> **Tip:** Guardrails belong at the gateway, not in every application. One enforcement point, one audit trail, one place to update policy.

## What this use case covers

- **PII detection and redaction** with [Microsoft Presidio](https://microsoft.github.io/presidio/) at the gateway boundary — emails, phone numbers, SSNs, credit cards.
- **Prompt-injection detection** on inbound requests, before they reach the model.
- **Content filtering** on outbound responses, with a configurable policy.
- **Per-key guardrail policies** — some teams need stricter rules (regulated workloads) than others (internal tools).
- A brief **compliance-posture note** covering SOC2, HIPAA, and GDPR concerns and where the gateway helps vs where it does not.

## Why it matters

The fastest way to fail a security review is to admit that PII leaves the network in plaintext, or that there is no centralized policy on what users can ask a model. Guardrails at the gateway are the cleanest answer to both.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
