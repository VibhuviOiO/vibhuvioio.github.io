import Link from 'next/link';
import { loadGeneralSidebarClient } from '@/lib/docs-client';
import { Server, Database, Globe, Layers } from 'lucide-react';

export default function DocsPage() {
  const sidebar = loadGeneralSidebarClient();
  
  const icons: Record<string, any> = {
    'Web Servers': Globe,
    'Databases': Database,
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Documentation
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            General how-to guides for technologies. Quick starts, container deployments, 
            and common configurations.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {sidebar.groups.map((group) => {
            const Icon = icons[group.title] || Layers;
            return (
              <div 
                key={group.title}
                className="rounded-xl border border-gray-200 bg-white p-6 hover:border-gray-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(47, 2, 196, 0.1)' }}>
                    <Icon className="h-5 w-5" style={{ color: '#2f02c4' }} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{group.title}</h2>
                </div>
                
                <div className="mt-6 space-y-4">
                  {group.items.map((item) => (
                    <div key={item.id}>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                        {item.title}
                      </h3>
                      <div className="space-y-1">
                        {item.items?.map((subItem) => (
                          <Link
                            key={subItem.id}
                            href={`/docs/${subItem.slug}`}
                            className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="mt-16 rounded-xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Popular Guides
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/docs/nginx/container" className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-[#2f02c4] hover:shadow-md transition-all">
              <span className="text-2xl">🌐</span>
              <div>
                <div className="font-medium text-gray-900 group-hover:text-[#2f02c4]">NGINX Container</div>
                <div className="text-xs text-gray-500">Run NGINX as container</div>
              </div>
            </Link>
            <Link href="/docs/mysql/container" className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-all">
              <span className="text-2xl">🐬</span>
              <div>
                <div className="font-medium text-gray-900 group-hover:text-[#2f02c4]">MySQL Container</div>
                <div className="text-xs text-gray-500">Deploy MySQL as container</div>
              </div>
            </Link>
            <Link href="/docs/cassandra/cluster" className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-all">
              <span className="text-2xl">🟣</span>
              <div>
                <div className="font-medium text-gray-900 group-hover:text-[#2f02c4]">Cassandra Cluster</div>
                <div className="text-xs text-gray-500">Multi-node cluster setup</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
