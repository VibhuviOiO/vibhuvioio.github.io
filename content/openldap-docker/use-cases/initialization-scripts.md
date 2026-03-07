---
title: Initialization Scripts
description: Automate OpenLDAP setup with initialization scripts. Load sample data, create custom OUs, and configure indexes on first startup.
---

# Initialization Scripts

Run custom scripts on the first container startup to automate setup tasks like loading data, creating organizational units, or applying custom configurations.

## How It Works

When the container starts for the first time (empty database), it executes any files in `/docker-entrypoint-initdb.d/`:

- **Shell scripts** (`.sh`) — executed with bash
- **LDIF files** (`.ldif`) — applied via ldapadd/ldapmodify
- **Executable files** — run directly

> **Important:** Scripts only run on first startup. On restart, the container detects existing data and skips initialization.

## Quick Start

Create an init script to load sample data:

```bash
mkdir -p init
cat > init/01-load-data.sh << 'EOF'
#!/bin/bash
set -e

echo "Loading sample data..."

ldapadd -x -D "cn=Manager,dc=example,dc=com" -w "$LDAP_ADMIN_PASSWORD" <<LDIF
dn: ou=Departments,dc=example,dc=com
objectClass: organizationalUnit
ou: Departments

dn: ou=Engineering,ou=Departments,dc=example,dc=com
objectClass: organizationalUnit
ou: Engineering

dn: uid=john.doe,ou=People,dc=example,dc=com
objectClass: inetOrgPerson
uid: john.doe
cn: John Doe
sn: Doe
givenName: John
mail: john.doe@example.com
userPassword: {SSHA}encryptedpassword
LDIF

echo "Sample data loaded successfully!"
EOF

chmod +x init/01-load-data.sh
```

Mount and run:

```yaml
services:
  openldap:
    image: ghcr.io/vibhuvioio/openldap:latest
    environment:
      - LDAP_DOMAIN=example.com
      - LDAP_ADMIN_PASSWORD=changeme
    volumes:
      - ./init:/docker-entrypoint-initdb.d:ro
```

```bash
docker compose up -d
# Watch the initialization
docker logs -f openldap
```

## Common Use Cases

### 1. Load Sample Data

Create `init/01-data.sh`:

```bash
#!/bin/bash
set -e

echo "Creating organizational structure..."

ldapadd -x -D "$LDAP_ADMIN_DN" -w "$LDAP_ADMIN_PASSWORD" <<LDIF
dn: ou=Departments,dc=example,dc=com
objectClass: organizationalUnit
ou: Departments

dn: ou=Engineering,ou=Departments,dc=example,dc=com
objectClass: organizationalUnit
ou: Engineering

dn: ou=Sales,ou=Departments,dc=example,dc=com
objectClass: organizationalUnit
ou: Sales
LDIF

echo "Creating test users..."

for i in {1..5}; do
  ldapadd -x -D "$LDAP_ADMIN_DN" -w "$LDAP_ADMIN_PASSWORD" <<LDIF
dn: uid=user$i,ou=People,dc=example,dc=com
objectClass: inetOrgPerson
uid: user$i
cn: Test User $i
sn: User
mail: user$i@example.com
userPassword: password$i
LDIF
done
```

### 2. Apply Custom Schema

Create `init/02-schema.ldif`:

```ldif
dn: cn=myapp,cn=schema,cn=config
objectClass: olcSchemaConfig
cn: myapp
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.1
  NAME 'appRole'
  DESC 'Application role'
  EQUALITY caseIgnoreMatch
  SYNTAX 1.3.6.1.4.1.1466.115.121.1.15{64} )
olcObjectClasses: ( 1.3.6.1.4.1.99999.2.1
  NAME 'appUser'
  DESC 'Application user'
  SUP inetOrgPerson
  STRUCTURAL
  MAY ( appRole ) )
```

Apply with a wrapper script `init/02-schema.sh`:

```bash
#!/bin/bash
set -e

echo "Loading custom schema..."
ldapadd -Y EXTERNAL -H ldapi:/// -f /docker-entrypoint-initdb.d/02-schema.ldif

echo "Creating app users..."
ldapadd -x -D "$LDAP_ADMIN_DN" -w "$LDAP_ADMIN_PASSWORD" <<LDIF
dn: ou=AppUsers,dc=example,dc=com
objectClass: organizationalUnit
ou: AppUsers

dn: uid=appadmin,ou=AppUsers,dc=example,dc=com
objectClass: appUser
uid: appadmin
cn: App Admin
sn: Admin
appRole: administrator
userPassword: adminpass
LDIF
```

