---
title: Run NGINX as Container
description: Deploy NGINX as a Docker container with custom configuration
order: 1
---

# 🌐 Run NGINX as Container

NGINX is a high-performance web server and reverse proxy. Running it as a container provides flexibility and ease of deployment.

## Quick Start

```bash
docker run -d -p 80:80 --name nginx nginx:alpine
```

## With Custom Configuration

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./html:/usr/share/nginx/html:ro
    restart: unless-stopped
```

## Dockerfile

```dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY html/ /usr/share/nginx/html/
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
```

## See Also

- [OpenSSL for Testing](/docs/nginx/ssl)
- [PAM Authentication](/docs/nginx/pam)
- [Deploy Static App](/docs/nginx/static)
