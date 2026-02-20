---
title: Ollama - Local LLMs
description: Run Large Language Models locally with Ollama
---

# Ollama - Local LLMs

Run Large Language Models locally on your machine.

## Docker Compose

```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    environment:
      - OLLAMA_ORIGINS=*

  ollama-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: ollama-webui
    ports:
      - "3000:8080"
    environment:
      - OLLAMA_API_BASE_URL=http://ollama:11434/api
    depends_on:
      - ollama

volumes:
  ollama-data:
```

## Usage

### Start Services

```bash
docker compose up -d
```

### Access

| Service | URL |
|---------|-----|
| Ollama API | http://localhost:11434 |
| Web UI | http://localhost:3000 |

### Download Models

```bash
# Pull a model
docker exec -it ollama ollama pull llama2

# List models
docker exec -it ollama ollama list
```

### Available Models

- `llama2` - Meta's Llama 2
- `llama3` - Meta's Llama 3
- `mistral` - Mistral AI model
- `codellama` - Code-specialized Llama
- `gemma` - Google's Gemma

### API Usage

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Why is the sky blue?"
}'
```

## Volumes

- **ollama-data**: Model storage directory
