import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadDocContent } from '@/lib/docs-server';
import { loadProductBySlugClient, loadProductsClient } from '@/lib/docs-client';
import DocsLayout from '@/components/layout/DocsLayout';
import DocContent from '@/components/docs/DocContent';

interface ProductDocPageProps {
  params: Promise<{
    slug: string;
    docSlug: string[];
  }>;
}

export default async function ProductDocPage({ params }: ProductDocPageProps) {
  const { slug, docSlug } = await params;
  const product = loadProductBySlugClient(slug);
  
  if (!product || !product.sidebar) {
    notFound();
  }

  const fullSlug = docSlug.join('/');
  const doc = await loadDocContent(`products/${product.id}`, docSlug);
  
  // Find current item for title
  let currentTitle = docSlug[docSlug.length - 1];
  for (const group of product.sidebar) {
    for (const item of group.items) {
      if (item.slug === fullSlug) {
        currentTitle = item.title;
        break;
      }
    }
  }

  return (
    <DocsLayout 
      sidebar={{ groups: product.sidebar }}
      basePath={`/products/${slug}/docs`}
    >
      <div className="mb-8">
        <Link 
          href={`/products/${slug}`}
          className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1"
        >
          ← Back to {product.name}
        </Link>
      </div>
      
      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold text-white mb-2">
          {doc?.meta.title || currentTitle}
        </h1>
        {doc?.meta.description && (
          <p className="text-gray-400 text-lg mb-8">{doc.meta.description}</p>
        )}
        {doc ? (
          <DocContent content={doc.content} />
        ) : (
          <div className="rounded-lg border border-gray-800 bg-[#0f1117] p-8 text-center">
            <p className="text-gray-500">Documentation content coming soon.</p>
            <p className="text-sm text-gray-600 mt-2">
              Create a file at <code className="text-gray-400">content/products/{product.id}/{fullSlug}.md</code>
            </p>
          </div>
        )}
      </article>
    </DocsLayout>
  );
}

export function generateStaticParams() {
  const products = loadProductsClient();
  const params: { slug: string; docSlug: string[] }[] = [];
  
  for (const product of products) {
    if (product.sidebar) {
      for (const group of product.sidebar) {
        for (const item of group.items) {
          params.push({
            slug: product.slug,
            docSlug: item.slug.split('/')
          });
        }
      }
    }
  }
  
  return params;
}
