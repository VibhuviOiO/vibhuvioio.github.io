import { notFound } from 'next/navigation';
import { loadDocContent } from '@/lib/docs-server';
import { loadGeneralSidebarClient } from '@/lib/docs-client';
import DocsLayout from '@/components/layout/DocsLayout';
import DocContent from '@/components/docs/DocContent';

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const sidebar = loadGeneralSidebarClient();
  const doc = await loadDocContent('general-docs', slug);
  
  if (!doc) {
    notFound();
  }

  return (
    <DocsLayout 
      sidebar={{ groups: sidebar.groups, title: 'General Docs' }}
      basePath="/docs"
    >
      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold text-white mb-2">{doc.meta.title || slug[slug.length - 1]}</h1>
        {doc.meta.description && (
          <p className="text-gray-400 text-lg mb-8">{doc.meta.description}</p>
        )}
        <DocContent content={doc.content} />
      </article>
    </DocsLayout>
  );
}

export function generateStaticParams() {
  const sidebar = loadGeneralSidebarClient();
  const params: { slug: string[] }[] = [];
  
  function collectSlugs(items: any[], basePath: string[] = []) {
    for (const item of items) {
      if (item.items) {
        collectSlugs(item.items, basePath);
      } else {
        params.push({ slug: item.slug.split('/') });
      }
    }
  }
  
  for (const group of sidebar.groups) {
    collectSlugs(group.items);
  }
  
  return params;
}
