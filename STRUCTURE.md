# VibhuviOiO Documentation Site - Project Structure

## Overview

Next.js 16.1.6 documentation site with three documentation types and isolated sidebars.

## Directory Structure

```
docs-site/
├── config/
│   └── sidebars/              # Sidebar configurations (JSON)
│       ├── general-docs.json  # Type 1: General docs sidebar
│       ├── operations-docs.json # Type 2: Operations docs sidebar
│       └── products.json      # Type 3: Products sidebar
│
├── content/                   # Markdown documentation
│   ├── general-docs/          # Type 1 content
│   │   ├── nginx/
│   │   │   ├── container.md
│   │   │   ├── ssl.md
│   │   │   ├── pam.md
│   │   │   └── static.md
│   │   ├── mysql/
│   │   │   ├── container.md
│   │   │   └── backup-restore.md
│   │   └── cassandra/
│   │       ├── container.md
│   │       ├── backup-restore.md
│   │       └── cluster.md
│   ├── operations-docs/       # Type 2 content
│   │   ├── elk/
│   │   │   ├── overview.md
│   │   │   ├── architecture.md
│   │   │   ├── deployment.md
│   │   │   └── ...
│   │   └── mongo/
│   │       ├── overview.md
│   │       ├── replication/
│   │       ├── migration/
│   │       └── ha/
│   └── products/              # Type 3 content
│       └── docker-registry-ui/
│           ├── getting-started.md
│           ├── configuration.md
│           └── ...
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # Homepage (replicated from Docusaurus)
│   │   ├── layout.tsx         # Root layout with Navbar/Footer
│   │   ├── globals.css        # Global styles
│   │   ├── blog/
│   │   │   └── page.tsx
│   │   ├── docs/              # Type 1: General docs
│   │   │   ├── page.tsx       # Docs index
│   │   │   └── [...slug]/     # Dynamic doc pages
│   │   │       └── page.tsx
│   │   ├── operations/        # Type 2: Operations docs
│   │   │   ├── page.tsx       # Operations index
│   │   │   └── [...slug]/     # Dynamic operations pages
│   │   │       └── page.tsx
│   │   └── products/          # Type 3: Product docs
│   │       ├── page.tsx       # Products listing
│   │       └── [slug]/        # Individual product
│   │           ├── page.tsx   # Product homepage
│   │           └── docs/
│   │               └── [...docSlug]/
│   │                   └── page.tsx
│   │
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   │   ├── Navbar.tsx     # Top navigation with mega menu
│   │   │   ├── Footer.tsx     # Simple footer
│   │   │   ├── Sidebar.tsx    # Documentation sidebar
│   │   │   └── DocsLayout.tsx # Docs page layout
│   │   └── docs/
│   │       └── DocContent.tsx # Markdown renderer
│   │
│   ├── lib/                   # Utilities
│   │   ├── docs-client.ts     # Client-safe functions (no fs)
│   │   ├── docs-server.ts     # Server-only functions (fs)
│   │   └── docs.ts            # Types (legacy)
│   │
│   └── types/
│       └── docs.ts            # TypeScript types
│
├── dist/                      # Build output (static HTML)
├── next.config.ts             # Next.js config (static export)
├── mdx-components.tsx         # MDX component mappings
└── package.json
```

## URL Structure

| Type | URL Pattern | Description |
|------|-------------|-------------|
| Home | `/` | Homepage with hero and features |
| Blog | `/blog` | Blog listing |
| General Docs | `/docs` | General docs index |
| | `/docs/nginx/container` | Individual doc page |
| Operations | `/operations` | Operations index |
| | `/operations/elk/overview` | Operations doc page |
| Products | `/products` | Products listing |
| | `/products/docker-registry-ui` | Product homepage |
| | `/products/docker-registry-ui/docs/getting-started` | Product doc |

## Sidebar Configuration

### General Docs (`config/sidebars/general-docs.json`)
```json
{
  "groups": [
    {
      "title": "Web Servers",
      "items": [
        {
          "id": "nginx",
          "title": "NGINX",
          "slug": "nginx",
          "items": [
            { "id": "nginx-container", "title": "Run as Container", "slug": "nginx/container" }
          ]
        }
      ]
    }
  ]
}
```

### Operations Docs (`config/sidebars/operations-docs.json`)
```json
{
  "categories": [
    {
      "id": "elk",
      "title": "ELK Stack Operations",
      "slug": "elk",
      "sidebar": [
        {
          "title": "Getting Started",
          "items": [
            { "id": "elk-overview", "title": "Overview", "slug": "elk/overview" }
          ]
        }
      ]
    }
  ]
}
```

### Products (`config/sidebars/products.json`)
```json
{
  "products": [
    {
      "id": "docker-registry-ui",
      "name": "Docker Registry UI",
      "slug": "docker-registry-ui",
      "sidebar": [
        {
          "title": "Getting Started",
          "items": [
            { "id": "installation", "title": "Installation", "slug": "getting-started" }
          ]
        }
      ]
    }
  ]
}
```

## Adding New Content

### 1. General Docs
1. Create markdown: `content/general-docs/{category}/{slug}.md`
2. Add to sidebar: `config/sidebars/general-docs.json`

### 2. Operations Docs
1. Create markdown: `content/operations-docs/{category}/{slug}.md`
2. Add to sidebar: `config/sidebars/operations-docs.json`

### 3. Product Docs
1. Add product to: `config/sidebars/products.json`
2. Create homepage: `src/app/products/{slug}/page.tsx`
3. Create markdown: `content/products/{id}/{slug}.md`

## Markdown Frontmatter

```yaml
---
title: Page Title
description: Page description for SEO
order: 1
---
```

## Commands

```bash
# Development
npm run dev

# Build
npm run build

# Output in dist/ folder (static HTML)
```

## Key Features

- ✅ Three isolated sidebar types
- ✅ Product homepages with dedicated docs
- ✅ Static export for any hosting
- ✅ Light/white theme by default
- ✅ Responsive design
- ✅ TypeScript + Tailwind CSS
- ✅ Markdown + frontmatter support
