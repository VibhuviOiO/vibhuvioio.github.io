---
title: Deploy MySQL as Container
description: Run MySQL/MariaDB in Docker with persistent storage
order: 1
---

# 🐬 Deploy MySQL as Container

MySQL is the world's most popular open source database. Running it in Docker makes deployment and scaling straightforward.

## Quick Start

```bash
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=secretpassword \
  -e MYSQL_DATABASE=myapp \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0
```

## Docker Compose

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

volumes:
  mysql_data:
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MYSQL_ROOT_PASSWORD` | Root password (required) |
| `MYSQL_DATABASE` | Database to create |
| `MYSQL_USER` | Additional user |
| `MYSQL_PASSWORD` | Password for additional user |

## See Also

- [Backup & Restore](/docs/mysql/backup-restore)
