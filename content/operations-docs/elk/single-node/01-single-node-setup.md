---
title: Single Node Elasticsearch Setup
description: Deploy a single-node Elasticsearch cluster with Docker Compose for development
duration: "30m"
readingTime: "10m"
labTime: "20m"
github: "https://github.com/VibhuviOiO/infinite-containers/tree/main/elastic-stack/single-node-elasticsearch"
order: 1
---

## Project Structure

```tree
elasticsearch-single/
├── docker-compose.yml
└── .env
```

## Download Configuration Files

```bash
# Create project directory
mkdir ~/elasticsearch-single && cd ~/elasticsearch-single

# Download docker-compose.yml
wget https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/elastic-stack/single-node-elasticsearch/docker-compose.yml

# Download environment variables
wget https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/elastic-stack/single-node-elasticsearch/.env
```


```fetch:bash
https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/elastic-stack/single-node-elasticsearch/docker-compose.yml
```

## Environment Variables

The `.env` file contains:

```fetch:bash
https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/refs/heads/main/elastic-stack/single-node-elasticsearch/.env
```

Modify `MEM_LIMIT` based on your available RAM.

## Start Elasticsearch

```bash
# Start the container
docker compose up -d

# Check logs
docker logs -f elasticsearch

# Wait for healthy status
docker ps
```

## Verify Installation

```bash
# Check cluster health
curl -X GET "localhost:9200/_cluster/health?pretty"

# Expected output:
# {
#   "cluster_name" : "elasticsearch",
#   "status" : "green",
#   "number_of_nodes" : 1,
#   ...
# }
```

## Common Issues

### max_map_count Error

```bash
# On Linux
sudo sysctl -w vm.max_map_count=262144

# On macOS
docker-machine ssh
sudo sysctl -w vm.max_map_count=262144
```

### Memory Lock Warning

The configuration uses `bootstrap.memory_lock=true` for performance. Ensure `MEM_LIMIT` is set appropriately.

## Next Steps

- [Add Kibana for visualization](./02-kibana-setup)
- [Learn CRUD operations](../crud/01-index-operations)
