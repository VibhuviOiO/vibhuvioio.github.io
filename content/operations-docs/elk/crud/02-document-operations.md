---
title: Document Operations - CRUD
description: Create, read, update, and delete documents in Elasticsearch — single documents, bulk API, update by query, and Ramayana-themed examples.
duration: "45m"
readingTime: "25m"
labTime: "20m"
order: 2
---

## Setup: Create an Index

Let's create an index with mappings using Ramayana characters as our dataset:

```bash
curl -X PUT "localhost:9200/ramayana_characters?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "role": { "type": "keyword" },
      "description": { "type": "text" },
      "kingdom": { "type": "keyword" },
      "is_divine": { "type": "boolean" },
      "weapons": { "type": "keyword" }
    }
  }
}'
```

## Create Documents

### Index a Document (Auto-generate ID)

```bash
curl -X POST "localhost:9200/ramayana_characters/_doc?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "name": "Rama",
  "role": "hero",
  "description": "Hero of the Ramayana, seventh avatar of Vishnu. Prince of Ayodhya.",
  "kingdom": "Ayodhya",
  "is_divine": true,
  "weapons": ["Brahmastra", "Narayanastra"]
}'
```

Response includes auto-generated `_id`:

```json
{
  "_index": "ramayana_characters",
  "_id": "abc123",
  "_version": 1,
  "result": "created"
}
```

### Index with Specific ID

```bash
curl -X PUT "localhost:9200/ramayana_characters/_doc/1?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "name": "Sita",
  "role": "heroine",
  "description": "Wife of Rama, daughter of Janaka. Incarnation of Goddess Lakshmi.",
  "kingdom": "Mithila",
  "is_divine": true,
  "weapons": []
}'
```

### Bulk Insert Multiple Characters

```bash
curl -X POST "localhost:9200/_bulk?pretty" \
  -H 'Content-Type: application/json' -d'
{ "index": { "_index": "ramayana_characters", "_id": "2" } }
{ "name": "Lakshmana", "role": "ally", "description": "Younger brother of Rama. Incarnation of Shesha.", "kingdom": "Ayodhya", "is_divine": true, "weapons": ["Narayanastra"] }
{ "index": { "_index": "ramayana_characters", "_id": "3" } }
{ "name": "Hanuman", "role": "ally", "description": "Son of Vayu, the wind god. Greatest devotee of Rama.", "kingdom": "Kishkindha", "is_divine": true, "weapons": ["Gada"] }
{ "index": { "_index": "ramayana_characters", "_id": "4" } }
{ "name": "Ravana", "role": "antagonist", "description": "King of Lanka. Ten-headed demon king, great scholar and devotee of Shiva.", "kingdom": "Lanka", "is_divine": false, "weapons": ["Chandrahasa", "Brahmastra"] }
{ "index": { "_index": "ramayana_characters", "_id": "5" } }
{ "name": "Vibhishana", "role": "ally", "description": "Brother of Ravana who chose dharma over family loyalty.", "kingdom": "Lanka", "is_divine": false, "weapons": [] }
{ "index": { "_index": "ramayana_characters", "_id": "6" } }
{ "name": "Sugriva", "role": "ally", "description": "King of Kishkindha, leader of the Vanara army.", "kingdom": "Kishkindha", "is_divine": false, "weapons": [] }
'
```

## Read Documents

### Get by ID

```bash
curl -s "localhost:9200/ramayana_characters/_doc/1?pretty"
```

### Search All Documents

```bash
curl -s "localhost:9200/ramayana_characters/_search?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "query": { "match_all": {} }
}'
```

### Search with Query

```bash
# Full-text search
curl -s "localhost:9200/ramayana_characters/_search?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "description": "avatar of Vishnu"
    }
  }
}'
```

### Filter by Keyword

```bash
# Find all allies
curl -s "localhost:9200/ramayana_characters/_search?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "query": {
    "term": {
      "role": "ally"
    }
  }
}'
```

### Boolean Query

```bash
# Divine characters from Ayodhya
curl -s "localhost:9200/ramayana_characters/_search?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "must": [
        { "term": { "kingdom": "Ayodhya" } },
        { "term": { "is_divine": true } }
      ]
    }
  }
}'
```

### Count Documents

```bash
curl -s "localhost:9200/ramayana_characters/_count?pretty"
```

## Update Documents

### Partial Update

Update a single field without replacing the entire document:

```bash
curl -X POST "localhost:9200/ramayana_characters/_update/4?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "doc": {
    "description": "King of Lanka. Ten-headed demon king, great scholar, devotee of Shiva, and master of all Vedas."
  }
}'
```

### Upsert (Update or Insert)

```bash
curl -X POST "localhost:9200/ramayana_characters/_update/7?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "doc": {
    "name": "Jatayu",
    "role": "ally",
    "description": "The divine eagle who fought Ravana to protect Sita.",
    "is_divine": true,
    "weapons": []
  },
  "doc_as_upsert": true
}'
```

