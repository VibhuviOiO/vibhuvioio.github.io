---
title: Nginx Log Analysis
description: Analyze Nginx access logs with the ELK Stack — parse log formats, detect bots, identify attacks, build traffic dashboards, and monitor user agents.
duration: "40m"
readingTime: "20m"
labTime: "20m"
order: 3
---

## Project Structure

```tree
nginx-logs-study/
├── docker-compose.yml
├── .env
├── pipeline/
│   └── logstash.conf
└── logs/
    └── access.log
```

## Nginx Log Format

### Default Combined Format

```
log_format combined '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent"';
```

### Sample Log Entries

```
106.224.71.104 - - [26/Apr/2022:20:21:47 +0530] "GET /customers/index.html HTTP/1.1" 200 109 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
20.70.152.213 - drishti-admin [26/Apr/2022:20:25:02 +0530] "GET /accounts/protected/sysadmin/credentials HTTP/1.1" 200 109 "-" "curl/7.68.0"
91.207.9.15 - - [07/Apr/2022:08:00:28 +0530] "GET / HTTP/1.1" 502 157 "-" "Mozilla/5.0 (compatible; bot/2.0)"
```

### Field Breakdown

| Field | Example | Meaning |
|-------|---------|---------|
| `$remote_addr` | `106.224.71.104` | Client IP address |
| `$remote_user` | `-` or `drishti-admin` | Authenticated username |
| `$time_local` | `26/Apr/2022:20:21:47 +0530` | Request timestamp |
| `$request` | `GET /customers/index.html HTTP/1.1` | Method, path, protocol |
| `$status` | `200` | HTTP status code |
| `$body_bytes_sent` | `109` | Response size in bytes |
| `$http_referer` | `-` | Referring URL |
| `$http_user_agent` | `Mozilla/5.0...` | Client user agent |

## Ingestion Methods

### Method 1: Filebeat with Nginx Module

The simplest approach — Filebeat's Nginx module parses logs automatically:

```yaml
# filebeat.yml
filebeat.modules:
  - module: nginx
    access:
      enabled: true
      var.paths: ["/var/log/nginx/access.log"]
    error:
      enabled: true
      var.paths: ["/var/log/nginx/error.log"]

output.elasticsearch:
  hosts: ["elasticsearch:9200"]

setup.dashboards.enabled: true
setup.kibana:
  host: "kibana:5601"
```

This gives you pre-built Kibana dashboards for Nginx out of the box.

### Method 2: Logstash with Grok

For custom parsing and enrichment:

```ruby
input {
  file {
    path => "/var/log/nginx/access.log"
    start_position => "beginning"
    sincedb_path => "/dev/null"
    codec => "plain"
  }
}

filter {
  grok {
    match => {
      "message" => '%{IPORHOST:client_ip} - %{DATA:remote_user} \[%{HTTPDATE:timestamp}\] "%{WORD:method} %{URIPATHPARAM:request_uri} HTTP/%{NUMBER:http_version}" %{NUMBER:status:int} %{NUMBER:body_bytes:int} "%{DATA:referrer}" "%{DATA:user_agent}"'
    }
  }

  date {
    match => ["timestamp", "dd/MMM/yyyy:HH:mm:ss Z"]
    target => "@timestamp"
  }

  # Parse user agent
  useragent {
    source => "user_agent"
    target => "ua"
  }

  # GeoIP lookup
  geoip {
    source => "client_ip"
    target => "geoip"
  }

  # Categorize status codes
  if [status] >= 500 {
    mutate { add_field => { "status_category" => "server_error" } }
  } else if [status] >= 400 {
    mutate { add_field => { "status_category" => "client_error" } }
  } else if [status] >= 300 {
    mutate { add_field => { "status_category" => "redirect" } }
  } else {
    mutate { add_field => { "status_category" => "success" } }
  }

  # Remove parsed timestamp field
  mutate {
    remove_field => ["timestamp", "message"]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "nginx-access-%{+YYYY.MM.dd}"
  }
}
```

## Bot Detection

### Known Bot IP Ranges

Maintain a list of known bot IP ranges:

```
91.207.9.1 - 91.207.9.255
102.38.229.1 - 102.38.229.255
```

### Bot Detection in Logstash

```ruby
filter {
  # Tag known bots by user agent
  if [user_agent] =~ /(?i)(bot|crawler|spider|scraper|curl|wget|python-requests|go-http-client)/ {
    mutate { add_tag => ["bot"] }
    mutate { add_field => { "traffic_type" => "bot" } }
  } else {
    mutate { add_field => { "traffic_type" => "human" } }
  }

  # Tag by IP range (known scanners)
  cidr {
    address => ["%{client_ip}"]
    network => [
      "91.207.9.0/24",
      "102.38.229.0/24"
    ]
    add_tag => ["known_scanner"]
  }
}
```

