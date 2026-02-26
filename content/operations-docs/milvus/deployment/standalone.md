---
title: "Standalone — Single Server Deployment"
description: "Deploy Milvus Standalone on a single server with Docker. Best for small production workloads up to 100M vectors."
duration: "30m"
readingTime: "15m"
labTime: "15m"
order: 2
---

# Standalone — Single Server Deployment

Milvus Standalone runs all components in a single Docker container. It's the simplest production deployment — one server, one command, up to 100M vectors.

## When to Use Standalone

| Use Case | Good Fit? |
|----------|-----------|
| Production <100M vectors | ✅ Perfect |
| Development/staging | ✅ Perfect |
| No Kubernetes expertise | ✅ Perfect |
| Need HA/failover | ❌ Use Distributed |
| >100M vectors | ❌ Use Distributed |
| Multi-AZ deployment | ❌ Use Distributed |

## Architecture

Standalone includes everything in one container — all Milvus components, embedded etcd, and embedded MinIO run within a single Docker container:

___MILVUS_DEPLOYMENT_ARCHITECTURE___

### How Data Flows Through Standalone Mode

See how different operations work in standalone deployment. Click on the tabs below to watch request flows:

___MILVUS_INTERACTIVE_ARCHITECTURE___

## Quick Start

### 1. Create Docker Compose File

Create `docker-compose.yml`:

```yaml
version: '3.5'

services:
  milvus-standalone:
    container_name: milvus-standalone
    image: milvusdb/milvus:v2.5.4
    command: ["milvus", "run", "standalone"]
    security_opt:
      - seccomp:unconfined
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
    volumes:
      - ./milvus_data:/var/lib/milvus
    ports:
      - "19530:19530"
      - "9091:9091"
    depends_on:
      - etcd
      - minio

  etcd:
    container_name: milvus-etcd
    image: quay.io/coreos/etcd:v3.5.16
    environment:
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
      - ETCD_QUOTA_BACKEND_BYTES=4294967296
      - ETCD_SNAPSHOT_COUNT=50000
    volumes:
      - ./etcd_data:/etcd
    command: etcd -advertise-client-urls=http://127.0.0.1:2379 -listen-client-urls http://0.0.0.0:2379 --data-dir /etcd
    healthcheck:
      test: ["CMD", "etcdctl", "endpoint", "health"]
      interval: 30s
      timeout: 20s
      retries: 3

  minio:
    container_name: milvus-minio
    image: minio/minio:RELEASE.2024-12-18T13-15-44Z
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - ./minio_data:/data
    command: minio server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

networks:
  default:
    name: milvus
```

### 2. Start the Services

```bash
# Create data directories
mkdir -p milvus_data etcd_data minio_data

# Start
docker compose up -d

# Check status
docker compose ps
```

> **Expected Output:**
> ```
> NAME                STATUS
> milvus-standalone   healthy
> milvus-etcd         healthy
> milvus-minio        healthy
> ```

### 3. Verify Deployment

```bash
# Check Milvus logs
docker logs milvus-standalone -f

# Wait for "Milvus Proxy successfully initialized"
```

### 4. Test Connection

Create `test_connection.py`:

```python
from pymilvus import MilvusClient, DataType

# Connect to standalone
client = MilvusClient(uri="http://localhost:19530")

# Check server version
print(f"Connected to Milvus: {client.get_server_version()}")

# Create a test collection
schema = client.create_schema(auto_id=True)
schema.add_field("id", DataType.INT64, is_primary=True)
schema.add_field("vector", DataType.FLOAT_VECTOR, dim=128)

client.create_collection("test", schema=schema)
print("Test collection created successfully!")

# List collections
print(f"Collections: {client.list_collections()}")
```

```bash
python test_connection.py
```

> **Expected Output:**
> ```
> Connected to Milvus: 2.5.4
> Test collection created successfully!
> Collections: ['test']
> ```

## Directory Structure

After deployment, your directory looks like:

```
milvus-standalone/
├── docker-compose.yml
├── milvus_data/          # Milvus local storage
├── etcd_data/            # etcd metadata
└── minio_data/           # Object storage
```

## Resource Requirements

Minimum for testing:
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Disk:** 20 GB SSD

Recommended for production:
- **CPU:** 8+ cores
- **RAM:** 32+ GB
- **Disk:** 500 GB+ NVMe SSD
- **Network:** 1 Gbps

