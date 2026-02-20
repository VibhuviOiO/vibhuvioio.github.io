---
title: Keycloak Integration
description: Integrate OpenLDAP with Keycloak for SSO and user federation. Step-by-step Docker setup with READ_ONLY federation mode.
---

# LDAP + Keycloak (User Federation)

Integrate OpenLDAP with Keycloak for SSO and centralized authentication using User Federation.

## Docker Compose

Download and start the stack:

```bash
wget https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/main/openldap/docker-compose-keycloak.yml -O docker-compose.yml
```

## Environment Configuration

Create `.env.vibhuvioio`:

```bash
LDAP_DOMAIN=vibhuvioio.com
LDAP_ORGANIZATION=Vibhuvioio
LDAP_ADMIN_PASSWORD=changeme
LDAP_CONFIG_PASSWORD=changeme
INCLUDE_SCHEMAS=cosine,inetorgperson,nis
ENABLE_MONITORING=true
```

## Start Services

```bash
docker compose up -d
sleep 60
```

## Prepare LDAP Structure

Create `base.ldif`:

```yaml
dn: ou=People,dc=vibhuvioio,dc=com
objectClass: organizationalUnit
ou: People

dn: ou=Groups,dc=vibhuvioio,dc=com
objectClass: organizationalUnit
ou: Groups
```

Apply:

```bash
docker exec -i openldap-vibhuvioio ldapadd \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -f /dev/stdin < base.ldif
```

## Create Test User

Generate password hash:

```bash
docker exec openldap-vibhuvioio slappasswd -s password
```

Create `user.ldif` (paste the hash into `userPassword`):

```yaml
dn: uid=testuser,ou=People,dc=vibhuvioio,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: Test User
sn: User
givenName: Test
uid: testuser
mail: testuser@vibhuvioio.com
uidNumber: 10000
gidNumber: 10000
homeDirectory: /home/testuser
loginShell: /bin/bash
userPassword: {SSHA}paste-hash-here
```

Apply:

```bash
docker exec -i openldap-vibhuvioio ldapadd \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -f /dev/stdin < user.ldif
```

Verify authentication:

```bash
docker exec openldap-vibhuvioio ldapwhoami \
  -x -D "uid=testuser,ou=People,dc=vibhuvioio,dc=com" \
  -w password
```

## Configure Keycloak

Open http://localhost:8080 and login with `admin / admin`.

### Create Realm

Top-left dropdown → Create → Name: `ldap-demo`

### Add LDAP Federation

Left menu → User Federation → Add provider → **ldap**

Fill exactly:

| Setting | Value |
|---------|-------|
| Vendor | Other |
| Connection URL | `ldap://openldap-vibhuvioio:389` |
| Bind DN | `cn=Manager,dc=vibhuvioio,dc=com` |
| Bind Credential | `changeme` |
| Edit Mode | READ_ONLY |
| Users DN | `ou=People,dc=vibhuvioio,dc=com` |
| Username LDAP attribute | `uid` |
| RDN LDAP attribute | `uid` |
| UUID LDAP attribute | `entryUUID` |
| User Object Classes | `inetOrgPerson` |
| Search Scope | Subtree |
| Import Users | ON |
| Sync Registrations | OFF |
| Cache Policy | NO_CACHE |

Click **Test connection** and **Test authentication**, then **Save**.

### Synchronize Users

Scroll down → Click **Synchronize all users**.

You should see: `1 imported users`

### Verify

Go to **Users** → Search `*` → You should see `testuser`.

## Test Authentication

Open http://localhost:8080/realms/ldap-demo/account

Login with `testuser / password`. Successful login confirms the integration.

## What You Built

- LDAP → identity store
- Keycloak → authentication + token issuer
- READ_ONLY federation → live LDAP bind verification
