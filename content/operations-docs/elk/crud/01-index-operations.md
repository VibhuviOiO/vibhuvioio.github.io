---
title: Index Operations
description: Create, configure, and manage Elasticsearch indices
duration: "20m"
readingTime: "10m"
labTime: "10m"
order: 1
---

# Index Operations

Indices are the core data containers in Elasticsearch. Learn to create and configure them properly.

## Time Estimate
- **Reading**: 10 minutes
- **Lab**: 10 minutes

## GitHub Reference
- **Repository**: [infinite-containers/elastic-stack](https://github.com/JinnaBalu/infinite-containers)
- **Files**: Configuration examples in elastic-stack directories

## Create an Index

### Basic Index

```bash
curl -X PUT "localhost:9200/my-first-index?pretty"
```

### With Settings and Mappings

```bash
curl -X PUT "localhost:9200/products?pretty" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "price": { "type": "float" },
      "category": { "type": "keyword" },
      "created_at": { "type": "date" }
    }
  }
}'
```

## List Indices

```bash
# All indices
curl -X GET "localhost:9200/_cat/indices?v"

# With health status
curl -X GET "localhost:9200/_cat/indices?v&health=green"
```

## Index Settings

### Update Settings

```bash
# Dynamic settings only
curl -X PUT "localhost:9200/products/_settings?pretty" -H 'Content-Type: application/json' -d'
{
  "index": {
    "number_of_replicas": 1,
    "refresh_interval": "30s"
  }
}'
```

### View Settings

```bash
curl -X GET "localhost:9200/products/_settings?pretty"
```

## Delete an Index

```bash
curl -X DELETE "localhost:9200/my-first-index?pretty"
```

## Index Templates

Create reusable index patterns:

```bash
curl -X PUT "localhost:9200/_index_template/logs_template?pretty" -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 1
    },
    "mappings": {
      "properties": {
        "timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "message": { "type": "text" }
      }
    }
  }
}'
```

## Best Practices

| Setting | Dev | Production |
|---------|-----|------------|
| `number_of_shards` | 1 | Based on data size |
| `number_of_replicas` | 0 | At least 1 |
| `refresh_interval` | 1s | 30s or higher |

## Next Steps

- [Document Operations](./02-document-operations) - Add and query data
- [Index Design](../index-management/01-index-design) - Advanced configuration
