---
title: ELK Stack Overview
description: Introduction to the ELK Stack (Elasticsearch, Logstash, Kibana)
order: 1
---

# 🔍 ELK Stack Overview

The ELK Stack is a powerful collection of three open source products:

- **Elasticsearch**: Distributed search and analytics engine
- **Logstash**: Data processing pipeline
- **Kibana**: Visualization and exploration tool

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Beats     │───▶│  Logstash   │───▶│Elasticsearch│
│  (Agents)   │    │ (Pipeline)  │    │  (Storage)  │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
                                             ▼
                                       ┌─────────────┐
                                       │   Kibana    │
                                       │(Visualization)│
                                       └─────────────┘
```

## Use Cases

- Centralized logging
- Application performance monitoring
- Security analytics
- Business intelligence

## Getting Started

See the [Deployment Guide](/operations/elk/deployment) to set up your ELK stack.
