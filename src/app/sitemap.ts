import type { MetadataRoute } from 'next';
import { loadOperationsSidebarClient } from '@/lib/docs-client';

export const dynamic = 'force-static';

const BASE = 'https://vibhuvioio.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const { categories } = loadOperationsSidebarClient();

  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/learn/`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
  ];

  for (const category of categories) {
    // Course overview landing page
    entries.push({
      url: `${BASE}/learn/${category.slug}/overview/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    });

    // Individual lesson pages
    for (const group of category.sidebar) {
      for (const item of group.items) {
        entries.push({
          url: `${BASE}/learn/${item.slug}/`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    }
  }

  return entries;
}
