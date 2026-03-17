---
title: Multi-Master Cluster
description: Deploy a 3-node multi-master OpenLDAP cluster with Docker Compose — bidirectional replication, failover, and production hardening.
---

# Multi-Master Cluster Deployment

Deploy a 3-node multi-master OpenLDAP cluster where every node is read-write. Changes on any node automatically replicate to all others via syncRepl.

___MULTI_MASTER_ARCHITECTURE___

## When to Use Multi-Master

- Production environments requiring high availability
- Geographically distributed teams needing local LDAP access
- Zero-downtime maintenance — rolling upgrades one node at a time
- Organizations where LDAP downtime blocks all authentication

For simpler setups, see [Single Node Deployment](/openldap-docker/deployment/single-node).

## Docker Compose

Create `docker-compose.yml`:

```yaml
services:
  openldap-node1:
    image: ghcr.io/vibhuvioio/openldap:latest
    container_name: openldap-node1
    restart: unless-stopped
    ports:
      - "392:389"
    env_file:
      - .env.node1
    volumes:
      - node1-data:/var/lib/ldap
      - node1-config:/etc/openldap/slapd.d
    healthcheck:
      test: ["CMD", "ldapsearch", "-x", "-H", "ldap://localhost:389", "-b", "", "-s", "base"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 45s
    networks:
      - ldap-cluster

  openldap-node2:
    image: ghcr.io/vibhuvioio/openldap:latest
    container_name: openldap-node2
    restart: unless-stopped
    ports:
      - "393:389"
    env_file:
      - .env.node2
    volumes:
      - node2-data:/var/lib/ldap
      - node2-config:/etc/openldap/slapd.d
    healthcheck:
      test: ["CMD", "ldapsearch", "-x", "-H", "ldap://localhost:389", "-b", "", "-s", "base"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 45s
    networks:
      - ldap-cluster

  openldap-node3:
    image: ghcr.io/vibhuvioio/openldap:latest
    container_name: openldap-node3
    restart: unless-stopped
    ports:
      - "394:389"
    env_file:
      - .env.node3
    volumes:
      - node3-data:/var/lib/ldap
      - node3-config:/etc/openldap/slapd.d
    healthcheck:
      test: ["CMD", "ldapsearch", "-x", "-H", "ldap://localhost:389", "-b", "", "-s", "base"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 45s
    networks:
      - ldap-cluster

networks:
  ldap-cluster:
    driver: bridge

volumes:
  node1-data:
  node1-config:
  node2-data:
  node2-config:
  node3-data:
  node3-config:
```

## Environment Files

Create `.env.node1`:

```bash
LDAP_DOMAIN=company.com
LDAP_ORGANIZATION=Company Inc
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
LDAP_DOMAIN=company.com
LDAP_ORGANIZATION=Company Inc
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
LDAP_DOMAIN=company.com
LDAP_ORGANIZATION=Company Inc
LDAP_ADMIN_PASSWORD=changeme
LDAP_CONFIG_PASSWORD=changeme
INCLUDE_SCHEMAS=cosine,inetorgperson,nis
ENABLE_REPLICATION=true
SERVER_ID=3
REPLICATION_PEERS=openldap-node1,openldap-node2
ENABLE_MONITORING=true
```

> **Warning:** All nodes **must** use the same `LDAP_DOMAIN` and `LDAP_ADMIN_PASSWORD`. Mismatched credentials will cause replication failures.

## Start the Cluster

```bash
docker compose up -d
```

Wait 60 seconds for all nodes to initialize and establish replication.

## Verify Cluster Health

### Check all nodes are running

```bash
docker compose ps
```

All three containers should show `healthy` status.

### Verify replication is configured

```bash
docker exec openldap-node1 ldapsearch -Y EXTERNAL -H ldapi:/// \
  -b "cn=config" "(olcSyncRepl=*)" olcSyncRepl
```

### Test write replication

Write to node 1, read from node 2 and node 3:

