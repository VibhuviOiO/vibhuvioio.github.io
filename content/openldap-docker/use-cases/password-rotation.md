---
title: Password Rotation
description: Rotate the OpenLDAP admin password without re-bootstrapping the directory.
---

# Password Rotation

Rotating the admin password is two writes that must happen in a specific order. Get it wrong and the container crash-loops on a perfectly healthy database.

## Where the password lives

Not on the `cn=Manager` entry. That entry is an `organizationalRole`, which does not permit `userPassword`:

```
ldap_modify: Object class violation (65)
	additional info: attribute 'userPassword' not allowed
```

It lives in `cn=config`, and only `ldapi:///` with `EXTERNAL` — the container's root over the unix socket — can write it. A TCP bind as `cn=Manager` cannot, not even as root DN.

```
dn: olcDatabase={2}mdb,cn=config
olcRootPW: <plaintext or hash>
```

## Why the order matters

`startup.sh` decides whether the base domain exists by binding as `cn=Manager` with the password from the secret file. If that bind fails with `Invalid credentials (49)`, it reads the failure as "no domain yet" and tries to create one — on a database that already exists:

```
[STEP] Creating base domain...
```

It retries, restarts, and loops. So across a restart, the file and `olcRootPW` must agree. That single constraint dictates the whole procedure: change the directory first, update the file, restart last.

## Project Files

```project
name: openldap-password-rotation
docker-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/openldap-usecases/main/password-rotation/docker-compose.yml
```

## Rotate

```bash
# 1. Change the password in the directory. Writes cn=config over the socket.
docker exec -i openldap-rotation ldapmodify -Y EXTERNAL -H ldapi:/// <<'LDIF'
dn: olcDatabase={2}mdb,cn=config
changetype: modify
replace: olcRootPW
olcRootPW: NewP@ssw0rd456!
LDIF
# modifying entry "olcDatabase={2}mdb,cn=config"

# 2. Prove it BEFORE touching the file: the new password binds, the old is refused
docker exec openldap-rotation ldapsearch -x -H ldap://localhost \
  -D cn=Manager,dc=example,dc=com -w 'NewP@ssw0rd456!' -b dc=example,dc=com -s base dn
# dn: dc=example,dc=com

docker exec openldap-rotation ldapsearch -x -H ldap://localhost \
  -D cn=Manager,dc=example,dc=com -w 'OldP@ssw0rd123!' -b dc=example,dc=com -s base dn
# ldap_bind: Invalid credentials (49)

# 3. Only now update the file
printf 'NewP@ssw0rd456!' > secrets/admin_password.txt

# 4. Restart last
docker compose restart
docker compose ps          # want: Up ... (healthy)
```

Step 2 is the only window where the directory and the file disagree. A restart there is what breaks the container — which is why it comes last.

## Verify it did not re-bootstrap

The first start logs `Creating base domain` exactly once, when it legitimately creates it. A rotation must not add a second:

```bash
docker logs openldap-rotation | grep -c "Creating base domain"
# 1

docker inspect -f '{{.RestartCount}}' openldap-rotation
# 0
```

A count greater than 1, or a non-zero restart count, means the file and `olcRootPW` disagreed across the restart.

## Rotate the config password too

`LDAP_CONFIG_PASSWORD` is a separate credential and is not covered by `olcRootPW`. Update `secrets/config_password.txt` the same way and restart — the config database is only ever reached over `ldapi:///`, so there is no in-directory step.

## Cleanup

```bash
docker compose down -v
```
