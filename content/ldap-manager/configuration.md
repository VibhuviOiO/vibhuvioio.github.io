---
title: Configuration
description: "Complete configuration guide for LDAP Manager: single node, multi-master clusters, user creation forms, table columns, and environment variables."
---

# Configuration Guide

Complete guide to configuring LDAP Manager for your environment. The examples end with the
committed `config.example.yml`, rendered in full at the end of this page.
## Configuration Approaches
LDAP Manager supports two configuration approaches:

- **Minimal Configuration** - Quick setup with auto-detection (recommended for beginners)
- **Custom Configuration** - Full control over forms and columns (for advanced users)

## Minimal Configuration (Recommended)
The simplest way to get started. The UI automatically detects and shows common LDAP attributes.

### Single Node Example
```yml
clusters:
  - name: "Production LDAP"
    host: "ldap.company.com"
    port: 389
    bind_dn: "cn=Manager,dc=company,dc=com"
    base_dn: "dc=company,dc=com"  # Optional - auto-discovered if omitted
    description: "Main production LDAP server"
    readonly: false
```
### Multiple Clusters
```yml
clusters:
  - name: "Production LDAP"
    host: "ldap.company.com"
    port: 389
    bind_dn: "cn=admin,dc=company,dc=com"
    base_dn: "dc=company,dc=com"
    description: "Production environment"
    readonly: false

  - name: "Development LDAP"
    host: "ldap-dev.company.com"
    port: 389
    bind_dn: "cn=admin,dc=dev,dc=company,dc=com"
    base_dn: "dc=dev,dc=company,dc=com"
    description: "Development environment"
    readonly: false
```


> **Note:** **What you get automatically:**
- **Users table:** Username, Full Name, Email, Type
- **Groups table:** Group Name, Description, Members
- **OUs table:** OU Name, Description, DN
- Users can click "Columns" button to show/hide additional attributes


## Multi-Master Cluster Configuration
For multi-master LDAP clusters with multiple nodes:

```yml
clusters:
  - name: "LDAP Cluster"
    description: "3-node multi-master cluster"
    nodes:
      - host: "ldap1.company.com"
        port: 389
        name: "node1"
      - host: "ldap2.company.com"
        port: 389
        name: "node2"
      - host: "ldap3.company.com"
        port: 389
        name: "node3"
    bind_dn: "cn=Manager,dc=company,dc=com"
    base_dn: "dc=company,dc=com"
    readonly: false
```


### Features:

- Health monitoring for all nodes
- Replication topology visualization
- Automatic failover to healthy nodes
- Sync status monitoring


## Docker Host Connection


For connecting to LDAP running on the Docker host machine:


### Docker Desktop (Mac/Windows)


```yml
clusters:
  - name: "Local Docker LDAP"
    host: "host.docker.internal"
    port: 389
    bind_dn: "cn=Manager,dc=example,dc=com"
```


### Linux Docker


```yml
clusters:
  - name: "Local Docker LDAP"
    host: "172.17.0.1"  # Default Docker bridge IP
    port: 389
    bind_dn: "cn=Manager,dc=example,dc=com"
```


## User Creation Form Configuration


Define custom user creation forms with auto-fill fields and validation.


### Basic User Creation Form


```yml
clusters:
  - name: "Corporate LDAP"
    host: "ldap.company.com"
    port: 389
    bind_dn: "cn=admin,dc=company,dc=com" 
    user_creation_form:
      base_ou: "ou=People,dc=company,dc=com"
      object_classes:
        - inetOrgPerson
        - posixAccount
      fields:
        - name: uid
          label: Username
          type: text
          required: true
        - name: cn
          label: Full Name
          type: text
          required: true
        - name: mail
          label: Email
          type: email
          required: true
          auto_generate: "${uid}@company.com"
        - name: userPassword
          label: Password
          type: password
          required: true
```


### Advanced Form with Auto-Generation


