---
title: Five Node Cluster with Docker Compose
description: Scale to a five-node Elasticsearch cluster using Docker Compose
duration: "45m"
readingTime: "15m"
labTime: "30m"
github: "https://github.com/JinnaBalu/infinite-containers/tree/main/elastic-stack/five-node-elasticsearch"
order: 3
---

# Five Node Cluster with Docker Compose

Run a five-node Elasticsearch cluster on a single server using Docker Compose.

## Time Estimate
- **Reading**: 15 minutes
- **Lab**: 30 minutes

## GitHub Reference
- **Repository**: [infinite-containers/elastic-stack/five-node-elasticsearch](https://github.com/JinnaBalu/infinite-containers/tree/main/elastic-stack/five-node-elasticsearch)
- **Files**:
  - `docker-compose.yml` - Five-node cluster configuration
  - `one-server-five-containers/` - Alternative isolated setup

## Download Configuration

```bash
mkdir ~/es-five-node && cd ~/es-five-node
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/five-node-elasticsearch/docker-compose.yml
docker compose up -d
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Single Server                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│  │  ES-1  │ │  ES-2  │ │  ES-3  │ │  ES-4  │ │  ES-5  │    │
│  │ Master │ │ Master │ │ Master │ │  Data  │ │  Data  │    │
│  │ + Data │ │ + Data │ │ + Data │ │        │ │        │    │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘    │
│  Port:9200  Port:9201  Port:9202  Port:9203  Port:9204     │
└─────────────────────────────────────────────────────────────┘
```

## Configuration Highlights

Each node exposes a different port:
- ES-1: 9200
- ES-2: 9201
- ES-3: 9202
- ES-4: 9203
- ES-5: 9204

## Verification

```bash
# Check all nodes
curl -X GET "localhost:9200/_cat/nodes?v"

# Check cluster health
curl -X GET "localhost:9200/_cluster/health?pretty"

# Expected: "number_of_nodes": 5, "status": "green"
```

## Alternative: Five Containers on One Server

For dedicated nodes on a single server:

```bash
cd ~/es-five-node
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/five-node-elasticsearch/one-server-five-containers/docker-compose.yml -O docker-compose-isolated.yml
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/five-node-elasticsearch/one-server-five-containers/.env
```

## Resource Requirements

| Nodes | RAM | CPUs | Disk |
|-------|-----|------|------|
| 3 | 4GB | 2 | 20GB |
| 5 | 8GB | 4 | 50GB |

## Next Steps

- [Remote Reindexing](../production/02-remote-reindexing) - Migrate data between clusters
