---
title: Index Design Best Practices
description: Design Elasticsearch indices for performance and scalability
duration: "30m"
readingTime: "20m"
labTime: "10m"
order: 1
---

# Index Design Best Practices

## Time Estimate
- **Reading**: 20 minutes
- **Lab**: 10 minutes

## GitHub Reference
- **Repository**: [infinite-containers/elastic-stack](https://github.com/JinnaBalu/infinite-containers)
- **Files**: Index configuration examples in elastic-stack directories

## Index Naming Conventions

### Time-Based Data

```
logs-2024.01.15
metrics-2024.01
orders-2024
```

### Environment-Based

```
production-logs
development-logs
staging-logs
```

## Shard Planning

### Shard Size Guidelines

| Metric | Recommended |
|--------|-------------|
| Shard Size | 20-50 GB |
| Shards per Node | 20 per GB of heap |
| Total Shards | Keep minimal |

### Calculate Shards

```bash
# Formula: (Data Size) / (Target Shard Size)
# 100GB data / 30GB per shard = ~4 shards
```

## Index Templates

Create templates for consistent index configuration:

```bash
curl -X PUT "localhost:9200/_index_template/logs_template" -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "refresh_interval": "30s"
    },
    "mappings": {
      "dynamic_templates": [
        {
          "strings_as_keywords": {
            "match_mapping_type": "string",
            "mapping": {
              "type": "keyword"
            }
          }
        }
      ]
    }
  }
}'
```

## Index Lifecycle Management (ILM)

### Create ILM Policy

```bash
curl -X PUT "localhost:9200/_ilm/policy/logs_policy" -H 'Content-Type: application/json' -d'
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "50GB",
            "max_age": "30d"
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'
```

## Best Practices

1. **Avoid too many small indices** - Overhead per index
2. **Avoid too few large indices** - Harder to manage
3. **Use aliases** - Abstract index names
4. **Plan for growth** - Start with right shard count
5. **Monitor shard sizes** - Reindex if needed

## Next Steps

- [Mappings](./02-mappings) - Field type definitions
- [Reindexing](../production/01-reindexing) - Migrate data between indices
