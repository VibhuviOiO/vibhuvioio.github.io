import { notFound } from 'next/navigation';
import { loadDocContent } from '@/lib/docs-server';
import { loadGeneralSidebarClient } from '@/lib/docs-client';
import DocsLayout from '@/components/layout/DocsLayout';
import DocContent from '@/components/docs/DocContent';
import TableOfContents from '@/components/docs/TableOfContents';

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
      sidebar={{ groups: sidebar.groups }}
      basePath="/docs"
    >
      <div className="flex gap-8">
        <article className="flex-1 min-w-0 max-w-none">
          <DocContent content={doc.content} />
        </article>
        <TableOfContents content={doc.content} />
      </div>
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
