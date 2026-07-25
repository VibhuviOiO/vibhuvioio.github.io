import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadDocContent } from '@/lib/docs-server';
import DocsLayout from '@/components/layout/DocsLayout';
import DocContent from '@/components/docs/DocContent';
import TableOfContents from '@/components/docs/TableOfContents';

const sidebarGroups = [
  {
    title: 'Getting Started',
    items: [
      { id: 'getting-started', title: 'Getting Started', slug: 'getting-started' },
      { id: 'installation', title: 'Installation', slug: 'installation' },
      { id: 'first-agent', title: 'First Agent', slug: 'first-agent' },
    ],
  },
  {
    title: 'Features',
    items: [
      { id: 'regions-datacenters', title: 'Regions & Datacenters', slug: 'regions-datacenters' },
      { id: 'agents', title: 'Agents', slug: 'agents' },
      { id: 'http-monitors', title: 'HTTP Monitors', slug: 'http-monitors' },
      { id: 'schedules', title: 'Schedules', slug: 'schedules' },
      { id: 'status-pages', title: 'Status Pages', slug: 'status-pages' },
      { id: 'notifications', title: 'Notifications & Alerts', slug: 'notifications' },
      { id: 'uptime-analytics', title: 'Uptime Analytics', slug: 'uptime-analytics' },
      { id: 'audit-retention', title: 'Audit & Retention', slug: 'audit-retention' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'deployment', title: 'Deployment', slug: 'deployment' },
      { id: 'agent-installation', title: 'Agent Installation', slug: 'agent-installation' },
      { id: 'prometheus-integration', title: 'Prometheus Integration', slug: 'prometheus-integration' },
      { id: 'troubleshooting', title: 'Troubleshooting', slug: 'troubleshooting' },
    ],
  },
  {
    title: 'Development',
    items: [
      { id: 'development', title: 'Development Guide', slug: 'development' },
      { id: 'testing', title: 'Testing Guide', slug: 'testing' },
    ],
  },
  {
    title: 'API',
    items: [{ id: 'authentication', title: 'Authentication', slug: 'authentication' }],
  },
];

const docSeo: Record<string, { title: string; description: string }> = {
  'getting-started': {
    title: 'Getting Started - UptimeO',
    description: 'Introduction to UptimeO, the self-hosted uptime observability platform.',
  },
  'installation': {
    title: 'Installation - UptimeO',
    description: 'Deploy UptimeO with Docker Compose, PostgreSQL, and environment variables.',
  },
  'first-agent': {
    title: 'First Agent - UptimeO',
    description: 'Create and connect your first UptimeO monitoring agent.',
  },
  'regions-datacenters': {
    title: 'Regions & Datacenters - UptimeO',
    description: 'Organize monitors and agents by region and datacenter.',
  },
  'agents': {
    title: 'Agents - UptimeO',
    description: 'Manage distributed Go monitoring agents in UptimeO.',
  },
  'http-monitors': {
    title: 'HTTP Monitors - UptimeO',
    description: 'Configure HTTP/HTTPS monitors and assign them to agents.',
  },
  'schedules': {
    title: 'Schedules - UptimeO',
    description: 'Define how often monitors run with UptimeO schedules.',
  },
  'status-pages': {
    title: 'Status Pages - UptimeO',
    description: 'Create public and private status pages from your monitors.',
  },
  'notifications': {
    title: 'Notifications & Alerts - UptimeO',
    description: 'Configure Slack and email alerts for monitor outages, high latency, and agent issues.',
  },
  'uptime-analytics': {
    title: 'Uptime Analytics - UptimeO',
    description: 'Analyze availability, response times, and status history.',
  },
  'audit-retention': {
    title: 'Audit & Retention - UptimeO',
    description: 'Review audit logs and configure data retention policies.',
  },
  'deployment': {
    title: 'Deployment - UptimeO',
    description: 'Production deployment guidance for UptimeO.',
  },
  'agent-installation': {
    title: 'Agent Installation - UptimeO',
    description: 'Install and run UptimeO monitoring agents in Docker or standalone.',
  },
  'prometheus-integration': {
    title: 'Prometheus Integration - UptimeO',
    description: 'Ingest Prometheus and Blackbox exporter metrics into UptimeO.',
  },
  'troubleshooting': {
    title: 'Troubleshooting - UptimeO',
    description: 'Common issues and fixes for UptimeO deployments.',
  },
  'development': {
    title: 'Development Guide - UptimeO',
    description: 'Development workflow, scripts, and branding for UptimeO.',
  },
  'testing': {
    title: 'Testing Guide - UptimeO',
    description: 'Run backend, frontend, and end-to-end tests for UptimeO.',
  },
  'authentication': {
    title: 'Authentication - UptimeO API',
    description: 'Authenticate with the UptimeO API using API keys.',
  },
};

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugKey = slug.join('/');
  const seo = docSeo[slugKey] || {
    title: 'UptimeO Documentation',
    description: 'Documentation for UptimeO.',
  };

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `https://vibhuvioio.com/products/uptime-o/docs/${slugKey}`,
    },
  };
}

export default async function UptimeODocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = loadDocContent('uptime-o', slug);

  if (!doc) {
    notFound();
  }

  return (
    <DocsLayout sidebar={{ groups: sidebarGroups }} basePath="/products/uptime-o/docs">
      <div className="mb-8">
        <Link
          href="/products/uptime-o"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          ← Back to UptimeO
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
  return [
    { slug: ['getting-started'] },
    { slug: ['installation'] },
    { slug: ['first-agent'] },
    { slug: ['regions-datacenters'] },
    { slug: ['agents'] },
    { slug: ['http-monitors'] },
    { slug: ['schedules'] },
    { slug: ['status-pages'] },
    { slug: ['notifications'] },
    { slug: ['uptime-analytics'] },
    { slug: ['audit-retention'] },
    { slug: ['deployment'] },
    { slug: ['agent-installation'] },
    { slug: ['prometheus-integration'] },
    { slug: ['troubleshooting'] },
    { slug: ['development'] },
    { slug: ['testing'] },
    { slug: ['authentication'] },
  ];
}
