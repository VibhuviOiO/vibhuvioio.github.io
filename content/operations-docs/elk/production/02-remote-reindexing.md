---
title: Remote Reindexing
description: Migrate data between Elasticsearch clusters — remote reindex API, batch scripts, date filtering, authentication, progress monitoring, and performance tuning.
duration: "40m"
readingTime: "20m"
labTime: "20m"
github: "https://github.com/JinnaBalu/infinite-containers/tree/main/elastic-stack/elasticsearch-remote-reindexing"
order: 2
---

## Project Structure

```tree
elasticsearch-remote-reindexing/
├── docker-compose.yml
└── .env
```

## Architecture

```
┌─────────────────────┐                ┌─────────────────────┐
│   Source Cluster     │                │  Destination Cluster │
│  (Old ES Version)   │───_reindex────▶│  (New ES Version)    │
│   192.168.0.13:9200 │                │   localhost:9200     │
└─────────────────────┘                └─────────────────────┘
```

The reindex call is made **from the destination cluster**. The destination pulls data from the source.

## Setup

### Download Configuration

```bash
mkdir ~/remote-reindex && cd ~/remote-reindex

# Download source cluster config
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/elasticsearch-remote-reindexing/elasticsearch-one.yml -O docker-compose-source.yml

# Download destination cluster config
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/elasticsearch-remote-reindexing/elasticsearch-two.yml -O docker-compose-dest.yml

# Download environment file
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/elasticsearch-remote-reindexing/.env
```

### Configure Remote Whitelist

The **destination** cluster must whitelist the source. In `elasticsearch.yml`:

```yaml
reindex.remote.whitelist: "192.168.0.13:9200"
```

For multiple sources:

```yaml
reindex.remote.whitelist: "192.168.0.13:9200, 10.0.1.50:9200"
```

### Start Both Clusters

```bash
docker compose -f docker-compose-source.yml up -d
docker compose -f docker-compose-dest.yml up -d
```

## Basic Remote Reindex

```bash
curl -X POST "localhost:9200/_reindex?wait_for_completion=true&pretty" \
  -H 'Content-Type: application/json' -d'
{
  "source": {
    "remote": {
      "host": "http://192.168.0.13:9200"
    },
    "index": "employee"
  },
  "dest": {
    "index": "employee"
  }
}'
```

## With Authentication

When the source cluster has security enabled:

```bash
curl -X POST "localhost:9200/_reindex?wait_for_completion=true&pretty" \
  -H 'Content-Type: application/json' -d'
{
  "source": {
    "remote": {
      "host": "http://192.168.0.13:9200",
      "username": "elastic",
      "password": "changeme"
    },
    "index": "employee"
  },
  "dest": {
    "index": "employee"
  }
}'
```

## The Complete Reindex Workflow

For production migrations, follow this workflow to preserve mappings and settings:

### Step 1: Get Mappings from Source

```bash
curl -s "http://source:9200/employee/_mappings?pretty" > mappings.json
curl -s "http://source:9200/employee/_settings?pretty" > settings.json
```

### Step 2: Create Index on Destination

Remove system-generated fields (`creation_date`, `version.created`, `provided_name`, `uuid`) from settings, then create:

```bash
curl -X PUT "localhost:9200/employee" \
  -H 'Content-Type: application/json' -d @index.json
```

### Step 3: Reindex

```bash
curl -X POST "localhost:9200/_reindex?wait_for_completion=true&pretty" \
  -H 'Content-Type: application/json' -d'
{
  "source": {
    "remote": { "host": "http://source:9200" },
    "index": "employee"
  },
  "dest": {
    "index": "employee"
  }
}'
```

### Step 4: Verify Document Counts

```bash
echo "Source:"
curl -s "http://source:9200/employee/_count"
echo ""
echo "Destination:"
curl -s "localhost:9200/employee/_count"
```

### Step 5: Create Alias (Zero-Downtime Switchover)

```bash
curl -X POST "localhost:9200/_aliases" \
  -H 'Content-Type: application/json' -d'
{
  "actions": [
    { "add": { "index": "employee", "alias": "employee-live" } }
  ]
}'
```

## Date-Range Filtered Reindex

Migrate only documents within a specific date range:

```bash
curl -X POST "localhost:9200/_reindex?wait_for_completion=true&pretty" \
  -H 'Content-Type: application/json' -d'
{
  "source": {
    "remote": {
      "host": "http://source:9200",
      "username": "elastic",
      "password": "changeme"
    },
    "index": "logs-*",
    "query": {
      "range": {
        "createdOn": {
          "gte": "2024-01-01",
          "lte": "2024-12-31"
        }
      }
    }
  },
  "dest": {
    "index": "logs-2024"
  }
}'
```

## Index Renaming During Reindex

Append a suffix to distinguish migrated indices:

