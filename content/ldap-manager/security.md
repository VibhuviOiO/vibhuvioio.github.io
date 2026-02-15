---
title: Security
description: "Security features and best practices for LDAP Manager: encrypted password storage, LDAP injection protection, CORS security, and secure deployment."
---

# Security Features


LDAP Manager implements enterprise-grade security features to protect your directory credentials and prevent common attacks.


> **Note:** **✅ Zero Critical Vulnerabilities:** All security features have been audited and tested.


## 1. Encrypted Password Storage


### Overview


LDAP bind passwords are never stored in plaintext. All passwords are encrypted at rest using Fernet symmetric encryption with automatic TTL expiration.


### Technical Details

- **Algorithm:** Fernet (AES-128-CBC + HMAC)
- **Key Generation:** Cryptographically secure random key generated once
- **Key Storage:** `/app/.secrets/encryption.key` with 0600 permissions
- **Cache Location:** `/app/.cache/` with 0700 directory permissions
- **File Permissions:** 0600 (read/write owner only)
- **TTL:** 1 hour default (3600 seconds)


### How It Works

1. User enters password in browser
2. Password sent via HTTPS to backend
3. Backend verifies password with LDAP server
4. On success, password encrypted with Fernet and stored
5. Encrypted cache includes timestamp and TTL
6. On subsequent requests, password decrypted from cache
7. Expired passwords automatically deleted


### Storage Format


```
{
  "cluster": "production-ldap",
  "bind_dn": "cn=Manager,dc=example,dc=com",
  "encrypted_password": "gAAAAABl...encrypted_blob...",
  "timestamp": 1705843200.123,
  "ttl": 3600
}
```


### Security Properties

- ✅ Passwords never logged
- ✅ Passwords never transmitted in plaintext
- ✅ Passwords encrypted at rest
- ✅ Automatic expiration prevents stale credentials
- ✅ File permissions prevent unauthorized access
- ✅ Each cluster has separate encrypted cache file


## 2. LDAP Injection Protection


### Overview


All user input used in LDAP search filters is sanitized and escaped to prevent LDAP filter injection attacks.


### Attack Vector Example


**Without Protection:**


```
User input: *)(objectClass=*
Search filter: (|(uid=*)(objectClass=*)(cn=...))
Result: Bypass intended filter, return ALL entries
```


**With Protection:**


```
User input: *)(objectClass=*
After escaping: \2a\29\28objectClass=\2a
Search filter: (|(uid=\2a\29\28objectClass=\2a)(cn=...))
Result: Harmless literal search for that exact string
```


### Implementation


Uses Python's `ldap.filter.escape_filter_chars()` which escapes all special LDAP filter characters:

- `*` → `\2a`
- `(` → `\28`
- `)` → `\29`
- `\` → `\5c`
- `/` → `\2f`
- NUL → `\00`


### Protected Endpoints

- ✅ `/api/entries/search` - Search query parameter
- ✅ `/api/entries/create` - DN components
- ✅ `/api/entries/update` - DN and attribute values
- ✅ All user-provided LDAP filter input


## 3. CORS Security


### Overview


Cross-Origin Resource Sharing (CORS) is configured with strict origin whitelisting to prevent unauthorized cross-site requests.


### Configuration


Set allowed origins via environment variable:


```
ALLOWED_ORIGINS=https://ldap.company.com,https://ldap-backup.company.com
```


### Default Behavior

- **Development:** `http://localhost:5173` (Vite dev server)
- **Production:** Must be explicitly configured
- **Never use:** `*` (wildcard) in production


### Security Properties

- ✅ Only whitelisted origins can make API requests
- ✅ Credentials (cookies) only sent to allowed origins
- ✅ Prevents CSRF attacks from malicious sites
- ✅ Configurable per environment


## 4. Container Security


### Non-Root User


Container runs as dedicated non-root user:


```
# User: ldapmanager
# UID: 1000
# Home: /app
```


**Why This Matters:**

- Limits damage from container breakout attacks
- Prevents privilege escalation
- Best practice for production containers


### File System Permissions


