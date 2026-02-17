import { Metadata } from 'next';
import ProductPageTemplate, { type ProductPageConfig } from '@/components/ProductPageTemplate';

export const metadata: Metadata = {
  title: 'Docker Registry UI - Web Interface for Docker Registry',
  description: 'Modern web interface for managing Docker Registry. Browse images, vulnerability scanning with Trivy, bulk operations, and multi-registry support. Self-hosted and open source.',
  keywords: ['docker registry ui', 'docker registry web interface', 'container management', 'trivy scanning', 'docker images', 'self-hosted registry'],
  openGraph: {
    title: 'Docker Registry UI - Web Interface for Docker Registry',
    description: 'Modern web interface for managing Docker Registry with vulnerability scanning and multi-registry support.',
    url: 'https://vibhuvioio.com/docker-registry-ui',
    type: 'website',
    images: ['/img/docker-registry-ui/docker-registry-ui.png'],
  },
  alternates: {
    canonical: 'https://vibhuvioio.com/docker-registry-ui',
  },
};

const config: ProductPageConfig = {
  name: 'Docker Registry UI',
  description: 'Modern, lightweight web interface for managing your Docker Registry. Browse images, scan vulnerabilities, and manage multiple registries.',
  heroImage: '/img/docker-registry-ui/docker-registry-ui.svg',
  heroScreenshot: { src: '/img/docker-registry-ui/repositories.png', alt: 'Docker Registry UI - Repository browser' },
  tryInBrowserUrl: 'https://labs.play-with-docker.com/?stack=https://raw.githubusercontent.com/VibhuviOiO/docker-registry-ui/main/docker/pwd/docker-compose.yml',
  docsUrl: '/docker-registry-ui/getting-started',
  githubUrl: 'https://github.com/VibhuviOiO/docker-registry-ui',

  badges: ['Production Ready', 'Trivy Security Scanning', 'Multi-Registry Support', 'Self-Hosted'],

  featuresHeading: 'Everything you need to manage registries',
  features: [
    { icon: '📦', title: 'Repository Management', desc: 'Browse, search, and manage Docker images and tags with an intuitive interface' },
    { icon: '🔒', title: 'Read/Write Modes', desc: 'Toggle between read-only and read-write modes for safe registry operations' },
    { icon: '🗑️', title: 'Bulk Operations', desc: 'Delete multiple images based on patterns, age, and retention policies' },
    { icon: '🛡️', title: 'Vulnerability Scanning', desc: 'Built-in Trivy integration for scanning images and viewing CVE details' },
    { icon: '🔗', title: 'Multi-Registry Support', desc: 'Connect and manage multiple Docker registries from a single interface' },
    { icon: '📊', title: 'Analytics & Insights', desc: 'View storage usage, image statistics, and layer information' },
  ],

  video: {
    url: '',
    title: 'See Docker Registry UI in Action',
    description: 'Watch how Docker Registry UI simplifies container image management with an intuitive web interface, built-in vulnerability scanning, and multi-registry support.',
    highlights: [
      'Browse and manage images across multiple registries',
      'Scan for vulnerabilities with integrated Trivy',
      'Bulk delete with retention policies',
    ],
  },

  screenshots: [
    { src: '/img/docker-registry-ui/repositories.png', alt: 'Repository browser' },
    { src: '/img/docker-registry-ui/cves.png', alt: 'Vulnerability scanning' },
    { src: '/img/docker-registry-ui/bulk-operations.png', alt: 'Bulk operations' },
    { src: '/img/docker-registry-ui/analytics-understand-disk-usage.png', alt: 'Analytics dashboard' },
  ],

  quickStart: [
    {
      title: 'Docker Run',
      language: 'bash' as const,
      code: `docker run -d \\
  -p 5000:5000 \\
  -e CONFIG_FILE=/app/data/registries.config.json \\
  -e READ_ONLY=false \\
  -v ./data:/app/data \\
  ghcr.io/vibhuvioio/docker-registry-ui:latest`,
    },
    {
      title: 'Docker Compose',
      language: 'yaml' as const,
      code: `version: '3.8'
services:
  registry-ui:
    image: ghcr.io/vibhuvioio/docker-registry-ui:latest
    ports:
      - "5000:5000"
    environment:
      - CONFIG_FILE=/app/data/registries.config.json
      - READ_ONLY=false
    volumes:
      - ./data:/app/data`,
    },
  ],

  docs: [
    { href: '/docker-registry-ui/getting-started', title: 'Getting Started', desc: 'Installation and basic setup guide' },
    { href: '/docker-registry-ui/configuration', title: 'Configuration', desc: 'Configure registries and settings' },
    { href: '/docker-registry-ui/features', title: 'Features Guide', desc: 'Explore all available features' },
    { href: '/docker-registry-ui/api', title: 'API Reference', desc: 'Docker Registry API integration' },
    { href: '/docker-registry-ui/security', title: 'Security Scanning', desc: 'Vulnerability scanning with Trivy' },
    { href: '/docker-registry-ui/testing', title: 'Testing Guide', desc: 'Full feature testing with multi-registry' },
    { href: '/docker-registry-ui/development', title: 'Development', desc: 'Contributing and development setup' },
  ],

  ctaDescription: 'Deploy your own Docker Registry UI in minutes with our comprehensive documentation and Docker Compose setup.',
};

export default function DockerRegistryUIPage() {
  return <ProductPageTemplate config={config} />;
}
