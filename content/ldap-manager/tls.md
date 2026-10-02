---
title: TLS & LDAPS
description: "Configure LDAPS or StartTLS in LDAP Manager, with CA and client-certificate verification per cluster."
---

# TLS & LDAPS

Set per cluster, so a plaintext lab and a hardened production directory can coexist.

```yaml
clusters:
  - name: "secure"
    host: "ldap.example.com"
    port: 636
    bind_dn: "cn=admin,dc=example,dc=com"
    base_dn: "dc=example,dc=com"
    tls:
      mode: ldaps          # none (default) | ldaps | starttls
      ca_file: /certs/ca.crt
      verify: true         # false accepts any certificate - lab only
```

| Key | Meaning |
|---|---|
| `mode` | `none` plain `ldap://`; `ldaps` TLS from the first byte; `starttls` connect then upgrade |
| `ca_file` | CA bundle used to verify the server certificate |
| `cert_file` / `key_file` | Client certificate for mutual TLS |
| `verify` | `true` (default) verifies the certificate; `false` accepts any certificate |

The paths are **inside the container**, so mount the certificates:

```bash
docker run -d --name ldap-manager \
  -v ./certs:/certs:ro \
  ldap-manager:latest
```

## Ports

`mode: ldaps` with a configured port of `389` is raised to `636` and logged, since 389 is
the plaintext default. Set `port` explicitly to use anything else. StartTLS uses the
normal port - typically `389`.

## Verify it works

```bash
# LDAPS
ldapsearch -x -H ldaps://ldap.example.com:636 -D "cn=admin,dc=example,dc=com" \
  -w "$PW" -b "dc=example,dc=com" -s base "(objectClass=*)" dn

# StartTLS
ldapsearch -x -ZZ -H ldap://ldap.example.com:389 -D "cn=admin,dc=example,dc=com" \
  -w "$PW" -b "dc=example,dc=com" -s base "(objectClass=*)" dn
```

A certificate failure surfaces with the settings that were in play:

```
LDAP connection failed: ... certificate verify failed (self-signed certificate)
[TLS mode 'ldaps', CA /certs/ca.crt, certificate verification ON]
```

Swap the CA, or set `verify: false` to confirm it is a certificate problem and not
reachability. Do not leave `verify: false` in production.

## Scope

TLS applies to **every** connection the app opens - entries, monitoring, schema, ACI,
backup, LDIF and `auth.mode: ldap` binds. There is no separate TLS toggle per feature.

## Next steps

- [Configuration](/ldap-manager/configuration/) - the full cluster schema
- [Security](/ldap-manager/security/) - authentication and roles
