---
title: Troubleshooting
description: Common Elasticsearch errors and fixes — vm.max_map_count, shard allocation, license issues, analyzer errors, disk watermarks, and cluster recovery.
duration: "25m"
readingTime: "15m"
labTime: "10m"
order: 4
---

## vm.max_map_count Is Too Low

### Error

```
[1]: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
```

Elasticsearch uses `mmap` to access index files efficiently. The default Linux setting is too low.

### Fix

```bash
# Temporary (resets on reboot)
sudo sysctl -w vm.max_map_count=262144

# Permanent
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

For Docker Desktop on macOS/Windows, set it in the Docker VM:

```bash
# Docker Desktop
docker run --privileged --pid=host -it alpine nsenter -t 1 -m -u -n -i \
  sysctl -w vm.max_map_count=262144
```

## Unsupported License Type

### Error

```json
{
  "error": "unrecognised license type [trail]"
}
```

### Cause

Typo in the license type. The correct value is `trial`, not `trail`.

### Supported License Types

| License | Features |
|---------|----------|
| `basic` | Free tier, core features |
| `standard` | Basic security features |
| `gold` | Monitoring, alerting |
| `platinum` | ML, advanced security |
| `enterprise` | All features |
| `trial` | 30-day trial of all features |

### Fix

```bash
curl -X POST "localhost:9200/_license/start_trial?acknowledge=true&pretty"
```

Or set in `elasticsearch.yml`:

```yaml
xpack.license.self_generated.type: basic
```

## Analyzer Not Found

### Error

```json
{
  "type": "mapper_parsing_exception",
  "reason": "analyzer [autocomplete_analyzer] has not been defined in the mapping"
}
```

### Cause

A custom analyzer is referenced in mappings but was never defined in the index settings.

### Fix

Custom analyzers must be defined in `settings.analysis` at index creation time. You cannot add them to an existing index without closing it first.

```bash
curl -X PUT "localhost:9200/my-index" \
  -H 'Content-Type: application/json' -d'
{
  "settings": {
    "analysis": {
      "analyzer": {
        "autocomplete_analyzer": {
          "type": "custom",
          "tokenizer": "edge_ngram_tokenizer",
          "filter": ["lowercase"]
        }
      },
      "tokenizer": {
        "edge_ngram_tokenizer": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 10,
          "token_chars": ["letter", "digit"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "autocomplete_analyzer"
      }
    }
  }
}'
```

## Shard Allocation Failures

### Error

```json
{
  "index": "my-index",
  "shard": 0,
  "primary": false,
  "current_state": "unassigned",
  "unassigned.reason": "CLUSTER_RECOVERED"
}
```

### Diagnose

```bash
# View unassigned shards
curl -s "localhost:9200/_cat/shards?v&h=index,shard,prirep,state,unassigned.reason" | grep UNASSIGNED

# Get detailed allocation explanation
curl -s "localhost:9200/_cluster/allocation/explain?pretty"
```

### Common Causes and Fixes

| Reason | Cause | Fix |
|--------|-------|-----|
| `NODE_LEFT` | Node went offline | Restart the node or wait for recovery |
| `ALLOCATION_FAILED` | Corrupted shard data | Delete the index and restore from snapshot |
| `INDEX_CREATED` | Not enough nodes for replicas | Add nodes or reduce `number_of_replicas` |
| `CLUSTER_RECOVERED` | Post-restart rebalancing | Wait — Elasticsearch will auto-recover |
| `DISK_THRESHOLD` | Disk watermark exceeded | Free disk space or adjust watermarks |

### Force Reroute (Last Resort)

```bash
curl -X POST "localhost:9200/_cluster/reroute?retry_failed=true&pretty"
```

## Cluster Red Status

### Diagnose

```bash
# Check which indices are red
curl -s "localhost:9200/_cat/indices?v&health=red"

# Check cluster health details
curl -s "localhost:9200/_cluster/health?level=indices&pretty"

# View unassigned shards
curl -s "localhost:9200/_cat/shards?v" | grep UNASSIGNED
```

### Common Fixes

1. **Missing nodes**: Start the offline nodes
2. **Disk full**: Free space, then clear read-only blocks
3. **Corrupted index**: Delete and restore from snapshot
4. **Not enough nodes for shards**: Reduce replica count

```bash
# Reduce replicas for all red indices
curl -X PUT "localhost:9200/red-index/_settings" \
  -H 'Content-Type: application/json' -d'
{
  "index.number_of_replicas": 0
}'
```

## Disk Watermark Exceeded (Read-Only Index)

### Error

```json
{
  "type": "cluster_block_exception",
  "reason": "index [my-index] blocked by: [FORBIDDEN/12/index read-only / allow delete (api)]"
}
```

### Fix

```bash
# 1. Free disk space (delete old indices, logs, etc.)

# 2. Remove the read-only block
curl -X PUT "localhost:9200/my-index/_settings" \
  -H 'Content-Type: application/json' -d'
{
  "index.blocks.read_only_allow_delete": null
}'

# 3. Remove block from ALL indices
curl -X PUT "localhost:9200/_all/_settings" \
  -H 'Content-Type: application/json' -d'
{
  "index.blocks.read_only_allow_delete": null
}'
```

## Connection Refused

### Error

```
curl: (7) Failed to connect to localhost port 9200: Connection refused
```

### Checklist

```bash
# 1. Is Elasticsearch running?
docker ps | grep elasticsearch
# or
systemctl status elasticsearch

# 2. Check logs for startup errors
docker logs elasticsearch
# or
tail -100 /var/log/elasticsearch/elasticsearch.log

# 3. Check if the port is bound
ss -tlnp | grep 9200

# 4. Check network.host setting
# If set to 0.0.0.0, ensure bootstrap checks pass
# If set to specific IP, curl that IP instead of localhost
```

## Out of Memory (OOM)

### Symptoms

- Elasticsearch process killed
- `java.lang.OutOfMemoryError: Java heap space` in logs
- Node disappears from cluster

### Fix

```bash
# Check current heap settings
curl -s "localhost:9200/_nodes/stats/jvm?pretty" | grep heap

# Set heap size (50% of available RAM, max 31GB)
# In jvm.options:
-Xms4g
-Xmx4g

# For Docker:
environment:
  ES_JAVA_OPTS: "-Xms4g -Xmx4g"
```

**Rules:**
- Always set `Xms` equal to `Xmx`
- Never exceed 50% of available RAM
- Never exceed 31GB (compressed oops limit)

## Circuit Breaker Triggered

### Error

```json
{
  "type": "circuit_breaking_exception",
  "reason": "[parent] Data too large"
}
```

### Fix

```bash
# Check circuit breaker stats
curl -s "localhost:9200/_nodes/stats/breaker?pretty"

# Temporarily increase (not recommended long-term)
curl -X PUT "localhost:9200/_cluster/settings" \
  -H 'Content-Type: application/json' -d'
{
  "persistent": {
    "indices.breaker.total.limit": "95%"
  }
}'
```

Better solutions:
- Increase JVM heap size
- Reduce the number of shards
- Optimize queries (avoid deep aggregations)

## Slow Startup After Crash

### Cause

Elasticsearch is replaying the transaction log (translog) to recover uncommitted writes.

### Monitor Recovery

```bash
# Check recovery progress
curl -s "localhost:9200/_cat/recovery?v&active_only=true"

# Check pending tasks
curl -s "localhost:9200/_cat/pending_tasks?v"
```

### Speed Up Recovery

```bash
# Increase recovery speed (temporarily)
curl -X PUT "localhost:9200/_cluster/settings" \
  -H 'Content-Type: application/json' -d'
{
  "transient": {
    "cluster.routing.allocation.node_concurrent_recoveries": 4,
    "indices.recovery.max_bytes_per_sec": "200mb"
  }
}'
```

## Quick Reference

| Error | Quick Fix |
|-------|-----------|
| `vm.max_map_count too low` | `sysctl -w vm.max_map_count=262144` |
| `unrecognised license type` | Use `trial` not `trail` |
| `analyzer not defined` | Add to `settings.analysis` at creation |
| Unassigned shards | Check allocation explain API |
| Cluster red | Check `_cat/indices?health=red` |
| Read-only index | Set `read_only_allow_delete` to null |
| Connection refused | Check if ES is running, check logs |
| OOM killed | Set heap to 50% RAM, max 31GB |
| Circuit breaker | Increase heap or optimize queries |
| Slow recovery | Increase `max_bytes_per_sec` |

## Lab: Diagnose and Fix Issues

1. Start a cluster and deliberately fill disk to trigger watermarks
2. Remove the read-only block after freeing space
3. Stop a node and observe shard reallocation
4. Use `_cluster/allocation/explain` to debug unassigned shards
5. Check circuit breaker stats under load

## Next Steps

- [Cluster Monitoring](/learn/elk/monitoring/01-cluster-monitoring) — proactive health monitoring
- [Backup & Restore](/learn/elk/production/03-backup-restore) — disaster recovery
