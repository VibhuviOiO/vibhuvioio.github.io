---
title: Overlays
description: Enable memberOf, password policy, audit logging, and referential integrity overlays in OpenLDAP Docker.
---

# Overlays

OpenLDAP Docker supports several overlays that extend directory functionality. Enable them with environment variables — no LDIF editing required.

## memberOf Overlay

Automatically maintains `memberOf` attributes on user entries when they are added to groups.

```bash
ENABLE_MEMBEROF=true
```

When enabled, adding a user to a group automatically sets `memberOf` on the user entry:

```bash
# Add user to a group
docker exec -i openldap ldapmodify \
  -x -D "cn=Manager,dc=example,dc=com" -w changeme <<EOF
dn: cn=developers,ou=Group,dc=example,dc=com
changetype: modify
add: member
member: uid=jsmith,ou=People,dc=example,dc=com
EOF

# Verify memberOf on the user
docker exec openldap ldapsearch \
  -x -D "cn=Manager,dc=example,dc=com" -w changeme \
  -b "uid=jsmith,ou=People,dc=example,dc=com" memberOf
```

## Password Policy Overlay

Enforces password rules and account lockout.

```bash
ENABLE_PASSWORD_POLICY=true
```

Default policy:

- Minimum password length: 8 characters
- Password history: 5 (prevents reuse of last 5 passwords)
- Account lockout: after 5 consecutive failures
- Lockout duration: 300 seconds (5 minutes)

## Audit Log Overlay

Records all LDAP modifications to a log file for compliance and debugging.

```bash
ENABLE_AUDIT_LOG=true
```

Audit logs are written to `/logs/audit.log`. Mount the `/logs` volume to access them:

```yaml
volumes:
  - ./logs:/logs
```

View the audit trail:

```bash
tail -f logs/audit.log
```

The audit log records every ADD, MODIFY, DELETE, and MODRDN operation with the full LDIF of the change.

## Combining Overlays

You can enable all overlays simultaneously:

```yaml
environment:
  - ENABLE_MEMBEROF=true
  - ENABLE_PASSWORD_POLICY=true
  - ENABLE_AUDIT_LOG=true
```

## Custom Schemas

Place custom `.ldif` schema files in the `/custom-schema` directory. They are auto-loaded on startup:

```yaml
volumes:
  - ./custom-schema:/custom-schema:ro
```

Example custom schema file (`custom-schema/employee.ldif`):

```yaml
dn: cn=employee,cn=schema,cn=config
objectClass: olcSchemaConfig
cn: employee
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.1
  NAME 'employeeID'
  DESC 'Employee ID'
  EQUALITY caseIgnoreMatch
  SUBSTR caseIgnoreSubstringsMatch
  SYNTAX 1.3.6.1.4.1.1466.115.121.1.15{64}
  SINGLE-VALUE )
olcObjectClasses: ( 1.3.6.1.4.1.99999.2.1
  NAME 'employee'
  DESC 'Employee entry'
  SUP inetOrgPerson
  STRUCTURAL
  MAY ( employeeID ) )
```
