import type { Metadata } from "next";
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadDocContent } from '@/lib/docs-server';
import { processLessonContent } from '@/lib/content-processor';
import DocsLayout from '@/components/layout/DocsLayout';
import DocContent from '@/components/docs/DocContent';
import TableOfContents from '@/components/docs/TableOfContents';
import ProjectExplorer from '@/components/docs/ProjectExplorer';
import MultiMasterArchitecture from '@/components/ui/MultiMasterArchitecture';

const docSeo: Record<string, { title: string; description: string }> = {
  'getting-started': {
    title: 'Getting Started - OpenLDAP Docker',
    description: 'Quick start guide for OpenLDAP Docker. Deploy a production-ready LDAP server with Docker in minutes.',
  },
  'configuration': {
    title: 'Configuration - OpenLDAP Docker',
    description: 'Complete environment variable reference for OpenLDAP Docker. Configure domains, passwords, TLS, overlays, and replication.',
  },
  'replication': {
    title: 'Multi-Master Replication - OpenLDAP Docker',
    description: 'Set up a 3-node multi-master OpenLDAP cluster with automatic replication using Docker.',
  },
  'overlays': {
    title: 'Overlays - OpenLDAP Docker',
    description: 'Enable memberOf, password policy, audit logging, and referential integrity overlays in OpenLDAP Docker.',
  },
  'monitoring': {
    title: 'Monitoring - OpenLDAP Docker',
    description: 'Monitor OpenLDAP with cn=Monitor backend. Track connections, operations, and database health.',
  },
  'security': {
    title: 'Security - OpenLDAP Docker',
    description: 'Security best practices for OpenLDAP Docker. TLS/SSL, ACLs, non-root execution, and password policies.',
  },
  'integrations/keycloak': {
    title: 'Keycloak Integration - OpenLDAP Docker',
    description: 'Integrate OpenLDAP with Keycloak for SSO and user federation. Step-by-step Docker setup guide.',
  },
  'integrations/keycloak-auth-only': {
    title: 'Keycloak Auth Only - OpenLDAP Docker',
    description: 'Integrate OpenLDAP with Keycloak for authentication without user import. Minimal LDAP_ONLY pattern.',
  },
  'integrations/sonarqube': {
    title: 'SonarQube Integration - OpenLDAP Docker',
    description: 'Configure SonarQube LDAP authentication with OpenLDAP. Group-based authorization and read-only bind.',
  },
  'integrations/jenkins': {
    title: 'Jenkins Integration - OpenLDAP Docker',
    description: 'Integrate Jenkins with OpenLDAP for CI/CD authentication and group-based access control.',
  },
  'integrations/vault': {
    title: 'HashiCorp Vault Integration - OpenLDAP Docker',
    description: 'Configure HashiCorp Vault LDAP authentication with OpenLDAP. Policy-driven access control.',
  },
  'integrations/splunk': {
    title: 'Splunk Integration - OpenLDAP Docker',
    description: 'Configure Splunk Enterprise LDAP authentication with OpenLDAP. Role mapping and group authorization.',
  },
  'integrations/guacamole': {
    title: 'Apache Guacamole Integration - OpenLDAP Docker',
    description: 'Configure Apache Guacamole LDAP authentication with OpenLDAP. Centralized identity for remote access gateway.',
  },
  'integrations/redmine': {
    title: 'Redmine Integration - OpenLDAP Docker',
    description: 'Configure Redmine LDAP authentication with OpenLDAP. On-the-fly user creation and centralized identity management.',
  },
  'integrations/portainer': {
    title: 'Portainer Integration - OpenLDAP Docker',
    description: 'Configure Portainer CE LDAP authentication with OpenLDAP. Group-based administrator access control for container management.',
  },
  'use-cases/single-node': {
    title: 'Single Node Deployment - OpenLDAP Docker',
    description: 'Deploy a single-node OpenLDAP server with custom schemas, employee data, and persistent volumes using the OpenLDAP Docker image.',
  },
  'use-cases/multi-master-cluster': {
    title: 'Multi-Master Cluster - OpenLDAP Docker',
    description: 'Deploy a 3-node multi-master OpenLDAP cluster with automatic replication, custom schema, and 30 employees using Docker Compose.',
  },
  'use-cases/docker-secrets': {
    title: 'Docker Secrets - OpenLDAP Docker',
    description: 'Securely manage OpenLDAP passwords using Docker secrets instead of plaintext environment variables.',
  },
  'use-cases/tls-ssl': {
    title: 'TLS/SSL - OpenLDAP Docker',
    description: 'Deploy OpenLDAP with TLS/SSL support for encrypted connections using StartTLS and LDAPS.',
  },
  'use-cases/overlay-features': {
    title: 'Overlay Features - OpenLDAP Docker',
    description: 'Test memberOf, password policy, and audit log overlays simultaneously in a single OpenLDAP Docker deployment.',
  },
  'use-cases/password-policy': {
    title: 'Password Policy - OpenLDAP Docker',
    description: 'Validate OpenLDAP password policy overlay enforcement — minimum length, lockout, history, and expiration.',
  },
  'use-cases/idempotency': {
    title: 'Idempotency Test - OpenLDAP Docker',
    description: 'Validate that OpenLDAP Docker handles restarts gracefully — no errors, no duplicates, full data persistence.',
  },
  'use-cases/initialization-scripts': {
    title: 'Initialization Scripts - OpenLDAP Docker',
    description: 'Automate OpenLDAP setup with initialization scripts. Load sample data, create custom OUs, and configure indexes on first startup.',
  },
  'troubleshooting': {
    title: 'Troubleshooting - OpenLDAP Docker',
    description: 'Common OpenLDAP Docker issues and solutions. Container startup failures, connection problems, TLS errors, replication issues, and database errors.',
  },
};

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugKey = slug.join('/');
  const seo = docSeo[slugKey] || {
    title: 'OpenLDAP Docker Documentation',
    description: 'Documentation for OpenLDAP Docker - Production-ready OpenLDAP container with multi-master replication.',
  };

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `https://vibhuvioio.com/openldap-docker/${slugKey}`,
    },
  };
}

