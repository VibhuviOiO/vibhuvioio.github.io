---
title: "Course Roadmap"
description: "What you'll learn in the Qdrant Operations course — from Docker deployment to distributed clusters."
duration: "15m"
readingTime: "15m"
labTime: "0m"
order: 2
---

# Qdrant Course Roadmap

This course teaches you to deploy and operate Qdrant — from a single Docker container to distributed clusters on Kubernetes.

## Phase-by-Phase Breakdown

### Phase 1: Introduction (30 minutes)
| Lesson | What You'll Do |
|--------|----------------|
| Course Overview | Understand Qdrant's architecture and advantages |
| Course Roadmap | Map out the learning journey |

### Phase 2: Deployment Options (1.5 hours)
| Lesson | What You'll Do |
|--------|----------------|
| Docker Deployment | Run Qdrant in a single container |
| Docker Compose | Multi-service setup with persistence |
| Kubernetes with Helm | Production deployment on K8s |

**Lab:** Deploy Qdrant three ways and compare.

### Phase 3: Configuration (1 hour)
| Lesson | What You'll Do |
|--------|----------------|
| Configuration File | Master config.yaml parameters |
| Storage & Memory | Configure storage options |
| Performance Tuning | Optimize for your workload |

### Phase 4: Data Operations (1 hour)
| Lesson | What You'll Do |
|--------|----------------|
| Collections & Points | Create collections, insert vectors |
| Vector Types & Quantization | Scalar and product quantization |
| Payload & Filtering | Index payloads, filter queries |

**Lab:** Build a semantic search system with payload filtering.

### Phase 5: Distributed Qdrant (1.5 hours)
| Lesson | What You'll Do |
|--------|----------------|
| Clustering Concepts | Understand distributed architecture |
| Sharding Strategy | Configure sharding for your data |
| Replication & HA | Set up replicas for high availability |
| Scaling Operations | Add and remove nodes |

**Lab:** Create a 3-node Qdrant cluster.

### Phase 6: Production Operations (1.5 hours)
| Lesson | What You'll Do |
|--------|----------------|
| Backup & Restore | Snapshot and recovery procedures |
| Monitoring & Metrics | Prometheus and Grafana setup |
| Security & TLS | Enable authentication and encryption |
| Troubleshooting | Debug common issues |

**Lab:** Set up monitoring and alerts for your cluster.

## The Qdrant Learning Path

___QDRANT_LEARNING_PATH___

## Key Skills You'll Gain

- **Docker Deployment** — Run Qdrant locally and in production
- **Kubernetes Setup** — Helm charts and production patterns
- **Configuration** — Tune 100+ config parameters
- **Clustering** — Distribute data across multiple nodes
- **Performance** — Quantization, indexing, and query optimization
- **Monitoring** — Metrics, logs, and alerting

## Prerequisites Checklist

Before starting hands-on labs:
- [ ] Docker and Docker Compose installed
- [ ] kubectl installed (for Kubernetes sections)
- [ ] Helm 3.x installed
- [ ] A Kubernetes cluster (kind, minikube, or cloud)
- [ ] Python 3.8+ installed

## Next Steps

Ready to start? Jump to:
- [Docker Deployment](./deployment/docker) — Quick start
- [Docker Compose](./deployment/docker-compose) — With persistence
- [Kubernetes](./deployment/kubernetes) — Production setup

Or continue with the overview:
- [Course Overview](./overview) — Understand Qdrant's architecture
