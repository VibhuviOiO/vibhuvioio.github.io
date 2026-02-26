import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
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
import InvertedIndexDemo from '@/components/docs/InvertedIndexDemo';
import CourseJourneyDemo from '@/components/docs/CourseJourneyDemo';
import MilvusCourseJourneyDemo from '@/components/docs/MilvusCourseJourneyDemo';
import MilvusArchitecture from '@/components/ui/MilvusArchitecture';
import MilvusDeploymentArchitecture from '@/components/ui/MilvusDeploymentArchitecture';
import MilvusInteractiveArchitecture from '@/components/ui/MilvusInteractiveArchitecture';
import PineconeLearningPath from '@/components/docs/PineconeLearningPath';
import QdrantLearningPath from '@/components/docs/QdrantLearningPath';
import { Search, Database, Layers, TreePine, Target } from 'lucide-react';

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
  milvus: {
    color: 'linear-gradient(135deg, #00bcd4 0%, #00796b 100%)',
    level: 'Advanced',
    icon: <Layers className="h-12 w-12 text-white/80" strokeWidth={1.5} />,
    whatYoullLearn: [
      'Deploy Milvus in all modes: Lite, Standalone, Docker Compose, and Kubernetes',
      'Configure etcd, MinIO, and Pulsar for production reliability',
      'Master milvus.yaml with 500+ parameters — know what matters',
      'Design collections and choose indexes for your workload',
      'Scale horizontally and perform rolling upgrades',
      'Optimize query performance and memory usage',
      'Implement security with TLS and RBAC',
      'Backup, restore, and cross-cluster migration',
      'Monitor metrics and troubleshoot common issues',
    ],
    updated: 'Feb 2026',
    totalDuration: '8h',
    readingTime: '4h',
    labTime: '4h',
    githubUrl: 'https://github.com/VibhuviOiO/milvus-ops',
  },
  pinecone: {
    color: 'linear-gradient(135deg, #2d5016 0%, #4a7c2e 100%)',
    level: 'Intermediate',
    icon: <TreePine className="h-12 w-12 text-white/80" strokeWidth={1.5} />,
    whatYoullLearn: [
      'Set up Pinecone accounts and manage API keys across environments',
      'Create and configure indexes with proper sizing for your workload',
      'Understand the difference between pods and serverless pricing models',
      'Implement metadata filtering and understand its limitations',
      'Optimize costs through proper index sizing and model selection',
      'Monitor query performance and resource utilization',
      'Implement backup and migration strategies for vector data',
      'Apply security best practices for production deployments',
    ],
    updated: 'Feb 2026',
    totalDuration: '6h',
    readingTime: '3h',
    labTime: '3h',
    githubUrl: 'https://github.com/VibhuviOiO/pinecone-ops',
  },
  qdrant: {
    color: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    level: 'Advanced',
    icon: <Target className="h-12 w-12 text-white/80" strokeWidth={1.5} />,
    whatYoullLearn: [
      'Deploy Qdrant with Docker, Docker Compose, and Kubernetes Helm charts',
      'Configure storage options: in-memory, on-disk, and hybrid modes',
      'Tune performance parameters for low-latency vector search',
      'Implement vector quantization to reduce memory usage',
      'Set up distributed Qdrant clusters with sharding and replication',
      'Configure Prometheus monitoring and Grafana dashboards',
      'Enable TLS encryption and API key authentication',
      'Perform backup and restore operations with snapshots',
    ],
    updated: 'Feb 2026',
    totalDuration: '8h',
    readingTime: '4h',
    labTime: '4h',
    githubUrl: 'https://github.com/VibhuviOiO/qdrant-ops',
  },
};

interface OperationsPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: OperationsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryId = slug[0];
  const { categories } = loadOperationsSidebarClient(categoryId);
  if (categories.length === 0) return {};

  const category = categories[0];
  const url = `/learn/${slug.join('/')}/`;
  const isOverview = slug.length === 2 && slug[1] === 'overview';

  if (isOverview) {
    return {
      title: category.title,
      description: category.description || '',
      openGraph: {
        title: category.title,
        description: category.description || '',
        type: 'website',
        url,
        siteName: 'VibhuviOiO',
      },
      twitter: {
        card: 'summary_large_image',
        title: category.title,
        description: category.description || '',
      },
      alternates: { canonical: url },
    };
  }

  const doc = loadDocContent('operations-docs', slug);
  if (!doc) return {};

  const title = doc.meta.title || slug[slug.length - 1];
  const description = doc.meta.description || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      siteName: 'VibhuviOiO',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: { canonical: url },
  };
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
          {(
            projects.length > 0 ||
            doc.content.includes('___INVERTED_INDEX_DEMO___') ||
            doc.content.includes('___COURSE_JOURNEY_DEMO___') ||
            doc.content.includes('___MILVUS_ARCHITECTURE___') ||
            doc.content.includes('___MILVUS_COURSE_JOURNEY___') ||
            doc.content.includes('___MILVUS_DEPLOYMENT_ARCHITECTURE___') ||
            doc.content.includes('___MILVUS_INTERACTIVE_ARCHITECTURE___') ||
            doc.content.includes('___PINECONE_LEARNING_PATH___') ||
            doc.content.includes('___QDRANT_LEARNING_PATH___')
          ) ? (
            doc.content
              .split(/(___PROJECT_BLOCK_\d+___|___INVERTED_INDEX_DEMO___|___COURSE_JOURNEY_DEMO___|___MILVUS_ARCHITECTURE___|___MILVUS_COURSE_JOURNEY___|___MILVUS_DEPLOYMENT_ARCHITECTURE___|___MILVUS_INTERACTIVE_ARCHITECTURE___|___PINECONE_LEARNING_PATH___|___QDRANT_LEARNING_PATH___)/)
              .map((segment, i) => {
                if (segment === '___INVERTED_INDEX_DEMO___') return <InvertedIndexDemo key={`demo-${i}`} />;
                if (segment === '___COURSE_JOURNEY_DEMO___') return <CourseJourneyDemo key={`journey-${i}`} />;
                if (segment === '___MILVUS_ARCHITECTURE___') return <MilvusArchitecture key={`arch-${i}`} />;
                if (segment === '___MILVUS_COURSE_JOURNEY___') return <MilvusCourseJourneyDemo key={`milvus-journey-${i}`} />;
                if (segment === '___MILVUS_DEPLOYMENT_ARCHITECTURE___') return <MilvusDeploymentArchitecture key={`deploy-arch-${i}`} />;
                if (segment === '___MILVUS_INTERACTIVE_ARCHITECTURE___') return <MilvusInteractiveArchitecture key={`interactive-arch-${i}`} />;
                if (segment === '___PINECONE_LEARNING_PATH___') return <PineconeLearningPath key={`pinecone-path-${i}`} />;
                if (segment === '___QDRANT_LEARNING_PATH___') return <QdrantLearningPath key={`qdrant-path-${i}`} />;
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
