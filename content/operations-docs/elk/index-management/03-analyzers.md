---
title: Analyzers & Tokenizers
description: Text analysis in Elasticsearch — inverted index tokenization, built-in analyzers, tokenizers, token filters, custom analyzers, and common errors.
duration: "35m"
readingTime: "20m"
labTime: "15m"
order: 3
---

## How Analysis Works

Every text field goes through a three-step pipeline:

```
Input Text → Character Filters → Tokenizer → Token Filters → Indexed Tokens
```

| Step | Purpose | Example |
|------|---------|---------|
| **Character Filter** | Strip or replace characters before tokenization | `<b>Hello</b>` → `Hello` |
| **Tokenizer** | Split text into tokens | `"quick brown fox"` → `["quick", "brown", "fox"]` |
| **Token Filter** | Transform tokens (lowercase, stemming, synonyms) | `["Running", "FAST"]` → `["run", "fast"]` |

## Tokenization in Action

### Step 1: Raw Text

```
"Elasticsearch is blazing fast and scalable."
```

### Step 2: Tokenization (split into words)

```
["Elasticsearch", "is", "blazing", "fast", "and", "scalable"]
```

### Step 3: Lowercasing + Stop Word Removal

```
["elasticsearch", "blazing", "fast", "scalable"]
```

Stop words like `is`, `and`, `the` are removed (depending on the analyzer). The remaining tokens are stored in the inverted index.

## Token Filters

| Filter | Input | Output | Use Case |
|--------|-------|--------|----------|
| **Lowercasing** | `Elasticsearch` | `elasticsearch` | Case-insensitive search |
| **Punctuation** | `full-text` | `full`, `text` | Word boundary splitting |
| **Stop words** | `is`, `and`, `the` | Removed | Reduce noise |
| **Stemming** | `indexing` | `index` | Match word variants |
| **Synonyms** | `fast` | `fast`, `quick` | Expand search terms |
| **Edge N-Gram** | `search` | `s`, `se`, `sea`... | Autocomplete |

## Choosing the Right Tokenizer

| Use Case | Best Tokenizer |
|----------|---------------|
| Free text (articles, blog posts) | `standard` |
| Tags, exact keywords, IPs | `keyword` |
| Custom structured logs | `pattern`, `whitespace` |
| File paths | `path_hierarchy` |
| URLs and emails | `uax_url_email` |
| Autocomplete | `edge_ngram`, `ngram` |
| Source code, identifiers | `whitespace`, `keyword` |

## Testing Analyzers

Use the `_analyze` API to see how text is processed:

```bash
curl -X POST "http://localhost:9200/_analyze?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "analyzer": "standard",
  "text": "The Quick Brown Fox jumps over 2 lazy dogs!"
}'
```

Response shows the tokens: `["the", "quick", "brown", "fox", "jumps", "over", "2", "lazy", "dogs"]`

### Test a Custom Analyzer on an Existing Index

```bash
curl -X POST "http://localhost:9200/my-index/_analyze?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "analyzer": "autocomplete",
  "text": "elasticsearch"
}'
```

### Test Individual Components

```bash
# Test just a tokenizer
curl -X POST "http://localhost:9200/_analyze?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "tokenizer": "whitespace",
  "text": "user-name@host.com logged-in"
}'

# Test tokenizer + filters
curl -X POST "http://localhost:9200/_analyze?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "tokenizer": "standard",
  "filter": ["lowercase", "stop"],
  "text": "The Quick Brown Fox"
}'
```

## Built-in Analyzers

### Standard Analyzer (default)

Tokenizes on word boundaries, lowercases, removes punctuation.

```bash
curl -X POST "http://localhost:9200/_analyze?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "analyzer": "standard",
  "text": "user.name@example.com logged-in at 10:30"
}'
```

Tokens: `["user.name", "example.com", "logged", "in", "at", "10", "30"]`

### Simple Analyzer

Splits on non-letter characters, lowercases.

```bash
curl -X POST "http://localhost:9200/_analyze?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "analyzer": "simple",
  "text": "Error-404: Page not found!"
}'
```

Tokens: `["error", "page", "not", "found"]`

### Whitespace Analyzer

Splits on whitespace only. No lowercasing.

### Keyword Analyzer

No tokenization — the entire input becomes a single token. Used for exact-match fields.

### Pattern Analyzer

Splits on a regex pattern (default: `\W+`).

### Language Analyzers

Built-in analyzers for 30+ languages with stemming and stop words:

```bash
curl -X POST "http://localhost:9200/_analyze?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "analyzer": "english",
  "text": "The foxes were running quickly through the forests"
}'
```

Tokens: `["fox", "run", "quickli", "through", "forest"]` — notice stemming.

## Analyzer Comparison

| Analyzer | Input: `"user-name@host.com"` | Tokens |
|----------|-------------------------------|--------|
| `standard` | `["user", "name", "host.com"]` | Word boundaries |
| `simple` | `["user", "name", "host", "com"]` | Non-letters split |
| `whitespace` | `["user-name@host.com"]` | Single token |
| `keyword` | `["user-name@host.com"]` | Entire input |
| `english` | `["user", "name", "host.com"]` | Stemmed words |

## Built-in Tokenizers

