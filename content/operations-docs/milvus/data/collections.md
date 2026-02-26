---
title: "Collection Design Patterns"
description: "Design Milvus collections for your use case. Schema design, field types, and best practices for production."
duration: "30m"
readingTime: "15m"
labTime: "15m"
order: 1
---

# Collection Design Patterns

Collections are Milvus's equivalent of database tables. Design decisions made here are hard to change later — they're baked into the schema.

## Schema Fundamentals

### Required Fields

Every collection needs:

```python
from pymilvus import MilvusClient, DataType

schema = client.create_schema()

# Primary key (auto-generated or provided)
schema.add_field(
    field_name="id",
    datatype=DataType.INT64,
    is_primary=True,
    auto_id=True  # Let Milvus generate
)

# Vector field (at least one)
schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=384  # Match your model's output
)
```

### Common Schema Patterns

**RAG Application:**

```python
schema = client.create_schema(
    auto_id=True,
    enable_dynamic_field=False
)

schema.add_field("id", DataType.INT64, is_primary=True)
schema.add_field("embedding", DataType.FLOAT_VECTOR, dim=1536)
schema.add_field("chunk_text", DataType.VARCHAR, max_length=8192)
schema.add_field("doc_id", DataType.VARCHAR, max_length=64)
schema.add_field("chunk_index", DataType.INT32)
```

**Image Search:**

```python
schema = client.create_schema(
    auto_id=True,
    enable_dynamic_field=False
)

schema.add_field("id", DataType.INT64, is_primary=True)
schema.add_field("embedding", DataType.FLOAT_VECTOR, dim=512)
schema.add_field("image_url", DataType.VARCHAR, max_length=512)
schema.add_field("category", DataType.VARCHAR, max_length=32)
schema.add_field("upload_time", DataType.INT64)  # Unix timestamp
```

**E-commerce (Multi-modal):**

```python
schema = client.create_schema(
    auto_id=True,
    enable_dynamic_field=True  # Flexible metadata
)

schema.add_field("id", DataType.INT64, is_primary=True)
schema.add_field("text_embedding", DataType.FLOAT_VECTOR, dim=384)
schema.add_field("image_embedding", DataType.FLOAT_VECTOR, dim=512)
schema.add_field("product_id", DataType.VARCHAR, max_length=32)
```

## Field Types Reference

| Type | Use For | Notes |
|------|---------|-------|
| `INT8/16/32/64` | IDs, counts, small integers | INT64 for timestamps |
| `FLOAT/DOUBLE` | Scores, ratings | DOUBLE for precision |
| `VARCHAR` | Text IDs, URLs, categories | Max 65535 chars |
| `BOOL` | Flags, yes/no | Efficient storage |
| `JSON` | Flexible metadata | Queryable fields |
| `ARRAY` | Tags, lists | Element type required |
| `FLOAT_VECTOR` | Dense embeddings | Most common |
| `BINARY_VECTOR` | Hashed data, fingerprints | Hamming distance |
| `SPARSE_VECTOR` | TF-IDF, BM25 | Variable dimension |

## Critical Decisions

### 1. Auto-ID vs Manual ID

```python
# Auto-ID - Simple, monotonic
schema = client.create_schema(auto_id=True)
schema.add_field("id", DataType.INT64, is_primary=True)

# Insert without ID
client.insert("collection", [{"vector": [...], "text": "..."}])
```

```python
# Manual ID - Control, deduplication
schema = client.create_schema(auto_id=False)
schema.add_field("doc_id", DataType.VARCHAR, is_primary=True, max_length=64)

# Insert with ID
client.insert("collection", [{"doc_id": "doc_001", "vector": [...]}])
```

**Decision Matrix:**

| Use Auto-ID When | Use Manual ID When |
|-----------------|-------------------|
| Simple insert | Need deduplication |
| No external ID | External system owns IDs |
| Monotonic order matters | Need business meaning |

### 2. Dynamic Fields

```python
# Enable dynamic fields - flexible schema
schema = client.create_schema(enable_dynamic_field=True)

# Insert with variable fields
client.insert("collection", [
    {"vector": [...], "title": "A", "author": "X"},
    {"vector": [...], "title": "B", "source": "web"},  # Different fields!
])
```

**Pros:**
- Flexibility for evolving schemas
- Good for metadata-heavy use cases

**Cons:**
- No type safety on dynamic fields
- Slightly slower queries

### 3. Partition Key

For multi-tenant isolation:

```python
schema = client.create_schema()
schema.add_field("id", DataType.INT64, is_primary=True, auto_id=True)
schema.add_field("vector", DataType.FLOAT_VECTOR, dim=384)
schema.add_field("tenant_id", DataType.VARCHAR, max_length=32, is_partition_key=True)
```

Milvus automatically partitions by `tenant_id`. Queries filter by partition key automatically.

> **Limit:** Max 1024 partitions. For more tenants, use logical partitioning (filter by field).

## Index Creation

Every vector field needs an index:

```python
index_params = client.prepare_index_params()

# HNSW - Best for most use cases
index_params.add_index(
    field_name="embedding",
    index_type="HNSW",
    metric_type="COSINE",
    params={
        "M": 16,           # Connections per node (2-64)
        "efConstruction": 200  # Build accuracy (100-800)
    }
)

# IVF_FLAT - Balanced speed/recall
index_params.add_index(
    field_name="embedding",
    index_type="IVF_FLAT",
    metric_type="L2",
    params={"nlist": 128}  # Number of clusters
)

client.create_index("collection", index_params)
```

## Anti-Patterns

### ❌ Too Many Fields

```python
# BAD - 50+ fields
schema.add_field("field1", ...)
schema.add_field("field2", ...)
# ... 48 more fields

# GOOD - Store in JSON or separate DB
schema.add_field("metadata", DataType.JSON)
```

### ❌ VARCHAR for Everything

```python
# BAD - Wrong types
schema.add_field("count", DataType.VARCHAR, max_length=10)
schema.add_field("timestamp", DataType.VARCHAR, max_length=20)

# GOOD - Proper types
schema.add_field("count", DataType.INT32)
schema.add_field("timestamp", DataType.INT64)
```

### ❌ No Index on Vector

```python
# BAD - Missing index
client.create_collection("no_index_collection", schema=schema)
# Search will be SLOW (brute force)

# GOOD - Always index
client.create_index("collection", index_params)
client.load_collection("collection")  # Load to memory
```

## Best Practices

1. **Keep schemas simple** — Fewer fields = better performance
2. **Use proper types** — Don't store numbers as strings
3. **Index everything you query** — Including scalar fields
4. **Plan for growth** — Partition key for multi-tenancy
5. **Test with realistic data** — Before production deployment

## Next Steps

Learn about partitioning strategies:

→ **[Partitioning Strategies](./partitions)**
