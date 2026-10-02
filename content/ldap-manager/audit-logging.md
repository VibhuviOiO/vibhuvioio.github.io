---
title: Audit & Change Logs
description: "Two audit layers in LDAP Manager: the always-on app audit log that names the UI user, and the OpenLDAP accesslog overlay that sees every writer. How to enable each and where it works."
---

# Audit & Change Logs

Two layers answer two different questions.

| Layer | Answers | Lives where | Optional server config |
|---|---|---|---|
| App audit | which signed-in user changed what | `audit.log` inside the ldap-manager container | no, always on |
| `accesslog` overlay | every writer: the UI, scripts, `ldapmodify`, replication | an LDAP database (`cn=log`) on the OpenLDAP server | yes |
| `auditlog` overlay | the same, as a text file on the slapd host | a file that must be shared with ldap-manager | yes, and only on one host |

The app audit alone cannot see a change made by `ldapmodify` on the server. A server-side
log alone cannot say *which UI user* did it. That is why both exist.

The **Activity** tab reads the first layer, and reports on the second: it renders the
`accesslog` capability notice, so a missing server-side log is explained where you would
look for it. The server-side entries themselves are read with an LDAP query
([Verify](#verify)).

## Layer 1 - the app audit log (always on)

- Written at the point of the change, in the same process that authenticated the request, so
  every entry names the actor and their role.
- One JSON object per line, append-only, under the writable data directory:
  `$LDAP_MANAGER_DATA/audit.log` - `/app/.data/audit.log` by default, override with
  `LDAP_MANAGER_AUDIT_LOG`.
- Recorded by one ASGI middleware that sees every mutating request, so a new write endpoint
  cannot be added without being audited. A dry-run LDIF apply is not recorded, because it
  changes nothing. An entry is written even when the request fails.

Actions recorded:

| Action | Trigger |
|---|---|
| `entry.create`, `entry.update`, `entry.delete` | single-entry write |
| `entry.bulk_update`, `entry.group_add`, `entry.bulk_delete` | bulk operations |
| `ldif.apply` | LDIF import |
| `auth.login`, `auth.logout`, `auth.setup` | sign-in lifecycle; a failed bind is a line with `result: "error 401"` |
| `schema.add`, `schema.add_definition`, `schema.remove`, `schema.remove_definition` | schema editing |
| `aci.add`, `aci.remove` | access-rule editing |

One line looks like this:

```json
{"ts":"2026-02-19T10:30:45+00:00","actor":"admin","role":"admin","authenticated":true,
 "action":"entry.update","cluster":"Production LDAP","target":"uid=jdoe,ou=People,dc=example,dc=com",
 "result":"ok","detail":{}}
```

- Read API: `GET /api/audit` - admin only, because it names people. Filters: `limit`
  (max 2000), `actor` (substring), `action` (prefix, so `entry.` catches every entry write),
  `cluster`, `result` (`ok` or `error 401`), `since` (ISO timestamp).
- **Activity** tab in the UI: grouped by day, relative timestamps, filter boxes for actor and
  action, refreshes every 15 seconds.

```bash
# follow it live inside the container
docker compose exec ldap-manager tail -f /app/.data/audit.log

# recent failed logins
curl -s -b /tmp/lm.jar 'http://localhost:8000/api/audit?action=auth.login&result=error%20401'
```

Because it is JSON Lines on a volume, ship it by tailing the file with whatever log pipeline
you already run. Keep the data volume: deleting it deletes the audit trail.

## Layer 2 - the OpenLDAP accesslog overlay (recommended)

`accesslog` writes change records into a second LDAP database, so they are read over the
network like any other LDAP data. That is what makes it work against a remote or managed
server, and why it is the path this app recommends.

Enable it on **your own** server as the config admin. Create the log database directory
first - mdb will not create it:

```bash
# mdb will not create the directory; it must exist and be writable by slapd
# RHEL/Alma: user ldap   |   Debian/Ubuntu: user openldap
install -d -o ldap -g ldap -m 750 /var/lib/ldap/accesslog
```

Then apply this LDIF. LDAP Manager shows the same text in the UI, with the data database DN
already filled in from `cn=config`; here it is the `{2}` default.

```ldif
# 1. Load the accesslog schema, then the module
dn: cn=module{0},cn=config
changetype: modify
add: olcModuleLoad
olcModuleLoad: accesslog

# 2. Create the log database
dn: olcDatabase={3}mdb,cn=config
changetype: add
objectClass: olcDatabaseConfig
objectClass: olcMdbConfig
olcDatabase: {3}mdb
olcSuffix: cn=log
olcDbDirectory: /var/lib/ldap/accesslog
olcRootDN: cn=admin,cn=log
olcAccess: to * by dn.base="gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth" read
  by dn.base="cn=admin,cn=log" write

# 3. Attach it to your data database (olcDatabase={2}mdb,cn=config)
dn: olcOverlay=accesslog,olcDatabase={2}mdb,cn=config
changetype: add
objectClass: olcOverlayConfig
objectClass: olcAccessLogConfig
olcOverlay: accesslog
olcAccessLogDB: cn=log
olcAccessLogOps: writes
olcAccessLogSuccess: TRUE
olcAccessLogPurge: 07+00:00 01+00:00
```

```bash
ldapmodify -Y EXTERNAL -H ldapi:/// -f enable.ldif
```

What the settings mean:

| Setting | Effect |
|---|---|
| `olcModuleLoad: accesslog` | loads the overlay module; it registers its own `audit` schema on load |
| `olcDatabase={3}mdb` | a new database for the log; `{3}` avoids clashing with the databases you have |
| `olcSuffix: cn=log` | where log entries live, as children of `cn=log` |
| `olcAccessLogOps: writes` | log adds, deletes, modifies, modrdns only |
| `olcAccessLogSuccess: TRUE` | successful operations only |
| `olcAccessLogPurge: 07+00:00 01+00:00` | built-in rotation: drop entries older than 7 days, scan daily |

> **Note:** The snippet loads the schema implicitly, via the overlay module. If your build ships `accesslog` as a separate schema file, load it first with `ldapadd -Y EXTERNAL -H ldapi:/// -f accesslog.ldif` from your schema directory - `/etc/openldap/schema/` on RHEL-family images, `/etc/ldap/schema/` on Debian-family.

Rotation is the difference operators notice: `accesslog` prunes itself with
`olcAccessLogPurge`, while a slapd log file needs `logrotate` as usual.

## Layer 2 alternative - the auditlog overlay, and why it usually cannot work

`auditlog` writes an LDIF stream to a **file on the slapd host**. Reading it means opening
that file, which is a local filesystem operation:

- It only works when ldap-manager and slapd share a host volume - the same Docker host with a
  bind mount, or both containers mounting the same directory.
- It **cannot** work against a remote server. There is no path from the app to a file on
  another machine, and no LDAP query returns that file.
- In Kubernetes both pods must mount the same `ReadWriteMany` volume and run in the **same**
  cluster. A `ReadWriteOnce` volume is mounted node-exclusively, so the second pod that needs
  it cannot start. The Helm chart's state volumes default to `ReadWriteOnce`, so an
  `auditlog` file share needs a StorageClass that supports RWX plus
  `persistence.*.accessModes: ["ReadWriteMany"]`.

Use `accesslog` instead and the whole class of problem disappears: it is queried over LDAP,
so the volume never enters the picture.

## Deployment patterns

| Pattern | App audit | Server-side changes |
|---|---|---|
| one ldap-manager + one slapd, same host | one `audit.log` on the data volume | `accesslog` on the server; no shared file needed |
| one ldap-manager, many clusters | one `audit.log`; every entry carries its `cluster`, so it stays filterable | `accesslog` is per server, so enable it on each one you want covered |
| one ldap-manager per cluster | each instance names its own cluster in its own `audit.log` | the matching server's `accesslog` |

The capability probe is per cluster, so a single UI can show "accesslog present" for one
cluster and the enablement notice for another.

## Where the UI says it is missing

The **Activity** tab renders the accesslog capability notice. When the overlay is absent the
notice states the feature is not enabled and offers the LDIF above with a **Copy** button and
the `ldapmodify` command. When the app cannot tell - no `config:` credential for the cluster,
so it cannot read `cn=config` - it says *cannot tell on this cluster* instead of claiming a
problem that may not exist.

## Verify

```bash
# is the overlay visible to the app?  missing: [] means every capability is present
curl -s -b /tmp/lm.jar http://localhost:8000/api/capabilities/Production%20LDAP

# did anything reach the server-side log?
ldapsearch -Y EXTERNAL -H ldapi:/// -b cn=log -s one '(objectClass=auditWriteObject)' reqStart reqType reqDN
```

## Next steps

- [Authentication Modes](/ldap-manager/authentication/) - the actor field is the signed-in user
- [Compatibility](/ldap-manager/compatibility/) - what else needs server-side configuration
- [Production Guide](/ldap-manager/production/) - log shipping and retention
