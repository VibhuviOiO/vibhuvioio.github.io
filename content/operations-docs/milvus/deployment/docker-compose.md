---
title: "Docker Compose — Full Stack Deployment"
description: "Deploy complete Milvus stack with Docker Compose — all components running separately for production-like environments."
duration: "25m"
readingTime: "15m"
labTime: "10m"
order: 3
---

# Docker Compose — Full Stack Deployment

This deployment runs all Milvus components as separate services — the same architecture as Kubernetes, but on a single Docker host. It's ideal for:

- Pre-production environments
- Learning the distributed architecture
- Small production deployments (up to ~50M vectors)

## Architecture Overview

Unlike Standalone, this setup runs components in separate containers — each service is isolated and can be scaled independently:

___MILVUS_DEPLOYMENT_ARCHITECTURE___

## Docker Compose Configuration

Create `docker-compose.yml`:

```yaml
version: '3.5'

services:
  # ============================================
  # etcd Cluster (3 nodes for HA)
  # ============================================
  etcd-0:
    container_name: milvus-etcd-0
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
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
      - ETCD_QUOTA_BACKEND_BYTES=4294967296
    volumes:
      - ./etcd-0-data:/etcd-data
    healthcheck:
      test: ["CMD", "etcdctl", "endpoint", "health"]
      interval: 10s
      timeout: 5s
      retries: 5

  etcd-1:
    container_name: milvus-etcd-1
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
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
      - ETCD_QUOTA_BACKEND_BYTES=4294967296
    volumes:
      - ./etcd-1-data:/etcd-data
    healthcheck:
      test: ["CMD", "etcdctl", "endpoint", "health"]
      interval: 10s
      timeout: 5s
      retries: 5

  etcd-2:
    container_name: milvus-etcd-2
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
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
      - ETCD_QUOTA_BACKEND_BYTES=4294967296
    volumes:
      - ./etcd-2-data:/etcd-data
    healthcheck:
      test: ["CMD", "etcdctl", "endpoint", "health"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============================================
  # MinIO (Object Storage)
  # ============================================
  minio:
    container_name: milvus-minio
    image: minio/minio:RELEASE.2024-12-18T13-15-44Z
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    command: minio server /data --console-address ":9001"
    volumes:
      - ./minio-data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============================================
  # Pulsar (Message Queue)
  # ============================================
  pulsar:
    container_name: milvus-pulsar
    image: apachepulsar/pulsar:3.0.7
    command: >
      /bin/bash -c "
      bin/apply-config-from-env.py conf/standalone.conf && \
      exec bin/pulsar standalone"
    environment:
      PULSAR_STANDALONE_USE_ZOOKEEPER: "false"
      PULSAR_MEM: " -Xms512m -Xmx512m -XX:MaxDirectMemorySize=1g"
    volumes:
      - ./pulsar-data:/pulsar/data
    healthcheck:
      test: ["CMD", "bin/pulsar-admin", "brokers", "healthcheck"]
      interval: 30s
      timeout: 10s
      retries: 5

  # ============================================
  # Milvus Components
  # ============================================
  proxy:
    container_name: milvus-proxy
    image: milvusdb/milvus:v2.5.4
    command: ["milvus", "run", "proxy"]
    environment:
      ETCD_ENDPOINTS: etcd-0:2379,etcd-1:2379,etcd-2:2379
      MINIO_ADDRESS: minio:9000
      PULSAR_ADDRESS: pulsar://pulsar:6650
    ports:
      - "19530:19530"
      - "9091:9091"
    depends_on:
      - etcd-0
      - etcd-1
      - etcd-2
      - minio
      - pulsar

  rootcoord:
    container_name: milvus-rootcoord
    image: milvusdb/milvus:v2.5.4
    command: ["milvus", "run", "rootcoord"]
    environment:
      ETCD_ENDPOINTS: etcd-0:2379,etcd-1:2379,etcd-2:2379
      MINIO_ADDRESS: minio:9000
      PULSAR_ADDRESS: pulsar://pulsar:6650
    depends_on:
      - etcd-0
      - etcd-1
      - etcd-2
      - minio
      - pulsar

  querycoord:
    container_name: milvus-querycoord
    image: milvusdb/milvus:v2.5.4
    command: ["milvus", "run", "querycoord"]
    environment:
      ETCD_ENDPOINTS: etcd-0:2379,etcd-1:2379,etcd-2:2379
      MINIO_ADDRESS: minio:9000
      PULSAR_ADDRESS: pulsar://pulsar:6650
    depends_on:
      - etcd-0
      - etcd-1
      - etcd-2
      - minio
      - pulsar

  querynode:
    container_name: milvus-querynode
    image: milvusdb/milvus:v2.5.4
    command: ["milvus", "run", "querynode"]
    environment:
      ETCD_ENDPOINTS: etcd-0:2379,etcd-1:2379,etcd-2:2379
      MINIO_ADDRESS: minio:9000
      PULSAR_ADDRESS: pulsar://pulsar:6650
    depends_on:
      - etcd-0
      - etcd-1
      - etcd-2
      - minio
      - pulsar

  datacoord:
    container_name: milvus-datacoord
    image: milvusdb/milvus:v2.5.4
    command: ["milvus", "run", "datacoord"]
    environment:
      ETCD_ENDPOINTS: etcd-0:2379,etcd-1:2379,etcd-2:2379
      MINIO_ADDRESS: minio:9000
      PULSAR_ADDRESS: pulsar://pulsar:6650
    depends_on:
      - etcd-0
      - etcd-1
      - etcd-2
      - minio
      - pulsar

  datanode:
    container_name: milvus-datanode
    image: milvusdb/milvus:v2.5.4
    command: ["milvus", "run", "datanode"]
    environment:
      ETCD_ENDPOINTS: etcd-0:2379,etcd-1:2379,etcd-2:2379
      MINIO_ADDRESS: minio:9000
      PULSAR_ADDRESS: pulsar://pulsar:6650
    depends_on:
      - etcd-0
      - etcd-1
      - etcd-2
      - minio
      - pulsar

  indexcoord:
    container_name: milvus-indexcoord
    image: milvusdb/milvus:v2.5.4
    command: ["milvus", "run", "indexcoord"]
    environment:
      ETCD_ENDPOINTS: etcd-0:2379,etcd-1:2379,etcd-2:2379
      MINIO_ADDRESS: minio:9000
    depends_on:
      - etcd-0
      - etcd-1
      - etcd-2
      - minio

  indexnode:
    container_name: milvus-indexnode
    image: milvusdb/milvus:v2.5.4
    command: ["milvus", "run", "indexnode"]
    environment:
      ETCD_ENDPOINTS: etcd-0:2379,etcd-1:2379,etcd-2:2379
      MINIO_ADDRESS: minio:9000
    depends_on:
      - etcd-0
      - etcd-1
      - etcd-2
      - minio

networks:
  default:
    name: milvus-distributed
```

