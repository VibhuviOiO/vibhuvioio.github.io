---
title: Slow Logs
description: Configure and analyze Elasticsearch search and index slow logs — thresholds, log format, query optimization, and production best practices.
duration: "25m"
readingTime: "15m"
labTime: "10m"
order: 2
---

## Understanding Search Phases

Every search has two phases:

```
Client Request → Query Phase → Fetch Phase → Response
```

| Phase | What Happens | Slow When |
|-------|-------------|-----------|
| **Query** | Collect matching document IDs from each shard | Complex queries, too many shards, large dataset |
| **Fetch** | Retrieve full documents by their IDs | Large documents, many fields, highlights |

Slow logs track **each phase separately**, so you can pinpoint where time is spent.

## Configuring Search Slow Logs

### Per-Index Settings

```bash
curl -X PUT "http://localhost:9200/my-index/_settings" \
  -H 'Content-Type: application/json' -d'
{
  "index.search.slowlog.threshold.query.warn": "10s",
  "index.search.slowlog.threshold.query.info": "5s",
  "index.search.slowlog.threshold.query.debug": "2s",
  "index.search.slowlog.threshold.query.trace": "500ms",

  "index.search.slowlog.threshold.fetch.warn": "1s",
  "index.search.slowlog.threshold.fetch.info": "800ms",
  "index.search.slowlog.threshold.fetch.debug": "500ms",
  "index.search.slowlog.threshold.fetch.trace": "200ms",

  "index.search.slowlog.level": "info"
}'
```

### In elasticsearch.yml (Global Defaults)

```yaml
index.search.slowlog.threshold.query.warn: 10s
index.search.slowlog.threshold.query.info: 5s
index.search.slowlog.threshold.query.debug: 2s
index.search.slowlog.threshold.query.trace: 500ms

index.search.slowlog.threshold.fetch.warn: 1s
index.search.slowlog.threshold.fetch.info: 800ms
index.search.slowlog.threshold.fetch.debug: 500ms
index.search.slowlog.threshold.fetch.trace: 200ms
```

### Threshold Recommendations

| Environment | Query Info | Query Warn | Fetch Info | Fetch Warn |
|-------------|-----------|------------|-----------|------------|
| Development | 1s | 5s | 500ms | 2s |
| Production | 5s | 10s | 800ms | 1s |
| High-performance | 500ms | 2s | 200ms | 500ms |

## Configuring Index Slow Logs

Track slow indexing operations:

```bash
curl -X PUT "http://localhost:9200/my-index/_settings" \
  -H 'Content-Type: application/json' -d'
{
  "index.indexing.slowlog.threshold.index.warn": "10s",
  "index.indexing.slowlog.threshold.index.info": "5s",
  "index.indexing.slowlog.threshold.index.debug": "2s",
  "index.indexing.slowlog.threshold.index.trace": "500ms",
  "index.indexing.slowlog.source": "1000",
  "index.indexing.slowlog.level": "info"
}'
```

The `source` setting controls how many characters of the document source to log. Set to `0` to disable, `1000` for a useful snippet, or `true` for the full document.

## Slow Log Format

### Search Slow Log Entry

```
[2024-01-15T10:23:45,123][WARN][index.search.slowlog.query] [node-1]
  [my-index][0] took[12.3s], took_millis[12345],
  total_hits[1543], types[], stats[],
  search_type[QUERY_THEN_FETCH],
  total_shards[5], source[{"query":{"match":{"message":"error"}}}]
```

### Breaking Down the Log Entry

| Field | Meaning |
|-------|---------|
| `took[12.3s]` | Total time for this shard |
| `took_millis[12345]` | Same, in milliseconds |
| `total_hits[1543]` | Number of matching documents |
| `total_shards[5]` | Shards involved |
| `source[...]` | The actual query (truncated) |

### Index Slow Log Entry

```
[2024-01-15T10:25:00,456][WARN][index.indexing.slowlog.index] [node-1]
  [my-index][2] took[5.2s], took_millis[5200],
  type[_doc], id[abc123],
  routing[], source[{"field":"value"...}]
```

## Where to Find Slow Logs

### Docker Container

```bash
# Inside the container
docker exec -it elasticsearch cat /usr/share/elasticsearch/logs/*_index_search_slowlog.log

# Or tail it
docker exec -it elasticsearch tail -f /usr/share/elasticsearch/logs/*_index_search_slowlog.log
```

### Log4j2 Configuration

