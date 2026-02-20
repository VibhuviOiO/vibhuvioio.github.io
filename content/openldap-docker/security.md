---
title: Security
description: Security best practices for OpenLDAP Docker. TLS/SSL configuration, ACLs, non-root execution, password policies, and production hardening.
---

# Security

OpenLDAP Docker is designed with security-first principles. This guide covers best practices for production deployment.

## Non-Root Execution

The container runs as the `ldap` user (UID 55) by default. The startup script briefly runs as root to fix volume permissions, then drops to the `ldap` user before starting slapd.

## TLS/SSL Configuration

Always use TLS in production. Configure with environment variables:

```yaml
environment:
  - LDAP_TLS_CERT=/certs/server.crt
  - LDAP_TLS_KEY=/certs/server.key
  - LDAP_TLS_CA=/certs/ca.crt
volumes:
  - ./certs:/certs:ro
ports:
  - "389:389"
  - "636:636"
```

Client certificate verification options:

| Value | Description |
|-------|-------------|
| `never` | No client certificate required (default) |
| `allow` | Request client cert but don't require it |
| `try` | Request and verify if provided |
| `demand` | Require valid client certificate |

## Password Security

- **Change default passwords** — never use `admin`/`changeme` in production
- **Use Docker secrets** for passwords:

```yaml
environment:
  - LDAP_ADMIN_PASSWORD_FILE=/run/secrets/ldap_admin_pw
secrets:
  ldap_admin_pw:
    file: ./secrets/admin_password.txt
```

- **Enable password policy** for enforced rules:

```bash
ENABLE_PASSWORD_POLICY=true
```

This enforces: minimum 8 characters, 5-password history, lockout after 5 failures.

## Access Control Lists (ACLs)

Default ACLs protect sensitive attributes:

- Admin has full access to all entries
- Users can read their own entries and modify their passwords
- Anonymous users cannot read passwords
- cn=Monitor is restricted to admin

## Network Isolation

Use Docker networks to isolate LDAP from public access:

```yaml
networks:
  ldap-internal:
    internal: true  # No external access
```

Only expose ports to services that need LDAP access.

## Audit Logging

Enable audit logging for compliance:

```bash
ENABLE_AUDIT_LOG=true
```

This logs every ADD, MODIFY, DELETE, and MODRDN operation to `/logs/audit.log`.

## Production Checklist

- Use strong passwords (12+ characters, mixed case, numbers, symbols)
- Enable TLS/SSL for all connections
- Use Docker networks for isolation
- Enable audit logging
- Enable password policies
- Set up regular backups
- Monitor with cn=Monitor
- Use read-only bind accounts for applications
- Review ACLs for your use case
- Use `read_only: true` rootfs where possible
