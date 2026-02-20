---
title: Monitoring
description: Monitor OpenLDAP with the cn=Monitor backend. Track connections, operations, statistics, and database health.
---

# Monitoring

OpenLDAP Docker includes a built-in monitoring backend (`cn=Monitor`) that provides real-time statistics about the server.

## Enable Monitoring

```bash
ENABLE_MONITORING=true
```

This is enabled by default. It provides read-only access to operational statistics via the `cn=Monitor` subtree.

## Verify Monitor Backend

```bash
docker exec openldap ldapsearch \
  -x -D "cn=Manager,dc=example,dc=com" -w changeme \
  -b "cn=Monitor" "(objectClass=*)" -s base
```

## Monitor Sections

### Connections

Track active and total connections:

```bash
docker exec openldap ldapsearch \
  -x -D "cn=Manager,dc=example,dc=com" -w changeme \
  -b "cn=Connections,cn=Monitor" "(objectClass=*)"
```

### Operations

Monitor BIND, SEARCH, MODIFY, ADD, and DELETE operations:

```bash
docker exec openldap ldapsearch \
  -x -D "cn=Manager,dc=example,dc=com" -w changeme \
  -b "cn=Operations,cn=Monitor" "(objectClass=*)"
```

### Statistics

View global I/O statistics:

```bash
docker exec openldap ldapsearch \
  -x -D "cn=Manager,dc=example,dc=com" -w changeme \
  -b "cn=Statistics,cn=Monitor" "(objectClass=*)"
```

Key metrics:
- `monitorBytesReceived` — total bytes received
- `monitorBytesSent` — total bytes sent
- `monitorPDUReceived` — total protocol data units received
- `monitorPDUSent` — total protocol data units sent

### Database Health

Check backend status and entry counts:

```bash
docker exec openldap ldapsearch \
  -x -D "cn=Manager,dc=example,dc=com" -w changeme \
  -b "cn=Databases,cn=Monitor" "(objectClass=*)"
```

### Backends

List loaded backends:

```bash
docker exec openldap ldapsearch \
  -x -D "cn=Manager,dc=example,dc=com" -w changeme \
  -b "cn=Backends,cn=Monitor" "(objectClass=*)"
```

## Access Control

By default, cn=Monitor is accessible to the admin user. For production, restrict access:

```yaml
# Admin-only read access (default)
olcAccess: to *
  by dn.exact="cn=Manager,dc=example,dc=com" read
  by * none
```

## Health Checks

The container includes a built-in health check script:

```bash
docker exec openldap /usr/local/bin/scripts/healthcheck.sh basic
```

Use in Docker Compose:

```yaml
healthcheck:
  test: ["/usr/local/bin/scripts/healthcheck.sh", "basic"]
  interval: 30s
  timeout: 5s
  start_period: 30s
  retries: 3
```

## Log Files

View slapd logs:

```bash
docker logs -f openldap
```

Or from the logs volume:

```bash
tail -f logs/slapd.log
```

If audit logging is enabled:

```bash
tail -f logs/audit.log
```

## Backup

Export the database for backup:

```bash
docker exec openldap slapcat -n 2 > backup.ldif
```

Restore from backup:

```bash
docker exec -i openldap slapadd -n 2 -l /dev/stdin < backup.ldif
```
