---
title: "etcd — Metadata Store"
description: "Deep dive into etcd — Milvus's metadata storage. Learn configuration, backup, recovery, and sizing for production."
duration: "30m"
readingTime: "15m"
labTime: "15m"
order: 1
---

# etcd — Metadata Store

etcd is Milvus's brain. It stores:

- Collection schemas and metadata
- Segment information and states
- Coordination data (timestamps, leader election)
- Service registration and discovery

**If etcd fails, Milvus stops.** Understanding etcd is critical for reliable operations.

## Why etcd Matters

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Proxy     │────▶│    etcd     │◀────│  RootCoord  │
└─────────────┘     │  (metadata) │     └─────────────┘
┌─────────────┐     └─────────────┘     ┌─────────────┐
│  QueryNode  │                           │  DataCoord  │
└─────────────┘                           └─────────────┘
```

Every Milvus component depends on etcd:
- **Coordinators** store state and elect leaders
- **Workers** register themselves and discover work
- **Proxy** routes requests based on metadata

## Deployment Modes

### Single Node (Development Only)

```bash
docker run -d \
  --name etcd \
  -p 2379:2379 \
  -v etcd-data:/etcd-data \
  quay.io/coreos/etcd:v3.5.16 \
  etcd --data-dir /etcd-data \
       --listen-client-urls http://0.0.0.0:2379 \
       --advertise-client-urls http://localhost:2379
```

> **Warning:** Single-node etcd has no redundancy. Data loss on failure.

### Three-Node Cluster (Production Minimum)

```yaml
# docker-compose.yml snippet
services:
  etcd-0:
    image: quay.io/coreos/etcd:v3.5.16
    environment:
      - ETCD_NAME=etcd-0
      - ETCD_INITIAL_ADVERTISE_PEER_URLS=http://etcd-0:2380
      - ETCD_LISTEN_PEER_URLS=http://0.0.0.0:2380
      - ETCD_LISTEN_CLIENT_URLS=http://0.0.0.0:2379
      - ETCD_ADVERTISE_CLIENT_URLS=http://etcd-0:2379
      - ETCD_INITIAL_CLUSTER_TOKEN=etcd-cluster
      - ETCD_INITIAL_CLUSTER=etcd-0=http://etcd-0:2380,etcd-1=http://etcd-1:2380,etcd-2=http://etcd-2:2380
      - ETCD_INITIAL_CLUSTER_STATE=new
    volumes:
      - etcd-0-data:/etcd-data

  etcd-1:
    image: quay.io/coreos/etcd:v3.5.16
    environment:
      - ETCD_NAME=etcd-1
      - ETCD_INITIAL_ADVERTISE_PEER_URLS=http://etcd-1:2380
      - ETCD_LISTEN_PEER_URLS=http://0.0.0.0:2380
      - ETCD_LISTEN_CLIENT_URLS=http://0.0.0.0:2379
      - ETCD_ADVERTISE_CLIENT_URLS=http://etcd-1:2379
      - ETCD_INITIAL_CLUSTER_TOKEN=etcd-cluster
      - ETCD_INITIAL_CLUSTER=etcd-0=http://etcd-0:2380,etcd-1=http://etcd-1:2380,etcd-2=http://etcd-2:2380
      - ETCD_INITIAL_CLUSTER_STATE=new
    volumes:
      - etcd-1-data:/etcd-data

  etcd-2:
    image: quay.io/coreos/etcd:v3.5.16
    environment:
      - ETCD_NAME=etcd-2
      - ETCD_INITIAL_ADVERTISE_PEER_URLS=http://etcd-2:2380
      - ETCD_LISTEN_PEER_URLS=http://0.0.0.0:2380
      - ETCD_LISTEN_CLIENT_URLS=http://0.0.0.0:2379
      - ETCD_ADVERTISE_CLIENT_URLS=http://etcd-2:2379
      - ETCD_INITIAL_CLUSTER_TOKEN=etcd-cluster
      - ETCD_INITIAL_CLUSTER=etcd-0=http://etcd-0:2380,etcd-1=http://etcd-1:2380,etcd-2=http://etcd-2:2380
      - ETCD_INITIAL_CLUSTER_STATE=new
    volumes:
      - etcd-2-data:/etcd-data
