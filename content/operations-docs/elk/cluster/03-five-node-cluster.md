---
title: Five Node Cluster — Docker, Podman & Swarm
description: Deploy a five-node Elasticsearch cluster using Docker Compose, Podman, Docker Swarm, and across remote machines with failure simulation.
duration: "1h 15m"
readingTime: "30m"
labTime: "45m"
github: "https://github.com/JinnaBalu/infinite-containers/tree/main/elastic-stack/five-node-elasticsearch"
order: 3
---

## Project Structure

```tree
five-node-cluster/
├── docker-compose.yml
└── .env
```

## Node Role Strategy

| Node | Roles | Purpose |
|------|-------|---------|
| es-node-1 | `master`, `data` | Master-eligible + data |
| es-node-2 | `master`, `data` | Master-eligible + data |
| es-node-3 | `master`, `data` | Master-eligible + data |
| es-node-4 | `data` | Dedicated data node |
| es-node-5 | `data` | Dedicated data node |

**Why 3 master-eligible?** The quorum formula is `(N/2) + 1`. With 3 master-eligible nodes, quorum = 2. You can lose 1 master node and the cluster keeps running.

## Option 1: Docker Compose — Single Machine

All 5 nodes on one server. Great for development and testing.

### Download and Run

```bash
mkdir ~/es-five-node && cd ~/es-five-node

wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/five-node-elasticsearch/docker-compose.yml
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/five-node-elasticsearch/.env

docker compose up -d
```

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Single Server                              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │  ES-1  │ │  ES-2  │ │  ES-3  │ │  ES-4  │ │  ES-5  │       │
│  │ Master │ │ Master │ │ Master │ │  Data  │ │  Data  │       │
│  │ + Data │ │ + Data │ │ + Data │ │  Only  │ │  Only  │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
│  Port:9200  Port:9201  Port:9202  Port:9203  Port:9204        │
│                                                                  │
│  ┌──────────────────┐                                            │
│  │     Kibana       │                                            │
│  │   Port: 5601     │                                            │
│  └──────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Resource Requirements

| Setup | Min RAM | Min CPUs | Min Disk |
|-------|---------|----------|----------|
| 3-node | 6GB | 2 | 20GB |
| 5-node | 10GB | 4 | 50GB |
| 5-node + Kibana | 12GB | 4 | 50GB |

## Option 2: Docker Compose with TLS — Single Machine

Production-grade setup with TLS certificates and security enabled.

```bash
mkdir ~/es-five-tls && cd ~/es-five-tls

wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/five-node-elasticsearch/one-server-five-containers/docker-compose.yml
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/five-node-elasticsearch/one-server-five-containers/.env
```

Edit `.env` with your passwords:

```bash
ELASTIC_PASSWORD=your_elastic_password
KIBANA_PASSWORD=your_kibana_password
STACK_VERSION=8.12.0
ES_PORT=9200
KIBANA_PORT=5601
MEM_LIMIT=1073741824
```

This compose file includes:

- **Setup service**: Generates CA and node certificates automatically
- **3 Elasticsearch nodes**: Full TLS on transport and HTTP layers
- **Kibana**: Connected over HTTPS with certificate verification
- **Health checks**: All services verify readiness before dependents start

```bash
docker compose up -d

# Wait for setup to complete, then verify
curl -k -u elastic:your_elastic_password https://localhost:9200/_cat/nodes?v
```

## Option 3: Podman Compose

Podman is a daemonless, rootless container engine — the default on RHEL, CentOS, and Fedora.

### Install Podman Compose

```bash
# RHEL/CentOS/Fedora
sudo dnf install podman podman-compose

# Ubuntu/Debian
sudo apt install podman
pip3 install podman-compose
```

### Run with Podman

Podman Compose uses the same `docker-compose.yml` format:

```bash
cd ~/es-five-node

# Replace 'docker compose' with 'podman-compose'
podman-compose up -d
```

### Podman-Specific Settings

```bash
# Set vm.max_map_count (required even for rootless)
sudo sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
```

