---
title: Elasticsearch Configuration Reference
description: Complete elasticsearch.yml configuration reference — cluster, node, network, discovery, memory, and performance settings.
duration: "35m"
readingTime: "20m"
labTime: "15m"
order: 1
---

## Configuration File Location

Inside the Docker container, the configuration lives at:

```
/usr/share/elasticsearch/config/elasticsearch.yml
```

With Docker Compose, you override settings via environment variables or mount a custom config file.

## Cluster Settings

```yaml
# Cluster name — all nodes in the same cluster MUST share this
cluster.name: my-cluster

# Initial master nodes for bootstrapping (first startup only)
cluster.initial_master_nodes:
  - es-node-1
  - es-node-2
  - es-node-3
```

**Why it matters:** Nodes with different `cluster.name` values will never join the same cluster. This is your first line of defense against accidental cross-cluster joins.

## Node Settings

```yaml
# Human-readable node name
node.name: es-node-1

# Node roles (Elasticsearch 7.9+)
node.roles: [master, data, ingest]
```

### Node Role Reference

| Role | Purpose | When to Use |
|------|---------|-------------|
| `master` | Cluster state management, index creation | Dedicated master nodes in production |
| `data` | Store data and execute searches | Most nodes |
| `data_content` | Store time-independent data | Content-heavy workloads |
| `data_hot` | Hot-tier ILM data | Time-series with ILM |
| `data_warm` | Warm-tier ILM data | Aging time-series data |
| `data_cold` | Cold-tier ILM data | Rarely queried data |
| `ingest` | Pre-process documents | Pipeline-heavy workloads |
| `ml` | Machine learning jobs | Anomaly detection |
| `coordinating` | Route requests only (empty roles) | High query volume |

## Path Settings

```yaml
# Data storage — where indices live on disk
path.data: /var/data/elasticsearch

# Log files
path.logs: /var/log/elasticsearch

# Multiple data paths (stripe across disks)
path.data:
  - /mnt/disk1/elasticsearch
  - /mnt/disk2/elasticsearch
```

**Production tip:** Never use the default path in production. Mount dedicated volumes with fast I/O (SSD preferred).

## Network Settings

```yaml
# Bind address — which interface to listen on
network.host: 0.0.0.0

# HTTP port for REST API
http.port: 9200

# Transport port for inter-node communication
transport.port: 9300

# Publish address — what other nodes see
network.publish_host: 192.168.1.10
```

### Common `network.host` Values

| Value | Meaning |
|-------|---------|
| `_local_` | Loopback only (127.0.0.1) |
| `_site_` | Private network interface |
| `_global_` | Public network interface |
| `0.0.0.0` | All interfaces |
| `_eth0_` | Specific interface by name |

## Discovery Settings

```yaml
# Seed hosts for node discovery
discovery.seed_hosts:
  - 192.168.1.10:9300
  - 192.168.1.11:9300
  - 192.168.1.12:9300

# Type (single-node for development)
discovery.type: single-node
```

**Single-node vs cluster:** Set `discovery.type: single-node` only for development. In production, always configure `discovery.seed_hosts` and `cluster.initial_master_nodes`.

## Memory Settings

```yaml
# Lock memory to prevent swapping (critical for production)
bootstrap.memory_lock: true
```

### JVM Heap Configuration

Set in `jvm.options` or via environment variable:

```bash
# Set heap to 50% of available RAM (max 31GB)
ES_JAVA_OPTS=-Xms4g -Xmx4g
```

**Rules of thumb:**
- Set `-Xms` and `-Xmx` to the same value (no dynamic resizing)
- Never exceed 50% of physical RAM
- Never exceed 31GB (compressed oops threshold)
- For 64GB RAM server: use `-Xms31g -Xmx31g`

## Index Settings

```yaml
# Default number of primary shards
index.number_of_shards: 1

# Default number of replica shards
index.number_of_replicas: 1

# Refresh interval (how often new data becomes searchable)
index.refresh_interval: 1s
```

### Shard Sizing Guidelines

| Shard Size | Verdict |
|------------|---------|
| < 1GB | Too small — merge indices |
| 1-10GB | Development/small datasets |
| 10-50GB | Optimal range |
| > 50GB | Too large — add more shards |

## Gateway Settings

```yaml
# Minimum nodes before recovery starts
gateway.recover_after_nodes: 2

# Expected total nodes
gateway.expected_nodes: 3

# Wait time for expected nodes
gateway.recover_after_time: 5m
```

**Why this matters:** Without gateway settings, a cluster might start recovering shards before all nodes have joined, causing unnecessary shard movement.

## Slow Log Settings

```yaml
# Search slow logs
index.search.slowlog.threshold.query.warn: 10s
index.search.slowlog.threshold.query.info: 5s
index.search.slowlog.threshold.query.debug: 2s
index.search.slowlog.threshold.query.trace: 500ms

# Index slow logs
index.indexing.slowlog.threshold.index.warn: 10s
index.indexing.slowlog.threshold.index.info: 5s
```

See the [Slow Logs lesson](/learn/elk/monitoring/02-slow-logs) for a deep dive.

## Thread Pool Settings

```yaml
# Search thread pool
thread_pool.search.size: 13
thread_pool.search.queue_size: 1000

# Write thread pool
thread_pool.write.size: 5
thread_pool.write.queue_size: 200
```

**Default formula:** `thread_pool.search.size` = `((# of available processors) * 3) / 2) + 1`

## Complete Production Configuration

Here's a battle-tested production configuration:

```yaml
cluster.name: production-cluster
node.name: ${HOSTNAME}
node.roles: [master, data]

path.data: /var/data/elasticsearch
path.logs: /var/log/elasticsearch

network.host: 0.0.0.0
http.port: 9200
transport.port: 9300

discovery.seed_hosts:
  - es-node-1:9300
  - es-node-2:9300
  - es-node-3:9300
cluster.initial_master_nodes:
  - es-node-1
  - es-node-2
  - es-node-3

bootstrap.memory_lock: true

# Performance
index.number_of_shards: 3
index.number_of_replicas: 1
index.refresh_interval: 5s

# Recovery throttling
cluster.routing.allocation.node_concurrent_recoveries: 2
indices.recovery.max_bytes_per_sec: 100mb

# Slow logs
index.search.slowlog.threshold.query.warn: 10s
index.search.slowlog.threshold.query.info: 5s
```

## Environment Variables in Docker

When using Docker, you can set any configuration via environment variables by converting the YAML key:

```yaml
# YAML: cluster.name: my-cluster
# ENV:  cluster.name=my-cluster

environment:
  - cluster.name=production-cluster
  - node.name=es-node-1
  - bootstrap.memory_lock=true
  - "ES_JAVA_OPTS=-Xms4g -Xmx4g"
  - discovery.seed_hosts=es-node-2,es-node-3
```

## Lab: Configure Elasticsearch

1. Start a single-node cluster and view the default settings
2. Modify `cluster.name` and `node.name` in the configuration
3. Change `network.host` to `0.0.0.0` and observe bootstrap checks
4. Set `discovery.type: single-node` to bypass bootstrap checks
5. Adjust `refresh_interval` and verify with `GET _settings`

## Next Steps

- [JVM & Performance Tuning](/learn/elk/configuration/02-jvm-performance) — heap sizing, GC, and memory lock
- [Cluster Operations](/learn/elk/cluster/01-understanding-ha) — apply these settings to a multi-node cluster
