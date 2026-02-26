---
title: Apache Guacamole Integration
description: Configure Apache Guacamole LDAP authentication with OpenLDAP. Centralized identity for remote access gateway.
---

# Apache Guacamole LDAP Authentication

Configure Apache Guacamole to authenticate users against OpenLDAP for centralized remote access management.

## Docker Compose

Download and start the stack:

```bash
wget https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/main/openldap/docker-compose-guacamole.yml -O docker-compose.yml
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
dn: cn=guac-users,ou=Group,dc=vibhuvioio,dc=com
objectClass: groupOfNames
cn: guac-users
member: cn=Manager,dc=vibhuvioio,dc=com
```

Import:

```bash
docker exec -i openldap-vibhuvioio ldapadd \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -f /dev/stdin < groups.ldif
```

## Create Test User

Create `testuser.ldif`:

```yaml
dn: cn=testuser,ou=People,dc=vibhuvioio,dc=com
objectClass: simpleSecurityObject
objectClass: organizationalRole
cn: testuser
userPassword: password
description: Guacamole Test User
```

Import:

```bash
docker exec -i openldap-vibhuvioio ldapadd \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -f /dev/stdin < testuser.ldif
```

## Verify LDAP Authentication

```bash
docker exec openldap-vibhuvioio ldapwhoami \
  -x \
  -D "cn=testuser,ou=People,dc=vibhuvioio,dc=com" \
  -w password
```

Expected: `dn:cn=testuser,ou=People,dc=vibhuvioio,dc=com`

## Add User to Group

```bash
docker exec -i openldap-vibhuvioio ldapmodify \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme <<EOF
dn: cn=guac-users,ou=Group,dc=vibhuvioio,dc=com
changetype: modify
add: member
member: cn=testuser,ou=People,dc=vibhuvioio,dc=com
EOF
```

## Access Guacamole

Open http://localhost:8080/guacamole and login:

```
Username: testuser
Password: password
```

If login succeeds, LDAP integration is working.

## Docker Compose Reference

The full stack includes:

| Service | Image | Port |
|---------|-------|------|
| openldap | ghcr.io/vibhuvioio/openldap-docker/openldap:main | 389 |
| ldap-manager | ghcr.io/vibhuvioio/ldap-manager:latest | 8000 |
| guacd | guacamole/guacd:1.5.5 | — |
| guacamole | guacamole/guacamole:1.5.5 | 8080 |

## Guacamole LDAP Configuration

Key environment variables for the `guacamole` service:

| Variable | Value |
|----------|-------|
| `GUACD_HOSTNAME` | `guacd` |
| `LDAP_HOSTNAME` | `openldap-vibhuvioio` |
| `LDAP_PORT` | `389` |
| `LDAP_USER_BASE_DN` | `ou=People,dc=vibhuvioio,dc=com` |
| `LDAP_GROUP_BASE_DN` | `ou=Group,dc=vibhuvioio,dc=com` |
| `LDAP_USERNAME_ATTRIBUTE` | `cn` |
| `LDAP_SEARCH_BIND_DN` | `cn=Manager,dc=vibhuvioio,dc=com` |
| `LDAP_SEARCH_BIND_PASSWORD` | `changeme` |
| `LDAP_CONFIG_BASE_DN` | `dc=vibhuvioio,dc=com` |
