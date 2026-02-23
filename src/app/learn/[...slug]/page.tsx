import { notFound } from 'next/navigation';
import { loadDocContent } from '@/lib/docs-server';
import { loadOperationsSidebarClient } from '@/lib/docs-client';
import {
  processLessonContent,
  buildSidebarGroups,
  findLessonGithubUrl,
} from '@/lib/content-processor';
import DocsLayout from '@/components/layout/DocsLayout';
import CourseLanding from '@/components/layout/CourseLanding';
import DocContent from '@/components/docs/DocContent';
import TableOfContents from '@/components/docs/TableOfContents';
import DisqusComments from '@/components/DisqusComments';
import ProjectExplorer from '@/components/docs/ProjectExplorer';
import LessonHeader from '@/components/docs/LessonHeader';
import { Search, Database } from 'lucide-react';

// Per-course metadata — colors, icons, learning outcomes
const courseMeta: Record<string, {
  color: string;
  level: string;
  icon: React.ReactNode;
  whatYoullLearn: string[];
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
      'Design, deploy, and manage Logstash pipelines for multiple data sources and migration use cases.',
      'Collect logs and metrics using lightweight agents and shippers for centralized observability.',
      'Optimize cluster performance, stability, and resource efficiency.',
      'Manage data lifecycle, resiliency, and recovery for search and analytics clusters.',
      'Analyze access logs to detect anomalous traffic and potential threats.',
      'Optimize runtime configuration and system performance for stability and scale.',
    ],
    updated: 'Feb 2026',
    totalDuration: '16h',
    readingTime: '8h',
    labTime: '8h',
    githubUrl: 'https://github.com/VibhuviOiO/infinite-containers',
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
    updated: 'Jan 2026',
    totalDuration: '3h 15m',
    githubUrl: 'https://github.com/VibhuviOiO/mongodb-ops',
  },
};

interface OperationsPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function OperationsDocPage({ params }: OperationsPageProps) {
  const { slug } = await params;
  const categoryId = slug[0];
  const { categories } = loadOperationsSidebarClient(categoryId);

  if (categories.length === 0) notFound();

  const category = categories[0];
  const meta = courseMeta[categoryId];
  const isOverview = slug.length === 2 && slug[1] === 'overview';

  // Course overview landing page
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
        updated={meta?.updated}
        totalDuration={category.totalDuration || meta?.totalDuration}
        readingTime={category.readingTime || meta?.readingTime}
        labTime={category.labTime || meta?.labTime}
        githubUrl={category.githubUrl || meta?.githubUrl}
      />
    );
  }

  // Individual lesson page
  const doc = loadDocContent('operations-docs', slug);
  if (!doc) notFound();

  const { content, projects } = await processLessonContent(doc.content);
  doc.content = content;

  const currentSlug = slug.join('/');
  const lessonGithubUrl = findLessonGithubUrl(category.sidebar, currentSlug);
  const sidebarGroups = buildSidebarGroups(category.sidebar);

  return (
    <DocsLayout sidebar={{ groups: sidebarGroups }} basePath="/learn">
      <div className="flex gap-8">
        <article className="flex-1 min-w-0 max-w-none">
          <LessonHeader
            title={doc.meta.title || slug[slug.length - 1]}
            description={doc.meta.description}
            duration={doc.meta.duration}
            readingTime={doc.meta.readingTime}
            labTime={doc.meta.labTime}
            githubUrl={lessonGithubUrl}
          />
          {projects.length > 0 ? (
            doc.content.split(/(___PROJECT_BLOCK_\d+___)/).map((segment, i) => {
              const match = segment.match(/___PROJECT_BLOCK_(\d+)___/);
              if (match) {
                const project = projects[parseInt(match[1])];
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
          <DisqusComments title={doc.meta.title || slug[slug.length - 1]} />
        </article>
        <TableOfContents content={doc.content} />
      </div>
    </DocsLayout>
  );
}

export function generateStaticParams() {
  const { categories } = loadOperationsSidebarClient();
  return categories.flatMap(category =>
    category.sidebar.flatMap(group =>
      group.items.map(item => ({ slug: item.slug.split('/') }))
    )
  );
}
