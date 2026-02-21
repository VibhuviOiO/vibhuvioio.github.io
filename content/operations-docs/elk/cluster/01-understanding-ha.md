---
title: Understanding High Availability Clusters
description: Elasticsearch cluster architecture — quorum, node roles, split-brain prevention, failure simulation, and recovery procedures.
duration: "40m"
readingTime: "25m"
labTime: "15m"
order: 1
---

## Why High Availability?

### Single-Node Risks

| Failure Type | Impact |
|-------------|--------|
| Node crash | Entire cluster stops, data unavailable |
| Network issues | Cluster unreachable |
| Hardware failure | Potential data loss |
| Disk full | All indexing and search stops |

### HA Benefits

With multiple nodes, if one node fails, the others continue serving requests. Replica shards are promoted to primary, and the cluster keeps running.

## Cluster Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Elasticsearch Cluster                     │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Node 1    │  │   Node 2    │  │   Node 3    │        │
│  │   Master    │  │   Master    │  │   Master    │        │
│  │   (Active)  │  │  (Standby)  │  │  (Standby)  │        │
│  │   + Data    │  │   + Data    │  │   + Data    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  Primary shards: [P0] [P1] [P2]                            │
│  Replica shards: [R0] [R1] [R2]                            │
│  Distributed across nodes for redundancy                    │
└─────────────────────────────────────────────────────────────┘
```

## Understanding Quorum

**Quorum** is the minimum number of master-eligible nodes that must agree on decisions (electing a master, modifying cluster state). It prevents **split-brain scenarios** where the cluster splits into two independent clusters that both accept writes.

### Quorum Formula

```
Quorum = (Number of master-eligible nodes / 2) + 1
```

| Master-eligible Nodes | Quorum | Can Survive |
|----------------------|--------|-------------|
| 1 | 1 | 0 node failures |
| 2 | 2 | 0 node failures (avoid!) |
| 3 | 2 | 1 node failure |
| 5 | 3 | 2 node failures |
| 7 | 4 | 3 node failures |

**Always use an odd number of master-eligible nodes.** With 2 nodes, quorum is 2 — meaning both must be online, which provides no fault tolerance.

### Why Is Quorum Important?

Without quorum, a network partition can create two independent clusters:

```
Network Partition:
┌──────────┐    X    ┌──────────┐
│  Node 1  │    X    │  Node 2  │
│  Node 3  │    X    │          │
└──────────┘         └──────────┘
  Quorum: 2/3         Quorum: 1/3
  Stays active         Becomes read-only
```

With 3 nodes and quorum of 2, the partition with 2 nodes continues operating while the isolated node stops accepting writes.

## Node Roles

Elasticsearch nodes can serve different roles. In small clusters, each node typically handles all roles. In larger clusters, dedicate nodes to specific roles.

### Role Reference

| Role | Purpose | When to Dedicate |
|------|---------|-----------------|
| **Master** | Manages cluster state, creates/deletes indices | 5+ nodes |
| **Data** | Stores data, handles search and indexing | Always |
| **Ingest** | Pre-processes documents before indexing | Heavy pipeline use |
| **ML** | Machine learning tasks | If using ML features |
| **Coordinating** | Routes requests, aggregates results | High query volume |
| **Remote Cluster Client** | Cross-cluster search/replication | Multi-cluster setups |
| **Transform** | Pivot and aggregation transforms | If using transforms |

### Role Configuration

```yaml
# Master-only node (no data)
node.roles: [master]

# Data-only node (no master elections)
node.roles: [data, ingest]

# All roles (default for small clusters)
node.roles: [master, data, ingest]

# Coordinating-only node (no data, no master)
node.roles: []
```

### Role Strategy by Cluster Size

| Cluster Size | Strategy |
|-------------|----------|
| 1-3 nodes | All roles on every node |
| 3-5 nodes | All roles, but consider dedicated masters |
| 5-10 nodes | 3 dedicated masters + data nodes |
| 10+ nodes | Dedicated masters + dedicated data + coordinating |

## Essential Configuration

For a 3-node HA cluster, these properties are essential:

### cluster.initial_master_nodes

Defines the initial master-eligible nodes to form the cluster. **Only used during the very first startup.**

```yaml
cluster.initial_master_nodes:
  - elasticsearch-1
  - elasticsearch-2
  - elasticsearch-3
