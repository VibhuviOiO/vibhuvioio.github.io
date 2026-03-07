---
title: Overlay Features
description: Test memberOf, password policy, and audit log overlays simultaneously in a single OpenLDAP Docker deployment.
---

# Overlay Features

Deploy OpenLDAP with all three overlays enabled — memberOf, password policy, and audit logging — and validate they work together.

## Project Files

```project
name: openldap-overlays
docker-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/overlay-features/docker-compose.yml
init/test-overlays.sh: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/overlay-features/init/test-overlays.sh
```

## Start

```bash
docker compose up -d

# Watch the automated tests run
docker logs -f openldap-overlays
```

## What Gets Tested

The init script automatically validates all three overlays:

| Overlay | Test | Expected |
|---------|------|----------|
| **memberOf** | Add user to group, check `memberOf` attribute | User has `memberOf` set |
| **ppolicy** | Set weak password (< 8 chars) | Rejected by server |
| **ppolicy** | Set strong password (8+ chars) | Accepted |
| **auditlog** | Any modification | Written to `/logs/audit.log` |

## Verify Results

```bash
# Check test results from logs
docker logs openldap-overlays 2>&1 | grep -E "(PASS|FAIL|Testing)"
```

Expected output:

```
=== Test 1: memberOf overlay ===
✓ PASS: memberOf attribute correctly set on user1

=== Test 2: Password Policy overlay ===
✓ PASS: Weak password correctly rejected
✓ PASS: Strong password accepted

=== Test 3: Audit Log ===
✓ PASS: Audit log file exists
```

## Manual Testing

### Test memberOf

```bash
ldapsearch -x -H ldap://localhost:389 \
  -D "cn=Manager,dc=example,dc=com" \
  -w "AdminPass123!" \
  -b "uid=user1,ou=Users,dc=example,dc=com" \
  "(objectClass=*)" memberOf
```

### Test Password Policy

```bash
# Should fail — password too short
ldappasswd -x -H ldap://localhost:389 \
  -D "cn=Manager,dc=example,dc=com" \
  -w "AdminPass123!" \
  -s "123" \
  "uid=user1,ou=Users,dc=example,dc=com"
```

### View Audit Log

```bash
docker exec openldap-overlays tail -20 /logs/audit.log
```

## Environment Variables

```yaml
environment:
  - LDAP_DOMAIN=example.com
  - LDAP_ADMIN_PASSWORD=AdminPass123!
  - ENABLE_MEMBEROF=true
  - ENABLE_PASSWORD_POLICY=true
  - ENABLE_AUDIT_LOG=true
  - ENABLE_MONITORING=true
```

## Connection Details

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| LDAP Port | `389` |
| Bind DN | `cn=Manager,dc=example,dc=com` |
| Base DN | `dc=example,dc=com` |
| Password | `AdminPass123!` |

## Cleanup

```bash
docker compose down -v
```
