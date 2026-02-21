---
title: Logstash Introduction
description: Logstash pipeline architecture — inputs, filters, outputs, running with Docker, plus production pipelines for GDPR compliance, syslog, Kafka, PII masking, and database ETL.
duration: "60m"
readingTime: "35m"
labTime: "25m"
github: "https://github.com/JinnaBalu/infinite-containers/tree/main/elastic-stack/logstash-pipeline-list"
order: 1
---

## Project Structure

```tree
logstash-pipeline-list/
├── docker-compose.yml
├── .env
└── pipeline/
    └── logstash.conf
```

## Pipeline Architecture

Every Logstash pipeline has three stages:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      Input      │───▶│     Filter      │───▶│     Output      │
│                 │    │                 │    │                 │
│  Where data     │    │  Transform,     │    │  Where data     │
│  comes from     │    │  enrich, parse  │    │  goes to        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
     File, Beats,          Grok, Mutate,         Elasticsearch,
     Kafka, JDBC,          Date, GeoIP,          Kafka, File,
     HTTP, Syslog          JSON, KV              S3, Stdout
```

## Configuration Structure

```ruby
input {
  # One or more input plugins
}

filter {
  # Zero or more filter plugins (optional but recommended)
}

output {
  # One or more output plugins
}
```

## Input Plugins

### File Input

Read log files with automatic position tracking:

```ruby
input {
  file {
    path => "/var/log/nginx/access.log"
    start_position => "beginning"
    sincedb_path => "/var/lib/logstash/sincedb_nginx"
    codec => "plain"
  }
}
```

### Beats Input

Receive data from Filebeat, Metricbeat, and other Beats:

```ruby
input {
  beats {
    port => 5044
    ssl => true
    ssl_certificate => "/etc/logstash/certs/logstash.crt"
    ssl_key => "/etc/logstash/certs/logstash.key"
  }
}
```

### JDBC Input (Database)

Pull data from any database with a JDBC driver:

```ruby
input {
  jdbc {
    jdbc_driver_class => "org.postgresql.Driver"
    jdbc_connection_string => "jdbc:postgresql://db:5432/myapp"
    jdbc_user => "user"
    jdbc_password => "password"
    schedule => "*/5 * * * *"
    statement => "SELECT * FROM orders WHERE updated_at > :sql_last_value"
    use_column_value => true
    tracking_column => "updated_at"
  }
}
```

### Kafka Input

Consume messages from Kafka topics:

```ruby
input {
  kafka {
    bootstrap_servers => "kafka:9092"
    topics => ["app-logs", "metrics"]
    group_id => "logstash_consumer"
    client_id => "logstash_client"
    auto_offset_reset => "earliest"
    codec => "json"
    decorate_events => true
  }
}
```

### Syslog Input (Multi-Protocol)

Accept syslog over UDP, TCP, and HTTP simultaneously:

```ruby
input {
  udp {
    port => "${INPUT_UDP_PORT}"
    type => syslog
    codec => json
  }
  tcp {
    port => "${INPUT_TCP_PORT}"
    type => syslog
    codec => json_lines
  }
  http {
    port => "${INPUT_HTTP_PORT}"
    codec => "json"
  }
}
```

## Filter Plugins

### Grok — Pattern Matching

Parse unstructured log lines into structured fields:

```ruby
filter {
  grok {
    match => { "message" => "%{COMBINEDAPACHELOG}" }
  }
}
```

Common built-in patterns:

| Pattern | Matches | Example |
|---------|---------|---------|
| `%{IP}` | IP address | `192.168.1.1` |
| `%{TIMESTAMP_ISO8601}` | ISO timestamp | `2024-01-15T10:23:45` |
| `%{LOGLEVEL}` | Log level | `ERROR` |
| `%{WORD}` | Single word | `GET` |
| `%{GREEDYDATA}` | Everything | Any text |
| `%{NUMBER}` | Numeric value | `200` |
| `%{COMBINEDAPACHELOG}` | Full Apache/Nginx log | Full log line |

### JSON — Parse JSON Messages

```ruby
filter {
  json {
    source => "message"
    target => "parsed"
  }
}
```

### Date — Timestamp Parsing

```ruby
filter {
  date {
    match => ["timestamp", "dd/MMM/yyyy:HH:mm:ss Z", "ISO8601"]
    target => "@timestamp"
    timezone => "UTC"
  }
}
```

### Mutate — Field Operations

```ruby
filter {
  mutate {
    # Rename fields
    rename => { "hostname" => "host_name" }
    # Remove fields
    remove_field => ["message", "@version", "agent"]
    # Convert types
    convert => { "status_code" => "integer", "bytes" => "long" }
    # Add fields
    add_field => { "environment" => "production" }
    # Lowercase
    lowercase => ["action"]
  }
}
```

### KV — Key-Value Parsing

Parse `key=value` pairs from log messages:

```ruby
filter {
  kv {
    source => "message"
    field_split_pattern => ", "
    prefix => "metric_"
  }
}
```

### GeoIP — IP Geolocation

```ruby
filter {
  geoip {
    source => "client_ip"
    target => "geoip"
  }
}
```

### Useragent — Browser Detection

```ruby
filter {
  useragent {
    source => "user_agent"
    target => "ua"
  }
}
```

## Output Plugins

### Elasticsearch

```ruby
output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "logs-%{+YYYY.MM.dd}"
    user => "elastic"
    password => "${ES_PASSWORD}"
  }
}
```

### Kafka

```ruby
output {
  kafka {
    bootstrap_servers => "kafka:9092"
    codec => plain { format => "%{message}" }
    topic_id => "processed-logs"
  }
}
```

### Conditional Output

Route events to different destinations based on content:

```ruby
output {
  if [logger_name] =~ "metrics" {
    elasticsearch {
      hosts => ["elasticsearch:9200"]
      index => "metrics-%{+YYYY.MM.dd}"
    }
  } else {
    elasticsearch {
      hosts => ["elasticsearch:9200"]
      index => "logs-%{+YYYY.MM.dd}"
    }
  }

  # Debug output (controlled by environment variable)
  if [@metadata][LOGSTASH_DEBUG] == "true" {
    stdout { codec => rubydebug }
  }
}
```

### File Output

```ruby
output {
  file {
    path => "/output/processed-%{+YYYY-MM-dd}.json"
    codec => json_lines
  }
}
```

## Running Logstash

### Command Line

```bash
# Run with config file
logstash -f /etc/logstash/conf.d/my-pipeline.conf

