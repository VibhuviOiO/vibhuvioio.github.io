---
title: TLS/SSL
description: Deploy OpenLDAP with TLS/SSL support for encrypted connections using StartTLS and LDAPS.
---

# TLS/SSL

Deploy OpenLDAP with encrypted connections using StartTLS (port 389) and LDAPS (port 636). Self-signed certificates are included for testing.

## Project Files

```project
name: openldap-tls
docker-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/tls-enabled/docker-compose.yml
certs/ldap.crt: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/tls-enabled/certs/ldap.crt
certs/ldap.key: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/tls-enabled/certs/ldap.key
```

## Start

```bash
docker compose up -d
```

## Test StartTLS (Recommended)

StartTLS upgrades a plaintext connection on port 389 to TLS:

```bash
LDAPTLS_REQCERT=never ldapsearch -x -H ldap://localhost:389 -ZZ \
  -D "cn=Manager,dc=example,dc=com" \
  -w "AdminPass123!" \
  -b "dc=example,dc=com" -s base
```

- `-ZZ` — Require TLS (fail if not available)
- `-Z` — Use TLS if available (don't fail otherwise)

## Test LDAPS (Direct SSL)

LDAPS uses a dedicated TLS connection on port 636:

```bash
LDAPTLS_REQCERT=never ldapsearch -x -H ldaps://localhost:636 \
  -D "cn=Manager,dc=example,dc=com" \
  -w "AdminPass123!" \
  -b "dc=example,dc=com" -s base
```

> `LDAPTLS_REQCERT=never` is for self-signed certs only. In production, use `LDAPTLS_CACERT=./certs/ca.crt` instead.

## Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `LDAP_TLS_CERT` | `/certs/ldap.crt` | Path to server certificate |
| `LDAP_TLS_KEY` | `/certs/ldap.key` | Path to private key |
| `LDAP_TLS_CA` | — | Optional CA certificate |
| `LDAP_TLS_VERIFY_CLIENT` | `never` | Client cert verification mode |

Client verification modes:

| Value | Description |
|-------|-------------|
| `never` | No client cert required (default) |
| `allow` | Request but don't require |
| `try` | Verify if provided |
| `demand` | Require valid client certificate |

## Generate Your Own Certificates

Replace the test certificates with your own:

```bash
# Self-signed (testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/ldap.key \
  -out certs/ldap.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=openldap.example.com"

# For production, use certificates from your CA:
# - Let's Encrypt
# - Internal PKI
# - cert-manager (Kubernetes)
```

## Production Configuration

Mount your own certificates as read-only volumes:

```yaml
environment:
  - LDAP_TLS_CERT=/certs/server.crt
  - LDAP_TLS_KEY=/certs/server.key
  - LDAP_TLS_CA=/certs/ca.crt
volumes:
  - /path/to/your/certs:/certs:ro
```

## Connection Details

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| LDAP Port | `389` (StartTLS) |
| LDAPS Port | `636` (Direct SSL) |
| Bind DN | `cn=Manager,dc=example,dc=com` |
| Base DN | `dc=example,dc=com` |
| Password | `AdminPass123!` |

## Troubleshooting

**"Can't contact LDAP server"** — Check if slapd started correctly:
```bash
docker logs openldap-tls | grep -i tls
```

**"Certificate verification failed"** — For self-signed certs:
```bash
LDAPTLS_REQCERT=never ldapsearch ...
# or trust the specific cert:
LDAPTLS_CACERT=./certs/ldap.crt ldapsearch ...
```

**Certificates not loading** — Verify file permissions:
```bash
docker exec openldap-tls ls -la /certs/
```

## Cleanup

```bash
docker compose down -v
```