### Deprecated User Agent Detection

Flag requests from outdated browsers that may indicate bots or vulnerable systems:

```ruby
filter {
  # Flag old browsers (Chrome < 80, Firefox < 70, IE)
  if [ua][name] == "IE" or
     ([ua][name] == "Chrome" and [ua][major] < 80) or
     ([ua][name] == "Firefox" and [ua][major] < 70) {
    mutate { add_tag => ["deprecated_browser"] }
  }
}
```

## Attack Detection

### Identify Potential DoS Attacks

High request rates from a single IP within a short time window:

```bash
# Query Elasticsearch for IPs with high request counts
curl -X POST "http://localhost:9200/nginx-access-*/_search?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "query": {
    "range": {
      "@timestamp": {
        "gte": "now-1h"
      }
    }
  },
  "aggs": {
    "top_ips": {
      "terms": {
        "field": "client_ip.keyword",
        "size": 20,
        "order": { "_count": "desc" }
      },
      "aggs": {
        "request_rate": {
          "date_histogram": {
            "field": "@timestamp",
            "fixed_interval": "1m"
          }
        }
      }
    }
  }
}'
```

### Detect Path Scanning

```bash
# IPs hitting many different 404 paths
curl -X POST "http://localhost:9200/nginx-access-*/_search?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "query": {
    "term": { "status": 404 }
  },
  "aggs": {
    "scanners": {
      "terms": {
        "field": "client_ip.keyword",
        "size": 10,
        "min_doc_count": 20
      },
      "aggs": {
        "unique_paths": {
          "cardinality": {
            "field": "request_uri.keyword"
          }
        }
      }
    }
  }
}'
```

### Detect Credential Probing

```bash
# Failed auth attempts (401/403) by IP
curl -X POST "http://localhost:9200/nginx-access-*/_search?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "query": {
    "terms": { "status": [401, 403] }
  },
  "aggs": {
    "brute_force": {
      "terms": {
        "field": "client_ip.keyword",
        "size": 10,
        "min_doc_count": 10
      }
    }
  }
}'
```

## Kibana Dashboards

### Essential Visualizations

Build these in Kibana for a comprehensive Nginx dashboard:

| Visualization | Type | Shows |
|---------------|------|-------|
| Request count over time | Line chart | Traffic trends |
| Status code breakdown | Pie chart | 2xx vs 4xx vs 5xx ratio |
| Top 10 requested paths | Data table | Most popular pages |
| Top 10 client IPs | Data table | Heaviest users |
| Response size histogram | Bar chart | Payload distribution |
| Geographic traffic map | Coordinate map | Visitor locations |
| User agent breakdown | Pie chart | Browser distribution |
| Bot vs human traffic | Metric | Traffic classification |
| 5xx errors over time | Area chart | Server error trends |
| Top referrers | Data table | Where traffic comes from |

### Useful Kibana Queries (KQL)

```
# All 5xx errors
status >= 500

# Bot traffic
tags: "bot"

# Specific path
request_uri: "/api/*"

# Specific client
client_ip: "106.224.71.104"

# Large responses (> 1MB)
body_bytes > 1048576

# POST requests to admin paths
method: "POST" and request_uri: "/admin/*"
```

## Index Template for Nginx Logs

Optimize the index for Nginx log analysis:

```bash
curl -X PUT "http://localhost:9200/_index_template/nginx-logs" \
  -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["nginx-access-*"],
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs-policy",
      "index.lifecycle.rollover_alias": "nginx-access-write"
    },
    "mappings": {
      "properties": {
        "client_ip": { "type": "ip" },
        "method": { "type": "keyword" },
        "request_uri": { "type": "text", "fields": { "keyword": { "type": "keyword" }}},
        "status": { "type": "integer" },
        "body_bytes": { "type": "long" },
        "user_agent": { "type": "text", "fields": { "keyword": { "type": "keyword" }}},
        "referrer": { "type": "text", "fields": { "keyword": { "type": "keyword" }}},
        "traffic_type": { "type": "keyword" },
        "status_category": { "type": "keyword" },
        "geoip": {
          "properties": {
            "location": { "type": "geo_point" },
            "country_name": { "type": "keyword" },
            "city_name": { "type": "keyword" }
          }
        }
      }
    }
  }
}'
```

## Performance Tips

| Tip | Why |
|-----|-----|
| Use `keyword` for fields you filter/aggregate on | Faster than `text` for exact matches |
| Use `ip` type for IP addresses | Enables CIDR range queries |
| Use `geo_point` for locations | Enables map visualizations |
| Set `doc_values: false` on `text` fields you don't aggregate | Saves disk space |
| Use ILM to rotate daily indices | Prevents index bloat |

## Lab: Build an Nginx Log Analysis Pipeline

