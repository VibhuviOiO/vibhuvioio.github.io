---
title: "Pulsar/Kafka — Message Queue"
description: "Configure message queues for Milvus. Pulsar vs Kafka, topic sizing, retention policies, and performance tuning."
duration: "35m"
readingTime: "20m"
labTime: "15m"
order: 3
---

# Pulsar/Kafka — Message Queue

Milvus uses a message queue for:

- **Write-ahead logging (WAL)** — All mutations are logged before processing
- **Event streaming** — Components communicate via pub/sub
- **Recovery** — Rebuild state from logs after failures

## Why Message Queues Matter

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Proxy    │────▶│   Pulsar    │◀────│  Streaming  │
│  (produces  │     │    Topic    │     │    Node     │
│   messages) │     │             │     │  (consumes) │
└─────────────┘     └─────────────┘     └─────────────┘
                            │
                     ┌──────┴──────┐
                     │  Retention  │
                     │  (hours/days│
                     │   of data)  │
                     └─────────────┘
```

Without the message queue, Milvus would lose data on component crashes.

## Pulsar vs Kafka

| Feature | Pulsar (Default) | Kafka (Alternative) |
|---------|------------------|---------------------|
| **Multi-tenancy** | Native | Requires setup |
| **Geo-replication** | Built-in | MirrorMaker |
| **Storage separation** | BookKeeper + Broker | Unified |
| **Scaling** | Scale brokers independently | Rebalance required |
| **Milvus default** | ✅ Yes | ❌ Optional |
| **Complexity** | Higher | Lower |

### When to Use Kafka

- Already have Kafka expertise
- Existing Kafka infrastructure
- Simpler operational model preferred
- Single-tenant deployment

## Pulsar Deployment

### Standalone (Development)

```yaml
services:
  pulsar:
    image: apachepulsar/pulsar:3.0.7
    command: >
      /bin/bash -c "
      bin/apply-config-from-env.py conf/standalone.conf &&
      exec bin/pulsar standalone"
    environment:
      PULSAR_STANDALONE_USE_ZOOKEEPER: "false"
      PULSAR_MEM: " -Xms512m -Xmx512m"
    volumes:
      - pulsar-data:/pulsar/data
    ports:
      - "6650:6650"   # Binary protocol
      - "8080:8080"   # HTTP API
```

### Cluster Mode (Production)

```yaml
# ZooKeeper (metadata)
zookeeper:
  image: apachepulsar/pulsar:3.0.7
  command: bin/pulsar-daemon start zookeeper
  # 3 nodes recommended

# BookKeeper (storage)
bookie:
  image: apachepulsar/pulsar:3.0.7
  command: bin/pulsar-daemon start bookie
  environment:
    zkServers: zookeeper:2181
  volumes:
    - bookie-data:/pulsar/data/bookkeeper
  # 3+ nodes recommended

# Broker
broker:
  image: apachepulsar/pulsar:3.0.7
  command: bin/pulsar-daemon start broker
  environment:
    zookeeperServers: zookeeper:2181
    configurationStoreServers: zookeeper:2181
  # 2+ nodes recommended
```

## Kafka Deployment

```yaml
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
```

## Milvus Configuration

### Using Pulsar

```yaml
# milvus.yaml
pulsar:
  address: pulsar://pulsar:6650
  webAddress: http://pulsar:8080
  maxMessageSize: 5242880          # 5MB
  tenant: public
  namespace: default
  
msgChannel:
  chanNamePrefix:
    cluster: by-dev
    clusterHash: ""
  
  # Subname prefixes for different components
  subNamePrefix:
    dataSubNamePrefix: data-node
    dataDml: data-node-dml
    dataDql: data-node-dql
```

### Using Kafka

```yaml
# milvus.yaml
kafka:
  brokerList: kafka:9092
  saslUsername: ""              # For SASL auth
  saslPassword: ""
  saslMechanisms: PLAIN
  securityProtocol: SASL_SSL
  
