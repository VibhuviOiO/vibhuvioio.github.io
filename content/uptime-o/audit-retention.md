---
title: Audit & Retention
description: Review audit logs and manage data retention.
order: 10
---

# Audit & Retention

UptimeO records an audit log of important changes and partitions heartbeat data for performance.

## Audit Log

The audit log captures create, update, and delete events across the platform.

![Audit log](/img/uptime-o/audit-01-log.png)

## Data Retention

Heartbeat data is stored in daily PostgreSQL partitions. The default retention policy removes old partitions automatically, but you can customize it.

Run a manual cleanup job:

```sql
-- Delete heartbeats older than 30 days
DELETE FROM api_heartbeats
WHERE executed_at < NOW() - INTERVAL '30 days';

-- Drop an old partition (use the actual table name)
DROP TABLE IF EXISTS api_heartbeats_2025_10_01;
```

Or schedule cleanup with pg_cron:

```bash
psql -h localhost -U uptimeo -d uptimeo -f docker/standalone/sql/cleanup-30-days.sql
```

## Partition Management

If today's partition is missing, create it manually:

```sql
SELECT create_daily_partition();
```
