---
title: "Course Roadmap"
description: "What you'll deploy, configure, and operate — and who this course is for."
duration: "15m"
readingTime: "15m"
labTime: "0m"
order: 2
---

# Course Roadmap

This course is not a "what is a vector database" introduction — the internet has plenty of those. It's a hands-on operations guide: you deploy real Milvus instances, configure them correctly, scale them, secure them, and keep them running.

The interactive walkthrough below shows exactly what you'll be doing across each phase.

___MILVUS_COURSE_JOURNEY___

## What This Course Is Not

- A deep-dive into embedding models or vector similarity algorithms
- A machine learning or data science course
- Theory-heavy documentation without practical exercises

Every lesson follows a lab pattern: download config files, run commands, observe the result, understand what happened.

## Prerequisites

You'll get the most out of this course if you're comfortable with:

- **Linux command line** — navigate, edit files, run commands
- **Docker and Docker Compose** — pull images, run containers
- **YAML** — read and write configuration files
- **Kubernetes basics** — pods, services, Helm (for distributed sections)

## Phase-by-Phase Breakdown

### Phase 1: Introduction
**Duration:** 30 minutes

- Course overview and learning objectives
- Understanding the Milvus architecture
- Choosing your deployment mode

### Phase 2: Deployment Options
**Duration:** 2 hours

| Lesson | What You'll Do |
|--------|----------------|
| Milvus Lite | Install via pip, create a collection, insert vectors |
| Standalone | Deploy with Docker, configure persistence |
| Docker Compose | Full stack with etcd, MinIO, Pulsar |
| Helm on K8s | Production-grade Kubernetes deployment |

### Phase 3: Dependencies Deep Dive
**Duration:** 1 hour 30 minutes

Learn the external services Milvus depends on:

- **etcd**: Metadata storage — backup, restore, and cluster sizing
- **MinIO/S3**: Object storage — configuration, bucket policies, performance
- **Pulsar/Kafka**: Message queue — topic sizing, retention, failover

### Phase 4: Configuration Mastery
**Duration:** 1 hour 30 minutes

Demystify `milvus.yaml`:

- Proxy configuration for connection handling
- Coordinator tuning for your workload
- Segment management for optimal performance

### Phase 5: Data Operations
**Duration:** 1 hour 30 minutes

Design decisions that affect performance:

- Collection schemas and field types
- Partitioning for multi-tenant isolation
- Index selection guide (HNSW vs IVF vs DISKANN)

### Phase 6: Scaling & Cluster Operations
**Duration:** 1 hour 30 minutes

Grow your cluster:

- Add Query Nodes for read scaling
- Add Data Nodes for write throughput
- Rolling upgrades without downtime

### Phase 7: Performance Optimization
**Duration:** 1 hour

Tune for your workload:

- Query optimization techniques
- Memory management with MMAP
- Compaction tuning for write-heavy loads

### Phase 8: Security
**Duration:** 45 minutes

Protect your data:

- Enable authentication and RBAC
- Configure TLS for all connections

### Phase 9: Backup & Recovery
**Duration:** 1 hour

Prepare for disasters:

- Backup metadata (etcd) and data (MinIO)
- Cross-cluster migration procedures
- Point-in-time recovery

### Phase 10: Monitoring & Troubleshooting
**Duration:** 1 hour

Keep it running:

- Key metrics and Grafana dashboards
- Common issues and resolution steps
- Log analysis techniques

## The Lab Pattern

Every hands-on section follows this structure:

1. **Setup** — Get the configuration files from GitHub
2. **Deploy** — Run the commands to start services
3. **Verify** — Check that everything is healthy
4. **Experiment** — Run test workloads
5. **Observe** — Check logs, metrics, and behavior

## GitHub Repository

All configuration files, Docker Compose files, and scripts are available at:

**[github.com/VibhuviOiO/milvus-ops](https://github.com/VibhuviOiO/milvus-ops)**

Each lesson links to the specific directory you need.

## Next Steps

Ready to start deploying? Choose your path:

- **[Milvus Lite](./deployment/lite)** — If you want to start coding immediately
- **[Standalone](./deployment/standalone)** — If you want a simple production setup
- **[Docker Compose](./deployment/docker-compose)** — If you want the full stack locally