```

## Key Configuration Parameters

### Auto-Compaction

etcd keeps all revision history. Without compaction, it grows indefinitely:

```bash
# Auto-compact every 1000 revisions
ETCD_AUTO_COMPACTION_MODE=revision
ETCD_AUTO_COMPACTION_RETENTION=1000

# Or time-based (compact hourly)
ETCD_AUTO_COMPACTION_MODE=periodic
ETCD_AUTO_COMPACTION_RETENTION=1h
```

> **Important:** Milvus requires compaction. Without it, etcd will run out of disk.

### Quota and Limits

```bash
# Set quota to 4GB (default is 2GB)
ETCD_QUOTA_BACKEND_BYTES=4294967296

# Snapshot count (when to create snapshot)
ETCD_SNAPSHOT_COUNT=50000
```

### Milvus-Specific Settings

In `milvus.yaml`:

```yaml
etcd:
  endpoints:
    - etcd-0:2379
    - etcd-1:2379
    - etcd-2:2379
  rootPath: by-dev              # Key prefix for Milvus data
  metaSubPath: meta             # Metadata subdirectory
  kvSubPath: kv                 # Key-value subdirectory
  
  # Authentication (if enabled)
  auth:
    enabled: false
    userName: ""
    password: ""
```

## Operations

### Check Cluster Health

```bash
# Single node health
docker exec etcd-0 etcdctl endpoint health

# Full cluster health
docker exec etcd-0 etcdctl endpoint health --cluster

# Expected:
# http://etcd-0:2379 is healthy
# http://etcd-1:2379 is healthy
# http://etcd-2:2379 is healthy
```

### Check Cluster Members

```bash
docker exec etcd-0 etcdctl member list

# Expected:
# 1234567890abcdef, started, etcd-0, http://etcd-0:2380, http://etcd-0:2379
# 1234567890abcd01, started, etcd-1, http://etcd-1:2380, http://etcd-1:2379
# 1234567890abcd02, started, etcd-2, http://etcd-2:2380, http://etcd-2:2379
```

### View Milvus Data

```bash
# List all keys (use with caution on large clusters)
docker exec etcd-0 etcdctl get --prefix "" --keys-only | head -20

# Get specific key
docker exec etcd-0 etcdctl get "by-dev/meta/collection/xxx"

# Watch changes in real-time
docker exec etcd-0 etcdctl watch "by-dev/meta" --prefix
```

## Backup and Recovery

### Snapshot Backup

**Method 1: Online Snapshot (Recommended)**

```bash
#!/bin/bash
# backup-etcd.sh

BACKUP_DIR="/backups/etcd/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Create snapshot
docker exec etcd-0 etcdctl snapshot save /tmp/etcd.snapshot

# Copy from container
docker cp etcd-0:/tmp/etcd.snapshot $BACKUP_DIR/

# Also backup cluster info
docker exec etcd-0 etcdctl member list > $BACKUP_DIR/members.txt

echo "Backup saved to $BACKUP_DIR"
```

**Method 2: Volume Backup (Offline)**

```bash
# Stop etcd (requires downtime)
docker compose stop etcd-0 etcd-1 etcd-2

# Backup volumes
tar czf etcd-backup-$(date +%Y%m%d).tar.gz etcd-0-data/ etcd-1-data/ etcd-2-data/

# Restart
docker compose start etcd-0 etcd-1 etcd-2
```

### Restore from Snapshot

```bash
#!/bin/bash
# restore-etcd.sh

SNAPSHOT_FILE="$1"
if [ -z "$SNAPSHOT_FILE" ]; then
    echo "Usage: $0 <snapshot-file>"
    exit 1
fi

# Stop Milvus first (critical!)
docker compose stop milvus-proxy milvus-rootcoord milvus-querycoord milvus-datacoord

# Stop etcd
docker compose stop etcd-0 etcd-1 etcd-2