```yml
    user_creation_form:
      base_ou: "ou=People,dc=company,dc=com"
      object_classes:
        - inetOrgPerson
        - posixAccount
        - shadowAccount
      fields:
        - name: uid
          label: Username
          type: text
          required: true
        - name: cn
          label: Full Name
          type: text
          required: true
        - name: sn
          label: Last Name
          type: text
          required: true
        - name: givenName
          label: First Name
          type: text
          required: true
        - name: mail
          label: Email
          type: email
          required: true
          auto_generate: "${uid}@company.com"
        - name: userPassword
          label: Password
          type: password
          required: true
        - name: uidNumber
          label: UID Number
          type: number
          required: true
          auto_generate: "next_uid"
          readonly: true
        - name: gidNumber
          label: Group ID
          type: number
          required: true
          default: 100
        - name: homeDirectory
          label: Home Directory
          type: text
          required: true
          auto_generate: "/home/${uid}"
        - name: loginShell
          label: Shell
          type: text
          required: true
          default: "/bin/bash"
```


### Field Types


| Type | Description | Example |
| --- | --- | --- |
| `text` | Single-line text input | Username, Name |
| `email` | Email with validation | user@example.com |
| `password` | Password input (hidden) | User password |
| `number` | Numeric input | UID, GID |
| `select` | Dropdown selection | Department, Role |


### Auto-Generate Options


| Value | Description | Example |
| --- | --- | --- |
| `${uid}@company.com` | Template with variable substitution | john@company.com |
| `next_uid` | Auto-generate next available UID | 1001, 1002, 1003... |
| `/home/${uid}` | Path with variable | /home/john |


## Table Columns Configuration


Control which columns are visible by default in tables.


### Users Table Columns


```yml
    table_columns:
      users:
        - name: uid
          label: Username
          default_visible: true
        - name: cn
          label: Full Name
          default_visible: true
        - name: mail
          label: Email
          default_visible: true
        - name: uidNumber
          label: UID
          default_visible: false    # Hidden by default
        - name: gidNumber
          label: GID
          default_visible: false    # Hidden by default
        - name: homeDirectory
          label: Home Directory
          default_visible: false    # Hidden by default
        - name: loginShell
          label: Shell
          default_visible: false    # Hidden by default
        - name: objectClass
          label: Type
          default_visible: true
```


### Groups Table Columns


```yml
      groups:
        - name: cn
          label: Group Name
          default_visible: true
        - name: description
          label: Description
          default_visible: true
        - name: members
          label: Members
          default_visible: true
        - name: gidNumber
          label: GID
          default_visible: false
        - name: dn
          label: DN
          default_visible: false
```


### OUs Table Columns


```yml
      ous:
        - name: ou
          label: OU Name
          default_visible: true
        - name: description
          label: Description
          default_visible: true
        - name: dn
          label: DN
          default_visible: true
```


> **Note:** **Note:** Users can always customize column visibility via the "Columns" button (⚙️) in the UI. The `default_visible` setting only controls the initial state.


## Custom Schema Example


Full example with custom objectClass and attributes:


```yml
clusters:
  - name: "Custom Schema LDAP"
    host: "ldap.example.com"
    port: 389
    bind_dn: "cn=Manager,dc=example,dc=com"
    base_dn: "dc=example,dc=com"
    readonly: false
    
    user_creation_form:
      base_ou: "ou=People,dc=example,dc=com"
      object_classes:
        - inetOrgPerson
        - posixAccount
        - CustomEmployee  # Custom objectClass
      fields:
        - name: uid
          label: Username
          type: text
          required: true
        - name: cn
          label: Full Name
          type: text
          required: true
        - name: mail
          label: Email
          type: email
          required: true
        - name: userPassword
          label: Password
          type: password
          required: true
        # Custom attributes
        - name: department
          label: Department
          type: select
          required: true
          options:
            - Engineering
            - Sales
            - Marketing
        - name: employeeID
          label: Employee ID
          type: text
          required: true
        - name: location
          label: Location
          type: text
          required: false
    
    table_columns:
      users:
        - name: uid
          label: Username
          default_visible: true
        - name: cn
          label: Full Name
          default_visible: true
        - name: mail
          label: Email
          default_visible: true
        - name: department
          label: Department
          default_visible: true      # Custom attribute
        - name: employeeID
          label: Employee ID
          default_visible: true      # Custom attribute
        - name: location
          label: Location
          default_visible: false     # Custom attribute (hidden)
```


## TLS / LDAPS

Per cluster. The certificate paths are inside the container.

