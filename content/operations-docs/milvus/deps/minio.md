---
title: "MinIO/S3 — Object Storage"
description: "Configure and optimize object storage for Milvus. MinIO setup, S3 integration, performance tuning, and best practices."
duration: "25m"
readingTime: "15m"
labTime: "10m"
order: 2
---

# MinIO/S3 — Object Storage

Milvus stores actual vector data and indexes in object storage. This decoupling allows:

- **Stateless workers** — Query/Data nodes can be replaced anytime
- **Elastic scaling** — Add compute without moving data
- **Cost efficiency** — Object storage is cheaper than block storage

## Storage Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│  DataNode   │────▶│    MinIO    │◀────│    QueryNode        │
│  (flushes   │     │    or S3    │     │  (loads segments)   │
│   segments) │     │             │     │                     │
└─────────────┘     └─────────────┘     └─────────────────────┘
                           │
                    ┌──────┴──────┐
                    │  Segments   │
                    │  Indexes    │
                    │  Stats      │
                    └─────────────┘
```

## MinIO Deployment

### Single-Node (Development)

```yaml
services:
  minio:
    image: minio/minio:RELEASE.2024-12-18T13-15-44Z
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio-data:/data
    ports:
      - "9000:9000"  # API
      - "9001:9001"  # Console
```

Access console: http://localhost:9001 (minioadmin/minioadmin)

### Distributed Mode (Production)

```yaml
services:
  minio:
    image: minio/minio:RELEASE.2024-12-18T13-15-44Z
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server http://minio-{0...3}/data{0...3} --console-address ":9001"
    volumes:
      - minio-data-0:/data0
      - minio-data-1:/data1
      - minio-data-2:/data2
      - minio-data-3:/data3
```

This creates a 4-node distributed setup with erasure coding.

## AWS S3 Integration

### IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:CreateBucket"
      ],
      "Resource": [
        "arn:aws:s3:::milvus-data-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListMultipartUploadParts",
        "s3:AbortMultipartUpload"
      ],
      "Resource": [
        "arn:aws:s3:::milvus-data-*/*"
      ]
    }
  ]
}
```

### Milvus Configuration

```yaml
# milvus.yaml
minio:
  address: s3.amazonaws.com
  port: 443
  accessKeyID: <access-key>
  secretAccessKey: <secret-key>
  useSSL: true
  bucketName: milvus-data-prod
  rootPath: files
  cloudProvider: aws
  region: us-east-1
  
  # For S3-compatible storage (MinIO, etc.)
  # cloudProvider: minio
  # useVirtualHost: false
```

### Environment Variables

```bash
export MINIO_ADDRESS=s3.amazonaws.com:443
export MINIO_ACCESS_KEY=<access-key>
export MINIO_SECRET_KEY=<secret-key>
export MINIO_BUCKET_NAME=milvus-data-prod
export MINIO_USE_SSL=true
export MINIO_CLOUD_PROVIDER=aws
export MINIO_REGION=us-east-1
```

## Storage Sizing

### Formula

```
Raw Vectors:     vectors × dimension × 4 bytes
Indexes:         raw_vectors × index_overhead
Metadata:        ~1% of raw vectors
Total:           (raw + indexes + metadata) × 1.2 (safety)
```

### Index Overhead Factors

| Index Type | Overhead |
|------------|----------|
| FLAT | 1.0× (no index) |
| IVF_FLAT | 1.05× |
| IVF_SQ8 | 1.3× |
| IVF_PQ | 1.1× |
| HNSW | 1.8-2.0× |
| DISKANN | 0.3× (disk-based) |

### Example Calculation

**Scenario:** 100M vectors, 768 dimensions, HNSW index

```
Raw Vectors:  100M × 768 × 4 = 307 GB
HNSW Index:   307 GB × 1.9 = 584 GB
Metadata:     ~5 GB
Safety (20%): (307 + 584 + 5) × 1.2 = 1,075 GB

Recommended: 1.2 TB storage
```

## Performance Tuning

### MinIO Specific

