---
title: Understanding High Availability Clusters
description: Learn about Elasticsearch cluster architecture and node roles
duration: "30m"
readingTime: "20m"
labTime: "10m"
order: 1
---

# Understanding High Availability Clusters

## Time Estimate
- **Reading**: 20 minutes
- **Lab**: 10 minutes

## GitHub Reference
- **Repository**: [infinite-containers/elastic-stack](https://github.com/JinnaBalu/infinite-containers)
- **Files**: Cluster configurations in elastic-stack directories

## Cluster Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Elasticsearch Cluster                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Master Node │  │ Master Node │  │  Data Node  │         │
│  │  (Active)   │  │  (Standby)  │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │  Data Node  │  │  Data Node  │                          │
│  │             │  │             │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## Node Roles

### Master-Eligible Node
- Manages cluster-wide operations
- Creates/deletes indices
- Tracks cluster state
- Minimum master nodes: `(N/2) + 1`

### Data Node
- Stores data and executes queries
- Holds shards (primary and replica)
- Handles CRUD and search operations

### Ingest Node
- Pre-processes documents before indexing
- Runs ingest pipelines

### Coordinating Node
- Routes requests to appropriate nodes
- Aggregates results
- No data storage

## Cluster Health

| Status | Meaning | Action |
|--------|---------|--------|
| **Green** | All shards allocated | None needed |
| **Yellow** | All primary shards allocated, some replicas missing | Add nodes or reduce replicas |
| **Red** | Some primary shards missing | Immediate attention required |

## Shard Allocation

```bash
# View shard allocation
curl -X GET "localhost:9200/_cat/shards?v"

# View cluster health
curl -X GET "localhost:9200/_cluster/health?pretty"

# View cluster state
curl -X GET "localhost:9200/_cluster/state?pretty"
```

## Split-Brain Prevention

Configure `discovery.zen.minimum_master_nodes` to prevent split-brain scenarios.

For 3 master-eligible nodes: `minimum_master_nodes = 2`

## Next Steps

- [Three Node Cluster Setup](./02-three-node-cluster)
- [Five Node Cluster](./03-five-node-cluster)
