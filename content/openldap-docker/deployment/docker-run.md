---
title: Docker Run Commands
description: Complete reference for deploying OpenLDAP Docker using docker run with all configuration options.
---

# Docker Run Commands

Run OpenLDAP directly with `docker run` — no compose file needed. Suitable for quick deployments, testing, and environments where Docker Compose isn't available.

## Basic Deployment

```bash
docker run -d \
  --name openldap \
  -p 389:389 \
  -e LDAP_DOMAIN=example.com \
  -e LDAP_ADMIN_PASSWORD=changeme \
  -v ldap-data:/var/lib/ldap \
  -v ldap-config:/etc/openldap/slapd.d \
  ghcr.io/vibhuvioio/openldap:latest
```

This starts a single OpenLDAP server with:
- Domain `example.com` → base DN `dc=example,dc=com`
- Admin bind DN `cn=Manager,dc=example,dc=com`
- Persistent volumes for data and configuration

## Production Deployment

```bash
docker run -d \
  --name openldap \
  --restart unless-stopped \
  --memory 512m \
  --cpus 1.0 \
  -p 389:389 \
  -p 636:636 \
  -e LDAP_DOMAIN=company.com \
  -e LDAP_ORGANIZATION="Company Inc" \
  -e LDAP_ADMIN_PASSWORD=secure-password-here \
  -e LDAP_CONFIG_PASSWORD=config-password-here \
  -e INCLUDE_SCHEMAS=cosine,inetorgperson,nis \
  -e ENABLE_MONITORING=true \
  -e LOG_LEVEL=256 \
  -v ldap-data:/var/lib/ldap \
  -v ldap-config:/etc/openldap/slapd.d \
  ghcr.io/vibhuvioio/openldap:latest
```

### Flag Reference

| Flag | Purpose |
|------|---------|
| `--restart unless-stopped` | Auto-restart on crashes, survives host reboots |
| `--memory 512m` | Limit memory usage |
| `--cpus 1.0` | Limit CPU usage |
| `-p 636:636` | Expose LDAPS port (TLS) |
| `-e LOG_LEVEL=256` | Log statistics — use `0` for production silence |

## With TLS/SSL

```bash
docker run -d \
  --name openldap \
  -p 389:389 \
  -p 636:636 \
  -e LDAP_DOMAIN=company.com \
  -e LDAP_ADMIN_PASSWORD=changeme \
  -e ENABLE_TLS=true \
  -e TLS_CRT_FILENAME=server.crt \
  -e TLS_KEY_FILENAME=server.key \
  -e TLS_CA_CRT_FILENAME=ca.crt \
  -v /path/to/certs:/etc/openldap/certs:ro \
  -v ldap-data:/var/lib/ldap \
  -v ldap-config:/etc/openldap/slapd.d \
  ghcr.io/vibhuvioio/openldap:latest
```

## With Custom Schemas

Mount a directory of `.ldif` schema files:

```bash
docker run -d \
  --name openldap \
  -p 389:389 \
  -e LDAP_DOMAIN=company.com \
  -e LDAP_ADMIN_PASSWORD=changeme \
  -e INCLUDE_SCHEMAS=cosine,inetorgperson,nis \
  -v /path/to/schemas:/docker-entrypoint-initdb.d/schemas:ro \
  -v ldap-data:/var/lib/ldap \
  -v ldap-config:/etc/openldap/slapd.d \
  ghcr.io/vibhuvioio/openldap:latest
```

## With Initialization Scripts

Mount scripts that run on first startup:

```bash
docker run -d \
  --name openldap \
  -p 389:389 \
  -e LDAP_DOMAIN=company.com \
  -e LDAP_ADMIN_PASSWORD=changeme \
  -v /path/to/init-scripts:/docker-entrypoint-initdb.d:ro \
  -v ldap-data:/var/lib/ldap \
  -v ldap-config:/etc/openldap/slapd.d \
  ghcr.io/vibhuvioio/openldap:latest
```

> **Note:** Init scripts run **only on first startup** when the data volume is empty. To re-run them, remove the volumes first.

## With Overlays

Enable memberOf, password policy, and audit logging:

```bash
docker run -d \
  --name openldap \
  -p 389:389 \
  -e LDAP_DOMAIN=company.com \
  -e LDAP_ADMIN_PASSWORD=changeme \
  -e ENABLE_MEMBEROF=true \
  -e ENABLE_PPOLICY=true \
  -e ENABLE_AUDITLOG=true \
  -e AUDITLOG_FILE=/var/log/openldap/audit.log \
  -v ldap-data:/var/lib/ldap \
  -v ldap-config:/etc/openldap/slapd.d \
  -v ldap-logs:/var/log/openldap \
  ghcr.io/vibhuvioio/openldap:latest
```

## Health Check

Add a health check to automatically detect if slapd is responsive:

```bash
docker run -d \
  --name openldap \
  -p 389:389 \
  -e LDAP_DOMAIN=company.com \
  -e LDAP_ADMIN_PASSWORD=changeme \
  --health-cmd="ldapsearch -x -H ldap://localhost:389 -b '' -s base >/dev/null 2>&1 || exit 1" \
  --health-interval=30s \
  --health-timeout=5s \
  --health-retries=3 \
  --health-start-period=30s \
  -v ldap-data:/var/lib/ldap \
  -v ldap-config:/etc/openldap/slapd.d \
  ghcr.io/vibhuvioio/openldap:latest
```

Check health status:

```bash
docker inspect --format='{{.State.Health.Status}}' openldap
```

## Network Modes

### Bridge (default)

```bash
docker run -d --name openldap -p 389:389 \
  -e LDAP_DOMAIN=company.com \
  -e LDAP_ADMIN_PASSWORD=changeme \
  ghcr.io/vibhuvioio/openldap:latest
```

### Host Network

No port mapping needed — binds directly to host ports:

```bash
docker run -d --name openldap --network host \
  -e LDAP_DOMAIN=company.com \
  -e LDAP_ADMIN_PASSWORD=changeme \
  ghcr.io/vibhuvioio/openldap:latest
```

### Custom Network

```bash
docker network create ldap-network

docker run -d --name openldap --network ldap-network \
  -p 389:389 \
  -e LDAP_DOMAIN=company.com \
  -e LDAP_ADMIN_PASSWORD=changeme \
  ghcr.io/vibhuvioio/openldap:latest
```

Other containers on the same network can reach LDAP at `openldap:389`.

## Environment Variables Quick Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `LDAP_DOMAIN` | — | Domain name (e.g., `company.com`) |
| `LDAP_ORGANIZATION` | domain | Organization display name |
| `LDAP_ADMIN_PASSWORD` | — | Admin/Manager password |
| `LDAP_CONFIG_PASSWORD` | — | Config administrator password |
| `INCLUDE_SCHEMAS` | — | Comma-separated list: `cosine,inetorgperson,nis` |
| `ENABLE_TLS` | `false` | Enable TLS/SSL support |
| `ENABLE_REPLICATION` | `false` | Enable multi-master replication |
| `SERVER_ID` | — | Unique server ID for replication (1–4095) |
| `REPLICATION_PEERS` | — | Comma-separated peer hostnames |
| `ENABLE_MEMBEROF` | `false` | Enable memberOf overlay |
| `ENABLE_PPOLICY` | `false` | Enable password policy overlay |
| `ENABLE_AUDITLOG` | `false` | Enable audit logging overlay |
| `ENABLE_MONITORING` | `false` | Enable cn=monitor backend |
| `LOG_LEVEL` | `256` | slapd log level |

See [Configuration](/openldap-docker/configuration) for the complete reference.
