---
title: Backup & Restore
description: Elasticsearch snapshot and restore — repository setup, snapshot lifecycle, ILM policy export/import, Kibana saved objects backup, and disaster recovery.
duration: "30m"
readingTime: "15m"
labTime: "15m"
order: 3
---

## Snapshot Architecture

Snapshots are incremental backups stored in a **snapshot repository**. Only changed data is saved after the first snapshot.

```
Elasticsearch Cluster → Snapshot Repository (S3 / NFS / Azure / GCS)
                                ├── snapshot-2024-01-01
                                ├── snapshot-2024-01-02  (incremental)
                                └── snapshot-2024-01-03  (incremental)
```

## Repository Setup

### Shared Filesystem Repository

For local or NFS-mounted storage:

```bash
# Add repository path to elasticsearch.yml
# path.repo: ["/mnt/backups"]
```

Register the repository:

```bash
curl -X PUT "http://localhost:9200/_snapshot/my-backup" \
  -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/mnt/backups/elasticsearch",
    "compress": true,
    "max_snapshot_bytes_per_sec": "100mb",
    "max_restore_bytes_per_sec": "100mb"
  }
}'
```

### S3 Repository

Install the S3 plugin and register:

```bash
# Install plugin
bin/elasticsearch-plugin install repository-s3

# Add credentials to keystore
bin/elasticsearch-keystore add s3.client.default.access_key
bin/elasticsearch-keystore add s3.client.default.secret_key
```

Register the S3 repository:

```bash
curl -X PUT "http://localhost:9200/_snapshot/s3-backup" \
  -H 'Content-Type: application/json' -d'
{
  "type": "s3",
  "settings": {
    "bucket": "my-elasticsearch-backups",
    "region": "us-east-1",
    "base_path": "production-cluster",
    "compress": true,
    "server_side_encryption": true
  }
}'
```

### Docker Compose with Shared Volume

```yaml
services:
  elasticsearch:
    image: elasticsearch:8.12.0
    environment:
      - path.repo=/usr/share/elasticsearch/backups
    volumes:
      - es-backups:/usr/share/elasticsearch/backups

volumes:
  es-backups:
    driver: local
```

### Verify Repository

```bash
curl -s "http://localhost:9200/_snapshot/my-backup?pretty"

# Test repository access
curl -X POST "http://localhost:9200/_snapshot/my-backup/_verify?pretty"
```

## Creating Snapshots

### Snapshot All Indices

```bash
curl -X PUT "http://localhost:9200/_snapshot/my-backup/snapshot-$(date +%Y%m%d)?wait_for_completion=true&pretty" \
  -H 'Content-Type: application/json' -d'
{
  "indices": "*",
  "ignore_unavailable": true,
  "include_global_state": true
}'
```

### Snapshot Specific Indices

```bash
curl -X PUT "http://localhost:9200/_snapshot/my-backup/logs-backup-$(date +%Y%m%d)?wait_for_completion=true&pretty" \
  -H 'Content-Type: application/json' -d'
{
  "indices": "logs-*,filebeat-*,metricbeat-*",
  "ignore_unavailable": true,
  "include_global_state": false
}'
```

### Check Snapshot Status

```bash
# List all snapshots
curl -s "http://localhost:9200/_snapshot/my-backup/_all?pretty"

# Check specific snapshot
curl -s "http://localhost:9200/_snapshot/my-backup/snapshot-20240115?pretty"

# Check in-progress snapshots
curl -s "http://localhost:9200/_snapshot/_status?pretty"
```

## Restoring Snapshots

### Restore All Indices

```bash
curl -X POST "http://localhost:9200/_snapshot/my-backup/snapshot-20240115/_restore?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "indices": "*",
  "ignore_unavailable": true,
  "include_global_state": true
}'
```

### Restore Specific Indices

```bash
curl -X POST "http://localhost:9200/_snapshot/my-backup/snapshot-20240115/_restore?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "indices": "logs-2024.01.*",
  "ignore_unavailable": true,
  "include_global_state": false
}'
```

### Restore to a Different Index Name

```bash
curl -X POST "http://localhost:9200/_snapshot/my-backup/snapshot-20240115/_restore?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "indices": "production-logs",
  "ignore_unavailable": true,
  "include_global_state": false,
  "rename_pattern": "production-(.*)",
  "rename_replacement": "restored-$1"
}'
```

