import type { Metadata } from 'next';
import ProductPageTemplate, { type ProductPageConfig } from '@/components/ProductPageTemplate';

export const metadata: Metadata = {
  title: 'OpenLDAP Docker - Production-Ready OpenLDAP Container',
  description: 'Production-grade OpenLDAP Docker image with multi-master replication, TLS/SSL, custom schemas, and enterprise security. AlmaLinux 9 based, non-root execution.',
  keywords: ['OpenLDAP Docker', 'LDAP container', 'multi-master replication', 'directory services', 'identity management', 'self-hosted LDAP'],
  openGraph: {
    title: 'OpenLDAP Docker - Production-Ready OpenLDAP Container',
    description: 'Production-grade OpenLDAP Docker image with multi-master replication and enterprise security.',
    url: 'https://vibhuvioio.com/openldap-docker',
    type: 'website',
  },
  alternates: {
    canonical: 'https://vibhuvioio.com/openldap-docker',
  },
};

const config: ProductPageConfig = {
  name: 'OpenLDAP Docker',
  description: 'Production-grade OpenLDAP server in a container. Multi-master replication, overlays, TLS/SSL, and enterprise security out of the box. Built on AlmaLinux 9.',
  heroIcon: '📦',
  docsUrl: '/openldap-docker/getting-started',
  githubUrl: 'https://github.com/VibhuviOiO/openldap-docker',

  badges: ['Production Ready', 'Multi-Master Replication', 'Enterprise Security', 'AlmaLinux 9'],

  featuresHeading: 'Everything you need for directory services',
  features: [
    { icon: '🔗', title: 'Multi-Master Replication', desc: '3+ node clusters with automatic failover using mirror mode replication' },
    { icon: '🔒', title: 'Enterprise Security', desc: 'Non-root execution (UID 55), TLS/SSL, secure ACLs, and audit logging' },
    { icon: '🧩', title: 'Overlays Ready', desc: 'memberOf, ppolicy, auditlog, and refint overlays via environment variables' },
    { icon: '🎨', title: 'Custom Schemas', desc: 'Auto-load custom objectClasses and attributes from mounted LDIF files' },
    { icon: '📊', title: 'Built-in Monitoring', desc: 'cn=Monitor backend for real-time connection, operation, and health statistics' },
    { icon: '⚡', title: 'High Performance', desc: 'MDB backend, pre-configured indices, query limits, and DoS protection' },
  ],

  video: {
    url: '',
    title: 'See OpenLDAP Docker in Action',
    description: 'Watch how OpenLDAP Docker simplifies directory service deployment with multi-master replication, enterprise security, and integration with tools like Keycloak, Jenkins, and Vault.',
    highlights: [
      'Deploy single-node or multi-master clusters in minutes',
      'Configure overlays and schemas with environment variables',
      'Integrate with Keycloak, Jenkins, SonarQube, Vault, and Splunk',
    ],
  },


  quickStart: [
    {
      title: 'Docker Run',
      language: 'bash' as const,
      code: `docker run -d \\
  --name openldap \\
  -e LDAP_DOMAIN=example.com \\
  -e LDAP_ADMIN_PASSWORD=changeme \\
  -p 389:389 \\
  -v ldap-data:/var/lib/ldap \\
  -v ldap-config:/etc/openldap/slapd.d \\
  ghcr.io/vibhuvioio/openldap:latest`,
    },
    {
      title: 'Docker Compose',
      language: 'yaml' as const,
      code: `version: '3.8'
services:
  openldap:
    image: ghcr.io/vibhuvioio/openldap:latest
    ports:
      - "389:389"
      - "636:636"
    environment:
      - LDAP_DOMAIN=example.com
      - LDAP_ADMIN_PASSWORD=changeme
      - ENABLE_MONITORING=true
    volumes:
      - ldap-data:/var/lib/ldap
      - ldap-config:/etc/openldap/slapd.d
      - ldap-logs:/logs`,
    },
  ],

  docs: [
    { href: '/openldap-docker/getting-started', title: 'Getting Started', desc: 'Quick start guide and installation' },
    { href: '/openldap-docker/configuration', title: 'Configuration', desc: 'Environment variables and settings' },
    { href: '/openldap-docker/replication', title: 'Replication', desc: 'Multi-master cluster setup' },
    { href: '/openldap-docker/overlays', title: 'Overlays', desc: 'memberOf, ppolicy, auditlog overlays' },
    { href: '/openldap-docker/monitoring', title: 'Monitoring', desc: 'cn=Monitor backend and health checks' },
    { href: '/openldap-docker/integrations/keycloak', title: 'Integrations', desc: 'Keycloak, Jenkins, SonarQube, Vault, Splunk' },
  ],

  ctaDescription: 'Deploy production-grade OpenLDAP in minutes with Docker. Multi-master replication, enterprise security, and integrations with your favorite tools.',
};

export default function OpenLDAPDockerPage() {
  return <ProductPageTemplate config={config} />;
}
