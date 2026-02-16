import { notFound } from 'next/navigation';
import { loadDocContent } from '@/lib/docs-server';
import { loadOperationsSidebarClient } from '@/lib/docs-client';
import { CourseLessonLayout } from '@/components/layout/CourseLayout';
import CourseLanding from '@/components/layout/CourseLanding';
import DocContent from '@/components/docs/DocContent';
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
}> = {
  elk: {
    color: 'linear-gradient(135deg, #1e3a5f 0%, #2d5f8a 100%)',
    level: 'Advanced',
    icon: <Search className="h-12 w-12 text-white/80" strokeWidth={1.5} />,
    whatYoullLearn: [
      'Deploy a production ELK cluster from scratch',
      'Configure Logstash pipelines for Kafka, Docker, and Filebeat',
      'Manage Elasticsearch indices, snapshots, and backups',
      'Build Kibana dashboards and set up alerting',
      'Scale and troubleshoot ELK in production',
      'Secure your ELK stack with authentication and TLS',
    ],
    prerequisites: [
      'Basic Linux command line knowledge',
      'Docker and Docker Compose fundamentals',
      'Understanding of JSON and YAML',
    ],
    updated: 'Feb 2026',
    totalDuration: '4h 30m',
    githubUrl: 'https://github.com/vibhuvioio/elk-stack',
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
        basePath="/operations"
        level={meta?.level || 'Intermediate'}
        whatYoullLearn={meta?.whatYoullLearn || []}
        prerequisites={meta?.prerequisites}
        updated={meta?.updated}
        totalDuration={meta?.totalDuration}
        githubUrl={meta?.githubUrl}
      />
    );
  }

  // Lesson page — shown for all other slugs
  if (!doc) {
    notFound();
  }

  return (
    <CourseLessonLayout
      sections={category.sidebar}
      basePath="/operations"
      courseTitle={category.title}
      courseSlug={categoryId}
    >
      <article className="prose max-w-none">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {doc.meta.title || slug[slug.length - 1]}
        </h1>
        {doc.meta.description && (
          <p className="text-gray-500 text-base mb-8">{doc.meta.description}</p>
        )}
        <DocContent content={doc.content} />
      </article>
      <DisqusComments title={doc.meta.title || slug[slug.length - 1]} />
    </CourseLessonLayout>
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