1. Obtain sample Nginx log files (or use your own)
2. Create a Logstash pipeline with grok parsing
3. Add user agent parsing, GeoIP, and bot detection
4. Create an index template with proper mappings
5. Ingest the logs into Elasticsearch
6. Build a Kibana dashboard with traffic, errors, and bot visualizations
7. Run the attack detection queries

## DevOps Challenge: Attack Detection

This hands-on challenge uses real Nginx access log files to practice threat detection. Download the log files and reference data from the GitHub repository.

### Challenge Data

```bash
mkdir ~/nginx-challenge && cd ~/nginx-challenge

# Download access logs (multiple rotated files)
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/nginx-logs-study/devops-challenge/inputs/access.log

# Download reference data
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/nginx-logs-study/devops-challenge/inputs/bot-ip-range.txt
wget https://raw.githubusercontent.com/JinnaBalu/infinite-containers/main/elastic-stack/nginx-logs-study/devops-challenge/inputs/deprecated-user-agents.txt
```

### Challenge Tasks

**Task 1: Find 5 Attack Patterns**

Ingest the access logs into Elasticsearch and identify at least 5 attack patterns. For each attack, document:
- Attack type (DOS, bot attack, credential probing, path scanning)
- Timestamp range
- Source IP(s)
- Evidence (request count, paths targeted, status codes)

**Task 2: Bot IP Range Detection**

The `bot-ip-range.txt` file contains known bot IP ranges:

```
91.207.9.1 - 91.207.9.255
102.38.229.1 - 102.38.229.255
```

Write an Elasticsearch query to find all requests from these CIDR ranges:

```bash
curl -X POST "localhost:9200/nginx-access-*/_search?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "should": [
        { "range": { "client_ip": { "gte": "91.207.9.1", "lte": "91.207.9.255" } } },
        { "range": { "client_ip": { "gte": "102.38.229.1", "lte": "102.38.229.255" } } }
      ]
    }
  },
  "aggs": {
    "bot_ips": {
      "terms": { "field": "client_ip", "size": 50 }
    }
  }
}'
```

**Task 3: Deprecated User Agent Detection**

The `deprecated-user-agents.txt` file contains 100+ deprecated user agent strings. Find requests using these outdated clients:

```bash
# Count requests with deprecated user agents
curl -X POST "localhost:9200/nginx-access-*/_search?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "query": {
    "bool": {
      "should": [
        { "match_phrase": { "user_agent": "MSIE 6.0" } },
        { "match_phrase": { "user_agent": "MSIE 7.0" } },
        { "match_phrase": { "user_agent": "Python-urllib" } },
        { "match_phrase": { "user_agent": "curl/" } }
      ]
    }
  },
  "aggs": {
    "deprecated_agents": {
      "terms": { "field": "user_agent.keyword", "size": 20 }
    }
  }
}'
```

**Task 4: Traffic Anomaly Detection**

Use date histogram aggregations to find traffic spikes:

```bash
curl -X POST "localhost:9200/nginx-access-*/_search?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "requests_per_minute": {
      "date_histogram": {
        "field": "@timestamp",
        "fixed_interval": "1m"
      },
      "aggs": {
        "unique_ips": {
          "cardinality": { "field": "client_ip" }
        }
      }
    }
  }
}'
```

Look for minutes with unusually high request counts but low unique IP counts — this indicates a single source generating many requests (potential DOS).

**Task 5: Credential Probing Detection**

Find IPs that triggered many 401/403 responses:

```bash
curl -X POST "localhost:9200/nginx-access-*/_search?pretty" \
  -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "query": {
    "terms": { "status": [401, 403] }
  },
  "aggs": {
    "brute_force_ips": {
      "terms": {
        "field": "client_ip",
        "size": 10,
        "min_doc_count": 10
      },
      "aggs": {
        "targeted_paths": {
          "terms": { "field": "request_uri.keyword", "size": 5 }
        }
      }
    }
  }
}'
```

### Expected Output Format

Document your findings like this:

```
Attack 1: DOS Attack
  Time: 2022-04-07 08:00:00 - 08:15:00
  Source: 91.207.9.15
  Evidence: 15,000 requests in 15 minutes, all GET /
  Status: 502 (backend overwhelmed)

Attack 2: Bot IP Scan
  Time: 2022-04-26 20:25:00 - 20:30:00
  Source: 102.38.229.0/24 range
  Evidence: Sequential IP scanning, credentials endpoint targeted
  Status: 200 (successful access)
```

### Scoring

| Criteria | Points |
|----------|--------|
| Identified 5 attacks with timestamps | 25 |
| Correct attack type classification | 25 |
| Elasticsearch queries used | 25 |
| Bot IP range and deprecated UA analysis | 25 |

## Next Steps

- [Backup & Restore](/learn/elk/production/03-backup-restore) — protect your Nginx analysis data
- [Reindexing](/learn/elk/production/01-reindexing) — reindex with improved mappings