const sidebarGroups = [
  {
    title: 'Getting Started',
    items: [
      { id: 'getting-started', title: 'Quick Start', slug: 'getting-started' },
      { id: 'configuration', title: 'Configuration', slug: 'configuration' },
    ],
  },
  {
    title: 'Deployment',
    items: [
      { id: 'replication', title: 'Multi-Master Replication', slug: 'replication' },
      { id: 'overlays', title: 'Overlays', slug: 'overlays' },
      { id: 'monitoring', title: 'Monitoring', slug: 'monitoring' },
      { id: 'security', title: 'Security', slug: 'security' },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { id: 'keycloak', title: 'Keycloak (SSO)', slug: 'integrations/keycloak' },
      { id: 'keycloak-auth-only', title: 'Keycloak (Auth Only)', slug: 'integrations/keycloak-auth-only' },
      { id: 'sonarqube', title: 'SonarQube', slug: 'integrations/sonarqube' },
      { id: 'jenkins', title: 'Jenkins', slug: 'integrations/jenkins' },
      { id: 'vault', title: 'HashiCorp Vault', slug: 'integrations/vault' },
      { id: 'splunk', title: 'Splunk Enterprise', slug: 'integrations/splunk' },
      { id: 'guacamole', title: 'Apache Guacamole', slug: 'integrations/guacamole' },
      { id: 'redmine', title: 'Redmine', slug: 'integrations/redmine' },
      { id: 'portainer', title: 'Portainer CE', slug: 'integrations/portainer' },
    ],
  },
  {
    title: 'Use Cases',
    items: [
      { id: 'uc-single-node', title: 'Single Node Deployment', slug: 'use-cases/single-node' },
      { id: 'uc-multi-master', title: 'Multi-Master Cluster', slug: 'use-cases/multi-master-cluster' },
      { id: 'uc-docker-secrets', title: 'Docker Secrets', slug: 'use-cases/docker-secrets' },
      { id: 'uc-tls', title: 'TLS/SSL', slug: 'use-cases/tls-ssl' },
      { id: 'uc-overlays', title: 'Overlay Features', slug: 'use-cases/overlay-features' },
      { id: 'uc-password-policy', title: 'Password Policy', slug: 'use-cases/password-policy' },
      { id: 'uc-idempotency', title: 'Idempotency Test', slug: 'use-cases/idempotency' },
      { id: 'uc-init-scripts', title: 'Initialization Scripts', slug: 'use-cases/initialization-scripts' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { id: 'troubleshooting', title: 'Troubleshooting', slug: 'troubleshooting' },
    ],
  },
];

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function OpenLDAPDockerDocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = loadDocContent('openldap-docker', slug);

  if (!doc) {
    notFound();
  }

  const { content, projects } = await processLessonContent(doc.content);
  doc.content = content;

  return (
    <DocsLayout
      sidebar={{ groups: sidebarGroups }}
      basePath="/openldap-docker"
    >
      <div className="mb-8">
        <Link
          href="/openldap-docker"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          &larr; Back to OpenLDAP Docker
        </Link>
      </div>

      <div className="flex gap-8">
        <article className="flex-1 min-w-0 max-w-none">
          {(projects.length > 0 || doc.content.includes('___MULTI_MASTER_ARCHITECTURE___')) ? (
            doc.content
              .split(/(___PROJECT_BLOCK_\d+___|___MULTI_MASTER_ARCHITECTURE___)/)
              .map((segment, i) => {
                if (segment === '___MULTI_MASTER_ARCHITECTURE___') {
                  return <MultiMasterArchitecture key={`mm-arch-${i}`} />;
                }
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
  return [
    { slug: ['getting-started'] },
    { slug: ['configuration'] },
    { slug: ['replication'] },
    { slug: ['overlays'] },
    { slug: ['monitoring'] },
    { slug: ['security'] },
    { slug: ['integrations', 'keycloak'] },
    { slug: ['integrations', 'keycloak-auth-only'] },
    { slug: ['integrations', 'sonarqube'] },
    { slug: ['integrations', 'jenkins'] },
    { slug: ['integrations', 'vault'] },
    { slug: ['integrations', 'splunk'] },
    { slug: ['integrations', 'guacamole'] },
    { slug: ['integrations', 'redmine'] },
    { slug: ['integrations', 'portainer'] },
    { slug: ['use-cases', 'single-node'] },
    { slug: ['use-cases', 'multi-master-cluster'] },
    { slug: ['use-cases', 'docker-secrets'] },
    { slug: ['use-cases', 'tls-ssl'] },
    { slug: ['use-cases', 'overlay-features'] },
    { slug: ['use-cases', 'password-policy'] },
    { slug: ['use-cases', 'idempotency'] },
    { slug: ['use-cases', 'initialization-scripts'] },
    { slug: ['troubleshooting'] },
  ];
}
