import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { DocItem, ProductInfo, SidebarGroup, OperationsDocCategory, GeneralDocCategory } from '@/types/docs';

const CONTENT_DIR = path.join(process.cwd(), 'content');

// Load sidebar configurations
export function loadGeneralSidebar(): { groups: SidebarGroup[] } {
  const configPath = path.join(process.cwd(), 'config/sidebars/general-docs.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return { groups: config.groups };
}

export function loadOperationsSidebar(category?: string): { categories: OperationsDocCategory[] } {
  const configPath = path.join(process.cwd(), 'config/sidebars/operations-docs.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  if (category) {
    return { 
      categories: config.categories.filter((c: OperationsDocCategory) => c.id === category) 
    };
  }
  return { categories: config.categories };
}

export function loadProducts(): ProductInfo[] {
  const configPath = path.join(process.cwd(), 'config/sidebars/products.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return config.products;
}

export function loadProductBySlug(slug: string): ProductInfo | null {
  const products = loadProducts();
  return products.find(p => p.slug === slug) || null;
}

// Load markdown content
export function loadDocContent(type: string, slug: string[]): { content: string; meta: Record<string, any> } | null {
  const filePath = path.join(CONTENT_DIR, type, ...slug) + '.md';
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);
  
  return {
    content,
    meta: data
  };
}

// Get all docs for a type
export function getAllDocs(type: string): DocItem[] {
  const typeDir = path.join(CONTENT_DIR, type);
  
  if (!fs.existsSync(typeDir)) {
    return [];
  }
  
  const docs: DocItem[] = [];
  
  function traverseDir(dir: string, basePath: string[] = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverseDir(fullPath, [...basePath, item]);
      } else if (item.endsWith('.md')) {
        const slug = [...basePath, item.replace('.md', '')];
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContent);
        
        docs.push({
          id: slug.join('-'),
          title: data.title || slug[slug.length - 1],
          slug: slug.join('/'),
          description: data.description,
          type: type as any,
          category: data.category || basePath[0],
          order: data.order || 999,
          content,
          meta: data
        });
      }
    }
  }
  
  traverseDir(typeDir);
  return docs.sort((a, b) => (a.order || 999) - (b.order || 999));
}

// Get doc by slug
export function getDocBySlug(type: string, slug: string[]): DocItem | null {
  const docs = getAllDocs(type);
  const docSlug = slug.join('/');
  return docs.find(d => d.slug === docSlug) || null;
}

// Generate static params for docs
export function generateDocParams(type: string): { slug: string[] }[] {
  const docs = getAllDocs(type);
  return docs.map(doc => ({
    slug: doc.slug.split('/')
  }));
}