```
/app/.cache/      → 0700 (rwx------)  # Cache directory
/app/.cache/*.json → 0600 (rw-------)  # Encrypted password files
/app/.secrets/     → 0700 (rwx------)  # Secrets directory
/app/.secrets/encryption.key → 0600   # Encryption key
```


### Security Options


```
security_opt:
  - no-new-privileges:true  # Prevents privilege escalation
```


## 5. Input Validation


### Configuration Validation


All configuration is validated at startup using Pydantic schemas:

- ✅ Cluster names must be non-empty
- ✅ Port numbers must be 1-65535
- ✅ Must specify either `host` OR `nodes`, not both
- ✅ DN format validation
- ✅ No duplicate cluster names


### API Input Validation


FastAPI with Pydantic validates all API inputs:

- ✅ Required fields enforced
- ✅ Type checking (string, int, bool, etc.)
- ✅ Format validation (email, DN, etc.)
- ✅ Automatic 422 error on invalid input


## 6. Timeout Protection


### LDAP Operation Timeouts


```
# Network timeout: 30 seconds
# Operation timeout: 30 seconds
```


**Purpose:**

- Prevents hung connections from blocking application
- Protects against slow loris attacks
- Ensures responsive user experience


## 7. Audit Logging


### Operations Logged

- **CREATE:** INFO level with cluster, DN, operation
- **UPDATE:** INFO level with modified attributes
- **DELETE:** WARNING level (higher visibility)
- **AUTH:** Connection attempts and failures


### Log Format


```
{
  "timestamp": "2024-01-25T10:30:45.123Z",
  "level": "WARNING",
  "logger": "app.api.entries",
  "message": "LDAP entry deleted",
  "cluster": "production",
  "dn": "cn=olduser,dc=example,dc=com",
  "operation": "DELETE",
  "operator": "admin"
}
```


### Security Properties

- ✅ Complete audit trail
- ✅ Tamper-evident (append-only logs)
- ✅ Searchable JSON format
- ✅ Includes context (cluster, DN, operation)


## Security Testing


### Automated Security Tests


Comprehensive test suite includes security-specific tests:

- **24 tests** - Password encryption and cache security
- **5 tests** - LDAP injection protection
- **8 tests** - Authentication and authorization
- **6 tests** - Configuration validation


### Test Coverage


```
# Run security tests
cd backend
pytest tests/test_password_cache.py -v
pytest tests/test_api_entries.py::TestSearchEndpoint::test_search_ldap_injection_protected -v
```


## Security Best Practices


### Production Deployment

1. **HTTPS Only:** Always use HTTPS in production (reverse proxy required)
2. **CORS Configuration:** Set `ALLOWED_ORIGINS` to your production domain
3. **Strong Passwords:** Use complex LDAP bind passwords
4. **Regular Updates:** Keep Docker images up to date
5. **Network Isolation:** Run in private network when possible
6. **Firewall Rules:** Restrict access to LDAP ports (389/636)


### Monitoring

1. Monitor health check endpoint: `/health`
2. Set up alerts for authentication failures
3. Review audit logs regularly
4. Monitor for unusual access patterns


### Backup & Recovery

1. Backup `config.yml` regularly
2. Backup `/app/.secrets/` volume (encryption key)
3. Document disaster recovery procedures
4. Test backup restoration periodically


## Vulnerability Reporting


If you discover a security vulnerability, please report it responsibly:

- Email: security@vibhuvioio.com
- GitHub: Private Security Advisory
- Please do not create public issues for security vulnerabilities


## Compliance & Standards

- ✅ OWASP Top 10 2021 - No known vulnerabilities
- ✅ LDAP RFC 4511 - Protocol compliance
- ✅ RFC 2696 - Server-side pagination
- ✅ CWE-90 - LDAP injection prevention
- ✅ CWE-312 - Cleartext password storage prevention


## Resources

- PRODUCTION_READY.md - Security implementation details
- Production Deployment Guide - Security configuration
- OWASP Top 10 - Web application security risks
- CWE-90: LDAP Injection



Security is our top priority. Deploy LDAP Manager with confidence! 🔒