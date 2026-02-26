---
title: "Helm on Kubernetes"
description: "Production-grade Milvus deployment on Kubernetes using Helm charts. Auto-scaling, rolling updates, and enterprise features."
duration: "45m"
readingTime: "25m"
labTime: "20m"
order: 4
---

# Helm on Kubernetes

This is the production deployment method for Milvus. Kubernetes provides:

- **Horizontal scaling** — Add/remove nodes automatically
- **Rolling updates** — Zero-downtime deployments
- **Self-healing** — Auto-restart failed components
- **Resource management** — CPU/memory limits and requests

## Prerequisites

- Kubernetes cluster (1.24+) with at least 4 nodes
- kubectl configured
- Helm 3.x installed
- Storage class for PVCs

## Quick Start

### 1. Add Milvus Helm Repository

```bash
helm repo add milvus https://zilliztech.github.io/milvus-helm/
helm repo update
```

### 2. Install Milvus (Minimal)

```bash
helm install milvus milvus/milvus \
  --set cluster.enabled=true \
  --set etcd.replicaCount=3 \
  --set pulsar.enabled=true \
  --set minio.mode=distributed
```

Wait for deployment:

```bash
kubectl get pods -w
```

> **Expected Output:**
> ```
> NAME                                          READY   STATUS
> milvus-etcd-0                                 1/1     Running
> milvus-etcd-1                                 1/1     Running
> milvus-etcd-2                                 1/1     Running
> milvus-minio-0                                1/1     Running
> milvus-proxy-7d9f4b8c5-x2k9p                  1/1     Running
> milvus-rootcoord-0                            1/1     Running
> ...
> ```

### 3. Access Milvus

```bash
# Port-forward to local
kubectl port-forward svc/milvus 19530:19530

# Test connection
python -c "from pymilvus import MilvusClient; c = MilvusClient('http://localhost:19530'); print(c.get_server_version())"
```

## Production Values File

Create `milvus-production.yaml`:

```yaml
# ============================================
# Cluster Configuration
# ============================================
cluster:
  enabled: true

# ============================================
# Proxy (Access Layer)
# ============================================
proxy:
  replicas: 2
  resources:
    requests:
      cpu: 1
      memory: 2Gi
    limits:
      cpu: 2
      memory: 4Gi
  service:
    type: LoadBalancer
    port: 19530
    annotations:
      # AWS NLB example
      service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
      
# ============================================
# Coordinators
# ============================================
rootCoordinator:
  replicas: 1
  resources:
    requests:
      cpu: 0.5
      memory: 1Gi
    limits:
      cpu: 1
      memory: 2Gi
  # Enable HA with standby
  enableActiveStandby: true

queryCoordinator:
  replicas: 1
  resources:
    requests:
      cpu: 0.5
      memory: 1Gi
    limits:
      cpu: 1
      memory: 2Gi

dataCoordinator:
  replicas: 1
  resources:
    requests:
      cpu: 0.5
      memory: 1Gi
    limits:
      cpu: 1
      memory: 2Gi

indexCoordinator:
  replicas: 1
  resources:
    requests:
      cpu: 0.5
      memory: 1Gi
    limits:
      cpu: 1
      memory: 2Gi

# ============================================
# Workers (Scalable)
# ============================================
queryNode:
  replicas: 3
  resources:
    requests:
      cpu: 2
      memory: 8Gi
    limits:
      cpu: 4
      memory: 16Gi
  # Enable HPA for auto-scaling
  hpa:
    enabled: true
    minReplicas: 3
    maxReplicas: 10
    metrics:
      - type: Resource
        resource:
          name: cpu
          target:
            type: Utilization
            averageUtilization: 70

dataNode:
  replicas: 2
  resources:
    requests:
      cpu: 1
      memory: 4Gi
    limits:
      cpu: 2
      memory: 8Gi

indexNode:
  replicas: 2
  resources:
    requests:
      cpu: 2
      memory: 4Gi
    limits:
      cpu: 4
      memory: 16Gi

# ============================================
# Dependencies
# ============================================

# etcd Configuration
etcd:
  enabled: true
  replicaCount: 3
  resources:
    requests:
      cpu: 1
      memory: 2Gi
    limits:
      cpu: 2
      memory: 4Gi
  persistence:
    enabled: true
    size: 20Gi
    storageClass: "standard"

# MinIO Configuration
minio:
  enabled: true
  mode: distributed
  drivesPerNode: 1
  replicas: 4
  resources:
    requests:
      cpu: 1
      memory: 2Gi
    limits:
      cpu: 2
      memory: 4Gi
  persistence:
    enabled: true
    size: 500Gi
    storageClass: "standard"

# Pulsar Configuration
pulsar:
  enabled: true
  components:
    zookeeper: true
    bookkeeper: true
    broker: true
    proxy: false
  zookeeper:
    replicaCount: 3
    resources:
      requests:
        cpu: 0.5
        memory: 1Gi
  bookkeeper:
    replicaCount: 3
    resources:
      requests:
        cpu: 1
        memory: 4Gi
    persistence:
      enabled: true
      size: 100Gi
  broker:
    replicaCount: 2
    resources:
      requests:
        cpu: 1
        memory: 4Gi

# ============================================
# External Dependencies (Alternative)
# ============================================
# Uncomment to use external services instead of in-cluster

# externalEtcd:
#   enabled: true
#   endpoints:
#     - etcd-0.etcd:2379
#     - etcd-1.etcd:2379
#     - etcd-2.etcd:2379

# externalS3:
#   enabled: true
#   host: s3.amazonaws.com
#   port: 443
#   bucketName: my-milvus-bucket
#   cloudProvider: aws
#   useSSL: true
#   accessKey: "<access-key>"
#   secretKey: "<secret-key>"
#   region: us-east-1

# externalPulsar:
#   enabled: true
#   host: pulsar.example.com
#   port: 6650
```

