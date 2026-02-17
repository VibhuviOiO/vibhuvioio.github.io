---
sidebar_position: 10
---
N-gram for Substring Matching in Elasticsearch

## 🧠 What’s the Difference Between Edge N-gram and N-gram?

| Analyzer Type | What it Matches     | Example Search: `err`         |
|---------------|----------------------|--------------------------------|
| Edge N-gram   | Only **prefixes**    | ❌ No match for `"blueberry"` |
| N-gram        | **Any substring**    | ✅ Matches `"blueberry"`       |

## Use Case

You type: `err`  
You want suggestions like:
- `blueberry`
- `blackberry`
- `cherry`

**Edge N-gram fails**.  
**N-gram wins**.

---

## 🛠️ Minimal Working N-gram Config

### 1. Create Index with N-gram Analyzer

```json
PUT test_ngram
{
  "settings": {
    "analysis": {
      "filter": {
        "ngram_filter": {
          "type": "ngram",
          "min_gram": 2,
          "max_gram": 10
        }
      },
      "analyzer": {
        "ngram_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "ngram_filter"
          ]
        },
        "search_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "ngram_analyzer",
        "search_analyzer": "search_analyzer"
      }
    }
  }
}
```

### 2. Index Docs

```json
POST test_ngram/_doc
{ "name": "blueberry" }

POST test_ngram/_doc
{ "name": "blackberry" }

POST test_ngram/_doc
{ "name": "cherry" }
```

### 3. Search by Substring

```json
POST test_ngram/_search
{
  "query": {
    "match": {
      "name": "err"
    }
  }
}
```

### Result:

Returns:
- `blueberry`
- `blackberry`
- `cherry`

---

## Warning

- N-grams increase index size — a lot of token combos get stored.
- Don’t use on long text fields.
- Best for autocomplete on names, tags, cities, etc.

---

## Summary

Use **Edge N-gram** when you need **prefix-based autocomplete**.  
Use **N-gram** when you need **substring-based match**.