# Test configuration syntax
logstash -f my-pipeline.conf --config.test_and_exit

# Auto-reload on config changes
logstash -f my-pipeline.conf --config.reload.automatic
```

### Docker Compose

```yaml
services:
  logstash:
    image: docker.elastic.co/logstash/logstash:8.12.0
    volumes:
      - ./pipeline/:/usr/share/logstash/pipeline/
      - ./logstash.yml:/usr/share/logstash/config/logstash.yml
    ports:
      - "5044:5044"
      - "9600:9600"
    environment:
      LS_JAVA_OPTS: "-Xms512m -Xmx512m"
      ELASTICSEARCH_HOST: elasticsearch
      ELASTICSEARCH_PORT: 9200
    depends_on:
      - elasticsearch
```

### Multiple Pipelines

Run multiple pipelines in a single Logstash instance with `pipelines.yml`:

```yaml
# config/pipelines.yml
- pipeline.id: syslog
  path.config: "/usr/share/logstash/pipeline/syslog.conf"
  pipeline.workers: 2

- pipeline.id: kafka
  path.config: "/usr/share/logstash/pipeline/kafka.conf"
  pipeline.workers: 4

- pipeline.id: gdpr
  path.config: "/usr/share/logstash/pipeline/gdpr.conf"
  pipeline.workers: 1
```

---

## Production Pipeline: Syslog with Metrics

A complete syslog pipeline that separates metrics from application logs, parses key-value metrics, and routes to different indices.

```ruby
input {
  udp {
    port => "${INPUT_UDP_PORT}"
    type => syslog
    codec => json
  }
  tcp {
    port => "${INPUT_TCP_PORT}"
    type => syslog
    codec => json_lines
  }
  http {
    port => "${INPUT_HTTP_PORT}"
    codec => "json"
  }
}

