---
title: S3 to Elasticsearch Pipeline
description: Ingest data from AWS S3 to Elasticsearch — S3 input configuration, multi-format handling, IAM authentication, SQS notifications, dead letter queue, and performance tuning.
duration: "45m"
readingTime: "25m"
labTime: "20m"
github: "https://github.com/JinnaBalu/infinite-containers/tree/main/elastic-stack/s3-to-es"
order: 3
---

## Project Structure

```tree
s3-to-es/
├── docker-compose.yml
├── .env
└── pipeline/
    └── logstash.conf
```

## Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   AWS S3     │───▶│   Logstash   │───▶│Elasticsearch │───▶│   Kibana     │
│              │    │  S3 Plugin   │    │              │    │              │
│  logs/       │    │  Parse &     │    │  s3-logs-*   │    │  Dashboards  │
│  data/       │    │  Transform   │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

## Prerequisites

- AWS credentials with S3 read access
- Elasticsearch cluster running
- Logstash with S3 input plugin (`logstash-input-s3`)

## Download Configuration

```bash
mkdir ~/s3-pipeline && cd ~/s3-pipeline

# Download complete stack
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/s3-to-es/docker-compose.yml

# Download Logstash pipeline
mkdir -p pipeline
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/s3-to-es/pipeline/s3-es.conf -O pipeline/s3-es.conf

# Download Logstash config
mkdir -p config
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/s3-to-es/config/logstash/logstash.yml -O config/logstash.yml
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/s3-to-es/config/pipelines.yml -O config/pipelines.yml
```

## Authentication

### Method 1: Access Keys (Development)

```ruby
input {
  s3 {
    bucket => "my-data-bucket"
    access_key_id => "${AWS_ACCESS_KEY_ID}"
    secret_access_key => "${AWS_SECRET_ACCESS_KEY}"
    region => "us-east-1"
  }
}
```

### Method 2: IAM Role (Production — Recommended)

When running on EC2 or ECS with an attached IAM role, omit credentials entirely:

```ruby
input {
  s3 {
    bucket => "my-data-bucket"
    region => "us-east-1"
    # No access_key_id or secret_access_key needed
    # Logstash uses the instance's IAM role automatically
  }
}
```

Required IAM policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-data-bucket",
        "arn:aws:s3:::my-data-bucket/*"
      ]
    }
  ]
}
```

### Method 3: STS Assume Role

For cross-account access:

```ruby
input {
  s3 {
    bucket => "cross-account-bucket"
    region => "us-east-1"
    role_arn => "arn:aws:iam::123456789012:role/LogstashS3Access"
    role_session_name => "logstash-session"
  }
}
```

## Basic Pipeline: JSON Data

```ruby
input {
  s3 {
    bucket => "my-data-bucket"
    prefix => "logs/2024/"
    region => "us-east-1"
    access_key_id => "${AWS_ACCESS_KEY_ID}"
    secret_access_key => "${AWS_SECRET_ACCESS_KEY}"
    codec => "json_lines"
    sincedb_path => "/var/lib/logstash/sincedb_s3"
  }
}

filter {
  date {
    match => ["timestamp", "ISO8601"]
    target => "@timestamp"
  }

  mutate {
    remove_field => ["@version", "message"]
  }
}

output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "s3-logs-%{+YYYY.MM.dd}"
  }
}
```

## S3 Input Options Reference

| Option | Default | Description |
|--------|---------|-------------|
| `bucket` | — | S3 bucket name (required) |
| `prefix` | `""` | Only process objects with this key prefix |
| `region` | `"us-east-1"` | AWS region |
| `codec` | `"plain"` | How to decode file content (`json_lines`, `json`, `plain`) |
| `sincedb_path` | — | Track processed files to avoid re-processing |
| `backup_to_bucket` | — | Move processed files to another bucket |
| `backup_add_prefix` | — | Add prefix to backed-up files |
| `delete` | `false` | Delete files from S3 after processing |
| `interval` | `60` | Seconds between polling for new files |
| `exclude_pattern` | — | Regex to exclude files |

## Multi-Format Handling

### JSON Lines (one JSON object per line)

```ruby
input {
  s3 {
    bucket => "data-lake"
    prefix => "json/"
    codec => "json_lines"
    region => "us-east-1"
  }
}
```

### CSV Files

```ruby
input {
  s3 {
    bucket => "data-lake"
    prefix => "csv/"
    codec => "plain"
    region => "us-east-1"
  }
}

filter {
  csv {
    columns => ["timestamp", "user_id", "action", "status", "duration_ms"]
    separator => ","
    skip_header => true
    convert => {
      "duration_ms" => "integer"
      "status" => "integer"
    }
  }

  date {
    match => ["timestamp", "ISO8601", "yyyy-MM-dd HH:mm:ss"]
    target => "@timestamp"
  }

  mutate {
    remove_field => ["message", "timestamp"]
  }
}
```

### Plain Text (Log Files)

```ruby
input {
  s3 {
    bucket => "data-lake"
    prefix => "nginx-logs/"
    codec => "plain"
    region => "us-east-1"
  }
}

