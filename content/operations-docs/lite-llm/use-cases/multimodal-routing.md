---
title: "Image, Audio, and Multimodal Routing"
description: "Same gateway, multiple modalities — vision models, Whisper-style audio, image generation. Proves the OpenAI-compatible API is not just a chat surface."
order: 15
---

> **Tip:** Most teams stop at chat. The same gateway handles vision, audio, and image generation with the same governance, the same observability, and the same per-key controls.

## What this use case covers

- **Vision models** (image-in, text-out) routed through the same proxy.
- **Audio** — Whisper-style transcription, ElevenLabs / Polly synthesis — with the same key, budget, and audit story.
- **Image generation** (DALL-E, Stable Diffusion endpoints) behind the gateway.
- A **single client** that talks to all four modalities through one base URL, with per-modality budgets and rate limits.

## Why it matters

Once a product needs more than chat, the question becomes whether each modality grows its own ungoverned credentials and dashboards, or whether the gateway already covers it. The right answer is the second one.

## Coming soon

**Implementation coming soon.** This use case will ship as a runnable folder in [infinite-containers/lite-llm](https://github.com/VibhuviOiO/infinite-containers/tree/main/lite-llm), with a step-by-step lesson here and a companion post and video.

Track the full publishing roadmap in [USE-CASES.md](https://github.com/VibhuviOiO/infinite-containers/blob/main/lite-llm/USE-CASES.md).
