---
title: Getting Started - LDAP Manager Installation Guide
description: Quick start guide for LDAP Manager. Learn how to install and configure LDAP Manager with Docker, Docker Compose, and multi-cluster setup.
---

# Getting Started

Quick start guide to get LDAP Manager up and running in minutes.
## Prerequisites
- Docker 20.10+
- Docker Compose 2.0+ (optional)
- OpenLDAP server (local or remote)
- `config.yml` file with LDAP cluster configuration
## Step 1: Create Configuration File
Create a `config.yml` file with your LDAP cluster details:


### Single Node Example


```yml
clusters:
  - name: "Production LDAP"
    host: "ldap.example.com"
    port: 389
    bind_dn: "cn=Manager,dc=example,dc=com"
    base_dn: "dc=example,dc=com"  # Optional - auto-discovered if omitted
```


### Multi-Master Cluster Example


```yml
clusters:
  - name: "LDAP Cluster"
    nodes:
      - host: "ldap1.example.com"
        port: 389
      - host: "ldap2.example.com"
        port: 389
      - host: "ldap3.example.com"
        port: 389
    bind_dn: "cn=Manager,dc=example,dc=com"
```


### Docker Host Connection


For connecting to LDAP running on Docker host:


```
clusters:
  - name: "Local Docker LDAP"
    host: "host.docker.internal"  # Docker Desktop (Mac/Windows)
    # host: "172.17.0.1"          # Linux Docker
    port: 389
    bind_dn: "cn=Manager,dc=example,dc=com"
```


> **Note:** **Tip:** Download the example config:

```
wget https://raw.githubusercontent.com/VibhuviOiO/ldap-manager/main/config.example.yml -O config.yml
```


## Step 2: Run with Docker


### Option A: Docker Run (Fastest)


```
docker run -d \
  --name ldap-manager \
  -p 5173:5173 \
  -p 8000:8000 \
  -v $(pwd)/config.yml:/app/config.yml:ro \
  ghcr.io/vibhuvioio/ldap-manager:latest
```


Access the UI at `http://localhost:5173` (Frontend) or `http://localhost:8000` (API)


### Option B: Docker Compose (Recommended)



Download docker-compose.prod.yml:


```
wget https://raw.githubusercontent.com/VibhuviOiO/ldap-manager/main/docker-compose.prod.yml
```


Start the application:


```
docker-compose -f docker-compose.prod.yml up -d
```


Access the UI at `http://localhost:5173` (or `http://localhost:8000` for API)


## Step 3: First Time Setup

1. Open `http://localhost:5173` in your browser
2. Click on your cluster name
3. Enter the bind DN password when prompted
4. Password is encrypted and cached securely with Fernet (AES-128-CBC)
5. Cached passwords expire after 1 hour (default)


> **Note:** **Security:** Passwords are encrypted at rest using Fernet symmetric encryption with automatic TTL expiration. Encryption keys are stored in `/app/.secrets/` with 0600 file permissions. Never stored in plaintext. See [Security Guide](security.html) for details.


## Local Development



### Backend


```
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```


### Frontend


```
cd frontend
npm install
npm run dev
```


Access the development UI at `http://localhost:5173`


## Verify Installation


Check if the services are running:


```
# Check backend health
curl http://localhost:8000/health

# Check frontend
curl http://localhost:5173
```


## Next Steps

- Configure multiple clusters
- Explore features
- Review security best practices