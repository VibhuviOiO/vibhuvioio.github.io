---
title: "Understanding milvus.yaml"
description: "Demystify the 500+ parameter milvus.yaml configuration file. Learn what matters and how to tune for your workload."
duration: "25m"
readingTime: "15m"
labTime: "10m"
order: 1
---

# Understanding milvus.yaml

The `milvus.yaml` configuration file has **500+ parameters**. Most you never need to touch. This guide focuses on the **20% that affect 80% of performance**.

## Configuration Structure

```yaml
# milvus.yaml structure
etcd:           # Metadata store connection
minio:          # Object storage connection
pulsar/kafka:   # Message queue connection

# Internal components
proxy:          # Client-facing API layer
coord:          # All coordinators (root, data, query, index)
queryNode:      # Search execution
dataNode:       # Data ingestion and compaction
indexNode:      # Index building

# Feature configs
common:         # Security, logging, limits
quotaAndLimits: # Rate limiting
log:            # Logging configuration
```

## Getting the Default Config

```bash
# Download for your version
curl -O https://raw.githubusercontent.com/milvus-io/milvus/v2.5.4/configs/milvus.yaml

# Or from Docker
docker run --rm milvusdb/milvus:v2.5.4 cat /milvus/configs/milvus.yaml > milvus.yaml
```

## Critical Configuration Sections

### 1. Dependency Connections

These must be correct or Milvus won't start:

```yaml
etcd:
  endpoints:
    - etcd-0:2379
    - etcd-1:2379
    - etcd-2:2379
  rootPath: by-dev              # Prefix for all Milvus keys

minio:
  address: minio:9000
  accessKeyID: minioadmin
  secretAccessKey: minioadmin
  bucketName: milvus-bucket
  rootPath: files

pulsar:
  address: pulsar://pulsar:6650
  webAddress: http://pulsar:8080
  maxMessageSize: 5242880       # 5MB - increase if large vectors
```

### 2. Segment Management

Segments are the fundamental storage unit. These settings control their lifecycle:

```yaml
dataCoord:
  segment:
    maxSize: 1024               # MB - max growing segment size
    diskSegmentMaxSize: 2048    # MB - for disk-based indexes
    sealProportion: 0.12        # Seal when 12% of maxSize
    expansionRate: 1.25         # Growth during compaction
    
    # Auto-sealing by time (regardless of size)
    maxLife: 86400              # seconds - 24 hours
    
    # Sealing by idle time
    maxIdleTime: 600            # seconds - 10 minutes
```

**Key parameters explained:**

| Parameter | Default | When to Change |
|-----------|---------|----------------|
| `maxSize` | 1024 MB | Increase for large vectors (768d+) |
| `sealProportion` | 0.12 (12%) | Lower for faster indexing, higher for batch ingestion |
| `maxLife` | 24h | Lower for real-time requirements |

### 3. Memory and Query Tuning

```yaml
queryNode:
  # Memory-mapped files (MMAP) - trade memory for disk I/O
  mmap:
    vectorField: true           # Mmap raw vectors
    vectorIndex: true           # Mmap indexes
    scalarField: false          # Mmap scalar fields
    scalarIndex: false          # Mmap scalar indexes
  
  # Cache sizing
  cache:
    memoryLimit: 4294967296     # 4GB - max cache size
    readAheadPolicy: willneed   # Linux readahead hint
  
  # Thread pools
  scheduler:
    receiveChanSize: 1024
    unsolvedQueueSize: 1024
```

**MMAP Guidance:**
- ✅ Enable when: Memory constrained, cold data access
- ❌ Disable when: Low-latency requirements, hot data

### 4. Rate Limiting

Prevent cascade failures under load:

```yaml
quotaAndLimits:
  # Write limits
  dml:
    enabled: true
    insertRate:
      max: 4                    # MB/s per collection
    deleteRate:
      max: 0.5                  # MB/s per collection
  
  # Read limits
  dql:
    enabled: true
    searchRate:
      max: 100                  # queries per second per collection
    queryRate:
      max: 1000                 # queries per second per collection
  
  # Force deny when overloaded
  limitWriting:
    memProtection:
      enabled: true
      dataNodeMemoryLowWaterLevel: 0.85
      dataNodeMemoryHighWaterLevel: 0.95
```

## Configuration by Workload

### High-Throughput Ingestion

```yaml
dataCoord:
  segment:
    maxSize: 2048               # Larger segments
    sealProportion: 0.25        # Seal less frequently
    
dataNode:
  sync:
    maxParallelSyncMgrTasks: 256
  
proxy:
  maxTaskNum: 1024              # More concurrent tasks
```

### Low-Latency Search

```yaml
queryNode:
  mmap:
    vectorIndex: false          # Keep indexes in memory
    scalarIndex: false
  
  cache:
    memoryLimit: 8589934592     # 8GB cache

dataCoord:
  segment:
    maxSize: 512                # Smaller segments = faster load
    sealProportion: 0.10        # Seal quickly for freshness
```

### Memory-Constrained

```yaml
queryNode:
  mmap:
    vectorField: true
    vectorIndex: true
    scalarField: true
    scalarIndex: true
  
  cache:
    memoryLimit: 2147483648     # 2GB cache

dataCoord:
  segment:
    maxSize: 512                # Smaller segments
```

## Applying Configuration

### Docker Compose

```yaml
services:
  milvus-standalone:
    volumes:
      - ./milvus.yaml:/milvus/configs/milvus.yaml
```

### Kubernetes Helm

```yaml
# values.yaml
config:
  dataCoord:
    segment:
      maxSize: 2048
  
extraConfigFiles:
  milvus.yaml: |
    queryNode:
      mmap:
        vectorField: true
```

### Verify Applied Config

```bash
# Check running config via metrics
curl http://milvus:9091/metrics | grep milvus_config
```

## Common Configuration Mistakes

### 1. Wrong etcd Root Path

```yaml
# WRONG - different clusters sharing etcd
etcd:
  rootPath: by-dev

# CORRECT - unique path per cluster
etcd:
  rootPath: milvus-prod-cluster-1
```

### 2. Ignoring Memory Limits

```yaml
# WRONG - no limits, can OOM
queryNode: {}

# CORRECT - explicit limits
queryNode:
  cache:
    memoryLimit: 4294967296
```

### 3. Wrong Segment Sizing

```yaml
# WRONG - too small for large vectors
dataCoord:
  segment:
    maxSize: 128

# CORRECT - size based on vector dimensions
dataCoord:
  segment:
    maxSize: 2048  # For 1024d vectors
```

## Debugging Configuration

### View Effective Configuration

```bash
# From metrics endpoint
curl -s http://milvus:9091/metrics | grep "milvus_config_" | head -20

# From log on startup
docker logs milvus-standalone | grep -i "config"
```

### Configuration Reload

Most changes require restart:
```bash
docker restart milvus-standalone

# Or rolling restart in K8s
kubectl rollout restart deployment/milvus-proxy
```

Some parameters are dynamic (check logs for "dynamic update").

## Next Steps

Dive deeper into component-specific configuration:

→ **[Proxy Configuration](./proxy)**
