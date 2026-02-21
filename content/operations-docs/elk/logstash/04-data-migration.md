---
title: Cluster-to-Cluster Data Migration
description: Migrate data between Elasticsearch clusters using Logstash — full index migration, field filtering, scheduled sync, and Kafka pipelines.
duration: "30m"
readingTime: "15m"
labTime: "15m"
order: 4
---

## Project Structure

```tree
data-migration-logstash/
├── docker-compose.yml
├── .env
└── pipeline/
    └── logstash.conf
```

## Migration Approaches

| Method | Best For | Complexity |
|--------|----------|------------|
| **Logstash** | Filtered/transformed migration | Medium |
| **Reindex API** | Same-version, simple copy | Low |
| **Remote Reindex** | Cross-cluster, basic copy | Low |
| **Snapshot/Restore** | Full cluster backup/restore | Low |

This lesson focuses on Logstash for its flexibility. See [Reindexing](/learn/elk/production/01-reindexing) for the API approach.

## Logstash Elasticsearch-to-Elasticsearch Pipeline

### Docker Compose Setup

Download the migration compose file:

```bash
wget https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/main/elastic-stack/docker-compose-data-migration.yml -O docker-compose.yml
```

### Migration Pipeline

Create `pipeline/migration.conf`:

```ruby
input {
  elasticsearch {
    hosts => ["${SOURCE_ES_HOST}:9200"]
    index => "${SOURCE_INDEX}"
    size => 1000
    scroll => "1m"
    docinfo => true
    docinfo_fields => ["_index", "_id"]
  }
}

filter {
  # Remove PII fields during migration
  mutate {
    remove_field => [
      "alternateEmails",
      "alternatePhoneNumbers",
      "email",
      "@version",
      "@timestamp"
    ]
  }
}

output {
  elasticsearch {
    hosts => ["${DEST_ES_HOST}:9200"]
    index => "${DEST_INDEX}"
    document_id => "%{[@metadata][_id]}"
    workers => 1
  }

  # Debug output (remove in production)
  stdout {
    codec => dots
  }
}
```

### Environment Variables

```bash
# .env file
SOURCE_ES_HOST=source-elasticsearch
SOURCE_INDEX=my-data-*
DEST_ES_HOST=dest-elasticsearch
DEST_INDEX=migrated-data
```

### Run the Migration

```bash
docker compose up -d
```

## Scheduled Sync

For continuous synchronization between clusters, add a cron schedule:

```ruby
input {
  elasticsearch {
    hosts => ["${SOURCE_ES_HOST}:9200"]
    index => "${SOURCE_INDEX}"
    size => 1000
    scroll => "1m"
    schedule => "*/5 * * * *"
    docinfo => true
    docinfo_fields => ["_index", "_id"]
    query => '{ "query": { "range": { "updated_at": { "gte": "now-6m" }}}}'
  }
}
```

This runs every 5 minutes and only fetches documents updated in the last 6 minutes (1-minute overlap for safety).

## Migrating with Authentication

When both clusters have security enabled:

```ruby
input {
  elasticsearch {
    hosts => ["https://source:9200"]
    index => "production-logs-*"
    user => "migration_reader"
    password => "${SOURCE_PASSWORD}"
    ssl_certificate_authorities => ["/certs/source-ca.crt"]
    size => 1000
    scroll => "5m"
  }
}

output {
  elasticsearch {
    hosts => ["https://dest:9200"]
    index => "imported-logs-%{+YYYY.MM.dd}"
    user => "migration_writer"
    password => "${DEST_PASSWORD}"
    ssl_certificate_authorities => ["/certs/dest-ca.crt"]
  }
}
```

## Multi-Index Migration

Migrate multiple indices while preserving their names:

