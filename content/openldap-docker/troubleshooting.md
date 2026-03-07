---
title: Troubleshooting
description: Common OpenLDAP Docker issues and solutions. Container startup failures, connection problems, TLS errors, replication issues, and database errors.
---

# Troubleshooting

Common issues and solutions for OpenLDAP Docker deployments.

## Container Won't Start

### Port Already in Use

**Symptom:**
```
Error starting userland proxy: listen tcp 0.0.0.0:389: bind: address already in use
```

**Solution:**
```bash
# Find what's using port 389
sudo lsof -i :389
sudo netstat -tlnp | grep 389

# Use a different host port
services:
  openldap:
    ports:
      - "1389:389"  # Use 1389 on host instead
```

### Permission Denied on Volumes

**Symptom:**
```
chown: changing ownership of '/var/lib/ldap': Operation not permitted
```

**Cause:** Volume mounted with incorrect permissions or read-only filesystem.

**Solution:**
```bash
# Check volume permissions on host
ls -la /path/to/ldap-data

# Fix ownership (container runs as UID 55)
sudo chown -R 55:55 /path/to/ldap-data

# Or use named volumes instead of bind mounts
volumes:
  - ldap-data:/var/lib/ldap  # Named volume handles permissions automatically
```

### Container Exits Immediately

**Symptom:** Container starts then exits with code 1.

**Solution:**
```bash
# Check logs for error details
docker logs openldap

# Common causes:
# 1. Invalid configuration - check environment variables
# 2. Corrupt database - remove volume and restart
# 3. Memory limits - increase container memory

# Debug mode: override entrypoint
docker run --rm -it \
  -v ldap-data:/var/lib/ldap \
  ghcr.io/vibhuvioio/openldap:latest \
  bash

# Then manually run startup script to see errors
/entrypoint.sh
```

## Connection Issues

### "Can't contact LDAP server"

**Symptom:**
```
ldap_sasl_bind(SIMPLE): Can't contact LDAP server (-1)
```

**Checklist:**

1. **Is the container running?**
   ```bash
   docker ps | grep openldap
   docker logs openldap | tail -20
   ```

2. **Is the port exposed correctly?**
   ```bash
   # Test from inside container
docker exec openldap ldapsearch -x -H ldap://localhost:389 -b "" -s base
   
   # Test from host
   ldapsearch -x -H ldap://localhost:389 -b "" -s base
   ```

3. **Is the firewall blocking connections?**
   ```bash
   # Check if port is listening
   sudo netstat -tlnp | grep 389
   
   # Test with telnet
   telnet localhost 389
   ```

4. **Is the server still initializing?**
   ```bash
   # Wait for "OpenLDAP initialization completed" in logs
   docker logs openldap | grep "initialization completed"
   ```

### Authentication Failures

**Symptom:**
```
ldap_bind: Invalid credentials (49)
```

**Solutions:**

1. **Verify bind DN format:**
   ```bash
   # Default format
   cn=Manager,dc=example,dc=com
   
   # Not just "admin" or "Manager"
   ```

2. **Check the password:**
   ```bash
   # View current env vars (won't show actual password)
   docker exec openldap env | grep PASSWORD
   
   # Test with known password
   docker run --rm -e LDAP_ADMIN_PASSWORD=test123 \
     ghcr.io/vibhuvioio/openldap:latest
   ```

3. **Reset admin password:**
   ```bash
   # Stop container
   docker compose down
   
   # Delete config volume (keeps data)
   docker volume rm openldap_ldap-config
   
   # Restart with new password
   docker compose up -d
   ```

### Base DN Mismatch

**Symptom:**
```
ldap_search: No such object (32)
```

**Cause:** Searching wrong base DN for your domain.

**Solution:**
```bash
# If LDAP_DOMAIN=example.com, base DN is:
dc=example,dc=com

# If LDAP_DOMAIN=mycompany.org, base DN is:
dc=mycompany,dc=org

# Verify base DN exists
docker exec openldap ldapsearch -x \
  -D "cn=Manager,dc=example,dc=com" -w changeme \
  -b "" -s base namingContexts
```

## TLS/SSL Issues

### "Certificate verification failed"

**Symptom:**
```
TLS: can't connect: error:1416F086:SSL routines:tls_process_server_certificate:certificate verify failed
```

**Solutions:**

