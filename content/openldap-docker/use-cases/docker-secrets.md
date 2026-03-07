---
title: Docker Secrets
description: Securely manage OpenLDAP passwords using Docker secrets instead of plaintext environment variables.
---

# Docker Secrets

Deploy OpenLDAP with passwords loaded from Docker secrets instead of plaintext environment variables. Passwords never appear in `docker inspect`, process lists, or container metadata.

## Project Files

```project
name: openldap-secrets
docker-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/docker-secrets/docker-compose.yml
```

## Create Secret Files

```bash
echo "YourSecureAdminPassword" > secrets/admin_password.txt
echo "YourSecureConfigPassword" > secrets/config_password.txt
```

> **Important:** Add `secrets/*.txt` to your `.gitignore` to avoid committing passwords.

## Start

```bash
docker compose up -d
```

## Verify Secrets Are Used

```bash
# Passwords should NOT appear in environment variables
docker exec openldap-secrets env | grep -i password
# Expected: LDAP_ADMIN_PASSWORD_FILE=/run/secrets/ldap_admin_password
# (not the actual password)

# Verify the secret file is mounted
docker exec openldap-secrets cat /run/secrets/ldap_admin_password
```

## Test Authentication

```bash
ADMIN_PASS=$(cat secrets/admin_password.txt)

ldapsearch -x -H ldap://localhost:389 \
  -D "cn=Manager,dc=example,dc=com" \
  -w "$ADMIN_PASS" \
  -b "dc=example,dc=com" -s base
```

## How It Works

The Docker Compose file uses the `secrets` directive:

```yaml
services:
  openldap:
    environment:
      - LDAP_ADMIN_PASSWORD_FILE=/run/secrets/ldap_admin_password
      - LDAP_CONFIG_PASSWORD_FILE=/run/secrets/ldap_config_password
    secrets:
      - ldap_admin_password
      - ldap_config_password

secrets:
  ldap_admin_password:
    file: ./secrets/admin_password.txt
  ldap_config_password:
    file: ./secrets/config_password.txt
```

The `startup.sh` script detects `_FILE` variants and reads the password from the file at runtime:

```bash
if [ -n "$LDAP_ADMIN_PASSWORD_FILE" ] && [ -f "$LDAP_ADMIN_PASSWORD_FILE" ]; then
    LDAP_ADMIN_PASSWORD=$(cat "$LDAP_ADMIN_PASSWORD_FILE")
fi
```

## Security Comparison

| Plaintext Env Var | Docker Secrets |
|-------------------|----------------|
| Visible in `docker inspect` | Hidden from container metadata |
| In process list (`ps e`) | Only in file readable by container |
| May be logged | Not logged by default |
| Risk of git commit | Can be gitignored |

## Connection Details

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| LDAP Port | `389` |
| LDAPS Port | `636` |
| Bind DN | `cn=Manager,dc=example,dc=com` |
| Base DN | `dc=example,dc=com` |
| Password | Contents of `secrets/admin_password.txt` |

## Production Recommendations

1. **Never commit secrets to git** — add `secrets/*.txt` to `.gitignore`
2. **Use proper secret managers** — Docker Swarm (`docker secret create`), Kubernetes Sealed Secrets, or HashiCorp Vault
3. **Rotate secrets regularly** — update the file and restart the container
4. **Set strict permissions** — `chmod 600 secrets/*.txt`

## Cleanup

```bash
docker compose down -v
```
