---
title: Logstash Introduction
description: Understanding Logstash pipeline architecture and configuration
duration: "30m"
readingTime: "20m"
labTime: "10m"
order: 1
---

# Logstash Introduction

## Time Estimate
- **Reading**: 20 minutes
- **Lab**: 10 minutes

## GitHub Reference
- **Repository**: [infinite-containers/elastic-stack](https://github.com/JinnaBalu/infinite-containers)
- **Files**: Logstash pipeline configurations in elastic-stack directories

## Pipeline Architecture

```
┌─────────┐    ┌─────────┐    ┌─────────┐
│  Input  │───▶│ Filter  │───▶│ Output  │
└─────────┘    └─────────┘    └─────────┘
```

## Configuration Structure

```conf
input {
  # Source of data
}

filter {
  # Process and transform
}

output {
  # Destination
}
```

## Common Inputs

```conf
# File input
file {
  path => "/var/log/nginx/access.log"
  start_position => "beginning"
}

# Beats input
beats {
  port => 5044
}

# JDBC input
jdbc {
  jdbc_connection_string => "jdbc:mysql://localhost:3306/mydb"
  jdbc_user => "user"
  jdbc_password => "password"
  statement => "SELECT * FROM orders"
}
```

## Common Filters

```conf
# JSON parsing
json {
  source => "message"
}

# Grok parsing
grok {
  match => { "message" => "%{COMBINEDAPACHELOG}" }
}

# Date parsing
date {
  match => ["timestamp", "ISO8601"]
  target => "@timestamp"
}

# Mutate for field operations
mutate {
  remove_field => ["message", "@version"]
  convert => { "status_code" => "integer" }
}
```

## Common Outputs

```conf
# Elasticsearch
elasticsearch {
  hosts => ["http://localhost:9200"]
  index => "logs-%{+YYYY.MM.dd}"
}

# File
file {
  path => "/output/data.json"
}

# Kafka
kafka {
  bootstrap_servers => "localhost:9092"
  topic_id => "mytopic"
}
```

## Running Logstash

```bash
# With config file
logstash -f /etc/logstash/conf.d/my-pipeline.conf

# Test configuration
logstash -f my-pipeline.conf --config.test_and_exit

# Auto-reload
logstash -f my-pipeline.conf --config.reload.automatic
```

## Next Steps

- [MongoDB to Elasticsearch Pipeline](./02-mongodb-pipeline)
- [S3 to Elasticsearch](./03-s3-pipeline)
