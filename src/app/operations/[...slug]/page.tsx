import { notFound } from 'next/navigation';
import { loadDocContent } from '@/lib/docs-server';
import { loadOperationsSidebarClient } from '@/lib/docs-client';
import DocsLayout from '@/components/layout/DocsLayout';
import DocContent from '@/components/docs/DocContent';

interface OperationsPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function OperationsDocPage({ params }: OperationsPageProps) {
  const { slug } = await params;
  const categoryId = slug[0];
  const { categories } = loadOperationsSidebarClient(categoryId);
  
  if (categories.length === 0) {
    notFound();
  }
  
  const category = categories[0];
  const doc = await loadDocContent('operations-docs', slug);
  
  // If no specific doc content, show category overview
  if (!doc) {
    return (
      <DocsLayout 
        sidebar={{ groups: category.sidebar }}
        basePath="/operations"
      >
        <div className="prose prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-white mb-2">{category.title}</h1>
          <p className="text-gray-400 text-lg mb-8">{category.description}</p>
          
          <div className="grid gap-4">
            {category.sidebar.map((group) => (
              <div key={group.title} className="rounded-lg border border-gray-800 bg-[#0f1117] p-4">
                <h2 className="text-lg font-semibold text-white mb-3">{group.title}</h2>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <a 
                      key={item.id}
                      href={`/operations/${item.slug}`}
                      className="block text-gray-300 hover:text-white"
                    >
                      {item.title}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DocsLayout>
    );
  }

  return (
    <DocsLayout 
      sidebar={{ groups: category.sidebar }}
      basePath="/operations"
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
  const { categories } = loadOperationsSidebarClient();
  const params: { slug: string[] }[] = [];
  
  for (const category of categories) {
    for (const group of category.sidebar) {
      for (const item of group.items) {
        params.push({ slug: item.slug.split('/') });
      }
    }
  }
  
  return params;
}
