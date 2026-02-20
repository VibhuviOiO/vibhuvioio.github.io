---
title: ELK Stack Architecture
description: Understanding the components and data flow of Elasticsearch, Logstash, and Kibana
duration: "15m"
readingTime: "15m"
order: 2
---

# ELK Stack Architecture

## Time Estimate
- **Reading**: 15 minutes

## GitHub Reference
- **Repository**: [infinite-containers](https://github.com/JinnaBalu/infinite-containers)
- **Files**: Various configurations across elastic-stack directories

## Components Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Beats     │────▶│   Logstash  │────▶│Elasticsearch│
│  (Agents)   │     │  (Pipeline) │     │   (Store)   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                        ┌──────▼──────┐
                                        │    Kibana   │
                                        │ (Visualize) │
                                        └─────────────┘
```

## Elasticsearch

**Role**: Distributed search and analytics engine

**Key Concepts**:
- **Index**: Collection of documents (like a database)
- **Document**: JSON object, basic unit of information
- **Type**: Logical category (deprecated in ES 7+)
- **Mapping**: Schema definition for fields
- **Shard**: Partition of an index
- **Replica**: Copy of a shard for failover

## Logstash

**Role**: Data processing pipeline

**Pipeline Structure**:
```
Input → Filter → Output
```

**Common Inputs**: Beats, Kafka, JDBC, Files
**Common Outputs**: Elasticsearch, S3, Kafka

## Kibana

**Role**: Visualization and exploration

**Features**:
- Discover: Search and filter documents
- Visualize: Charts and graphs
- Dashboard: Combine visualizations
- Dev Tools: Direct API access

## Data Flow Examples

### Web Server Logs
```
Filebeat → Logstash → Elasticsearch → Kibana
```

### Database Sync
```
JDBC Input → Logstash → Elasticsearch
```

### Metrics Monitoring
```
Metricbeat → Elasticsearch → Kibana Dashboard
```