```ruby
input {
  elasticsearch {
    hosts => ["source:9200"]
    index => "*"
    size => 1000
    scroll => "5m"
    docinfo => true
    docinfo_fields => ["_index", "_id"]
  }
}

filter {
  # Skip system indices
  if [@metadata][_index] =~ /^\..*/ {
    drop {}
  }
}

output {
  elasticsearch {
    hosts => ["dest:9200"]
    index => "%{[@metadata][_index]}"
    document_id => "%{[@metadata][_id]}"
  }
}
```

## Data Transformation During Migration

### Rename Fields

```ruby
filter {
  mutate {
    rename => {
      "old_field_name" => "new_field_name"
      "user.email" => "contact_email"
    }
  }
}
```

### Add Fields

```ruby
filter {
  mutate {
    add_field => {
      "migrated_from" => "production-cluster"
      "migration_date" => "%{+YYYY-MM-dd}"
    }
  }
}
```

### Filter by Date Range

```ruby
input {
  elasticsearch {
    hosts => ["source:9200"]
    index => "logs-*"
    query => '{
      "query": {
        "range": {
          "@timestamp": {
            "gte": "2024-01-01",
            "lte": "2024-12-31"
          }
        }
      }
    }'
  }
}
```

## Kafka-to-Elasticsearch Pipeline

For event-driven architectures, Logstash can consume from Kafka:

```ruby
input {
  kafka {
    bootstrap_servers => "kafka-broker:9092"
    topics => ["application-events"]
    group_id => "es-consumer"
    codec => "json"
    consumer_threads => 3
    auto_offset_reset => "earliest"
  }
}

filter {
  date {
    match => ["timestamp", "ISO8601"]
    target => "@timestamp"
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "events-%{+YYYY.MM.dd}"
    user => "logstash_writer"
    password => "${ES_PASSWORD}"
  }
}
```

## Migration Performance Tuning

### Pipeline Settings

In `logstash.yml` or `pipelines.yml`:

```yaml
- pipeline.id: migration
  path.config: "/pipeline/migration.conf"
  pipeline.workers: 3
  pipeline.batch.size: 1000
  pipeline.batch.delay: 50
```

### Elasticsearch Input Tuning

| Setting | Default | Recommended | Effect |
|---------|---------|-------------|--------|
| `size` | 1000 | 5000 | Documents per scroll batch |
| `scroll` | 1m | 5m | Scroll context timeout |
| `slices` | 1 | auto | Parallel scroll slices |

### Elasticsearch Output Tuning

| Setting | Default | Recommended | Effect |
|---------|---------|-------------|--------|
| `workers` | 1 | 2-4 | Parallel output workers |
| `flush_size` | 500 | 1000 | Bulk request size |
| `idle_flush_time` | 1s | 5s | Flush interval |

## Monitoring Migration Progress

### Check Logstash Pipeline Stats

```bash
curl -s "http://logstash:9600/_node/stats/pipelines?pretty"
```

### Check Destination Index Count

```bash
# Compare source and destination counts
echo "Source:"
curl -s "http://source:9200/my-index/_count?pretty"

echo "Destination:"
curl -s "http://dest:9200/migrated-index/_count?pretty"
```

## Migration Checklist

| Step | Action |
|------|--------|
| 1 | Verify source cluster health |
| 2 | Check destination cluster has enough disk space |
| 3 | Create index template on destination (mappings + settings) |
| 4 | Test pipeline with a small index first |
| 5 | Run full migration |
| 6 | Compare document counts |
| 7 | Spot-check sample documents |
| 8 | Update application connection strings |
| 9 | Monitor destination cluster performance |

## Lab: Migrate Data Between Clusters

1. Download the migration compose file
2. Set up source and destination clusters
3. Create a test index with sample data on the source
4. Configure the Logstash migration pipeline
5. Run the migration and verify document counts match
6. Add a filter to remove sensitive fields
7. Re-run and verify the fields are stripped

## Next Steps

- [Filebeat](/learn/elk/beats/01-filebeat) — collect logs from servers
- [Backup & Restore](/learn/elk/production/03-backup-restore) — snapshot-based data protection
