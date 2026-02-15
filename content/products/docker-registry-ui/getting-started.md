---
title: Installation
description: Get started with Docker Registry UI in minutes
order: 1
---

# 🚀 Installation

Docker Registry UI provides a modern web interface for managing Docker registries.

## Quick Start

### Using Docker Compose

```yaml
version: '3.8'
services:
  registry:
    image: registry:2
    ports:
      - "5000:5000"
    environment:
      REGISTRY_STORAGE_DELETE_ENABLED: "true"

  registry-ui:
    image: ghcr.io/vibhuvioio/docker-registry-ui:latest
    ports:
      - "8080:5000"
    environment:
      - REGISTRIES=[{"name":"Local","api":"http://localhost:5000"}]
```

Run:

```bash
docker-compose up -d
```

Access the UI at http://localhost:8080

## Try in Play with Docker

[![Try in PWD](https://raw.githubusercontent.com/play-with-docker/stacks/master/assets/images/button.png)](https://labs.play-with-docker.com/?stack=https://raw.githubusercontent.com/VibhuviOiO/docker-registry-ui/main/docker-compose.yml)

## Configuration

See the [Configuration Guide](/products/docker-registry-ui/docs/configuration) for advanced options.
