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
  tryInBrowserUrl: 'https://labs.play-with-docker.com/?stack=https://raw.githubusercontent.com/VibhuviOiO/docker-registry-ui/main/docker/built-in-trivy/docker-compose.yml',
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
      title: 'Docker Run (3 commands)',
      language: 'bash' as const,
      code: `# 1. Create a network so containers can talk to each other
docker network create registry-net

# 2. Run a Docker registry
docker run -d --name test-registry --network registry-net -p 5001:5000 \\
  -e REGISTRY_STORAGE_DELETE_ENABLED=true \\
  -v registry-data:/var/lib/registry \\
  registry:2

# 3. (Optional) Run a remote Trivy scanner for vulnerability scans
docker run -d --name trivy-server --network registry-net \\
  -v trivy-server-data:/root/.cache/trivy \\
  aquasec/trivy:latest server --listen 0.0.0.0:8080

# 4. Run Docker Registry UI
docker run -d --name registry-ui --network registry-net -p 5000:5000 \\
  -e LOG_LEVEL=INFO \\
  -e 'REGISTRIES=[{"name":"Local Registry","api":"http://test-registry:5000","vulnerabilityScan":{"enabled":true,"scanner":"trivy","scannerUrl":"http://trivy-server:8080"}}]' \\
  -v ui-data:/app/data \\
  vibhuvioio/docker-registry-ui:v2.1.0`,
    },
    {
      title: 'Docker Compose',
      language: 'yaml' as const,
      code: `services:
  registry:
    image: registry:2
    ports:
      - "5001:5000"
    environment:
      REGISTRY_STORAGE_DELETE_ENABLED: "true"
    volumes:
      - registry-data:/var/lib/registry
    networks:
      - registry-net

  trivy-server:
    image: aquasec/trivy:latest
    command: ["server", "--listen", "0.0.0.0:8080"]
    volumes:
      - trivy-server-data:/root/.cache/trivy
    networks:
      - registry-net

  registry-ui:
    image: vibhuvioio/docker-registry-ui:v2.1.0
    ports:
      - "5000:5000"
    environment:
      LOG_LEVEL: INFO
      REGISTRIES: |-
        [
          {
            "name": "Local Registry",
            "api": "http://registry:5000",
            "vulnerabilityScan": {
              "enabled": true,
              "scanner": "trivy",
              "scannerUrl": "http://trivy-server:8080"
            }
          }
        ]
    volumes:
      - ui-data:/app/data
    depends_on:
      - registry
      - trivy-server
    networks:
      - registry-net

volumes:
  registry-data:
  trivy-server-data:
  ui-data:

networks:
  registry-net:
    driver: bridge`,
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