| Tokenizer | Behavior |
|-----------|----------|
| `standard` | Unicode word boundaries |
| `letter` | Splits on non-letters |
| `whitespace` | Splits on whitespace |
| `keyword` | No split (entire input) |
| `pattern` | Regex-based splitting |
| `path_hierarchy` | Splits file paths: `/a/b/c` → `["/a", "/a/b", "/a/b/c"]` |
| `ngram` | Character n-grams for autocomplete |
| `edge_ngram` | Leading edge n-grams |

## Token Filters Reference

| Filter | Effect |
|--------|--------|
| `lowercase` | `"FOX"` → `"fox"` |
| `uppercase` | `"fox"` → `"FOX"` |
| `stop` | Remove stop words (the, is, at) |
| `stemmer` | `"running"` → `"run"` |
| `synonym` | `"quick"` → `["quick", "fast"]` |
| `asciifolding` | `"café"` → `"cafe"` |
| `trim` | Remove leading/trailing whitespace |
| `unique` | Deduplicate tokens |
| `ngram` | Generate n-grams from each token |
| `edge_ngram` | Generate edge n-grams |

## Creating Custom Analyzers

### Autocomplete Analyzer

```bash
curl -X PUT "http://localhost:9200/search-index" \
  -H 'Content-Type: application/json' -d'
{
  "settings": {
    "analysis": {
      "analyzer": {
        "autocomplete": {
          "type": "custom",
          "tokenizer": "autocomplete_tokenizer",
          "filter": ["lowercase"]
        },
        "autocomplete_search": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase"]
        }
      },
      "tokenizer": {
        "autocomplete_tokenizer": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 10,
          "token_chars": ["letter", "digit"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "autocomplete",
        "search_analyzer": "autocomplete_search"
      }
    }
  }
}'
```

### Log Message Analyzer

For analyzing log messages where you want to preserve paths and error codes:

```bash
curl -X PUT "http://localhost:9200/logs-analyzed" \
  -H 'Content-Type: application/json' -d'
{
  "settings": {
    "analysis": {
      "analyzer": {
        "log_analyzer": {
          "type": "custom",
          "tokenizer": "pattern",
          "filter": ["lowercase", "stop"],
          "char_filter": ["html_strip"]
        }
      },
      "tokenizer": {
        "pattern": {
          "type": "pattern",
          "pattern": "[\\s,;:]+",
          "lowercase": true
        }
      }
    }
  }
}'
```

### Synonym Analyzer

```bash
curl -X PUT "http://localhost:9200/products" \
  -H 'Content-Type: application/json' -d'
{
  "settings": {
    "analysis": {
      "filter": {
        "product_synonyms": {
          "type": "synonym",
          "synonyms": [
            "laptop, notebook, portable computer",
            "phone, mobile, smartphone, cell",
            "tv, television, monitor, display"
          ]
        }
      },
      "analyzer": {
        "product_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "product_synonyms"]
        }
      }
    }
  }
}'
```

## Multi-fields: Different Analyzers for the Same Field

Index a field multiple ways for different search strategies:

```bash
curl -X PUT "http://localhost:9200/articles" \
  -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "keyword": {
            "type": "keyword"
          },
          "autocomplete": {
            "type": "text",
            "analyzer": "autocomplete"
          },
          "english": {
            "type": "text",
            "analyzer": "english"
          }
        }
      }
    }
  }
}'
```

Now you can search:
- `title` — full-text search with standard analyzer
- `title.keyword` — exact match, aggregations, sorting
- `title.autocomplete` — typeahead suggestions
- `title.english` — language-aware search with stemming

## Field Types and Analysis

| Field Type | Analyzed? | Use Case |
|------------|-----------|----------|
| `text` | Yes | Full-text search |
| `keyword` | No | Exact match, aggregations, sorting |
| `integer`, `long` | No | Numeric range queries |
| `date` | No | Date range queries |
| `boolean` | No | Filters |
| `ip` | No | IP range queries |

## Common Errors

### Analyzer Not Found

**Error:**

```json
{
  "type": "mapper_parsing_exception",
  "reason": "analyzer [autocomplete_analyzer] has not been defined in the mapping"
}
```

**Cause:** The custom analyzer is referenced in mappings but not defined in settings.

**Fix:** Define the analyzer in the `settings.analysis` block of the index:

```bash
curl -X PUT "http://localhost:9200/my-index" \
  -H 'Content-Type: application/json' -d'
{
  "settings": {
    "analysis": {
      "analyzer": {
        "autocomplete_analyzer": {
          "type": "custom",
          "tokenizer": "autocomplete_tokenizer",
          "filter": ["lowercase"]
        }
      },
      "tokenizer": {
        "autocomplete_tokenizer": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 10,
          "token_chars": ["letter", "digit"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "autocomplete_analyzer"
      }
    }
  }
}'
```

**Key rule:** Custom analyzers must be defined in `settings` at index creation time. You cannot add them to an existing index without closing it first.

## Lab: Build and Test Analyzers

1. Create an index with a custom autocomplete analyzer
2. Test the analyzer with the `_analyze` API
3. Index sample documents
4. Search with partial queries and verify autocomplete behavior
5. Compare results between `standard` and `english` analyzers
6. Create a synonym analyzer and test synonym expansion

## Next Steps

- [TLS & Certificate Setup](/learn/elk/security/01-tls-setup) — secure your cluster
- [Cluster Monitoring](/learn/elk/monitoring/01-cluster-monitoring) — monitor index performance
