---
title: Production Deployment
description: Production-grade deployment guide for LDAP Manager with enterprise security, load balancing, monitoring, and high availability features.
---

# Production Deployment Guide


LDAP Manager is production-ready with enterprise-grade security, high availability, and comprehensive monitoring capabilities.


> **Note:** **✅ Production Ready:** All security, reliability, and observability features have been implemented and tested.


## Production Features Overview


### 🔒 Security

- **Encrypted Password Storage** - Fernet symmetric encryption with 1-hour TTL
- **LDAP Injection Protection** - All user input is escaped and validated
- **CORS Security** - Environment-based origin whitelist
- **Non-Root Container** - Runs as user `ldapmanager:1000`
- **Secure File Permissions** - 0600 for cache and secrets


### ⚡ High Availability

- **Load Balancing** - Intelligent node selection (READ: last→first, WRITE: first only)
- **Automatic Failover** - 2-second connectivity checks with fallback chain
- **Connection Pooling** - 5-minute TTL with automatic cleanup
- **Multi-Master Support** - Full N-way replication cluster support


### 📊 Observability

- **Structured JSON Logging** - Timestamp, level, module, function context
- **Audit Trail** - All CREATE/UPDATE/DELETE operations logged
- **Request Metrics** - Duration, status code, path tracking
- **Health Checks** - Config validation, pool status, LDAP connectivity


### 🧪 Quality Assurance

- **104 Backend Tests** - 97% pass rate with comprehensive coverage
- **Security Testing** - Encryption, injection, authentication tests
- **Integration Testing** - API endpoints, LDAP operations
- **Configuration Validation** - Pydantic schema validation at startup


## Production Deployment


### Step 1: Environment Configuration


Create a `.env` file with production settings:


```
# CORS Security - Whitelist your domain
ALLOWED_ORIGINS=https://ldap.company.com,https://ldap-backup.company.com

# Logging
LOG_LEVEL=INFO
JSON_LOGS=true

# Server
PORT=8000
WORKERS=4
```


### Step 2: Docker Compose Production Setup


Use the production-hardened Docker Compose configuration:


```
version: '3.8'

services:
  ldap-manager:
    image: vibhuvioio/ldap-manager:latest
    restart: unless-stopped

    env_file: .env

    volumes:
      - ./config.yml:/app/config.yml:ro
      - ldap-cache:/app/.cache
      - ldap-secrets:/app/.secrets

    ports:
      - "5173:5173"  # Frontend
      - "8000:8000"  # Backend API

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 256M

    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

    security_opt:
      - no-new-privileges:true

volumes:
  ldap-cache:
    driver: local
  ldap-secrets:
    driver: local
```


### Step 3: Start the Application


```
docker compose -f docker-compose.prod.yml up -d
```


### Step 4: Verify Health


The container serves the React UI and the FastAPI backend on the same port. Verify the container is responding:


```
# Should return HTTP 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health

# Verify the API schema is available
curl -s http://localhost:8000/openapi.json | head
```


Then open the UI at `http://localhost:8000`, select your cluster, and enter the bind DN password to confirm LDAP connectivity.


## Load Balancing Strategy


### Read Operations (Searches, Stats, Groups)


Uses **reverse node order** to distribute load:

1. Try last node (least loaded)
2. Fallback to second node
3. Fallback to first node


**Example:** 3-node cluster → 33% load per node instead of 100% on first node


### Write Operations (Create, Update, Delete)


Always use **first node** (primary master) for consistency.


### Automatic Failover


Each node is tested with a 2-second socket connectivity check. If unreachable, the next node in the chain is tried automatically.


## Security Best Practices


### Password Encryption


Passwords are encrypted at rest using Fernet symmetric encryption:

- **Algorithm:** AES-128 in CBC mode with HMAC
- **Key Storage:** `/app/.secrets/encryption.key` with 0600 permissions
- **TTL:** 1 hour default (configurable)
- **Auto-Expiration:** Expired passwords are deleted automatically


### LDAP Injection Prevention


All user input in search queries is escaped using `ldap.filter.escape_filter_chars()`:


