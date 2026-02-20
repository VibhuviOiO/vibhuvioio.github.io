---
title: Keycloak Authentication Only
description: Integrate OpenLDAP with Keycloak for external authentication without user import or synchronization. Minimal, production-aligned pattern.
---

# LDAP + Keycloak (Authentication Only)

This pattern configures Keycloak to authenticate against LDAP without importing or syncing users. LDAP remains the single source of truth — no user duplication, no sync, no hacks.

## How It Works

1. Keycloak searches LDAP for the user: `(uid=testuser)`
2. Gets the DN: `uid=testuser,ou=People,dc=vibhuvioio,dc=com`
3. Attempts bind with the provided password
4. If bind succeeds → login succeeds
5. No password stored in Keycloak

## Prerequisites

Use your existing OpenLDAP setup from the [Getting Started](/openldap-docker/getting-started) guide.

```bash
docker compose up -d
```

Wait 60 seconds, then verify:

```bash
docker exec openldap-vibhuvioio ldapsearch \
  -x -H ldap://localhost:389 \
  -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -b "dc=vibhuvioio,dc=com"
```

If this fails, stop here. Keycloak integration will fail.

## Create Test User

Create `testuser.ldif`:

```yaml
dn: uid=testuser,ou=People,dc=vibhuvioio,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
cn: Test User
sn: User
uid: testuser
uidNumber: 10000
gidNumber: 10000
homeDirectory: /home/testuser
mail: testuser@vibhuvioio.com
userPassword: password
```

Add user:

```bash
docker exec -i openldap-vibhuvioio ldapadd \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -f /dev/stdin < testuser.ldif
```

Verify:

```bash
docker exec openldap-vibhuvioio ldapsearch \
  -x -b "ou=People,dc=vibhuvioio,dc=com"
```

## Add Keycloak to Docker Compose

Add to your `docker-compose.yml`:

```yaml
  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    container_name: keycloak
    command: start-dev
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    ports:
      - "8080:8080"
    depends_on:
      - openldap
    networks:
      - ldap-shared-network
```

Restart:

```bash
docker compose up -d
```

## Configure Keycloak

Open http://localhost:8080 and login with `admin / admin`.

### Create Realm

Create a new realm (e.g., `ldap-realm`).

### Add LDAP Federation

Go to **User Federation** → Add provider → **LDAP**

| Setting | Value |
|---------|-------|
| Connection URL | `ldap://openldap-vibhuvioio:389` |
| Bind DN | `cn=Manager,dc=vibhuvioio,dc=com` |
| Bind Credential | `changeme` |
| Users DN | `ou=People,dc=vibhuvioio,dc=com` |
| Edit Mode | **READ_ONLY** |
| Import Users | **OFF** |
| Sync Registrations | **OFF** |
| Authentication Mode | **LDAP_ONLY** |

Save.

> **Warning:** If you enable Import Users, you break the design. This pattern relies on LDAP being the sole identity store.

## Test Authentication

Go to the Realm login page and login with:

```
username: testuser
password: password
```

If successful:
- LDAP performed the bind
- Keycloak issued a token
- User is NOT stored in Keycloak DB

Check the Users list — you should NOT see permanently imported users.

## Keycloak User Federation vs Auth Only

| Aspect | User Federation (file 9) | Auth Only (this guide) |
|--------|--------------------------|------------------------|
| Import Users | ON | OFF |
| Sync Registrations | OFF | OFF |
| User stored in Keycloak | Yes (cached) | No |
| Authentication | Via imported user | Live LDAP bind |
| Use case | SSO with local cache | Pure LDAP gateway |

## Production Considerations

Running on plain port 389 in production is not recommended. Switch to LDAPS:

```
ldaps://openldap-vibhuvioio:636
```

Also configure:
- TLS certificates and truststore in Keycloak
- LDAP connection pooling
- Health checks
- Network segmentation between LDAP and application tier

## Failure Modes

If login fails, check:
- Wrong Users DN
- Wrong attribute (`uid` vs `cn`)
- Wrong bind DN permissions
- LDAP not reachable from Keycloak container
- Firewall inside Docker network

Debug using container logs, not the UI.

## Result

- LDAP → Identity source (single source of truth)
- Keycloak → Authentication gateway (token issuer)
- No user duplication
- Minimal, production-aligned setup
