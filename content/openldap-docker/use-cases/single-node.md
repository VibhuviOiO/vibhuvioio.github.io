---
title: Single Node Deployment
description: Deploy a single-node OpenLDAP server with custom schemas, employee data, and persistent volumes using the OpenLDAP Docker image.
---

# Single Node Deployment

Deploy a production-ready OpenLDAP server with custom schemas and auto-loaded sample data. Two reference deployments are provided — choose the one that fits your needs.

## Vibhuvi Corporation — Global Employee Directory

A corporate LDAP directory with 28 employees from 25+ countries across 8 departments, using a custom `vibhuviEmployee` objectClass.

### Project Files

```project
name: openldap-vibhuvi
docker-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/vibhuvi-com-singlenode/docker-compose.yml
.env.vibhuvi: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/vibhuvi-com-singlenode/.env.vibhuvi
custom-schema/vibhuviEmployee.ldif: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/vibhuvi-com-singlenode/custom-schema/vibhuviEmployee.ldif
sample/employee_data_global.ldif: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/vibhuvi-com-singlenode/sample/employee_data_global.ldif
init/init-data.sh: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/vibhuvi-com-singlenode/init/init-data.sh
```

### Start

```bash
# Create the shared network (if not already created)
docker network create ldap-shared-network 2>/dev/null || true

docker compose up -d

# Wait for initialization and data loading
sleep 50
```

### Verify

```bash
# Count employees (expect 28)
docker exec openldap-vibhuvi ldapsearch -x -H ldap://localhost:389 \
  -b "ou=People,dc=vibhuvi,dc=com" \
  -D "cn=Manager,dc=vibhuvi,dc=com" -w changeme \
  "(objectClass=vibhuviEmployee)" dn | grep -c "^dn:"

# Search by department
docker exec openldap-vibhuvi ldapsearch -x -H ldap://localhost:389 \
  -b "ou=People,dc=vibhuvi,dc=com" \
  -D "cn=Manager,dc=vibhuvi,dc=com" -w changeme \
  "(department=Engineering)" uid cn department

# Search by employee ID
docker exec openldap-vibhuvi ldapsearch -x -H ldap://localhost:389 \
  -b "ou=People,dc=vibhuvi,dc=com" \
  -D "cn=Manager,dc=vibhuvi,dc=com" -w changeme \
  "(employeeID=E001)" uid cn
```

### Employee Data Summary

| Department | Count | Example Locations |
|------------|-------|-------------------|
| Engineering | 5 | Japan, Spain, India |
| Sales | 5 | USA, UAE, Sweden |
| Marketing | 3 | UK, Mexico, Nigeria |
| HR | 3 | South Korea, Ireland, India |
| Finance | 3 | Germany, Australia, Egypt |
| IT Operations | 3 | Russia, Portugal, Ghana |
| Product Management | 3 | USA, Singapore, Argentina |
| Customer Success | 3 | Pakistan, Denmark, Nigeria |

### Custom Schema Attributes

The `vibhuviEmployee` objectClass extends `inetOrgPerson` with:

| Attribute | Description |
|-----------|-------------|
| `employeeID` | Unique employee identifier |
| `department` | Department name |
| `jobTitle` | Job title |
| `hireDate` | Date of hire |
| `salary` | Salary (string) |
| `manager` | DN of the employee's manager |

### Connection Details

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| LDAP Port | `390` |
| LDAPS Port | `637` |
| Bind DN | `cn=Manager,dc=vibhuvi,dc=com` |
| Base DN | `dc=vibhuvi,dc=com` |
| Password | `changeme` |

---

## VibhuviOiO — Mahabharata Character Directory

A themed LDAP directory with 20 characters and 5 groups from the Mahabharata, using a custom `MahabharataUser` objectClass.

### Project Files

```project
name: openldap-vibhuvioio
docker-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/vibhuvioio-com-singlenode/docker-compose.yml
.env.vibhuvioio: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/vibhuvioio-com-singlenode/.env.vibhuvioio
custom-schema/MahabharataCharacter.ldif: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/vibhuvioio-com-singlenode/custom-schema/MahabharataCharacter.ldif
sample/mahabharata_data.ldif: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/vibhuvioio-com-singlenode/sample/mahabharata_data.ldif
init/init-data.sh: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/vibhuvioio-com-singlenode/init/init-data.sh
```

### Start

```bash
docker compose up -d
sleep 45
```

### Verify

```bash
# Count users (expect 20)
docker exec openldap-vibhuvioio ldapsearch -x -H ldap://localhost:389 \
  -b "ou=People,dc=vibhuvioio,dc=com" \
  -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  "(objectClass=inetOrgPerson)" dn | grep -c "^dn:"

# List all groups
docker exec openldap-vibhuvioio ldapsearch -x -H ldap://localhost:389 \
  -b "ou=Groups,dc=vibhuvioio,dc=com" \
  -D "cn=Manager,dc=vibhuvioio,dc=com" -w changeme \
  "(objectClass=groupOfNames)" cn
```

### Data Summary

**20 Users** across 6 roles:

| Role | Characters |
|------|------------|
| Pandavas (5) | arjuna, bhima, yudhishthira, nakula, sahadeva |
| Kauravas (3) | duryodhana, dushasana, karna |
| Advisors/Elders (3) | krishna, bhishma, drona |
| Warriors (3) | abhimanyu, ashwatthama, kripacharya |
| Royalty (3) | draupadi, kunti, gandhari |
| Leaders (3) | vidura, shakuni, dhritarashtra |

**5 Groups**: Pandavas, Kauravas, Warriors, Administrators, Advisors

### Custom Schema Attributes

The `MahabharataUser` objectClass adds:

| Attribute | Description |
|-----------|-------------|
| `kingdom` | Character's kingdom |
| `weapon` | Signature weapon |
| `role` | Role in the story |
| `allegiance` | Faction allegiance |
| `isWarrior` | Boolean — is a warrior |
| `isAdmin` | Boolean — is an administrator |

### Connection Details

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| LDAP Port | `389` |
| LDAPS Port | `636` |
| Bind DN | `cn=Manager,dc=vibhuvioio,dc=com` |
| Base DN | `dc=vibhuvioio,dc=com` |
| Password | `changeme` |

---

## Data Persistence

Both deployments use Docker volumes for persistent data:

- Data survives `docker compose down` (without `-v`)
- Init scripts check for existing data and skip reloading
- Only deleted with `docker compose down -v`

## Cleanup

```bash
# Stop but keep data
docker compose down

# Stop and remove all data
docker compose down -v
```