Add to `~/.config/containers/containers.conf`:

```ini
[containers]
default_ulimits = [
  "memlock=-1:-1",
  "nofile=65535:65535"
]
```

### Systemd Integration

Run Elasticsearch as a systemd service with Podman:

```bash
# Generate systemd unit files from running containers
podman generate systemd --new --name es-node-1 > ~/.config/systemd/user/es-node-1.service

# Enable auto-start
systemctl --user enable es-node-1.service
systemctl --user start es-node-1.service

# Check status
systemctl --user status es-node-1.service
```

### Podman Pod (Alternative)

Group all containers in a single pod:

```bash
# Create a pod
podman pod create --name es-cluster \
  -p 9200:9200 -p 5601:5601

# Run containers in the pod
podman run -d --pod es-cluster \
  --name es-node-1 \
  -e node.name=es-node-1 \
  -e cluster.name=podman-cluster \
  -e "discovery.seed_hosts=localhost" \
  -e "cluster.initial_master_nodes=es-node-1,es-node-2,es-node-3" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  -e xpack.security.enabled=false \
  elasticsearch:8.12.0
```

## Option 4: Docker Swarm

For orchestrated deployments with built-in load balancing and service discovery.

### Initialize Swarm

```bash
docker swarm init --advertise-addr <MANAGER_IP>

# Join worker nodes
docker swarm join --token <WORKER_TOKEN> <MANAGER_IP>:2377
```

### Download and Deploy Stack

```bash
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/five-node-elasticsearch/stack.yml

docker stack deploy -c stack.yml elasticsearch
```

The Swarm stack provides:

- **Resource limits**: Memory and CPU reservations per container
- **Placement constraints**: Pin services to specific node roles
- **Update config**: Rolling updates with configurable parallelism and delay
- **Restart policies**: Automatic recovery on failure

### Swarm Management

```bash
# Check service status
docker service ls
docker service ps elasticsearch_elasticsearch

# Scale the data tier
docker service scale elasticsearch_elasticsearch=5

# View logs
docker service logs -f elasticsearch_elasticsearch

# Rolling update to new version
docker service update --image elasticsearch:8.13.0 elasticsearch_elasticsearch
```

## Option 5: Remote 5-Machine Deployment

Each Elasticsearch node runs on its own server. This is the production topology.

### Architecture

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Server 1 │  │ Server 2 │  │ Server 3 │  │ Server 4 │  │ Server 5 │
│192.168.1 │  │192.168.1 │  │192.168.1 │  │192.168.1 │  │192.168.1 │
│   .11    │  │   .12    │  │   .13    │  │   .14    │  │   .15    │
│ Master+  │  │ Master+  │  │ Master+  │  │  Data    │  │  Data    │
│  Data    │  │  Data    │  │  Data    │  │  Only    │  │  Only    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Master Node Configuration (Servers 1-3)

Create `elasticsearch.yml` on each master-eligible server:

```yaml
cluster.name: production-cluster
node.name: es-node-1          # Change per server
node.roles: [master, data]

network.host: 0.0.0.0
network.publish_host: 192.168.1.11   # Change per server
http.port: 9200
transport.port: 9300

discovery.seed_hosts:
  - 192.168.1.11:9300
  - 192.168.1.12:9300
  - 192.168.1.13:9300
  - 192.168.1.14:9300
  - 192.168.1.15:9300

cluster.initial_master_nodes:
  - es-node-1
  - es-node-2
  - es-node-3

bootstrap.memory_lock: true

http.cors.enabled: true
http.cors.allow-origin: "*"
```

### Data-Only Node Configuration (Servers 4-5)

```yaml
cluster.name: production-cluster
node.name: es-node-4          # Change per server
node.roles: [data]

network.host: 0.0.0.0
network.publish_host: 192.168.1.14   # Change per server
http.port: 9200
transport.port: 9300

discovery.seed_hosts:
  - 192.168.1.11:9300
  - 192.168.1.12:9300
  - 192.168.1.13:9300
  - 192.168.1.14:9300
  - 192.168.1.15:9300

bootstrap.memory_lock: true
```

