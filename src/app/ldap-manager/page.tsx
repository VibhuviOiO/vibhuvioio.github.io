import type { Metadata } from "next";
import Link from 'next/link';
import Image from 'next/image';
import { Github, ExternalLink, BookOpen, Shield, Users, Layers, Search, BarChart3 } from 'lucide-react';

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

const features = [
  { icon: '🗂️', title: 'Directory Management', desc: 'Browse, search, and manage LDAP entries with an intuitive interface' },
  { icon: '🔗', title: 'Multi-Cluster Support', desc: 'Connect and manage multiple LDAP servers from a single interface' },
  { icon: '📄', title: 'Server-Side Pagination', desc: 'Efficient handling of large directories using LDAP Simple Paged Results (RFC 2696)' },
  { icon: '🔍', title: 'Server-Side Search', desc: 'Fast LDAP filter-based search across uid, cn, mail, and sn attributes' },
  { icon: '🎨', title: 'Custom Schema Support', desc: 'Automatically detects and displays custom objectClasses and attributes' },
  { icon: '📊', title: 'Real-Time Monitoring', desc: 'View cluster health status, connection metrics, and operation statistics' },
];

const docs = [
  { href: '/ldap-manager/getting-started', icon: '🚀', title: 'Getting Started', desc: 'Installation and basic setup guide' },
  { href: '/ldap-manager/configuration', icon: '⚙️', title: 'Configuration', desc: 'Configure LDAP clusters and settings' },
  { href: '/ldap-manager/features', icon: '✨', title: 'Features Guide', desc: 'Explore all available features' },
  { href: '/ldap-manager/security', icon: '🛡️', title: 'Security', desc: 'Security best practices and encryption' },
  { href: '/ldap-manager/production', icon: '🏭', title: 'Production Guide', desc: 'Production deployment and HA setup' },
  { href: '/ldap-manager/development', icon: '💻', title: 'Development', desc: 'Contributing and development setup' },
];

export default function LDAPManagerPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="py-16 text-white"
        style={{
          background: 'linear-gradient(135deg, #200289 0%, #2702a6 100%)',
        }}
      >
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="text-6xl mb-4 block">🗂️</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            LDAP Manager
          </h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Modern, lightweight web interface for managing your OpenLDAP servers
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://labs.play-with-docker.com/?stack=https://raw.githubusercontent.com/VibhuviOiO/ldap-manager/main/docker-compose.yml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-gray-900 transition-all hover:opacity-90"
              style={{ background: 'white' }}
            >
              ▶️ Try in PWD
            </a>
            <Link
              href="/ldap-manager/getting-started"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Documentation →
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-green-500 text-xl">✓</span>
              <span className="font-medium">Production Ready</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-green-500 text-xl">✓</span>
              <span className="font-medium">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-green-500 text-xl">✓</span>
              <span className="font-medium">High Availability</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-green-500 text-xl">✓</span>
              <span className="font-medium">104 Tests</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div 
                key={f.title}
                className="rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg hover:border-[#2f02c4]/30 transition-all"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16" style={{ background: '#f8fafc' }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Quick Start
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Docker Run</h3>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs text-gray-700 font-mono">
                  <code>{`docker run -d \\
  -p 5000:5000 \\
  -v $(pwd)/config.yml:/app/config.yml \\
  ghcr.io/vibhuvioio/ldap-manager:latest`}</code>
                </pre>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Docker Compose</h3>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs text-gray-700 font-mono">
                  <code>{`version: '3.8'
services:
  ldap-manager:
    image: ghcr.io/vibhuvioio/ldap-manager:latest
    ports:
      - "5000:5000"
    volumes:
      - ./config.yml:/app/config.yml`}</code>
                </pre>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-600 text-sm">
            Access the UI at <code className="px-2 py-1 bg-gray-100 rounded text-gray-900">http://localhost:5000</code>
          </p>
        </div>
      </section>

      {/* Documentation */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Documentation
          </h2>
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

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div 
            className="rounded-2xl p-8 md:p-12 text-center"
            style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Get Started
            </h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Deploy your own LDAP Manager in minutes with our comprehensive documentation and Docker Compose setup.
            </p>
            <Link
              href="/ldap-manager/getting-started"
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