```yaml
services:
  minio:
    environment:
      # Enable compression
      MINIO_COMPRESSION_ENABLE: "on"
      MINIO_COMPRESSION_EXTENSIONS: ".parquet"
      
      # Memory settings
      MINIO_CACHE_ENABLE: "on"
      MINIO_CACHE_QUOTA: "80"
      MINIO_CACHE_AFTER: "0"
      MINIO_CACHE_WATERMARK_LOW: "70"
      MINIO_CACHE_WATERMARK_HIGH: "90"
```

### Milvus minio.yaml Settings

```yaml
minio:
  # Connection pool
  maxOpenConns: 100
  maxIdleConns: 50
  
  # Request timeout
  requestTimeoutMs: 10000
  
  # Chunk size for multipart uploads
  chunkSize: 64MB
```

### S3 Performance Tips

1. **Same region deployment** — Minimize latency
2. **S3 Transfer Acceleration** — For cross-region
3. **Multipart uploads** — Enabled by default for large objects
4. **VPC Endpoints** — Avoid internet gateway for S3 traffic

## Bucket Organization

Milvus creates this structure:

```
bucket/
└── files/
    ├── insert_log/
    │   └── {collection_id}/
    │       └── {partition_id}/
    │           └── {segment_id}/
    │               └── {field_id}/
    │                   └── {log_id}
    ├── stats_log/
    │   └── (similar structure)
    ├── delta_log/
    │   └── (delete records)
    └── index_files/
        └── {index_build_id}/
            └── {index_file_id}
```

## Backup Strategies

### Method 1: MinIO Bucket Replication

```bash
# Set up bucket replication to backup MinIO
mc alias set primary http://minio-primary:9000 minioadmin minioadmin
mc alias set backup http://minio-backup:9000 minioadmin minioadmin

mc mirror --watch primary/milvus-data backup/milvus-data-backup
```

### Method 2: S3 Cross-Region Replication

Enable in AWS Console:
1. Create destination bucket in different region
2. Enable versioning on both buckets
3. Configure replication rule

### Method 3: Milvus Backup Tool

Use [milvus-backup](https://github.com/zilliztech/milvus-backup):

```bash
# Install
wget https://github.com/zilliztech/milvus-backup/releases/latest/download/milvus-backup_Linux_x86_64.tar.gz
tar xzf milvus-backup_Linux_x86_64.tar.gz

# Configure
cat > backup.yaml <<EOF
milvus:
  address: localhost
  port: 19530
  authorization: root:Milvus

minio:
  address: localhost
  port: 9000
  accessKeyID: minioadmin
  secretAccessKey: minioadmin
  bucketName: milvus-bucket
  rootPath: files

backup:
  storageType: minio
  path: /backups
EOF

# Create backup
./milvus-backup create -n my_backup
```

## Troubleshooting

### Slow Segment Loading

**Symptoms:** Queries timeout, QueryNode takes long to load

**Check:**
```bash
# MinIO latency
mc admin trace primary

# Network throughput
iperf3 -c minio-host
```

**Solutions:**
- Move MinIO closer to Milvus (same AZ/rack)
- Use higher bandwidth network (10GbE+)
- Enable MinIO caching
- Consider DISKANN index (less memory, more disk)

### "Bucket not found"

**Cause:** Bucket doesn't exist or credentials wrong

**Fix:**
```bash
# Create bucket manually
mc mb primary/milvus-data

# Or let Milvus create it (default behavior)
```

### Storage Growing Too Fast

**Causes:**
1. Old segments not being garbage collected
2. Compaction disabled or slow
3. Too many indexes

**Check:**
```bash
# List objects by size
mc ls --recursive primary/milvus-data | sort -k4 -n

# Check Milvus GC settings
curl http://milvus:9091/metrics | grep gc
```

## Best Practices

1. **Use dedicated bucket** — Don't share with other applications
2. **Enable versioning** — Protect against accidental deletion
3. **Lifecycle policies** — Move old data to cheaper storage
4. **Monitor costs** — S3 egress charges can be significant
5. **Test restore** — Regularly verify backup integrity
6. **Use IAM roles** — On AWS, avoid hardcoded credentials
7. **Enable encryption** — At-rest encryption by default

## Next Steps

Learn about the message queue:

→ **[Pulsar/Kafka — Message Queue](./pulsar)**
