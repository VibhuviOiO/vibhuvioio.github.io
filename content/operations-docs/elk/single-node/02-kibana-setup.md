---
title: Kibana Setup
description: Add Kibana visualization to your Elasticsearch single-node setup
duration: "15m"
readingTime: "5m"
labTime: "10m"
order: 2
---

## Project Structure

```tree
elasticsearch-kibana/
├── docker-compose.yml
└── .env
```

## Using the Combined Stack

The single-node configuration already includes Kibana:

```bash
# The docker-compose.yml includes both Elasticsearch and Kibana
docker compose up -d

# Access Kibana
open http://localhost:5601
```

## Verify Kibana is Connected

1. Open http://localhost:5601
2. Navigate to **Stack Management** → **Index Management**
3. You should see the `.security-7` index (created automatically)

## First Steps in Kibana

### Create an Index Pattern

1. Go to **Stack Management** → **Index Patterns**
2. Click **Create index pattern**
3. Enter `*` to match all indices
4. Select `@timestamp` as time field

### Use Dev Tools

Navigate to **Dev Tools** for direct API access:

```json
GET _cluster/health
GET _cat/indices?v
```

## Health Check

```bash
# Check Kibana status
curl -I http://localhost:5601

# Check Elasticsearch from Kibana container
docker exec kibana curl -s http://elasticsearch:9200
```

## Lab: Explore Kibana

1. Open Kibana at `http://localhost:5601`
2. Navigate to Dev Tools and run a basic health check
3. Create an index pattern for sample data
4. Explore the Discover tab with sample data
5. Build a simple visualization in the Dashboard

## Next Steps

- [Create your first index](../crud/01-index-operations)
- [Import sample data](../crud/02-document-operations)