```bash
# Write on node 1
docker exec -i openldap-node1 ldapadd \
  -x -D "cn=Manager,dc=company,dc=com" -w changeme <<'EOF'
dn: uid=deploy-test,ou=People,dc=company,dc=com
objectClass: inetOrgPerson
uid: deploy-test
cn: Deploy Test
sn: Test
EOF

# Read from node 2
docker exec openldap-node2 ldapsearch \
  -x -D "cn=Manager,dc=company,dc=com" -w changeme \
  -b "ou=People,dc=company,dc=com" "(uid=deploy-test)" dn

# Read from node 3
docker exec openldap-node3 ldapsearch \
  -x -D "cn=Manager,dc=company,dc=com" -w changeme \
  -b "ou=People,dc=company,dc=com" "(uid=deploy-test)" dn

# Clean up test entry
docker exec openldap-node1 ldapdelete \
  -x -D "cn=Manager,dc=company,dc=com" -w changeme \
  "uid=deploy-test,ou=People,dc=company,dc=com"
```

## Load Balancing

Place a load balancer in front of the cluster so applications connect to a single endpoint.

### With HAProxy

```yaml
services:
  haproxy:
    image: haproxy:lts-alpine
    container_name: ldap-haproxy
    ports:
      - "389:389"
    volumes:
      - ./haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro
    networks:
      - ldap-cluster
    depends_on:
      - openldap-node1
      - openldap-node2
      - openldap-node3
```

Create `haproxy.cfg`:

```
global
    log stdout format raw local0

defaults
    mode tcp
    timeout connect 5s
    timeout client 30s
    timeout server 30s

frontend ldap_frontend
    bind *:389
    default_backend ldap_nodes

backend ldap_nodes
    balance roundrobin
    option ldap-check
    server node1 openldap-node1:389 check inter 10s fall 3 rise 2
    server node2 openldap-node2:389 check inter 10s fall 3 rise 2
    server node3 openldap-node3:389 check inter 10s fall 3 rise 2
```

Applications connect to `haproxy:389`. HAProxy distributes requests across all healthy nodes and automatically removes failed nodes from rotation.

## Failover Behavior

| Scenario | Impact | Recovery |
|----------|--------|----------|
| One node down | Other 2 nodes continue serving. No data loss. | Bring node back up — it re-syncs automatically. |
| Two nodes down | Remaining node serves all traffic. | Bring nodes back — they catch up via syncRepl. |
| All nodes down | Service outage. | Start any node — data persists in volumes. |
| Network partition | Nodes diverge temporarily. | When connectivity restores, syncRepl resolves conflicts. |

## Backup Strategy

Back up one node's data — since all nodes are synchronized, one backup covers the cluster:

```bash
# Backup node 1
docker compose pause openldap-node1

docker run --rm -v node1-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/cluster-data-$(date +%Y%m%d).tar.gz -C /data .

docker run --rm -v node1-config:/data -v $(pwd):/backup alpine \
  tar czf /backup/cluster-config-$(date +%Y%m%d).tar.gz -C /data .

docker compose unpause openldap-node1
```

## Rolling Upgrades

Upgrade one node at a time with zero downtime:

```bash
# Upgrade node 1
docker compose pull openldap-node1
docker compose up -d openldap-node1

# Wait for node 1 to be healthy
until docker inspect --format='{{.State.Health.Status}}' openldap-node1 | grep -q healthy; do
  sleep 5
done

# Repeat for node 2 and node 3
docker compose pull openldap-node2
docker compose up -d openldap-node2
# ... wait ...

docker compose pull openldap-node3
docker compose up -d openldap-node3
```

## Key Requirements

- **Unique `SERVER_ID`** — each node must have a different ID (1–4095)
- **Same domain** — all nodes must use identical `LDAP_DOMAIN`
- **Same password** — all nodes must use identical `LDAP_ADMIN_PASSWORD`
- **Network reachable** — nodes must resolve each other by container name
- **DNS or service discovery** — in multi-host deployments, ensure peers can reach each other

## Next Steps

- [Kubernetes](/openldap-docker/deployment/kubernetes) — deploy the cluster on Kubernetes
- [Security](/openldap-docker/security) — harden ACLs and enable TLS across nodes
- [Monitoring](/openldap-docker/monitoring) — track replication lag and node health
- [Monitoring](/openldap-docker/monitoring) — track replication lag and node health