# Clear old data
rm -rf etcd-0-data/* etcd-1-data/* etcd-2-data/*

# Restore to first node
docker run --rm \
  -v $(pwd)/etcd-0-data:/etcd-data \
  -v $(pwd)/$SNAPSHOT_FILE:/snapshot.db \
  quay.io/coreos/etcd:v3.5.16 \
  etcdctl snapshot restore /snapshot.db \
    --data-dir /etcd-data \
    --name etcd-0 \
    --initial-cluster etcd-0=http://etcd-0:2380,etcd-1=http://etcd-1:2380,etcd-2=http://etcd-2:2380 \
    --initial-cluster-token etcd-cluster \
    --initial-advertise-peer-urls http://etcd-0:2380

# Copy restored data to other nodes
cp -r etcd-0-data/* etcd-1-data/
cp -r etcd-0-data/* etcd-2-data/

# Start etcd
docker compose up -d etcd-0 etcd-1 etcd-2

# Wait for health
sleep 5
docker exec etcd-0 etcdctl endpoint health --cluster

# Start Milvus
docker compose up -d

echo "Restore complete"
```

## Sizing Guidelines

| Milvus Scale | etcd Nodes | CPU | RAM | Disk |
|--------------|------------|-----|-----|------|
| <1M vectors | 1 (dev) | 0.5 | 512 MB | 10 GB |
| <10M vectors | 3 | 1 | 2 GB | 20 GB |
| <100M vectors | 3 | 2 | 4 GB | 50 GB |
| >100M vectors | 3-5 | 4 | 8 GB | 100 GB |

**Key sizing factors:**
- Number of collections (not vectors)
- Number of segments
- Frequency of DDL operations

## Troubleshooting

### etcd is Slow

**Symptoms:** Milvus operations timeout, high latency

**Check:**
```bash
# Disk latency
docker exec etcd-0 etcdctl check perf

# Expected: <10ms for 90% of requests
```

**Solutions:**
- Use SSD (NVMe preferred)
- Ensure dedicated disk for etcd (not shared with other I/O)
- Increase CPU allocation

### "No space left on device"

**Cause:** etcd quota exceeded or no compaction

**Fix:**
```bash
# Check size
docker exec etcd-0 etcdctl endpoint status --write-out table

# Manual compaction
docker exec etcd-0 etcdctl compaction $(docker exec etcd-0 etcdctl endpoint status --write-out json | jq -r '.[0].Header.revision')

# Defragment
docker exec etcd-0 etcdctl defrag
```

### Leader Election Issues

**Symptoms:** Cluster unavailable, frequent leader changes

**Check:**
```bash
# Check network latency between nodes
for node in etcd-0 etcd-1 etcd-2; do
  docker exec etcd-0 ping -c 3 $node
done

# Check logs
docker logs etcd-0 | grep -i "leader"
```

**Common causes:**
- Network latency > 100ms between nodes
- Clock skew (ensure NTP sync)
- Resource starvation (CPU/memory)

### Member Recovery

If one etcd node fails permanently:

```bash
# Remove failed member
docker exec etcd-0 etcdctl member remove <member-id>

# Add new member
docker exec etcd-0 etcdctl member add etcd-new --peer-urls=http://etcd-new:2380

# Start new node with --initial-cluster-state=existing
docker run -d \
  --name etcd-new \
  -e ETCD_NAME=etcd-new \
  -e ETCD_INITIAL_CLUSTER_STATE=existing \
  -e ETCD_INITIAL_CLUSTER=etcd-0=http://etcd-0:2380,etcd-1=http://etcd-1:2380,etcd-new=http://etcd-new:2380 \
  # ... other env vars
  quay.io/coreos/etcd:v3.5.16
```

## Best Practices

1. **Always run 3+ nodes** for production (5 for very large clusters)
2. **Use dedicated SSD** for etcd data — latency matters
3. **Enable auto-compaction** — prevents unbounded growth
4. **Monitor etcd metrics** — leader changes, disk usage, latency
5. **Regular backups** — snapshots every 6-24 hours
6. **Keep etcd close to Milvus** — same datacenter, <10ms latency
7. **Don't share etcd** — dedicated instance per Milvus cluster

## Next Steps

Learn about object storage:

→ **[MinIO/S3 — Object Storage](./minio)**
