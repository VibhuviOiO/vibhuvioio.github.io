---
title: Compatibility
description: "What LDAP Manager needs from your OpenLDAP server: which features are pure LDAP, which need optional server-side configuration, and the exact enablement LDIF."
---

# What Works With My OpenLDAP

LDAP Manager talks plain LDAP with the bind DN you configure. It is not tied to a particular
OpenLDAP image, distribution or vendor - any OpenLDAP server you can bind to is a candidate.

It is **OpenLDAP only, by design**. Active Directory and 389 Directory Server are not
supported: the app reads OpenLDAP's `cn=config`, `cn=Monitor` and the `accesslog` overlay,
which those servers do not have, and no AD or 389 schema handling is implemented.

| Server | Status |
|---|---|
| OpenLDAP 2.6.x | supported - the project's own `openldap-docker` image ships 2.6.10 |
| OpenLDAP 2.4.x | plain LDAP features should work; the `cn=config` layout differs and this project does not test it |
| Active Directory | not supported |
| 389 Directory Server | not supported |

## The matrix

| Feature | What it needs on the server |
|---|---|
| Entries, DIT tree, user/group/OU create, edit, delete | a bind DN with read and write access |
| Bulk update, bulk group add, bulk delete | readwrite role plus a writable bind DN |
| LDIF import and export, CSV export | same as above; nothing server-side |
| Search, paging, sorting | the RFC 2696 paged-results control, on by default in OpenLDAP |
| TLS, LDAPS, StartTLS | a server certificate; see [TLS & LDAPS](/ldap-manager/tls/) |
| Schema browser | read access to `cn=config` through the cluster's `config:` credential |
| Schema editing | admin role plus write access to `cn=config` |
| ACI editor (`olcAccess`) | same `cn=config` credential |
| Monitoring, replication topology | optional: the `cn=Monitor` backend and `cn=config` |
| Server-side change log | optional: the `accesslog` overlay |

The rows above `Schema browser` are pure LDAP: any OpenLDAP you can bind to is enough. From
`Schema browser` down, the server must expose `cn=config` - and, for the last row, the
`accesslog` overlay - before the feature can do anything.

> **Note:** The app probes each optional capability on the cluster you select. A missing one never turns into an error page - the feature says so and shows the exact steps.

## How degradation works

1. **Detect** - `GET /api/capabilities/{cluster}` probes the server and answers for each
   capability: `ok`, `missing`, or `unknown`.
2. **Degrade** - the probe never raises. An unreachable server, or a cluster with no
   credential, reads as `unknown` rather than breaking a screen.
3. **Show** - the UI renders the notice inline, with the reason and the enablement LDIF in a
   copyable block. When the capability is present, nothing is rendered at all.

| Status | Meaning | What the UI says |
|---|---|---|
| `ok` | the probe found it | nothing |
| `missing` | the probe looked and did not find it | not enabled on this server, with the LDIF and a **Copy** button |
| `unknown` | the probe could not look - usually no `config:` credential, or the server is down | *cannot tell on this cluster* |

`unknown` is deliberately not reported as "disabled": a false negative sends people chasing a
problem they do not have. The fix for `unknown` is almost always to add a `config:`
credential, which is also what the schema and ACI editors need.

## Enabling `cn=config` access

The data bind DN usually cannot read `cn=config`, so give the app a second credential. Either
reuse the existing config admin, or grant a dedicated DN read access:

```ldif
# Give this app a cn=config credential.
# Simplest: use the config admin that already exists.
#   config:
#     bind_dn: "cn=config"
#     credential:
#       source: env        # LDAP_MANAGER_CONFIG_<CLUSTER>_PASSWORD
#
# Or grant a dedicated DN read access to cn=config:
dn: cn=config
changetype: modify
add: olcAccess
olcAccess: to * by dn.exact="cn=ldap-manager,dc=example,dc=com" read by * none
```

Then point the cluster at it. The environment variable name is derived from the cluster name
unless you set it explicitly:

```yaml
clusters:
  - name: "Production LDAP"
    host: "ldap.example.com"
    bind_dn: "cn=admin,dc=example,dc=com"
    base_dn: "dc=example,dc=com"
    config:
      bind_dn: "cn=config"
      credential:
        source: env
        env: LDAP_MANAGER_CONFIG_PRODUCTION_LDAP_PASSWORD
```

## Enabling the monitor backend

The probe checks that `cn=Monitor` answers. Load the module and grant your bind DN read
access:

```ldif
# Enable the monitor backend (needed for the Monitoring page)
dn: cn=module{0},cn=config
changetype: modify
add: olcModuleLoad
olcModuleLoad: back_monitor

dn: olcDatabase={1}monitor,cn=config
changetype: modify
add: olcAccess
olcAccess: to * by dn.exact="cn=Manager,dc=example,dc=com" read by * none
```

Replace `cn=Manager,dc=example,dc=com` with the cluster's `bind_dn` before applying. The
`olcDatabase={1}monitor` entry exists once the monitor module is loaded - on some builds it is
already there - so apply both changes together, in this order.

> **Note:** The notice is the app's statement about what it checks, not a claim that every monitoring screen breaks. Per-node entry counts and `contextCSN` sync age are read over plain LDAP, and the topology view reads `olcSyncrepl` from `cn=config`. `cn=Monitor` is where the aggregate operation counters come from.

## Enabling the server-side change log

`accesslog` needs the module load, a second `cn=log` database and an overlay entry on the data
database. The full LDIF, the directory to create first and the rotation setting are on
[Audit & Change Logs](/ldap-manager/audit-logging/). Note that the probe can only report this
one when the cluster has a working `config:` credential.

## Verify

```bash
# per-capability status for one cluster
curl -s -b /tmp/lm.jar http://localhost:8000/api/capabilities/Production%20LDAP
```

```json
{
  "cluster": "Production LDAP",
  "capabilities": [
    {"id": "config", "title": "cn=config access", "why": "The Schema and ACI editors read cn=config.", "status": "ok", "enable_ldif": null},
    {"id": "monitor", "title": "Monitoring backend (cn=Monitor)", "why": "Per-node stats and the replication view read cn=Monitor.", "status": "ok", "enable_ldif": null},
    {"id": "accesslog", "title": "Server-side change log (accesslog)", "why": "Without it, changes made by scripts, ldapmodify or replication are invisible.", "status": "missing", "enable_ldif": "# 1. Load the accesslog schema, then the module\n..."}
  ],
  "missing": ["accesslog"]
}
```

An empty `missing` array means the server is fully configured for every optional feature.

## Next steps

- [Configuration](/ldap-manager/configuration/) - clusters, credentials, TLS, forms
- [Audit & Change Logs](/ldap-manager/audit-logging/) - the `accesslog` LDIF in full
- [UI Guide](/ldap-manager/ui-guide/) - where each notice appears
