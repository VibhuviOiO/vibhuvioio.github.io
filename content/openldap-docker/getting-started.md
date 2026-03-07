---
title: Getting Started
description: Quick start guide for deploying OpenLDAP Docker. Single container setup, verification, and first user creation.
---

# Getting Started

Deploy a production-ready OpenLDAP server in under 5 minutes.

## Prerequisites

- Docker installed on your machine
- Basic familiarity with LDAP concepts (DN, base DN, bind DN)

## Step 1: Run OpenLDAP

```bash
docker run -d \
  --name openldap \
  -e LDAP_DOMAIN=example.com \
  -e LDAP_ADMIN_PASSWORD=changeme \
  -p 389:389 \
  -v ldap-data:/var/lib/ldap \
  -v ldap-config:/etc/openldap/slapd.d \
  ghcr.io/vibhuvioio/openldap:latest
```

- `-e LDAP_DOMAIN=example.com` — automatically creates base DN `dc=example,dc=com`
- `-e LDAP_ADMIN_PASSWORD=changeme` — sets the admin (Manager) password
- `-v ldap-data:/var/lib/ldap` — persists the database across restarts

## Step 2: Verify the Server

### Verification Checklist

Run these commands to confirm everything is working:

```bash
# 1. Container is running
docker ps | grep openldap

# 2. Logs show successful initialization
docker logs openldap | grep "initialization completed"

# 3. LDAP responds to anonymous queries
docker exec openldap ldapsearch -x -H ldap://localhost:389 -b "" -s base

# 4. Authentication works
docker exec openldap ldapsearch -x -H ldap://localhost:389 \
  -D "cn=Manager,dc=example,dc=com" -w changeme \
  -b "dc=example,dc=com" -s base
```

Expected output from step 4:
```
dn: dc=example,dc=com
dc: example
objectClass: top
objectClass: dcObject
objectClass: organization
o: example.com
```

## Step 3: Authenticate and Browse

```bash
ldapsearch -x -H ldap://localhost:389 \
  -D "cn=Manager,dc=example,dc=com" \
  -w changeme \
  -b "dc=example,dc=com"
```

- `-D` — bind DN (admin account)
- `-w` — password
- `-b` — search base

You should see the base domain entry and default OUs (`ou=People`, `ou=Group`).

## Step 4: Add Your First User

Create a file `user.ldif`:

```yaml
dn: uid=jsmith,ou=People,dc=example,dc=com
objectClass: inetOrgPerson
objectClass: organizationalPerson
objectClass: person
uid: jsmith
cn: John Smith
sn: Smith
givenName: John
mail: jsmith@example.com
userPassword: secret123
```

Add the user:

```bash
docker exec -i openldap ldapadd \
  -x -D "cn=Manager,dc=example,dc=com" -w changeme \
  -f /dev/stdin < user.ldif
```

Verify:

```bash
ldapsearch -x -H ldap://localhost:389 \
  -D "cn=Manager,dc=example,dc=com" -w changeme \
  -b "ou=People,dc=example,dc=com" "(uid=jsmith)"
```

## Step 5: Connect with LDAP Manager (Optional)

Use [LDAP Manager](/ldap-manager) for a web-based interface:

```yaml
clusters:
  - name: "Local OpenLDAP"
    host: "localhost"
    port: 389
    bind_dn: "cn=Manager,dc=example,dc=com"
    base_dn: "dc=example,dc=com"
```

```bash
docker run -d --name ldap-manager \
  -p 5000:5000 \
  -v $(pwd)/config.yml:/app/config.yml \
  ghcr.io/vibhuvioio/ldap-manager:latest
```

Access the UI at http://localhost:5000

## Docker Compose Setup

For a more complete setup with persistent volumes and health checks:

```bash
wget https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/docker-compose.yml
docker compose up -d
```

## Cleanup

```bash
docker stop openldap && docker rm openldap
docker volume rm ldap-data ldap-config
```

> **Warning:** This deletes all LDAP data. Back up first in production.

## Common Pitfalls

### 1. Port Already in Use

If port 389 is taken, use a different host port:
```bash
docker run -d ... -p 1389:389 ghcr.io/vibhuvioio/openldap:latest

# Then connect to localhost:1389
ldapsearch -x -H ldap://localhost:1389 ...
```

### 2. Wrong Base DN

The base DN is automatically derived from `LDAP_DOMAIN`:
- `example.com` → `dc=example,dc=com`
- `mycompany.org` → `dc=mycompany,dc=org`

Always use the correct base DN in searches:
```bash
# Wrong ❌
ldapsearch -b "dc=mycompany,dc=com"  # when domain is example.com

# Right ✅
ldapsearch -b "dc=example,dc=com"    # matches LDAP_DOMAIN
```

### 3. Server Still Initializing

The container needs 10-30 seconds to initialize on first startup. Check logs:
```bash
# Wait for this message:
docker logs -f openldap | grep "initialization completed"

# Or check if slapd is responding:
until docker exec openldap ldapsearch -x -H ldap://localhost:389 -b "" -s base >/dev/null 2>&1; do
  echo "Waiting for LDAP..."
  sleep 2
done
echo "Ready!"
```

### 4. Permission Issues with Bind Mounts

If using host directories instead of named volumes:
```bash
# Container runs as UID 55 (ldap user)
sudo chown -R 55:55 /path/to/ldap-data

# Or use named volumes (recommended)
docker volume create ldap-data
docker run -v ldap-data:/var/lib/ldap ...
```

### 5. Container Restarts Skip Initialization

Init scripts in `/docker-entrypoint-initdb.d/` only run on **first** startup. To re-run:
```bash
# Remove volumes to start fresh
docker compose down -v
docker compose up -d
```

See [Troubleshooting](/openldap-docker/troubleshooting) for more solutions.

## Next Steps

- [Configuration](/openldap-docker/configuration) — full environment variable reference
- [Multi-Master Replication](/openldap-docker/replication) — set up a 3-node HA cluster
- [Initialization Scripts](/openldap-docker/use-cases/initialization-scripts) — automate setup tasks
- [Troubleshooting](/openldap-docker/troubleshooting) — solve common issues
- [Integrations](/openldap-docker/integrations/keycloak) — connect with Keycloak, Jenkins, and more
