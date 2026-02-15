/**
 * Documentation Types and Interfaces
 */

export type DocType = 'general' | 'operations' | 'product';

export interface DocItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  type: DocType;
  category?: string;
  order?: number;
  content?: string;
  meta?: Record<string, any>;
}

export interface SidebarItem {
  id: string;
  title: string;
  slug: string;
  items?: SidebarItem[];
  collapsed?: boolean;
}

export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
  collapsed?: boolean;
}

export interface ProductInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  status: 'live' | 'coming-soon' | 'beta';
  repoUrl?: string;
  demoUrl?: string;
  pwdUrl?: string;
  features: string[];
  technologies: string[];
  sidebar: SidebarGroup[];
}

export interface GeneralDocCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  items: DocItem[];
}

export interface OperationsDocCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  stack: string[];
  items: DocItem[];
  sidebar: SidebarGroup[];
}
