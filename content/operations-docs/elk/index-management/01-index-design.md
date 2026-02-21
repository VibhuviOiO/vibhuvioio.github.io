---
title: Index Design Best Practices
description: Elasticsearch index design — inverted index internals, mappings, settings, aliases, shard planning, templates, and naming conventions.
duration: "45m"
readingTime: "30m"
labTime: "15m"
order: 1
---

## How the Inverted Index Works

At its core, Elasticsearch stores data using an **inverted index** — a mapping of terms to the documents that contain them. It's like a book's index: instead of scanning every page, you look up a term and jump straight to the relevant pages.

### Sample Documents

```
Doc 1: "Elasticsearch is blazing fast and scalable."
Doc 2: "The inverted index enables fast full-text search."
Doc 3: "Lucene is the core engine behind Elasticsearch."
Doc 4: "Text analysis includes tokenization, filtering, and normalization."
Doc 5: "Scalable search solutions use efficient indexing mechanisms."
```

### Inverted Index Table

After tokenization and cleanup, Elasticsearch builds this structure:

| Term | Documents |
|------|-----------|
| elasticsearch | 1, 3 |
| blazing | 1 |
| fast | 1, 2 |
| scalable | 1, 5 |
| inverted | 2 |
| index | 2 |
| search | 2, 5 |
| lucene | 3 |
| core | 3 |
| engine | 3 |
| analysis | 4 |
| tokenization | 4 |
| filtering | 4 |
| solutions | 5 |
| efficient | 5 |

### How Search Works

When you search for `fast`, Elasticsearch looks up the term in the inverted index and immediately finds **Documents 1 and 2** — no scanning required. This is why Elasticsearch feels real-time, even on huge datasets.

**Key insight:** The inverted index avoids scanning every document. It's just a lookup, not a scan. This is the fundamental reason Elasticsearch is fast.

## Mappings

Mappings define the schema of your index — field names, types, and how they're analyzed. They're like table schemas in relational databases.

### Dynamic Mapping Modes

| Mode | New Fields? | Unknown Fields? | Error on Unknown? | Indexed Fields |
|------|------------|-----------------|-------------------|----------------|
| No mapping | Auto-created | Accepted | No | All |
| `dynamic: true` | Auto-added to mapping | Accepted | No | All |
| `dynamic: false` | Not added to mapping | Stored but not indexed | No | Only defined |
| `dynamic: strict` | Rejected | Rejected | Yes | Only defined |

### dynamic: true (Default)

Elasticsearch auto-creates fields as it sees them. Flexible but can create unexpected mappings:

```bash
curl -X POST "localhost:9200/users/_doc/1" \
  -H 'Content-Type: application/json' -d'
{
  "name": "Alice",
  "email": "alice@example.com",
  "phone": "1234567890",
  "date_of_birth": "1992-05-04"
}'
```

Elasticsearch infers: `name` → text, `email` → text+keyword, `phone` → text, `date_of_birth` → date.

### dynamic: false (Ignore Unknown)

Define your schema but silently ignore unexpected fields:

```bash
curl -X PUT "localhost:9200/users_strict" \
  -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "dynamic": false,
    "properties": {
      "name": { "type": "text" },
      "email": { "type": "keyword" }
    }
  }
}'
```

New fields like `phone` are stored in `_source` but **not indexed** — you can't search or aggregate on them.

### dynamic: strict (Reject Unknown)

Enforce a locked schema. Any unknown field throws an error:

```bash
curl -X PUT "localhost:9200/users_validated" \
  -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "name": { "type": "text" },
      "email": { "type": "keyword" }
    }
  }
}'
```

Inserting a document with an unmapped `phone` field returns:

```json
"reason": "mapping set to strict, dynamic introduction of [phone] is not allowed"
```

### When to Use Each Mode

- **`dynamic: true`** — Bootstrapping, exploring, or when schema flexibility is needed
- **`dynamic: false`** — Strict ingestion without throwing errors
- **`dynamic: strict`** — Production indices where data integrity matters

## Index Settings

### Core Settings

| Setting | Purpose | Changeable? |
|---------|---------|-------------|
| `number_of_shards` | Primary shard count | No (set at creation) |
| `number_of_replicas` | Replica count for HA | Yes |
| `routing.allocation.include._tier_preference` | Node placement strategy | Yes |
| `refresh_interval` | How often new data becomes searchable | Yes |
| `provided_name` | Original index name | No |
| `creation_date` | When index was created (epoch) | No |
| `uuid` | Internal unique identifier | No |
| `version.created` | ES version used at creation | No |

### View and Update Settings

