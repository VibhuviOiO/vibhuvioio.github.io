---
title: Provider Smoke Tests
description: Validate free-tier provider keys directly from Python with LiteLLM's SDK — isolate provider issues before any gateway YAML.
duration: "25m"
readingTime: "10m"
labTime: "15m"
order: 1
---

## Project Files

```project
name: free-models-samples
README.md: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/free-models-samples/README.md
gemini.py: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/free-models-samples/gemini.py
groq.py: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/free-models-samples/groq.py
open_router_models.py: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/free-models-samples/open_router_models.py
open_route.py: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/free-models-samples/open_route.py
huggingface.py: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/free-models-samples/huggingface.py
cloudflare.py: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/lite-llm/free-models-samples/cloudflare.py
```

---

## Why a smoke-test step before the gateway

You will save hours by isolating two questions:

1. *Is the provider key correct and the model reachable?*
2. *Is my gateway configuration correct?*

If you wire a provider into `litellm_config.yaml` and the request fails, you can't tell which side is broken. A direct Python sample answers question 1 in isolation. Only after the sample works do you copy the model id into a use-case folder.

These scripts use the LiteLLM **Python SDK** — they do *not* start the proxy. That is the point.

What these samples prove:

- API key is valid and not exhausted
- Model id still exists (OpenRouter free models churn often)
- Provider is reachable from your network
- Free-tier rate limits aren't blocking you

---

## Install

In the folder where you downloaded the samples:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install litellm requests
```

---

## Set only the keys you want to test

Export only the providers you actually have keys for. Skip the rest.

```bash
export GEMINI_API_KEY="..."
export GROQ_API_KEY="..."
export OPENROUTER_API_KEY="..."
export HUGGINGFACE_API_KEY="..."
export CLOUDFLARE_API_TOKEN="..."
export CLOUDFLARE_ACCOUNT_ID="..."   # Cloudflare needs BOTH token + account id
```

> **Tip:** Cloudflare Workers AI is the one provider that needs **two** secrets — most others only need an API key. Worth a flag in any team `.env` template.

---

## Lab: Run one provider at a time

### Gemini — easiest first smoke test

```bash
python3 gemini.py
```

Backing model:

```text
gemini/gemini-2.5-flash
```

### Groq — fast hosted open-model

```bash
python3 groq.py
```

Backing model:

```text
groq/llama-3.3-70b-versatile
```

### OpenRouter — list, then call

OpenRouter's free model list **changes often**. Always list before locking a model id into a config:

```bash
python3 open_router_models.py
python3 open_route.py
```

Currently tested:

```text
openrouter/openai/gpt-oss-20b:free
openrouter/qwen/qwen3-coder:free
openrouter/meta-llama/llama-3.2-3b-instruct:free
```

### Hugging Face — slowest, run last

```bash
python3 huggingface.py
```

Currently tested:

```text
huggingface/Qwen/Qwen2.5-7B-Instruct
huggingface/microsoft/Phi-3-mini-4k-instruct
huggingface/google/gemma-2-2b-it
```

> **Warning:** Hugging Face free inference can be slow, cold, or unavailable for specific models. Treat HF as a *fallback exploration provider*, not the first recommended path.

### Cloudflare Workers AI

```bash
python3 cloudflare.py
```

Backing model:

```text
cloudflare/@cf/meta/llama-3.3-70b-instruct-fp8-fast
```

---

## Suggested testing order

The recommended sequence is built so the most reliable provider proves your setup first:

1. **Gemini** — easiest free-tier smoke test
2. **Groq** — fast, hosted open model
3. **OpenRouter** — list models first, then run
4. **Cloudflare** — only if you have Workers AI enabled
5. **Hugging Face** — last, free inference is the least predictable
6. Move the working model ids into a LiteLLM use-case folder ([Phase 4](../free-gateway/multi-provider))
7. Test `/v1/models` through the proxy
8. Test `/v1/chat/completions` through the proxy
9. Add fallback only after each individual provider route works

---

## Per-provider LiteLLM config snippets

Once a sample passes, this is the YAML shape you copy into the gateway. Use **stable app aliases** — keep provider-specific model ids inside the config.

```yaml
model_list:
  - model_name: free-gemini-chat
    litellm_params:
      model: gemini/gemini-2.5-flash
      api_key: os.environ/GEMINI_API_KEY

  - model_name: free-groq-chat
    litellm_params:
      model: groq/llama-3.3-70b-versatile
      api_key: os.environ/GROQ_API_KEY

  - model_name: free-openrouter-chat
    litellm_params:
      model: openrouter/openai/gpt-oss-20b:free
      api_key: os.environ/OPENROUTER_API_KEY

  - model_name: free-huggingface-chat
    litellm_params:
      model: huggingface/Qwen/Qwen2.5-7B-Instruct
      api_key: os.environ/HUGGINGFACE_API_KEY

  - model_name: free-cloudflare-chat
    litellm_params:
      model: cloudflare/@cf/meta/llama-3.3-70b-instruct-fp8-fast
      api_key: os.environ/CLOUDFLARE_API_TOKEN
      account_id: os.environ/CLOUDFLARE_ACCOUNT_ID
```

---

## Common Issues

### `401 Unauthorized` from a provider

The API key is wrong, expired, or scoped to a different project. The smoke-test step is exactly where you want to catch this.

### `model_not_found` from OpenRouter

Free-tier models on OpenRouter come and go. Re-run `open_router_models.py` and pick a current free model id.

### Hugging Face request hangs or 503s

Cold-start on free inference. Retry once. If still failing, pick a different HF model from the tested list above.

### Cloudflare `bad request` even with valid token

You forgot `CLOUDFLARE_ACCOUNT_ID`. The token alone is not enough — LiteLLM needs both to construct the Workers AI URL.

---

## Next Steps

- [Multi-Provider Free Gateway](../free-gateway/multi-provider) — put the working providers behind one OpenAI-compatible endpoint with fallback you can trigger
