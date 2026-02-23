---
title: Single Node Elasticsearch
description: Deploy a single Elasticsearch node using Docker Compose.
duration: "30m"
readingTime: "5m"
labTime: "25m"
order: 1
---

## Project Files

```project
name: elasticsearch-single
elasticsearch-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/elastic-stack/single-node-elasticsearch/elasticsearch-compose.yml
.env: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/elastic-stack/single-node-elasticsearch/.env
```

---

## Configuration

Download both files into a new folder — they work together. See [Docker Compose environment variables](https://docs.docker.com/compose/environment-variables/set-environment-variables/) and [Elasticsearch important settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/important-settings.html) for full reference.

### elasticsearch-compose.yml — environment

```yaml
environment:
  - "ES_JAVA_OPTS=-Xms512m -Xmx512m"              # JVM heap — set to half of MEM_LIMIT
  - network.host=0.0.0.0                           # bind REST API to all interfaces
  - transport.host=0.0.0.0                         # bind inter-node transport to all interfaces
  - node.name=algo-es-node                         # node label shown in cluster stats
  - cluster.name=${CLUSTER_NAME}                   # nodes with the same name form a cluster
  - discovery.type=single-node                     # skip master election for one-node setup
  - bootstrap.memory_lock=true                     # pin JVM heap in RAM — prevent OS swap
  - xpack.security.enabled=false                   # no TLS/auth — development only
  - xpack.license.self_generated.type=${LICENSE}
```

### .env

```bash
STACK_VERSION=9.3.0
CLUSTER_NAME=vbv-ec-cluster
LICENSE=basic              # trial = 30-day enterprise features
MEM_LIMIT=1073741824       # bytes — set to 50% of your available RAM (1 GB shown)
ES_PORT=9200               # change if port is in use
KIBANA_PORT=5601           # used by Kibana — change if port is in use
```

> **Tip:** `MEM_LIMIT` is in bytes. 2 GB = `2147483648`, 4 GB = `4294967296`, 8 GB = `8589934592`.

---

## Deploy

1. Use **Download All** in the Project Files section above to save both files into a new folder, e.g. `elasticsearch-single/`
2. Open `.env` and update `MEM_LIMIT` to 50% of your available RAM
3. Open a terminal in that folder

```bash
# Linux only — macOS Docker Desktop handles this internally
sudo sysctl -w vm.max_map_count=262144

docker compose -f elasticsearch-compose.yml up -d
```

Watch the container start:

```bash
watch docker ps
```

Expected when healthy:

```bash
CONTAINER ID   IMAGE                           STATUS
abc123         elasticsearch:9.3.0             Up 2 min (healthy)
```

---

## Verify

```bash
curl -X GET "localhost:9200/_cluster/health?pretty"
```

Expected response:

```bash
{
  "cluster_name" : "vbv-ec-cluster",
  "status" : "green",           # green = all shards assigned | yellow = replicas unassigned | red = data missing
  "number_of_nodes" : 1,        # 1 = one node, as configured
  "number_of_data_nodes" : 1,
  "unassigned_shards" : 0       # 0 = nothing waiting for placement
}
```

---

## Common Issues

### max_map_count error (Linux only)

```bash
# Error
max virtual memory areas vm.max_map_count [65530] is too low

# Fix
sudo sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
```

> **Note:** Only happens on Linux. Elasticsearch uses `mmap` for index segments — the Linux default (65530) is too low. [Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html)

### Memory lock warning

```bash
# Warning in logs
Unable to lock JVM Memory: error=12, reason=Cannot allocate memory

# Fix — lower MEM_LIMIT in .env to free up headroom, then restart
docker compose -f elasticsearch-compose.yml down && docker compose -f elasticsearch-compose.yml up -d
```

### Port already in use

```bash
# Check what's using it
lsof -i :9200

# Or change ES_PORT in .env
ES_PORT=9201
```

---

## Next Steps

- [Kibana Setup](./kibana-setup) — connect a UI to your running node
