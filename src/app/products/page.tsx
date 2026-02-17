import type { Metadata } from "next";
import Link from 'next/link';
import Image from 'next/image';
import { Github, ArrowRight, Package, Code2 } from 'lucide-react';

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

type Product = {
  id: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
  link: string;
  github?: string;
  tags: string[];
  status: 'live' | 'beta' | 'coming';
};

const products: Product[] = [
  {
    id: 'docker-registry-ui',
    title: 'Docker Registry UI',
    description: 'Modern web interface for Docker Registry. Browse, manage, and organize your container images with an intuitive UI.',
    icon: '🐳',
    image: '/img/docker-registry-ui/docker-registry-ui.svg',
    link: '/docker-registry-ui',
    github: 'https://github.com/VibhuviOiO/docker-registry-ui',
    tags: ['Docker', 'Registry', 'Container Management'],
    status: 'live',
  },
  {
    id: 'ldap-manager',
    title: 'LDAP Manager',
    description: 'Simplified LDAP management interface for teams. Manage users, groups, and organizational units through a clean web UI.',
    icon: '🗂️',
    image: '/img/ldap-manager/ldap-manager-ui.png',
    link: '/ldap-manager',
    github: 'https://github.com/VibhuviOiO/ldap-manager',
    tags: ['LDAP', 'Identity', 'SSO', 'User Management'],
    status: 'live',
  },
  {
    id: 'openldap-docker',
    title: 'OpenLDAP Docker',
    description: 'Production-ready OpenLDAP Docker image with sensible defaults, SSL/TLS support, and easy configuration.',
    icon: '📦',
    link: '/products/openldap-docker',
    github: 'https://github.com/VibhuviOiO/openldap-docker',
    tags: ['Docker', 'LDAP', 'Identity', 'SSO'],
    status: 'live',
  },
  {
    id: 'suchaka',
    title: 'Suchaka',
    description: 'Self-hosted status page for your services. Keep users informed about system status, incidents, and maintenance.',
    icon: '📊',
    link: '/products/suchaka',
    github: 'https://github.com/VibhuviOiO/suchaka',
    tags: ['Status Page', 'Monitoring', 'Self-hosted'],
    status: 'live',
  },
  {
    id: 'uptime-o',
    title: 'Uptime O',
    description: 'Modern uptime observability platform with dashboards, multi-region monitoring, and intelligent alerting.',
    icon: '⏱️',
    link: '/products/uptime-o',
    tags: ['Uptime Monitoring', 'Status Pages', 'Alerting'],
    status: 'beta',
  },
  {
    id: 'solrlens',
    title: 'SolrLens',
    description: 'Unified monitoring for Apache Solr clusters. Track query performance, index statistics, and node health.',
    icon: '🔍',
    link: '/products/solrlens',
    tags: ['Solr Monitoring', 'Query Analytics', 'Cluster Health'],
    status: 'coming',
  },
  {
    id: 'infra-mirror',
    title: 'Infra Mirror',
    description: 'End-to-end infrastructure visibility. Know your infrastructure uptime before anyone reports.',
    icon: '📡',
    link: '/products/infra-mirror',
    tags: ['Monitoring', 'Visibility', 'Infrastructure'],
    status: 'coming',
  },
  {
    id: 'container-talks',
    title: 'Container Talks',
    description: 'Short, practical tutorials for containerizing any technology. Quick guides with best practices.',
    icon: '📚',
    link: '/products/container-talks',
    tags: ['Containers', 'Tutorials', 'Docker'],
    status: 'coming',
  },
];

function ProductCard({ product }: { product: Product }) {
  const isLive = product.status === 'live' || product.status === 'beta';
  const Wrapper = isLive ? Link : 'div';
  const wrapperProps = isLive ? { href: product.link } : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={`group flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 ${
        isLive
          ? 'border-gray-200 bg-white hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer'
          : 'border-gray-100 bg-white/60 opacity-70'
      }`}
    >
      {/* Banner */}
      <div
        className="relative h-44 flex items-center justify-center"
        style={{
          background: isLive
            ? 'linear-gradient(135deg, #200289 0%, #2702a6 50%, #3d0fd4 100%)'
            : 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
        }}
      >
        {product.image ? (
          <Image src={product.image} alt="" width={64} height={64} className="opacity-30 select-none" />
        ) : (
          <span className="text-7xl opacity-20 select-none">{product.icon}</span>
        )}
        {/* Product name overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <h3 className="text-xl font-extrabold text-white leading-tight">
            {product.title}
          </h3>
        </div>
        {product.status === 'live' && (
          <div className="absolute top-4 left-5">
            <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
              Live
            </span>
          </div>
        )}
        {product.status === 'beta' && (
          <div className="absolute top-4 left-5">
            <span className="rounded-full bg-amber-400/30 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
              Beta
            </span>
          </div>
        )}
        {product.status === 'coming' && (
          <div className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-500 uppercase">
            Coming Soon
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <p className={`text-sm leading-relaxed ${isLive ? 'text-gray-600' : 'text-gray-400'}`}>
          {product.description}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {product.tags.map((tag) => (
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

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          {product.github && isLive ? (
            <a
              href={product.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
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

export default function ProductsPage() {
  const liveProducts = products.filter(p => p.status === 'live' || p.status === 'beta');
  const comingProducts = products.filter(p => p.status === 'coming');

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #200289 0%, #2702a6 50%, #3d0fd4 100%)' }}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex items-center gap-4 mb-4">
            <Package className="h-10 w-10 text-white/70" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Products</h1>
          </div>
          <p className="text-white/70 max-w-2xl text-lg sm:text-xl leading-relaxed">
            Infrastructure tools built to solve real problems.
            All open source, self-hosted, and production-ready.
          </p>
          <div className="flex items-center gap-5 mt-6">
            <span className="flex items-center gap-2 text-white/50 text-base">
              <Package className="h-5 w-5" />
              {liveProducts.length} products live
            </span>
            <span className="flex items-center gap-2 text-white/50 text-base">
              <Code2 className="h-5 w-5" />
              100% open source
            </span>
          </div>
        </div>
      </div>

      {/* Live Products */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Live Products</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {liveProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="pb-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Coming Soon</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {comingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 lg:py-20 bg-section-alt">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Need Setup Help?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg sm:text-xl text-gray-600 leading-relaxed">
            Each product has comprehensive documentation. Check out our guides
            for deployment, configuration, and best practices.
          </p>
          <div className="mt-8">
            <Link
              href="/docs"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-10 py-4 text-lg font-bold text-white transition-all hover:opacity-90 bg-gradient-primary shadow-primary"
            >
              Browse Documentation
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
