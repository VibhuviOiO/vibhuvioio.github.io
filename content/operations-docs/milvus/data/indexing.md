---
title: "Index Types & Selection"
description: "Choose the right index for your vector search. HNSW, IVF, DISKANN, and more — with selection guidelines."
duration: "35m"
readingTime: "20m"
labTime: "15m"
order: 3
---

# Index Types & Selection

Choosing the right index is the single most important performance decision. It affects:

- **Query latency** — How fast searches return
- **Recall accuracy** — How many true neighbors are found
- **Memory usage** — How much RAM is required
- **Build time** — How long index creation takes

## Index Comparison

| Index | Best For | Recall | Memory | Build Time | Query Speed |
|-------|----------|--------|--------|------------|-------------|
| **FLAT** | Small datasets, 100% recall | 100% | 1× | None | Slow |
| **HNSW** | General purpose, high recall | 95-99% | 1.5-2× | Medium | Fast |
| **IVF_FLAT** | Balanced speed/recall | 90-95% | 1× | Fast | Medium |
| **IVF_SQ8** | Memory constrained | 85-90% | 0.25× | Fast | Medium |
| **IVF_PQ** | Very large datasets | 80-90% | 0.1× | Slow | Medium |
| **DISKANN** | Billion-scale, SSD-based | 90-95% | 0.3× | Slow | Medium |

## HNSW (Recommended Default)

**Best for:** Most production use cases

```python
index_params.add_index(
    field_name="embedding",
    index_type="HNSW",
    metric_type="COSINE",
    params={
        "M": 16,              # Max connections (2-64)
        "efConstruction": 200 # Search scope at build (100-800)
    }
)

# Search-time parameter
search_params = {
    "metric_type": "COSINE",
    "params": {"ef": 64}     # Search scope (top_k to 10×top_k)
}
```

**Parameters explained:**

| Parameter | Default | Range | Effect |
|-----------|---------|-------|--------|
| `M` | 16 | 2-64 | Higher = better recall, more memory |
| `efConstruction` | 200 | 100-800 | Higher = better recall, slower build |
| `ef` (search) | 64 | top_k to 10×top_k | Higher = better recall, slower |

**Tuning guide:**

| Dataset Size | M | efConstruction | ef (search) |
|--------------|---|----------------|-------------|
| <1M | 8-16 | 100-200 | 32-64 |
| 1M-10M | 16-32 | 200-400 | 64-128 |
| 10M-100M | 32-48 | 400-600 | 128-256 |
| >100M | 48-64 | 600-800 | 256-512 |

## IVF Indexes

**Best for:** Memory-constrained environments, known query distribution

### IVF_FLAT

```python
index_params.add_index(
    field_name="embedding",
    index_type="IVF_FLAT",
    metric_type="L2",
    params={"nlist": 1024}  # Number of clusters
)

search_params = {
    "metric_type": "L2",
    "params": {"nprobe": 16}  # Clusters to search
}
```

### IVF_SQ8 (Quantized)

```python
index_params.add_index(
    field_name="embedding",
    index_type="IVF_SQ8",
    metric_type="L2",
    params={"nlist": 1024}
)
```

**Memory savings:** 75% reduction vs IVF_FLAT

### IVF_PQ (Product Quantization)

```python
index_params.add_index(
    field_name="embedding",
    index_type="IVF_PQ",
    metric_type="L2",
    params={
        "nlist": 1024,
        "m": 16,       # Sub-quantizers
        "nbits": 8     # Bits per quantizer
    }
)
```

**Memory savings:** 90% reduction, but lower recall

## DISKANN (Disk-Based)

**Best for:** Billion-scale datasets that don't fit in memory

```python
index_params.add_index(
    field_name="embedding",
    index_type="DISKANN",
    metric_type="COSINE",
    params={
        "search_list_size": 16,   # Candidates to consider
        "pq_code_budget_gb": 1,   # PQ memory budget
        "build_dram_budget_gb": 16 # Build memory budget
    }
)
```

**Requirements:**
- SSD storage (NVMe preferred)
- Enable mmap in queryNode config
- Higher latency than HNSW but much less RAM

## Metric Types

| Metric | Use When | Formula |
|--------|----------|---------|
| **L2** | Physical distances | Euclidean distance |
| **IP** | Cosine-like similarity | Inner product |
| **COSINE** | Direction matters | Normalized IP |
| **HAMMING** | Binary vectors | Bit differences |
| **JACCARD** | Binary similarity | Set intersection |

**Most common:** COSINE for text embeddings, L2 for image embeddings

## Index Selection Decision Tree

```
Dataset fits in memory?
├── NO → DISKANN
└── YES → Need 100% recall?
    ├── YES → FLAT
    └── NO → Query latency critical?
        ├── YES → HNSW
        └── NO → Memory constrained?
            ├── YES → IVF_SQ8 or IVF_PQ
            └── NO → IVF_FLAT or HNSW
```

## Performance Testing

Before choosing, benchmark on your data:

```python
def benchmark_index(collection_name, search_params, test_vectors, ground_truth):
    """Benchmark index performance and recall."""
    
    # Warmup
    client.search(collection_name, data=[test_vectors[0]], limit=10)
    
    # Latency test
    import time
    latencies = []
    for vec in test_vectors[:100]:
        start = time.time()
        client.search(collection_name, data=[vec], limit=10, search_params=search_params)
        latencies.append((time.time() - start) * 1000)
    
    # Recall test
    recalls = []
    for i, vec in enumerate(test_vectors):
        results = client.search(
            collection_name, 
            data=[vec], 
            limit=10,
            search_params=search_params
        )
        returned_ids = {r["id"] for r in results[0]}
        true_ids = set(ground_truth[i][:10])
        recall = len(returned_ids & true_ids) / 10
        recalls.append(recall)
    
    return {
        "p50_latency": sorted(latencies)[50],
        "p99_latency": sorted(latencies)[99],
        "avg_recall": sum(recalls) / len(recalls)
    }
```

## Best Practices

1. **Start with HNSW** — Works well for most cases
2. **Benchmark before deciding** — Test on your actual data
3. **Match index to metric** — Some indexes only support specific metrics
4. **Plan for growth** — Choose index that works at target scale
5. **Monitor build time** — Large IVF_PQ builds can take hours

## Next Steps

Learn about query optimization:

→ **[Query Performance](../perf/query-optimization)**
