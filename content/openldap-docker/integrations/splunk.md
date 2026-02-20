---
title: Splunk Integration
description: Configure Splunk Enterprise LDAP authentication with OpenLDAP. Role mapping and group-based authorization.
---

# Splunk LDAP Authentication

Configure Splunk Enterprise to authenticate users against OpenLDAP with group-based role mapping.

## Docker Compose

Download and start the stack:

```bash
wget https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/main/openldap/docker-compose-splunk.yml -O docker-compose.yml
```

## Environment Configuration

Create `.env.vibhuvioio`:

```bash
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
dn: cn=splunk-users,ou=Group,dc=vibhuvioio,dc=com
objectClass: groupOfNames
cn: splunk-users
member: cn=Manager,dc=vibhuvioio,dc=com
```

Import:

```bash
docker exec -i openldap-vibhuvioio ldapadd \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -f /dev/stdin < groups.ldif
```

## Create Test User

Create `splunkuser.ldif`:

```yaml
dn: cn=splunkuser,ou=People,dc=vibhuvioio,dc=com
objectClass: simpleSecurityObject
objectClass: organizationalRole
cn: splunkuser
userPassword: password
description: Splunk Test User
```

Import:

```bash
docker exec -i openldap-vibhuvioio ldapadd \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -f /dev/stdin < splunkuser.ldif
```

## Verify LDAP Authentication

```bash
docker exec openldap-vibhuvioio ldapwhoami \
  -x \
  -D "cn=splunkuser,ou=People,dc=vibhuvioio,dc=com" \
  -w password
```

Expected: `dn:cn=splunkuser,ou=People,dc=vibhuvioio,dc=com`

## Add User to Group

```bash
docker exec -i openldap-vibhuvioio ldapmodify \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme <<EOF
dn: cn=splunk-users,ou=Group,dc=vibhuvioio,dc=com
changetype: modify
add: member
member: cn=splunkuser,ou=People,dc=vibhuvioio,dc=com
EOF
```

## Confirm Container Connectivity

```bash
docker exec splunk getent hosts openldap-vibhuvioio
docker exec splunk bash -c "</dev/tcp/openldap-vibhuvioio/389"
```

## Configure Splunk LDAP

Open http://localhost:8001 and login with `admin / Changeme123!`

Navigate: **Settings → Authentication Methods → LDAP → New**

### Connection Settings

| Field | Value |
|-------|-------|
| Strategy | Active Directory |
| Host | `openldap-vibhuvioio` |
| Port | `389` |
| Bind DN | `cn=Manager,dc=vibhuvioio,dc=com` |
| Bind Password | `changeme` |

### User Settings

| Field | Value |
|-------|-------|
| User Base DN | `ou=People,dc=vibhuvioio,dc=com` |
| User name attribute | `cn` |
| Real name attribute | `cn` |
| Group mapping attribute | **(leave empty)** |

### Group Settings

| Field | Value |
|-------|-------|
| Group Base DN | `ou=Group,dc=vibhuvioio,dc=com` |
| Group name attribute | `cn` |
| Static member attribute | `member` |
| Nested groups | OFF |

> **Warning:** Do NOT set `uid`, `memberUid`, or `dn` mapping. Your LDAP uses `groupOfNames` + `member` DN structure.

## Map LDAP Group to Splunk Role

Navigate: **Authentication methods → LDAP strategies → LDAP Groups**

Click `splunk-users` → Assign role: `user` → Save.

## Enable LDAP Authentication

Navigate: **Settings → Authentication Methods**

Select **LDAP** → Save.

## Test Login

Logout and login with:

```
username: splunkuser
password: password
```

## Verify User Recognition

Navigate: **Settings → Access Controls → Users**

You should see: `splunkuser (LDAP)`
