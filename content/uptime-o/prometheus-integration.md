---
title: Prometheus Integration
description: Ingest Prometheus and Blackbox exporter metrics.
order: 13
---

# Prometheus Integration

UptimeO can ingest metrics from Prometheus and the Blackbox exporter so you can correlate synthetic agent checks with Prometheus probe data.

## Start the Test Stack

A local Prometheus ecosystem is included in the repository:

```bash
cd docker/prometheus-ecosystem
docker compose up -d
```

This starts:

- Prometheus at `http://localhost:19090`
- Blackbox exporter at `http://localhost:19115`
- Sample HTTPS/ICMP/TCP targets across two datacenters

## Configure UptimeO

Create a Prometheus integration in the UptimeO console under **Integrations → Prometheus**:

- **URL**: `http://host.docker.internal:19090`
- **Scrape interval**: match your Prometheus `scrape_interval`
- **Job filter**: e.g. `blackbox-.*`

UptimeO queries the following metrics:

| Probe Type | Success Metric | Latency Metric |
|---|---|---|
| HTTP/HTTPS | `probe_success` | `probe_http_duration_seconds{phase="total"}` |
| TCP | `probe_success` | `probe_duration_seconds` |
| ICMP | `probe_success` | `probe_icmp_duration_seconds` |

Targets must expose `region` and `dc` labels so UptimeO can group them correctly.

## API Endpoints

The backend exposes management endpoints for integrations:

- `GET /api/prometheus-integrations`
- `POST /api/prometheus-integrations`
- `POST /api/prometheus-integrations/{id}/test`
- `POST /api/prometheus-integrations/{id}/sync`
- `GET /api/prometheus-targets`

After syncing, Prometheus-derived targets appear alongside agent monitors in status pages and analytics.
