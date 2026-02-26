---
title: Portainer Integration
description: Configure Portainer CE LDAP authentication with OpenLDAP. Group-based administrator access control for container management.
---

# Portainer LDAP Authentication

Configure Portainer CE to authenticate users against OpenLDAP with group-based administrator access.

## Docker Compose

Download and start the stack:

```bash
wget https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/main/openldap/docker-compose-portainer.yml -O docker-compose.yml
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

## Create LDAP Groups

Create `groups.ldif`:

```yaml
dn: cn=portainer-admins,ou=Group,dc=vibhuvioio,dc=com
objectClass: groupOfNames
cn: portainer-admins
member: cn=Manager,dc=vibhuvioio,dc=com

dn: cn=portainer-users,ou=Group,dc=vibhuvioio,dc=com
objectClass: groupOfNames
cn: portainer-users
member: cn=Manager,dc=vibhuvioio,dc=com
```

Import:

```bash
docker exec -i openldap-vibhuvioio ldapadd \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -f /dev/stdin < groups.ldif
```

## Create LDAP User

Create `devuser.ldif`:

```yaml
dn: cn=devuser,ou=People,dc=vibhuvioio,dc=com
objectClass: simpleSecurityObject
objectClass: organizationalRole
cn: devuser
userPassword: password
description: Portainer User
```

Import:

```bash
docker exec -i openldap-vibhuvioio ldapadd \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -f /dev/stdin < devuser.ldif
```

## Add User to Admin Group

```bash
docker exec -i openldap-vibhuvioio ldapmodify \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme <<EOF
dn: cn=portainer-admins,ou=Group,dc=vibhuvioio,dc=com
changetype: modify
add: member
member: cn=devuser,ou=People,dc=vibhuvioio,dc=com
EOF
```

## Access Portainer

Open https://localhost:9443 and create the initial local admin account (required once).

## Configure LDAP Authentication

Navigate: **Settings → Authentication → LDAP**

### Connection Settings

| Field | Value |
|-------|-------|
| LDAP Server | `openldap-vibhuvioio:389` |
| Anonymous mode | OFF |
| Reader DN | `cn=Manager,dc=vibhuvioio,dc=com` |
| Password | `changeme` |

Click **Test connectivity** — must succeed.

### LDAP Security

Leave both OFF for plain LDAP inside Docker:

- StartTLS → OFF
- TLS → OFF

### User Search

| Field | Value |
|-------|-------|
| Base DN | `ou=People,dc=vibhuvioio,dc=com` |
| Username attribute | `cn` |
| Filter | `(objectClass=simpleSecurityObject)` |

## Test Login

Logout from Portainer and login with:

```
Username: devuser
Password: password
```

If group membership is correct, the user receives administrator privileges.

## Docker Compose Reference

| Service | Image | Port |
|---------|-------|------|
| openldap | ghcr.io/vibhuvioio/openldap-docker/openldap:main | 389 |
| ldap-manager | ghcr.io/vibhuvioio/ldap-manager:latest | 8000 |
| portainer | portainer/portainer-ce:2.20.3 | 9000, 9443 |
