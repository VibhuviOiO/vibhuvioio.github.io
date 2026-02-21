---
title: Reindexing Data
description: Move data between indices with mappings changes and transformations
duration: "20m"
readingTime: "10m"
labTime: "10m"
order: 1
---

## Project Structure

```tree
elasticsearch-remote-reindexing/
├── docker-compose.yml
└── .env
```

## Basic Reindex

```bash
curl -X POST "localhost:9200/_reindex?pretty" -H 'Content-Type: application/json' -d'
{
  "source": {
    "index": "old-index"
  },
  "dest": {
    "index": "new-index"
  }
}'
```

## Reindex with Transformation

```bash
curl -X POST "localhost:9200/_reindex" -H 'Content-Type: application/json' -d'
{
  "source": {
    "index": "products-v1"
  },
  "dest": {
    "index": "products-v2"
  },
  "script": {
    "source": "ctx._source.price = ctx._source.price * 1.1"
  }
}'
```

## Reindex from Query

```bash
curl -X POST "localhost:9200/_reindex" -H 'Content-Type: application/json' -d'
{
  "source": {
    "index": "logs-2024",
    "query": {
      "range": {
        "timestamp": {
          "gte": "2024-01-01",
          "lt": "2024-02-01"
        }
      }
    }
  },
  "dest": {
    "index": "logs-2024-01"
  }
}'
```

## Prepare Destination Index

Always create the destination index with proper mappings first:

```bash
curl -X PUT "localhost:9200/new-index" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 3
  },
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "created_at": { "type": "date" }
    }
  }
}'
```

## Monitor Reindexing

```bash
# Check task status
curl -X GET "localhost:9200/_tasks?detailed=true&actions=*reindex"

# Cancel if needed
curl -X POST "localhost:9200/_tasks/task_id:12345/_cancel"
```

## Best Practices

1. **Always test** on a subset first
2. **Create destination index** before reindexing
3. **Monitor cluster resources** during large reindexes
4. **Use slices** for parallel processing on large datasets

## Parallel Reindexing

```bash
curl -X POST "localhost:9200/_reindex" -H 'Content-Type: application/json' -d'
{
  "source": {
    "index": "large-index",
    "slice": {
      "id": 0,
      "max": 4
    }
  },
  "dest": {
    "index": "new-large-index"
  }
}'
```

## Lab: Practice Reindexing

1. Create a source index with sample documents
2. Reindex all documents to a new index
3. Reindex with a query filter (only specific documents)
4. Use `_tasks` API to monitor reindex progress
5. Verify document counts match between source and destination

## Next Steps

- [Remote Reindexing](./02-remote-reindexing) - Cross-cluster migration
