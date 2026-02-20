---
title: Three Node Cluster Setup
description: Deploy a production-ready three-node Elasticsearch cluster
duration: "45m"
readingTime: "15m"
labTime: "30m"
github: "https://github.com/JinnaBalu/infinite-containers/tree/main/elastic-stack/three-node-cluster"
order: 2
---

# Three Node Cluster Setup

Deploy a resilient three-node Elasticsearch cluster with proper master election.

## Time Estimate
- **Reading**: 15 minutes
- **Lab**: 30 minutes

## GitHub Reference
- **Repository**: [infinite-containers/elastic-stack/three-node-cluster](https://github.com/JinnaBalu/infinite-containers/tree/main/elastic-stack/three-node-cluster)
- **Files**:
  - `elasticsearch-one.yaml` - Node 1 configuration
  - `elasticsearch-two.yaml` - Node 2 configuration
  - `elasticsearch-three.yaml` - Node 3 configuration

## Architecture

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Node One      │  │   Node Two      │  │  Node Three     │
│ 192.168.0.11    │  │ 192.168.0.27    │  │ 192.168.0.28    │
│ Master + Data   │  │ Master + Data   │  │ Master + Data   │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    discovery.zen.ping
```

## Download Configuration

### Node One (192.168.0.11)

```bash
mkdir ~/es-node-one && cd ~/es-node-one
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/three-node-cluster/elasticsearch-one.yaml -O docker-compose.yml
```

### Node Two (192.168.0.27)

```bash
mkdir ~/es-node-two && cd ~/es-node-two
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/three-node-cluster/elasticsearch-two.yaml -O docker-compose.yml
```

### Node Three (192.168.0.28)

```bash
mkdir ~/es-node-three && cd ~/es-node-three
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/three-node-cluster/elasticsearch-three.yaml -O docker-compose.yml
```

## Key Configuration Points

Each node has specific settings:

```yaml
# Common settings across all nodes
environment:
  - cluster.name=oio-cluster
  - discovery.zen.minimum_master_nodes=2
  - discovery.zen.ping.unicast.hosts=192.168.0.11,192.168.0.27,192.168.0.28

# Node-specific
  - node.name="oio-es-one"  # Changes per node
  - network.publish_host=192.168.0.11  # Node's IP
```

## Start the Cluster

Start nodes in order:

```bash
# On Node One
docker compose up -d

# On Node Two
docker compose up -d

# On Node Three
docker compose up -d
```

## Verify Cluster

```bash
# Check cluster health
curl -X GET "http://192.168.0.11:9200/_cluster/health?pretty"

# List all nodes
curl -X GET "http://192.168.0.11:9200/_cat/nodes?v"

# Expected output:
# ip           heap.percent ram.percent cpu load_1m node.role master name
# 192.168.0.28           25          75   0    0.15 mdi       *      oio-es-three
# 192.168.0.11           22          72   0    0.12 mdi       -      oio-es-one
# 192.168.0.27           24          74   0    0.14 mdi       -      oio-es-two
```

## Fault Tolerance Test

```bash
# Stop the master node
docker stop oio-elasticsearch-three

# Check new master election (wait 30 seconds)
curl -X GET "http://192.168.0.11:9200/_cluster/health?pretty"
```

## Next Steps

- [Five Node Cluster](./03-five-node-cluster) - Larger deployments
- [Index Management](../index-management/01-index-design) - Optimize for clusters