### Update by Query

Update multiple documents matching a condition using Painless scripts:

```bash
# Add a field to all divine characters
curl -X POST "localhost:9200/ramayana_characters/_update_by_query?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "query": {
    "term": { "is_divine": true }
  },
  "script": {
    "source": "ctx._source.alignment = \"divine\"",
    "lang": "painless"
  }
}'
```

### Remove Fields with Update by Query

```bash
# Remove a field from all documents
curl -X POST "localhost:9200/ramayana_characters/_update_by_query?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "query": { "match_all": {} },
  "script": {
    "source": "ctx._source.remove(\"alignment\")",
    "lang": "painless"
  }
}'
```

### Conditional Update with Script

```bash
# Set role to "king" for characters whose description contains "King"
curl -X POST "localhost:9200/ramayana_characters/_update_by_query?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": { "description": "King" }
  },
  "script": {
    "source": "ctx._source.role = \"king\"",
    "lang": "painless"
  }
}'
```

## Delete Documents

### Delete by ID

```bash
curl -X DELETE "localhost:9200/ramayana_characters/_doc/7?pretty"
```

### Delete by Query

```bash
# Delete all antagonists
curl -X POST "localhost:9200/ramayana_characters/_delete_by_query?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "query": {
    "term": { "role": "antagonist" }
  }
}'
```

## Bulk API

The Bulk API processes multiple operations in a single request. Each operation is two lines: an action line and an optional data line.

### Bulk Operations

```bash
curl -X POST "localhost:9200/_bulk?pretty" \
  -H 'Content-Type: application/json' -d'
{ "index": { "_index": "ramayana_characters", "_id": "10" } }
{ "name": "Bharata", "role": "ally", "description": "Brother of Rama who ruled Ayodhya as regent.", "kingdom": "Ayodhya", "is_divine": true }
{ "index": { "_index": "ramayana_characters", "_id": "11" } }
{ "name": "Shatrughna", "role": "ally", "description": "Youngest brother of Rama.", "kingdom": "Ayodhya", "is_divine": true }
{ "update": { "_index": "ramayana_characters", "_id": "3" } }
{ "doc": { "description": "Son of Vayu, greatest devotee of Rama, immortal." } }
{ "delete": { "_index": "ramayana_characters", "_id": "6" } }
'
```

### Bulk Action Types

| Action | Description | Requires Body? |
|--------|------------|----------------|
| `index` | Create or replace a document | Yes |
| `create` | Create only (fails if exists) | Yes |
| `update` | Partial update | Yes (`doc` wrapper) |
| `delete` | Delete a document | No |

### Bulk Insert with Bash Loop

```bash
#!/bin/bash
# bulk-insert.sh — Insert documents from a file

for i in $(seq 1 100); do
  echo "{ \"index\": { \"_index\": \"test-data\" } }"
  echo "{ \"id\": $i, \"value\": \"item-$i\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\" }"
done | curl -s -X POST "localhost:9200/_bulk" \
  -H 'Content-Type: application/json' \
  --data-binary @- > /dev/null

echo "Inserted 100 documents"
```

## Document Routing

By default, Elasticsearch routes documents to shards using: `shard = hash(document_id) % number_of_shards`

You can control routing for co-locating related documents:

```bash
# Index with custom routing
curl -X PUT "localhost:9200/orders/_doc/1001?routing=customer_123&pretty" \
  -H 'Content-Type: application/json' -d'
{
  "customer_id": "customer_123",
  "product": "Laptop",
  "amount": 1299.99
}'

# Search with routing (faster — only hits one shard)
curl -s "localhost:9200/orders/_search?routing=customer_123&pretty" \
  -H 'Content-Type: application/json' -d'
{
  "query": { "term": { "customer_id": "customer_123" } }
}'
```

## Multi-Get API

Fetch multiple documents by ID in a single request:

```bash
curl -s "localhost:9200/_mget?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "docs": [
    { "_index": "ramayana_characters", "_id": "1" },
    { "_index": "ramayana_characters", "_id": "2" },
    { "_index": "ramayana_characters", "_id": "3" }
  ]
}'
```

## Lab: Practice CRUD Operations

1. Create the `ramayana_characters` index with mappings
2. Insert Rama, Sita, Lakshmana, Hanuman, and Ravana
3. Search for all divine characters
4. Update Ravana's description using partial update
5. Add a new field to all allies using `_update_by_query`
6. Bulk insert 5 more characters
7. Delete all characters from Lanka using `_delete_by_query`
8. Verify final document count

## Next Steps

- [Bulk Operations](./03-bulk-operations) — advanced bulk patterns
- [Search Queries](./04-search-queries) — full-text search techniques
