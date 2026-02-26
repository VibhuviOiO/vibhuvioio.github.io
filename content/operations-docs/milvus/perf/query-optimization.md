---
title: "Query Performance"
description: "Optimize Milvus query performance. Latency reduction, throughput tuning, and search parameter optimization."
duration: "25m"
readingTime: "15m"
labTime: "10m"
order: 1
---

# Query Performance

Query performance in Milvus depends on multiple factors:

1. **Index type and parameters**
2. **Segment size and count**
3. **QueryNode resources**
4. **Search parameters**
5. **Scalar filtering**

## Performance Hierarchy

```
Fastest: In-memory HNSW, no filters, small segments
    ↓
Fast: In-memory HNSW, simple filters
    ↓
Medium: Disk-based index, complex filters
    ↓
Slowest: Growing segments, high cardinality filters
```

## Optimizing Search Parameters

### HNSW ef Parameter

The `ef` parameter controls search scope vs speed:

```python
# Fast, lower recall
search_params = {"params": {"ef": 32}}

# Balanced
search_params = {"params": {"ef": 64}}

# Slow, higher recall
search_params = {"params": {"ef": 256}}
```

**Rule of thumb:** `ef` = 2× to 4× `limit` (top_k)

### IVF nprobe Parameter

```python
# Fast, might miss results
search_params = {"params": {"nprobe": 8}}

# Balanced
search_params = {"params": {"nprobe": 16}}

# Thorough, slower
search_params = {"params": {"nprobe": 128}}
```

**Rule of thumb:** `nprobe` = 1-10% of `nlist`

## Segment Optimization

### Problem: Too Many Small Segments

**Symptoms:** High query latency, high CPU usage

**Check:**
```python
# List segments
client.get_query_segment_info("collection_name")

# Look for many small segments (<100MB)
```

**Fix:**
```python
# Trigger compaction (merges small segments)
client.compact("collection_name")
```

### Problem: Segments Too Large

**Symptoms:** Slow segment loading, OOM on QueryNodes

**Fix in milvus.yaml:**
```yaml
dataCoord:
  segment:
    maxSize: 512        # Reduce from 1024
    sealProportion: 0.1 # Seal earlier
```

## QueryNode Tuning

### Memory Allocation

```yaml
queryNode:
  cache:
    memoryLimit: 8589934592  # 8GB per QueryNode
  
  mmap:
    vectorField: false       # Keep hot data in memory
    vectorIndex: false
```

### Parallelism

```yaml
queryNode:
  scheduler:
    receiveChanSize: 1024
    unsolvedQueueSize: 1024
    maxReadConcurrency: 4    # Parallel segment reads
```

## Scalar Filtering

### Efficient Filter Design

```python
# GOOD - Low cardinality, indexed
schema.add_field("category", DataType.VARCHAR, max_length=32)

# Create scalar index
index_params.add_index(
    field_name="category",
    index_type="Trie"  # For string prefix match
)

# BAD - High cardinality without index
schema.add_field("user_id", DataType.VARCHAR, max_length=64)  # 1M unique values
```

### Filter Pushdown

Milvus performs best when filters are selective:

```python
# GOOD - Selective filter (returns <10% of data)
client.search(
    "products",
    data=[query_vector],
    filter='category == "electronics" and price < 1000',
    limit=10
)

# SLOW - Non-selective filter (returns >50% of data)
client.search(
    "products",
    data=[query_vector],
    filter='price > 0',  # Matches everything
    limit=10
)
```

## Batch Queries

Batching reduces per-query overhead:

```python
# SLOW - 100 individual queries
for vec in vectors:
    results = client.search("collection", data=[vec], limit=10)

# FAST - Single batch query
results = client.search("collection", data=vectors, limit=10)
```

**Maximum batch size:** 16384 vectors per request

## Consistency Levels

Trade consistency for speed:

```python
from pymilvus import ConsistencyLevel

# Strong consistency - slowest, freshest data
client.search(..., consistency_level=ConsistencyLevel.Strong)

# Bounded staleness - balanced
client.search(..., consistency_level=ConsistencyLevel.Bounded)

# Eventually consistent - fastest, may miss recent data
client.search(..., consistency_level=ConsistencyLevel.Eventually)
```

| Level | Latency | Data Freshness |
|-------|---------|----------------|
| Strong | High | Guaranteed |
| Bounded | Medium | <1 second old |
| Session | Low | Your writes visible |
| Eventually | Lowest | May miss recent |

## Monitoring Query Performance

### Key Metrics

```bash
# Query latency percentiles
curl http://milvus:9091/metrics | grep milvus_querynode_search_latency

# Query throughput
curl http://milvus:9091/metrics | grep milvus_proxy_search_requests

# Segment load time
curl http://milvus:9091/metrics | grep milvus_querynode_segment_load_duration
```

### Common Bottlenecks

| Symptom | Cause | Solution |
|---------|-------|----------|
| High latency, low CPU | Disk I/O | Use SSD, enable more caching |
| High latency, high CPU | Too many segments | Run compaction |
| Variable latency | GC pauses | Tune JVM, increase memory |
| Slow first query | Cold cache | Preload collection |

## Preloading Collections

Avoid cold-start latency:

```python
# Load into memory on startup
client.load_collection("collection_name")

# Verify loaded
client.get_load_state("collection_name")
```

For collections that must always be available:
```yaml
queryNode:
  cache:
    warmup: async  # Preload on startup
```

## Next Steps

Learn about memory management:

→ **[Memory Management & MMAP](./memory)**