filter {
  # Parse metrics from key-value format
  if [logger_name] =~ "metrics" {
    kv {
      source => "message"
      field_split_pattern => ", "
      prefix => "metric_"
    }
    mutate {
      convert => {
        "metric_value" => "float"
        "metric_count" => "integer"
        "metric_min" => "float"
        "metric_max" => "float"
        "metric_mean" => "float"
        "metric_stddev" => "float"
        "metric_median" => "float"
        "metric_p75" => "float"
        "metric_p95" => "float"
        "metric_p99" => "float"
        "metric_mean_rate" => "float"
        "metric_m1" => "float"
        "metric_m5" => "float"
        "metric_m15" => "float"
      }
      remove_field => ["message"]
    }
  }

  # Add instance identifier for syslog
  if [type] == "syslog" {
    mutate {
      add_field => { "instance_name" => "%{app_name}-%{host}:%{app_port}" }
    }
  }
}

output {
  if [logger_name] =~ "metrics" {
    elasticsearch {
      hosts => ["${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}"]
      index => "metrics-%{+YYYY.MM.dd}"
    }
  } else {
    elasticsearch {
      hosts => ["${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}"]
      index => "logs-%{+YYYY.MM.dd}"
    }
  }
}
```

**Key design decisions:**
- Three input protocols for maximum compatibility (UDP for speed, TCP for reliability, HTTP for webhooks)
- Metrics parsed with KV filter and type-converted for aggregation in Kibana
- Conditional routing sends metrics and logs to separate indices

---

## Production Pipeline: GDPR Compliance Logs

Parse GDPR audit logs that track user activity, access events, and user management actions. This pipeline handles three different log formats with cascading grok patterns.

```ruby
input {
  file {
    path => ["/var/log/GDPR/myapplication/myapplication_gdpr.log"]
  }
}

filter {
  # Pattern 1: User Activity — actions on objects (data access, modification)
  grok {
    match => { "message" => "%{TIMESTAMP_ISO8601:time} %{LOGLEVEL:loglevel} : action=%{WORD:action} command=%{QS:command} host=%{IPORHOST:host} dest=%{QS:dest} status=%{WORD:status}( result=%{QS:result})?( result_id=%{QS:result_id})? src=%{QS:src} act_id=%{NUMBER:act_id} src_domain=%{IPORHOST:src_domain} user=%{QS:user} object=%{QS:object} object_category=%{QS:object_category} object_id=%{QS:object_id} object_attrs=%{QS:object_attrs}" }
    add_tag => ["User Activity"]
    overwrite => ["host"]
  }

  # Pattern 2: Access — login/logout with duration and response time
  if "_grokparsefailure" in [tags] {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:time} %{LOGLEVEL:loglevel} : action=%{WORD:action} command=%{QS:command} host=%{IPORHOST:host} dest=%{QS:dest} status=%{WORD:status}( result=%{QS:result})?( result_id=%{QS:result_id})? src=%{QS:src} act_id=%{NUMBER:act_id} src_domain=%{IPORHOST:src_domain} user=%{QS:user} duration=%{INT:duration} response_time=%{INT:response_time}" }
      remove_tag => ["_grokparsefailure"]
      add_tag => ["Access"]
      overwrite => ["host"]
    }
  }

  # Pattern 3: User Management — account creation, role changes
  if "_grokparsefailure" in [tags] {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:time} %{LOGLEVEL:loglevel} : action=%{WORD:action} command=%{QS:command} host=%{IPORHOST:host} dest=%{QS:dest} status=%{WORD:status}( result=%{QS:result})?( result_id=%{QS:result_id})? src=%{QS:src} act_id=%{NUMBER:act_id} src_domain=%{IPORHOST:src_domain} user=%{QS:user} src_user=%{QS:src_user} user_attrs=%{QS:user_attrs}" }
      remove_tag => ["_grokparsefailure"]
      add_tag => ["User Management"]
      overwrite => ["host"]
    }
  }

  date {
    match => ["time", "ISO8601"]
    timezone => ["Europe/Copenhagen"]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    user => "elastic"
    password => "changeme"
    index => "gdpr_logs"
    id => "gdpr_pipeline_id"
  }
}
```

**Cascading grok pattern technique:** Try the most specific pattern first. If it fails (`_grokparsefailure`), try the next pattern. Each successful match removes the failure tag and adds a descriptive tag.

**GDPR log categories:**

| Tag | Tracks | Key Fields |
|-----|--------|------------|
| User Activity | Data access, modification, deletion | `object`, `object_category`, `object_id` |
| Access | Login, logout, API calls | `duration`, `response_time` |
| User Management | Account creation, role changes | `src_user`, `user_attrs` |

---

## Production Pipeline: Kafka Multi-Topic

Consume multiple Kafka topics, apply per-topic filtering, and route to dedicated Elasticsearch indices.

```ruby
input {
  kafka {
    bootstrap_servers => "kafka:9092"
    topics => ["orders", "users", "products", "analytics"]
    group_id => "logstash_kafka_group"
    client_id => "kafka_logstash_client"
    auto_offset_reset => "earliest"
    decorate_events => true
    codec => "json"
  }
}

