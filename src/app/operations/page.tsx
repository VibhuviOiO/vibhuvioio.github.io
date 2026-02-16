import type { Metadata } from "next";
import Link from 'next/link';
import {
  Github, ArrowRight, Search, Database, Shield, Layers,
  Activity, Globe, Network, BookOpen, BarChart2, Clock,
  GraduationCap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: "Learn - Free Infrastructure Courses",
  description: "Free, hands-on courses for production infrastructure — ELK Stack, MongoDB, LDAP, Cassandra, Keepalived, NGINX, Caddy, and HAProxy.",
  openGraph: {
    title: "Learn - Free Infrastructure Courses | VibhuviOiO",
    description: "Free, hands-on courses for production infrastructure.",
    url: "https://vibhuvioio.com/operations",
    type: "website",
  },
  alternates: {
    canonical: "https://vibhuvioio.com/operations",
  },
};

type Operation = {
  id: string;
  name: string;
  icon: typeof Search;
  description: string;
  docs?: string;
  github?: string;
  tags: string[];
  lessons: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  updated: string;
  status: 'live' | 'coming';
};

const operations: Operation[] = [
  {
    id: 'elk',
    name: 'ELK Stack Operations',
    icon: Search,
    description: 'End-to-end Elasticsearch, Logstash & Kibana. From cluster setup to index management, pipeline configs, scaling, and troubleshooting.',
    docs: '/operations/elk/overview',
    github: 'https://github.com/VibhuviOiO',
    tags: ['Elasticsearch', 'Logstash', 'Kibana'],
    lessons: 16,
    duration: '4h 30m',
    level: 'Advanced',
    updated: 'Feb 2026',
    status: 'live',
  },
  {
    id: 'mongo',
    name: 'MongoDB Operations',
    icon: Database,
    description: 'Replica sets, sharding, live migration, and disaster recovery. Production-grade MongoDB cluster management from day one.',
    docs: '/operations/mongo/overview',
    github: 'https://github.com/VibhuviOiO',
    tags: ['NoSQL', 'Replication', 'HA'],
    lessons: 10,
    duration: '3h 15m',
    level: 'Intermediate',
    updated: 'Feb 2026',
    status: 'live',
  },
  {
    id: 'ldap',
    name: 'LDAP Operations',
    icon: Shield,
    description: 'OpenLDAP directory services — replication, access control, schema management, and application integration.',
    tags: ['Directory', 'Authentication', 'SSO'],
    lessons: 8,
    duration: '2h 30m',
    level: 'Intermediate',
    updated: '',
    status: 'coming',
  },
  {
    id: 'cassandra',
    name: 'Cassandra Operations',
    icon: Layers,
    description: 'Distributed cluster ops — ring topology, compaction, repair, backup, and multi-datacenter replication.',
    tags: ['NoSQL', 'Distributed', 'Cluster'],
    lessons: 12,
    duration: '3h 45m',
    level: 'Advanced',
    updated: '',
    status: 'coming',
  },
  {
    id: 'keepalived',
    name: 'Keepalived & HA',
    icon: Activity,
    description: 'VRRP-based high availability. Virtual IP management, health checks, active-passive and active-active setups.',
    tags: ['HA', 'VRRP', 'Failover'],
    lessons: 6,
    duration: '1h 45m',
    level: 'Intermediate',
    updated: '',
    status: 'coming',
  },
  {
    id: 'nginx',
    name: 'NGINX Operations',
    icon: Globe,
    description: 'Reverse proxy, load balancing, TLS termination, rate limiting, caching, and performance tuning at scale.',
    tags: ['Reverse Proxy', 'Load Balancer', 'TLS'],
    lessons: 10,
    duration: '3h',
    level: 'Intermediate',
    updated: '',
    status: 'coming',
  },
  {
    id: 'caddy',
    name: 'Caddy Server',
    icon: Globe,
    description: 'Automatic HTTPS, zero-downtime deploys, Caddyfile patterns, and reverse proxy configurations.',
    tags: ['Auto HTTPS', 'Web Server'],
    lessons: 5,
    duration: '1h 30m',
    level: 'Beginner',
    updated: '',
    status: 'coming',
  },
  {
    id: 'haproxy',
    name: 'HAProxy Operations',
    icon: Network,
    description: 'TCP/HTTP load balancing — backend pools, health checks, sticky sessions, SSL passthrough, and stats.',
    tags: ['Load Balancer', 'TCP', 'HTTP'],
    lessons: 8,
    duration: '2h 30m',
    level: 'Intermediate',
    updated: '',
    status: 'coming',
  },
];

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Beginner: 'bg-green-500/20 text-green-300',
    Intermediate: 'bg-amber-500/20 text-amber-300',
    Advanced: 'bg-red-500/20 text-red-300',
  };
  const colorsLight: Record<string, string> = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-amber-100 text-amber-700',
    Advanced: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${colorsLight[level] || 'bg-gray-100 text-gray-600'}`}>
      {level}
    </span>
  );
}

function CourseCard({ op }: { op: Operation }) {
  const Icon = op.icon;
  const isLive = op.status === 'live';
  const Wrapper = isLive ? Link : 'div';
  const wrapperProps = isLive ? { href: op.docs! } : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={`group flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 ${
        isLive
          ? 'border-gray-200 bg-white hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer'
          : 'border-gray-100 bg-white/60 opacity-70'
      }`}
    >
      {/* Banner — tall, prominent */}
      <div
        className="relative h-52 flex items-center justify-center"
        style={{
          background: isLive
            ? 'linear-gradient(135deg, #200289 0%, #2702a6 50%, #3d0fd4 100%)'
            : 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
        }}
      >
        <Icon className="h-20 w-20 text-white/20" strokeWidth={1} />
        {/* Course name overlay on banner */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <h3 className="text-xl font-extrabold text-white leading-tight">
            {op.name}
          </h3>
        </div>
        {!isLive && (
          <div className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-500 uppercase">
            Coming Soon
          </div>
        )}
        {isLive && (
          <div className="absolute top-4 left-5">
            <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
              Free
            </span>
          </div>
        )}
      </div>

      {/* Body — compact, no description */}
      <div className="p-5 flex flex-col gap-4">
        {/* Meta row */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className={`flex items-center gap-1.5 text-sm ${isLive ? 'text-gray-600' : 'text-gray-300'}`}>
            <BookOpen className="h-4 w-4" />
            <span>{op.lessons} lessons</span>
          </div>
          <div className={`flex items-center gap-1.5 text-sm ${isLive ? 'text-gray-600' : 'text-gray-300'}`}>
            <Clock className="h-4 w-4" />
            <span>{op.duration}</span>
          </div>
        </div>

        {/* Tags + Level */}
        <div className="flex items-center gap-2 flex-wrap">
          <LevelBadge level={op.level} />
          {op.tags.map((tag) => (
            <span
              key={tag}
              className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                isLive ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-300'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Updated + arrow */}
        <div className="flex items-center justify-between">
          {op.updated ? (
            <span className={`text-xs ${isLive ? 'text-gray-400' : 'text-gray-300'}`}>Updated {op.updated}</span>
          ) : (
            <span />
          )}
          {isLive && (
            <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-[#2702a6] group-hover:translate-x-1 transition-all" />
          )}
        </div>
      </div>
    </Wrapper>
  );
}

export default function OperationsPage() {
  const liveCourses = operations.filter(o => o.status === 'live');
  const comingCourses = operations.filter(o => o.status === 'coming');

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #200289 0%, #2702a6 50%, #3d0fd4 100%)' }}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
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

      {/* Live courses */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Courses to get you started</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {liveCourses.map((op) => (
            <CourseCard key={op.id} op={op} />
          ))}
        </div>
      </div>

      {/* Coming soon */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Coming Soon</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {comingCourses.map((op) => (
            <CourseCard key={op.id} op={op} />
          ))}
        </div>
      </div>
    </main>
  );
}
