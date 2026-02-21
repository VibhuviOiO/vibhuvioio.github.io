---
title: Cluster Monitoring
description: Monitor Elasticsearch cluster health — cat APIs, node stats, shard allocation, thread pool monitoring, and diagnosing cluster issues.
duration: "30m"
readingTime: "15m"
labTime: "15m"
order: 1
---

## Cluster Health

The first thing to check — always.

```bash
curl -s "http://localhost:9200/_cluster/health?pretty"
```

```json
{
  "cluster_name": "production-cluster",
  "status": "green",
  "number_of_nodes": 3,
  "number_of_data_nodes": 3,
  "active_primary_shards": 15,
  "active_shards": 30,
  "relocating_shards": 0,
  "initializing_shards": 0,
  "unassigned_shards": 0,
  "delayed_unassigned_shards": 0,
  "number_of_pending_tasks": 0
}
```

### Cluster Status Meanings

| Status | Meaning | Action |
|--------|---------|--------|
| **Green** | All primary and replica shards assigned | None |
| **Yellow** | All primaries assigned, some replicas unassigned | Check node count vs replica count |
| **Red** | Some primary shards unassigned | Immediate investigation needed |

### Wait for Status

Block until the cluster reaches a specific status (useful in scripts):

```bash
curl -s "http://localhost:9200/_cluster/health?wait_for_status=green&timeout=30s"
```

## Cat APIs

The `_cat` APIs provide human-readable output for quick monitoring. Add `?v` for column headers.

### Essential Cat Commands

```bash
# Cluster health (compact)
curl -s "http://localhost:9200/_cat/health?v"

# List all nodes with key stats
curl -s "http://localhost:9200/_cat/nodes?v&h=name,ip,heap.percent,ram.percent,cpu,load_1m,node.role,master"

# List all indices sorted by size
curl -s "http://localhost:9200/_cat/indices?v&s=store.size:desc"

# List all indices sorted by document count
curl -s "http://localhost:9200/_cat/indices?v&s=docs.count:desc"

# Shard distribution
curl -s "http://localhost:9200/_cat/shards?v&s=index"

# Unassigned shards (problems)
curl -s "http://localhost:9200/_cat/shards?v&h=index,shard,prirep,state,unassigned.reason&s=state"

# Thread pool activity
curl -s "http://localhost:9200/_cat/thread_pool?v&h=name,active,rejected,completed"

# Pending tasks
curl -s "http://localhost:9200/_cat/pending_tasks?v"

# Recovery progress
curl -s "http://localhost:9200/_cat/recovery?v&active_only=true"

# Disk allocation per node
curl -s "http://localhost:9200/_cat/allocation?v"

# Segment information
curl -s "http://localhost:9200/_cat/segments?v&s=index"
```

### Cat API Formatting

```bash
# JSON output
curl -s "http://localhost:9200/_cat/indices?format=json&pretty"

# Custom columns
curl -s "http://localhost:9200/_cat/indices?v&h=index,docs.count,store.size,pri,rep&s=store.size:desc"

# Filter with pattern
curl -s "http://localhost:9200/_cat/indices/logs-*?v"
```

## Node Statistics

Deep dive into node-level metrics:

```bash
# All node stats
curl -s "http://localhost:9200/_nodes/stats?pretty"

# Specific stats
curl -s "http://localhost:9200/_nodes/stats/jvm,os,process?pretty"
```

### JVM Memory

Extract heap usage from the full JVM stats response:

```bash
curl -s "http://localhost:9200/_nodes/stats/jvm?pretty" | \
  grep -A 10 '"heap_used"'
```

Key metrics:
- `heap_used_percent` — Should stay below 75%. Consistently above 85% = increase heap
- `heap_max` — Verify it matches your configured `-Xmx`
- `gc.collectors.old.collection_count` — Frequent old GC = heap pressure

### OS and Process

```bash
curl -s "http://localhost:9200/_nodes/stats/os?pretty"
```

Key metrics:
- `os.cpu.percent` — Overall CPU usage
- `os.mem.used_percent` — System memory usage
- `os.swap.used_in_bytes` — Should be 0 (swapping is bad)

## Thread Pool Monitoring

Thread pools handle different operation types. Rejections mean the queue is full.

```bash
curl -s "http://localhost:9200/_cat/thread_pool?v&h=name,active,queue,rejected,completed"
```

### Critical Thread Pools

| Thread Pool | Purpose | Warning Sign |
|-------------|---------|--------------|
| `search` | Search requests | Rejections = search queue full |
| `write` | Index/update/delete | Rejections = indexing bottleneck |
| `get` | Get requests | Rejections = heavy read load |
| `management` | Cluster management | Queue buildup = cluster instability |
| `flush` | Flush operations | Queue buildup = disk I/O issues |
| `refresh` | Segment refresh | Queue buildup = too many shards |

### Thread Pool Rejections

Any rejection count above 0 needs investigation:

```bash
# Watch for rejected operations
curl -s "http://localhost:9200/_cat/thread_pool?v&h=name,rejected&s=rejected:desc" | head -10
```

## Shard Allocation

### Why Shards Go Unassigned

```bash
# Find unassigned shards and their reasons
curl -s "http://localhost:9200/_cat/shards?v&h=index,shard,prirep,state,unassigned.reason" | grep UNASSIGNED
```

