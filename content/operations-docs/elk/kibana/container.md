---
title: Run Kibana Container
description: Deploy Kibana as a Docker container and connect it to Elasticsearch
order: 1
---

# 🐳 Run Kibana Container

Deploy Kibana as a Docker container for visualizing and exploring your Elasticsearch data.

---

## Prerequisites

- [Docker](https://docs.docker.com/install/) installed
- [Elasticsearch running](../elasticsearch/single-node)

---

## Run Kibana

### Download Docker Compose file

```bash
wget -O docker-compose.yml https://raw.githubusercontent.com/jinnabaalu/ELKOperations/main/kibana/docker-compose.yml
```

### Start Kibana

```bash
docker compose up -d
```

### Check Status

```bash
docker ps -a
```

> Container status should be `healthy`. Check logs with `docker logs <kibana-container-name>` if needed.

---

## Access Kibana

Open your browser: [http://localhost:5601](http://localhost:5601)

### Verify Connectivity

1. Go to **Kibana** > **Stack Management** > **Dev Tools**
2. Run query: `GET _cat/indices?v=true`

You can execute all CRUD operations from Dev Tools.

---

## Next Steps

- [Create Dashboards](./dashboards)
- [Set up Alerts](./alerts)
