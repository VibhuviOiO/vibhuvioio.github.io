---
title: "Qdrant Operations — Course Overview"
description: "Master Qdrant — the open-source vector database. Deploy with Docker, Kubernetes, configure for performance, and manage production clusters."
duration: "15m"
readingTime: "15m"
labTime: "0m"
order: 1
---

# Qdrant Operations

**Qdrant is the open-source vector database built for performance.** Written in Rust, it offers sub-millisecond query latency, flexible deployment options, and a rich feature set for production workloads.

## What You'll Learn

By the end of this course, you will:

- **Deploy** Qdrant with Docker, Docker Compose, and Kubernetes
- **Configure** storage, memory, and performance parameters
- **Cluster** Qdrant for high availability and horizontal scaling
- **Optimize** vector search with quantization and indexing
- **Secure** deployments with TLS and authentication
- **Monitor** and troubleshoot production issues

## Why This Course Exists

Qdrant has excellent documentation but production operations require understanding:

- **Storage options** — In-memory vs on-disk vs hybrid
- **Clustering** — Sharding, replication, and consistency
- **Resource sizing** — Memory requirements for HNSW indexes
- **Configuration** — The config.yaml has 100+ parameters
- **Backup strategies** — Snapshot and recovery procedures

This course fills those gaps with production-tested practices.

## Who This Course Is For

| Role | What You'll Get |
|------|-----------------|
| **ML Engineers** | Self-host vector stores with full control |
| **Platform Engineers** | Run reliable Qdrant infrastructure |
| **DevOps/SRE** | Deploy, scale, and monitor Qdrant clusters |
| **AI Product Teams** | Understand self-hosting vs managed tradeoffs |

## Prerequisites

Before starting, you should be comfortable with:

- **Docker and Docker Compose** — Running containers
- **Kubernetes basics** — Pods, services, Helm charts
- **Rust basics** (helpful but not required) — Understanding memory concepts
- **Vector embeddings** — What they are and how they're used

## Course Structure

This course is organized into **6 phases**:

### Phase 1: Introduction
- Course overview and Qdrant's architecture
- Understanding deployment options

### Phase 2: Deployment Options
- **Docker** — Single container deployment
- **Docker Compose** — With persistent storage
- **Kubernetes** — Helm charts and production setup

### Phase 3: Configuration
- Configuration file deep dive
- Storage and memory options
- Performance tuning parameters

### Phase 4: Data Operations
- Collections and points (vectors)
- Vector types and quantization
- Payload filtering and indexes

### Phase 5: Distributed Qdrant
- Clustering concepts and setup
- Sharding strategies
- Replication and high availability
- Scaling operations

### Phase 6: Production Operations
- Backup and restore
- Monitoring with Prometheus
- Security and TLS
- Troubleshooting

## Qdrant Architecture

```
┌─────────────────────────────────────────────┐
│              Qdrant Server                   │
│  ┌─────────────┐  ┌───────────────────────┐ │
│  │   HTTP/gRPC │  │      Collections      │ │
│  │     API     │  │  ┌─────┐ ┌─────┐     │ │
│  └──────┬──────┘  │  │Coll │ │Coll │ ... │ │
│         │         │  │  A  │ │  B  │     │ │
│         ▼         │  └──┬──┘ └──┬──┘     │ │
│  ┌─────────────┐  │     │       │        │ │
│  │  HNSW Index │  │  ┌──┴───────┴──┐     │ │
│  │  (in-mem)   │  │  │   Storage   │     │ │
│  └─────────────┘  │  │  (memmap/   │     │ │
│                   │  │   disk)     │     │ │
│                   │  └─────────────┘     │ │
│                   └───────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Deployment Options

### 1. Docker (Development)
```bash
docker run -p 6333:6333 qdrant/qdrant
```

### 2. Docker Compose (Small Production)
- Persistent volumes
- Environment configuration
- Single-node with snapshots

### 3. Kubernetes (Production)
- Helm chart deployment
- StatefulSet for data persistence
- Horizontal scaling with clustering

### 4. Qdrant Cloud (Managed)
- Fully managed option
- Automatic backups
- Monitoring included

## Key Features

| Feature | Description |
|---------|-------------|
| **HNSW** | Approximate nearest neighbor search |
| **Quantization** | Scalar & product quantization for memory savings |
| **Filtering** | Payload-based pre-filtering and post-filtering |
| **Multitenancy** | Namespace support for isolation |
| **Distributed** | Built-in clustering with Raft consensus |

## Comparison with Alternatives

| Aspect | Qdrant | Milvus | Pinecone |
|--------|--------|--------|----------|
| **Open Source** | ✅ Yes | ✅ Yes | ❌ No |
| **Self-Hosted** | ✅ Yes | ✅ Yes | ❌ No |
| **Language** | Rust | Go | N/A |
| **Best For** | Performance | Scale | Simplicity |

## Getting Started

Ready to start? The next section covers the [Course Roadmap](./roadmap) with the learning path.

Or jump directly to deployment:
- [Docker Deployment](./deployment/docker) — Quick start
- [Docker Compose](./deployment/docker-compose) — With persistence
- [Kubernetes](./deployment/kubernetes) — Production setup

## Resources

- [Qdrant Official Docs](https://qdrant.tech/documentation/)
- [Qdrant GitHub](https://github.com/qdrant/qdrant)
- [Course GitHub Repository](https://github.com/VibhuviOiO/qdrant-ops)
