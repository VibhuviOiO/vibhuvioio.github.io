import type { Metadata } from 'next';
import ProductPageTemplate, { type ProductPageConfig } from '@/components/ProductPageTemplate';

export const metadata: Metadata = {
  title: 'UptimeO - Self-Hosted Uptime Observability Platform',
  description: 'UptimeO is a self-hosted uptime observability platform with distributed Go agents, public and private status pages, multi-region monitoring, response-time analytics, and Prometheus integration.',
  keywords: ['uptime monitoring', 'status page', 'synthetic monitoring', 'distributed agents', 'observability', 'self-hosted'],
  openGraph: {
    title: 'UptimeO - Self-Hosted Uptime Observability Platform',
    description: 'Distributed agents, status pages, and analytics for your services.',
    url: 'https://vibhuvioio.com/products/uptime-o',
    type: 'website',
  },
  alternates: {
    canonical: 'https://vibhuvioio.com/products/uptime-o',
  },
};

const config: ProductPageConfig = {
  name: 'UptimeO',
  description: 'Self-hosted uptime observability platform with distributed Go agents, public & private status pages, and response-time analytics. Run it on your own infrastructure with Docker.',
  heroIcon: '⏱️',
  heroScreenshot: { src: '/img/uptime-o/overview-02-dashboard.png', alt: 'UptimeO dashboard overview' },
  docsUrl: '/products/uptime-o/docs/getting-started',
  githubUrl: 'https://github.com/VibhuviOiO/UptimeO',

  badges: ['Self-Hosted', 'Distributed Agents', 'Status Pages', 'Prometheus Ready'],

  featuresHeading: 'Everything you need to watch your services',
  features: [
    { icon: '🌍', title: 'Multi-Region Monitoring', desc: 'Group monitors by region and datacenter to see geographic health at a glance.' },
    { icon: '🤖', title: 'Distributed Go Agents', desc: 'Lightweight agents pull monitor assignments from the API and report heartbeats with persistent queues.' },
    { icon: '📊', title: 'Response-Time Analytics', desc: 'Track availability, latency trends, and status history from one analytics dashboard.' },
    { icon: '📢', title: 'Public & Private Status Pages', desc: 'Share real-time status with customers or keep it internal with private page links.' },
    { icon: '📜', title: 'Audit Log & Retention', desc: 'Review every change and configure automatic cleanup of old heartbeat partitions.' },
    { icon: '🔥', title: 'Prometheus Integration', desc: 'Ingest Prometheus and Blackbox exporter metrics alongside agent heartbeats.' },
  ],

  screenshots: [
    { src: '/img/uptime-o/overview-02-dashboard.png', alt: 'UptimeO dashboard overview' },
    { src: '/img/uptime-o/monitors-01-list.png', alt: 'HTTP monitors list' },
    { src: '/img/uptime-o/analytics-01-overview.png', alt: 'Uptime analytics dashboard' },
    { src: '/img/uptime-o/status-pages-02-public-preview.png', alt: 'Public status page preview' },
  ],

  quickStart: [
    {
      title: 'Clone & run with Docker Compose',
      language: 'bash' as const,
      code: `git clone https://github.com/VibhuviOiO/UptimeO.git
cd UptimeO

# Create a minimal environment file
cat > .env <<EOF
SPRING_PROFILES_ACTIVE=prod
SPRING_LIQUIBASE_ENABLED=true
EOF

# Start PostgreSQL, backend, status page, and agent
docker compose -f docker/docker-compose-ghcr.yml up -d

# Watch the backend start
docker compose -f docker/docker-compose-ghcr.yml logs -f uptimeo-app`,
    },
    {
      title: 'Agent environment variables',
      language: 'bash' as const,
      code: `# Required for managed agents
export API_BASE_URL="http://localhost:8080"
export API_KEY="uptimeo_YOUR_API_KEY"
export AGENT_ID=1

# Optional overrides
export HEALTH_PORT=9090
export CONFIG_RELOAD_INTERVAL=1m
export QUEUE_PATH="./data/queue"`,
    },
  ],

  docs: [
    { href: '/products/uptime-o/docs/getting-started', title: 'Getting Started', desc: 'Overview of UptimeO and how to sign in for the first time.' },
    { href: '/products/uptime-o/docs/installation', title: 'Installation', desc: 'Deploy UptimeO with Docker Compose and required environment variables.' },
    { href: '/products/uptime-o/docs/first-agent', title: 'First Agent', desc: 'Create an agent in the UI and connect a Go monitoring agent.' },
    { href: '/products/uptime-o/docs/http-monitors', title: 'HTTP Monitors', desc: 'Configure monitors, schedules, and monitor-to-agent assignments.' },
    { href: '/products/uptime-o/docs/status-pages', title: 'Status Pages', desc: 'Build public or private status pages from your monitors.' },
    { href: '/products/uptime-o/docs/uptime-analytics', title: 'Uptime Analytics', desc: 'Explore availability, latency, and status history.' },
    { href: '/products/uptime-o/docs/prometheus-integration', title: 'Prometheus Integration', desc: 'Ingest Prometheus/Blackbox metrics into UptimeO.' },
  ],

  ctaDescription: 'Deploy UptimeO on your own infrastructure and start monitoring your services in minutes.',
};

export default function UptimeOPage() {
  return <ProductPageTemplate config={config} />;
}
