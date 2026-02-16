import type { Metadata } from "next";
import Link from 'next/link';
import { Github, ArrowRight, Search, Database, Shield, Layers, Activity, Globe, Network } from 'lucide-react';

export const metadata: Metadata = {
  title: "Operations Documentation",
  description: "Production runbooks and operational guides for ELK Stack, MongoDB, LDAP, Cassandra, Keepalived, NGINX, Caddy, and HAProxy.",
  openGraph: {
    title: "Operations Documentation | VibhuviOiO",
    description: "Production runbooks and operational guides for infrastructure technologies.",
    url: "https://vibhuvioio.com/operations",
    type: "website",
  },
  alternates: {
    canonical: "https://vibhuvioio.com/operations",
  },
};

const operations = [
  {
    id: 'elk',
    name: 'ELK Stack',
    icon: Search,
    description: 'End-to-end Elasticsearch, Logstash & Kibana operations. Cluster setup, index management, pipeline configurations, and scaling strategies.',
    docs: '/operations/elk/overview',
    github: 'https://github.com/VibhuviOiO',
    tags: ['Elasticsearch', 'Logstash', 'Kibana', 'Logging'],
    status: 'live' as const,
  },
  {
    id: 'mongo',
    name: 'MongoDB',
    icon: Database,
    description: 'MongoDB deployment, replica sets, sharding, live migration, and disaster recovery. Production-grade cluster management guides.',
    docs: '/operations/mongo/overview',
    github: 'https://github.com/VibhuviOiO',
    tags: ['NoSQL', 'Replication', 'Sharding', 'HA'],
    status: 'live' as const,
  },
  {
    id: 'ldap',
    name: 'LDAP',
    icon: Shield,
    description: 'OpenLDAP operations — directory services, replication, access control, schema management, and integration with applications.',
    tags: ['Directory', 'Authentication', 'SSO'],
    status: 'coming' as const,
  },
  {
    id: 'cassandra',
    name: 'Cassandra',
    icon: Layers,
    description: 'Distributed Cassandra cluster operations. Ring topology, compaction strategies, repair, backup, and multi-datacenter replication.',
    tags: ['NoSQL', 'Distributed', 'Cluster'],
    status: 'coming' as const,
  },
  {
    id: 'keepalived',
    name: 'Keepalived',
    icon: Activity,
    description: 'VRRP-based high availability and failover. Virtual IP management, health checks, and active-passive/active-active configurations.',
    tags: ['HA', 'VRRP', 'Failover'],
    status: 'coming' as const,
  },
  {
    id: 'nginx',
    name: 'NGINX',
    icon: Globe,
    description: 'NGINX operations at scale. Reverse proxy, load balancing, TLS termination, rate limiting, and performance tuning.',
    tags: ['Reverse Proxy', 'Load Balancer', 'TLS'],
    status: 'coming' as const,
  },
  {
    id: 'caddy',
    name: 'Caddy',
    icon: Globe,
    description: 'Caddy server operations with automatic HTTPS. Zero-downtime deployments, Caddyfile patterns, and reverse proxy setups.',
    tags: ['Auto HTTPS', 'Web Server', 'Reverse Proxy'],
    status: 'coming' as const,
  },
  {
    id: 'haproxy',
    name: 'HAProxy',
    icon: Network,
    description: 'HAProxy TCP/HTTP load balancing. Backend pools, health checks, sticky sessions, SSL passthrough, and stats monitoring.',
    tags: ['Load Balancer', 'TCP', 'HTTP'],
    status: 'coming' as const,
  },
];

export default function OperationsPage() {
  const live = operations.filter(op => op.status === 'live');
  const coming = operations.filter(op => op.status === 'coming');

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Operations</h1>
        <p className="mt-2 text-gray-600 max-w-2xl">
          Production runbooks and operational guides for infrastructure technologies.
        </p>

        {/* Live operations */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {live.map((op) => {
            const Icon = op.icon;
            return (
              <div
                key={op.id}
                className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: 'rgba(39,2,166,0.1)' }}
                    >
                      <Icon className="h-5 w-5" style={{ color: '#2702a6' }} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">{op.name}</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{op.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {op.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                  <Link
                    href={op.docs!}
                    className="text-[#2702a6] text-sm font-medium hover:underline flex items-center gap-1"
                  >
                    View Docs <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  {op.github && (
                    <a
                      href={op.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-700 flex items-center gap-1 text-sm"
                    >
                      <Github className="h-3.5 w-3.5" /> GitHub
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming soon */}
        <h2 className="mt-12 text-lg font-semibold text-gray-900">Coming Soon</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coming.map((op) => {
            const Icon = op.icon;
            return (
              <div
                key={op.id}
                className="rounded-xl border border-gray-100 bg-gray-50 p-5"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <Icon className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500">{op.name}</span>
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      Coming Soon
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{op.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
