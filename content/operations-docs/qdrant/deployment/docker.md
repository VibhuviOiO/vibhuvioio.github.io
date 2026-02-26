---
title: "Docker Deployment"
description: "Deploy Qdrant with Docker — the fastest way to get started with the open-source vector database."
duration: "25m"
readingTime: "15m"
labTime: "10m"
order: 1
---

# Docker Deployment

The quickest way to run Qdrant locally or in production with Docker.

## Quick Start

### 1. Run Qdrant Container

```bash
docker run -p 6333:6333 -p 6334:6334 \
  --name qdrant \
  qdrant/qdrant:latest
```

> **Ports:**
> - `6333` — HTTP API
> - `6334` — gRPC API

### 2. Verify Installation

```bash
# Check HTTP API
curl http://localhost:6333/healthz
# Expected: {"status":"ok"}

# Check version
curl http://localhost:6333/
# Expected: {"title":"qdrant","version":"1.x.x"}
```

### 3. Test with Python

```python
from qdrant_client import QdrantClient

client = QdrantClient("localhost", port=6333)

# Create collection
client.create_collection(
    collection_name="test",
    vectors_config={"size": 128, "distance": "Cosine"}
)

print("Collection created!")
```

## Production Docker Run

### With Persistent Storage

```bash
# Create data directory
mkdir -p $(pwd)/qdrant_data

# Run with volume
docker run -p 6333:6333 -p 6334:6334 \
  --name qdrant \
  -v $(pwd)/qdrant_data:/qdrant/storage:z \
  qdrant/qdrant:latest
```

### With Custom Config

```bash
docker run -p 6333:6333 -p 6334:6334 \
  --name qdrant \
  -v $(pwd)/qdrant_data:/qdrant/storage:z \
  -v $(pwd)/config.yaml:/qdrant/config/production.yaml:z \
  qdrant/qdrant:latest
```

## Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  qdrant:
    image: qdrant/qdrant:latest
    container_name: qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./qdrant_data:/qdrant/storage
    environment:
      - QDRANT__LOG_LEVEL=INFO
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 512M
```

Run:

```bash
docker compose up -d
```

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `QDRANT__LOG_LEVEL` | Logging level | INFO |
| `QDRANT__SERVICE__HTTP_PORT` | HTTP port | 6333 |
| `QDRANT__SERVICE__GRPC_PORT` | gRPC port | 6334 |
| `QDRANT__STORAGE__STORAGE_PATH` | Data directory | ./storage |

### Memory Limits

Qdrant benefits from ample memory for HNSW indexes:

```bash
# For production workloads
docker run ... \
  --memory=8g \
  --memory-swap=8g \
  qdrant/qdrant:latest
```

## Stopping and Restarting

```bash
# Stop
docker stop qdrant

# Start again
docker start qdrant

# Remove container
docker rm qdrant

# View logs
docker logs -f qdrant
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 6333
sudo lsof -i :6333

# Kill or use different port
docker run -p 6335:6333 ...
```

### Permission Denied

```bash
# Fix SELinux issues
sudo chown -R 1000:1000 $(pwd)/qdrant_data
```

### Out of Memory

```bash
# Check memory usage
docker stats qdrant

# Increase memory limit
docker update --memory=4g qdrant
```

## Next Steps

For multi-service deployment with persistence:

→ **[Docker Compose Setup](./docker-compose)**

For Kubernetes production deployment:

→ **[Kubernetes with Helm](./kubernetes)**