This restores `production-logs` as `restored-logs`.

### Restore with Modified Settings

```bash
curl -X POST "http://localhost:9200/_snapshot/my-backup/snapshot-20240115/_restore?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "indices": "my-index",
  "index_settings": {
    "index.number_of_replicas": 0
  },
  "ignore_index_settings": [
    "index.refresh_interval"
  ]
}'
```

## Snapshot Lifecycle Management (SLM)

Automate snapshots with a lifecycle policy:

```bash
curl -X PUT "http://localhost:9200/_slm/policy/nightly-backup" \
  -H 'Content-Type: application/json' -d'
{
  "schedule": "0 30 2 * * ?",
  "name": "<nightly-{now/d}>",
  "repository": "my-backup",
  "config": {
    "indices": "*",
    "ignore_unavailable": true,
    "include_global_state": true
  },
  "retention": {
    "expire_after": "30d",
    "min_count": 7,
    "max_count": 30
  }
}'
```

### SLM Schedule Examples

| Schedule | Cron | Description |
|----------|------|-------------|
| Every night at 2:30 AM | `0 30 2 * * ?` | Daily backup |
| Every 6 hours | `0 0 */6 * * ?` | Frequent backup |
| Every Sunday at midnight | `0 0 0 ? * SUN` | Weekly backup |
| First of month at 3 AM | `0 0 3 1 * ?` | Monthly backup |

### Manage SLM

```bash
# List all policies
curl -s "http://localhost:9200/_slm/policy?pretty"

# Execute policy manually
curl -X POST "http://localhost:9200/_slm/policy/nightly-backup/_execute?pretty"

# Check SLM status
curl -s "http://localhost:9200/_slm/stats?pretty"

# Delete a policy
curl -X DELETE "http://localhost:9200/_slm/policy/nightly-backup"
```

## ILM Policy Export/Import

When migrating clusters, export your ILM policies:

### Export All ILM Policies

```bash
#!/bin/bash
# export-ilm-policies.sh

SOURCE_ES="http://localhost:9200"
OUTPUT_DIR="./ilm-backup"
mkdir -p "$OUTPUT_DIR"

# Get all policy names
policies=$(curl -s "$SOURCE_ES/_ilm/policy" | jq -r 'keys[]')

for policy in $policies; do
  echo "Exporting ILM policy: $policy"
  curl -s "$SOURCE_ES/_ilm/policy/$policy" | jq ".\"$policy\".policy" > "$OUTPUT_DIR/$policy.json"
done

echo "Exported $(echo "$policies" | wc -w) ILM policies to $OUTPUT_DIR"
```

### Import ILM Policies

```bash
#!/bin/bash
# import-ilm-policies.sh

DEST_ES="http://new-cluster:9200"
INPUT_DIR="./ilm-backup"

for file in "$INPUT_DIR"/*.json; do
  policy=$(basename "$file" .json)
  echo "Importing ILM policy: $policy"
  curl -X PUT "$DEST_ES/_ilm/policy/$policy" \
    -H 'Content-Type: application/json' \
    -d @"$file"
done
```

## Index Template Backup

### Export Templates

```bash
#!/bin/bash
# export-templates.sh

SOURCE_ES="http://localhost:9200"
OUTPUT_DIR="./template-backup"
mkdir -p "$OUTPUT_DIR"

# Legacy templates
curl -s "$SOURCE_ES/_template?pretty" > "$OUTPUT_DIR/legacy-templates.json"

# Composable templates (7.8+)
curl -s "$SOURCE_ES/_index_template?pretty" > "$OUTPUT_DIR/index-templates.json"

# Component templates
curl -s "$SOURCE_ES/_component_template?pretty" > "$OUTPUT_DIR/component-templates.json"
```

## Kibana Saved Objects Backup

### Export via API

```bash
# Export all dashboards, visualizations, and saved searches
curl -X POST "http://localhost:5601/api/saved_objects/_export" \
  -H 'kbn-xsrf: true' \
  -H 'Content-Type: application/json' -d'
{
  "type": ["dashboard", "visualization", "search", "index-pattern", "lens"],
  "includeReferencesDeep": true
}' > kibana-saved-objects.ndjson
```

