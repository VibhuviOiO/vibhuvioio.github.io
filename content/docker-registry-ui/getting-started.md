---
title: Getting Started
description: Getting Started for Docker Registry UI
---

# Getting Started

            ## Docker Run
            ```
# Create Docker network
docker network create registry-net

# Start test registry
docker run -d --name test-registry --network registry-net -p 5001:5000 \
  -e REGISTRY_STORAGE_DELETE_ENABLED=true registry:2

# Run Registry UI (using container name)
docker run -d --name registry-ui --network registry-net -p 5000:5000 \
  -e 'REGISTRIES=[{"name":"Local Registry","api":"http://test-registry:5000"}]' \
  -v $(pwd)/data:/app/data \
  ghcr.io/vibhuvioio/docker-registry-ui:latest
```

            ### Activity Log - Docker Run
            
                **📋 Click to view test results**
                ```
# Docker Run Test Results - Docker Network Approach
# Date: 2025-12-02

$ docker network create registry-net
Error response from daemon: network with name registry-net already exists

$ docker run -d --name test-registry --network registry-net -p 5001:5000 \
  -e REGISTRY_STORAGE_DELETE_ENABLED=true registry:2
c991c042ebb30d9d2643005ab7f4e4a033ba64aa6fdb94175bfa42fb00ff54f1

$ docker run -d --name registry-ui --network registry-net -p 5005:5000 \
  -e 'REGISTRIES=[{"name":"Local Registry","api":"http://test-registry:5000"}]' \
  -v $(pwd)/data:/app/data \
  ghcr.io/vibhuvioio/docker-registry-ui:latest
ef26a979e49cf3a118601771d9068cba7537caac108614d4f4c682bfe1a9557f

$ docker ps -a
CONTAINER ID   IMAGE                                          COMMAND                  CREATED          STATUS          PORTS                                       NAMES
ef26a979e49c   ghcr.io/vibhuvioio/docker-registry-ui:latest   "uvicorn asgi:app --…"   2 seconds ago    Up 2 seconds    0.0.0.0:5005->5000/tcp, :::5005->5000/tcp   registry-ui
c991c042ebb3   registry:2                                     "/entrypoint.sh /etc…"   16 seconds ago   Up 15 seconds   0.0.0.0:5001->5000/tcp, :::5001->5000/tcp   test-registry

# Push test images
$ docker pull nginx:alpine && docker tag nginx:alpine localhost:5001/nginx:alpine && docker tag nginx:alpine localhost:5001/nginx:latest
alpine: Pulling from library/nginx
Digest: sha256:b3c656d55d7ad751196f21b7fd2e8d4da9cb430e32f646adcf92441b72f82b14
Status: Image is up to date for nginx:alpine

$ docker push localhost:5001/nginx:alpine && docker push localhost:5001/nginx:latest
The push refers to repository [localhost:5001/nginx]
194fa24e147d: Pushed 
alpine: digest: sha256:667473807103639a0aca5b49534a216d2b64f0fb868aaa801f023da0cdd781c7 size: 2495
latest: digest: sha256:667473807103639a0aca5b49534a216d2b64f0fb868aaa801f023da0cdd781c7 size: 2495

# Access UI at http://localhost:5005 to see the nginx images
```
            

            ## Docker Compose
            
            ### Development
            ```
# Clone repository
git clone https://github.com/vibhuvi/docker-registry-ui.git
cd docker-registry-ui

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Access UI at http://localhost:5005
```
            
            #### Activity Log - Development Compose
            
                **📋 Click to view test results**
                ```
# Development Compose Test Results
# Date: 2025-12-02

$ git clone https://github.com/vibhuvi/docker-registry-ui.git
Cloning into 'docker-registry-ui'...
remote: Enumerating objects: 1234, done.
remote: Total 1234 (delta 0), reused 0 (delta 0), pack-reused 1234
Receiving objects: 100% (1234/1234), 2.5 MiB | 1.2 MiB/s, done.

$ cd docker-registry-ui
$ docker-compose -f docker-compose.dev.yml up -d
[+] Running 2/2
 ✔ Container docker-registry-ui-registry-1     Running
 ✔ Container docker-registry-ui-registry-ui-1  Started

$ curl http://localhost:5005/api/registries
{"registries":[{"api":"http://registry:5000","isAuthEnabled":false,"name":"Local Registry"}]}

# Access development UI at http://localhost:5005
```
            

            ## Local Python Development
            ```
git clone https://github.com/vibhuvi/docker-registry-ui.git
cd docker-registry-ui
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

            ## Production Examples
            Ready-to-use production setups:

            
            ### Single Registry Setup
            ```
# Download files
wget https://raw.githubusercontent.com/VibhuviOiO/docker-registry-ui/main/docker/single-registry/docker-compose.yml
wget https://raw.githubusercontent.com/VibhuviOiO/docker-registry-ui/main/docker/single-registry/registries.config.json

# Start
docker-compose up -d

# Access UI at http://localhost:5000
```
            
            ### Multi-Registry Setup
            ```
# Download files
wget https://raw.githubusercontent.com/VibhuviOiO/docker-registry-ui/main/docker/multi-registry/docker-compose.yml
wget https://raw.githubusercontent.com/VibhuviOiO/docker-registry-ui/main/docker/multi-registry/registries.config.json
wget https://raw.githubusercontent.com/VibhuviOiO/docker-registry-ui/main/docker/multi-registry/populate-test-images.sh

# Start
docker-compose up -d

# Populate test images
chmod +x populate-test-images.sh
./populate-test-images.sh

# Access UI at http://localhost:5003
```
            
            ### Basic Auth Setup
            ```
# Download files
wget https://raw.githubusercontent.com/VibhuviOiO/docker-registry-ui/main/docker/basic-auth/docker-compose.yml
wget https://raw.githubusercontent.com/VibhuviOiO/docker-registry-ui/main/docker/basic-auth/registries.config.json
wget https://raw.githubusercontent.com/VibhuviOiO/docker-registry-ui/main/docker/basic-auth/nginx.conf

# Start
docker-compose up -d

# Access UI at http://localhost:5003
# Auth Registry: admin/secret
```