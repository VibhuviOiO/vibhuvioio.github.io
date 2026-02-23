---
title: Single Node Elasticsearch Setup
description: Deploy Elasticsearch and Kibana on a single node using Docker Compose.
duration: "30m"
readingTime: "5m"
labTime: "25m"
github: "https://github.com/VibhuviOiO/infinite-containers/tree/main/elastic-stack/single-node-elasticsearch"
order: 1
---

## Project Files

```project
name: elasticsearch-single
docker-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/elastic-stack/single-node-elasticsearch/docker-compose.yml
.env: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/elastic-stack/single-node-elasticsearch/.env
```

---

## Configuration

Before deploying, update `.env` to match your machine. The two files work together — see [Docker Compose environment variables](https://docs.docker.com/compose/environment-variables/set-environment-variables/) and [Elasticsearch important settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/important-settings.html) for full reference.

### Compose environment settings

| Variable | Value | Purpose |
|---|---|---|
| `node.name` | `algo-es-node` | Node label shown in cluster stats |
| `cluster.name` | from `.env` | Nodes with the same name form a cluster |
| `discovery.type` | `single-node` | Skips master election for one-node setup |
| `bootstrap.memory_lock` | `true` | Pins JVM heap in RAM — prevents OS swap. [Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup-configuration-memory.html) |
| `xpack.security.enabled` | `false` | No TLS/auth — development only |

### .env variables

| Variable | Default | Change when |
|---|---|---|
| `STACK_VERSION` | `8.4.1` | Upgrading — keep ES and Kibana versions in sync |
| `CLUSTER_NAME` | `vbv-ec-cluster` | Any name works |
| `MEM_LIMIT` | `1073741824` | Bytes — set to 50% of your available RAM. [Calculator](https://www.gbmb.org/gb-to-bytes) |
| `ES_PORT` | `9200` | Change if port is in use |
| `KIBANA_PORT` | `5601` | Change if port is in use |
| `LICENSE` | `basic` | `trial` for 30-day enterprise features |

> **Tip:** `MEM_LIMIT` is in bytes. 2 GB = `2147483648`, 4 GB = `4294967296`, 8 GB = `8589934592`.

---

## Deploy

1. Use **Download All** in the Project Files section above to save `docker-compose.yml` and `.env` into a new folder, e.g. `elasticsearch-single/`
2. Open `.env` and update `MEM_LIMIT` to 50% of your RAM (see table above)
3. Open a terminal in that folder

```bash
# Linux only — macOS Docker Desktop handles this internally
sudo sysctl -w vm.max_map_count=262144

docker compose up -d
```

Watch containers start — Kibana starts only after Elasticsearch passes its health check:

```bash
watch docker ps
```

Expected when ready:

```bash
CONTAINER ID   IMAGE                STATUS
abc123         elasticsearch:8.4.1  Up 2 min (healthy)
def456         kibana:8.4.1         Up 1 min (healthy)
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
  "status" : "green",
  "number_of_nodes" : 1,
  "number_of_data_nodes" : 1,
  "unassigned_shards" : 0
}
```

| Field | Expected | Meaning |
|---|---|---|
| `status` | `green` | All shards assigned. `yellow` = replicas unassigned (normal on single-node). `red` = data missing |
| `number_of_nodes` | `1` | One node — as configured |
| `unassigned_shards` | `0` | Nothing waiting for placement |

Kibana UI → [http://localhost:5601](http://localhost:5601) (no login — security is off).

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
docker compose down && docker compose up -d
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

- [Add Kibana for visualization](./02-kibana-setup)
- [Index and query data](../crud/01-index-operations)
