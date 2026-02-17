import type { Metadata } from 'next';
import ProductPageTemplate, { type ProductPageConfig } from '@/components/ProductPageTemplate';

export const metadata: Metadata = {
  title: 'LDAP Manager - Web Interface for OpenLDAP',
  description: 'Modern web interface for managing OpenLDAP servers. Multi-cluster support, user/group management, real-time monitoring, and custom schema support. Self-hosted and open source.',
  keywords: ['LDAP manager', 'OpenLDAP web interface', 'LDAP user management', 'directory services', 'identity management', 'self-hosted LDAP'],
  openGraph: {
    title: 'LDAP Manager - Web Interface for OpenLDAP',
    description: 'Modern web interface for managing OpenLDAP servers with multi-cluster support and real-time monitoring.',
    url: 'https://vibhuvioio.com/ldap-manager',
    type: 'website',
    images: ['/img/ldap-manager/1ldap-cluster-home.png'],
  },
  alternates: {
    canonical: 'https://vibhuvioio.com/ldap-manager',
  },
};

const config: ProductPageConfig = {
  name: 'LDAP Manager',
  description: 'Modern, lightweight web interface for managing your OpenLDAP servers. Multi-cluster support, real-time monitoring, and custom schema detection.',
  heroImage: '/img/ldap-manager/ldap-manager-ui.png',
  heroScreenshot: { src: '/img/ldap-manager/1ldap-cluster-home.png', alt: 'LDAP Manager - Cluster home' },
  tryInBrowserUrl: 'https://labs.play-with-docker.com/?stack=https://raw.githubusercontent.com/VibhuviOiO/ldap-manager/main/docker-compose.yml',
  docsUrl: '/ldap-manager/getting-started',
  githubUrl: 'https://github.com/VibhuviOiO/ldap-manager',

  badges: ['Production Ready', 'Enterprise Security', 'High Availability', '104 Tests'],

  featuresHeading: 'Everything you need to manage LDAP',
  features: [
    { icon: '🗂️', title: 'Directory Management', desc: 'Browse, search, and manage LDAP entries with an intuitive interface' },
    { icon: '🔗', title: 'Multi-Cluster Support', desc: 'Connect and manage multiple LDAP servers from a single interface' },
    { icon: '📄', title: 'Server-Side Pagination', desc: 'Efficient handling of large directories using LDAP Simple Paged Results (RFC 2696)' },
    { icon: '🔍', title: 'Server-Side Search', desc: 'Fast LDAP filter-based search across uid, cn, mail, and sn attributes' },
    { icon: '🎨', title: 'Custom Schema Support', desc: 'Automatically detects and displays custom objectClasses and attributes' },
    { icon: '📊', title: 'Real-Time Monitoring', desc: 'View cluster health status, connection metrics, and operation statistics' },
  ],

  video: {
    url: '',
    title: 'See LDAP Manager in Action',
    description: 'Watch how LDAP Manager simplifies directory service management with multi-cluster support, real-time monitoring, and custom schema detection.',
    highlights: [
      'Manage users and groups across multiple LDAP clusters',
      'Monitor cluster health and connection metrics in real time',
      'Custom schema auto-detection for any objectClass',
    ],
  },

  screenshots: [
    { src: '/img/ldap-manager/1ldap-cluster-home.png', alt: 'Cluster home dashboard' },
    { src: '/img/ldap-manager/3ldap-users.png', alt: 'User management' },
    { src: '/img/ldap-manager/4ldap-groups.png', alt: 'Group management' },
    { src: '/img/ldap-manager/ldap-monitoring-multi-node.png', alt: 'Multi-node monitoring' },
  ],

  quickStart: [
    {
      title: 'Docker Run',
      language: 'bash' as const,
      code: `docker run -d \\
  -p 5000:5000 \\
  -v $(pwd)/config.yml:/app/config.yml \\
  ghcr.io/vibhuvioio/ldap-manager:latest`,
    },
    {
      title: 'Docker Compose',
      language: 'yaml' as const,
      code: `version: '3.8'
services:
  ldap-manager:
    image: ghcr.io/vibhuvioio/ldap-manager:latest
    ports:
      - "5000:5000"
    volumes:
      - ./config.yml:/app/config.yml`,
    },
  ],

  docs: [
    { href: '/ldap-manager/getting-started', title: 'Getting Started', desc: 'Installation and basic setup guide' },
    { href: '/ldap-manager/configuration', title: 'Configuration', desc: 'Configure LDAP clusters and settings' },
    { href: '/ldap-manager/features', title: 'Features Guide', desc: 'Explore all available features' },
    { href: '/ldap-manager/security', title: 'Security', desc: 'Security best practices and encryption' },
    { href: '/ldap-manager/production', title: 'Production Guide', desc: 'Production deployment and HA setup' },
    { href: '/ldap-manager/development', title: 'Development', desc: 'Contributing and development setup' },
  ],

  ctaDescription: 'Deploy your own LDAP Manager in minutes with our comprehensive documentation and Docker Compose setup.',
};

export default function LDAPManagerPage() {
  return <ProductPageTemplate config={config} />;
}