filter {
  grok {
    match => {
      "message" => '%{IPORHOST:client_ip} - %{DATA:remote_user} \[%{HTTPDATE:timestamp}\] "%{WORD:method} %{URIPATHPARAM:request_uri} HTTP/%{NUMBER:http_version}" %{NUMBER:status:int} %{NUMBER:body_bytes:int} "%{DATA:referrer}" "%{DATA:user_agent}"'
    }
  }

  date {
    match => ["timestamp", "dd/MMM/yyyy:HH:mm:ss Z"]
    target => "@timestamp"
  }

  geoip {
    source => "client_ip"
    target => "geoip"
  }

  mutate {
    remove_field => ["message", "timestamp"]
  }
}
```

### Compressed Files (gzip)

The S3 input plugin automatically detects and decompresses `.gz` files. No extra configuration needed.

## SQS Event Notification (Real-Time Ingestion)

Instead of polling S3, use SQS notifications for near-real-time processing:

### Step 1: Configure S3 Event Notification

In the AWS Console, configure the S3 bucket to send `s3:ObjectCreated:*` events to an SQS queue.

### Step 2: Use SQS Input

```ruby
input {
  sqs {
    queue => "s3-log-notifications"
    region => "us-east-1"
    codec => "json"
  }
}

filter {
  # SQS message contains S3 event details
  # Extract bucket and key, then fetch the object
  ruby {
    code => '
      records = event.get("[Records]")
      if records
        record = records[0]
        event.set("s3_bucket", record["s3"]["bucket"]["name"])
        event.set("s3_key", record["s3"]["object"]["key"])
      end
    '
  }
}
```

This approach is lower latency and more efficient than polling.

## Dead Letter Queue (DLQ)

Handle failed events gracefully instead of losing them:

### Enable DLQ in logstash.yml

```yaml
dead_letter_queue.enable: true
dead_letter_queue.max_bytes: 1024mb
```

### Process DLQ Events

Create a separate pipeline to reprocess failed events:

```ruby
# dlq-pipeline.conf
input {
  dead_letter_queue {
    path => "/usr/share/logstash/data/dead_letter_queue"
    commit_offsets => true
    pipeline_id => "s3-pipeline"
  }
}

filter {
  mutate {
    add_field => { "dlq_reprocessed" => "true" }
  }
}

output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "dlq-events-%{+YYYY.MM.dd}"
  }
}
```

## Index Template for S3 Data

Create an optimized template before ingestion:

```bash
curl -X PUT "localhost:9200/_index_template/s3-logs" \
  -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["s3-logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "refresh_interval": "30s",
      "index.lifecycle.name": "logs-policy"
    },
    "mappings": {
      "properties": {
        "client_ip": { "type": "ip" },
        "status": { "type": "integer" },
        "body_bytes": { "type": "long" },
        "method": { "type": "keyword" },
        "request_uri": { "type": "text", "fields": { "keyword": { "type": "keyword" }}},
        "user_agent": { "type": "text", "fields": { "keyword": { "type": "keyword" }}},
        "geoip": {
          "properties": {
            "location": { "type": "geo_point" },
            "country_name": { "type": "keyword" }
          }
        }
      }
    }
  }
}'
```

## Performance Tuning

### Pipeline Workers and Batch Size

```yaml
# logstash.yml
pipeline.workers: 4          # Match CPU cores
pipeline.batch.size: 500     # Larger batches for bulk S3 ingest
pipeline.batch.delay: 50     # ms to wait for batch fill
```

### S3 Polling Interval

```ruby
input {
  s3 {
    bucket => "my-bucket"
    interval => 30              # Poll every 30 seconds (default 60)
    sincedb_path => "/data/sincedb"  # Track processed files
  }
}
```

### Elasticsearch Bulk Settings

```ruby
output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "s3-logs-%{+YYYY.MM.dd}"
    flush_size => 5000          # Documents per bulk request
    idle_flush_time => 1        # Seconds before flushing incomplete batch
  }
}
```

### File Processing Strategy

| Strategy | Setting | Use Case |
|----------|---------|----------|
| Delete after processing | `delete => true` | One-time ingest |
| Move to backup bucket | `backup_to_bucket => "processed"` | Audit trail |
| Track with sincedb | `sincedb_path => "/data/sincedb"` | Reprocessing safety |

## Environment Variables

Create `.env` file for Docker Compose:

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET=my-data-bucket
ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

## Start and Monitor

```bash
# Start the pipeline
docker compose up -d

# Check Logstash logs
docker logs -f logstash

# Monitor index growth
curl -s "localhost:9200/_cat/indices/s3-logs-*?v&s=index"

# Check document count
curl -s "localhost:9200/s3-logs-*/_count?pretty"

# Check pipeline stats
curl -s "localhost:9600/_node/stats/pipelines?pretty"
```

## Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| No files processed | Wrong prefix or region | Verify bucket, prefix, and region |
| Duplicate documents | sincedb lost or reset | Use persistent volume for sincedb |
| Access denied | Missing IAM permissions | Add `s3:GetObject` and `s3:ListBucket` |
| Slow ingestion | Large files, single worker | Increase `pipeline.workers` and `batch.size` |
| OOM errors | Very large files | Use `codec => json_lines` instead of `json` |

## Lab: Build an S3 Ingestion Pipeline

1. Create an S3 bucket and upload sample JSON files
2. Configure the Logstash S3 pipeline with access keys
3. Start the stack with Docker Compose
4. Verify data appears in Elasticsearch
5. Try ingesting CSV files with column mappings
6. Set up sincedb tracking and verify no duplicates on restart
7. Monitor pipeline stats with the Logstash API

## Next Steps

- [Data Migration](./04-data-migration) — migrate data between Elasticsearch clusters
- [Logstash Introduction](./01-introduction) — pipeline architecture reference
