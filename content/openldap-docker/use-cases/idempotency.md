---
title: Idempotency Test
description: Validate that OpenLDAP Docker handles restarts gracefully — no errors, no duplicates, full data persistence.
---

# Idempotency Test

Verify that restarting the OpenLDAP container is safe — configuration is idempotent, data persists, and no duplicate entries are created.

## Download

```bash
mkdir -p openldap-idempotency && cd openldap-idempotency

# Docker Compose
wget https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/idempotency-test/docker-compose.yml

# Init script (creates test data)
mkdir -p init
wget -O init/test-idempotency.sh \
  https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/idempotency-test/init/test-idempotency.sh

mkdir -p logs
```

## Start

```bash
docker compose up -d

# Wait for initialization
docker logs -f openldap-idempotency
# Look for: "Phase 1 initialization complete"
```

## What Gets Tested

| Test | What It Validates |
|------|-------------------|
| **Idempotency** | Configuration scripts detect existing config and skip re-creation |
| **Data persistence** | Database files survive container restart |
| **No duplicates** | Re-running init doesn't create duplicate entries |

## Run the Test

```bash
# 1. Note the entry count
docker exec openldap-idempotency ldapsearch -x \
  -D "cn=Manager,dc=example,dc=com" \
  -w "AdminPass123!" \
  -b "dc=example,dc=com" \
  "(objectClass=*)" | grep -c "^dn:"

# 2. Restart the container
docker compose restart

# 3. Check for errors (should see none)
docker logs openldap-idempotency 2>&1 | grep -i error

# 4. Verify "already configured" messages
docker logs openldap-idempotency 2>&1 | grep -E "(already|configured)"

# 5. Count entries again (should match step 1)
docker exec openldap-idempotency ldapsearch -x \
  -D "cn=Manager,dc=example,dc=com" \
  -w "AdminPass123!" \
  -b "dc=example,dc=com" \
  "(objectClass=*)" | grep -c "^dn:"
```

## Expected Behavior

### First Start

```
Configuring OpenLDAP
Setting config password...
Configuring database...
Database ACL configured
...
Phase 1 initialization complete
```

### After Restart

```
Database already configured
Base domain already exists
...
OpenLDAP initialization completed
```

No errors should appear.

## How It Works

The `startup.sh` script checks for existing configuration before each step:

```bash
# Skip if already configured
if is_database_configured "$LDAP_BASE_DN"; then
    log_info "Database already configured"
else
    # ... configure database
fi

# Skip if base domain exists
if is_base_domain_exists "$LDAP_BASE_DN" "$LDAP_ADMIN_DN" "$LDAP_ADMIN_PASSWORD"; then
    log_info "Base domain already exists"
else
    # ... create base domain
fi
```

This ensures the container can be restarted any number of times without errors.

## Connection Details

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| LDAP Port | `389` |
| Bind DN | `cn=Manager,dc=example,dc=com` |
| Base DN | `dc=example,dc=com` |
| Password | `AdminPass123!` |

## Troubleshooting

**"Entry already exists" errors** — Indicates an idempotency bug in the init script. The script should check for existence before creating entries.

**Data lost after restart** — Verify volumes are properly mounted:
```bash
docker volume ls | grep idempotency
```

## Cleanup

```bash
docker compose down -v
```
