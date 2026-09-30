---
title: Prometheus Exporter
description: Export OpenLDAP 2.6 metrics to Prometheus with vibhuvioio/openldap-exporter — replication state, contextCSN convergence, LMDB, cn=Monitor operations and TLS expiry.
---

# Prometheus Exporter

The image's `cn=Monitor` backend answers `ldapsearch`. [vibhuvioio/openldap-exporter](https://github.com/VibhuviOiO/openldap-exporter) reads `cn=Monitor` and `cn=config` and serves Prometheus metrics on port `9330`.

## Requirements

| setting | why |
|---|---|
| `ENABLE_MONITORING=true` | default. Without `cn=Monitor` every operation, connection, thread and LMDB panel stays empty. |
| `config_bind_dn: cn=config` | this image's config bind DN is `cn=config`, **not** `cn=admin,cn=config`. The wrong DN silently drops the syncrepl topology, serverID and contextCSN metrics. |

## Run

```yaml
services:
  openldap-exporter:
    image: vibhuvioio/openldap-exporter:latest
    container_name: openldap-exporter
    env_file:
      - .env
    volumes:
      - ./openldap-exporter.yml:/etc/openldap-exporter/openldap-exporter.yml:ro
    ports:
      - "9330:9330"
    restart: unless-stopped
    networks:
      - ldap-shared-network
```

`.env`:

```bash
LDAP_ADMIN_PASSWORD=ChangeMe_StrongP@ssw0rd123!
LDAP_CONFIG_PASSWORD=ChangeMe_StrongP@ssw0rd123!
```

The exporter must share a Docker network with the servers it scrapes.

## Configure

```yaml
listen: ":9330"

defaults:
  bind_dn: cn=Manager,dc=example,dc=com
  password: ${LDAP_ADMIN_PASSWORD}
  config_bind_dn: cn=config
  config_password: ${LDAP_CONFIG_PASSWORD}

targets:
  - { name: ldap-1, uri: "ldap://openldap-1:389", group: main, role: provider }
  - { name: ldap-2, uri: "ldap://openldap-2:389", group: main, role: provider }

suffixes:
  - dc=example,dc=com

entries:
  - name: all
    base: dc=example,dc=com
    filter: (objectClass=*)
```

| key | becomes |
|---|---|
| `targets[].name` | the `target` label |
| `targets[].group` | the `group` label — replication lag is only compared within a group |
| `targets[].role` | the `role` label, `provider` or `qa`; the shipped alerts filter on it |
| `suffixes` | the naming contexts checked for `contextCSN` convergence |
| `entries` | named entry counts, e.g. `name="all"`, `name="people"` |

**One exporter instance per directory.** `entries:` and `suffixes:` are global to an instance, not per target, and each directory has its own base DN.

## Verify

```bash
curl -s localhost:9330/metrics | grep -c '^openldap_'
```

`0` means the exporter is up but every target failed — check the bind DN and password before anything else.

## What it exposes

| metric | answers |
|---|---|
| `openldap_up`, `openldap_dial_duration_seconds` | is the server answering |
| `openldap_context_csn_sids`, `openldap_context_csn_timestamp_seconds` | convergence, per sid |
| `openldap_replication_in_sync`, `openldap_replication_group_in_sync` | are the CSN sets equal |
| `openldap_replication_lag_seconds` | how far behind |
| `openldap_syncrepl_link_seen_on_provider` | did the provider see the consumer connect |
| `openldap_entries` | entry counts per configured search |
| `openldap_mdb_pages_used_ratio` | LMDB map pressure — `MDB_MAP_FULL` at 100% |
| `openldap_operations_completed_total`, `openldap_connections_current`, `openldap_threads` | `cn=Monitor` |
| `openldap_tls_certificate_expiry_seconds` | certificate expiry |

## Reference

| | |
|---|---|
| Configuration guide | [docs/PROMETHEUS.md](https://raw.githubusercontent.com/VibhuviOiO/openldap-exporter/main/docs/PROMETHEUS.md) |
| Every metric | [docs/METRICS.md](https://raw.githubusercontent.com/VibhuviOiO/openldap-exporter/main/docs/METRICS.md) |
| Example config | [openldap-exporter.example.yml](https://raw.githubusercontent.com/VibhuviOiO/openldap-exporter/main/openldap-exporter.example.yml) |
| Alert rules | [alerts/openldap.rules.yml](https://raw.githubusercontent.com/VibhuviOiO/openldap-exporter/main/alerts/openldap.rules.yml) |

Next: [Grafana Dashboard](/openldap-docker/observability/grafana-dashboard).
