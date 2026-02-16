import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docker Registry UI - Web Interface for Docker Registry',
  description: 'Modern web interface for managing Docker Registry. Browse images, vulnerability scanning with Trivy, bulk operations, and multi-registry support. Self-hosted and open source.',
  keywords: ['docker registry ui', 'docker registry web interface', 'container management', 'trivy scanning', 'docker images', 'self-hosted registry'],
  openGraph: {
    title: 'Docker Registry UI - Web Interface for Docker Registry',
    description: 'Modern web interface for managing Docker Registry with vulnerability scanning and multi-registry support.',
    url: 'https://vibhuvioio.com/docker-registry-ui',
    type: 'website',
    images: ['/img/docker-registry-ui.png'],
  },
  alternates: {
    canonical: 'https://vibhuvioio.com/docker-registry-ui',
  },
};

const features = [
  { icon: '📦', title: 'Repository Management', desc: 'Browse, search, and manage Docker images and tags with an intuitive interface' },
  { icon: '🔒', title: 'Read/Write Modes', desc: 'Toggle between read-only and read-write modes for safe registry operations' },
  { icon: '🗑️', title: 'Bulk Operations', desc: 'Delete multiple images based on patterns, age, and retention policies' },
  { icon: '🛡️', title: 'Vulnerability Scanning', desc: 'Built-in Trivy integration for scanning images and viewing CVE details' },
  { icon: '🔗', title: 'Multi-Registry Support', desc: 'Connect and manage multiple Docker registries from a single interface' },
  { icon: '📊', title: 'Analytics & Insights', desc: 'View storage usage, image statistics, and layer information' },
];

const docs = [
  { href: '/docker-registry-ui/getting-started', icon: '🚀', title: 'Getting Started', desc: 'Installation and basic setup guide' },
  { href: '/docker-registry-ui/configuration', icon: '⚙️', title: 'Configuration', desc: 'Configure registries and settings' },
  { href: '/docker-registry-ui/features', icon: '✨', title: 'Features Guide', desc: 'Explore all available features' },
  { href: '/docker-registry-ui/api', icon: '🔌', title: 'API Reference', desc: 'Docker Registry API integration' },
  { href: '/docker-registry-ui/security', icon: '🛡️', title: 'Security Scanning', desc: 'Vulnerability scanning with Trivy' },
  { href: '/docker-registry-ui/testing', icon: '🧪', title: 'Testing Guide', desc: 'Full feature testing with multi-registry' },
  { href: '/docker-registry-ui/development', icon: '💻', title: 'Development', desc: 'Contributing and development setup' },
];

export default function DockerRegistryUIPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header 
        className="py-16 text-white"
        style={{ 
          background: 'linear-gradient(135deg, #200289 0%, #2702a6 100%)',
        }}
      >
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="text-6xl mb-4 block">🐳</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Docker Registry UI
          </h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Modern, lightweight web interface for managing your Docker Registry
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a 
              href="https://labs.play-with-docker.com/?stack=https://raw.githubusercontent.com/VibhuviOiO/docker-registry-ui/main/docker/pwd/docker-compose.yml"
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-gray-900 transition-all hover:opacity-90"
              style={{ background: 'white' }}
            >
              ▶️ Try in PWD
            </a>
            <Link 
              href="/docker-registry-ui/getting-started"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Documentation →
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg hover:border-[#2f02c4]/30 transition-all group"
              >
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#2f02c4]">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-16" style={{ background: '#f8fafc' }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Quick Start</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Docker Run */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Docker Run</h3>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs text-gray-700 font-mono">
                  <code>{`docker run -d \\
  -p 5000:5000 \\
  -e CONFIG_FILE=/app/data/registries.config.json \\
  -e READ_ONLY=false \\
  -v ./data:/app/data \\
  ghcr.io/vibhuvioio/docker-registry-ui:latest`}</code>
                </pre>
              </div>
            </div>

            {/* Docker Compose */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Docker Compose</h3>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs text-gray-700 font-mono">
                  <code>{`version: '3.8'
services:
  registry-ui:
    image: ghcr.io/vibhuvioio/docker-registry-ui:latest
    ports:
      - "5000:5000"
    environment:
      - CONFIG_FILE=/app/data/registries.config.json
      - READ_ONLY=false
    volumes:
      - ./data:/app/data`}</code>
                </pre>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600 text-sm">
            Access the UI at <code className="px-2 py-1 bg-gray-100 rounded text-gray-900">http://localhost:5000</code>
          </p>
        </div>
      </section>

      {/* Documentation Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Documentation</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="group rounded-xl border border-gray-200 p-5 hover:border-[#2f02c4]/30 hover:shadow-md transition-all"
              >
                <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2 group-hover:text-[#2f02c4]">
                  <span>{doc.icon}</span>
                  {doc.title}
                </h3>
                <p className="text-sm text-gray-600">{doc.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div 
            className="rounded-2xl p-8 md:p-12 text-center"
            style={{ 
              background: '#f8fafc',
              border: '1px solid #e5e7eb',
            }}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Get Started</h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Deploy your own Docker Registry UI in minutes with our 
              comprehensive documentation and Docker Compose setup.
            </p>
            <Link
              href="/docker-registry-ui/getting-started"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 text-base font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)',
                boxShadow: '0 4px 14px rgba(80, 32, 232, 0.3)',
              }}
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
