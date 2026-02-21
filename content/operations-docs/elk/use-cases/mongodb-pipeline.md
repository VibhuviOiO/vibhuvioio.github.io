---
title: MongoDB to Elasticsearch - Complete Guide
description: Step-by-step guide for building a MongoDB to Elasticsearch data pipeline
duration: "15m"
readingTime: "15m"
order: 2
---

## Use Case

**Problem**: MongoDB is great for document storage but lacks advanced full-text search and analytics capabilities.

**Solution**: Use Logstash to continuously sync MongoDB data to Elasticsearch for:
- Full-text search across all fields
- Complex aggregations and analytics
- Real-time dashboards in Kibana

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌─────────────┐
│   MongoDB   │─────▶│   Logstash   │─────▶│Elasticsearch│─────▶│   Kibana    │
│  (Primary)  │      │   (Pipeline) │      │  (Search)   │      │ (Analytics) │
│   :27017    │      │              │      │   :9200     │      │   :5601     │
└─────────────┘      └──────────────┘      └─────────────┘      └─────────────┘
      │                      │
      └──────────────────────┘
       Shared Docker Network
```

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM available

## Quick Start

```bash
# 1. Create project directory
mkdir ~/mongo-es-pipeline && cd ~/mongo-es-pipeline

# 2. Download all configurations
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/mongo-elasticsearch-logstash/mongo/docker-compose.yml -O mongo-compose.yml
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/mongo-elasticsearch-logstash/elk/docker-compose.yml -O elk-compose.yml

# 3. Create network
docker network create datapipeline

# 4. Start MongoDB
docker compose -f mongo-compose.yml up -d

# 5. Start Elasticsearch & Kibana
docker compose -f elk-compose.yml up -d

# 6. Setup Logstash (see below)
```

## Step-by-Step Setup

### Step 1: MongoDB with Mongo Express

```bash
# Download and start
curl -O https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/mongo-elasticsearch-logstash/mongo/docker-compose.yml
docker compose up -d
```

**Verify**: http://localhost:8081 (Mongo Express)

### Step 2: Import Sample Data

```bash
# Download sample movies data
curl -O https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/mongo-elasticsearch-logstash/movies.json

# Copy to container
docker cp movies.json mongodb:/

# Import
docker exec mongodb mongoimport \
  --db moviedb \
  --collection movies \
  --file /movies.json \
  --jsonArray
```

### Step 3: Elasticsearch & Kibana

```bash
curl -O https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/mongo-elasticsearch-logstash/elk/docker-compose.yml
docker compose up -d
```

**Verify**: http://localhost:5601 (Kibana)

### Step 4: Logstash with MongoDB JDBC

```bash
mkdir -p logstash/{drivers,pipeline}

# Download JDBC driver
cd logstash/drivers
wget https://dbschema.com/jdbc-drivers/MongoDbJdbcDriver.zip
unzip MongoDbJdbcDriver.zip
rm MongoDbJdbcDriver.zip
cd ../..

# Download Logstash config
curl -o logstash/pipeline/mongodb.conf https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/mongo-elasticsearch-logstash/elk/logstash/pipeline/logstash.conf

# Download Logstash Dockerfile
curl -o logstash/Dockerfile https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/mongo-elasticsearch-logstash/elk/logstash/Dockerfile

# Build and run
docker build -t logstash-mongo ./logstash
docker run -d \
  --name logstash \
  --network datapipeline \
  -v $(pwd)/logstash/pipeline:/usr/share/logstash/pipeline \
  logstash-mongo
```

## Pipeline Configuration

```conf
input {
  jdbc {
    jdbc_connection_string => "jdbc:mongodb://mongodb:27017/moviedb"
    jdbc_driver_library => "/usr/share/logstash/drivers/MongoDbJdbcDriver.jar"
    jdbc_driver_class => "com.dbschema.MongoJdbcDriver"
    statement => "SELECT * FROM movies"
    schedule => "*/5 * * * *"
  }
}

filter {
  mutate {
    convert => {
      "rating" => "float"
      "budget" => "integer"
      "isAvailable" => "boolean"
    }
  }
  
  date {
    match => ["releaseDate", "ISO8601"]
    target => "releaseDate"
  }
}

output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "movies"
    document_id => "%{id}"
  }
  
  stdout {
    codec => rubydebug
  }
}
```

## Data Types Handled

| MongoDB Type | ES Mapping | Example |
|--------------|------------|---------|
| String | text/keyword | title, name |
| Number | float/integer | rating, budget |
| Boolean | boolean | isAvailable |
| Date | date | releaseDate |
| Object | object | director {} |
| Array | array | genres [] |
| ObjectId | keyword | _id |

## Verification

```bash
# Check document count
curl "localhost:9200/movies/_count?pretty"

# Search in Kibana Dev Tools
GET movies/_search
{
  "query": {
    "match": {
      "title": "Inception"
    }
  }
}
```

## Production Considerations

1. **Incremental Sync**: Use `sql_last_value` for change data capture
2. **Conflict Resolution**: Implement version-based updates
3. **Monitoring**: Track pipeline lag and error rates
4. **Security**: Use TLS for all connections

## Cleanup

```bash
docker stop logstash mongodb elasticsearch kibana mongo-express
docker rm logstash mongodb elasticsearch kibana mongo-express
docker network rm datapipeline
```

## Next Steps

- [Logstash Introduction](../logstash/01-introduction)
- [Remote Reindexing](../production/02-remote-reindexing)
