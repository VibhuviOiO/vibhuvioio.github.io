---
title: Authentication Modes
description: "auth.mode none, local and ldap in LDAP Manager: the exact config.yml, where each role comes from, and whether login is required."
---

# Authentication Modes

`auth.mode` in `config.yml` decides how people get into LDAP Manager and what role the API
gives them. Roles are enforced server-side on every route; the UI only hides controls it
knows a role cannot use.

| `auth.mode` | Login | Role comes from | Pick it when |
|---|---|---|---|
| `none` | not required | one operator-set role: `auth.default_role` | a reverse proxy, oauth2-proxy or SSO already authenticates users |
| `local` | required | the built-in account's `role` | no external auth; a handful of operators |
| `ldap` | required | `auth.ldap.role_map.groups`, highest matching group wins | your operators already exist in the directory |

> **Warning:** In `local` and `ldap` mode an anonymous request is refused with `401 Authentication required` - including reads. Only `none` serves anonymous traffic.

The `auth:` block is re-read from `config.yml` on every request, so an edit takes effect on
the next request. A session already issued keeps the role sealed inside its signed token
until it expires or the user signs out.

## Where the role comes from

| Mode | Who the request is | Role |
|---|---|---|
| `none` | `anonymous`, `authenticated: false` | `auth.default_role` |
| `local` | the signed-in username | that account's `role` |
| `ldap` | the signed-in username | highest-ranked group in `role_map.groups`; otherwise `role_map.default` |

Roles rank `readonly` then `readwrite` then `admin`. What each role may do is a table on
[Security](/ldap-manager/security/).

## `none` - no login

```yaml
auth:
  mode: none
  default_role: readonly     # readonly | readwrite | admin
```

- No login screen. Every request is `anonymous` with `default_role`.
- The default is `readonly`, so a direct hit on the app can browse and export but not write.
- `default_role` is **not** offered in the UI and no API writes `config.yml`. It is a single
  operator decision, on purpose: a visitor-selectable "admin" would be privilege escalation.
- Raise it to `admin` only when the app is unreachable except through your authenticating
  proxy.
- The header badge shows the active role and that it came from `auth.default_role`.
- `POST /api/auth/login` answers `400 Login is disabled (auth.mode is 'none'). Set it to
  'local' or 'ldap'.`

## `local` - built-in accounts

```yaml
auth:
  mode: local
  session:
    lifetime_hours: 12       # default
```

- With no accounts yet, the UI shows a one-time wizard backed by `POST /api/auth/setup`.
- Passwords are scrypt-hashed, minimum 8 characters.
- Accounts live Fernet-encrypted at `/app/.secrets/users.enc`; the key is
  `/app/.secrets/encryption.key`, mode `0600`. Persist that volume - recreate the container
  without it and every account is gone.
- Admins manage accounts through `/api/auth/users`. The last admin cannot be demoted or
  removed.
- These accounts are unrelated to cluster bind credentials, which come from `config.yml`
  and are never written to `.secrets`.

Create the first admin - only valid while `mode: local` and no account exists:

```bash
curl -s -X POST http://localhost:8000/api/auth/setup \
  -H 'Content-Type: application/json' \
  -d '{"users":[{"username":"admin","password":"change-me-now","role":"admin"}]}'
```

Add or update an account later (admin session, cookie jar from the login below):

```bash
curl -s -b /tmp/lm.jar -X POST http://localhost:8000/api/auth/users \
  -H 'Content-Type: application/json' \
  -d '{"username":"ops","password":"another-one","role":"readwrite"}'
```

## `ldap` - your directory authenticates

```yaml
auth:
  mode: ldap
  session:
    lifetime_hours: 12
  ldap:
    cluster: "Production LDAP"                     # must match a clusters[].name
    user_dn_template: "uid={username},ou=People,dc=example,dc=com"
    user_base_dn: "dc=example,dc=com"              # group search base; defaults to the cluster base_dn
    role_map:
      default: readonly
      groups:
        "cn=ldap-admins,ou=Group,dc=example,dc=com": admin
        "cn=ldap-ops,ou=Group,dc=example,dc=com": readwrite
```

- Login binds as **the user's own DN with the user's own password**. No cluster-wide bind
  secret is needed to sign in, which is why LDAP login works before any `credential:` is
  configured for that cluster.
- The user DN comes from `user_dn_template` with `{username}` replaced. Without a template it
  is the username prefixed with `uid=`, under `user_base_dn` - falling back to the cluster's
  `base_dn`. No DN, no login.
- The role starts at `role_map.default` and is raised to the **highest-ranked** group that
  matches. A user in both `ldap-admins` and `ldap-ops` is `admin`.
- Group membership is read as the user, so no service account is involved:
  1. the `memberOf` values on the user's own entry, then
  2. if none, a subtree search under `user_base_dn` (or the cluster `base_dn`) matching the
     user's DN in `member`, then `uniqueMember`, then their username in `memberUid`.
- Because all three attributes are searched, `groupOfNames`, `groupOfUniqueNames` and
  `posixGroup` groups all map.
- Group DNs are compared to `role_map.groups` exactly, after trimming whitespace. A typo
  silently drops that group.
- If the user cannot read their own entry or the group entries, the lookup returns nothing
  and the user gets `role_map.default` - a login that "works" but with the wrong role usually
  means the directory is hiding membership.
- `auth.ldap.cluster` must name a configured cluster. Every other cluster stays a cluster to
  manage, but never authenticates anyone.
- The login bind uses that cluster's `tls:` block, exactly like every other LDAP call. See
  [TLS & LDAPS](/ldap-manager/tls/).

> **Note:** Only `user_dn_template` (or the `uid=` fallback above) builds the login DN. `user_filter` and `bind_dn_template` are read from config but not used by the login path, so do not rely on them to find a user.

## Verify

```bash
# which mode is live, and does the wizard need to run?
curl -s http://localhost:8000/api/auth/status

# anonymous read in local/ldap mode -> 401 Authentication required
curl -si http://localhost:8000/api/clusters/list | head -1

# sign in; the session cookie is written to the jar
curl -s -c /tmp/lm.jar -X POST http://localhost:8000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"change-me-now"}'

# who am I, and with which role
curl -s -b /tmp/lm.jar http://localhost:8000/api/auth/me
```

## Next steps

- [Security](/ldap-manager/security/) - what each role can do, and the audit trail
- [Audit & Change Logs](/ldap-manager/audit-logging/) - the app log names the signed-in user
- [Configuration](/ldap-manager/configuration/) - clusters, credentials, TLS
