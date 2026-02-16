import type { Metadata } from "next";
import Link from 'next/link';
import { Github, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: "Open Source Infrastructure Products",
  description: "Explore VibhuviOiO's open source infrastructure tools: Docker Registry UI, LDAP Manager, OpenLDAP Docker, and more. Self-hosted, production-ready DevOps tools.",
  keywords: ["open source products", "infrastructure tools", "docker registry", "LDAP manager", "devops tools", "self-hosted"],
  openGraph: {
    title: "Open Source Infrastructure Products | VibhuviOiO",
    description: "Explore our open source infrastructure tools: Docker Registry UI, LDAP Manager, OpenLDAP Docker, and more.",
    url: "https://vibhuvioio.com/products",
    type: "website",
  },
  alternates: {
    canonical: "https://vibhuvioio.com/products",
  },
};

const liveProducts = [
  {
    title: 'Docker Registry UI',
    description: 'Modern web interface for Docker Registry. Browse, manage, and organize your container images with an intuitive UI. Features tag management, image deletion, and multi-registry support.',
    link: '/docker-registry-ui',
    github: 'https://github.com/VibhuviOiO/docker-registry-ui',
    tags: ['Docker', 'Registry', 'Container Management'],
  },
  {
    title: 'LDAP Manager',
    description: 'Simplified LDAP management interface for teams. Manage users, groups, and organizational units through a clean web UI. No LDAP command line knowledge required.',
    link: '/ldap-manager',
    github: 'https://github.com/VibhuviOiO/ldap-manager',
    tags: ['LDAP', 'Identity', 'SSO', 'User Management'],
  },
  {
    title: 'OpenLDAP Docker',
    description: 'Production-ready OpenLDAP Docker image with sensible defaults, SSL/TLS support, and easy configuration. Includes memberof overlay and custom schema support out of the box.',
    link: '/products/openldap-docker',
    github: 'https://github.com/VibhuviOiO/openldap-docker',
    tags: ['Docker', 'LDAP', 'Identity', 'SSO'],
  },
];

const upcomingProducts = [
  {
    title: 'Uptime O',
    description: 'Modern uptime observability platform with beautiful dashboards, multi-region monitoring, and intelligent alerting. SaaS version coming with additional enterprise features.',
    status: 'Beta',
    link: '/products/uptime-o',
    features: ['Uptime Monitoring', 'Status Pages', 'Alerting', 'SaaS Ready'],
  },
  {
    title: 'SolrLens',
    description: 'Unified monitoring for Apache Solr clusters. Track query performance, index statistics, and node health across all your Solr instances in one place.',
    status: 'Coming Soon',
    link: '/products/solrlens',
    features: ['Solr Monitoring', 'Query Analytics', 'Cluster Health', 'Alerts'],
  },
  {
    title: 'Suchaka',
    description: 'Self-hosted status page for your services. Keep your users informed about system status, incidents, and maintenance windows. Simple to deploy and customize.',
    status: 'Live',
    link: '/products/suchaka',
    github: 'https://github.com/VibhuviOiO/suchaka',
    tags: ['Status Page', 'Monitoring', 'Self-hosted'],
  },
];

const futureProducts = [
  {
    title: 'Infra Mirror',
    description: 'End-to-end infrastructure visibility. Know your infrastructure uptime before anyone reports. Comprehensive monitoring for your entire stack.',
    status: 'Coming Soon',
    link: '/products/infra-mirror',
  },
  {
    title: 'Container Talks',
    description: 'Short, practical tutorials for containerizing any technology. Quick guides to get your applications running in containers with best practices.',
    status: 'Coming Soon',
    link: '/products/container-talks',
  },
];

function StatusBadge({ status }: { status: string }) {
  const isLive = status === 'Live';
  const isBeta = status === 'Beta';
  
  return (
    <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
      isLive ? 'bg-green-500 text-white' : 
      isBeta ? 'bg-amber-500 text-white' : 
      'bg-gray-500 text-white'
    }`}>
      {status}
    </span>
  );
}

function LiveProductCard({ title, description, link, github, tags }: {
  title: string;
  description: string;
  link: string;
  github?: string;
  tags: string[];
}) {
  return (
    <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 border-b border-gray-100 flex justify-end">
        <StatusBadge status="Live" />
      </div>
      <div className="p-6 flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-gray-100 flex justify-between items-center">
        <Link href={link} className="text-[#2702a6] font-medium hover:underline flex items-center gap-1">
          View Product <ArrowRight className="h-4 w-4" />
        </Link>
        {github && (
          <a href={github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 flex items-center gap-1">
            <Github className="h-4 w-4" /> GitHub
          </a>
        )}
      </div>
    </div>
  );
}

function UpcomingProductCard({ title, description, status, link, features, tags, github }: {
  title: string;
  description: string;
  status: string;
  link: string;
  features?: string[];
  tags?: string[];
  github?: string;
}) {
  const isLive = status === 'Live';
  
  return (
    <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 border-b border-gray-100 flex justify-end">
        <StatusBadge status={status} />
      </div>
      <div className="p-6 flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        {features && (
          <div className="flex flex-wrap gap-2">
            {features.map((feature, idx) => (
              <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                {feature}
              </span>
            ))}
          </div>
        )}
        {tags && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-100 flex justify-between items-center">
        <Link href={link} className="text-[#2702a6] font-medium hover:underline flex items-center gap-1">
          Learn More <ArrowRight className="h-4 w-4" />
        </Link>
        {(isLive || status === 'Beta') && github && (
          <a href={github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 flex items-center gap-1">
            <Github className="h-4 w-4" /> GitHub
          </a>
        )}
      </div>
    </div>
  );
}

function FutureProductCard({ title, description, status, link }: {
  title: string;
  description: string;
  status: string;
  link: string;
}) {
  return (
    <Link href={link} className="block">
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:border-[#2702a6]/30 hover:shadow-md transition-all">
        <div className="mb-4">
          <StatusBadge status={status} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  );
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="py-16 text-white" style={{ background: 'linear-gradient(135deg, #200289 0%, #2702a6 100%)' }}>
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Open Source Products
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Infrastructure tools I built to solve real problems. 
            All open source, self-hosted, and production-ready.
          </p>
        </div>
      </section>

      {/* Live Products */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full mb-4">
              Available Now
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Live Products</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveProducts.map((props, idx) => (
              <LiveProductCard key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Products */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full mb-4">
              In Development
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Products</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingProducts.map((props, idx) => (
              <UpcomingProductCard key={idx} {...props} link={props.link} />
            ))}
          </div>
        </div>
      </section>

      {/* Future Products */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full mb-4">
              Roadmap
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Future Ideas</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {futureProducts.map((props, idx) => (
              <FutureProductCard key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 md:p-12 text-center border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Setup Help?</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Each product has comprehensive documentation. Check out our guides 
              for deployment, configuration, and best practices.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 text-base font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #2702a6 0%, #200289 100%)' }}
            >
              Browse Documentation
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
