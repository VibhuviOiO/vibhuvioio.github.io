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
      { id: 'security', title: 'Security', slug: 'security' },
    ],
  },
  {
    title: 'Deployment',
    items: [
      { id: 'production', title: 'Production Guide', slug: 'production' },
    ],
  },
  {
    title: 'Contributing',
    items: [
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

export default async function LDAPManagerDocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = loadDocContent('ldap-manager', slug);
  
  if (!doc) {
    notFound();
  }

  // Title comes from markdown content H1, not meta

  return (
    <DocsLayout 
      sidebar={{ groups: sidebarGroups }}
      basePath="/ldap-manager"
    >
      <div className="mb-8">
        <Link 
          href="/ldap-manager"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          ← Back to LDAP Manager
        </Link>
      </div>
      
      <article className="prose max-w-none">
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
    { slug: ['production'] },
    { slug: ['development'] },
    { slug: ['testing'] },
  ];
  return paths;
}
