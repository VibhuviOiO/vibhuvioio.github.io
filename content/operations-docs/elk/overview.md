---
title: ELK Stack Operations - Course Overview
description: Master Elasticsearch, Logstash, and Kibana for production operations
duration: "8h 30m"
readingTime: "4h 15m"
labTime: "4h 15m"
lessons: 27
level: "Beginner to Advanced"
order: 1
---

# ELK Stack Operations

Master Elasticsearch, Logstash, and Kibana for production-grade operations. This course takes you from single-node setups to high-availability clusters.

## Course Stats

| Metric | Value |
|--------|-------|
| **Total Duration** | 8h 30m |
| **Reading Time** | 4h 15m |
| **Hands-on Labs** | 4h 15m |
| **Lessons** | 27 |
| **Level** | Beginner to Advanced |

## What You'll Learn

- **Elasticsearch Core**: Indexing, search, mappings, and cluster management
- **Logstash Pipelines**: Data ingestion from multiple sources
- **Kibana**: Visualization and monitoring
- **Production Skills**: Backup, security, scaling, and troubleshooting

## Prerequisites

- Docker and Docker Compose installed
- Basic Linux command line knowledge
- Understanding of JSON and REST APIs

## GitHub Repositories

All course materials are available in these repositories:

| Repository | Purpose | Link |
|------------|---------|------|
| **infinite-containers** | Docker Compose files for all setups | [github.com/JinnaBalu/infinite-containers](https://github.com/JinnaBalu/infinite-containers) |
| **ELKOperations** | Additional configurations and scripts | [github.com/jinnabaalu/ELKOperations](https://github.com/jinnabaalu/ELKOperations) |

## Course Structure

### Phase 1: Foundation (1h 30m)
| Lesson | Duration | Reading | Lab |
|--------|----------|---------|-----|
| Course Overview | 10m | 10m | - |
| Architecture | 15m | 15m | - |
| Single Node Setup | 30m | 10m | 20m |
| Kibana Setup | 15m | 5m | 10m |
| Index Operations | 20m | 10m | 10m |

### Phase 2: CRUD Operations (45m)
| Lesson | Duration | Reading | Lab |
|--------|----------|---------|-----|
| Document CRUD | 45m | 20m | 25m |

### Phase 3: Cluster Operations (2h)
| Lesson | Duration | Reading | Lab |
|--------|----------|---------|-----|
| Understanding HA | 30m | 20m | 10m |
| Three Node Cluster | 45m | 15m | 30m |
| Five Node Cluster | 45m | 15m | 30m |

### Phase 4: Index Management (30m)
| Lesson | Duration | Reading | Lab |
|--------|----------|---------|-----|
| Index Design | 30m | 20m | 10m |

### Phase 5: Logstash Pipelines (2h 30m)
| Lesson | Duration | Reading | Lab |
|--------|----------|---------|-----|
| Logstash Introduction | 30m | 20m | 10m |
| MongoDB Pipeline | 1h 30m | 30m | 1h |
| S3 Pipeline | 30m | 15m | 15m |

### Phase 6: Use Cases (30m)
| Lesson | Duration | Reading | Lab |
|--------|----------|---------|-----|
| Use Cases Overview | 15m | 15m | - |
| MongoDB Pipeline Guide | 15m | 15m | - |

### Phase 7: Production (45m)
| Lesson | Duration | Reading | Lab |
|--------|----------|---------|-----|
| Reindexing | 20m | 10m | 10m |
| Remote Reindexing | 25m | 10m | 15m |

## Quick Start

All configurations use Docker Compose from the [infinite-containers](https://github.com/JinnaBalu/infinite-containers) repository:

```bash
# Download and run single-node Elasticsearch
wget -O docker-compose.yml https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/single-node-elasticsearch/docker-compose.yml
wget -O .env https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/single-node-elasticsearch/.env
docker compose up -d
```

## Repository Structure

Each lesson references configuration files from:
- **Docker Compose**: `elastic-stack/*/docker-compose.yml`
- **Pipelines**: `elastic-stack/logstash-pipeline-list/`
- **Beats Config**: `elastic-stack/beats-conf/`
