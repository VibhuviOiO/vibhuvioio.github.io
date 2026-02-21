---
title: TLS & Certificate Setup
description: Secure Elasticsearch with TLS/SSL — generate certificates, enable HTTPS, configure inter-node encryption, and verify secure communication.
duration: "35m"
readingTime: "20m"
labTime: "15m"
order: 1
---

## Project Structure

```tree
five-node-tls/
├── docker-compose.yml
├── .env
├── create-certs.yml
└── instances.yml
```

## Why TLS Matters

| Without TLS | With TLS |
|-------------|----------|
| Data travels in plaintext | All traffic encrypted |
| Anyone on the network can sniff queries | Eavesdropping impossible |
| No node identity verification | Nodes verify each other's certificates |
| No client authentication | Clients must present valid credentials |

Elasticsearch has two communication layers that need TLS:

1. **Transport layer** (port 9300) — inter-node communication
2. **HTTP layer** (port 9200) — REST API / client communication

## Certificate Architecture

```
Certificate Authority (CA)
├── elasticsearch-node-1.crt
├── elasticsearch-node-2.crt
├── elasticsearch-node-3.crt
├── kibana.crt
└── logstash.crt
```

All certificates are signed by the same CA. Nodes trust each other because they trust the CA.

## Generating Certificates

### Using elasticsearch-certutil

Elasticsearch ships with `elasticsearch-certutil` for generating certificates.

**Step 1: Create a CA**

```bash
docker exec -it elasticsearch bin/elasticsearch-certutil ca \
  --out /usr/share/elasticsearch/config/certs/elastic-stack-ca.p12 \
  --pass ""
```

**Step 2: Generate node certificates**

```bash
docker exec -it elasticsearch bin/elasticsearch-certutil cert \
  --ca /usr/share/elasticsearch/config/certs/elastic-stack-ca.p12 \
  --ca-pass "" \
  --out /usr/share/elasticsearch/config/certs/elastic-certificates.p12 \
  --pass ""
```

### Using a Setup Service in Docker Compose

For production deployments, use a setup service that generates all certificates before the cluster starts.

Download the TLS-enabled compose file:

```bash
wget https://raw.githubusercontent.com/VibhuviOiO/infinite-containers/main/elastic-stack/docker-compose-tls.yml -O docker-compose.yml
```

The setup service:

1. Creates a CA if one doesn't exist
2. Generates certificates for each node
3. Generates a certificate for Kibana
4. Sets correct file permissions
5. Exits — the cluster starts after certificates are ready

### Certificate Instances Configuration

Create a `config/certs/instances.yml` for multi-node clusters:

```yaml
instances:
  - name: es-node-1
    dns:
      - es-node-1
      - localhost
    ip:
      - 127.0.0.1
  - name: es-node-2
    dns:
      - es-node-2
      - localhost
    ip:
      - 127.0.0.1
  - name: es-node-3
    dns:
      - es-node-3
      - localhost
    ip:
      - 127.0.0.1
  - name: kibana
    dns:
      - kibana
      - localhost
    ip:
      - 127.0.0.1
```

## Configuring Transport TLS

Inter-node communication **must** be encrypted when security is enabled.

In `elasticsearch.yml`:

```yaml
# Transport layer TLS (node-to-node)
xpack.security.transport.ssl.enabled: true
xpack.security.transport.ssl.verification_mode: certificate
xpack.security.transport.ssl.certificate_authorities: certs/ca/ca.crt
xpack.security.transport.ssl.certificate: certs/es-node-1/es-node-1.crt
xpack.security.transport.ssl.key: certs/es-node-1/es-node-1.key
```

Or with PKCS#12 format:

```yaml
xpack.security.transport.ssl.enabled: true
xpack.security.transport.ssl.verification_mode: certificate
xpack.security.transport.ssl.keystore.path: certs/elastic-certificates.p12
xpack.security.transport.ssl.truststore.path: certs/elastic-certificates.p12
```

## Configuring HTTP TLS

Client-to-cluster communication over HTTPS.

In `elasticsearch.yml`:

