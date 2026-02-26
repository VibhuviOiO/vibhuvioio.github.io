import type { Metadata } from "next";
import { BookOpen, Clock, GraduationCap } from 'lucide-react';
import CourseGrid from '@/components/CourseGrid';

export const metadata: Metadata = {
  title: "Learn - Free Infrastructure Courses",
  description: "Free, hands-on courses for production infrastructure — ELK Stack, MongoDB, LDAP, Cassandra, Keepalived, NGINX, Caddy, and HAProxy.",
  openGraph: {
    title: "Learn - Free Infrastructure Courses | VibhuviOiO",
    description: "Free, hands-on courses for production infrastructure.",
    url: "https://vibhuvioio.com/learn",
    type: "website",
  },
  alternates: {
    canonical: "https://vibhuvioio.com/learn",
  },
};

const operations = [
  {
    id: 'elk',
    name: 'ELK Stack Operations',
    iconName: 'Search',
    description: 'End-to-end Elasticsearch, Logstash & Kibana. From cluster setup to index management, pipeline configs, scaling, and troubleshooting.',
    docs: '/learn/elk/overview',
    github: 'https://github.com/VibhuviOiO',
    tags: ['Elasticsearch', 'Logstash', 'Kibana'],
    lessons: 16,
    duration: '4h 30m',
    level: 'Advanced' as const,
    updated: 'Feb 2026',
    status: 'live' as const,
  },
  {
    id: 'mongo',
    name: 'MongoDB Operations',
    iconName: 'Database',
    description: 'Replica sets, sharding, live migration, and disaster recovery. Production-grade MongoDB cluster management from day one.',
    docs: '/learn/mongo/overview',
    github: 'https://github.com/VibhuviOiO',
    tags: ['NoSQL', 'Replication', 'HA'],
    lessons: 10,
    duration: '3h 15m',
    level: 'Intermediate' as const,
    updated: 'Feb 2026',
    status: 'live' as const,
  },
  {
    id: 'milvus',
    name: 'Milvus Operations',
    iconName: 'Layers',
    description: 'Vector database operations — from local development with Milvus Lite to billion-scale distributed clusters on Kubernetes. Index tuning, performance optimization, and production management.',
    docs: '/learn/milvus/overview',
    github: 'https://github.com/VibhuviOiO/milvus-ops',
    tags: ['Vector DB', 'AI/ML', 'Kubernetes'],
    lessons: 15,
    duration: '6h 30m',
    level: 'Advanced' as const,
    updated: 'Feb 2026',
    status: 'live' as const,
  },
  {
    id: 'pinecone',
    name: 'Pinecone Operations',
    iconName: 'TreePine',
    description: 'Fully managed vector database — learn Pinecone cloud deployment, cost optimization strategies, pods vs serverless, and production best practices for AI applications.',
    docs: '/learn/pinecone/overview',
    github: 'https://github.com/VibhuviOiO/pinecone-ops',
    tags: ['Vector DB', 'AI/ML', 'Cloud'],
    lessons: 14,
    duration: '6h',
    level: 'Intermediate' as const,
    updated: 'Feb 2026',
    status: 'live' as const,
  },
  {
    id: 'qdrant',
    name: 'Qdrant Operations',
    iconName: 'Target',
    description: 'Open-source vector database in Rust — deploy with Docker and Kubernetes, configure for performance, implement clustering, and manage production workloads.',
    docs: '/learn/qdrant/overview',
    github: 'https://github.com/VibhuviOiO/qdrant-ops',
    tags: ['Vector DB', 'AI/ML', 'Rust'],
    lessons: 16,
    duration: '8h',
    level: 'Advanced' as const,
    updated: 'Feb 2026',
    status: 'live' as const,
  },
  {
    id: 'ldap',
    name: 'LDAP Operations',
    iconName: 'Shield',
    description: 'OpenLDAP directory services — replication, access control, schema management, and application integration.',
    tags: ['Directory', 'Authentication', 'SSO'],
    lessons: 8,
    duration: '2h 30m',
    level: 'Intermediate' as const,
    updated: '',
    status: 'coming' as const,
  },
  {
    id: 'cassandra',
    name: 'Cassandra Operations',
    iconName: 'Layers',
    description: 'Distributed cluster ops — ring topology, compaction, repair, backup, and multi-datacenter replication.',
    tags: ['NoSQL', 'Distributed', 'Cluster'],
    lessons: 12,
    duration: '3h 45m',
    level: 'Advanced' as const,
    updated: '',
    status: 'coming' as const,
  },
  {
    id: 'keepalived',
    name: 'Keepalived & HA',
    iconName: 'Activity',
    description: 'VRRP-based high availability. Virtual IP management, health checks, active-passive and active-active setups.',
    tags: ['HA', 'VRRP', 'Failover'],
    lessons: 6,
    duration: '1h 45m',
    level: 'Intermediate' as const,
    updated: '',
    status: 'coming' as const,
  },
  {
    id: 'nginx',
    name: 'NGINX Operations',
    iconName: 'Globe',
    description: 'Reverse proxy, load balancing, TLS termination, rate limiting, caching, and performance tuning at scale.',
    tags: ['Reverse Proxy', 'Load Balancer', 'TLS'],
    lessons: 10,
    duration: '3h',
    level: 'Intermediate' as const,
    updated: '',
    status: 'coming' as const,
  },
  {
    id: 'caddy',
    name: 'Caddy Server',
    iconName: 'Globe',
    description: 'Automatic HTTPS, zero-downtime deploys, Caddyfile patterns, and reverse proxy configurations.',
    tags: ['Auto HTTPS', 'Web Server'],
    lessons: 5,
    duration: '1h 30m',
    level: 'Beginner' as const,
    updated: '',
    status: 'coming' as const,
  },
  {
    id: 'haproxy',
    name: 'HAProxy Operations',
    iconName: 'Network',
    description: 'TCP/HTTP load balancing — backend pools, health checks, sticky sessions, SSL passthrough, and stats.',
    tags: ['Load Balancer', 'TCP', 'HTTP'],
    lessons: 8,
    duration: '2h 30m',
    level: 'Intermediate' as const,
    updated: '',
    status: 'coming' as const,
  },
];

export default function OperationsPage() {
  const liveCourses = operations.filter(o => o.status === 'live');
  const comingCourses = operations.filter(o => o.status === 'coming');

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #200289 0%, #2702a6 50%, #3d0fd4 100%)' }}>
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex items-center gap-4 mb-4">
            <GraduationCap className="h-10 w-10 text-white/70" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Learn</h1>
          </div>
          <p className="text-white/70 max-w-2xl text-lg sm:text-xl leading-relaxed">
            Free, hands-on courses for production infrastructure. Deploy, scale,
            monitor, and troubleshoot real systems — from engineers who run them.
          </p>
          <div className="flex items-center gap-5 mt-6">
            <span className="flex items-center gap-2 text-white/50 text-base">
              <BookOpen className="h-5 w-5" />
              {liveCourses.length} courses live
            </span>
            <span className="flex items-center gap-2 text-white/50 text-base">
              <Clock className="h-5 w-5" />
              {comingCourses.length} coming soon
            </span>
          </div>
        </div>
      </div>

      <CourseGrid
        liveCourses={liveCourses}
        comingCourses={comingCourses}
      />
    </main>
  );
}
