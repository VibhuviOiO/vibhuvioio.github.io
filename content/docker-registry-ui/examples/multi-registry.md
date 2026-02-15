---
title: Multi-Registry Setup
description: Multi-Registry Setup for Docker Registry UI
---

# Example: Multi-Registry Setup
            
            ## Overview
            Set up multiple Docker registries with different configurations using docker run commands.

            ## Step 1: Create Network
            ```
# Create Docker network
docker network create registry-net
```

            ## Step 2: Start Multiple Registries
            ```
# Development registry (no auth)
docker run -d --name registry-dev --network registry-net -p 5001:5000 \
  -e REGISTRY_STORAGE_DELETE_ENABLED=true \
  registry:2

# Staging registry (no auth)
docker run -d --name registry-staging --network registry-net -p 5002:5000 \
  -e REGISTRY_STORAGE_DELETE_ENABLED=true \
  registry:2

# Production registry (no auth)
docker run -d --name registry-prod --network registry-net -p 5003:5000 \
  -e REGISTRY_STORAGE_DELETE_ENABLED=true \
  registry:2
```

            ## Step 3: Test Registries
            ```
# Test all registries
curl http://localhost:5001/v2/_catalog
curl http://localhost:5002/v2/_catalog
curl http://localhost:5003/v2/_catalog

# Push test images
docker pull alpine:3.18

# Push to development
docker tag alpine:3.18 localhost:5001/dev/alpine:test
docker push localhost:5001/dev/alpine:test

# Push to staging
docker tag alpine:3.18 localhost:5002/staging/alpine:test
docker push localhost:5002/staging/alpine:test

# Push to production
docker tag alpine:3.18 localhost:5003/prod/alpine:test
docker push localhost:5003/prod/alpine:test
```

            ## Step 4: Start Registry UI
            ```
# Create multi-registry config
cat  registries.config.json
{
  "registries": [
    {
      "name": "Development",
      "api": "http://registry-dev:5000"
    },
    {
      "name": "Staging",
      "api": "http://registry-staging:5000"
    },
    {
      "name": "Production",
      "api": "http://registry-prod:5000"
    }
  ]
}
EOF

# Start Registry UI
docker run -d --name registry-ui --network registry-net -p 5000:5000 \
  -v $(pwd)/registries.config.json:/app/registries.config.json:ro \
  -v $(pwd)/data:/app/data \
  ghcr.io/vibhuvioio/docker-registry-ui:latest
```

            ## Alternative: Docker Compose
            ```
# Download multi-registry compose
wget https://raw.githubusercontent.com/VibhuviOiO/docker-registry-ui/refs/heads/main/docker/docker-compose-multi-registry.yml

# Start all services
docker-compose -f docker-compose-multi-registry.yml up -d
```

            ## Access
            
                **Registry UI:** http://localhost:5000
                **Development Registry:** http://localhost:5001
                **Staging Registry:** http://localhost:5002
                **Production Registry:** http://localhost:5003
            

            ## Cleanup
            ```
# Stop and remove containers
docker stop registry-ui registry-dev registry-staging registry-prod
docker rm registry-ui registry-dev registry-staging registry-prod
docker network rm registry-net
rm -f registries.config.json
```

            ## Next Steps
            
                [Add Authentication to Registries](example-basic-auth.html)
                [Advanced Configuration Options](configuration.html)
                [Security Best Practices](security.html)