```yaml
# HTTP layer TLS (client-to-cluster)
xpack.security.http.ssl.enabled: true
xpack.security.http.ssl.certificate_authorities: certs/ca/ca.crt
xpack.security.http.ssl.certificate: certs/es-node-1/es-node-1.crt
xpack.security.http.ssl.key: certs/es-node-1/es-node-1.key
```

## Docker Compose with TLS

Environment variables for a TLS-enabled node:

```yaml
environment:
  - xpack.security.enabled=true
  - xpack.security.transport.ssl.enabled=true
  - xpack.security.transport.ssl.key=certs/es-node-1/es-node-1.key
  - xpack.security.transport.ssl.certificate=certs/es-node-1/es-node-1.crt
  - xpack.security.transport.ssl.certificate_authorities=certs/ca/ca.crt
  - xpack.security.transport.ssl.verification_mode=certificate
  - xpack.security.http.ssl.enabled=true
  - xpack.security.http.ssl.key=certs/es-node-1/es-node-1.key
  - xpack.security.http.ssl.certificate=certs/es-node-1/es-node-1.crt
  - xpack.security.http.ssl.certificate_authorities=certs/ca/ca.crt
```

## Kibana TLS Configuration

Kibana needs to connect to Elasticsearch over HTTPS and optionally serve HTTPS itself.

In `kibana.yml`:

```yaml
# Connect to Elasticsearch over HTTPS
elasticsearch.hosts: ["https://elasticsearch:9200"]
elasticsearch.ssl.certificateAuthorities: ["/usr/share/kibana/config/certs/ca/ca.crt"]
elasticsearch.ssl.verificationMode: full

# Serve Kibana over HTTPS (optional)
server.ssl.enabled: true
server.ssl.certificate: /usr/share/kibana/config/certs/kibana/kibana.crt
server.ssl.key: /usr/share/kibana/config/certs/kibana/kibana.key
```

## Verifying TLS

### Check Elasticsearch HTTPS

```bash
# With CA certificate
curl --cacert ca.crt -u elastic:changeme https://localhost:9200

# Skip verification (testing only)
curl -k -u elastic:changeme https://localhost:9200
```

### Check Certificate Details

```bash
# View certificate info
openssl s_client -connect localhost:9200 -showcerts </dev/null 2>/dev/null | \
  openssl x509 -text -noout
```

### Check Transport TLS

```bash
curl -k -u elastic:changeme \
  "https://localhost:9200/_nodes?filter_path=**.transport.publish_address,**.transport_address"
```

### Verify Node SSL Info

```bash
curl -k -u elastic:changeme \
  "https://localhost:9200/_ssl/certificates?pretty"
```

## TLS Verification Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `full` | Verify certificate and hostname | Production |
| `certificate` | Verify certificate only | Internal networks |
| `none` | No verification | Never in production |

## Common TLS Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `SSLHandshakeException` | Certificates not trusted | Check CA is correct on all nodes |
| `certificate_unknown` | Self-signed cert without CA | Add CA to truststore |
| `hostname verification failed` | Cert DNS doesn't match hostname | Add correct DNS names to cert or use `verification_mode: certificate` |
| `unable to find valid cert path` | Java truststore missing CA | Import CA into JVM truststore or configure in elasticsearch.yml |
| `connection refused on 9200` | HTTP SSL enabled but using http:// | Switch to https:// |

## Certificate Rotation

Certificates expire. Plan for rotation:

1. Generate new certificates with the same CA
2. Copy new certs to each node
3. Reload certificates without restart:

```bash
curl -k -u elastic:changeme \
  -X POST "https://localhost:9200/_nodes/reload_secure_settings"
```

## Lab: Deploy a TLS-Secured Cluster

1. Download the TLS compose file from infinite-containers
2. Start the setup service to generate certificates
3. Start the 3-node cluster with TLS enabled
4. Verify HTTPS access with curl and the CA certificate
5. Connect Kibana over HTTPS
6. Check `_ssl/certificates` endpoint

## Next Steps

- [Authentication & Authorization](/learn/elk/security/02-authentication) — set up users, roles, and API keys
- [Cluster Monitoring](/learn/elk/monitoring/01-cluster-monitoring) — monitor your secured cluster
