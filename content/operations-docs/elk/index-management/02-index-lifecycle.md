---
title: Index Lifecycle Management
description: Automate index lifecycle with ILM policies — hot, warm, cold, delete phases, rollover, and policy management.
duration: "30m"
readingTime: "20m"
labTime: "10m"
order: 2
---

## What is ILM?

Index Lifecycle Management (ILM) moves indices through phases automatically:

```
Hot → Warm → Cold → Delete
```

| Phase | Purpose | Typical Hardware | Duration |
|-------|---------|-----------------|----------|
| **Hot** | Active writes + queries | SSD, high CPU | Hours to days |
| **Warm** | Read-only queries | SSD or HDD | Days to weeks |
| **Cold** | Rare queries, compressed | HDD, low resources | Weeks to months |
| **Delete** | Removed from cluster | — | — |

## Creating an ILM Policy

### Basic Policy

```bash
curl -X PUT "http://localhost:9200/_ilm/policy/logs-policy" \
  -H 'Content-Type: application/json' -d'
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_primary_shard_size": "50gb",
            "max_age": "1d"
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "2d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          },
          "set_priority": {
            "priority": 50
          }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "set_priority": {
            "priority": 0
          },
          "freeze": {}
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

### Retention-Only Policy

For simple retention without tiering:

```bash
curl -X PUT "http://localhost:9200/_ilm/policy/simple-retention" \
  -H 'Content-Type: application/json' -d'
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_primary_shard_size": "30gb",
            "max_age": "7d"
          }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'
```

## Rollover

Rollover creates a new index when the current one meets size or age conditions. It requires an index alias.

### Set Up Rollover

**Step 1: Create an index template with ILM**

```bash
curl -X PUT "http://localhost:9200/_index_template/logs-template" \
  -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs-policy",
      "index.lifecycle.rollover_alias": "logs-write"
    }
  }
}'
```

**Step 2: Bootstrap the first index**

```bash
curl -X PUT "http://localhost:9200/logs-000001" \
  -H 'Content-Type: application/json' -d'
{
  "aliases": {
    "logs-write": {
      "is_write_index": true
    }
  }
}'
```

Now all writes go to the `logs-write` alias, and ILM handles rollover automatically.

### Check Rollover Status

```bash
curl -s "http://localhost:9200/logs-write/_ilm/explain?pretty"
```

## ILM Phase Actions Reference

### Hot Phase Actions

| Action | Description |
|--------|-------------|
| `rollover` | Create new index at size/age/doc count threshold |
| `set_priority` | Higher = recovered first after restart |
| `readonly` | Prevent writes (applied automatically before warm) |

### Warm Phase Actions

| Action | Description |
|--------|-------------|
| `shrink` | Reduce primary shard count |
| `forcemerge` | Merge segments (reduces disk, improves search) |
| `allocate` | Move to warm-tier nodes |
| `set_priority` | Lower than hot |

### Cold Phase Actions

| Action | Description |
|--------|-------------|
| `freeze` | Reduce memory footprint (deprecated in 8.x) |
| `searchable_snapshot` | Move to shared storage |
| `allocate` | Move to cold-tier nodes |

### Delete Phase Actions

| Action | Description |
|--------|-------------|
| `delete` | Remove index permanently |
| `wait_for_snapshot` | Wait for snapshot before deleting |

## Applying ILM to Existing Indices

For indices not created with a template:

```bash
curl -X PUT "http://localhost:9200/my-existing-index/_settings" \
  -H 'Content-Type: application/json' -d'
{
  "index.lifecycle.name": "logs-policy"
}'
```

## Monitoring ILM

### Check Policy Status

```bash
# View all policies
curl -s "http://localhost:9200/_ilm/policy?pretty"

# Check specific index ILM status
curl -s "http://localhost:9200/logs-000001/_ilm/explain?pretty"

# View ILM errors
curl -s "http://localhost:9200/_ilm/status?pretty"
```

### Common ILM Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Index stuck in phase | Allocation rules can't be satisfied | Check node attributes and tier settings |
| Rollover not triggering | No write alias configured | Add `is_write_index: true` alias |
| Policy not applied | Template doesn't match index pattern | Check `index_patterns` in template |
| Shrink fails | Not enough nodes | Ensure target shard count divides evenly |

## Export and Import ILM Policies

When migrating between clusters, export your ILM policies:

### Export

```bash
# Export all policies
curl -s "http://localhost:9200/_ilm/policy?pretty" > ilm-policies.json

# Export specific policy
curl -s "http://localhost:9200/_ilm/policy/logs-policy?pretty" > logs-policy.json
```

### Import

```bash
# Import policy to new cluster
curl -X PUT "http://new-cluster:9200/_ilm/policy/logs-policy" \
  -H 'Content-Type: application/json' \
  -d @logs-policy.json
```

## ILM with Data Tiers

In a multi-node cluster, assign nodes to tiers:

```yaml
# elasticsearch.yml for hot node
node.roles: [data_hot, master]

# elasticsearch.yml for warm node
node.roles: [data_warm]

# elasticsearch.yml for cold node
node.roles: [data_cold]
```

ILM automatically moves indices between tiers based on your policy.

## Lab: Create a Complete ILM Pipeline

1. Create an ILM policy with hot, warm, and delete phases
2. Create an index template that uses the policy
3. Bootstrap the first index with a write alias
4. Insert test documents
5. Verify the ILM status with `_ilm/explain`

## Next Steps

- [Analyzers & Tokenizers](/learn/elk/index-management/03-analyzers) — understand text analysis
- [Cluster Monitoring](/learn/elk/monitoring/01-cluster-monitoring) — monitor ILM in production
