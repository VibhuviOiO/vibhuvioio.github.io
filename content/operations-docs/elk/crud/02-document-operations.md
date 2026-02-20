---
title: Document Operations - CRUD
description: Create, read, update, and delete documents in Elasticsearch
duration: "45m"
readingTime: "20m"
labTime: "25m"
order: 2
---

# Document Operations (CRUD)

Perform basic CRUD operations on Elasticsearch documents.

## Time Estimate
- **Reading**: 20 minutes
- **Lab**: 25 minutes

## GitHub Reference
- **Repository**: [infinite-containers/elastic-stack](https://github.com/JinnaBalu/infinite-containers)
- **Files**: Sample data configurations in elastic-stack directories

## Create Documents

### Index a Document (Auto-generate ID)

```bash
curl -X POST "localhost:9200/products/_doc?pretty" -H 'Content-Type: application/json' -d'
{
  "name": "Laptop Pro",
  "price": 1299.99,
  "category": "electronics",
  "created_at": "2024-01-15"
}'
```

Response includes auto-generated `_id`:
```json
{
  "_index": "products",
  "_id": "abc123",
  "_version": 1,
  "result": "created"
}
```

### Index with Specific ID

```bash
curl -X PUT "localhost:9200/products/_doc/1001?pretty" -H 'Content-Type: application/json' -d'
{
  "name": "Wireless Mouse",
  "price": 29.99,
  "category": "accessories",
  "created_at": "2024-01-15"
}'
```

## Read Documents

### Get by ID

```bash
curl -X GET "localhost:9200/products/_doc/1001?pretty"
```

### Search All Documents

```bash
curl -X GET "localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": {}
  }
}'
```

### Search with Query

```bash
curl -X GET "localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "name": "laptop"
    }
  }
}'
```

## Update Documents

### Partial Update

```bash
curl -X POST "localhost:9200/products/_update/1001?pretty" -H 'Content-Type: application/json' -d'
{
  "doc": {
    "price": 24.99
  }
}'
```

### Upsert (Update or Insert)

```bash
curl -X POST "localhost:9200/products/_update/1002?pretty" -H 'Content-Type: application/json' -d'
{
  "doc": {
    "name": "Keyboard",
    "price": 59.99
  },
  "doc_as_upsert": true
}'
```

## Delete Documents

### Delete by ID

```bash
curl -X DELETE "localhost:9200/products/_doc/1001?pretty"
```

### Delete by Query

```bash
curl -X POST "localhost:9200/products/_delete_by_query?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "category": "accessories"
    }
  }
}'
```

## Bulk Operations

```bash
curl -X POST "localhost:9200/_bulk?pretty" -H 'Content-Type: application/json' -d'
{ "index": { "_index": "products", "_id": "2001" } }
{ "name": "Monitor", "price": 299.99, "category": "electronics" }
{ "index": { "_index": "products", "_id": "2002" } }
{ "name": "Webcam", "price": 79.99, "category": "accessories" }
{ "delete": { "_index": "products", "_id": "1002" } }
'
```

## Next Steps

- [Bulk Operations](./03-bulk-operations) - Efficient data loading
- [Search Queries](./04-search-queries) - Advanced search
