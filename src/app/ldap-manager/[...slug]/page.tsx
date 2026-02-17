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
    title: 'Getting Started - LDAP Manager Installation',
    description: 'Learn how to install and configure LDAP Manager. Quick start guide for Docker, Docker Compose, and OpenLDAP setup.',
  },
  'configuration': {
    title: 'Configuration Guide - LDAP Manager',
    description: 'Complete configuration guide for LDAP Manager. Set up LDAP clusters, user creation forms, and environment variables.',
  },
  'features': {
    title: 'Features - LDAP Manager',
    description: 'Explore LDAP Manager features: multi-cluster management, user/group management, real-time monitoring, and custom schema support.',
  },
  'security': {
    title: 'Security - LDAP Manager',
    description: 'Learn about LDAP Manager security features. Password encryption, LDAP injection protection, and best practices.',
  },
  'production': {
    title: 'Production Guide - LDAP Manager',
    description: 'Deploy LDAP Manager in production. High availability setup, CORS configuration, logging, and monitoring.',
  },
  'development': {
    title: 'Development Guide - LDAP Manager',
    description: 'Contribute to LDAP Manager. Development setup, backend/frontend structure, and testing.',
  },
  'testing': {
    title: 'Testing Guide - LDAP Manager',
    description: 'Testing guide for LDAP Manager. Run tests, validate multi-registry setup, and ensure feature coverage.',
  },
};

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugKey = slug.join('/');
  const seo = docSeo[slugKey] || {
    title: 'LDAP Manager Documentation',
    description: 'Documentation for LDAP Manager - Modern web interface for OpenLDAP.',
  };
  
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `https://vibhuvioio.com/ldap-manager/${slugKey}`,
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
    { slug: ['production'] },
    { slug: ['development'] },
    { slug: ['testing'] },
  ];
  return paths;
}