Memory sizing rule: 
- Base overhead: ~2 GB
- Per 10M vectors (384-dim, HNSW): ~4-6 GB
- For 100M vectors: 32-64 GB RAM recommended

## Configuration

### Custom milvus.yaml

For advanced tuning, mount a custom config:

```yaml
services:
  milvus-standalone:
    # ... other config
    volumes:
      - ./milvus_data:/var/lib/milvus
      - ./milvus.yaml:/milvus/configs/milvus.yaml  # Custom config
```

Download the default config first:

```bash
curl -o milvus.yaml https://raw.githubusercontent.com/milvus-io/milvus/v2.5.4/configs/milvus.yaml
```

### Environment Variables

Key variables you might change:

| Variable | Default | Description |
|----------|---------|-------------|
| `ETCD_ENDPOINTS` | `etcd:2379` | etcd connection |
| `MINIO_ADDRESS` | `minio:9000` | MinIO connection |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO credentials |
| `MINIO_SECRET_KEY` | `minioadmin` | MinIO credentials |

## Storage Considerations

### Disk Sizing

Estimate disk usage:

```
Raw vectors: vectors × dimension × 4 bytes
HNSW index: raw_vectors × 1.5-2.0
Total: raw_vectors + index + overhead
```

Example: 10M vectors, 768 dimensions
- Raw: 10M × 768 × 4 = 29 GB
- Index: 29 GB × 1.8 = 52 GB
- Total: ~80-100 GB

### Storage Performance

Milvus is I/O intensive. Use:
- **NVMe SSD** strongly recommended
- **Avoid:** Network-attached storage for hot data
- **IOPS:** 10K+ IOPS for query workloads

## Backup Strategy

### Automated Backup Script

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/milvus/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Stop Milvus (for consistency)
docker compose stop milvus-standalone

# Backup data directories
tar czf $BACKUP_DIR/milvus.tar.gz milvus_data/
tar czf $BACKUP_DIR/etcd.tar.gz etcd_data/
tar czf $BACKUP_DIR/minio.tar.gz minio_data/

# Restart
docker compose start milvus-standalone

# Cleanup old backups (keep 7 days)
find /backups/milvus -type d -mtime +7 -exec rm -rf {} + 2>/dev/null

echo "Backup completed: $BACKUP_DIR"
```

### Restore from Backup

```bash
# Stop services
docker compose down

# Restore data
rm -rf milvus_data/ etcd_data/ minio_data/
tar xzf /backups/milvus/20240115_120000/milvus.tar.gz
tar xzf /backups/milvus/20240115_120000/etcd.tar.gz
tar xzf /backups/milvus/20240115_120000/minio.tar.gz

# Start
docker compose up -d
```

## Monitoring

### Basic Health Check

```bash
# Check if Milvus is responding
curl -s http://localhost:9091/healthz

# Expected: {"status":"healthy"}
```

### Metrics Endpoint

Milvus exposes Prometheus metrics at `:9091/metrics`:

```bash
curl -s http://localhost:9091/metrics | grep milvus_
```

Key metrics to watch:
- `milvus_proxy_receive_bytes_total` — Ingress traffic
- `milvus_proxy_insert_vectors_count` — Insert rate
- `milvus_querynode_search_latency` — Query latency

## Troubleshooting

### Container Won't Start

Check logs:
```bash
docker logs milvus-standalone
```

Common issues:
- Port conflict: Change ports in docker-compose.yml
- Permission denied: Check directory ownership
- Out of memory: Increase Docker memory limit

### Slow Queries

Check resource usage:
```bash
docker stats milvus-standalone
```

Likely causes:
- Insufficient RAM (check swap usage)
- Slow disk I/O
- CPU throttling

### Data Loss on Restart

Ensure volumes are correctly mounted:
```bash
docker inspect milvus-standalone | grep -A 10 Mounts
```

## Upgrading

### Minor Version Update

```bash
# Pull new image
docker compose pull

# Recreate with new image
docker compose up -d
```

### Major Version Migration

Check the [Milvus migration guide](https://milvus.io/docs/upgrade_milvus_cluster-helm.md) first. Major versions may require:
- Data migration
- Configuration changes
- API updates

## Next Steps

Now you have a running Milvus instance. Learn about the dependencies in detail:

→ **[etcd — Metadata Store](../deps/etcd)**

Or explore the full distributed setup:

→ **[Docker Compose Setup](./docker-compose)**
