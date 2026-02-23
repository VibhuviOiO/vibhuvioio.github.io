---
title: Kibana Setup
description: Connect Kibana to your running Elasticsearch node and run your first queries from Dev Tools.
duration: "15m"
readingTime: "5m"
labTime: "10m"
order: 2
---

## Project Files

```project
name: kibana-single
kibana-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/elastic-stack/single-node-elasticsearch/kibana-compose.yml
.env: https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/elastic-stack/single-node-elasticsearch/.env
```

> **Note:** Elasticsearch must be running before starting Kibana. If you haven't completed the previous lesson, do that first.

---

## How the two services connect

Both `elasticsearch-compose.yml` and `kibana-compose.yml` must live in the **same folder**. Docker Compose uses the folder name as the project name — both containers end up on the same Docker network, so Kibana can reach Elasticsearch using the container name `elasticsearch` as a hostname.

---

## Configuration

### kibana-compose.yml — environment

```yaml
environment:
  - SERVERNAME=kibana
  - ELASTICSEARCH_HOSTS=https://elasticsearch:9200  # ES container hostname on the shared Docker network
```

### .env

Same `.env` as the Elasticsearch lesson — both services read from it:

```bash
STACK_VERSION=9.3.0
MEM_LIMIT=1073741824  # bytes — Kibana respects the same memory limit
KIBANA_PORT=5601      # change if port is in use
```

---

## Deploy

From the **same folder** where you started Elasticsearch:

```bash
docker compose -f kibana-compose.yml up -d
```

Watch it come up:

```bash
watch docker ps
```

Expected when both are healthy:

```bash
CONTAINER ID   IMAGE                  STATUS
abc123         elasticsearch:9.3.0    Up 5 min (healthy)
def456         kibana:9.3.0           Up 2 min (healthy)
```

Kibana takes longer than Elasticsearch to start — it waits until ES is reachable.

---

## Verify

Open [http://localhost:5601](http://localhost:5601) in a browser.

You should land on the Kibana home page with no login prompt — security is off.

Check the server status page:

```bash
curl -s "http://localhost:5601/api/status" | grep -o '"overall":{"level":"[^"]*"'
```

Expected:

```bash
"overall":{"level":"available"
```

---

## Lab: First queries in Dev Tools

Dev Tools is Kibana's built-in REST console — the fastest way to interact with Elasticsearch without writing curl commands. You'll use it throughout the course.

Navigate to **Dev Tools**: sidebar → Management → Dev Tools (or go to `http://localhost:5601/app/dev_tools`).

Run these in order:

**Check cluster health:**

```json
GET _cluster/health
```

**List all nodes:**

```json
GET _cat/nodes?v
```

Expected output shows one row — your single node, with its name, heap usage, and role (`dim` = data, ingest, master):

```bash
ip        heap.percent ram.percent cpu load_1m node.role name
127.0.0.1           15          62   2    0.10 dim       algo-es-node
```

**List all indices (none yet):**

```json
GET _cat/indices?v
```

Returns empty — no data indexed yet. You'll fix that in Phase 4.

---

## Common Issues

### Kibana cannot connect to Elasticsearch

```bash
# Check Kibana logs
docker logs kibana --tail 30
```

If you see `Unable to retrieve version information from Elasticsearch nodes`:
- Confirm Elasticsearch is healthy: `curl localhost:9200`
- Confirm both compose files are in the same directory — containers must be on the same Docker network

### Blank page or infinite loading

Kibana sometimes takes 2–3 minutes on first start. Run `watch docker ps` and wait for `(healthy)` before opening the browser.

---

## Next Steps

- [Elasticsearch Configuration](../configuration/01-elasticsearch-config) — tune elasticsearch.yml for your environment
