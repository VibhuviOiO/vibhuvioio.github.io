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

Check the container is running:

```bash
docker ps | grep openldap
```

Test the connection:

```bash
ldapsearch -x -H ldap://localhost:389 -b "" -s base
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
wget https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/main/openldap/docker-compose.yml
docker compose up -d
```

## Cleanup

```bash
docker stop openldap && docker rm openldap
docker volume rm ldap-data ldap-config
```

> **Warning:** This deletes all LDAP data. Back up first in production.

## Next Steps

- [Configuration](/openldap-docker/configuration) — full environment variable reference
- [Multi-Master Replication](/openldap-docker/replication) — set up a 3-node HA cluster
- [Integrations](/openldap-docker/integrations/keycloak) — connect with Keycloak, Jenkins, and more
