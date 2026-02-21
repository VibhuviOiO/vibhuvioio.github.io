---
title: Index Operations
description: Create, configure, and manage Elasticsearch indices — cat APIs, disk watermarks, index stats, bulk operations, and production settings.
duration: "35m"
readingTime: "20m"
labTime: "15m"
order: 1
---

## Create an Index

### Basic Index

Create an index with default settings (Elasticsearch assigns 1 primary shard and 1 replica):

```bash
curl -X PUT "localhost:9200/my-first-index?pretty"
```

### With Settings and Mappings

Create an index with explicit shard settings and a typed field mapping:

```bash
curl -X PUT "localhost:9200/products?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "price": { "type": "float" },
      "category": { "type": "keyword" },
      "created_at": { "type": "date" }
    }
  }
}'
```

## Cat APIs

The `_cat` APIs provide human-readable cluster information. Add `?v` for headers and `?help` to see available columns.

### Cluster Health

```bash
# Quick health check
curl -s "localhost:9200/_cat/health?v"

# Output:
# epoch      timestamp cluster        status node.total node.data shards pri relo init unassign
# 1705312345 10:25:45  my-cluster     green           3         3     20  10    0    0        0
```

### List Nodes

```bash
# All nodes with key metrics
curl -s "localhost:9200/_cat/nodes?v&h=name,role,heap.percent,ram.percent,cpu,disk.used_percent"

# Output:
# name             role  heap.percent ram.percent cpu disk.used_percent
# elasticsearch-1  cdfhimrstw       45          82   5            62.3
# elasticsearch-2  cdfhimrstw       38          78   3            58.1
# elasticsearch-3  cdfhimrstw       42          80   4            60.5
```

### List Indices

```bash
# All indices with health
curl -s "localhost:9200/_cat/indices?v"

# Sorted by document count (descending)
curl -s "localhost:9200/_cat/indices?v&s=docs.count:desc"

# Sorted by store size
curl -s "localhost:9200/_cat/indices?v&s=store.size:desc"

# Only green indices
curl -s "localhost:9200/_cat/indices?v&health=green"

# Specific index pattern
curl -s "localhost:9200/_cat/indices/logs-*?v"
```

### List Shards

```bash
# All shards
curl -s "localhost:9200/_cat/shards?v"

# Shards for specific index
curl -s "localhost:9200/_cat/shards/my-index?v"

# Unassigned shards only
curl -s "localhost:9200/_cat/shards?v&h=index,shard,prirep,state,unassigned.reason" | grep UNASSIGNED
```

### Cat API Reference

| API | Command | Shows |
|-----|---------|-------|
| Health | `_cat/health?v` | Cluster status, node count, shard stats |
| Nodes | `_cat/nodes?v` | Node names, roles, resource usage |
| Indices | `_cat/indices?v` | Index health, doc count, size |
| Shards | `_cat/shards?v` | Shard allocation, state, size |
| Allocation | `_cat/allocation?v` | Disk usage per node |
| Pending Tasks | `_cat/pending_tasks?v` | Queued cluster operations |
| Thread Pool | `_cat/thread_pool?v` | Thread pool stats |
| Recovery | `_cat/recovery?v` | Shard recovery progress |
| Segments | `_cat/segments?v` | Lucene segment details |

## Index Settings

### View Settings

```bash
curl -s "localhost:9200/products/_settings?pretty"
```

### Update Dynamic Settings

```bash
curl -X PUT "localhost:9200/products/_settings?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "index": {
    "number_of_replicas": 1,
    "refresh_interval": "30s"
  }
}'
```

### Auto-Create Index Setting

Control whether indices are auto-created when a document is indexed:

```bash
# Disable auto-creation globally
curl -X PUT "localhost:9200/_cluster/settings" \
  -H 'Content-Type: application/json' -d'
{
  "persistent": {
    "action.auto_create_index": "false"
  }
}'

# Allow auto-creation only for specific patterns
curl -X PUT "localhost:9200/_cluster/settings" \
  -H 'Content-Type: application/json' -d'
{
  "persistent": {
    "action.auto_create_index": "logs-*,metrics-*,-*"
  }
}'
```

