// Server-side utilities - no 'use server' for static export compatibility

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { DocItem, SidebarGroup } from '@/types/docs';

const CONTENT_DIR = path.join(process.cwd(), 'content');

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
