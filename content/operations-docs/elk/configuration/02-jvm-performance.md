---
title: JVM & Performance Tuning
description: Elasticsearch JVM heap sizing, garbage collection tuning, memory lock, and system-level performance optimizations.
duration: "25m"
readingTime: "15m"
labTime: "10m"
order: 2
---

## Heap Sizing Rules

### The Golden Rules

1. **Set Xms = Xmx** — Always. No dynamic resizing.
2. **Never exceed 50% of RAM** — The OS needs the other 50% for filesystem cache.
3. **Never exceed 31GB** — Beyond this, the JVM disables compressed ordinary object pointers (compressed oops), which wastes memory.
4. **Minimum 1GB** — Elasticsearch won't start with less.

### Sizing by Server RAM

| Server RAM | Heap (`-Xms`/`-Xmx`) | OS Cache | Notes |
|------------|----------------------|----------|-------|
| 4GB | 2g | 2GB | Development only |
| 8GB | 4g | 4GB | Small production |
| 16GB | 8g | 8GB | Medium production |
| 32GB | 16g | 16GB | Recommended production |
| 64GB | 31g | 33GB | Maximum useful heap |
| 128GB | 31g | 97GB | Extra RAM goes to cache |

### Setting Heap in Docker

```yaml
environment:
  - "ES_JAVA_OPTS=-Xms8g -Xmx8g"
```

Or in `jvm.options`:

```
-Xms8g
-Xmx8g
```

## Memory Lock

Swapping is the enemy of Elasticsearch. When the OS swaps heap memory to disk, GC pauses become minutes instead of milliseconds.

### Enable Memory Lock

In `elasticsearch.yml`:

```yaml
bootstrap.memory_lock: true
```

In Docker Compose:

```yaml
services:
  elasticsearch:
    ulimits:
      memlock:
        soft: -1
        hard: -1
```

### Verify Memory Lock

```bash
curl -s http://localhost:9200/_nodes?filter_path=**.mlockall
```

Expected response:

```json
{
  "nodes": {
    "node-id": {
      "process": {
        "mlockall": true
      }
    }
  }
}
```

If `mlockall` is `false`, check:
- Docker memlock ulimits
- `LimitMEMLOCK=infinity` in systemd service file
- Sufficient RAM available

## Garbage Collection

Elasticsearch uses G1GC by default (since ES 7.x). The defaults work well for most cases.

### GC Monitoring

Watch GC activity in the logs:

```bash
# Check GC stats
curl -s http://localhost:9200/_nodes/stats/jvm?filter_path=**.gc
```

### GC Warning Signs

| Symptom | Cause | Fix |
|---------|-------|-----|
| Frequent young GC | Heap too small | Increase heap |
| Long old GC pauses | Heap too large (>31GB) | Reduce to 31g max |
| OutOfMemoryError | Heap exhausted | Increase heap or reduce load |
| High GC overhead | Too many small objects | Check field data, aggregations |

### GC Tuning Options

In `jvm.options` (rarely needed):

```
# G1GC settings (defaults are usually fine)
-XX:+UseG1GC
-XX:G1HeapRegionSize=4m
-XX:InitiatingHeapOccupancyPercent=75

# GC logging (enabled by default in ES)
-Xlog:gc*,gc+age=trace,safepoint:file=logs/gc.log:utctime,pid,tags:filecount=32,filesize=64m
```

## Virtual Memory (vm.max_map_count)

Elasticsearch uses `mmap` for efficient file access. The default OS limit is too low.

```bash
# Check current value
sysctl vm.max_map_count

# Set for current session
sudo sysctl -w vm.max_map_count=262144

# Set permanently
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
```

**Docker Desktop:** On macOS/Windows with Docker Desktop, this is already set. On Linux, you must set it manually.

## File Descriptors

Elasticsearch opens many files. The default limit (1024) is far too low.

```bash
# Check current limit
ulimit -n

# Set for current session
ulimit -n 65535
```

In Docker Compose:

```yaml
services:
  elasticsearch:
    ulimits:
      nofile:
        soft: 65535
        hard: 65535
```

## Disk I/O Optimization

### Use SSDs

Elasticsearch is I/O-intensive. SSDs provide 10-100x better random read performance than HDDs.

### I/O Scheduler

For SSDs, use `noop` or `none` scheduler:

```bash
echo noop | sudo tee /sys/block/sda/queue/scheduler
```

### Disable Swappiness

```bash
sudo sysctl -w vm.swappiness=1
```

## Network Buffer Tuning

For high-throughput clusters:

```bash
sudo sysctl -w net.core.somaxconn=65535
sudo sysctl -w net.ipv4.tcp_max_syn_backlog=65535
```

## Performance Checklist

Use this checklist before going to production:

| Setting | Value | Verified |
|---------|-------|----------|
| Heap size | 50% of RAM, max 31GB | |
| Xms = Xmx | Same value | |
| memory_lock | true | |
| vm.max_map_count | 262144 | |
| File descriptors | 65535+ | |
| Swap | Disabled or swappiness=1 | |
| Disk | SSD with noop scheduler | |
| GC | G1GC (default) | |

## Diagnosing Performance Issues

### Hot Threads API

Find what Elasticsearch is spending time on:

```bash
curl -s http://localhost:9200/_nodes/hot_threads
```

### Node Stats

Check memory and GC pressure:

```bash
# JVM memory usage
curl -s 'http://localhost:9200/_nodes/stats/jvm?pretty' | \
  grep -A 5 '"heap_used"'

# Thread pool rejections
curl -s 'http://localhost:9200/_cat/thread_pool?v&h=name,active,rejected,completed'
```

### Pending Tasks

Check for cluster bottlenecks:

```bash
curl -s http://localhost:9200/_cluster/pending_tasks?pretty
```

## Lab: Tune JVM Performance

1. Check current heap settings with `GET _nodes/stats/jvm?pretty`
2. Modify `ES_JAVA_OPTS` in Docker Compose to set heap to 2GB
3. Verify memory lock is enabled with `GET _nodes?filter_path=**.mlockall`
4. Monitor GC activity in Elasticsearch logs
5. Run the performance checklist against your cluster

## Next Steps

- [Index Operations](/learn/elk/crud/01-index-operations) — put your tuned cluster to work
- [Cluster Monitoring](/learn/elk/monitoring/01-cluster-monitoring) — ongoing monitoring in production