filter {
  # Per-topic field removal (strip PII before indexing)
  if [@metadata][kafka][topic] == "users" {
    mutate {
      remove_field => ["createdBy", "email", "profileURLs"]
    }
  }

  if [@metadata][kafka][topic] == "orders" {
    mutate {
      remove_field => ["createdBy", "email"]
    }
  }

  if [@metadata][kafka][topic] == "products" {
    mutate {
      remove_field => ["accountManagerEmail"]
    }
  }
}

output {
  # Route each topic to its own Elasticsearch index
  if [@metadata][kafka][topic] == "orders" {
    elasticsearch {
      hosts => ["http://elasticsearch:9200"]
      index => "orders"
      document_id => "%{[@metadata][_id]}"
    }
  }

  if [@metadata][kafka][topic] == "users" {
    elasticsearch {
      hosts => ["http://elasticsearch:9200"]
      index => "users"
      document_id => "%{[@metadata][_id]}"
    }
  }

  if [@metadata][kafka][topic] == "products" {
    elasticsearch {
      hosts => ["http://elasticsearch:9200"]
      index => "products"
      document_id => "%{[@metadata][_id]}"
    }
  }

  if [@metadata][kafka][topic] == "analytics" {
    elasticsearch {
      hosts => ["http://elasticsearch:9200"]
      index => "analytics_data"
      document_id => "%{[@metadata][_id]}"
    }
  }
}
```

**Key patterns:**
- `decorate_events => true` adds Kafka metadata (`[@metadata][kafka][topic]`, `[@metadata][kafka][partition]`)
- `document_id` enables upsert behavior — reprocessing won't create duplicates
- Per-topic filters strip sensitive fields before indexing

---

## Production Pipeline: Beats to Kafka

Forward Filebeat data to Kafka for buffering before Elasticsearch:

```ruby
input {
  beats {
    port => "5044"
  }
}

output {
  kafka {
    bootstrap_servers => "kafka:9092"
    codec => plain { format => "%{message}" }
    topic_id => "server_logs"
  }
}
```

This pattern decouples ingestion from processing — Kafka acts as a buffer so spikes don't overwhelm Elasticsearch.

---

## Production Pipeline: PII Masking

Mask personally identifiable information before indexing. This pipeline reads from a PostgreSQL database and redacts emails, names, and IP addresses.

```ruby
input {
  jdbc {
    jdbc_driver_class => "org.postgresql.Driver"
    jdbc_connection_string => "jdbc:postgresql://db:5432/myapp"
    jdbc_user => "user"
    jdbc_password => "password"
    schedule => "* * * * *"
    statement => "SELECT * FROM user_activity"
  }
}

filter {
  # Mask PII fields
  mutate {
    gsub => [
      "email", ".*", "[REDACTED]",
      "name", ".*", "[REDACTED]",
      "ip_address", "\d+\.\d+\.\d+\.\d+", "[REDACTED]"
    ]
  }

  # Normalize action field
  mutate {
    lowercase => ["action"]
  }
}

