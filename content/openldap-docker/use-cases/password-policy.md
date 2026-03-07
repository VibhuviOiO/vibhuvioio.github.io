---
title: Password Policy
description: Validate OpenLDAP password policy overlay enforcement — minimum length, lockout, history, and expiration.
---

# Password Policy

Test the OpenLDAP password policy overlay with automated validation of policy enforcement rules.

## Project Files

```project
name: openldap-ppolicy
docker-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/password-policy-test/docker-compose.yml
.env.password-policy: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/password-policy-test/.env.password-policy
test-password-policy.sh: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/password-policy-test/test-password-policy.sh
```

## Start

```bash
# Create shared network
docker network create ldap-shared-network 2>/dev/null || true

docker compose up -d

# Wait for initialization
sleep 30
```

## Run Tests

```bash
./test-password-policy.sh
```

The script validates:

1. **Overlay loaded** — ppolicy overlay exists in `cn=config`
2. **Policy OU exists** — `ou=Policies,dc=test,dc=com` is created
3. **Default policy exists** — `cn=default,ou=Policies,dc=test,dc=com` with all attributes
4. **Policy enforcement** — weak passwords rejected, strong passwords accepted

## Default Policy

| Attribute | Value | Description |
|-----------|-------|-------------|
| `pwdMinLength` | `8` | Minimum password length |
| `pwdMaxFailure` | `5` | Max consecutive failed logins |
| `pwdLockout` | `TRUE` | Account lockout enabled |
| `pwdLockoutDuration` | `1800` | Lockout duration (30 minutes) |
| `pwdMaxAge` | `7776000` | Password expires after 90 days |
| `pwdInHistory` | `5` | Cannot reuse last 5 passwords |
| `pwdMustChange` | `TRUE` | User must change password on first login |

## Manual Testing

### Check Policy Configuration

```bash
ldapsearch -x -H ldap://localhost:391 \
  -D "cn=Manager,dc=test,dc=com" -w admin123 \
  -b "cn=default,ou=Policies,dc=test,dc=com" -s base
```

### Test Weak Password (Should Fail)

```bash
ldapadd -x -H ldap://localhost:391 \
  -D "cn=Manager,dc=test,dc=com" -w admin123 <<EOF
dn: uid=weakuser,ou=People,dc=test,dc=com
objectClass: inetOrgPerson
uid: weakuser
cn: Weak User
sn: User
userPassword: 123
EOF
```

### Test Strong Password (Should Succeed)

```bash
ldapadd -x -H ldap://localhost:391 \
  -D "cn=Manager,dc=test,dc=com" -w admin123 <<EOF
dn: uid=stronguser,ou=People,dc=test,dc=com
objectClass: inetOrgPerson
uid: stronguser
cn: Strong User
sn: User
userPassword: MySecurePass123!
EOF
```

## Connection Details

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| LDAP Port | `391` |
| LDAPS Port | `638` |
| Bind DN | `cn=Manager,dc=test,dc=com` |
| Base DN | `dc=test,dc=com` |
| Password | `admin123` |

## Troubleshooting

**Policy not enforced** — Verify overlay is loaded:
```bash
ldapsearch -x -H ldap://localhost:391 \
  -D "cn=Manager,dc=test,dc=com" -w admin123 \
  -b "cn=config" "(objectClass=olcPPolicyConfig)"
```

**Policy entry missing** — Check the OU:
```bash
ldapsearch -x -H ldap://localhost:391 \
  -D "cn=Manager,dc=test,dc=com" -w admin123 \
  -b "ou=Policies,dc=test,dc=com"
```

## Cleanup

```bash
docker compose down -v
```
