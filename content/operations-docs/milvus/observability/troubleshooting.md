---
title: "Common Issues"
description: "Troubleshoot common Milvus problems. Connection issues, slow queries, memory problems, and crash recovery."
duration: "30m"
readingTime: "15m"
labTime: "15m"
order: 2
---

# Common Issues

This guide covers the most common Milvus problems and their solutions.

## Issue: Cannot Connect to Milvus

### Symptoms
```python
from pymilvus import MilvusClient
client = MilvusClient("http://localhost:19530")
# ERROR: Connection timeout
```

### Diagnosis

```bash
# Check if Milvus is running
docker ps | grep milvus

# Check port listening
netstat -tlnp | grep 19530

# Check logs
docker logs milvus-standalone | tail -50
```

### Solutions

**1. Milvus not started:**
```bash
docker compose up -d
```

**2. Wrong port/host:**
```python
# Check the correct endpoint
client = MilvusClient("http://192.168.1.100:19530")  # Not localhost
```

**3. Firewall blocking:**
```bash
# Open port
sudo ufw allow 19530/tcp
```

## Issue: Collection Not Found

### Symptoms
```python
client.search("my_collection", data=[vector])
# ERROR: collection not found
```

### Diagnosis
```python
# List collections
print(client.list_collections())

# Check if collection exists
if "my_collection" not in client.list_collections():
    print("Collection doesn't exist!")
```

### Solutions

**1. Collection not created:**
```python
# Create collection
client.create_collection("my_collection", dimension=384)
```

**2. Wrong collection name:**
```python
# Check for typos
assert collection_name in client.list_collections()
```

**3. etcd data loss:**
→ Restore from [etcd backup](../backup/backup-strategies)

## Issue: Query Returns No Results

### Symptoms
```python
results = client.search("collection", data=[query], limit=10)
print(results)  # Empty or unexpected
```

### Diagnosis

```python
# Check if collection is loaded
print(client.get_load_state("collection"))

# Check entity count
print(client.get_collection_stats("collection"))

# Check if index exists
print(client.list_indexes("collection"))
```

### Solutions

**1. Collection not loaded:**
```python
client.load_collection("collection")
```

**2. No index on vector field:**
```python
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="vector",
    index_type="HNSW",
    metric_type="COSINE"
)
client.create_index("collection", index_params)
client.load_collection("collection")
```

**3. Empty collection:**
```python
stats = client.get_collection_stats("collection")
print(f"Entity count: {stats['row_count']}")
```

## Issue: Slow Queries

### Symptoms
- Queries take >1 second
- CPU usage spikes
- Timeout errors

### Diagnosis

```bash
# Check QueryNode resources
docker stats milvus-querynode

# Check segment count
curl http://milvus:9091/metrics | grep segment

# Check for compaction backlog
curl http://milvus:9091/metrics | grep compaction
```

### Solutions

**1. Too many small segments:**
```python
# Trigger compaction
client.compact("collection")
```

**2. Insufficient QueryNode resources:**
```yaml
# docker-compose.yml
querynode:
  deploy:
    resources:
      limits:
        memory: 32G
```

**3. Suboptimal index:**
```python
# Use HNSW for faster search
index_params.add_index(
    field_name="vector",
    index_type="HNSW",
    params={"M": 16, "efConstruction": 200}
)
```

## Issue: Out of Memory

### Symptoms
- Container killed by OOM
- `MemoryError` in logs
- System swapping

### Diagnosis

```bash
# Check memory usage
docker stats

# Check OOM kills
dmesg | grep -i "out of memory"

# Check Milvus memory metrics
curl http://milvus:9091/metrics | grep memory
```

### Solutions

**1. Enable MMAP:**
```yaml
# milvus.yaml
queryNode:
  mmap:
    vectorField: true
    vectorIndex: true
```

**2. Reduce cache size:**
```yaml
queryNode:
  cache:
    memoryLimit: 4294967296  # 4GB instead of unlimited
```

**3. Smaller segments:**
```yaml
dataCoord:
  segment:
    maxSize: 512  # Smaller segments
```

**4. Add more QueryNodes:**
```bash
# Scale horizontally
kubectl scale deployment milvus-querynode --replicas=5
```

## Issue: etcd Connection Errors

### Symptoms
```
ERROR: etcdserver: mvcc: database space exceeded
ERROR: context deadline exceeded
```

### Diagnosis

```bash
# Check etcd health
docker exec milvus-etcd etcdctl endpoint health

# Check etcd size
docker exec milvus-etcd etcdctl endpoint status --write-out table
```

### Solutions

**1. Compact etcd:**
```bash
docker exec milvus-etcd etcdctl compaction $(date +%s)
docker exec milvus-etcd etcdctl defrag
```

**2. Increase quota:**
```yaml
# docker-compose.yml
etcd:
  environment:
    - ETCD_QUOTA_BACKEND_BYTES=8589934592  # 8GB
```

**3. Enable auto-compaction:**
```yaml
etcd:
  environment:
    - ETCD_AUTO_COMPACTION_MODE=revision
    - ETCD_AUTO_COMPACTION_RETENTION=1000
```

## Issue: Data Loss After Restart

### Symptoms
- Collections missing after restart
- Vectors returned but data empty

### Diagnosis

```bash
# Check volume mounts
docker inspect milvus-standalone | grep -A 10 Mounts

# Check data directories
ls -la milvus_data/
ls -la minio_data/
```

### Solutions

**1. Ensure persistent volumes:**
```yaml
services:
  milvus:
    volumes:
      - ./milvus_data:/var/lib/milvus  # Must persist!
```

**2. Don't use `docker run --rm` for data:**
```bash
# WRONG - data lost on stop
docker run --rm milvusdb/milvus

# CORRECT - named volume
docker run -v milvus_data:/var/lib/milvus milvusdb/milvus
```

## Issue: Import/Export Failures

### Symptoms
```python
client.bulk_insert("collection", files=["data.json"])
# ERROR: import failed
```

### Diagnosis

```bash
# Check MinIO is accessible
curl http://localhost:9000/minio/health/live

# Check file format
head -5 data.json
```

### Solutions

**1. Verify JSON format:**
```json
{"rows": [
  {"id": 1, "vector": [0.1, 0.2, ...], "field": "value"}
]}
```

**2. Check MinIO credentials:**
```yaml
minio:
  accessKeyID: minioadmin
  secretAccessKey: minioadmin
```

**3. Use correct file extension:**
```python
# Must be .json or .npy
client.bulk_insert("collection", files=["data.json"])
```

## Debugging Commands Cheat Sheet

```bash
# Milvus version
docker exec milvus-standalone milvus --version

# Component health
curl http://localhost:9091/healthz

# Metrics
curl http://localhost:9091/metrics | grep <metric_name>

# Container logs
docker logs -f milvus-standalone

# Resource usage
docker stats

# etcd operations
docker exec milvus-etcd etcdctl endpoint health
docker exec milvus-etcd etcdctl member list

# MinIO status
docker exec milvus-minio mc admin info local
```

## Getting Help

If issues persist:

1. **Check logs:** `docker logs milvus-standalone > milvus.log`
2. **Collect metrics:** `curl http://milvus:9091/metrics > metrics.txt`
3. **File issue:** [github.com/milvus-io/milvus/issues](https://github.com/milvus-io/milvus/issues)

Include:
- Milvus version
- Deployment mode (standalone/cluster)
- Error messages
- Reproduction steps
