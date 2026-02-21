---
title: Filebeat — Log Collection
description: Ship logs to Elasticsearch with Filebeat — system logs, Docker container autodiscover, modules, processors, and production configuration.
duration: "30m"
readingTime: "15m"
labTime: "15m"
order: 1
---

## Project Structure

```tree
filebeat/
├── docker-compose.yml
├── .env
└── filebeat.yml
```

## Architecture

```
Log Files → Filebeat → Elasticsearch → Kibana
                    → Logstash → Elasticsearch → Kibana
```

Filebeat uses a **harvester** per file. Each harvester reads a file line by line and sends events. A **registrar** tracks the read position so no data is lost on restart.

## Docker Compose Setup

```yaml
services:
  filebeat:
    image: docker.elastic.co/beats/filebeat:8.12.0
    user: root
    command: filebeat -e --strict.perms=false
    volumes:
      - ./filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /var/log:/var/log:ro
      - filebeat-data:/usr/share/filebeat/data
    environment:
      - ELASTICSEARCH_HOST=elasticsearch:9200
      - KIBANA_HOST=kibana:5601
    depends_on:
      elasticsearch:
        condition: service_healthy
    networks:
      - elastic

volumes:
  filebeat-data:
```

**Why `user: root`?** Filebeat needs root access to read Docker container logs and the Docker socket.

## Basic Configuration

### filebeat.yml

```yaml
# ======= Filebeat inputs =======
filebeat.inputs:

  # System logs
  - type: log
    enabled: true
    paths:
      - /var/log/syslog
      - /var/log/auth.log
    fields:
      log_type: syslog
    fields_under_root: true

  # Application logs
  - type: log
    enabled: true
    paths:
      - /var/log/myapp/*.log
    multiline:
      pattern: '^\d{4}-\d{2}-\d{2}'
      negate: true
      match: after
    fields:
      log_type: application

# ======= Output =======
output.elasticsearch:
  hosts: ["${ELASTICSEARCH_HOST}"]
  protocol: "http"

# ======= Kibana =======
setup.kibana:
  host: "${KIBANA_HOST}"

# ======= Dashboards =======
setup.dashboards.enabled: true
```

## Modules

Modules provide pre-built configurations for common log formats.

### Enable Modules

```bash
# List available modules
filebeat modules list

# Enable system module
filebeat modules enable system

# Enable nginx module
filebeat modules enable nginx
```

### System Module

Collects syslog and auth logs:

```yaml
# modules.d/system.yml
- module: system
  syslog:
    enabled: true
    var.paths: ["/var/log/syslog"]
  auth:
    enabled: true
    var.paths: ["/var/log/auth.log"]
```

### Nginx Module

```yaml
# modules.d/nginx.yml
- module: nginx
  access:
    enabled: true
    var.paths: ["/var/log/nginx/access.log"]
  error:
    enabled: true
    var.paths: ["/var/log/nginx/error.log"]
```

### Auditd Module

```yaml
# modules.d/auditd.yml
- module: auditd
  log:
    enabled: true
    var.paths: ["/var/log/audit/audit.log"]
```

## Docker Autodiscover

Automatically collect logs from Docker containers without configuring each one:

```yaml
filebeat.autodiscover:
  providers:
    - type: docker
      hints.enabled: true
      hints.default_config:
        type: container
        paths:
          - /var/lib/docker/containers/${data.container.id}/*.log
```

### Container Hints

Add labels to Docker containers to customize Filebeat behavior:

```yaml
# docker-compose.yml
services:
  myapp:
    image: myapp:latest
    labels:
      co.elastic.logs/enabled: "true"
      co.elastic.logs/module: "nginx"
      co.elastic.logs/fileset.stdout: "access"
      co.elastic.logs/fileset.stderr: "error"
```

### Exclude Specific Containers

```yaml
filebeat.autodiscover:
  providers:
    - type: docker
      hints.enabled: true
      templates:
        - condition:
            not:
              contains:
                docker.container.name: "noisy-container"
          config:
            - type: container
              paths:
                - /var/lib/docker/containers/${data.container.id}/*.log
```

## Processors

Processors transform events before they're sent to the output.

### Common Processors