### 3. Increase Database Size

Create `init/00-database-config.sh`:

```bash
#!/bin/bash
set -e

echo "Configuring database size..."

ldapmodify -Y EXTERNAL -H ldapi:/// <<LDIF
dn: olcDatabase={2}mdb,cn=config
changetype: modify
replace: olcDbMaxSize
olcDbMaxSize: 2147483648
LDIF

echo "Database size set to 2GB"
```

> Run this as `00-*.sh` to ensure it executes before data loading.

### 4. Create Groups with Members

Create `init/03-groups.sh`:

```bash
#!/bin/bash
set -e

echo "Creating groups..."

ldapadd -x -D "$LDAP_ADMIN_DN" -w "$LDAP_ADMIN_PASSWORD" <<LDIF
dn: cn=admins,ou=Group,dc=example,dc=com
objectClass: groupOfNames
cn: admins
member: uid=john.doe,ou=People,dc=example,dc=com

dn: cn=developers,ou=Group,dc=example,dc=com
objectClass: groupOfNames
cn: developers
member: uid=jane.doe,ou=People,dc=example,dc=com
member: uid=bob.smith,ou=People,dc=example,dc=com
LDIF
```

## Execution Order

Scripts execute in alphabetical order. Use numeric prefixes to control order:

```
init/
├── 00-database-config.sh    # First: configure database
├── 01-schema.sh             # Second: load custom schema
├── 02-ous.sh                # Third: create OUs
└── 03-users.sh              # Last: create users
```

## Environment Variables Available

Scripts have access to these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `LDAP_ADMIN_DN` | Full admin DN | `cn=Manager,dc=example,dc=com` |
| `LDAP_ADMIN_PASSWORD` | Admin password | `changeme` |
| `LDAP_BASE_DN` | Base DN | `dc=example,dc=com` |
| `LDAP_DOMAIN` | Domain | `example.com` |

## Error Handling

Scripts should use `set -e` to fail on errors:

```bash
#!/bin/bash
set -e  # Exit immediately if a command fails

# Your commands here
```

If a script fails, the container logs the error but continues starting. Check logs:

```bash
docker logs openldap | grep -i error
```

## Idempotency

Scripts may run if the database is wiped. Make them idempotent when possible:

```bash
#!/bin/bash
set -e

# Check if entry exists before creating
if ! ldapsearch -x -D "$LDAP_ADMIN_DN" -w "$LDAP_ADMIN_PASSWORD" \
     -b "ou=Departments,dc=example,dc=com" -s base 2>/dev/null | grep -q "ou:"; then
    echo "Creating Departments OU..."
    ldapadd -x -D "$LDAP_ADMIN_DN" -w "$LDAP_ADMIN_PASSWORD" <<LDIF
dn: ou=Departments,dc=example,dc=com
objectClass: organizationalUnit
ou: Departments
LDIF
else
    echo "Departments OU already exists, skipping..."
fi
```

## Download Example

```project
name: openldap-init
docker-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/docker-compose.yml
init/init-data.sh: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/vibhuvi-com-singlenode/init/init-data.sh
```

## Connection Details

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| LDAP Port | `389` |
| Bind DN | `cn=Manager,dc=example,dc=com` (or your custom) |
| Password | As configured in `LDAP_ADMIN_PASSWORD` |

## Cleanup

```bash
# Stop and remove data (runs init scripts again on next start)
docker compose down -v

# Stop but keep data (skips init scripts on next start)
docker compose down
```

## Troubleshooting

**Scripts not running:**
- Check container logs: `docker logs openldap | grep -i init`
- Verify scripts are executable: `chmod +x init/*.sh`
- Ensure database is empty (scripts only run on first startup)

**"Entry already exists" errors:**
- Container was restarted with existing data (expected behavior)
- Or script isn't idempotent and ran twice due to container recreation

**Permission denied:**
- Ensure scripts have execute permission: `chmod +x init/*.sh`
- Check file ownership matches container user (UID 55)
