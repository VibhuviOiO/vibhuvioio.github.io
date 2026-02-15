// Client-safe exports - no fs imports

import productsConfig from '../../config/sidebars/products.json';
import generalConfig from '../../config/sidebars/general-docs.json';
import operationsConfig from '../../config/sidebars/operations-docs.json';

export function loadProductsClient() {
  return productsConfig.products;
}

export function loadProductBySlugClient(slug: string) {
  return productsConfig.products.find((p: any) => p.slug === slug) || null;
}

export function loadGeneralSidebarClient() {
  return { groups: generalConfig.groups };
}

export function loadOperationsSidebarClient(category?: string) {
  if (category) {
    return { 
      categories: operationsConfig.categories.filter((c: any) => c.id === category) 
    };
  }
  return { categories: operationsConfig.categories };
}
