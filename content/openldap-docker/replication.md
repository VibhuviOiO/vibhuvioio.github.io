---
title: Multi-Master Replication
description: Set up a 3-node multi-master OpenLDAP cluster with automatic replication using Docker Compose.
---

# Multi-Master Replication

Deploy a high-availability OpenLDAP cluster with 3 nodes using mirror mode replication. Changes on any node automatically replicate to all others.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Node 1     │────▶│   Node 2     │────▶│   Node 3     │
│  Server ID:1 │◀────│  Server ID:2 │◀────│  Server ID:3 │
│  Port: 389   │     │  Port: 390   │     │  Port: 391   │
└──────────────┘     └──────────────┘     └──────────────┘
      ▲                    ▲                    ▲
      └────────────────────┴────────────────────┘
         Bidirectional Replication (Mirror Mode)
```

## Docker Compose Setup

Download the 3-node replication compose file:

```bash
wget https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/main/openldap/docker-compose-replication.yml -O docker-compose.yml
```

## Environment Files

Create `.env.node1`:

```bash
LDAP_DOMAIN=example.com
LDAP_ORGANIZATION=Example
LDAP_ADMIN_PASSWORD=changeme
LDAP_CONFIG_PASSWORD=changeme
INCLUDE_SCHEMAS=cosine,inetorgperson,nis
ENABLE_REPLICATION=true
SERVER_ID=1
REPLICATION_PEERS=openldap-node2,openldap-node3
ENABLE_MONITORING=true
```

Create `.env.node2`:

```bash
LDAP_DOMAIN=example.com
LDAP_ORGANIZATION=Example
LDAP_ADMIN_PASSWORD=changeme
LDAP_CONFIG_PASSWORD=changeme
INCLUDE_SCHEMAS=cosine,inetorgperson,nis
ENABLE_REPLICATION=true
SERVER_ID=2
REPLICATION_PEERS=openldap-node1,openldap-node3
ENABLE_MONITORING=true
```

Create `.env.node3`:

```bash
LDAP_DOMAIN=example.com
LDAP_ORGANIZATION=Example
LDAP_ADMIN_PASSWORD=changeme
LDAP_CONFIG_PASSWORD=changeme
INCLUDE_SCHEMAS=cosine,inetorgperson,nis
ENABLE_REPLICATION=true
SERVER_ID=3
REPLICATION_PEERS=openldap-node1,openldap-node2
ENABLE_MONITORING=true
```

## Start the Cluster

```bash
docker compose up -d
```

Wait 60 seconds for initialization and replication sync.

## Verify Replication

Add a test user on Node 1:

```bash
docker exec -i openldap-node1 ldapadd \
  -x -D "cn=Manager,dc=example,dc=com" -w changeme <<EOF
dn: uid=testuser,ou=People,dc=example,dc=com
objectClass: inetOrgPerson
uid: testuser
cn: Test User
sn: User
mail: testuser@example.com
userPassword: password
EOF
```

Verify it appears on Node 2:

```bash
docker exec openldap-node2 ldapsearch \
  -x -D "cn=Manager,dc=example,dc=com" -w changeme \
  -b "ou=People,dc=example,dc=com" "(uid=testuser)"
```

And on Node 3:

```bash
docker exec openldap-node3 ldapsearch \
  -x -D "cn=Manager,dc=example,dc=com" -w changeme \
  -b "ou=People,dc=example,dc=com" "(uid=testuser)"
```

## Check Replication Status

```bash
docker exec openldap-node1 ldapsearch -Y EXTERNAL -H ldapi:/// \
  -b "cn=config" "(olcSyncRepl=*)" olcSyncRepl
```

## Key Points

- **All nodes are read-write** — changes on any node replicate to all others
- **Same admin password** — all nodes must use the same `LDAP_ADMIN_PASSWORD`
- **Same domain** — all nodes must use the same `LDAP_DOMAIN`
- **Unique SERVER_ID** — each node needs a unique ID (1–4095)
- **Automatic failover** — if one node goes down, others continue serving
- **Eventual consistency** — replication is near-instant but asynchronous
