import Link from 'next/link';
import { loadProductsClient } from '@/lib/docs-client';
import { ExternalLink, Github, Play } from 'lucide-react';

export default function ProductsPage() {
  const products = loadProductsClient();

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Our Products
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Open source tools built for production. Self-hosted, battle-tested, 
            and ready to deploy.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {products.map((product) => (
            <div 
              key={product.id}
              className="group relative rounded-xl border border-gray-200 bg-white p-6 hover:border-[#2f02c4] hover:shadow-lg transition-all"
            >
              {/* Status Badge */}
              {product.status === 'coming-soon' && (
                <span className="absolute top-4 right-4 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                  Coming Soon
                </span>
              )}
              {product.status === 'live' && (
                <span className="absolute top-4 right-4 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  Live
                </span>
              )}

              <div className="flex items-start gap-4">
                <span className="text-5xl">{product.icon}</span>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-[#2f02c4] transition-colors">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">{product.description}</p>
                  
                  {/* Technologies */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.technologies?.map((tech) => (
                      <span 
                        key={tech}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Features
                </h3>
                <ul className="space-y-1">
                  {product.features?.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                  {product.features && product.features.length > 3 && (
                    <li className="text-xs text-gray-400">
                      +{product.features.length - 3} more
                    </li>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-gray-200">
                <Link
                  href={`/products/${product.slug}`}
                  className="flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white text-center transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)',
                    boxShadow: '0 4px 14px rgba(80, 32, 232, 0.3)',
                  }}
                >
                  Learn More
                </Link>
                {product.status === 'live' && product.sidebar && product.sidebar.length > 0 && (
                  <Link
                    href={`/products/${product.slug}/docs/${product.sidebar[0].items[0]?.slug || 'getting-started'}`}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Docs
                  </Link>
                )}
                {product.repoUrl && (
                  <a
                    href={product.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            All products are open source and free to use.
          </p>
          <a 
            href="https://github.com/VibhuviOiO"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-[#2f02c4] hover:opacity-80"
          >
            <Github className="h-5 w-5" />
            View all on GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
