---
title: Basic Logstash Pipeline
description: Build a Logstash pipeline to move data from PostgreSQL to Elasticsearch
order: 1
---

# 🐳 Basic Logstash Pipeline

Build a Logstash pipeline to move data from PostgreSQL into Elasticsearch.

---

## Prerequisites

- [Elasticsearch running](../elasticsearch/single-node)
- [Docker](https://docs.docker.com/install/) installed

---

## Pipeline Structure

A Logstash pipeline has 3 blocks:

1. **Input**: Where data comes from (JDBC, Beats, HTTP, etc.)
2. **Filter**: Parse, transform, and clean data (optional)
3. **Output**: Where data is sent (Elasticsearch, S3, Kafka)

---

## Setup

### Create Folder Structure

```bash
mkdir -p logstash-pipeline/jdbc-drivers logstash-pipeline/pipeline
cd logstash-pipeline
```

### Download Files

```bash
# Download PostgreSQL JDBC Driver
wget -P jdbc-drivers/ https://jdbc.postgresql.org/download/postgresql-42.7.5.jar

# Download Docker Compose and Pipeline Config
wget -O docker-compose.yml https://raw.githubusercontent.com/jinnabaalu/ELKOperations/main/logstash/postgres-to-elasticsearch/docker-compose.yml
wget -P pipeline/ https://raw.githubusercontent.com/jinnabaalu/ELKOperations/main/logstash/postgres-to-elasticsearch/pipeline/pg-table-es.conf
```

---

## Pipeline Configuration

Example pipeline configuration:

```conf
input {
  jdbc {
    jdbc_connection_string => "jdbc:postgresql://postgres:5432/mydb"
    jdbc_user => "user"
    jdbc_password => "password"
    jdbc_driver_class => "org.postgresql.Driver"
    jdbc_driver_library => "/usr/share/logstash/jdbc-drivers/postgresql-42.7.5.jar"
    statement => "SELECT * from employees"
    schedule => "* * * * *"
  }
}

output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "employees"
    document_id => "%{id}"
  }
}
```

---

## Run Logstash

```bash
docker compose up -d
```

### Verify Pipeline

```bash
# Check container status
docker ps -a

# View logs
docker logs logstash | grep "SELECT"

# Check Elasticsearch indices
curl -s http://localhost:9200/_cat/indices?v

# Count documents
curl -s http://localhost:9200/employees/_count?pretty
```

---

## Next Steps

- [Visualize data in Kibana](../kibana/container)
- [Build custom dashboards](../kibana/dashboards)
