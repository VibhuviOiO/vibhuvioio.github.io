---
title: Metricbeat — System & Service Metrics
description: Collect infrastructure metrics with Metricbeat — system stats, Docker metrics, Elasticsearch monitoring, and custom module configuration.
duration: "25m"
readingTime: "15m"
labTime: "10m"
order: 2
---

## Project Structure

```tree
metricbeat/
├── docker-compose.yml
├── .env
└── metricbeat.yml
```

## Architecture

```
System/Services → Metricbeat → Elasticsearch → Kibana Dashboards
```

Metricbeat uses **modules** to collect metrics. Each module knows how to talk to a specific service (Elasticsearch, Docker, Nginx, Redis, etc.).

## Docker Compose Setup

```yaml
services:
  metricbeat:
    image: docker.elastic.co/beats/metricbeat:8.12.0
    user: root
    command: metricbeat -e --strict.perms=false
    volumes:
      - ./metricbeat.yml:/usr/share/metricbeat/metricbeat.yml:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /sys/fs/cgroup:/hostfs/sys/fs/cgroup:ro
      - /proc:/hostfs/proc:ro
      - /:/hostfs:ro
      - metricbeat-data:/usr/share/metricbeat/data
    environment:
      - ELASTICSEARCH_HOST=elasticsearch:9200
      - KIBANA_HOST=kibana:5601
    healthcheck:
      test: ["CMD", "metricbeat", "test", "config"]
      interval: 30s
      timeout: 15s
      retries: 5
    depends_on:
      elasticsearch:
        condition: service_healthy
    networks:
      - elastic

volumes:
  metricbeat-data:
```

## System Metrics Module

The system module collects OS-level metrics:

```yaml
metricbeat.modules:

  # System metrics
  - module: system
    period: 10s
    metricsets:
      - cpu
      - load
      - memory
      - network
      - process
      - process_summary
      - core
      - diskio
      - socket
    process.include_top_n:
      by_cpu: 5
      by_memory: 5

  # Filesystem metrics (less frequent)
  - module: system
    period: 1m
    metricsets:
      - filesystem
      - fsstat
    processors:
      - drop_event.when.regexp:
          system.filesystem.mount_point: '^/(sys|cgroup|proc|dev|etc|host|lib|snap)($|/)'

  # Uptime (infrequent)
  - module: system
    period: 15m
    metricsets:
      - uptime
```

### What Each Metricset Collects

| Metricset | Metrics |
|-----------|---------|
| `cpu` | User%, system%, idle%, iowait%, steal% |
| `load` | 1min, 5min, 15min load averages |
| `memory` | Total, used, free, cached, swap |
| `network` | Bytes in/out, packets in/out, errors |
| `process` | Per-process CPU, memory, FDs, state |
| `diskio` | Read/write bytes, IOPS, queue depth |
| `filesystem` | Total, used, available per mount |
| `socket` | TCP/UDP socket states |

## Docker Metrics Module

Monitor all Docker containers:

```yaml
metricbeat.modules:
  - module: docker
    period: 10s
    hosts: ["unix:///var/run/docker.sock"]
    metricsets:
      - container
      - cpu
      - diskio
      - healthcheck
      - info
      - memory
      - network
      - image
```

### Docker Autodiscover

Automatically monitor containers as they start and stop:

```yaml
metricbeat.autodiscover:
  providers:
    - type: docker
      hints.enabled: true
      hints.default_config:
        type: container
        hosts: ["${data.host}:${data.port}"]
```

## Elasticsearch Monitoring Module

Monitor your Elasticsearch cluster with Metricbeat (recommended over self-monitoring):

```yaml
metricbeat.modules:
  - module: elasticsearch
    period: 20s
    hosts: ["http://elasticsearch:9200"]
    username: "${ELASTICSEARCH_USERNAME}"
    password: "${ELASTICSEARCH_PASSWORD}"
    xpack.enabled: true
    metricsets:
      - node
      - node_stats
      - index
      - index_summary
      - shard
```

### Exporter Configuration

For Stack Monitoring in Kibana:

```yaml
monitoring.enabled: true
monitoring.elasticsearch:
  hosts: ["http://monitoring-cluster:9200"]
  username: "remote_monitoring_user"
  password: "${MONITORING_PASSWORD}"
```

This ships metrics to a separate monitoring cluster — the recommended production setup.

## Additional Service Modules

### Nginx Module

```yaml
- module: nginx
  period: 10s
  hosts: ["http://nginx:80"]
  metricsets:
    - stubstatus
  server_status_path: "nginx_status"
```