# Disable Pulsar when using Kafka
# (remove or comment out pulsar section)
```

## Topic and Retention Configuration

### Pulsar Retention Policies

```bash
# Set retention (keep messages for 24 hours or 10GB)
pulsar-admin namespaces set-retention public/default \
  --size 10G \
  --time 24h

# View retention
pulsar-admin namespaces get-retention public/default
```

### Key Topics Created by Milvus

| Topic Pattern | Purpose | Retention |
|--------------|---------|-----------|
| `by-dev-rootcoord-dml` | DDL operations | 24h |
| `by-dev-rootcoord-delta` | Delete records | 24h |
| `by-dev-data-node-*` | Data node messages | 24h |
| `by-dev-proxy-*` | Proxy requests | 6h |

### Milvus Retention Settings

```yaml
# milvus.yaml
msgChannel:
  # Retention for consume positions
  seekPosition:
    readTimeout: 10s
    
common:
  retentionDuration: 86400        # 24 hours in seconds
  entityExpiration: -1            # Entity TTL (-1 = disabled)
```

## Sizing Guidelines

### Pulsar Resources

| Component | CPU | RAM | Disk | Nodes |
|-----------|-----|-----|------|-------|
| ZooKeeper | 0.5 | 1 GB | 10 GB | 3 |
| BookKeeper | 2 | 4 GB | 500 GB+ SSD | 3+ |
| Broker | 2 | 4 GB | - | 2+ |

### Throughput Estimates

| Workload | Messages/sec | Storage/day |
|----------|--------------|-------------|
| Light (1K inserts/sec) | ~5,000 | ~10 GB |
| Medium (10K inserts/sec) | ~50,000 | ~100 GB |
| Heavy (100K inserts/sec) | ~500,000 | ~1 TB |

## Monitoring

### Pulsar Metrics

```bash
# Check cluster health
pulsar-admin brokers list

# Topic stats
pulsar-admin topics stats persistent://public/default/by-dev-rootcoord-dml

# Backlog (unconsumed messages)
pulsar-admin topics stats-internal persistent://public/default/by-dev-rootcoord-dml
```

### Key Metrics to Watch

| Metric | Warning | Critical |
|--------|---------|----------|
| Storage usage | >70% | >85% |
| Message backlog | >10K | >100K |
| Publish latency | >100ms | >500ms |
| Consumer lag | >5 min | >30 min |

## Troubleshooting

### "Message backlog growing"

**Cause:** Consumers slower than producers

**Fix:**
```bash
# Check consumer rates
pulsar-admin topics stats <topic>

# Scale consumers (add more Data Nodes in Milvus)
# Or increase retention if temporary spike

pulsar-admin namespaces set-retention public/default --size 50G --time 48h
```

### "Storage full"

**Check:**
```bash
# BookKeeper disk usage
df -h /pulsar/data/bookkeeper

# Check if compaction is running
pulsar-admin bookies list
```

**Fix:**
```bash
# Reduce retention (careful: may lose recovery capability)
pulsar-admin namespaces set-retention public/default --size 10G --time 12h

# Add more BookKeeper nodes
```

### "High publish latency"

**Causes:**
- BookKeeper I/O saturation
- Network latency
- Too few partitions

**Fix:**
```bash
# Check BookKeeper ledger dirs
pulsar-admin bookies list

# Increase partitions for hot topics
pulsar-admin topics partitioned-lookup <topic>
```

## Best Practices

1. **Dedicated Pulsar cluster** — Don't share with other applications
2. **SSD for BookKeeper** — Critical for write latency
3. **Monitor backlog** — Growing backlog = lost data risk
4. **Set alerts** — Storage, backlog, latency thresholds
5. **Regular compaction** — Prevents unbounded growth
6. **Backup ZooKeeper** — Metadata loss = cluster loss
7. **Separate network** — Use dedicated NICs if possible

## Next Steps

Learn about Milvus configuration:

→ **[Understanding milvus.yaml](../config/overview)**
