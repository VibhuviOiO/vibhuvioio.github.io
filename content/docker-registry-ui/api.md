---
title: Api
description: Api for Docker Registry UI
---

# API Integration

            ## Setting Up Docker Registry
            Before using the UI, you need a running Docker Registry. Here are two methods:

            ### Method 1: Docker Run
            ```
docker run -d \
  --name docker-registry \
  -p 5001:5000 \
  -e REGISTRY_STORAGE_DELETE_ENABLED=true \
  -v registry-data:/var/lib/registry \
  registry:2
```

            ### Method 2: Docker Compose
            Create a `docker-compose.yml` file:

            ```
version: '3.8'

services:
  registry:
    image: registry:2
    container_name: docker-registry
    ports:
      - "5001:5000"
    environment:
      REGISTRY_STORAGE_DELETE_ENABLED: "true"
    volumes:
      - registry-data:/var/lib/registry
    restart: unless-stopped

volumes:
  registry-data:
```

            Start the registry:

            ```
docker compose up -d
```

            ### Verify Registry is Running
            ```
# Check registry health
curl http://localhost:5001/v2/

# Should return: {}
```

            ## Docker Registry v2 API
            The UI integrates with Docker Registry v2 API endpoints to display repository and image information.

            ## Complete Flow: Pull to UI Display
            ### Example: nginx image
            ```
# 1. Pull image from Docker Hub
docker pull nginx:latest

# 2. Tag for local registry
docker tag nginx:latest localhost:5001/nginx:latest

# 3. Push to local registry
docker push localhost:5001/nginx:latest
```

            ### List Repositories
            ```
GET /v2/_catalog

Response:
{
  "repositories": [
    "nginx",
    "myapp",
    "postgres"
  ]
}
```

            ### List Tags
            ```
GET /v2/&lt;repository&gt;/tags/list

Response:
{
  "name": "myapp",
  "tags": [
    "latest",
    "1.0",
    "1.1"
  ]
}
```

            ### Get Manifest (OCI Index - Multi-platform)
            ```
GET /v2/&lt;repository&gt;/manifests/&lt;tag&gt;
Accept: application/vnd.oci.image.index.v1+json

Response:
{
  "schemaVersion": 2,
  "mediaType": "application/vnd.oci.image.index.v1+json",
  "manifests": [
    {
      "mediaType": "application/vnd.oci.image.manifest.v1+json",
      "digest": "sha256:abc123...",
      "size": 1234,
      "platform": {
        "architecture": "amd64",
        "os": "linux"
      }
    }
  ]
}
```

            ### Get Actual Manifest Using Digest
            ```
GET /v2/&lt;repository&gt;/manifests/&lt;digest&gt;
Accept: application/vnd.oci.image.manifest.v1+json

Response:
{
  "schemaVersion": 2,
  "mediaType": "application/vnd.oci.image.manifest.v1+json",
  "config": {
    "mediaType": "application/vnd.oci.image.config.v1+json",
    "digest": "sha256:config123...",
    "size": 7234
  },
  "layers": [
    {
      "mediaType": "application/vnd.oci.image.layer.v1.tar+gzip",
      "digest": "sha256:layer1...",
      "size": 29123456
    },
    {
      "mediaType": "application/vnd.oci.image.layer.v1.tar+gzip",
      "digest": "sha256:layer2...",
      "size": 3456789
    }
  ]
}
```

            ### Delete Image
            ```
DELETE /v2/&lt;repository&gt;/manifests/&lt;digest&gt;

Response:
202 Accepted
```

            ## Size Calculation
            The UI calculates image size by summing all layer sizes plus config size:

            ```
# Calculate total size
curl -s -H "Accept: application/vnd.oci.image.manifest.v1+json" \
  http://localhost:5001/v2/nginx/manifests/sha256:abc123... \
  | jq '([.layers[].size] | add) + .config.size'

# Result: 32587479 bytes = 31.08 MB (compressed)
```

            ## UI Backend API
            The UI provides additional endpoints. All endpoints return JSON.

            ### Scan Image (Async)
            Vulnerability scans are queued and run in the background.

            ```
GET /api/scan/{registry_name}/{repository}/{tag}

Response:
{
  "scanId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "queued"
}
```

            ### Get Scan Status / Results
            Poll this endpoint using the `scanId` returned above.

            ```
GET /api/scan-status/{scan_id}

Response (in progress):
{
  "scanId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "in_progress",
  "registry": "Local Registry",
  "repo": "myapp",
  "tag": "1.0",
  "result": null,
  "error": null
}

Response (completed):
{
  "scanId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "completed",
  "registry": "Local Registry",
  "repo": "myapp",
  "tag": "1.0",
  "result": {
    "total": 42,
    "summary": {
      "CRITICAL": 2,
      "HIGH": 10,
      "MEDIUM": 20,
      "LOW": 10
    },
    "vulnerabilities": [...]
  },
  "error": null
}
```

            ### Get All Scan Results for a Registry
            ```
GET /api/vulnerabilities/{registry_name}

Response:
{
  "results": {
    "myapp:1.0": { ... },
    "nginx:latest": { ... }
  }
}
```

            ### List Registries
            ```
GET /api/registries

Response:
{
  "registries": [
    {
      "name": "Local Registry",
      "api": "http://registry:5000",
      "isAuthEnabled": false,
      "vulnerabilityScan": { ... }
    }
  ]
}
```

            ### List Repositories
            ```
GET /api/repositories/{registry_name}

Response:
{
  "repositories": ["myapp", "nginx", "postgres"]
}
```

            ### List Tags
            ```
GET /api/tags/{registry_name}/{repository}

Response:
{
  "tags": ["latest", "1.0", "1.1"]
}
```

            ### Delete Tag
            ```
DELETE /api/delete/tag/{registry_name}/{repository}/{tag}

Response:
{
  "success": true
}
```

            ### Bulk Operation
            ```
POST /api/bulk-operation
Content-Type: application/json

{
  "registry": "Local Registry",
  "repoPattern": "myapp-*",
  "olderThanDays": 30,
  "keepMin": 2,
  "tagPattern": "v.*",
  "dryRun": true
}
```

            ## Authentication
            Basic authentication is supported:

            ```
Authorization: Basic base64(username:password)
```

            ## Using the Registry
            ### Push an Image
            ```
# Tag an image for your registry
docker tag nginx:latest localhost:5001/nginx:latest

# Push to registry
docker push localhost:5001/nginx:latest
```

            ### Pull an Image
            ```
# Pull from registry
docker pull localhost:5001/nginx:latest
```

            ### List Repositories via API
            ```
# List all repositories
curl http://localhost:5001/v2/_catalog

# List tags for a repository
curl http://localhost:5001/v2/nginx/tags/list
```

            ## Garbage Collection
            Deleting tags only removes manifest references. To free disk space, run garbage collection:

            ```
# Run garbage collection
docker exec docker-registry bin/registry garbage-collect /etc/docker/registry/config.yml

# Or with dry-run to preview
docker exec docker-registry bin/registry garbage-collect --dry-run /etc/docker/registry/config.yml
```

            ## Registry Configuration for Delete Operations
            To enable delete operations, the registry must have `REGISTRY_STORAGE_DELETE_ENABLED=true`. This is required for:

            
                Deleting individual tags
                Bulk delete operations
                Cleanup workflows
            

            ## Important Notes
            
                **Compressed vs Uncompressed**: Registry stores compressed layers, so sizes shown are compressed (smaller than `docker images` shows)
                **Multi-platform**: OCI indexes contain multiple platform manifests (amd64, arm64, etc.)
                **Attestations**: Skip manifests with `vnd.docker.reference.type: attestation-manifest`
                **Size Accuracy**: Sizes are exact bytes from registry, not estimates
                **Delete Enabled**: Must set `REGISTRY_STORAGE_DELETE_ENABLED=true` for delete operations