```

### discovery.seed_hosts

Lists nodes to contact for cluster discovery. Used by new nodes when they join.

```yaml
discovery.seed_hosts:
  - elasticsearch-1
  - elasticsearch-2
  - elasticsearch-3
```

### Minimum Configuration per Node

```yaml
# Node identity
cluster.name: production-cluster
node.name: elasticsearch-1
node.roles: [master, data, ingest]

# Network
network.host: 0.0.0.0
http.port: 9200
transport.port: 9300

# Discovery
discovery.seed_hosts:
  - elasticsearch-2:9300
  - elasticsearch-3:9300
cluster.initial_master_nodes:
  - elasticsearch-1
  - elasticsearch-2
  - elasticsearch-3
```

## Cluster Health

| Status | Meaning | Action |
|--------|---------|--------|
| **Green** | All primary and replica shards allocated | None needed |
| **Yellow** | All primaries allocated, some replicas missing | Add nodes or reduce replicas |
| **Red** | Some primary shards missing | Immediate attention required |

```bash
# Check cluster health
curl -s "localhost:9200/_cluster/health?pretty"

# View shard allocation
curl -s "localhost:9200/_cat/shards?v"

# View node info
curl -s "localhost:9200/_cat/nodes?v&h=name,role,heap.percent,disk.used_percent"
```

## Cluster Failure Simulation

Understanding how your cluster behaves during failures is critical for production readiness.

### Scenario 1: Single Node Failure

```bash
# Check health before
curl -s "localhost:9200/_cluster/health?pretty"
# Expected: green, 3 nodes

# Stop one node
docker stop elasticsearch-3

# Check health after
curl -s "localhost:9200/_cluster/health?pretty"
# Expected: yellow — replicas promoted to primary, some replicas unassigned
```

**What happens:** Quorum is maintained (2 of 3 nodes). The cluster promotes replica shards to primary. Status turns yellow because some replicas are now unassigned.

### Scenario 2: Two Node Failure

```bash
# Stop two nodes
docker stop elasticsearch-2 elasticsearch-3

# Check health
curl -s "localhost:9200/_cluster/health?pretty"
# Expected: red — quorum lost (only 1 of 3 master-eligible nodes)
```

**What happens:** With only 1 node and quorum of 2, the cluster cannot elect a master. It becomes read-only or unavailable. Data on the stopped nodes is inaccessible.

### Scenario 3: Complete Cluster Failure

```bash
# Stop all nodes
docker stop elasticsearch-1 elasticsearch-2 elasticsearch-3

# Cluster is completely unavailable
curl -s "localhost:9200/_cluster/health?pretty"
# Expected: connection refused
```

### Recovery

```bash
# Start nodes one by one
docker start elasticsearch-1
docker start elasticsearch-2
docker start elasticsearch-3

# Monitor recovery
watch -n 2 'curl -s "localhost:9200/_cluster/health?pretty"'
# Cluster recovers to green once all nodes rejoin and shards rebalance
```

**Key takeaways:**
- 3-node cluster survives 1 node failure (stays yellow)
- 2 node failures cause quorum loss (cluster goes red)
- Elasticsearch automatically recovers when nodes rejoin
- Replicas are essential — without them, any node failure means data loss

## Split-Brain Prevention

In Elasticsearch 7+, split-brain prevention is automatic. The cluster uses a voting configuration that requires a majority of master-eligible nodes.

For Elasticsearch 6.x and earlier, configure manually:

```yaml
# Deprecated in 7.x — handled automatically
discovery.zen.minimum_master_nodes: 2
```

## Lab: Explore Cluster Behavior

1. Start a 3-node cluster with Docker Compose
2. Check cluster health and verify green status
3. Create an index with 1 replica
4. Stop one node and observe health change to yellow
5. Verify the data is still accessible
6. Stop a second node and observe red status
7. Restart all nodes and watch recovery to green

## Next Steps

- [Three Node Cluster Setup](./02-three-node-cluster) — deploy a 3-node cluster with Docker
- [Five Node Cluster](./03-five-node-cluster) — production-grade multi-node deployment
