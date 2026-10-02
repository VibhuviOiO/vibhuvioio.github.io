import type { Metadata } from "next";
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadDocContent } from '@/lib/docs-server';
import { processLessonContent } from '@/lib/content-processor';
import DocsLayout from '@/components/layout/DocsLayout';
import DocContent from '@/components/docs/DocContent';
import TableOfContents from '@/components/docs/TableOfContents';
import ProjectExplorer from '@/components/docs/ProjectExplorer';

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
  'authentication': {
    title: 'Authentication Modes - LDAP Manager',
    description: 'auth.mode none, local and ldap explained: exact config.yml, where each role comes from, and whether login is required.',
  },
  'audit-logging': {
    title: 'Audit & Change Logs - LDAP Manager',
    description: 'The always-on app audit log that names the UI user, and the OpenLDAP accesslog overlay that sees every writer. Enablement and deployment constraints.',
  },
  'compatibility': {
    title: 'Compatibility - LDAP Manager',
    description: 'What works with any OpenLDAP server, what needs optional server-side configuration, and the exact enablement LDIF.',
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
      { id: 'compatibility', title: 'Compatibility', slug: 'compatibility' },
    ],
  },
  {
    title: 'Features',
    items: [
      { id: 'features', title: 'Overview', slug: 'features' },
      { id: 'ui-guide', title: 'UI Guide', slug: 'ui-guide' },
      { id: 'security', title: 'Security', slug: 'security' },
    ],
  },
  {
    title: 'Access & Audit',
    items: [
      { id: 'authentication', title: 'Authentication Modes', slug: 'authentication' },
      { id: 'audit-logging', title: 'Audit & Change Logs', slug: 'audit-logging' },
    ],
  },
  {
    title: 'Deployment',
    items: [
      { id: 'production', title: 'Production Guide', slug: 'production' },
      { id: 'tls', title: 'TLS & LDAPS', slug: 'tls' },
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

  // Resolve ```project blocks into ProjectExplorer panels; files are fetched at build time
  const { content, projects } = await processLessonContent(doc.content);
  doc.content = content;

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
          {projects.length > 0 ? (
            doc.content
              .split(/(___PROJECT_BLOCK_\d+___)/)
              .map((segment, i) => {
                const projectMatch = segment.match(/___PROJECT_BLOCK_(\d+)___/);
                if (projectMatch) {
                  const project = projects[parseInt(projectMatch[1])];
                  return project
                    ? <ProjectExplorer key={`project-${i}`} name={project.name} files={project.files} />
                    : null;
                }
                return segment.trim()
                  ? <DocContent key={`content-${i}`} content={segment} />
                  : null;
              })
          ) : (
            <DocContent content={doc.content} />
          )}
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
    { slug: ['ui-guide'] },
    { slug: ['security'] },
    { slug: ['production'] },
    { slug: ['tls'] },
    { slug: ['development'] },
    { slug: ['testing'] },
    { slug: ['authentication'] },
    { slug: ['audit-logging'] },
    { slug: ['compatibility'] },
  ];
  return paths;
}
