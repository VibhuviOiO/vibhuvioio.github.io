---
title: "Understanding Indices: From Tables to Elasticsearch"
description: How Elasticsearch stores and finds data — explained for anyone who knows SQL.
duration: "25m"
readingTime: "10m"
labTime: "15m"
order: 0
---

## If You Know SQL, You Already Know Half of This

Elasticsearch stores data differently than a relational database, but the concepts map cleanly:

| SQL | Elasticsearch | What it is |
|---|---|---|
| Database | Cluster | The whole system |
| Table | Index | A named collection of similar documents |
| Row | Document | A single JSON record |
| Column | Field | A key in that JSON document |
| Schema | Mapping | The field types (text, keyword, integer…) |
| `CREATE TABLE` | PUT index | Define the index before writing |
| `INSERT INTO` | Index a document | Write a JSON document |
| `SELECT WHERE` | Search query | Find matching documents |

The biggest shift: rows have a fixed schema, documents can have different shapes. But in practice, all documents in an index share the same mapping — so think of it like a table that tolerates `NULL` columns gracefully.

---

## Three Parts of an Index

Every Elasticsearch index has three components defined when you create it:

### 1. Settings — Infrastructure

Settings control how the index behaves at the storage layer:

```json
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
```

| Setting | Default | Meaning |
|---|---|---|
| `number_of_shards` | 1 | How many pieces the index is split into. Set once at creation — cannot change. |
| `number_of_replicas` | 1 | How many copies of each shard. Can change any time. |

For a single-node cluster: set replicas to `0`. Elasticsearch won't assign replica shards to the same node as the primary — leaving them `UNASSIGNED` and the index `yellow`. Zero replicas = `green`.

> **Note:** [Elasticsearch index settings reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules.html)

### 2. Mappings — Field Types

Mappings tell Elasticsearch how to interpret each field:

```json
{
  "mappings": {
    "properties": {
      "name":       { "type": "text" },
      "city":       { "type": "keyword" },
      "age":        { "type": "integer" },
      "created_at": { "type": "date" }
    }
  }
}
```

The two most common field types — and why they differ:

| Type | What happens to the value | Best for |
|---|---|---|
| `text` | Analyzed: lowercased, split into tokens by an analyzer | Full-text search (`match` query) |
| `keyword` | Stored as-is | Exact match, aggregations, sorting (`term` query) |

`"New York"` stored as `text` → tokens: `["new", "york"]` — matches search for `new` or `york`.
`"New York"` stored as `keyword` → stored as `"New York"` — only matches exact `"New York"`.

> **Note:** [Elasticsearch mapping types reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html)

### 3. Shards and Replicas — Distribution

**Primary shards** hold the actual data. An index with 3 shards splits its documents across 3 buckets — each query fans out to all shards and merges results.

**Replica shards** are exact copies of primaries. They serve two purposes:
- **Redundancy** — if a node fails, replicas on other nodes keep the data available
- **Read scaling** — search requests can hit replicas, distributing query load

```
Index: users  (3 primary shards, 1 replica each = 6 total shards)

Primary  P0  ──replica──  R0
Primary  P1  ──replica──  R1
Primary  P2  ──replica──  R2
```

On a single node: use `number_of_replicas: 0`. Replicas need a second node to live on. You'll add replicas in the multi-node lesson.

> **Note:** [Elasticsearch shards and replicas](https://www.elastic.co/guide/en/elasticsearch/reference/current/scalability.html)

---

## How Data Actually Gets Stored — The Inverted Index

When you index a `text` field, Elasticsearch doesn't store the raw string. It runs an **analyzer** on it, breaks it into tokens, and builds an inverted index — a lookup table mapping every token to the list of documents that contain it.

This is what makes full-text search fast: instead of scanning every document for a word, Elasticsearch goes directly to the token in the inverted index and reads the posting list.

The interactive demo below shows exactly how this works. Insert the sample documents and then search for a token — watch the inverted index build and see which documents match.

___INVERTED_INDEX_DEMO___

---

## Lab: Create an Index and Index Documents

Your single-node cluster is running. Open a terminal and follow along.

### 1. Create an index with explicit mapping

```bash
curl -X PUT "localhost:9200/users" -H "Content-Type: application/json" -d '{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "city": { "type": "keyword" },
      "role": { "type": "keyword" },
      "age":  { "type": "integer" }
    }
  }
}'
```

> **Expected:** `{"acknowledged":true,"shards_acknowledged":true,"index":"users"}`

### 2. Index some documents

```bash
curl -X POST "localhost:9200/users/_doc/1" -H "Content-Type: application/json" -d '{
  "name": "Alice Johnson",
  "city": "New York",
  "role": "engineer",
  "age": 31
}'

curl -X POST "localhost:9200/users/_doc/2" -H "Content-Type: application/json" -d '{
  "name": "Bob Smith",
  "city": "New York",
  "role": "designer",
  "age": 27
}'

curl -X POST "localhost:9200/users/_doc/3" -H "Content-Type: application/json" -d '{
  "name": "Alice Smith",
  "city": "Chicago",
  "role": "engineer",
  "age": 35
}'
```

### 3. Inspect the mapping Elasticsearch created

```bash
curl "localhost:9200/users/_mapping?pretty"
```

### 4. Check index health

```bash
curl "localhost:9200/_cat/indices/users?v&h=index,health,docs.count,store.size,pri,rep"
```

> **Expected:**

```bash
index  health  docs.count  store.size  pri  rep
users  green            3       9.5kb    1    0
```

`green` confirms all shards assigned. `rep=0` — no replicas on a single node.

### 5. Search by full-text

```bash
curl "localhost:9200/users/_search?pretty" -H "Content-Type: application/json" -d '{
  "query": { "match": { "name": "alice" } }
}'
```

Returns both `Alice Johnson` and `Alice Smith` — the `text` field was tokenized, so `"alice"` matches in both.

### 6. Search by exact keyword

```bash
curl "localhost:9200/users/_search?pretty" -H "Content-Type: application/json" -d '{
  "query": { "term": { "city": "New York" } }
}'
```

Returns only the two New York documents. `term` queries hit the `keyword` field — exact match, case-sensitive.

---

## Next Steps

- [Index Operations](./01-index-operations) — aliases, open/close, delete
- [Document CRUD](./02-document-operations) — update, delete, bulk indexing
