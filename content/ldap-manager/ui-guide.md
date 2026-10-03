---
title: UI Guide
description: "Screen-by-screen guide to the LDAP Manager interface: the DIT tree, LDIF editor, schema and ACI editors, monitoring, and what each role sees."
---

# UI Guide

Every screen, and what your role changes about it.

## Navigation

| Tab | What it does |
|---|---|
| **Browse** | Lazy DIT tree. Click any entry to inspect its attributes. |
| **Users** | User entries, with search, paging, create / edit / delete. |
| **Groups** | Groups and their members. |
| **Organizational Units** | OU entries. |
| **All Entries** | Everything under the base DN. |
| **LDIF** | Syntax-highlighted editor with Validate (dry run) and Apply. |
| **Schema** | Attribute types and object classes from `cn=schema`. |
| **Access** | `olcAccess` rules per database, in evaluation order. |
| **Monitoring** | Health, per-node table, replication topology. |
| **Activity Log** | Recent operations. |

The header badge always shows the access level in force:

| Badge | Meaning |
|---|---|
| `No login · Admin` | `auth.mode: none` with `auth.default_role: admin` |
| `alice · Operator` | signed in as `alice` with the readwrite role |
| `carol · Viewer` | signed in with readonly |

Hover it to see exactly where the role came from. Controls a role cannot use are
hidden or disabled, and every check is enforced again server-side.

## Browse: the DIT tree

Opens on the base DN and loads children on demand, so a large directory stays fast.
OUs and groups expand themselves; users are leaves.

```
Browse -> expand ou=People -> click uid=arjuna -> attributes panel on the right
```

The detail panel shows every attribute of the selected entry. **Password hashes are
never sent to the browser** - `userPassword` and friends are stripped server-side, and
the UI masks any that arrive by another path.

With write access, the trash icon deletes the selected entry.

## Creating and editing entries

**Create User** opens a sheet built from `user_creation_form` in `config.yml`, so the
form matches your directory instead of a fixed field list:

- `select` fields render as dropdowns (`kingdom`, `role`, `allegiance`, `weapon`)
- `checkbox` fields render as booleans, stored as `TRUE` / `FALSE` (`isWarrior`, `isAdmin`)
- `auto_generate` fills `${uid}@example.com`, `/home/${uid}`, `next_uid`, `days_since_epoch`
- `readonly: true` fields are computed and cannot be typed into

Per row: **Edit** (attributes), **Change password**, **Manage groups**, **Delete**.

Select rows with the checkboxes to reveal the bulk bar:

| Bulk action | Effect |
|---|---|
| Set | Sets one attribute to one value on every selected entry |
| Add to group | Adds every selected entry to a group (one role, many users) |
| Delete | Removes every selected entry |

Results report per-entry errors, so one bad DN does not fail the batch.

## LDIF editor

Two buttons, and the difference matters:

| Button | What it does |
|---|---|
| **Validate** | Parses and plans. **Writes nothing.** |
| **Apply** | Applies to the directory. |

Supports `add`, `modify` (with `add:` / `replace:` / `delete:` directives) and `delete`.
`modrdn` is rejected with a clear message.

```ldif
# add
dn: uid=jdoe,ou=People,dc=example,dc=com
changetype: add
objectClass: inetOrgPerson
uid: jdoe
cn: Jane Doe
sn: Doe

# modify
dn: uid=jdoe,ou=People,dc=example,dc=com
changetype: modify
replace: mail
mail: jdoe@example.com
-

# delete
dn: uid=jdoe,ou=People,dc=example,dc=com
changetype: delete
```

`template` loads a starting point. **Export** downloads the directory as LDIF (admin).
Applying reports `added` / `modified` / `deleted` counts plus any per-record errors.

### Sample LDIF

A committed seed dataset for the custom schema used in the examples above. Both files come
from the [openldap-usecases](https://github.com/VibhuviOiO/openldap-usecases) lab repo and
are fetched at build time.

## Project Files

```project
name: mahabharata-lab
MahabharataCharacter.ldif: https://raw.githubusercontent.com/VibhuviOiO/openldap-usecases/refs/heads/main/vibhuvioio-com-singlenode/custom-schema/MahabharataCharacter.ldif
mahabharata_data.ldif: https://raw.githubusercontent.com/VibhuviOiO/openldap-usecases/refs/heads/main/vibhuvioio-com-singlenode/sample/mahabharata_data.ldif
```

> **Note:** The schema record targets `cn=schema,cn=config`, so it needs an admin credential plus the cluster's `config:` credential. The data alone fails on `objectClass: MahabharataUser` until the schema is loaded.

## Schema editor

Reads `cn=schema,cn=config` and lists every schema with its object classes and attribute
types: name, OID, SUP, syntax and equality, with the raw RFC 4512 definition one click
away.

Filter by name or OID. Admins get **New definition** and a remove button per entry:

```
Kind:    Attribute type | Object class
Schema:  MahabharataCharacter
Define:  ( 1.3.6.1.4.1.99999.1.9 NAME 'myAttr' EQUALITY caseIgnoreMatch
           SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )
```

Definitions are validated before writing, and duplicates are refused. A bad definition is
rejected by the directory rather than corrupting it.

> Needs a `config:` credential on the cluster - the data bind DN usually cannot read
> `cn=config`. See [Configuration](/ldap-manager/configuration/).

## Access (ACI) editor

Shows every `cn=config` database with its `olcAccess` rules, numbered by evaluation
order - **first match wins**.

```
[0] to attrs=userPassword by dn="cn=Manager,dc=example,dc=com" write by * auth
[1] to dn.base="" by * read
[2] to * by dn="cn=Manager,dc=example,dc=com" write by * read
```

Admins can add a rule (appended, or inserted at a position) or remove one by index.

> `olcAccess` decides who can read and write your directory. A wrong rule can lock users -
> or you - out. The UI warns before applying; add rules rather than deleting the
> permissive ones until you have verified access.

## Monitoring and replication

Single-node clusters show health and per-node stats. Multi-node clusters add the
replication view:

- Animated `syncRepl` topology, one arrow per replication direction, labelled with its RID
- Collapsed by default - the **Diagram** toggle reveals it
- A per-node table: node, server ID, status, entries, users, groups, response, last change

## Activity Log

Who changed what, at the point of the change - actor, role, action, target and cluster,
grouped by day with live timestamps. Admin-only. Filter by user or by action prefix.

If the cluster lacks the server-side `accesslog` overlay, the tab shows the enablement LDIF
inline; if it cannot tell, it says so rather than reporting a problem that may not exist.
See [Audit & Change Logs](/ldap-manager/audit-logging/).

## What each role sees

| Screen or control | readonly | readwrite | admin |
|---|:--:|:--:|:--:|
| Browse, tree, search, export CSV | ✅ | ✅ | ✅ |
| Monitoring, topology, activity | ✅ | ✅ | ✅ |
| Schema and ACI **viewing** | ✅ | ✅ | ✅ |
| LDIF **Validate** | ✅ | ✅ | ✅ |
| Create / edit / delete entries | - | ✅ | ✅ |
| Bulk set / group add / bulk delete | - | ✅ | ✅ |
| LDIF **Apply** | - | ✅ | ✅ |
| Schema **add / remove** | - | - | ✅ |
| ACI **add / remove** | - | - | ✅ |
| Clusters, backups, local users | - | - | ✅ |

On a cluster marked `readonly: true`, even an admin sees no write controls - the cluster
flag wins.

## Next steps

- [Configuration](/ldap-manager/configuration/) - clusters, TLS, `cn=config`, forms
- [Security](/ldap-manager/security/) - auth modes and how roles are resolved