output {
  elasticsearch {
    hosts => ["https://elasticsearch:9200"]
    index => "user_activity"
    user => "elastic"
    password => "${ES_PASSWORD}"
    ssl => true
    cacert => "/usr/share/logstash/certs/ca.crt"
  }
}
```

**PII masking techniques:**

| Field | Technique | Result |
|-------|-----------|--------|
| Email | Full replacement | `alice@gmail.com` → `[REDACTED]` |
| Name | Full replacement | `Alice` → `[REDACTED]` |
| IP Address | Regex replacement | `192.168.1.101` → `[REDACTED]` |

For partial masking (keep domain visible), use a more targeted regex:

```ruby
mutate {
  gsub => [
    "email", "^[^@]+", "***"
  ]
}
# Result: alice@gmail.com → ***@gmail.com
```

---

## Production Pipeline: Elasticsearch-to-Elasticsearch Migration

Migrate data between clusters using Logstash with scheduled sync:

```ruby
input {
  elasticsearch {
    hosts => ["${SOURCE_ES_HOST_IP}:9200"]
    index => "${SOURCE_INDEX_NAME}"
    size => 1000
    scroll => "1m"
    schedule => "5 * * * *"
  }
}

filter {
  # Strip sensitive fields during migration
  mutate {
    remove_field => ["alternateEmails", "alternatePhoneNumbers", "email"]
  }
}

output {
  elasticsearch {
    hosts => ["${DESTINATION_ES_HOST_IP}:9200"]
    index => "${DESTINATION_INDEX_NAME}"
    workers => 1
  }
}
```

This is covered in detail in the [Data Migration lesson](./04-data-migration).

---

## Pipeline Reference

| Pipeline | Input | Filter | Output | Use Case |
|----------|-------|--------|--------|----------|
| Syslog | UDP, TCP, HTTP | KV, Mutate | ES (metrics/logs) | Application monitoring |
| GDPR | File | Cascading Grok, Date | ES | Compliance audit trail |
| Kafka Multi-Topic | Kafka | Per-topic Mutate | ES (per-topic index) | Event streaming |
| Beats → Kafka | Beats | None | Kafka | Log buffering |
| PII Masking | JDBC (PostgreSQL) | Mutate gsub | ES (TLS) | Data privacy |
| ES Migration | Elasticsearch | Mutate | Elasticsearch | Cluster migration |
| Nginx Logs | File | Grok, GeoIP, UA | ES | Web analytics |
| S3 Ingest | S3 | JSON/Grok | ES | Cloud log processing |

## Performance Tuning

### Pipeline Settings

```yaml
# logstash.yml
pipeline.workers: 4          # Match CPU cores
pipeline.batch.size: 250     # Events per batch
pipeline.batch.delay: 50     # ms to wait for batch fill
```

### JVM Settings

```bash
# jvm.options
-Xms1g
-Xmx1g
# Never set Xms != Xmx — causes GC pauses
```

### Monitoring

```bash
# Check pipeline stats
curl -s "localhost:9600/_node/stats/pipelines?pretty"

# Check JVM stats
curl -s "localhost:9600/_node/stats/jvm?pretty"

# Check hot threads
curl -s "localhost:9600/_node/hot_threads?pretty"
```

## Lab: Build and Test Pipelines

1. Start Elasticsearch and Logstash with Docker Compose
2. Create a simple file → Elasticsearch pipeline
3. Test with `--config.test_and_exit`
4. Ingest sample log data and verify in Kibana
5. Add a grok filter to parse Nginx access logs
6. Create a pipeline with conditional routing (metrics vs logs)
7. Monitor pipeline stats with the Logstash API

## Next Steps

- [MongoDB to Elasticsearch Pipeline](./02-mongodb-pipeline) — database sync pipeline
- [S3 to Elasticsearch](./03-s3-pipeline) — cloud storage ingestion
- [Data Migration](./04-data-migration) — cluster-to-cluster migration
