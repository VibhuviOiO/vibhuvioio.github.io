---
title: "Account Setup & API Keys"
description: "Create your Pinecone account, get API keys, and understand regions and projects."
duration: "20m"
readingTime: "10m"
labTime: "10m"
order: 1
---

# Account Setup & API Keys

Pinecone is a fully managed service — no infrastructure to provision. Let's get you set up.

## Creating Your Account

### 1. Sign Up

Go to [pinecone.io](https://www.pinecone.io/) and click "Sign Up Free".

> **Tip:** Use your work email for better support tiers.

### 2. Verify Email

Check your inbox and verify your email address.

### 3. Choose Your Region

Pinecone offers multiple regions:

| Region | Location | Best For |
|--------|----------|----------|
| us-east-1 | N. Virginia | US East workloads |
| us-west-2 | Oregon | US West workloads |
| eu-west-1 | Ireland | European workloads |
| ap-southeast-1 | Singapore | Asia-Pacific workloads |

> **Note:** Choose a region close to your application servers for lowest latency.

## Getting Your API Key

### 1. Navigate to API Keys

In the Pinecone Console:
1. Click your profile (top right)
2. Select "API Keys"

### 2. Create a New Key

```bash
# Name your key descriptively
Name: my-app-production
```

> **Security:** Never commit API keys to git. Use environment variables.

### 3. Copy the Key

```bash
# Example API key format
PINECONE_API_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

> **Warning:** Keys cannot be retrieved after creation. Save it immediately.

## Environment Setup

### Python Installation

```bash
pip install pinecone-client
```

### Environment Variables

Create a `.env` file:

```bash
PINECONE_API_KEY=your-api-key-here
PINECONE_ENVIRONMENT=us-east-1
```

Load it in Python:

```python
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("PINECONE_API_KEY")
environment = os.getenv("PINECONE_ENVIRONMENT")
```

### Verify Connection

```python
import pinecone

# Initialize
pinecone.init(
    api_key=api_key,
    environment=environment
)

# List indexes (should return empty list initially)
print(pinecone.list_indexes())
# Expected: []
```

## Understanding Projects

Pinecone uses projects for organization:

- **Default project** — Created automatically
- **Indexes** — Belong to a project
- **API keys** — Can be project-scoped

### Creating a New Project

1. Go to Console → Projects
2. Click "Create Project"
3. Name it (e.g., "production", "staging")

## Best Practices

### API Key Management

| Environment | Key Pattern | Rotation |
|-------------|-------------|----------|
| Development | `dev-*` | Quarterly |
| Staging | `staging-*` | Monthly |
| Production | `prod-*` | Monthly |

### Security Checklist

- [ ] Use separate keys per environment
- [ ] Rotate keys regularly
- [ ] Restrict key permissions (read-only where possible)
- [ ] Monitor key usage in console
- [ ] Revoke unused keys

## Next Steps

Now that you're set up, create your first index:

→ **[Your First Index](./first-index)**