```yaml
    tls:
      mode: ldaps          # none (default) | ldaps | starttls
      ca_file: /certs/ca.crt
      verify: true         # false accepts any certificate - lab only
      # cert_file: /certs/client.crt   # mutual TLS
      # key_file: /certs/client.key
```

```bash
# mount the certificates
docker run -d -v ./certs:/certs:ro ldap-manager:latest
```

`mode: ldaps` with a configured port of `389` is raised to `636` (logged). Full details:
[TLS & LDAPS](/ldap-manager/tls/).

## cn=config credential (Schema and ACI editors)

The data bind DN normally cannot read `cn=config`, so clusters using the Schema or ACI
editors need a second credential:

```yaml
    config:
      bind_dn: "cn=config"
      credential:
        source: env          # LDAP_MANAGER_CONFIG_<CLUSTER>_PASSWORD
```

Source may be `stored`, `env`, `file` or `config`, exactly like the data credential.
Without this block the editors report a clear message and nothing else is affected.

## Context Path Configuration
Serve LDAP Manager under a custom base path (e.g., `/ldap-manager/`) for integration with other applications.

### Production Deployment
```
# Build and run with context path
CONTEXT_PATH=/ldap-manager docker compose -f docker-compose.prod.yml up -d

# Access at
http://localhost:8000/ldap-manager/
```


### Development Mode
```
# Run with context path
CONTEXT_PATH=/ldap-manager docker compose up

# Access at
http://localhost:5173/ldap-manager/
```


### Nginx Reverse Proxy


```conf
location /ldap-manager/ {
    proxy_pass http://ldap-manager:8000/ldap-manager/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```


> **Note:** **Note:** For integration with IAM/Auth applications, configure your reverse proxy to forward the context path to LDAP Manager. The parent app handles authentication while LDAP Manager handles directory management.


## Environment Variables


Configure LDAP Manager behavior using environment variables in docker-compose.yml:


```yml
services:
  ldap-manager:
    image: vibhuvioio/ldap-manager:latest
    ports:
      - "5173:5173"
      - "8000:8000"
    volumes:
      - ./config.yml:/app/config.yml
    environment:
      - PYTHONUNBUFFERED=1
      - VITE_FOOTER_TEXT=LDAP Manager • My Company
      - CONTEXT_PATH=/ldap-manager  # Optional: custom base path
```


### Available Variables


| Variable | Description | Default |
| --- | --- | --- |
| `PYTHONUNBUFFERED` | Python output buffering | 1 |
| `VITE_FOOTER_TEXT` | Custom footer text (HTML allowed) | LDAP Manager |
| `CONTEXT_PATH` | Custom base path for app | / |


## Configuration Best Practices


### Start Simple

- Begin with minimal configuration
- Add custom forms only when needed
- Let UI auto-detect columns initially
- Customize based on user feedback


### Security

- Use `readonly: true` for read-only access
- Restrict bind DN permissions
- Use strong passwords
- Enable TLS/SSL in production


### Performance

- Specify `base_dn` to avoid auto-discovery overhead
- Limit visible columns to improve load times
- Use server-side pagination for large directories


## Complete Example


`config.example.yml` is the maintained, complete example - fetched from the repository at
build time, so the panel cannot drift from the code. `config.minimal.yml` is the smallest
working config: auto-detection, no custom forms or columns.


## Project Files

```project
name: ldap-manager
config.example.yml: https://raw.githubusercontent.com/VibhuviOiO/ldap-manager/refs/heads/main/config.example.yml
config.minimal.yml: https://raw.githubusercontent.com/VibhuviOiO/ldap-manager/refs/heads/main/config.minimal.yml
```


`config.example.yml` is the reference for clusters, `user_creation_form` and
`table_columns`. The `tls` and `config` blocks above are per-cluster keys - add them to a
cluster in the same file.

The `auth:` block at the top of the file is not per-cluster: it decides how people sign in to
LDAP Manager itself. All three modes are documented on
[Authentication Modes](/ldap-manager/authentication/).


## Next Steps

- [Authentication Modes](/ldap-manager/authentication/) - `none`, `local` or `ldap`
- [Compatibility](/ldap-manager/compatibility/) - what your server must have enabled
- [TLS & LDAPS](/ldap-manager/tls/) - certificate modes per cluster
- [Security](/ldap-manager/security/) - what each role can do