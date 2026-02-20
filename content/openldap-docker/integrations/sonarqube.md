---
title: SonarQube Integration
description: Configure SonarQube LDAP authentication with OpenLDAP. Group-based authorization with read-only bind account.
---

# LDAP + SonarQube Authentication

Configure SonarQube to authenticate users against OpenLDAP with group-based authorization.

## Docker Compose

Download and start the stack:

```bash
wget https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/main/openldap/docker-compose-sonarqube.yml -O docker-compose.yml
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

## Create LDAP Groups

Create `groups.ldif`:

```yaml
dn: ou=Groups,dc=vibhuvioio,dc=com
objectClass: organizationalUnit
ou: Groups

dn: cn=sonarqube-admins,ou=Groups,dc=vibhuvioio,dc=com
objectClass: groupOfNames
cn: sonarqube-admins

dn: cn=sonarqube-users,ou=Groups,dc=vibhuvioio,dc=com
objectClass: groupOfNames
cn: sonarqube-users
```

Import:

```bash
docker exec -i openldap-vibhuvioio ldapadd \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -f /dev/stdin < groups.ldif
```

## Create Read-Only Bind Account

Create `readonly.ldif`:

```yaml
dn: uid=sonarbind,ou=People,dc=vibhuvioio,dc=com
objectClass: inetOrgPerson
cn: Sonar Bind
sn: Bind
uid: sonarbind
userPassword: bindpassword
```

Import:

```bash
docker exec -i openldap-vibhuvioio ldapadd \
  -x -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  -f /dev/stdin < readonly.ldif
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

## Add User to Group

Create `add-member.ldif`:

```yaml
dn: cn=sonarqube-users,ou=Groups,dc=vibhuvioio,dc=com
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
docker exec openldap-vibhuvioio ldapsearch \
  -x -LLL \
  -b "ou=People,dc=vibhuvioio,dc=com" "(uid=testuser)"
```

Verify password bind:

```bash
docker exec openldap-vibhuvioio ldapwhoami \
  -x \
  -D "uid=testuser,ou=People,dc=vibhuvioio,dc=com" \
  -w password
```

## Login Verification

Open http://localhost:9000

Login with:

```
username: testuser
password: password
```

Successful login confirms LDAP authentication with SonarQube.