Customize slow log output in `log4j2.properties`:

```properties
# Search slow logs
appender.index_search_slowlog_rolling.type = RollingFile
appender.index_search_slowlog_rolling.name = index_search_slowlog_rolling
appender.index_search_slowlog_rolling.fileName = ${sys:es.logs.base_path}/${sys:es.logs.cluster_name}_index_search_slowlog.log
appender.index_search_slowlog_rolling.layout.type = PatternLayout
appender.index_search_slowlog_rolling.layout.pattern = [%d{ISO8601}][%-5p][%-25c{1.}] [%node_name]%marker %m%n
appender.index_search_slowlog_rolling.filePattern = ${sys:es.logs.base_path}/${sys:es.logs.cluster_name}_index_search_slowlog-%i.log.gz
appender.index_search_slowlog_rolling.policies.type = Policies
appender.index_search_slowlog_rolling.policies.size.type = SizeBasedTriggeringPolicy
appender.index_search_slowlog_rolling.policies.size.size = 1GB
appender.index_search_slowlog_rolling.strategy.type = DefaultRolloverStrategy
appender.index_search_slowlog_rolling.strategy.max = 4

logger.index_search_slowlog_rolling.name = index.search.slowlog
logger.index_search_slowlog_rolling.level = trace
logger.index_search_slowlog_rolling.appenderRef.index_search_slowlog_rolling.ref = index_search_slowlog_rolling
logger.index_search_slowlog_rolling.additivity = false
```

## Analyzing Slow Queries

### Step 1: Identify the Query

Extract the `source` field from the slow log entry.

### Step 2: Profile the Query

Use the Profile API to understand where time is spent:

```bash
curl -X POST "http://localhost:9200/my-index/_search?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "profile": true,
  "query": {
    "match": {
      "message": "error"
    }
  }
}'
```

### Step 3: Common Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| Wildcard queries on large fields | `*error*` scans everything | Use `match` instead of `wildcard` |
| Too many shards per query | Queries fan out to all shards | Reduce shard count or use routing |
| Script queries | Painless scripts in query context | Pre-compute values at index time |
| Deep pagination | `from: 10000, size: 10` | Use `search_after` or scroll |
| Large aggregations | High-cardinality terms agg | Use `composite` aggregation |
| Missing index on filtered field | Full scan on keyword field | Add the field to mappings |
| Regex queries | `"field": "/pat.*tern/"` | Use `match_phrase_prefix` if possible |

### Step 4: Use Explain API

Understand why a document matched (or didn't):

```bash
curl -X POST "http://localhost:9200/my-index/_explain/doc-id?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "message": "error"
    }
  }
}'
```

## Apply Slow Logs to All New Indices

Use an index template to set slow log thresholds for all new indices:

```bash
curl -X PUT "http://localhost:9200/_index_template/slow-log-defaults" \
  -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["*"],
  "priority": 0,
  "template": {
    "settings": {
      "index.search.slowlog.threshold.query.warn": "10s",
      "index.search.slowlog.threshold.query.info": "5s",
      "index.search.slowlog.threshold.fetch.warn": "1s",
      "index.search.slowlog.threshold.fetch.info": "800ms",
      "index.indexing.slowlog.threshold.index.warn": "10s",
      "index.indexing.slowlog.threshold.index.info": "5s"
    }
  }
}'
```

## Shipping Slow Logs to Elasticsearch

Use Filebeat to send slow logs back into Elasticsearch for Kibana dashboards:

```yaml
# filebeat.yml
filebeat.inputs:
  - type: log
    paths:
      - /var/log/elasticsearch/*_index_search_slowlog.log
      - /var/log/elasticsearch/*_index_indexing_slowlog.log
    fields:
      log_type: elasticsearch_slowlog
    fields_under_root: true
    multiline:
      pattern: '^\['
      negate: true
      match: after
```

Now you can build Kibana dashboards to visualize slow query trends over time.

## Lab: Configure and Analyze Slow Logs

1. Create a test index with 1000 documents
2. Configure search slow log thresholds at trace level (500ms)
3. Run various queries (match, wildcard, regex)
4. Check the slow log file for entries
5. Use the Profile API on a slow query
6. Apply a fix and verify the query is faster

## Next Steps

- [Nginx Log Analysis](/learn/elk/use-cases/nginx-log-analysis) — real-world log analysis use case
- [Backup & Restore](/learn/elk/production/03-backup-restore) — protect your data and configs