## Deployment Steps

### 1. Prepare Directories

```bash
mkdir -p etcd-0-data etcd-1-data etcd-2-data minio-data pulsar-data
```

### 2. Start Services

```bash
# Start in dependency order
docker compose up -d etcd-0 etcd-1 etcd-2
sleep 10

docker compose up -d minio pulsar
sleep 10

docker compose up -d rootcoord datacoord querycoord indexcoord
sleep 5

docker compose up -d proxy querynode datanode indexnode
```

### 3. Verify Deployment

```bash
# Check all containers
docker compose ps

# Check etcd cluster health
docker exec milvus-etcd-0 etcdctl endpoint health --cluster

# Check Milvus logs
docker logs milvus-proxy -f
```

> **Expected Output:**
> ```
> milvus-etcd-0       healthy
> milvus-etcd-1       healthy
> milvus-etcd-2       healthy
> milvus-minio        healthy
> milvus-pulsar       healthy
> milvus-proxy        healthy
> ...
> ```

## Scaling Components

Add more Query Nodes for read scaling:

```yaml
  querynode-2:
    container_name: milvus-querynode-2
    image: milvusdb/milvus:v2.5.4
    command: ["milvus", "run", "querynode"]
    environment:
      ETCD_ENDPOINTS: etcd-0:2379,etcd-1:2379,etcd-2:2379
      MINIO_ADDRESS: minio:9000
      PULSAR_ADDRESS: pulsar://pulsar:6650
```

Scale with:
```bash
docker compose up -d querynode-2
```

## Resource Requirements

| Component | CPU | RAM | Disk |
|-----------|-----|-----|------|
| etcd (×3) | 0.5 | 1 GB | 10 GB |
| MinIO | 1 | 2 GB | 500+ GB |
| Pulsar | 1 | 2 GB | 50 GB |
| Proxy | 0.5 | 1 GB | - |
| Each Coordinator | 0.5 | 1 GB | - |
| QueryNode | 2 | 8 GB | - |
| DataNode | 1 | 2 GB | - |
| IndexNode | 2 | 4 GB | - |

**Total minimum:** 8 CPU, 24 GB RAM

## Production Considerations

This setup is suitable for:
- Development with production-like architecture
- Small production (<50M vectors)
- Learning and testing

For production, consider:
- Running etcd on dedicated hosts or using managed etcd
- Using managed S3 instead of MinIO
- Using managed Pulsar or Kafka
- Kubernetes for better orchestration

## Next Steps

Learn about each dependency in detail:

→ **[etcd — Metadata Store](../deps/etcd)**

Or deploy on Kubernetes:

→ **[Helm on Kubernetes](./helm)**
