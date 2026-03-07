---
title: Configuration
description: Complete environment variable reference for OpenLDAP Docker. Configure domains, passwords, TLS, overlays, replication, and performance tuning.
---

# Configuration

OpenLDAP Docker is configured entirely through environment variables. No manual LDIF editing required.

## Core Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `LDAP_DOMAIN` | `example.com` | LDAP domain (auto-converts to base DN `dc=example,dc=com`) |
| `LDAP_ORGANIZATION` | `Example Organization` | Organization name for the base entry |
| `LDAP_ADMIN_PASSWORD` | `admin` | Directory Manager password (SSHA hashed internally) |
| `LDAP_CONFIG_PASSWORD` | `config` | cn=config database password |
| `LDAP_ADMIN_PASSWORD_FILE` | — | Load admin password from file (Docker secrets) |
| `LDAP_CONFIG_PASSWORD_FILE` | — | Load config password from file (Docker secrets) |
| `LDAP_LOG_LEVEL` | `256` | slapd logging level |
| `INCLUDE_SCHEMAS` | — | Schemas to load (comma-separated: `cosine,inetorgperson,nis`) |

## Replication

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_REPLICATION` | `false` | Enable multi-master (mirror mode) replication |
| `SERVER_ID` | `1` | Unique server ID (1–4095) |
| `REPLICATION_PEERS` | — | Comma-separated peer hostnames |
| `REPLICATION_RIDS` | — | Custom Replica IDs (comma-separated, default auto-generated from 100) |

## Overlays

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_MEMBEROF` | `false` | Enable memberOf overlay (track group membership on user entries) |
| `ENABLE_PASSWORD_POLICY` | `false` | Enable ppolicy overlay (min 8 chars, 5 history, lockout after 5 failures) |
| `ENABLE_AUDIT_LOG` | `false` | Enable auditlog overlay (logs all modifications to `/logs/audit.log`) |
| `ENABLE_MONITORING` | `true` | Enable cn=Monitor backend for real-time statistics |

## TLS/SSL

| Variable | Default | Description |
|----------|---------|-------------|
| `LDAP_TLS_CERT` | — | Path to TLS certificate file |
| `LDAP_TLS_KEY` | — | Path to TLS private key file |
| `LDAP_TLS_CA` | — | Path to CA certificate file |
| `LDAP_TLS_VERIFY_CLIENT` | `never` | Client certificate verification (`never`, `allow`, `try`, `demand`) |

## Network

| Variable | Default | Description |
|----------|---------|-------------|
| `LDAP_PORT` | `389` | LDAP port (unencrypted) |
| `LDAPS_PORT` | `636` | LDAPS port (TLS encrypted) |

## Performance

| Variable | Default | Description |
|----------|---------|-------------|
| `LDAP_QUERY_LIMIT_SOFT` | `500` | Soft limit for search results |
| `LDAP_QUERY_LIMIT_HARD` | `1000` | Hard limit for search results |
| `LDAP_IDLE_TIMEOUT` | `600` | Connection idle timeout in seconds |
| `LDAP_CONN_MAX_PENDING` | `100` | Max unauthenticated connections (DoS protection) |
| `LDAP_CONN_MAX_PENDING_AUTH` | `1000` | Max authenticated pending connections |

### Connection Rate Limiting

The `LDAP_CONN_MAX_PENDING` and `LDAP_CONN_MAX_PENDING_AUTH` variables protect against connection flooding attacks:

- **`LDAP_CONN_MAX_PENDING`** (default: 100): Maximum unauthenticated connections waiting to be processed. Additional connections are refused.
- **`LDAP_CONN_MAX_PENDING_AUTH`** (default: 1000): Maximum authenticated connections waiting for operations.

**Increase for high-traffic environments:**
```yaml
environment:
  - LDAP_CONN_MAX_PENDING=500
  - LDAP_CONN_MAX_PENDING_AUTH=5000
```

**Disable limits (not recommended):**
```yaml
environment:
  - LDAP_CONN_MAX_PENDING=unlimited
  - LDAP_CONN_MAX_PENDING_AUTH=unlimited
```

## Volumes

| Path | Purpose |
|------|---------|
| `/var/lib/ldap` | Database files (MDB) — must be writable |
| `/etc/openldap/slapd.d` | Configuration database — must be writable |
| `/logs` | Log output (slapd.log, audit.log) — must be writable |
| `/custom-schema` | Custom LDIF schemas — read-only, auto-loaded on startup |
| `/docker-entrypoint-initdb.d` | Initialization scripts — executed once on first startup |
| `/certs` | TLS certificates — read-only |

## Example: Basic Single Node

