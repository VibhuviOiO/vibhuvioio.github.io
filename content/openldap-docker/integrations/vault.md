---
title: HashiCorp Vault Integration
description: Configure HashiCorp Vault LDAP authentication with OpenLDAP. Policy-driven access control with group mapping.
---

# HashiCorp Vault LDAP Authentication

Configure HashiCorp Vault to authenticate users against OpenLDAP using the LDAP auth method with policy-driven access control.

## Docker Compose

Download and start the stack:

```bash
wget https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/main/openldap/docker-compose-vault.yml -O docker-compose.yml
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

## Verify LDAP Base Tree

```bash
docker exec openldap-vibhuvioio ldapsearch -x -LLL -b dc=vibhuvioio,dc=com
```

Expected: `ou=People` and `ou=Group`

## Create LDAP Groups

Create `groups.ldif`:

```yaml
dn: cn=vault-users,ou=Group,dc=vibhuvioio,dc=com
objectClass: groupOfNames
cn: vault-users
member: cn=Manager,dc=vibhuvioio,dc=com

dn: cn=vault-admins,ou=Group,dc=vibhuvioio,dc=com
objectClass: groupOfNames
cn: vault-admins
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
description: Vault Test User
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
dn: cn=vault-users,ou=Group,dc=vibhuvioio,dc=com
changetype: modify
add: member
member: cn=testuser,ou=People,dc=vibhuvioio,dc=com
EOF
```

## Configure Vault LDAP Authentication

Enter the Vault container:

```bash
docker exec -it vault sh
```

Set environment:

```bash
export VAULT_ADDR=http://127.0.0.1:8200
export VAULT_TOKEN=root
```

Enable LDAP auth:

```bash
vault auth enable ldap
```

Configure LDAP connection:

```bash
vault write auth/ldap/config \
  url="ldap://openldap-vibhuvioio:389" \
  binddn="cn=Manager,dc=vibhuvioio,dc=com" \
  bindpass="changeme" \
  userdn="ou=People,dc=vibhuvioio,dc=com" \
  groupdn="ou=Group,dc=vibhuvioio,dc=com" \
  userattr="cn" \
  groupattr="cn" \
  groupfilter="(&(objectClass=groupOfNames)(member={{.UserDN}}))"
```

## Create Vault Policy

```bash
vault policy write vault-user - <<EOF
path "secret/data/*" {
  capabilities = ["read"]
}
EOF
```

Map LDAP group to policy:

```bash
vault write auth/ldap/groups/vault-users \
  policies=vault-user
```

## Store a Test Secret

```bash
vault kv put secret/demo message="LDAP auth working"
```

Exit container:

```bash
exit
```

## Login via Vault UI

Open http://localhost:8200

1. Select **LDAP** auth method
2. Username: `testuser`
3. Password: `password`
4. Navigate to: Secrets → secret → demo

You should see the stored secret.

## Architecture

This demonstrates a policy-driven LDAP authentication flow:

- LDAP groups map to Vault policies
- Users authenticate via LDAP bind
- Access is controlled by group membership
- Suitable for enterprise environments
