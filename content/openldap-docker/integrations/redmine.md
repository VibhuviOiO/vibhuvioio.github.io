---
title: Redmine Integration
description: Configure Redmine LDAP authentication with OpenLDAP. On-the-fly user creation and centralized identity management for project management.
---

# Redmine LDAP Authentication

Configure Redmine to authenticate users against OpenLDAP with automatic account provisioning.

## Docker Compose

Download and start the stack:

```bash
wget https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/main/openldap/docker-compose-redmine.yml -O docker-compose.yml
```

## Environment Configuration

Create `.env.vibhuvioio`:

```bash
LDAP_ORGANISATION=vibhuvioio
LDAP_DOMAIN=vibhuvioio.com
LDAP_ADMIN_PASSWORD=changeme
```

## Start Services

```bash
docker compose up -d
```

## Verify LDAP Directory

```bash
docker exec openldap-vibhuvioio ldapsearch -x -LLL -b dc=vibhuvioio,dc=com
```

Expected: `ou=People` and `ou=Group`

## Create LDAP User

Create `redmine-user.ldif`:

```yaml
dn: cn=redmineuser,ou=People,dc=vibhuvioio,dc=com
objectClass: simpleSecurityObject
objectClass: organizationalRole
cn: redmineuser
description: Redmine LDAP User
userPassword: password
```

Import:

```bash
docker exec -i openldap-vibhuvioio ldapadd \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -f /dev/stdin < redmine-user.ldif
```

## Verify LDAP Authentication

```bash
docker exec openldap-vibhuvioio ldapwhoami \
  -x \
  -D "cn=redmineuser,ou=People,dc=vibhuvioio,dc=com" \
  -w password
```

Expected: `dn:cn=redmineuser,ou=People,dc=vibhuvioio,dc=com`

## Access Redmine

Open http://localhost:3000 and login with default credentials:

```
admin / admin
```

Change the password when prompted.

## Configure LDAP Authentication

Navigate: **Administration → LDAP authentication → New authentication mode**

### Connection Settings

| Field | Value |
|-------|-------|
| Name | `OpenLDAP` |
| Host | `openldap-vibhuvioio` |
| Port | `389` |

### Authentication

| Field | Value |
|-------|-------|
| Account | `cn=Manager,dc=vibhuvioio,dc=com` |
| Password | `changeme` |
| Base DN | `ou=People,dc=vibhuvioio,dc=com` |

### Attributes

| Field | Value |
|-------|-------|
| Login attribute | `cn` |
| Firstname attribute | *(leave empty)* |
| Lastname attribute | *(leave empty)* |
| Email attribute | *(leave empty)* |

> Leave firstname, lastname, and email empty — required for the minimal schema.

Enable **On-the-fly user creation** → Click **Save**.

## Enable Automatic Account Activation

Navigate: **Administration → Settings → Authentication**

Set: `Self-registration → Automatic account activation` → Save.

## Test Login

Logout and login with:

```
username: redmineuser
password: password
```

## Verify User Creation

Navigate: **Administration → Users**

You should see `redmineuser` listed, created automatically on first LDAP login.

## Docker Compose Reference

| Service | Image | Port |
|---------|-------|------|
| openldap | ghcr.io/vibhuvioio/openldap-docker/openldap:main | 389 |
| ldap-manager | ghcr.io/vibhuvioio/ldap-manager:latest | 8000 |
| redmine-db | mariadb:11 | — |
| redmine | redmine:6 | 3000 |
