---
title: MongoDB to Elasticsearch Pipeline
description: Sync data from MongoDB collections to Elasticsearch indices using Logstash JDBC
duration: "1h 30m"
readingTime: "30m"
labTime: "1h"
github: "https://github.com/JinnaBalu/infinite-containers/tree/main/mongo-elasticsearch-logstash"
order: 2
---

## Project Structure

```tree
mongo-elasticsearch-logstash/
├── docker-compose.yml
├── .env
└── pipeline/
    └── logstash.conf
```

## Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  MongoDB │────▶│ Logstash │────▶│   ES     │────▶│  Kibana  │
│(Source)  │     │(Pipeline)│     │ (Index)  │     │(Explore) │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

## Prerequisites

```bash
# Create network
docker network create datapipeline
```

## Step 1: Start MongoDB

```bash
mkdir ~/mongo-pipeline && cd ~/mongo-pipeline

# Download MongoDB compose file
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/mongo-elasticsearch-logstash/mongo/docker-compose.yml

docker compose up -d
```

**Access Mongo Express**: http://localhost:8081

## Step 2: Import Sample Data

```bash
# Copy sample data to container
docker cp movies.json mongodb:/

# Import to MongoDB
docker exec mongodb mongoimport \
  --db moviedb \
  --collection movies \
  --file /movies.json \
  --jsonArray
```

## Step 3: Start Elasticsearch & Kibana

```bash
# Download ELK compose
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/mongo-elasticsearch-logstash/elk/docker-compose.yml

docker compose up -d
```

**Access Kibana**: http://localhost:5601

## Step 4: Setup Logstash

### Download MongoDB JDBC Driver

```bash
cd ~/mongo-pipeline
mkdir -p logstash/drivers

# Download and extract driver
wget https://dbschema.com/jdbc-drivers/MongoDbJdbcDriver.zip
unzip MongoDbJdbcDriver.zip -d logstash/drivers/
rm MongoDbJdbcDriver.zip
```

### Download Logstash Configuration

```bash
# Download pipeline config
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/mongo-elasticsearch-logstash/elk/logstash/pipeline/logstash.conf -O logstash/pipeline/logstash.conf

# Download docker-compose for logstash
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/mongo-elasticsearch-logstash/elk/logstash/docker-compose.yml -O logstash/docker-compose.yml
```

### Build Custom Logstash Image

```bash
cd logstash
docker build -t mongologstash .
```

## Step 5: Run Logstash

```bash
docker compose up -d
```

## Data Types Covered

The pipeline handles various MongoDB data types:

| Type | Example Fields |
|------|----------------|
| **Strings** | title, name, role |
| **Numbers** | rating, releaseYear, budget |
| **Boolean** | isAvailable |
| **Dates** | releaseDate |
| **Nested Objects** | director, boxOffice.profit |
| **Arrays** | genres, cast |
| **ObjectId** | _id |

## Verification

```bash
# Check document count
curl -X GET 'localhost:9200/movies/_count?pretty'

# Search in Kibana Dev Tools
GET movies/_search
{
  "query": { "match_all": {} }
}
```

## Cleanup

```bash
docker stop $(docker ps -qa)
docker rm $(docker ps -qa)
docker network rm datapipeline
```

## Lab: Build the MongoDB Pipeline

1. Create the Docker network and start MongoDB with Mongo Express
2. Import the sample `movies.json` data into MongoDB
3. Start Elasticsearch and Kibana, verify both are healthy
4. Build the custom Logstash image with the MongoDB JDBC driver
5. Run Logstash and verify documents appear in Elasticsearch
6. Search for a movie in Kibana Dev Tools

## Next Steps

- [S3 to Elasticsearch Pipeline](./03-s3-pipeline)
- [Production Deployment](../production/04-production-tips)
