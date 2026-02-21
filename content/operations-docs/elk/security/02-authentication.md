---
title: Authentication & Authorization
description: Elasticsearch xpack security — built-in users, custom roles, role mappings, API keys, and securing access to indices.
duration: "30m"
readingTime: "20m"
labTime: "10m"
order: 2
---

## Enabling Security

Security is enabled by default in Elasticsearch 8.x. For earlier versions or Docker setups:

```yaml
# elasticsearch.yml
xpack.security.enabled: true
```

In Docker Compose:

```yaml
environment:
  - xpack.security.enabled=true
  - ELASTIC_PASSWORD=changeme
```

## Built-in Users

Elasticsearch ships with reserved users for internal services:

| User | Purpose |
|------|---------|
| `elastic` | Superuser — full cluster access |
| `kibana_system` | Kibana connects to Elasticsearch |
| `logstash_system` | Logstash monitoring |
| `beats_system` | Beats monitoring |
| `apm_system` | APM server |
| `remote_monitoring_user` | Cross-cluster monitoring |

### Set Built-in User Passwords

**Interactive (first time setup):**

```bash
docker exec -it elasticsearch bin/elasticsearch-setup-passwords interactive
```

**Auto-generate passwords:**

```bash
docker exec -it elasticsearch bin/elasticsearch-setup-passwords auto
```

**Change a specific password:**

```bash
curl -k -u elastic:oldpassword -X POST \
  "https://localhost:9200/_security/user/elastic/_password" \
  -H 'Content-Type: application/json' -d'
{
  "password": "newpassword"
}'
```

## Creating Users

### Create a User

```bash
curl -k -u elastic:changeme -X POST \
  "https://localhost:9200/_security/user/app_reader" \
  -H 'Content-Type: application/json' -d'
{
  "password": "reader_password_123",
  "roles": ["read_logs"],
  "full_name": "Application Log Reader",
  "email": "reader@example.com",
  "enabled": true
}'
```

### List Users

```bash
curl -k -u elastic:changeme \
  "https://localhost:9200/_security/user?pretty"
```

### Delete a User

```bash
curl -k -u elastic:changeme -X DELETE \
  "https://localhost:9200/_security/user/app_reader"
```

## Roles

Roles define what a user can do. They combine cluster privileges and index privileges.

### Create a Read-Only Role

```bash
curl -k -u elastic:changeme -X POST \
  "https://localhost:9200/_security/role/read_logs" \
  -H 'Content-Type: application/json' -d'
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-*", "filebeat-*"],
      "privileges": ["read", "view_index_metadata"],
      "field_security": {
        "grant": ["*"],
        "except": ["password", "secret"]
      }
    }
  ]
}'
```

### Create a Write Role

```bash
curl -k -u elastic:changeme -X POST \
  "https://localhost:9200/_security/role/write_logs" \
  -H 'Content-Type: application/json' -d'
{
  "cluster": ["monitor", "manage_index_templates"],
  "indices": [
    {
      "names": ["logs-*"],
      "privileges": ["write", "create_index", "create", "index", "delete"]
    }
  ]
}'
```

### Create an Admin Role (Non-Superuser)

```bash
curl -k -u elastic:changeme -X POST \
  "https://localhost:9200/_security/role/cluster_admin" \
  -H 'Content-Type: application/json' -d'
{
  "cluster": [
    "monitor",
    "manage",
    "manage_ilm",
    "manage_index_templates",
    "manage_pipeline",
    "manage_ingest_pipelines"
  ],
  "indices": [
    {
      "names": ["*"],
      "privileges": ["all"]
    }
  ]
}'
```

## Cluster Privileges Reference

| Privilege | Access |
|-----------|--------|
| `all` | Full cluster access |
| `monitor` | Read-only cluster state, stats, health |
| `manage` | Cluster management (settings, templates) |
| `manage_security` | Manage users and roles |
| `manage_ilm` | Manage ILM policies |
| `manage_index_templates` | Create/delete index templates |
| `manage_pipeline` | Manage ingest pipelines |
| `manage_ml` | Manage machine learning jobs |

## Index Privileges Reference

