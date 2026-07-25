---
title: Status Pages
description: Build public and private status pages.
order: 8
---

# Status Pages

Status pages turn your monitors into a customer-ready health dashboard. UptimeO supports both public and private pages.

## Create a Status Page

Go to **Internet Insights → Status Pages** and click **Create**.

![Create status page](/img/uptime-o/status-pages-01-create.png)

Select which monitors and regions to include, then publish.

## Public Status Page

Public pages can be shared with anyone.

![Public status page preview](/img/uptime-o/status-pages-02-public-preview.png)

## Private Status Page

Private pages require a link or token to view.

![Private status page preview](/img/uptime-o/status-pages-03-private-preview.png)

## Customization

Each status page has its own branding, theme, and content settings in the UI:

- **Branding tab** — company name, page title/subtitle, logo, favicon, support contacts, navbar link.
- **Theme tab** — primary color, navbar/footer/page background colors.
- **Content tab** — footer text, meta tags, history window (24 hours / 7 days / 30 days), visibility toggles for header, footer, history, and uptime percentage.

The application-wide title, logo, and footer text can also be overridden at runtime with environment variables:

```bash
WEBSITE_TITLE="Uptime Status"
WEBSITE_LOGOPATH="/content/images/logo.png"
WEBSITE_FOOTERTITLE="Powered by Uptime Status"
```

See the main [Deployment guide](/products/uptime-o/docs/deployment) for the full list of branding variables.
