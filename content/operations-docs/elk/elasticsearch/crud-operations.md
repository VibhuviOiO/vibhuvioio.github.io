---
title: CRUD Operations
description: Learn how to perform Create, Read, Update, and Delete operations with Elasticsearch REST API
order: 2
---

# ✍️ CRUD Operations

Learn how to perform Create, Read, Update, and Delete operations with Elasticsearch using REST APIs.

---

## Create Index

### Without Mappings
Elasticsearch auto-generates field types when you index the first document (dynamic mapping).

### With Mappings
Define field types up front for better control:

```bash
curl -X PUT http://localhost:9200/characters -H "Content-Type: application/json" -d '
{
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "description": { "type": "text" }
    }
  }
}'
```

**Output:**
```json
{"acknowledged":true,"shards_acknowledged":true,"index":"characters"}
```

---

## Insert Document

```bash
curl -X POST http://localhost:9200/characters/_doc -H "Content-Type: application/json" -d '
{
  "name": "Hero",
  "description": "Main character description"
}'
```

**Output:**
```json
{"_index":"characters","_id":"abc123","_version":1,"result":"created"}
```

> Copy the `_id` from the output for the next queries.

---

## Read Operations

### Query All Documents

```bash
curl -X GET 'http://localhost:9200/characters/_search?pretty'
```

### Select by ID

```bash
export DOC_ID=abc123
curl -X GET "http://localhost:9200/characters/_doc/${DOC_ID}?pretty"
```

---

## Update Document

```bash
curl -X POST "http://localhost:9200/characters/_update/${DOC_ID}?pretty" \
  -H "Content-Type: application/json" \
  -d '{"doc": {"name": "Updated Name"}}'
```

---

## Delete Document

```bash
curl -X DELETE "http://localhost:9200/characters/_doc/${DOC_ID}?pretty"
```

---

## Practice Exercises

1. **Create & Query**: Index documents and analyze JSON responses
2. **Understand Mappings**: Compare auto-mapping vs custom mappings
3. **Cluster Health**: Check why cluster health may show yellow status

---

## Next Steps

- [Configure Kibana](../kibana/container)
- [Set up Logstash pipelines](../logstash/pipeline)
