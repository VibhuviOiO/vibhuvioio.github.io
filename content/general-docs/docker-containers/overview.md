---
title: Docker Container Recipes
description: Production-ready Docker Compose configurations for development and production environments
---

# Docker Container Recipes

A curated collection of Docker Compose configurations for popular tools and services. These recipes are ready to use for development, testing, and production environments.

## Quick Start

Each recipe includes:
- **Docker Compose** file ready to run
- **Environment variables** configuration
- **Volume mounts** for persistent data
- **Health checks** where applicable
- **Networking** setup

## Usage

```bash
# Clone the repository
git clone https://github.com/JinnaBalu/infinite-docker-compose.git

# Navigate to a service
cd infinite-docker-compose/postgresql

# Start the container
docker compose up -d
```

## Categories

### Databases
- [PostgreSQL with Adminer](./postgresql) - PostgreSQL database with web UI
- [MinIO](./minio) - S3-compatible object storage
- [MongoDB](./mongodb) - Document database

### AI/ML
- [Ollama](./ollama) - Run LLMs locally
- [Flowise](./flowise) - Visual UI for LLM orchestration
- [Marqo](./marqo) - Vector search engine
- [ChromaDB](./chromadb) - Vector embeddings database
- [Qdrant](./qdrant) - Vector database

### Development Tools
- [Git Server (Gitea)](./gitea) - Self-hosted Git service
- [Swagger UI](./swagger-ui) - API documentation UI
- [Memos](./memos) - Note-taking application

### Monitoring & Logging
- [Uptime Kuma](./uptime-kuma) - Uptime monitoring
- [Hertzbeat](./hertzbeat) - Monitoring system
- [Logflare](./logflare) - Log management

### Workflow & ETL
- [Airflow](./airflow) - Workflow orchestration
- [n8n](./n8n) - Workflow automation
- [Vector](./vector) - Log shipping
- [Azkaban](./azkaban) - Batch workflow scheduler

### Security & IAM
- [Keycloak](./keycloak) - Identity and access management

### Message Queues
- [HAProxy](./haproxy) - Load balancer

## Best Practices

### Persistent Data

Always use named volumes for persistent data:

```yaml
volumes:
  - postgres-data:/var/lib/postgresql/data
```

### Environment Variables

Use `.env` files for sensitive configuration:

```bash
# .env
POSTGRES_USER=admin
POSTGRES_PASSWORD=secure_password
```

### Health Checks

Enable health checks to ensure service availability:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Networking

Use custom networks for service communication:

```yaml
networks:
  myapp:
    driver: bridge
```

## Contributing

Submit new recipes via GitHub pull requests. Include:
1. Working docker-compose.yml
2. README with usage instructions
3. Environment variable documentation
4. Health check configuration where applicable
