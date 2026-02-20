---
title: Keycloak IAM
description: Identity and Access Management with Keycloak
---

# Keycloak IAM

Open Source Identity and Access Management solution.

## Docker Compose

```yaml
version: '3.8'

services:
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: keycloak
    ports:
      - "8080:8080"
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: postgres
      KC_DB_PASSWORD: postgres
    command:
      - start-dev
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    container_name: keycloak-db
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

## Usage

### Start Keycloak

```bash
docker compose up -d
```

### Access

- **URL**: http://localhost:8080
- **Admin Console**: http://localhost:8080/admin
- **Credentials**: admin / admin

### First Steps

1. Login to admin console
2. Create a realm
3. Create clients and users
4. Configure identity providers

## Features

- Single Sign-On (SSO)
- Identity Brokering
- User Federation
- Admin Console
- Account Management Console
- Standard Protocols (OpenID Connect, OAuth 2.0, SAML)
