# VibhuviOiO Documentation Site

A Next.js 16 documentation template with support for three types of documentation:

1. **General Docs** - Quick how-to guides (nginx, MySQL, Cassandra, etc.)
2. **Operations Docs** - End-to-end operational guides (ELK, MongoDB, etc.)
3. **Product Docs** - Product homepages with dedicated sidebars

## Features

- ✅ Next.js 16.1.6 with App Router
- ✅ TypeScript 5
- ✅ Tailwind CSS
- ✅ MDX/Markdown support
- ✅ Three documentation types with isolated sidebars
- ✅ Product homepages with dedicated documentation
- ✅ Responsive design
- ✅ Light/white theme by default

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Documentation Structure

### 1. General Docs (`/docs`)

Single sidebar for all quick guides:

```
/docs
├── nginx/
│   ├── container (Run as Container)
│   ├── ssl (OpenSSL for Testing)
│   ├── pam (PAM Authentication)
│   └── static (Deploy Static App)
├── mysql/
│   ├── container (Deploy as Container)
│   └── backup-restore (Backup & Restore)
└── cassandra/
    ├── container (Deploy as Container)
    ├── backup-restore (Backup & Restore)
    └── cluster (Multi-Node Cluster)
```

**Configuration**: `config/sidebars/general-docs.json`

### 2. Operations Docs (`/operations`)

Dedicated sidebar per category with deep operational content:

```
/operations
├── elk/
│   ├── overview
│   ├── architecture
│   ├── deployment
│   ├── elasticsearch/
│   ├── logstash/
│   ├── kibana/
│   └── operations/
└── mongo/
    ├── overview
    ├── deployment
    ├── replication/
    ├── migration/
    └── ha/
```

**Configuration**: `config/sidebars/operations-docs.json`

### 3. Product Docs (`/products`)

Each product has a homepage and dedicated sidebar:

```
/products
├── docker-registry-ui/
│   ├── (homepage)
│   └── docs/
│       ├── getting-started
│       ├── configuration
│       ├── features
│       ├── security
│       ├── bulk-operations
│       ├── examples/
│       └── development/
└── ldap-manager/
    ├── (homepage)
    └── docs/
        └── ...
```

**Configuration**: `config/sidebars/products.json`

## Adding Content

### Adding General Docs

1. Create markdown file in `content/general-docs/{category}/{slug}.md`
2. Add entry to `config/sidebars/general-docs.json`

Example:
```json
{
  "id": "redis",
  "title": "Redis",
  "slug": "redis",
  "items": [
    { "id": "redis-container", "title": "Run as Container", "slug": "redis/container" }
  ]
}
```

### Adding Operations Docs

1. Create markdown file in `content/operations-docs/{category}/{slug}.md`
2. Add entry to `config/sidebars/operations-docs.json`

### Adding Product Docs

1. Update `config/sidebars/products.json`
2. Create homepage at `src/app/products/{slug}/page.tsx`
3. Create docs at `content/products/{id}/{slug}.md`

## Markdown Frontmatter

```yaml
---
title: Page Title
description: Page description for SEO
order: 1
---
```

## Customization

### Colors
Edit `src/app/globals.css` and Tailwind config.

### Components
Components are in `src/components/`:
- `layout/` - Layout components (Navbar, Footer, Sidebar)
- `docs/` - Documentation components
- `ui/` - UI primitives

### Sidebar Structure

Sidebar JSON format:
```json
{
  "title": "Group Title",
  "items": [
    {
      "id": "unique-id",
      "title": "Display Title",
      "slug": "url-path",
      "items": [] // Nested items
    }
  ]
}
```

## Deployment

The site is configured for static export:

```bash
npm run build
# Output in dist/ folder
```

## License

MIT
