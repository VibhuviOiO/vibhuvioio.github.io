---
title: "Backup Strategies"
description: "Comprehensive backup and recovery for Milvus. etcd snapshots, object storage backup, and disaster recovery."
duration: "30m"
readingTime: "15m"
labTime: "15m"
order: 1
---

# Backup Strategies

Milvus data lives in two places:

1. **etcd** — Metadata (schemas, collection info, segment states)
2. **Object Storage** — Actual data (vectors, indexes)

**You must backup both.** Losing either means data loss.

## Backup Architecture

```
┌─────────────┐     ┌─────────────────┐
│   Milvus    │────▶│   etcd Backup   │
│   Cluster   │     │   (metadata)    │
└─────────────┘     └─────────────────┘
       │
       ▼
┌─────────────────┐
│  Object Store   │
│   (MinIO/S3)    │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  Cross-Region   │
│    Replica      │
└─────────────────┘
```

## etcd Backup

### Automated Snapshot Backup

```bash
#!/bin/bash
# /opt/backup/etcd-backup.sh

set -e

BACKUP_DIR="/backups/etcd/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Create snapshot from any etcd node
ETCD_POD=$(kubectl get pod -l app.kubernetes.io/name=etcd -o jsonpath='{.items[0].metadata.name}')

kubectl exec "$ETCD_POD" -- etcdctl snapshot save /tmp/etcd.snapshot

# Copy to backup location
kubectl cp "$ETCD_POD:/tmp/etcd.snapshot" "$BACKUP_DIR/etcd.snapshot"

# Backup cluster info
kubectl exec "$ETCD_POD" -- etcdctl member list > "$BACKUP_DIR/members.txt"

# Compress
gzip "$BACKUP_DIR/etcd.snapshot"

# Cleanup old backups (keep 7 days)
find /backups/etcd -type d -mtime +7 -exec rm -rf {} + 2>/dev/null

echo "Backup completed: $BACKUP_DIR"
```

### CronJob for Regular Backups

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: etcd-backup
spec:
  schedule: "0 */6 * * *"  # Every 6 hours
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: bitnami/etcd:3.5.16
            command:
            - /bin/bash
            - -c
            - |
              etcdctl snapshot save /backup/etcd-$(date +%Y%m%d-%H%M).db \
                --endpoints=etcd-0:2379,etcd-1:2379,etcd-2:2379
            volumeMounts:
            - name: backup
              mountPath: /backup
          volumes:
          - name: backup
            persistentVolumeClaim:
              claimName: etcd-backup-pvc
          restartPolicy: OnFailure
```

## Object Storage Backup

### MinIO Bucket Replication

```bash
# Set up continuous replication
mc alias set primary http://minio-primary:9000 minioadmin minioadmin
mc alias set backup http://minio-backup:9000 minioadmin minioadmin

# Mirror existing data
mc mirror primary/milvus-bucket backup/milvus-bucket-backup

# Continuous sync
mc mirror --watch primary/milvus-bucket backup/milvus-bucket-backup &
```

### S3 Cross-Region Replication

Enable in AWS Console or CLI:

```bash
# Create replication configuration
aws s3api put-bucket-replication \
  --bucket milvus-primary \
  --replication-configuration file://replication.json
```

### Milvus Backup Tool

Use the official [milvus-backup](https://github.com/zilliztech/milvus-backup) tool:

```bash
# Download
wget https://github.com/zilliztech/milvus-backup/releases/latest/download/milvus-backup_Linux_x86_64.tar.gz
tar xzf milvus-backup_Linux_x86_64.tar.gz

# Configure
cat > backup.yaml <<'EOF'
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
  maxSegmentGroupSize: 2G
EOF

# Create backup
./milvus-backup create -n backup_$(date +%Y%m%d)

# List backups
./milvus-backup list

# Restore
./milvus-backup restore -n backup_20240115 -s restored_collection
```

## Recovery Procedures

### Scenario 1: etcd Data Loss

```bash
#!/bin/bash
# restore-etcd.sh

SNAPSHOT="$1"

# Stop Milvus (critical!)
kubectl scale deployment milvus-proxy --replicas=0
kubectl scale deployment milvus-querynode --replicas=0

# Stop etcd
kubectl delete pod -l app.kubernetes.io/name=etcd --grace-period=0

# Restore snapshot
kubectl run etcd-restore --rm -i --restart=Never \
  --image=bitnami/etcd:3.5.16 \
  -- /bin/bash -c "
    etcdctl snapshot restore $SNAPSHOT \
      --data-dir /etcd-data \
      --name etcd-0 \
      --initial-cluster etcd-0=http://etcd-0:2380,etcd-1=http://etcd-1:2380,etcd-2=http://etcd-2:2380
  "

# Restart etcd and Milvus
kubectl apply -f etcd.yaml
sleep 30
kubectl scale deployment milvus-proxy --replicas=1
```

### Scenario 2: Object Storage Loss

If you have cross-region replication:

```bash
# Promote backup bucket to primary
mc alias set backup http://backup-minio:9000 minioadmin minioadmin

# Update Milvus to use backup
kubectl set env deployment/milvus-proxy \
  MINIO_ADDRESS=backup-minio:9000

# Redeploy Milvus to read from backup
kubectl rollout restart deployment/milvus-proxy
```

### Scenario 3: Complete Disaster

1. **Restore etcd** from snapshot
2. **Restore object storage** from backup
3. **Restart Milvus** cluster

```bash
# Full cluster restore
./restore-cluster.sh \
  --etcd-snapshot=/backups/etcd/20240115/snapshot.db \
  --minio-backup=/backups/minio/20240115/
```

## Backup Testing

Regularly test your backups:

```bash
#!/bin/bash
# test-restore.sh

# Create test cluster
docker compose -f test-cluster.yml up -d

# Restore etcd backup
docker cp etcd-snapshot.db test-etcd:/tmp/
docker exec test-etcd etcdctl snapshot restore /tmp/etcd-snapshot.db

# Verify collections exist
python -c "
from pymilvus import MilvusClient
client = MilvusClient('http://localhost:19530')
print('Collections:', client.list_collections())
"

# Cleanup
docker compose -f test-cluster.yml down
```

## Backup Retention Policy

| Backup Type | Frequency | Retention |
|-------------|-----------|-----------|
| etcd snapshot | Every 6 hours | 7 days |
| etcd snapshot | Daily | 30 days |
| etcd snapshot | Weekly | 90 days |
| Object storage | Continuous | N/A (replica) |
| Full milvus-backup | Weekly | 30 days |

## Best Practices

1. **Automate backups** — Humans forget
2. **Test restores** — Untested backups are guesses
3. **Separate locations** — etcd and object storage backups in different places
4. **Encrypt backups** — Protect sensitive vector data
5. **Monitor backup jobs** — Alert on failures
6. **Document procedures** — Runbooks for 3am incidents

## Next Steps

Learn about cross-cluster migration:

→ **[Cross-Cluster Migration](./migration)**
