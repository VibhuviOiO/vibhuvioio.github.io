---
title: S3 to Elasticsearch Pipeline
description: Ingest data from AWS S3 to Elasticsearch using Logstash
duration: "30m"
readingTime: "15m"
labTime: "15m"
github: "https://github.com/JinnaBalu/infinite-containers/tree/main/elastic-stack/s3-to-es"
order: 3
---

# S3 to Elasticsearch Pipeline

Ingest JSON data from AWS S3 buckets into Elasticsearch for analysis.

## Time Estimate
- **Reading**: 15 minutes
- **Lab**: 15 minutes

## GitHub Reference
- **Repository**: [infinite-containers/elastic-stack/s3-to-es](https://github.com/JinnaBalu/infinite-containers/tree/main/elastic-stack/s3-to-es)
- **Files**:
  - `docker-compose.yml` - Complete stack configuration
  - `pipeline/s3-es.conf` - Logstash S3 input pipeline
  - `config/` - Logstash configuration files

## Prerequisites

- AWS credentials with S3 access
- Elasticsearch cluster running
- Logstash with S3 input plugin

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

## Pipeline Configuration

The `s3-es.conf` pipeline:

```conf
input {
  s3 {
    bucket => "my-data-bucket"
    prefix => "logs/2024/"
    region => "us-east-1"
    access_key_id => "${AWS_ACCESS_KEY_ID}"
    secret_access_key => "${AWS_SECRET_ACCESS_KEY}"
  }
}

filter {
  json {
    source => "message"
  }
  
  date {
    match => ["timestamp", "ISO8601"]
  }
}

output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "s3-logs-%{+YYYY.MM.dd}"
  }
}
```

## Environment Variables

Create `.env` file:

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

## Start Pipeline

```bash
docker compose up -d
```

## Monitor Ingestion

```bash
# Check Logstash logs
docker logs -f logstash

# Check index growth
curl -X GET "localhost:9200/_cat/indices/s3-logs-*?v"
```

## Next Steps

- [Production Tips](../production/04-production-tips)