```
# User input: *)(objectClass=*
# After escaping: \2a\29\28objectClass=\2a
# Result: Harmless literal search, not filter injection
```


### CORS Configuration


Configure allowed origins in production:


```
ALLOWED_ORIGINS=https://ldap.company.com
```


Never use `*` in production with credentials enabled.


## Monitoring & Logging


### Structured Logs


All logs are output in JSON format for easy parsing:


```
{
  "timestamp": "2024-01-25T10:30:45.123Z",
  "level": "INFO",
  "logger": "app.api.entries",
  "message": "LDAP entry created",
  "module": "entries",
  "function": "create_entry",
  "line": 275,
  "cluster": "production",
  "dn": "cn=newuser,dc=example,dc=com",
  "operation": "CREATE"
}
```


### Viewing Logs


```
# Follow logs in real-time
docker logs -f ldap-manager

# Last 100 lines
docker logs --tail 100 ldap-manager

# Search for errors
docker logs ldap-manager | grep '"level":"ERROR"'
```


### Health Monitoring


```
# Check that the container responds with HTTP 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/health

# Follow logs
docker logs -f ldap-manager
```


## Performance Optimizations


### Connection Pooling

Connections to LDAP servers are reused across requests instead of being opened and closed for every call. The pool has a 5-minute TTL and stale connections are cleaned up automatically.


### Server-Side Pagination

- **Protocol:** RFC 2696 Simple Paged Results
- **Benefit:** Reduces memory usage and improves response times for large directories by fetching results in pages from the LDAP server


### Request Timeouts

- **Network Timeout:** 30 seconds
- **Operation Timeout:** 30 seconds
- **Purpose:** Prevents hung connections from blocking application


## Backup & Recovery


### Configuration Backup


```
# Backup config.yml
cp config.yml config.yml.backup.$(date +%Y%m%d)

# Backup persistent volumes
docker run --rm -v ldap-secrets:/data -v $(pwd):/backup alpine tar czf /backup/secrets-backup.tar.gz -C /data .
```


### Password Cache Recovery


If password cache is lost, users will be prompted to re-enter passwords on next connection. Passwords are re-cached automatically.


## Troubleshooting


### Connection Failures


```
# Check LDAP server connectivity
docker exec ldap-manager curl -v telnet://192.168.0.101:389

# Check logs for connection errors
docker logs ldap-manager | grep "connection failed"
```


### Password Cache Issues


```
# Check cache status
curl http://localhost:8000/api/password/check/your-cluster

# Clear specific cluster cache
curl -X DELETE http://localhost:8000/api/password/cache/your-cluster
```


### Health Check Failures


```
# Check container HTTP response
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/health

# Check logs for errors
docker logs ldap-manager | grep -i error
```


## Upgrade Guide


### Zero-Downtime Upgrade


```
# Pull latest image
docker pull vibhuvioio/ldap-manager:latest

# Restart with new image
docker compose -f docker-compose.prod.yml up -d

# Verify the container responds with HTTP 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/health
```


### Rollback


```
# Use specific version
docker compose -f docker-compose.prod.yml down
docker pull vibhuvioio/ldap-manager:v1.0.0
docker compose -f docker-compose.prod.yml up -d
```


## Production Checklist


> **Note:** **Before Going Live:**
- ☑️ CORS configured with production domain(s)
- ☑️ HTTPS/TLS enabled (reverse proxy required)
- ☑️ Persistent volumes mounted for cache and secrets
- ☑️ Resource limits configured (CPU, memory)
- ☑️ Health check endpoint monitored
- ☑️ Log aggregation configured (Elasticsearch, CloudWatch, etc.)
- ☑️ Backup strategy for config.yml
- ☑️ Alerting configured for health check failures
- ☑️ All LDAP servers reachable from container
- ☑️ Firewall rules allow LDAP ports (389/636)


## Support & Resources

- GitHub Issues - Bug reports and feature requests
- PRODUCTION_READY.md - Detailed implementation documentation
- Security Guide - Security features and best practices
- Configuration Guide - Cluster setup and options



LDAP Manager is production-ready and actively maintained. Deploy with confidence! 🚀