| Privilege | Access |
|-----------|--------|
| `all` | Full index access |
| `read` | Search and get |
| `write` | Index, update, delete documents |
| `create_index` | Create new indices |
| `delete_index` | Delete indices |
| `manage` | Manage index settings |
| `monitor` | Index stats and status |
| `view_index_metadata` | View mappings, settings, aliases |

## Field-Level Security

Restrict which fields a role can see:

```bash
curl -k -u elastic:changeme -X POST \
  "https://localhost:9200/_security/role/restricted_reader" \
  -H 'Content-Type: application/json' -d'
{
  "indices": [
    {
      "names": ["customers-*"],
      "privileges": ["read"],
      "field_security": {
        "grant": ["name", "email", "created_at"],
        "except": []
      }
    }
  ]
}'
```

## Document-Level Security

Restrict which documents a role can see:

```bash
curl -k -u elastic:changeme -X POST \
  "https://localhost:9200/_security/role/team_reader" \
  -H 'Content-Type: application/json' -d'
{
  "indices": [
    {
      "names": ["projects-*"],
      "privileges": ["read"],
      "query": {
        "term": {
          "team": "engineering"
        }
      }
    }
  ]
}'
```

This user only sees documents where `team == "engineering"`.

## API Keys

API keys are the preferred authentication method for services and automation.

### Create an API Key

```bash
curl -k -u elastic:changeme -X POST \
  "https://localhost:9200/_security/api_key" \
  -H 'Content-Type: application/json' -d'
{
  "name": "logstash-writer",
  "expiration": "30d",
  "role_descriptors": {
    "logstash_writer": {
      "cluster": ["monitor", "manage_index_templates"],
      "indices": [
        {
          "names": ["logstash-*"],
          "privileges": ["write", "create_index"]
        }
      ]
    }
  }
}'
```

Response includes `id` and `api_key`. Use them as:

```bash
# Base64 encode id:api_key
echo -n "ID:API_KEY" | base64

# Use in requests
curl -k -H "Authorization: ApiKey BASE64_ENCODED_KEY" \
  "https://localhost:9200/_cluster/health"
```

### Manage API Keys

```bash
# List all API keys
curl -k -u elastic:changeme \
  "https://localhost:9200/_security/api_key?pretty"

# Invalidate an API key
curl -k -u elastic:changeme -X DELETE \
  "https://localhost:9200/_security/api_key" \
  -H 'Content-Type: application/json' -d'
{
  "ids": ["key-id-here"]
}'
```

## Service Authentication for the Stack

### Kibana

```yaml
# kibana.yml
elasticsearch.username: "kibana_system"
elasticsearch.password: "kibana_password"
```

### Logstash

```ruby
# logstash output
output {
  elasticsearch {
    hosts => ["https://elasticsearch:9200"]
    user => "logstash_writer"
    password => "writer_password"
    ssl_certificate_authorities => "/etc/logstash/certs/ca.crt"
  }
}
```

### Filebeat

```yaml
# filebeat.yml
output.elasticsearch:
  hosts: ["https://elasticsearch:9200"]
  username: "filebeat_writer"
  password: "writer_password"
  ssl.certificate_authorities: ["/etc/filebeat/certs/ca.crt"]
```

## Security Checklist

| Setting | Status |
|---------|--------|
| `xpack.security.enabled: true` | |
| Transport TLS enabled | |
| HTTP TLS enabled | |
| Default passwords changed | |
| `elastic` superuser password secured | |
| Service accounts created (Kibana, Logstash, Beats) | |
| Application roles created with least privilege | |
| API keys used for automation | |
| Field-level security for sensitive data | |
| Anonymous access disabled | |

## Lab: Secure Your Cluster

1. Enable security and set passwords for built-in users
2. Create a read-only role for the `logs-*` index pattern
3. Create a user with the read-only role
4. Test access — verify the user can read but not write
5. Create an API key for a Logstash writer
6. Test the API key with a curl request

## Next Steps

- [Logstash Data Migration](/learn/elk/logstash/04-data-migration) — migrate data between secured clusters
- [Filebeat](/learn/elk/beats/01-filebeat) — ship logs with authentication
