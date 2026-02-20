---
title: MinIO Object Storage
description: S3-compatible object storage with Docker Compose
---

# MinIO Object Storage

Self-hosted S3-compatible object storage for development and production.

## Docker Compose

```yaml
version: '3.8'

services:
  minio:
    image: minio/minio:latest
    container_name: minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

volumes:
  minio-data:
```

## Usage

### Start MinIO

```bash
docker compose up -d
```

### Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| S3 API | http://localhost:9000 | minioadmin / minioadmin |
| Web Console | http://localhost:9001 | minioadmin / minioadmin |

### Create a Bucket

Using the web console:
1. Open http://localhost:9001
2. Login with credentials
3. Click "Create Bucket"
4. Enter bucket name and create

### Using AWS CLI

```bash
# Configure AWS CLI for MinIO
aws configure --profile minio
# AWS Access Key ID: minioadmin
# AWS Secret Access Key: minioadmin
# Default region: us-east-1

# List buckets
aws --profile minio --endpoint-url http://localhost:9000 s3 ls

# Upload a file
aws --profile minio --endpoint-url http://localhost:9000 s3 cp file.txt s3://mybucket/
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| MINIO_ROOT_USER | minioadmin | Root access key |
| MINIO_ROOT_PASSWORD | minioadmin | Root secret key |

## Volumes

- **minio-data**: Object storage data directory
