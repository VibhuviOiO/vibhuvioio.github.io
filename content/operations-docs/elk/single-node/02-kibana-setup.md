---
title: Kibana Setup
description: Add Kibana visualization to your Elasticsearch single-node setup
duration: "15m"
readingTime: "5m"
labTime: "10m"
order: 2
---

# Kibana Setup

Kibana provides a web interface for exploring and visualizing Elasticsearch data.

## Time Estimate
- **Reading**: 5 minutes
- **Lab**: 10 minutes

## GitHub Reference
- **Repository**: [infinite-containers/elastic-stack/single-node-elasticsearch](https://github.com/JinnaBalu/infinite-containers/tree/main/elastic-stack/single-node-elasticsearch)
- **Files**:
  - `docker-compose.yml` - Includes Elasticsearch and Kibana services

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

## Next Steps

- [Create your first index](../crud/01-index-operations)
- [Import sample data](../crud/02-document-operations)
