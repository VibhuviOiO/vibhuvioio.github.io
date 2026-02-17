import type { Metadata } from "next";
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadDocContent } from '@/lib/docs-server';
import DocsLayout from '@/components/layout/DocsLayout';
import DocContent from '@/components/docs/DocContent';
import TableOfContents from '@/components/docs/TableOfContents';

// SEO metadata mapping for doc pages
const docSeo: Record<string, { title: string; description: string }> = {
  'getting-started': {
    title: 'Getting Started - Docker Registry UI Installation',
    description: 'Learn how to install and configure Docker Registry UI. Quick start guide for Docker, Docker Compose, and local development setup.',
  },
  'configuration': {
    title: 'Configuration Guide - Docker Registry UI',
    description: 'Complete configuration guide for Docker Registry UI. Set up registries, environment variables, and authentication.',
  },
  'features': {
    title: 'Features - Docker Registry UI',
    description: 'Explore Docker Registry UI features: repository management, vulnerability scanning, bulk operations, and multi-registry support.',
  },
  'security': {
    title: 'Security Scanning - Docker Registry UI',
    description: 'Learn about vulnerability scanning with Trivy in Docker Registry UI. Scan images and view CVE details.',
  },
  'bulk-operations': {
    title: 'Bulk Operations - Docker Registry UI',
    description: 'Perform bulk operations on Docker images. Delete multiple tags based on patterns, age, and retention policies.',
  },
  'api': {
    title: 'API Integration - Docker Registry UI',
    description: 'Docker Registry API integration guide. Programmatically manage your Docker Registry through the API.',
  },
  'development': {
    title: 'Development Guide - Docker Registry UI',
    description: 'Contribute to Docker Registry UI. Development setup, build instructions, and contribution guidelines.',
  },
  'testing': {
    title: 'Testing Guide - Docker Registry UI',
    description: 'Testing guide for Docker Registry UI. Learn how to test with multi-registry setup and validate all features.',
  },
};

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugKey = slug.join('/');
  const seo = docSeo[slugKey] || {
    title: 'Docker Registry UI Documentation',
    description: 'Documentation for Docker Registry UI - Modern web interface for managing Docker Registry.',
  };
  
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `https://vibhuvioio.com/docker-registry-ui/${slugKey}`,
    },
  };
}

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

  // Title comes from markdown content H1, not meta

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