| Reason | Meaning | Fix |
|--------|---------|-----|
| `INDEX_CREATED` | Index just created | Wait or add nodes |
| `CLUSTER_RECOVERED` | Cluster restart | Wait for recovery |
| `NODE_LEFT` | Node departed | Restart the node |
| `ALLOCATION_FAILED` | Failed to allocate | Check disk space, shard limits |
| `REPLICA_ADDED` | New replica added | Wait or add nodes |

### Explain Shard Allocation

When a shard won't allocate, find out why:

```bash
curl -s "http://localhost:9200/_cluster/allocation/explain?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "index": "my-index",
  "shard": 0,
  "primary": false
}'
```

### Disk Watermarks

Elasticsearch stops allocating shards when disk is nearly full:

```bash
# Check current settings
curl -s "http://localhost:9200/_cluster/settings?include_defaults&filter_path=**.watermark&pretty"
```

| Watermark | Default | Effect |
|-----------|---------|--------|
| `low` | 85% | No new shards allocated to this node |
| `high` | 90% | Shards relocated away from this node |
| `flood_stage` | 95% | Index becomes read-only |

Adjust watermark thresholds for large disks where the defaults are too aggressive:

```bash
curl -X PUT "http://localhost:9200/_cluster/settings" \
  -H 'Content-Type: application/json' -d'
{
  "persistent": {
    "cluster.routing.allocation.disk.watermark.low": "90%",
    "cluster.routing.allocation.disk.watermark.high": "95%",
    "cluster.routing.allocation.disk.watermark.flood_stage": "97%"
  }
}'
```

## Hot Threads

Find what the cluster is spending CPU time on:

```bash
curl -s "http://localhost:9200/_nodes/hot_threads"
```

This shows the Java stack traces of the busiest threads. Look for:
- **search** threads — heavy query load
- **write** threads — heavy indexing
- **merge** threads — segment merges (I/O bound)
- **GC** threads — garbage collection (heap pressure)

## Pending Tasks

Cluster-level tasks waiting to be processed:

```bash
curl -s "http://localhost:9200/_cluster/pending_tasks?pretty"
```

A growing queue of pending tasks indicates the master node is overloaded.

## Index Statistics

Per-index performance metrics:

```bash
# Index stats
curl -s "http://localhost:9200/my-index/_stats?pretty"

# Search performance
curl -s "http://localhost:9200/my-index/_stats/search?pretty"

# Indexing performance
curl -s "http://localhost:9200/my-index/_stats/indexing?pretty"
```

Key metrics:
- `search.query_time_in_millis` / `search.query_total` = average query time
- `indexing.index_time_in_millis` / `indexing.index_total` = average index time
- `refresh.total_time_in_millis` — time spent refreshing

## Monitoring Checklist

Run these checks regularly (or automate with Metricbeat):

| Check | Command | Healthy Value |
|-------|---------|---------------|
| Cluster status | `_cluster/health` | Green |
| Heap usage | `_nodes/stats/jvm` | < 75% |
| CPU usage | `_nodes/stats/os` | < 80% sustained |
| Disk usage | `_cat/allocation` | < 85% |
| Unassigned shards | `_cat/shards` | 0 |
| Thread pool rejections | `_cat/thread_pool` | 0 |
| Pending tasks | `_cluster/pending_tasks` | 0 or near 0 |
| GC frequency | `_nodes/stats/jvm` | Old GC < 1/min |
| Swap usage | `_nodes/stats/os` | 0 bytes |

## Common Error Scenarios

### Error: All Shards Failed

```bash
# Check which shards are available
curl -s "http://localhost:9200/_cat/shards/problem-index?v"

# Check shard allocation
curl -s "http://localhost:9200/_cluster/allocation/explain?pretty"
```

### Error: Too Many Concurrent Shard Recoveries

```bash
# Check concurrent recoveries
curl -s "http://localhost:9200/_cat/recovery?v&active_only=true"

# Throttle recovery
curl -X PUT "http://localhost:9200/_cluster/settings" \
  -H 'Content-Type: application/json' -d'
{
  "persistent": {
    "cluster.routing.allocation.node_concurrent_incoming_recoveries": 2,
    "cluster.routing.allocation.node_concurrent_outgoing_recoveries": 2,
    "indices.recovery.max_bytes_per_sec": "100mb"
  }
}'
```

### Error: Read-Only Index (Flood Stage)

```bash
# Remove read-only block
curl -X PUT "http://localhost:9200/my-index/_settings" \
  -H 'Content-Type: application/json' -d'
{
  "index.blocks.read_only_allow_delete": null
}'

# Or for all indices
curl -X PUT "http://localhost:9200/_all/_settings" \
  -H 'Content-Type: application/json' -d'
{
  "index.blocks.read_only_allow_delete": null
}'
```

## Lab: Monitor Your Cluster

1. Check cluster health and node status
2. List all indices sorted by size
3. Check thread pool for rejections
4. Verify no unassigned shards
5. Check JVM heap usage across all nodes
6. Run the hot threads API and analyze output
7. Check disk watermark settings

## Next Steps

- [Slow Logs](/learn/elk/monitoring/02-slow-logs) — find and fix slow queries
- [Backup & Restore](/learn/elk/production/03-backup-restore) — protect your data
