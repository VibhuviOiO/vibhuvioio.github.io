---
title: Single Node Deployment
description: Production-ready single-node OpenLDAP deployment with Docker Compose — persistent storage, health checks, and restart policies.
---

# Single Node Deployment

Deploy a production-ready single-node OpenLDAP server using Docker Compose. This guide covers persistent storage, health checks, resource limits, and networking — without sample data.

## When to Use Single Node

- Development and staging environments
- Small teams (under 500 users)
- Applications that need a local LDAP directory
- Standalone authentication backends

For high availability, see [Multi-Master Cluster](/openldap-docker/deployment/multi-master).

## Docker Compose

Create `docker-compose.yml`:

```yaml
services:
  openldap:
    image: ghcr.io/vibhuvioio/openldap:latest
    container_name: openldap
    restart: unless-stopped
    ports:
      - "389:389"
      - "636:636"
    env_file:
      - .env
    volumes:
      - ldap-data:/var/lib/ldap
      - ldap-config:/etc/openldap/slapd.d
    healthcheck:
      test: ["CMD", "ldapsearch", "-x", "-H", "ldap://localhost:389", "-b", "", "-s", "base"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 30s
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "1.0"
        reservations:
          memory: 128M

volumes:
  ldap-data:
    driver: local
  ldap-config:
    driver: local
```

Create `.env`:

```bash
LDAP_DOMAIN=company.com
LDAP_ORGANIZATION=Company Inc
LDAP_ADMIN_PASSWORD=changeme
LDAP_CONFIG_PASSWORD=changeme
INCLUDE_SCHEMAS=cosine,inetorgperson,nis
ENABLE_MONITORING=true
LOG_LEVEL=256
```

> **Warning:** Change `LDAP_ADMIN_PASSWORD` and `LDAP_CONFIG_PASSWORD` to strong passwords before deploying.

## Start

```bash
docker compose up -d
```

## Verify

```bash
# Check container health
docker compose ps

# Wait for ready state
until docker exec openldap ldapsearch -x -H ldap://localhost:389 -b "" -s base >/dev/null 2>&1; do
  echo "Waiting for LDAP..."
  sleep 2
done
echo "OpenLDAP is ready"

# Verify base DN exists
docker exec openldap ldapsearch -x -H ldap://localhost:389 \
  -D "cn=Manager,dc=company,dc=com" -w changeme \
  -b "dc=company,dc=com" -s base
```

## Persistent Storage

The two volumes are critical:

| Volume | Path in Container | Content |
|--------|-------------------|---------|
| `ldap-data` | `/var/lib/ldap` | MDB database — all directory entries |
| `ldap-config` | `/etc/openldap/slapd.d` | slapd configuration (cn=config) |

### Backup

```bash
# Stop writes during backup (optional but recommended)
docker compose pause openldap

# Backup data volume
docker run --rm -v ldap-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/ldap-data-$(date +%Y%m%d).tar.gz -C /data .

# Backup config volume
docker run --rm -v ldap-config:/data -v $(pwd):/backup alpine \
  tar czf /backup/ldap-config-$(date +%Y%m%d).tar.gz -C /data .

# Resume
docker compose unpause openldap
```

### Restore

```bash
docker compose down

# Restore data volume
docker volume rm ldap-data
docker volume create ldap-data
docker run --rm -v ldap-data:/data -v $(pwd):/backup alpine \
  tar xzf /backup/ldap-data-20260317.tar.gz -C /data

# Restore config volume
docker volume rm ldap-config
docker volume create ldap-config
docker run --rm -v ldap-config:/data -v $(pwd):/backup alpine \
  tar xzf /backup/ldap-config-20260317.tar.gz -C /data

docker compose up -d
```

## Resource Sizing

| Users | RAM | CPU | Disk |
|-------|-----|-----|------|
| < 100 | 128 MB | 0.25 | 50 MB |
| 100–1,000 | 256 MB | 0.5 | 200 MB |
| 1,000–10,000 | 512 MB | 1.0 | 1 GB |
| 10,000+ | 1 GB+ | 2.0 | 5 GB+ |

LDAP is very lightweight — a single node handles thousands of concurrent authentications with minimal resources.

## With TLS

Add TLS for encrypted connections:

```yaml
services:
  openldap:
    image: ghcr.io/vibhuvioio/openldap:latest
    container_name: openldap
    restart: unless-stopped
    ports:
      - "389:389"
      - "636:636"
    environment:
      LDAP_DOMAIN: company.com
      LDAP_ADMIN_PASSWORD: changeme
      ENABLE_TLS: "true"
      TLS_CRT_FILENAME: server.crt
      TLS_KEY_FILENAME: server.key
      TLS_CA_CRT_FILENAME: ca.crt
    volumes:
      - ldap-data:/var/lib/ldap
      - ldap-config:/etc/openldap/slapd.d
      - ./certs:/etc/openldap/certs:ro
```

See [TLS/SSL use case](/openldap-docker/use-cases/tls-ssl) for certificate generation steps.

## With Overlays

Enable commonly used overlays:

```bash
# Add to .env
ENABLE_MEMBEROF=true
ENABLE_PPOLICY=true
ENABLE_AUDITLOG=true
```

- **memberOf** — automatically maintains `memberOf` attribute when users are added to groups
- **ppolicy** — enforces password complexity, expiry, and lockout rules
- **auditlog** — logs all modifications to an LDIF file

See [Overlays](/openldap-docker/overlays) for configuration details.

## Monitoring

With `ENABLE_MONITORING=true`, the `cn=monitor` backend exposes server metrics:

```bash
docker exec openldap ldapsearch -x -H ldap://localhost:389 \
  -D "cn=Manager,dc=company,dc=com" -w changeme \
  -b "cn=monitor" "(objectClass=*)" \
  monitoredInfo monitorCounter
```

See [Monitoring](/openldap-docker/monitoring) for Prometheus and alerting integration.

## Upgrade Process

```bash
# Pull new image
docker compose pull

# Recreate container (volumes preserved)
docker compose up -d
```

Data persists across upgrades because volumes are external to the container.

## Next Steps

- [Multi-Master Cluster](/openldap-docker/deployment/multi-master) — deploy a 3-node HA cluster
- [Kubernetes](/openldap-docker/deployment/kubernetes) — deploy on Kubernetes
- [Configuration](/openldap-docker/configuration) — full environment variable reference
- [Security](/openldap-docker/security) — harden your deployment