```yaml
processors:
  # Add cloud provider metadata (AWS, GCP, Azure)
  - add_cloud_metadata: ~

  # Add Docker container metadata
  - add_docker_metadata:
      host: "unix:///var/run/docker.sock"

  # Add host information
  - add_host_metadata:
      when.not.contains.tags: forwarded
      netinfo.enabled: true

  # Add locale offset
  - add_locale:
      format: offset

  # Drop events matching a condition
  - drop_event:
      when:
        contains:
          message: "health_check"

  # Drop specific fields
  - drop_fields:
      fields: ["agent.ephemeral_id", "agent.hostname"]

  # Add custom fields
  - add_fields:
      target: environment
      fields:
        name: production
        region: us-east-1
```

### Multiline Handling

For stack traces and multi-line log entries:

```yaml
filebeat.inputs:
  - type: log
    paths:
      - /var/log/java-app.log
    multiline:
      # Java stack trace pattern
      pattern: '^\s+(at|\.{3})\s|^Caused by:'
      negate: false
      match: after
      max_lines: 50
      timeout: 5s
```

## Output Configuration

### Elasticsearch Output

```yaml
output.elasticsearch:
  hosts: ["https://elasticsearch:9200"]
  username: "${ELASTICSEARCH_USERNAME}"
  password: "${ELASTICSEARCH_PASSWORD}"
  ssl.certificate_authorities: ["/etc/filebeat/certs/ca.crt"]
  index: "filebeat-%{+yyyy.MM.dd}"
  pipeline: "filebeat-pipeline"
```

### Logstash Output

```yaml
output.logstash:
  hosts: ["logstash:5044"]
  ssl.certificate_authorities: ["/etc/filebeat/certs/ca.crt"]
  loadbalance: true
  bulk_max_size: 2048
```

### Multiple Outputs (Not Supported Directly)

Filebeat supports only one output. For multiple destinations, send to Logstash and fan out from there, or use Kafka as a buffer:

```yaml
output.kafka:
  hosts: ["kafka:9092"]
  topic: "filebeat-logs"
  codec.json:
    pretty: false
```

## Monitoring Filebeat

### Enable Xpack Monitoring

```yaml
monitoring.enabled: true
monitoring.elasticsearch:
  hosts: ["http://elasticsearch:9200"]
  username: "beats_system"
  password: "${BEATS_PASSWORD}"
```

### Health Check

```bash
# Test configuration
filebeat test config -c /etc/filebeat/filebeat.yml

# Test output connectivity
filebeat test output -c /etc/filebeat/filebeat.yml
```

## Production Configuration

A complete production-ready `filebeat.yml`:

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/syslog
      - /var/log/auth.log

filebeat.autodiscover:
  providers:
    - type: docker
      hints.enabled: true

filebeat.modules:
  - module: system
    syslog:
      enabled: true
    auth:
      enabled: true
  - module: auditd
    log:
      enabled: true

processors:
  - add_cloud_metadata: ~
  - add_docker_metadata:
      host: "unix:///var/run/docker.sock"
  - add_host_metadata:
      netinfo.enabled: true
  - add_locale:
      format: offset

output.elasticsearch:
  hosts: ["${ELASTICSEARCH_HOST}"]
  username: "${USERNAME}"
  password: "${PASSWORD}"

setup.kibana:
  host: "${KIBANA_HOST}"

setup.dashboards.enabled: true

monitoring.enabled: true
monitoring.elasticsearch:
  hosts: ["${ELASTICSEARCH_HOST}"]
  username: "${USERNAME}"
  password: "${PASSWORD}"

logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
  permissions: 0644
```

## Filebeat vs Logstash

| Feature | Filebeat | Logstash |
|---------|----------|----------|
| Resource usage | ~10MB RAM | ~1GB RAM |
| Parsing | Basic (modules) | Full (grok, dissect, ruby) |
| Transformations | Processors only | Full filter plugins |
| Outputs | One output | Multiple outputs |
| Buffering | Disk-backed | Memory-backed |
| Best for | Shipping logs | Complex transformations |

**Best practice:** Use Filebeat to ship → Logstash to transform → Elasticsearch to store.

## Lab: Deploy Filebeat

1. Add Filebeat to your Docker Compose stack
2. Configure system log collection
3. Enable Docker autodiscover
4. Add processors for metadata enrichment
5. Verify logs appear in Kibana Discover
6. Explore the pre-built dashboards

## Next Steps

- [Metricbeat](/learn/elk/beats/02-metricbeat) — collect system and service metrics
- [Cluster Monitoring](/learn/elk/monitoring/01-cluster-monitoring) — monitor your Elastic Stack
