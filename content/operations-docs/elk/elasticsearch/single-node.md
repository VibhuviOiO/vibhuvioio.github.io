---
title: Run Elasticsearch Single Node
description: Deploy a single-node Elasticsearch container with Docker Compose
order: 1
---

# 🐳 Run Elasticsearch Single Node

Deploy a single-node Elasticsearch instance using Docker Compose for development and testing.

---

## Prerequisites

- [Docker](https://docs.docker.com/install/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

---

## Run the Container

### Download the Docker Compose file

```bash
wget -O docker-compose.yml https://raw.githubusercontent.com/jinnabaalu/ELKOperations/main/elasticsearch/single-node/docker-compose.yml
```

> The compose file is configured to connect with the Elasticsearch container on the same server.

### Start Elasticsearch

```bash
docker compose up -d
```

### Check Container Status

```bash
docker ps -a
```

> Container status should be `healthy`. If not, check logs with `docker logs <container-name>`

---

## Query Elasticsearch APIs

### Cluster & Node Status

```bash
# Nodes in the cluster
curl -X GET 'localhost:9200/_cat/nodes?pretty'

# Overall health
curl -X GET 'localhost:9200/_cat/health?pretty'

# Cluster stats
curl -X GET 'localhost:9200/_cluster/stats?human&pretty'

# Node-level stats
curl -X GET 'localhost:9200/_nodes/stats?pretty'
```

### Index Information

```bash
# List indices
curl -X GET 'localhost:9200/_cat/indices?pretty'

# All indices including hidden
curl -X GET 'localhost:9200/_cat/indices?expand_wildcards=all&pretty'

# Plugin details
curl -X GET 'localhost:9200/_nodes/plugins'
```

---

## Next Steps

- [Perform CRUD Operations](./crud-operations)
- [Set up Kibana](../kibana/container)