1. **For self-signed certificates:**
   ```bash
   # Skip verification (testing only)
   LDAPTLS_REQCERT=never ldapsearch -H ldaps://localhost:636 ...
   
   # Or trust the specific certificate
   LDAPTLS_CACERT=./certs/ldap.crt ldapsearch -H ldaps://localhost:636 ...
   ```

2. **Certificate file permissions:**
   ```bash
   # Ensure certs are readable
   docker exec openldap ls -la /certs/
   
   # Should show ldap:ldap ownership
   ```

3. **Wrong certificate format:**
   ```bash
   # Verify certificate
   openssl x509 -in certs/ldap.crt -text -noout
   
   # Check key matches certificate
   openssl x509 -noout -modulus -in certs/ldap.crt | openssl md5
   openssl rsa -noout -modulus -in certs/ldap.key | openssl md5
   ```

### StartTLS Fails

**Symptom:**
```
ldap_start_tls: Connect error (-11)
```

**Solution:**
```bash
# Check TLS is configured
docker exec openldap ldapsearch -x -H ldap://localhost:389 \
  -b "cn=config" -s base "(objectClass=*)" +

# Look for: olcTLSCertificateFile, olcTLSCertificateKeyFile

# Verify from host with debug
ldapsearch -x -H ldap://localhost:389 -ZZ -d 1 \
  -D "cn=Manager,dc=example,dc=com" -w changeme -b "" -s base
```

## Database Errors

### "MDB_MAP_FULL: Environment mapsize limit reached"

**Symptom:** Write operations fail with this error.

**Cause:** Database reached its 1GB default size limit.

**Solution:**

**Option 1: Quick fix (dump and reload with larger size)**
```bash
# Export data
docker exec openldap slapcat -n 2 > backup.ldif

# Stop and remove container + volumes
docker compose down -v

# Start fresh with larger size via init script
cat > init/00-dbsize.sh << 'EOF'
#!/bin/bash
ldapmodify -Y EXTERNAL -H ldapi:/// <<LDIF
dn: olcDatabase={2}mdb,cn=config
changetype: modify
replace: olcDbMaxSize
olcDbMaxSize: 2147483648
LDIF
EOF
chmod +x init/00-dbsize.sh

# Start and reload data
docker compose up -d
sleep 30
docker exec -i openldap slapadd -n 2 < backup.ldif
```

**Option 2: Plan ahead (before data grows)**
See [Configuration](/openldap-docker/configuration) for setting database size on first startup.

### Database Corruption

**Symptom:**
```
mdb_env_open: Invalid argument
```

**Solution:**
```bash
# Backup what you can
docker exec openldap slapcat -n 2 > backup.ldif 2>/dev/null || true

# Remove corrupted database
docker compose down
docker volume rm openldap_ldap-data

# Restore from backup
docker compose up -d
sleep 30
docker exec -i openldap slapadd -n 2 < backup.ldif
```

## Replication Issues

### "Invalid credentials" in replication logs

**Symptom:**
```
slapd[1]: do_syncrepl: rid=101 rc 49 retrying (4 retries left)
```

**Cause:** Replication credentials don't match across nodes.

**Solution:**
```bash
# All nodes MUST use the same admin password
docker exec openldap-node1 env | grep LDAP_ADMIN_PASSWORD
docker exec openldap-node2 env | grep LDAP_ADMIN_PASSWORD

# Verify syncrepl config
docker exec openldap-node1 ldapsearch -Y EXTERNAL -H ldapi:/// \
  -b "cn=config" "(olcSyncRepl=*)" olcSyncRepl
```

### Replication not syncing

**Symptom:** Changes on one node don't appear on others.

**Troubleshooting:**

1. **Check replication status:**
   ```bash
   docker exec openldap-node1 ldapsearch -Y EXTERNAL -H ldapi:/// \
     -b "cn=config" "(objectClass=olcSyncProvConfig)"
   ```

2. **Verify network connectivity:**
   ```bash
   # From node1, test connection to node2
   docker exec openldap-node1 ldapsearch -x \
     -H ldap://openldap-node2:389 \
     -D "cn=Manager,dc=example,dc=com" -w changeme \
     -b "" -s base
   ```

3. **Check for contextCSN mismatch:**
   ```bash
   # Compare contextCSN on all nodes
   for node in openldap-node1 openldap-node2 openldap-node3; do
     echo "=== $node ==="
     docker exec $node ldapsearch -x \
       -D "cn=Manager,dc=example,dc=com" -w changeme \
       -b "dc=example,dc=com" -s base contextCSN
   done
   ```