```bash
# View all settings
curl -s "localhost:9200/my-index/_settings?pretty"

# Update mutable settings
curl -X PUT "localhost:9200/my-index/_settings" \
  -H 'Content-Type: application/json' -d'
{
  "index.number_of_replicas": 2,
  "index.refresh_interval": "30s"
}'
```

### Settings by Environment

| Setting | Development | Production |
|---------|------------|------------|
| `number_of_shards` | 1 | Based on data size |
| `number_of_replicas` | 0 | 1 or 2 |
| `refresh_interval` | 1s (default) | 30s or higher |

## Aliases

Aliases are virtual index names that point to one or more real indices. They decouple your application from physical index names.

### Why Use Aliases?

| Use Case | Benefit |
|----------|---------|
| Abstract index name | Application code never changes |
| Zero-downtime reindexing | Point alias to new index instantly |
| Multi-index reads | Query multiple indices with one name |
| Controlled writes | Only one index accepts writes |

### Create and Manage Aliases

```bash
# Add alias to an index
curl -X POST "localhost:9200/_aliases" \
  -H 'Content-Type: application/json' -d'
{
  "actions": [
    { "add": { "index": "products-v1", "alias": "products" } }
  ]
}'

# Query using alias (same as querying the real index)
curl -s "localhost:9200/products/_search?pretty"
```

### Multi-Index Alias

Point one alias to multiple indices for combined reads:

```bash
curl -X POST "localhost:9200/_aliases" \
  -H 'Content-Type: application/json' -d'
{
  "actions": [
    { "add": { "index": "products-v1", "alias": "products" } },
    { "add": { "index": "products-v2", "alias": "products" } }
  ]
}'
```

Searching `products` now returns results from both indices.

### Write Index

When an alias points to multiple indices, you must designate one as the write target:

```bash
curl -X POST "localhost:9200/_aliases" \
  -H 'Content-Type: application/json' -d'
{
  "actions": [
    { "add": { "index": "products-v1", "alias": "products", "is_write_index": false } },
    { "add": { "index": "products-v2", "alias": "products", "is_write_index": true } }
  ]
}'
```

### Zero-Downtime Reindexing with Aliases

```bash
# Step 1: Application uses alias "products"
# Step 2: Create new index with improved mappings
# Step 3: Reindex data from v1 to v2
# Step 4: Atomic alias swap
curl -X POST "localhost:9200/_aliases" \
  -H 'Content-Type: application/json' -d'
{
  "actions": [
    { "remove": { "index": "products-v1", "alias": "products" } },
    { "add": { "index": "products-v2", "alias": "products" } }
  ]
}'
```

The `remove` and `add` happen atomically — no downtime, no missed queries.

### View Aliases

```bash
curl -s "localhost:9200/_alias/products?pretty"
```

## Index Naming Conventions

### Time-Based Data

```
logs-2024.01.15
metrics-2024.01
filebeat-2024.01.15
```

### Environment-Based

```
production-logs-2024.01
staging-orders
development-users
```

### Versioned Indices (with aliases)

```
products-v1    →  alias: products
products-v2    →  alias: products (after reindex)
```

## Shard Planning

### Shard Size Guidelines

| Metric | Recommended |
|--------|-------------|
| Shard size | 20-50 GB |
| Shards per node | 20 per GB of heap |
| Max shards per node | 1000 (ES default) |

### Calculate Shards

```
Shards = Total Data Size / Target Shard Size

Example:
  100 GB data / 30 GB per shard = 4 primary shards
  With 1 replica: 4 primary + 4 replica = 8 total shards
```

### Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Too many small indices | Overhead per index/shard | Consolidate with time-based rollover |
| Too few large shards | Hard to rebalance, slow queries | Split into more shards |
| Too many shards per node | Memory pressure, slow recovery | Reduce shard count |
| Replicas on single-node | Shards unassigned (yellow) | Set replicas to 0 in dev |

## Index Templates

Create templates for consistent index configuration across all new indices matching a pattern:

```bash
curl -X PUT "localhost:9200/_index_template/logs_template" \
  -H 'Content-Type: application/json' -d'
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
      ],
      "properties": {
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "message": { "type": "text" }
      }
    }
  },
  "priority": 100
}'
```

## Lab: Design and Create Indices

1. Create an index with explicit mappings (text, keyword, date, integer)
2. Test `dynamic: true` vs `dynamic: strict` behavior
3. Create an alias and query through it
4. Perform zero-downtime alias swap between two indices
5. Create an index template for `logs-*` pattern
6. Verify template is applied by creating a matching index

## Next Steps

- [Index Lifecycle Management](./02-index-lifecycle) — automate hot/warm/cold/delete phases
- [Analyzers & Tokenizers](./03-analyzers) — control how text is indexed
