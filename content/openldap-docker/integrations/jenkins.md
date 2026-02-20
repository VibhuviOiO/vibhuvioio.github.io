---
title: Jenkins Integration
description: Integrate Jenkins with OpenLDAP for CI/CD authentication. Group-based authorization with matrix security.
---

# LDAP + Jenkins Authentication

Configure Jenkins to authenticate users against OpenLDAP and enforce access using LDAP groups.

## Docker Compose

Download and start the stack:

```bash
wget https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/main/openldap/docker-compose-jenkins.yml -O docker-compose.yml
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
```

Wait 60 seconds for LDAP initialization.

## Create Directory Structure

Create `base.ldif`:

```yaml
dn: ou=People,dc=vibhuvioio,dc=com
objectClass: organizationalUnit
ou: People

dn: ou=Groups,dc=vibhuvioio,dc=com
objectClass: organizationalUnit
ou: Groups
```

Import:

```bash
docker exec -i openldap-vibhuvioio ldapadd \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -f /dev/stdin < base.ldif
```

## Create Jenkins Authorization Groups

Create `groups.ldif`:

```yaml
dn: cn=ci-admins,ou=Groups,dc=vibhuvioio,dc=com
objectClass: groupOfNames
cn: ci-admins
member: cn=dummy,dc=vibhuvioio,dc=com

dn: cn=ci-developers,ou=Groups,dc=vibhuvioio,dc=com
objectClass: groupOfNames
cn: ci-developers
member: cn=dummy,dc=vibhuvioio,dc=com
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
dn: uid=testuser,ou=People,dc=vibhuvioio,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: Test User
sn: User
givenName: Test
uid: testuser
uidNumber: 10001
gidNumber: 10001
homeDirectory: /home/testuser
mail: testuser@vibhuvioio.com
userPassword: password
```

Import:

```bash
docker exec -i openldap-vibhuvioio ldapadd \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -f /dev/stdin < testuser.ldif
```

## Add User to Admin Group

Create `add-member.ldif`:

```yaml
dn: cn=ci-admins,ou=Groups,dc=vibhuvioio,dc=com
changetype: modify
add: member
member: uid=testuser,ou=People,dc=vibhuvioio,dc=com
```

Apply:

```bash
docker exec -i openldap-vibhuvioio ldapmodify \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -f /dev/stdin < add-member.ldif
```

## Verify LDAP Authentication

```bash
docker exec openldap-vibhuvioio ldapwhoami \
  -x \
  -D "uid=testuser,ou=People,dc=vibhuvioio,dc=com" \
  -w password
```

Expected: `dn:uid=testuser,ou=People,dc=vibhuvioio,dc=com`

## Jenkins Configuration

Retrieve initial admin password:

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Open http://localhost:8080 and paste the password when prompted.

Select **Install suggested plugins**.

## Login Verification

Login with:

```
username: testuser
password: password
```

Successful login confirms LDAP authentication with group-based CI access control.