### Install with Custom Values

```bash
helm install milvus milvus/milvus -f milvus-production.yaml
```

## Scaling Operations

### Horizontal Pod Autoscaling

Query Nodes auto-scale based on CPU:

```bash
# Check HPA status
kubectl get hpa

# Manually scale
kubectl scale deployment milvus-querynode --replicas=5
```

### Vertical Scaling

Update resources and rolling restart:

```bash
# Edit values
helm upgrade milvus milvus/milvus -f milvus-production.yaml

# Watch rolling update
kubectl get pods -w
```

## Upgrading Milvus

### Check Current Version

```bash
helm list
kubectl get deployment milvus-proxy -o jsonpath='{.spec.template.spec.containers[0].image}'
```

### Upgrade to New Version

```bash
# Update chart
helm repo update

# Upgrade with new image tag
helm upgrade milvus milvus/milvus \
  --set image.tag=v2.5.5 \
  -f milvus-production.yaml

# Verify rollout
kubectl rollout status deployment/milvus-proxy
```

### Rollback if Issues

```bash
# Check history
helm history milvus

# Rollback
helm rollback milvus 2
```

## Monitoring Setup

### Enable ServiceMonitor (Prometheus Operator)

```yaml
metrics:
  serviceMonitor:
    enabled: true
    interval: 30s
    namespace: monitoring
```

### Grafana Dashboard

Import the [official Milvus dashboard](https://github.com/milvus-io/milvus/blob/master/deployments/monitor/grafana/milvus-dashboard.json):

```bash
kubectl create configmap milvus-grafana-dashboard \
  --from-file=milvus-dashboard.json \
  -n monitoring
```

## Backup Configuration

### etcd Backup CronJob

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
            - /bin/sh
            - -c
            - |
              etcdctl snapshot save /backup/etcd-$(date +%Y%m%d-%H%M).db \
                --endpoints=milvus-etcd-0:2379
            env:
            - name: ETCDCTL_API
              value: "3"
            volumeMounts:
            - name: backup
              mountPath: /backup
          volumes:
          - name: backup
            persistentVolumeClaim:
              claimName: etcd-backup-pvc
          restartPolicy: OnFailure
```

## Troubleshooting

### Check Component Logs

```bash
# Proxy logs
kubectl logs -l app.kubernetes.io/component=proxy --tail=100 -f

# QueryNode logs
kubectl logs -l app.kubernetes.io/component=querynode --tail=100

# Previous container logs (if crashed)
kubectl logs -l app.kubernetes.io/component=querynode --previous
```

### Common Issues

**Pods stuck in Pending:**
```bash
kubectl describe pod milvus-querynode-xxx
# Check: Resource limits, node selectors, PVC binding
```

**etcd connection errors:**
```bash
# Check etcd health
kubectl exec milvus-etcd-0 -- etcdctl endpoint health

# Check endpoints config
kubectl get cm milvus-config -o yaml | grep ETCD
```

**OOMKilled:**
```bash
# Check memory usage
kubectl top pod -l app.kubernetes.io/instance=milvus

# Increase limits in values file
```

## Production Checklist

Before going live:

- [ ] Resource limits set for all components
- [ ] HPA configured for Query Nodes
- [ ] PVCs have appropriate storage class
- [ ] External access via LoadBalancer or Ingress
- [ ] Monitoring and alerting configured
- [ ] Backup strategy tested
- [ ] Rolling update procedure tested
- [ ] Disaster recovery runbook written
- [ ] Security (TLS, auth) enabled

## Next Steps

Learn about each dependency in detail:

→ **[etcd — Metadata Store](../deps/etcd)**

Or dive into configuration:

→ **[Understanding milvus.yaml](../config/overview)**
