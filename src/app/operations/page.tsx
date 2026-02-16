import Link from 'next/link';
import { loadOperationsSidebarClient } from '@/lib/docs-client';
import { Search, Database, BarChart3 } from 'lucide-react';

export default function OperationsPage() {
  const { categories } = loadOperationsSidebarClient();

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium mb-4" style={{ backgroundColor: 'rgba(39, 2, 166, 0.1)', color: '#2702a6' }}>
            End-to-End Operations
          </span>
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Operations Documentation
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Deep operational guides for production systems. When you need comprehensive 
            maintenance, scaling, and troubleshooting knowledge.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="rounded-xl border border-gray-200 bg-white p-6 hover:border-[#2702a6] hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{category.icon}</span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{category.title}</h2>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {category.sidebar.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      {group.title}
                    </h3>
                    <div className="space-y-1">
                      {group.items.slice(0, 4).map((item) => (
                        <Link
                          key={item.id}
                          href={`/operations/${item.slug}`}
                          className="block rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          {item.title}
                        </Link>
                      ))}
                      {group.items.length > 4 && (
                        <span className="block px-3 py-1.5 text-xs text-gray-400">
                          +{group.items.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link 
                  href={`/operations/${category.slug}`}
                  className="text-sm font-medium"
                  style={{ color: '#2702a6' }}
                >
                  View all {category.title} docs →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg mb-4" style={{ backgroundColor: 'rgba(39, 2, 166, 0.1)' }}>
              <Search className="h-6 w-6" style={{ color: '#2702a6' }} />
            </div>
            <h3 className="font-semibold text-gray-900">Deep Search</h3>
            <p className="mt-2 text-sm text-gray-600">Comprehensive guides for every operation</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg mb-4" style={{ backgroundColor: 'rgba(39, 2, 166, 0.1)' }}>
              <Database className="h-6 w-6" style={{ color: '#2702a6' }} />
            </div>
            <h3 className="font-semibold text-gray-900">Production Ready</h3>
            <p className="mt-2 text-sm text-gray-600">Battle-tested in real environments</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg mb-4" style={{ backgroundColor: 'rgba(39, 2, 166, 0.1)' }}>
              <BarChart3 className="h-6 w-6" style={{ color: '#2702a6' }} />
            </div>
            <h3 className="font-semibold text-gray-900">Monitoring</h3>
            <p className="mt-2 text-sm text-gray-600">Observability built-in</p>
          </div>
        </div>
      </div>
    </main>
  );
}