### Import via API

```bash
curl -X POST "http://localhost:5601/api/saved_objects/_import?overwrite=true" \
  -H 'kbn-xsrf: true' \
  --form file=@kibana-saved-objects.ndjson
```

### Export Specific Dashboard

```bash
curl -X POST "http://localhost:5601/api/saved_objects/_export" \
  -H 'kbn-xsrf: true' \
  -H 'Content-Type: application/json' -d'
{
  "objects": [
    {
      "type": "dashboard",
      "id": "my-dashboard-id"
    }
  ],
  "includeReferencesDeep": true
}' > my-dashboard.ndjson
```

## Disaster Recovery Plan

### Backup Strategy

| Data | Method | Frequency | Retention |
|------|--------|-----------|-----------|
| Indices | Snapshot/Restore | Nightly | 30 days |
| ILM policies | API export | Weekly | 90 days |
| Index templates | API export | Weekly | 90 days |
| Kibana objects | Saved objects export | Weekly | 90 days |
| Cluster settings | API export | After changes | Versioned |

### Recovery Procedure

1. **Deploy fresh cluster** with same version
2. **Register snapshot repository** pointing to backup storage
3. **Import ILM policies** from backup
4. **Import index templates** from backup
5. **Restore indices** from latest snapshot
6. **Import Kibana saved objects**
7. **Verify cluster health** and data integrity
8. **Update DNS/load balancer** to point to new cluster

### Complete Backup Script

```bash
#!/bin/bash
# full-backup.sh — Run weekly

ES_HOST="http://localhost:9200"
KIBANA_HOST="http://localhost:5601"
BACKUP_DIR="./cluster-backup-$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

echo "=== Elasticsearch Cluster Backup ==="
echo "Date: $(date)"

# 1. Trigger snapshot
echo "Creating snapshot..."
curl -s -X PUT "$ES_HOST/_snapshot/my-backup/full-$(date +%Y%m%d)?wait_for_completion=true" \
  -H 'Content-Type: application/json' -d'{
  "indices": "*",
  "ignore_unavailable": true,
  "include_global_state": true
}'

# 2. Export ILM policies
echo "Exporting ILM policies..."
curl -s "$ES_HOST/_ilm/policy?pretty" > "$BACKUP_DIR/ilm-policies.json"

# 3. Export index templates
echo "Exporting templates..."
curl -s "$ES_HOST/_index_template?pretty" > "$BACKUP_DIR/index-templates.json"
curl -s "$ES_HOST/_component_template?pretty" > "$BACKUP_DIR/component-templates.json"

# 4. Export cluster settings
echo "Exporting cluster settings..."
curl -s "$ES_HOST/_cluster/settings?pretty" > "$BACKUP_DIR/cluster-settings.json"

# 5. Export Kibana saved objects
echo "Exporting Kibana objects..."
curl -s -X POST "$KIBANA_HOST/api/saved_objects/_export" \
  -H 'kbn-xsrf: true' \
  -H 'Content-Type: application/json' -d'{
  "type": ["dashboard", "visualization", "search", "index-pattern", "lens"],
  "includeReferencesDeep": true
}' > "$BACKUP_DIR/kibana-objects.ndjson"

echo "=== Backup Complete ==="
echo "Files saved to: $BACKUP_DIR"
ls -la "$BACKUP_DIR"
```

## Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Repository verification failed | Path doesn't exist or wrong permissions | Create path, set ownership to elasticsearch user |
| Snapshot stuck in IN_PROGRESS | Large indices, slow I/O | Wait, or check `_snapshot/_status` for progress |
| Restore fails with existing index | Index already exists | Delete or close the existing index first |
| Partial snapshot | Some shards unavailable | Check cluster health, fix unhealthy shards |

## Lab: Set Up Backup and Recovery

1. Create a shared filesystem repository
2. Take a snapshot of all indices
3. Delete a test index
4. Restore the deleted index from the snapshot
5. Set up an SLM policy for nightly backups
6. Export and import Kibana saved objects
7. Export ILM policies and index templates

## Next Steps

- [Reindexing](/learn/elk/production/01-reindexing) — restructure indices with zero downtime
- [Remote Reindexing](/learn/elk/production/02-remote-reindexing) — migrate data between clusters
