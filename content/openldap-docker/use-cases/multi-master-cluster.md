---
title: Multi-Master Cluster
description: Deploy a 3-node multi-master OpenLDAP cluster with automatic replication, custom schema, and 30 employees using Docker Compose.
---

# Multi-Master Cluster

Deploy a 3-node multi-master OpenLDAP cluster with automatic replication. Write to any node, read from any node — changes propagate to the entire cluster automatically.

## Architecture

___MULTI_MASTER_ARCHITECTURE___

## Project Files

```project
name: openldap-multinode
docker-compose.yml: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/oiocloud-com-multinode/docker-compose.yml
.env.node1: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/oiocloud-com-multinode/.env.node1
.env.node2: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/oiocloud-com-multinode/.env.node2
.env.node3: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/oiocloud-com-multinode/.env.node3
custom-schema/oioCloudEmployee.ldif: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/oiocloud-com-multinode/custom-schema/oioCloudEmployee.ldif
sample/oiocloud_data.ldif: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/oiocloud-com-multinode/sample/oiocloud_data.ldif
init/init-data.sh: https://raw.githubusercontent.com/VibhuviOiO/openldap-docker/main/use-cases/oiocloud-com-multinode/init/init-data.sh
```

## Start the Cluster

```bash
# Create shared network
docker network create ldap-shared-network 2>/dev/null || true

# Start all 3 nodes
docker compose up -d

# Wait for initialization and replication sync
sleep 60
```

## Verify Replication

Data loads on node 1 and replicates to node 2 and node 3:

```bash
# Count employees on all 3 nodes (expect 30 each)
echo "=== Node 1 (port 392) ===" && \
ldapsearch -x -H ldap://localhost:392 \
  -b "dc=oiocloud,dc=com" \
  -D "cn=Manager,dc=oiocloud,dc=com" -w changeme \
  "(objectClass=oioCloudEmployee)" dn | grep -c "^dn:"

echo "=== Node 2 (port 393) ===" && \
ldapsearch -x -H ldap://localhost:393 \
  -b "dc=oiocloud,dc=com" \
  -D "cn=Manager,dc=oiocloud,dc=com" -w changeme \
  "(objectClass=oioCloudEmployee)" dn | grep -c "^dn:"

echo "=== Node 3 (port 394) ===" && \
ldapsearch -x -H ldap://localhost:394 \
  -b "dc=oiocloud,dc=com" \
  -D "cn=Manager,dc=oiocloud,dc=com" -w changeme \
  "(objectClass=oioCloudEmployee)" dn | grep -c "^dn:"
```

## Test Write Replication

Write on node 2, verify it appears on node 1 and node 3:

```bash
# Add a test employee on node 2
echo "dn: employeeID=TEST001,ou=People,dc=oiocloud,dc=com
objectClass: oioCloudEmployee
objectClass: posixAccount
employeeID: TEST001
uid: testuser
cn: Test User
sn: User
mail: test.user@oiocloud.com
department: Engineering
jobTitle: Test Engineer
location: Test City
telephoneNumber: +1-555-9999
uidNumber: 9001
gidNumber: 200
homeDirectory: /home/testuser
userPassword: test123" | docker exec -i openldap-oiocloud-node2 \
  ldapadd -x -D "cn=Manager,dc=oiocloud,dc=com" -w changeme

# Verify on node 1
ldapsearch -x -H ldap://localhost:392 \
  -D "cn=Manager,dc=oiocloud,dc=com" -w changeme \
  -b "dc=oiocloud,dc=com" "(employeeID=TEST001)" dn

# Verify on node 3
ldapsearch -x -H ldap://localhost:394 \
  -D "cn=Manager,dc=oiocloud,dc=com" -w changeme \
  -b "dc=oiocloud,dc=com" "(employeeID=TEST001)" dn
```

## Employee Data

30 employees across 3 cloud departments:

| Department | Count | Roles |
|------------|-------|-------|
| Cloud Infrastructure | 10 | VP, Architects, Engineers |
| Cloud Security | 10 | CISO, Security Engineers, Analysts |
| Cloud Operations | 10 | VP, Operations Engineers, Managers |

3 groups are created automatically: `CloudInfrastructure`, `CloudSecurity`, `CloudOperations`.

## Connection Details

| Node | LDAP Port | LDAPS Port | Container |
|------|-----------|------------|-----------|
| Node 1 | `392` | `639` | `openldap-oiocloud-node1` |
| Node 2 | `393` | `640` | `openldap-oiocloud-node2` |
| Node 3 | `394` | `641` | `openldap-oiocloud-node3` |

All nodes share:

| Setting | Value |
|---------|-------|
| Bind DN | `cn=Manager,dc=oiocloud,dc=com` |
| Base DN | `dc=oiocloud,dc=com` |
| Password | `changeme` |

## Environment Configuration

Each node has its own env file with unique settings:

| Variable | Node 1 | Node 2 | Node 3 |
|----------|--------|--------|--------|
| `SERVER_ID` | `1` | `2` | `3` |
| `REPLICATION_PEERS` | node2,node3 | node1,node3 | node1,node2 |
| `REPLICATION_RIDS` | `101,102` | `201,203` | `301,302` |

All other environment variables (domain, password, schemas) must be identical across all nodes.

## High Availability

This setup provides:

- **Read/write on all nodes** — any node can handle modifications
- **Automatic sync** — changes propagate to all nodes in near real-time
- **Fault tolerance** — the cluster continues operating if 1–2 nodes fail
- **Load balancing** — distribute read operations across nodes

## Monitoring

```bash
# Check replication status
docker exec openldap-oiocloud-node1 ldapsearch -Y EXTERNAL -H ldapi:/// \
  -b "cn=config" "(olcSyncRepl=*)" olcSyncRepl

# View logs per node
docker logs openldap-oiocloud-node1
docker logs openldap-oiocloud-node2
docker logs openldap-oiocloud-node3
```

## Cleanup

```bash
docker compose down -v
```
