import type { Metadata } from "next";
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadDocContent } from '@/lib/docs-server';
import DocsLayout from '@/components/layout/DocsLayout';
import DocContent from '@/components/docs/DocContent';
import TableOfContents from '@/components/docs/TableOfContents';

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
  ];
}