**Note:** Data-only nodes don't need `cluster.initial_master_nodes`.

### Docker Compose per Server

Each server runs a single-node compose file:

```yaml
version: "3.8"
services:
  elasticsearch:
    image: elasticsearch:8.12.0
    container_name: es-node
    volumes:
      - ./elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro
      - es-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
      - "9300:9300"
    environment:
      - "ES_JAVA_OPTS=-Xms4g -Xmx4g"
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile:
        soft: 65535
        hard: 65535
    networks:
      - elastic

volumes:
  es-data:

networks:
  elastic:
    driver: bridge
```

### Deploy to All Servers

```bash
# Copy configs to each server
for i in 1 2 3 4 5; do
  scp elasticsearch-node-$i.yml server-$i:~/elasticsearch/elasticsearch.yml
  scp docker-compose.yml server-$i:~/elasticsearch/docker-compose.yml
  ssh server-$i "cd ~/elasticsearch && docker compose up -d"
done
```

### Verify Cluster Formation

```bash
curl -s "http://192.168.1.11:9200/_cat/nodes?v&h=name,ip,node.role,master"
```

Expected:

```
name       ip            node.role master
es-node-1  192.168.1.11  dm        *
es-node-2  192.168.1.12  dm        -
es-node-3  192.168.1.13  dm        -
es-node-4  192.168.1.14  d         -
es-node-5  192.168.1.15  d         -
```

## Cluster Failure Simulation

Test your cluster's resilience by simulating node failures.

### Scenario 1: Stop One Data Node

```bash
# Stop es-node-5 (data-only)
docker stop es-node-5

# Cluster health → YELLOW (replicas unassigned)
curl -s "http://localhost:9200/_cluster/health?pretty"

# Bring it back
docker start es-node-5
# Health returns to GREEN as replicas reallocate
```

### Scenario 2: Stop One Master Node

```bash
# Stop es-node-2 (master-eligible)
docker stop es-node-2

# Cluster remains GREEN — new master elected
curl -s "http://localhost:9200/_cat/master?v"
```

### Scenario 3: Lose Quorum (2 Master Nodes Down)

```bash
# Stop es-node-2 AND es-node-3
# Only 1 master-eligible node left — below quorum (2)
# Cluster goes RED — no master can be elected

# Recovery: restart at least one master node
docker start es-node-2
# Master elected, cluster recovers
```

### Failure Impact Summary

| Failure | Status | Recovery |
|---------|--------|----------|
| 1 data node down | Yellow | Auto-recovers when node returns |
| 1 master node down | Green | New master elected immediately |
| 2 master nodes down | Red | Restart 1+ master node |
| All nodes down | Offline | Start all, wait for gateway recovery |

## Deployment Comparison

| Feature | Docker Compose | Podman | Swarm | Remote |
|---------|---------------|--------|-------|--------|
| Setup complexity | Low | Low | Medium | High |
| Production-ready | Dev/Test | Yes | Yes | Yes |
| Auto-restart | Restart policy | Systemd | Built-in | Systemd |
| Load balancing | Manual | Manual | Built-in | External LB |
| Scaling | Edit compose | Edit compose | `service scale` | Add machines |
| Resource isolation | Shared server | Rootless | Per-node limits | Full isolation |

## Lab: Deploy and Test

1. Choose a deployment method (Docker Compose for learning, Remote for production)
2. Deploy a 5-node cluster
3. Verify all 5 nodes joined with `_cat/nodes`
4. Check cluster health — should be green
5. Create an index with 5 shards and 1 replica
6. Stop one data node and observe health change to yellow
7. Stop one master node and verify automatic election
8. Restart nodes and watch recovery

## Next Steps

- [Index Design](/learn/elk/index-management/01-index-design) — design indices for your cluster
- [TLS Setup](/learn/elk/security/01-tls-setup) — secure your multi-node cluster