## Index Statistics

```bash
# Full stats for an index
curl -s "localhost:9200/my-index/_stats?pretty"

# Specific stats
curl -s "localhost:9200/my-index/_stats/docs,store?pretty"

# Stats for all indices
curl -s "localhost:9200/_stats?pretty"
```

Key stats to monitor:

| Stat | Path | Meaning |
|------|------|---------|
| Document count | `_all.primaries.docs.count` | Total documents |
| Store size | `_all.primaries.store.size_in_bytes` | Disk usage |
| Indexing rate | `_all.primaries.indexing.index_total` | Documents indexed |
| Search rate | `_all.primaries.search.query_total` | Queries executed |
| Merge time | `_all.primaries.merges.total_time_in_millis` | Time spent merging |

## Disk Watermarks

Elasticsearch uses watermarks to manage disk space and prevent nodes from running out of disk:

| Watermark | Default | Behavior |
|-----------|---------|----------|
| **Low** | 85% | Stop allocating new shards to this node |
| **High** | 90% | Start relocating shards away from this node |
| **Flood stage** | 95% | Enforce read-only on indices with shards on this node |

### View Current Watermarks

```bash
curl -s "localhost:9200/_cluster/settings?include_defaults=true&pretty" | grep watermark
```

### Update Watermarks

```bash
curl -X PUT "localhost:9200/_cluster/settings" \
  -H 'Content-Type: application/json' -d'
{
  "persistent": {
    "cluster.routing.allocation.disk.watermark.low": "85%",
    "cluster.routing.allocation.disk.watermark.high": "90%",
    "cluster.routing.allocation.disk.watermark.flood_stage": "95%"
  }
}'
```

### Fix Read-Only Index (After Flood Stage)

When an index hits flood stage, it becomes read-only. After freeing disk space, remove the block:

```bash
curl -X PUT "localhost:9200/my-index/_settings" \
  -H 'Content-Type: application/json' -d'
{
  "index.blocks.read_only_allow_delete": null
}'

# Or for all indices
curl -X PUT "localhost:9200/_all/_settings" \
  -H 'Content-Type: application/json' -d'
{
  "index.blocks.read_only_allow_delete": null
}'
```

## Delete an Index

```bash
# Delete single index
curl -X DELETE "localhost:9200/my-first-index?pretty"

# Delete multiple indices
curl -X DELETE "localhost:9200/logs-2024.01.*?pretty"
```

## Index Templates

Create reusable index patterns:

```bash
curl -X PUT "localhost:9200/_index_template/logs_template?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "message": { "type": "text" }
      }
    }
  },
  "priority": 100
}'
```

## Open and Close Indices

Closed indices consume no cluster resources but retain data on disk:

```bash
# Close an index (frees memory)
curl -X POST "localhost:9200/old-logs/_close?pretty"

# Open it again
curl -X POST "localhost:9200/old-logs/_open?pretty"
```

## Best Practices

| Setting | Development | Production |
|---------|------------|------------|
| `number_of_shards` | 1 | Based on data size |
| `number_of_replicas` | 0 | 1 or 2 |
| `refresh_interval` | 1s (default) | 30s or higher |
| `auto_create_index` | true | Restricted patterns |

## Lab: Manage Indices

1. Create an index with settings and mappings
2. List all indices sorted by size using `_cat/indices`
3. Check cluster health and node stats with cat APIs
4. View shard allocation with `_cat/shards`
5. Update refresh_interval and number_of_replicas
6. Check disk watermark settings
7. Delete a test index

## Next Steps

- [Document Operations](./02-document-operations) — CRUD operations on documents
- [Index Design](../index-management/01-index-design) — shard planning and templates