```yaml
version: '3.8'
services:
  openldap:
    image: ghcr.io/vibhuvioio/openldap:latest
    environment:
      - LDAP_DOMAIN=example.com
      - LDAP_ADMIN_PASSWORD=changeme
      - ENABLE_MONITORING=true
    ports:
      - "389:389"
    volumes:
      - ldap-data:/var/lib/ldap
      - ldap-config:/etc/openldap/slapd.d
```

## Example: With Overlays and TLS

```yaml
version: '3.8'
services:
  openldap:
    image: ghcr.io/vibhuvioio/openldap:latest
    environment:
      - LDAP_DOMAIN=mycompany.com
      - LDAP_ADMIN_PASSWORD=securepassword
      - ENABLE_MEMBEROF=true
      - ENABLE_PASSWORD_POLICY=true
      - ENABLE_AUDIT_LOG=true
      - LDAP_TLS_CERT=/certs/server.crt
      - LDAP_TLS_KEY=/certs/server.key
    ports:
      - "389:389"
      - "636:636"
    volumes:
      - ldap-data:/var/lib/ldap
      - ldap-config:/etc/openldap/slapd.d
      - ./logs:/logs
      - ./certs:/certs:ro
```

## Example: Multi-Master Cluster

```yaml
version: '3.8'
services:
  openldap-node1:
    image: ghcr.io/vibhuvioio/openldap:latest
    hostname: openldap-node1
    environment:
      - LDAP_DOMAIN=example.com
      - LDAP_ADMIN_PASSWORD=changeme
      - ENABLE_REPLICATION=true
      - SERVER_ID=1
      - REPLICATION_PEERS=openldap-node2,openldap-node3
    ports:
      - "389:389"

  openldap-node2:
    image: ghcr.io/vibhuvioio/openldap:latest
    hostname: openldap-node2
    environment:
      - LDAP_DOMAIN=example.com
      - LDAP_ADMIN_PASSWORD=changeme
      - ENABLE_REPLICATION=true
      - SERVER_ID=2
      - REPLICATION_PEERS=openldap-node1,openldap-node3
    ports:
      - "390:389"

  openldap-node3:
    image: ghcr.io/vibhuvioio/openldap:latest
    hostname: openldap-node3
    environment:
      - LDAP_DOMAIN=example.com
      - LDAP_ADMIN_PASSWORD=changeme
      - ENABLE_REPLICATION=true
      - SERVER_ID=3
      - REPLICATION_PEERS=openldap-node1,openldap-node2
    ports:
      - "391:389"
```

## Database Size Limits

The MDB (LMDB) backend has a **fixed maximum size of 1 GB** by default. This limit is set at database creation and cannot be changed without reconfiguring.

**Important:** Plan your database size **before** deploying to production. Once the database reaches its limit, writes will fail with `MDB_MAP_FULL` errors.

### Checking Current Size

```bash
# Check database file size
docker exec openldap ls -lh /var/lib/ldap/data.mdb

# Check max size setting
docker exec openldap ldapsearch -Y EXTERNAL -H ldapi:/// \
  -b "cn=config" "(olcDbMaxSize=*)" olcDbMaxSize
```

### Increasing Database Size

To use a larger database, you must configure it **before** data is loaded:

```bash
# Create a custom LDIF file
cat > custom-db-size.ldif << 'EOF'
dn: olcDatabase={2}mdb,cn=config
changetype: modify
replace: olcDbMaxSize
olcDbMaxSize: 2147483648
EOF

# Apply after container starts (before loading data)
docker exec -i openldap ldapmodify -Y EXTERNAL -H ldapi:/// < custom-db-size.ldif
```

Or use an initialization script in `/docker-entrypoint-initdb.d/` to set it automatically on first startup.

### Health Checks

Add Docker health checks to monitor container status:

```yaml
services:
  openldap:
    image: ghcr.io/vibhuvioio/openldap:latest
    environment:
      - LDAP_DOMAIN=example.com
      - LDAP_ADMIN_PASSWORD=changeme
    healthcheck:
      test: ["CMD", "/usr/local/bin/scripts/healthcheck.sh", "basic"]
      interval: 30s
      timeout: 10s
      start_period: 60s
      retries: 3
```

Health check levels:
- `basic` — Checks if slapd process is running
- `bind` — Performs an authenticated bind test

## Database Details

- **Backend:** MDB (Memory-Mapped Database)
- **Indices:** cn, uid, mail, sn, givenname, member, memberOf
- **Base Image:** AlmaLinux 9 (enterprise-grade, long-term support)
- **User:** Runs as `ldap` user (UID 55) for non-root execution
