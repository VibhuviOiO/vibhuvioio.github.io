import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadDocContent } from '@/lib/docs-server';
import DocsLayout from '@/components/layout/DocsLayout';
import DocContent from '@/components/docs/DocContent';

const sidebarGroups = [
  {
    title: 'Getting Started',
    items: [
      { id: 'getting-started', title: 'Installation', slug: 'getting-started' },
      { id: 'configuration', title: 'Configuration', slug: 'configuration' },
    ],
  },
  {
    title: 'Features',
    items: [
      { id: 'features', title: 'Overview', slug: 'features' },
      { id: 'security', title: 'Security Scanning', slug: 'security' },
      { id: 'bulk-operations', title: 'Bulk Operations', slug: 'bulk-operations' },
    ],
  },
  {
    title: 'Examples',
    items: [
      { id: 'multi-registry', title: 'Multi-Registry Setup', slug: 'examples/multi-registry' },
      { id: 'basic-auth', title: 'Basic Auth Registry', slug: 'examples/basic-auth' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { id: 'api', title: 'API Integration', slug: 'api' },
      { id: 'development', title: 'Development', slug: 'development' },
      { id: 'testing', title: 'Testing Guide', slug: 'testing' },
    ],
  },
];

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function DockerRegistryDocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = loadDocContent('docker-registry-ui', slug);
  
  if (!doc) {
    notFound();
  }

  const docTitle = doc.meta.title || slug[slug.length - 1];

  return (
    <DocsLayout 
      sidebar={{ groups: sidebarGroups }}
      basePath="/docker-registry-ui"
    >
      <div className="mb-8">
        <Link 
          href="/docker-registry-ui"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          ← Back to Docker Registry UI
        </Link>
      </div>
      
      <article className="prose max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{docTitle}</h1>
        {doc.meta.description && (
          <p className="text-gray-600 text-lg mb-8">{doc.meta.description}</p>
        )}
        <DocContent content={doc.content} />
      </article>
    </DocsLayout>
  );
}

export function generateStaticParams() {
  const paths = [
    { slug: ['getting-started'] },
    { slug: ['configuration'] },
    { slug: ['features'] },
    { slug: ['security'] },
    { slug: ['bulk-operations'] },
    { slug: ['api'] },
    { slug: ['development'] },
    { slug: ['testing'] },
    { slug: ['examples', 'multi-registry'] },
    { slug: ['examples', 'basic-auth'] },
  ];
  return paths;
}
