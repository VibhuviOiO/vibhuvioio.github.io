---
title: "Langfuse Operations — Course Overview"
description: "Learn how to self-host Langfuse for local tracing, evaluation, and SDK integration workflows, starting with a single-machine Docker Compose setup."
duration: "15m"
readingTime: "15m"
labTime: "0m"
order: 1
---

# Langfuse Operations

**Langfuse helps teams observe, debug, and evaluate LLM applications.** When you self-host it, you get full control over tracing data, local experimentation, and the supporting storage services behind the platform.

## What You'll Learn

By the end of this course, you will:

- **Understand** the core Langfuse services in a self-hosted stack
- **Run** Langfuse locally with Docker Compose for developer testing
- **Verify** that Postgres, ClickHouse, Redis, and MinIO are wired correctly
- **Use** the local UI as a target for SDK tracing experiments
- **Recognize** which parts of the quickstart are for local evaluation only

## Why This Course Exists

The official Langfuse deployment docs explain the platform well, but many teams still need a practical starting point for self-hosting:

- **Developers** want a local sandbox before sending traces from real applications
- **Platform engineers** want a compact proof of concept they can run on one machine
- **AI teams** need to understand how the storage dependencies fit together
- **Operators** need a clear line between a local quickstart and a hardened production setup

This course starts with the smallest useful deployment: one machine, one Compose file, and a short path to a working Langfuse UI.

## Who This Course Is For

| Role | What You'll Get |
|------|-----------------|
| **Application Developers** | A local Langfuse sandbox for SDK tracing and evaluation tests |
| **Platform Engineers** | A compact self-hosted proof of concept with all core dependencies |
| **DevOps/SRE** | A clear view of the services involved before designing a larger deployment |
| **AI Product Teams** | A hands-on way to evaluate Langfuse without starting in the cloud |

## Prerequisites

Before starting, you should be comfortable with:

- **Docker and Docker Compose** — pulling images and running multi-container stacks
- **Basic networking** — understanding localhost ports and service endpoints
- **Environment variables** — reading and adjusting application configuration

## Course Structure

This course currently has **2 pages**:

### Phase 1: Introduction
- Course overview and intended use cases
- What the quickstart includes and what it deliberately leaves out

### Phase 2: Developer Quickstart
- Download the Compose file
- Start Langfuse web and worker
- Verify Postgres, ClickHouse, Redis, and MinIO
- Open the UI and begin local tracing experiments

## Self-Hosted Langfuse Stack

```text
Application SDKs
       |
       v
   Langfuse Web  <---->  Langfuse Worker
       |                     |
       |                     +--> Redis
       |                     +--> ClickHouse
       |
       +--> Postgres
       +--> MinIO
```

## What This Course Covers Right Now

The current focus is intentionally narrow:

- one local developer quickstart
- one copy-pasteable Compose file
- inline defaults for fast evaluation

It does not yet cover:

- high availability
- external databases or object storage
- secret rotation
- backup and restore
- production hardening

## Getting Started

Start with the hands-on guide:

- [Developer Quickstart](./developer-quickstart) — run the full local stack with Docker Compose

## Resources

- [Langfuse Documentation](https://langfuse.com/docs)
- [Langfuse GitHub](https://github.com/langfuse/langfuse)
- [Infinite Containers Langfuse Source](https://github.com/VibhuviOiO/infinite-containers/tree/main/langfuse)