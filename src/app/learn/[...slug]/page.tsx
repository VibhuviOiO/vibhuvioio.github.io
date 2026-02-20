import { notFound } from 'next/navigation';
import { loadDocContent } from '@/lib/docs-server';
import { loadOperationsSidebarClient } from '@/lib/docs-client';
import DocsLayout from '@/components/layout/DocsLayout';
import CourseLanding from '@/components/layout/CourseLanding';
import DocContent from '@/components/docs/DocContent';
import TableOfContents from '@/components/docs/TableOfContents';
import DisqusComments from '@/components/DisqusComments';
import { Search, Database } from 'lucide-react';

// Course metadata — colors, levels, learning outcomes
const courseMeta: Record<string, {
  color: string;
  level: string;
  icon: React.ReactNode;
  whatYoullLearn: string[];
  prerequisites?: string[];
  updated?: string;
  totalDuration?: string;
  githubUrl?: string;
  readingTime?: string;
  labTime?: string;
}> = {
  elk: {
    color: 'linear-gradient(135deg, #1e3a5f 0%, #2d5f8a 100%)',
    level: 'Advanced',
    icon: <Search className="h-12 w-12 text-white/80" strokeWidth={1.5} />,
    whatYoullLearn: [
      'Deploy a production ELK cluster from scratch',
      'Configure Logstash pipelines for MongoDB, S3, and Filebeat',
      'Manage Elasticsearch indices, snapshots, and backups',
      'Build Kibana dashboards and set up monitoring',
      'Scale and troubleshoot ELK in production',
      'Implement data migration between clusters',
    ],
    prerequisites: [
      'Basic Linux command line knowledge',
      'Docker and Docker Compose fundamentals',
      'Understanding of JSON and REST APIs',
    ],
    updated: 'Feb 2026',
    totalDuration: '8h 30m',
    readingTime: '4h 15m',
    labTime: '4h 15m',
    githubUrl: 'https://github.com/JinnaBalu/infinite-containers',
  },
  mongo: {
    color: 'linear-gradient(135deg, #2d6a30 0%, #4a9e4e 100%)',
    level: 'Intermediate',
    icon: <Database className="h-12 w-12 text-white/80" strokeWidth={1.5} />,
    whatYoullLearn: [
      'Deploy MongoDB as standalone and replica set',
      'Configure arbiter nodes and understand elections',
      'Migrate from on-prem to Atlas and perform live migrations',
      'Set up highly available MongoDB clusters',
      'Implement disaster recovery strategies',
      'Production management tips and best practices',
    ],
    prerequisites: [
      'Basic database concepts',
      'Familiarity with command line',
      'Docker basics (for container deployments)',
    ],
    updated: 'Jan 2026',
    totalDuration: '3h 15m',
    githubUrl: 'https://github.com/vibhuvioio/mongodb-ops',
  },
};

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
  const meta = courseMeta[categoryId];
  const isOverview = slug.length === 2 && slug[1] === 'overview';

  // Course landing page — shown for overview pages
  if (isOverview) {
    return (
      <CourseLanding
        title={category.title}
        description={category.description || ''}
        color={meta?.color || 'linear-gradient(135deg, #2702a6 0%, #200289 100%)'}
        icon={meta?.icon || null}
        sections={category.sidebar}
        basePath="/learn"
        level={meta?.level || 'Intermediate'}
        whatYoullLearn={meta?.whatYoullLearn || []}
        prerequisites={meta?.prerequisites}
        updated={meta?.updated}
        totalDuration={category.totalDuration || meta?.totalDuration}
        readingTime={category.readingTime || meta?.readingTime}
        labTime={category.labTime || meta?.labTime}
        githubUrl={category.githubUrl || meta?.githubUrl}
      />
    );
  }

  // Lesson page — shown for all other slugs
  if (!doc) {
    notFound();
  }

  // Convert operations sidebar to docs sidebar format
  const sidebarGroups = category.sidebar.map(section => ({
    title: section.title,
    items: section.items.map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug
    }))
  }));

  return (
    <DocsLayout
      sidebar={{ groups: sidebarGroups }}
      basePath="/learn"
    >
      <div className="flex gap-8">
        <article className="flex-1 min-w-0 max-w-none">
          {/* Lesson Header */}
          <div className="border-b border-gray-200 pb-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {doc.meta.title || slug[slug.length - 1]}
            </h1>
            {doc.meta.description && (
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
                {doc.meta.description}
              </p>
            )}
          </div>
          <DocContent content={doc.content} />
          <DisqusComments title={doc.meta.title || slug[slug.length - 1]} />
        </article>
        <TableOfContents content={doc.content} />
      </div>
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
