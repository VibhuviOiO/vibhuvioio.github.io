import { notFound } from 'next/navigation';
import { loadDocContent } from '@/lib/docs-server';
import { loadOperationsSidebarClient } from '@/lib/docs-client';
import DocsLayout from '@/components/layout/DocsLayout';
import CourseLanding from '@/components/layout/CourseLanding';
import DocContent from '@/components/docs/DocContent';
import TableOfContents from '@/components/docs/TableOfContents';
import DisqusComments from '@/components/DisqusComments';
import { Search, Database, Github } from 'lucide-react';

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
      'Deploy and configure production Elasticsearch clusters',
      'Secure clusters with TLS certificates and role-based access control',
      'Build Logstash pipelines for MongoDB, S3, Kafka, and cluster migration',
      'Collect logs and metrics with Filebeat and Metricbeat',
      'Monitor cluster health, slow queries, and thread pool performance',
      'Manage index lifecycles, analyzers, backups, and disaster recovery',
      'Analyze Nginx access logs with bot detection and attack identification',
      'Tune JVM heap, garbage collection, and OS-level performance',
    ],
    prerequisites: [
      'Basic Linux command line knowledge',
      'Docker and Docker Compose fundamentals',
      'Understanding of JSON and REST APIs',
    ],
    updated: 'Feb 2026',
    totalDuration: '16h',
    readingTime: '8h',
    labTime: '8h',
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

  // Resolve ```fetch:lang``` blocks — fetch raw URLs at build time
  const fetchPattern = /```fetch:(\w+)\n(https?:\/\/[^\s]+)\n```/g;
  const fetchMatches = [...doc.content.matchAll(fetchPattern)];
  if (fetchMatches.length > 0) {
    const results = await Promise.all(
      fetchMatches.map(async (match) => {
        const [, , url] = match;
        try {
          const res = await fetch(url, { next: { revalidate: 3600 } });
          if (!res.ok) return null;
          return await res.text();
        } catch {
          return null;
        }
      })
    );
    let resolvedContent = doc.content;
    fetchMatches.forEach((match, i) => {
      const [fullMatch, lang] = match;
      const fetched = results[i];
      if (fetched !== null) {
        resolvedContent = resolvedContent.replace(fullMatch, '```' + lang + '\n' + fetched + '```');
      } else {
        resolvedContent = resolvedContent.replace(fullMatch, '```' + lang + '\n# Failed to fetch file\n```');
      }
    });
    doc.content = resolvedContent;
  }

  // Find the current lesson's githubUrl from sidebar config
  const currentSlug = slug.join('/');
  let lessonGithubUrl: string | undefined;
  for (const section of category.sidebar) {
    for (const item of section.items) {
      if (item.slug === currentSlug && (item as any).githubUrl) {
        lessonGithubUrl = (item as any).githubUrl;
        break;
      }
    }
    if (lessonGithubUrl) break;
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
            <div className="flex items-start gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {doc.meta.title || slug[slug.length - 1]}
              </h1>
              {lessonGithubUrl && (
                <a
                  href={lessonGithubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-1 rounded-md bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 transition-colors shrink-0"
                  title="View source on GitHub"
                >
                  <Github className="h-3.5 w-3.5" />
                  <span>GitHub</span>
                </a>
              )}
            </div>
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