```bash
curl -X POST "localhost:9200/_reindex?wait_for_completion=true&pretty" \
  -H 'Content-Type: application/json' -d'
{
  "source": {
    "remote": { "host": "http://source:9200" },
    "index": "employee"
  },
  "dest": {
    "index": "employee-reindexed"
  }
}'
```

## Batch Reindex Multiple Indices

Script to migrate multiple indices in a loop:

```bash
#!/bin/bash
# batch-remote-reindex.sh

SOURCE_HOST="http://192.168.0.13:9200"
DEST_HOST="http://localhost:9200"
INDICES=("index-1" "index-2" "index-3" "index-4" "index-5")

for INDEX in "${INDICES[@]}"; do
  echo "Reindexing: $INDEX"

  # Get mappings from source
  MAPPINGS=$(curl -s "$SOURCE_HOST/$INDEX/_mappings")

  # Create index on destination
  curl -s -X PUT "$DEST_HOST/$INDEX-reindexed" \
    -H 'Content-Type: application/json' -d "{
      \"mappings\": $(echo $MAPPINGS | jq ".\"$INDEX\".mappings")
    }" > /dev/null

  # Reindex
  curl -X POST "$DEST_HOST/_reindex?wait_for_completion=true" \
    -H 'Content-Type: application/json' -d "{
      \"source\": {
        \"remote\": { \"host\": \"$SOURCE_HOST\" },
        \"index\": \"$INDEX\"
      },
      \"dest\": {
        \"index\": \"$INDEX-reindexed\"
      }
    }"

  echo " Done: $INDEX"
done
```

Download the helper script:

```bash
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/elasticsearch-remote-reindexing/start-remote-reindexing.sh
chmod +x start-remote-reindexing.sh
```

## Async Reindex and Progress Monitoring

For large indices, run reindex asynchronously and monitor progress.

### Start Async Reindex

```bash
curl -X POST "localhost:9200/_reindex?wait_for_completion=false" \
  -H 'Content-Type: application/json' -d'
{
  "source": {
    "remote": { "host": "http://source:9200" },
    "index": "large-index",
    "size": 5000
  },
  "dest": {
    "index": "large-index-migrated"
  }
}'
```

Response returns a task ID:

```json
{ "task": "node-1:12345" }
```

### Monitor Progress

```bash
# Check task progress
curl -s "localhost:9200/_tasks/node-1:12345?pretty"

# List all reindex tasks
curl -s "localhost:9200/_tasks?actions=*reindex&detailed&pretty"
```

### Cancel a Reindex

```bash
curl -X POST "localhost:9200/_tasks/node-1:12345/_cancel"
```

## Performance Tuning

### Sliced Scroll (Parallel Reindex)

Use automatic slicing for faster migration:

```bash
curl -X POST "localhost:9200/_reindex?slices=auto&wait_for_completion=false" \
  -H 'Content-Type: application/json' -d'
{
  "source": {
    "remote": { "host": "http://source:9200" },
    "index": "large-index"
  },
  "dest": {
    "index": "large-index-migrated"
  }
}'
```

### Throttle to Reduce Impact

Limit reindex to N documents per second:

```bash
curl -X POST "localhost:9200/_reindex?requests_per_second=1000" \
  -H 'Content-Type: application/json' -d'
{
  "source": {
    "remote": { "host": "http://source:9200" },
    "index": "my-index"
  },
  "dest": { "index": "my-index" }
}'
```

### Batch Size

Increase `size` for faster throughput (default 1000):

```json
"source": {
  "remote": { "host": "http://source:9200" },
  "index": "my-index",
  "size": 5000
}
```

### Disable Replicas During Migration

```bash
# Before reindex
curl -X PUT "localhost:9200/my-index/_settings" \
  -H 'Content-Type: application/json' -d'{"index.number_of_replicas": 0}'

# After reindex
curl -X PUT "localhost:9200/my-index/_settings" \
  -H 'Content-Type: application/json' -d'{"index.number_of_replicas": 1}'
```

## Migration Checklist

| Step | Action |
|------|--------|
| 1 | Whitelist source in `reindex.remote.whitelist` |
| 2 | Get mappings and settings from source |
| 3 | Create index on destination with correct mappings |
| 4 | Disable replicas on destination (for speed) |
| 5 | Run reindex (async for large indices) |
| 6 | Monitor progress with `_tasks` API |
| 7 | Compare document counts |
| 8 | Spot-check sample documents |
| 9 | Re-enable replicas |
| 10 | Create alias for zero-downtime switchover |

## Lab: Migrate Data Between Clusters

1. Start source and destination clusters
2. Create test indices with sample data on the source
3. Whitelist the source on the destination
4. Perform a basic remote reindex
5. Verify document counts match
6. Try a date-range filtered reindex
7. Use the batch script to migrate multiple indices
8. Monitor an async reindex with `_tasks`

## Next Steps

- [Backup & Restore](/learn/elk/production/03-backup-restore) — snapshot-based data protection
- [Troubleshooting](/learn/elk/production/04-troubleshooting) — common errors and fixes