4. **Force re-sync:**
   ```bash
   # On the lagging node, restart slapd
   docker restart openldap-node2
   ```

### "ServerID not configured"

**Symptom:**
```
slapd[1]: syncrepl_null_callback : error code 0x50
```

**Cause:** Missing or duplicate SERVER_ID.

**Solution:**
```bash
# Each node needs unique SERVER_ID (1-4095)
# Node 1: SERVER_ID=1
# Node 2: SERVER_ID=2
# Node 3: SERVER_ID=3

docker exec openldap-node1 ldapsearch -Y EXTERNAL -H ldapi:/// \
  -b "cn=config" "(objectClass=olcServerConfig)" olcServerID
```

## Performance Issues

### Slow Search Queries

**Solutions:**

1. **Check if indexes are being used:**
   ```bash
   # Enable query logging temporarily
   docker exec openldap ldapmodify -Y EXTERNAL -H ldapi:/// <<LDIF
   dn: cn=config
   changetype: modify
   replace: olcLogLevel
   olcLogLevel: 256
   LDIF
   
   # Check logs for "index" messages
   docker logs openldap | grep -i index
   ```

2. **Verify indices exist:**
   ```bash
   docker exec openldap ldapsearch -Y EXTERNAL -H ldapi:/// \
     -b "cn=config" "(olcDatabase={2}mdb)" olcDbIndex
   ```

3. **Adjust query limits if needed:**
   ```yaml
   environment:
     - LDAP_QUERY_LIMIT_SOFT=1000
     - LDAP_QUERY_LIMIT_HARD=5000
   ```

### High Memory Usage

**Cause:** MDB maps the entire database into memory.

**Solutions:**
```bash
# Check database size
docker exec openldap ls -lh /var/lib/ldap/

# Monitor container memory
docker stats openldap

# If needed, increase container memory limit
docker run -m 2g ...
```

## Initialization Script Issues

### Scripts Not Running

**Symptom:** Expected data/users not created.

**Checklist:**

1. **Scripts only run on first startup:**
   ```bash
   # Check if database already exists
   docker logs openldap | grep -i "already configured"
   
   # If yes, scripts were skipped (expected behavior)
   ```

2. **Verify scripts are mounted:**
   ```bash
   docker exec openldap ls -la /docker-entrypoint-initdb.d/
   ```

3. **Check script permissions:**
   ```bash
   # Scripts must be executable
   chmod +x init/*.sh
   ```

4. **Check for errors in logs:**
   ```bash
   docker logs openldap | grep -i -E "(error|init)"
   ```

### "Entry already exists" Errors

**Cause:** Script ran twice or database wasn't fully cleared.

**Solution:**
```bash
# Make scripts idempotent
#!/bin/bash
set -e

if ldapsearch -x -D "$LDAP_ADMIN_DN" -w "$LDAP_ADMIN_PASSWORD" \
   -b "ou=MyOU,dc=example,dc=com" -s base 2>/dev/null | grep -q "ou:"; then
    echo "Already exists, skipping"
    exit 0
fi

# Create entry...
```

## Debug Mode

For detailed troubleshooting, run commands with debug output:

```bash
# LDAP debug levels (-d):
# 1  - Trace function calls
# 2  - Debug packet handling
# 4  - Heavy trace debugging
# 8  - Connection management
# 256 - Log all SQL (if using SQL backend)

# Example: debug connection issues
ldapsearch -x -H ldap://localhost:389 -d 1 -b "" -s base

# Debug from inside container
docker exec openldap ldapsearch -Y EXTERNAL -H ldapi:/// -d 1 \
  -b "cn=config" -s base
```

## Getting Help

If issues persist:

1. **Collect diagnostic info:**
   ```bash
   # Container logs
   docker logs openldap > openldap.log 2>&1
   
   # Container environment
   docker inspect openldap > inspect.json
   
   # Running config (sanitized)
   docker exec openldap ldapsearch -Y EXTERNAL -H ldapi:/// \
     -b "cn=config" -LLL > config.ldif
   ```

2. **Check GitHub Issues:**
   [github.com/VibhuviOiO/openldap-docker/issues](https://github.com/VibhuviOiO/openldap-docker/issues)

3. **Common solutions in docs:**
   - [Configuration Reference](/openldap-docker/configuration)
   - [Security Best Practices](/openldap-docker/security)
   - [Use Cases](/openldap-docker/use-cases/single-node)
