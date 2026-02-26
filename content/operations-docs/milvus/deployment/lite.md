---
title: "Milvus Lite — Local Development"
description: "Get started with Milvus in under 5 minutes using Milvus Lite — a Python library for local vector search."
duration: "20m"
readingTime: "10m"
labTime: "10m"
order: 1
---

# Milvus Lite — Local Development

Milvus Lite is the fastest way to get started with vector search. It's a Python library that embeds a full Milvus instance — no Docker, no dependencies, just `pip install` and go.

## When to Use Milvus Lite

| Use Case | Good Fit? |
|----------|-----------|
| Prototyping RAG applications | ✅ Perfect |
| Learning Milvus APIs | ✅ Perfect |
| Unit tests in CI/CD | ✅ Good |
| Jupyter notebooks | ✅ Perfect |
| Production with >1M vectors | ❌ Use Standalone |
| Multi-user applications | ❌ Use Standalone |

## Installation

```bash
pip install pymilvus
```

That's it. No other dependencies required.

## Quick Start

Create a file named `milvus_lite_demo.py`:

```python
from pymilvus import MilvusClient
import random

# Initialize Milvus Lite with a local database file
client = MilvusClient("./milvus_demo.db")

# Create a collection
client.create_collection(
    collection_name="documents",
    dimension=384,  # Embedding dimension (e.g., all-MiniLM-L6-v2)
    auto_id=True,
    enable_dynamic_field=True
)

print("Collection created!")

# Generate sample vectors (normally these come from your embedding model)
sample_docs = [
    {"text": "Machine learning is a subset of AI", "vector": [random.random() for _ in range(384)]},
    {"text": "Neural networks mimic the human brain", "vector": [random.random() for _ in range(384)]},
    {"text": "Python is great for data science", "vector": [random.random() for _ in range(384)]},
]

# Insert data
client.insert(
    collection_name="documents",
    data=sample_docs
)

print(f"Inserted {len(sample_docs)} documents")

# Search
query_vector = [random.random() for _ in range(384)]
results = client.search(
    collection_name="documents",
    data=[query_vector],
    limit=2,
    output_fields=["text"]
)

print("\nSearch results:")
for result in results[0]:
    print(f"  - {result['entity']['text']} (distance: {result['distance']:.4f})")
```

Run it:

```bash
python milvus_lite_demo.py
```

> **Expected Output:**
> ```
> Collection created!
> Inserted 3 documents
> Search results:
>   - Neural networks mimic the human brain (distance: 0.8234)
>   - Machine learning is a subset of AI (distance: 0.7912)
> ```

## Understanding the Database File

Milvus Lite stores everything in a single SQLite database file:

```
milvus_demo.db  # Contains metadata, vectors, and indexes
```

This file is portable — you can copy it between machines, commit it to git (if small), or delete it to start fresh.

**Size estimation:**
- Raw vectors: ~dimension × 4 bytes per vector
- With HNSW index: ~1.5-2× the raw size
- 1M vectors of 384 dimensions ≈ 2-3 GB

## Working with Collections

### Creating with Schema

For production-like behavior, define a schema explicitly:

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient("./milvus_demo.db")

# Define schema
schema = client.create_schema(
    auto_id=True,
    enable_dynamic_field=True,
)

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=384)
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="category", datatype=DataType.VARCHAR, max_length=64)

# Create collection
client.create_collection(
    collection_name="articles",
    schema=schema,
)
```

### Index Configuration

Milvus Lite automatically creates indexes, but you can configure them:

```python
# Configure HNSW index
client.create_index(
    collection_name="articles",
    index_params={
        "metric_type": "COSINE",
        "index_type": "HNSW",
        "params": {
            "M": 16,        # Max connections per node
            "efConstruction": 200  # Search scope during build
        }
    }
)
```

## Migration Path

Code written for Milvus Lite works with other deployment modes — just change the connection:

```python
# Milvus Lite (local file)
client = MilvusClient("./milvus_demo.db")

# Standalone (Docker)
client = MilvusClient(uri="http://localhost:19530")

# With authentication
client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)
```

The API is identical. This makes Milvus Lite perfect for development → production workflows.

## Limitations

Understand these constraints:

| Limitation | Value | Impact |
|------------|-------|--------|
| Max vectors | ~1-5M (depends on RAM) | Use Standalone for more |
| Max dimension | 32,768 | Rarely a constraint |
| Concurrent writes | Limited by SQLite | Single-writer preferred |
| No distributed search | N/A | Single machine only |

## Best Practices

### 1. Separate Databases per Environment

```python
# Development
client = MilvusClient("./milvus_dev.db")

# Testing
client = MilvusClient("./milvus_test.db")
```

### 2. Handle the Database File in Git

```gitignore
# .gitignore
*.db
*.db-journal  # SQLite journal files
```

### 3. Backup Before Schema Changes

```bash
cp milvus_demo.db milvus_demo.db.backup.$(date +%Y%m%d)
```

### 4. Monitor File Size

```python
import os

db_size = os.path.getsize("./milvus_demo.db") / (1024 * 1024)
print(f"Database size: {db_size:.1f} MB")

if db_size > 1000:  # 1GB threshold
    print("Consider migrating to Standalone mode")
```

## Troubleshooting

### Import Error

```
ImportError: cannot import name 'MilvusClient' from 'pymilvus'
```

**Fix:** Upgrade pymilvus
```bash
pip install -U pymilvus
```

### Database Locked

```
sqlite3.OperationalError: database is locked
```

**Cause:** Multiple processes writing simultaneously

**Fix:** Use a single writer process, or migrate to Standalone

### Out of Memory

```
MemoryError: Unable to allocate array
```

**Cause:** Too many vectors for available RAM

**Fix:** 
- Reduce vectors
- Use `mmap=True` (if supported)
- Migrate to Standalone with disk-based indexes

## Next Steps

Now that you've seen the Milvus API, let's deploy a production-ready standalone instance:

→ **[Standalone Deployment](./standalone)**

Or explore the full stack locally:

→ **[Docker Compose Setup](./docker-compose)**
