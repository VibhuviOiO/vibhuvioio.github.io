---
title: Remote Reindexing
description: Migrate data between Elasticsearch clusters using remote reindexing
duration: "25m"
readingTime: "10m"
labTime: "15m"
github: "https://github.com/JinnaBalu/infinite-containers/tree/main/elastic-stack/elasticsearch-remote-reindexing"
order: 2
---

# Remote Reindexing

Migrate data from one Elasticsearch cluster to another without downtime.

## Time Estimate
- **Reading**: 10 minutes
- **Lab**: 15 minutes

## GitHub Reference
- **Repository**: [infinite-containers/elastic-stack/elasticsearch-remote-reindexing](https://github.com/JinnaBalu/infinite-containers/tree/main/elastic-stack/elasticsearch-remote-reindexing)
- **Files**:
  - `elasticsearch-one.yml` - Source cluster configuration (ES 7.x)
  - `elasticsearch-two.yml` - Destination cluster configuration (ES 8.x)
  - `.env` - Environment variables
  - `start-remote-reindexing.sh` - Helper script

## Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│   Source Cluster    │         │  Destination Cluster│
│  (Old ES Version)   │────────▶│  (New ES Version)   │
│   localhost:9200    │         │   localhost:9201    │
└─────────────────────┘         └─────────────────────┘
```

## Download Configuration

```bash
mkdir ~/remote-reindex && cd ~/remote-reindex

# Download source cluster (ES 7.x)
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/elasticsearch-remote-reindexing/elasticsearch-one.yml -O docker-compose-source.yml

# Download destination cluster (ES 8.x)
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/elasticsearch-remote-reindexing/elasticsearch-two.yml -O docker-compose-dest.yml

# Download environment file
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/elasticsearch-remote-reindexing/.env
```

## Start Both Clusters

```bash
# Start source cluster (port 9200)
docker compose -f docker-compose-source.yml up -d

# Start destination cluster (port 9201)
docker compose -f docker-compose-dest.yml up -d
```

## Configure Remote Access

Add to `elasticsearch-two.yml` (destination):

```yaml
reindex.remote.whitelist: "localhost:9200"
```

Restart destination:

```bash
docker compose -f docker-compose-dest.yml restart
```

## Perform Remote Reindex

From destination cluster:

```bash
curl -X POST "localhost:9201/_reindex" -H 'Content-Type: application/json' -d'
{
  "source": {
    "remote": {
      "host": "http://localhost:9200"
    },
    "index": "my-index"
  },
  "dest": {
    "index": "my-index"
  }
}'
```

## With Authentication

```bash
curl -X POST "localhost:9201/_reindex" -H 'Content-Type: application/json' -d'
{
  "source": {
    "remote": {
      "host": "http://remote-es:9200",
      "username": "elastic",
      "password": "changeme"
    },
    "index": "my-index"
  },
  "dest": {
    "index": "my-index"
  }
}'
```

## Automated Script

Download the helper script:

```bash
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/elasticsearch-remote-reindexing/start-remote-reindexing.sh
chmod +x start-remote-reindexing.sh
```

## Verification

```bash
# Check document count on source
curl "localhost:9200/my-index/_count"

# Check document count on destination
curl "localhost:9201/my-index/_count"
```

## Next Steps

- [Backup Strategies](./03-backup-restore)