### Redis Module

```yaml
- module: redis
  period: 10s
  hosts: ["redis:6379"]
  metricsets:
    - info
    - keyspace
```

### PostgreSQL Module

```yaml
- module: postgresql
  period: 10s
  hosts: ["postgres://user:pass@postgres:5432"]
  metricsets:
    - database
    - bgwriter
    - activity
```

### Kafka Module

```yaml
- module: kafka
  period: 10s
  hosts: ["kafka:9092"]
  metricsets:
    - partition
    - consumergroup
```

## Processors

Add metadata and transform metrics before shipping:

```yaml
processors:
  # Cloud provider metadata (AWS, GCP, Azure)
  - add_cloud_metadata: ~

  # Docker container metadata
  - add_docker_metadata:
      host: "unix:///var/run/docker.sock"

  # Host information
  - add_host_metadata:
      netinfo.enabled: true

  # Add locale
  - add_locale:
      format: offset

  # Add custom tags
  - add_fields:
      target: ''
      fields:
        environment: production
        team: infrastructure
```

## Production Configuration

Complete `metricbeat.yml` for production:

```yaml
# ======= Modules =======
metricbeat.modules:
  - module: system
    period: 10s
    metricsets:
      - cpu
      - load
      - memory
      - network
      - process
      - process_summary
      - core
      - diskio
      - socket
    process.include_top_n:
      by_cpu: 5
      by_memory: 5

  - module: system
    period: 1m
    metricsets:
      - filesystem
      - fsstat
    processors:
      - drop_event.when.regexp:
          system.filesystem.mount_point: '^/(sys|cgroup|proc|dev|etc|host|lib|snap)($|/)'

  - module: system
    period: 15m
    metricsets:
      - uptime

  - module: docker
    period: 10s
    hosts: ["unix:///var/run/docker.sock"]
    metricsets:
      - container
      - cpu
      - diskio
      - healthcheck
      - info
      - memory
      - network

# ======= Autodiscover =======
metricbeat.autodiscover:
  providers:
    - type: docker
      hints.enabled: true

# ======= Processors =======
processors:
  - add_cloud_metadata: ~
  - add_docker_metadata:
      host: "unix:///var/run/docker.sock"
  - add_host_metadata:
      netinfo.enabled: true
  - add_locale:
      format: offset

# ======= Output =======
output.elasticsearch:
  hosts: ["${ELASTICSEARCH_HOST}"]
  username: "${USERNAME}"
  password: "${PASSWORD}"

# ======= Kibana =======
setup.kibana:
  host: "${KIBANA_HOST}"
setup.dashboards.enabled: true

# ======= Monitoring =======
monitoring.enabled: true
monitoring.elasticsearch:
  hosts: ["${ELASTICSEARCH_HOST}"]
  username: "${USERNAME}"
  password: "${PASSWORD}"

# ======= Logging =======
logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/metricbeat
  name: metricbeat
  keepfiles: 7
```

## Metricbeat vs Other Collection Methods

| Method | Overhead | Best For |
|--------|----------|----------|
| Metricbeat | ~15MB RAM | System + service metrics |
| Prometheus + Grafana | Higher | Kubernetes, pull-based |
| Telegraf | ~15MB RAM | InfluxDB ecosystems |
| Node Exporter | ~5MB RAM | Prometheus only |

## Kibana Dashboards

Metricbeat ships with pre-built dashboards:

- **[Metricbeat System] Overview** — CPU, memory, network, disk at a glance
- **[Metricbeat System] Host overview** — Per-host deep dive
- **[Metricbeat Docker] Overview** — Container resource usage
- **[Metricbeat Elasticsearch] Overview** — Cluster health metrics

Enable them with `setup.dashboards.enabled: true`.

## Health Checks

```bash
# Test configuration
metricbeat test config

# Test output connectivity
metricbeat test output

# Test individual modules
metricbeat test modules system
```

## Lab: Deploy Metricbeat

1. Add Metricbeat to your Docker Compose stack
2. Configure system and Docker modules
3. Enable Elasticsearch monitoring module
4. Add processors for metadata
5. Start Metricbeat and verify metrics in Kibana
6. Explore the pre-built system dashboards

## Next Steps

- [Cluster Monitoring](/learn/elk/monitoring/01-cluster-monitoring) — deep dive into Elasticsearch monitoring
- [Slow Logs](/learn/elk/monitoring/02-slow-logs) — find and fix slow queries
