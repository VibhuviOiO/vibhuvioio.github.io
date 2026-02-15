import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadProductBySlugClient, loadProductsClient } from '@/lib/docs-client';
import { Github, ExternalLink, Play, BookOpen, ArrowRight } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = loadProductBySlugClient(slug);
  
  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white">
      {/* Hero */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-6xl">{product.icon}</span>
                <div>
                  {product.status === 'coming-soon' && (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                      Coming Soon
                    </span>
                  )}
                  {product.status === 'live' && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Live
                    </span>
                  )}
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
              <p className="mt-2 text-lg text-gray-600">{product.description}</p>
              
              {/* Technologies */}
              <div className="mt-4 flex flex-wrap gap-2">
                {product.technologies?.map((tech) => (
                  <span 
                    key={tech}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-3">
              {product.pwdUrl && (
                <a
                  href={product.pwdUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)',
                    boxShadow: '0 4px 14px rgba(80, 32, 232, 0.3)',
                  }}
                >
                  <Play className="h-4 w-4" />
                  Try in PWD
                </a>
              )}
              {product.sidebar && product.sidebar.length > 0 && (
                <Link
                  href={`/products/${product.slug}/docs/${product.sidebar[0].items[0]?.slug || 'getting-started'}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Documentation
                </Link>
              )}
              {product.repoUrl && (
                <a
                  href={product.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Features</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.features?.map((feature, i) => (
              <div 
                key={i}
                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-sm" style={{ background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)' }}>
                  ✓
                </span>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Links */}
      {product.sidebar && product.sidebar.length > 0 && (
        <section className="py-16 border-t border-gray-200">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Documentation</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {product.sidebar.map((group) => (
                <div key={group.title} className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">{group.title}</h3>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/products/${product.slug}/docs/${item.slug}`}
                          className="group flex items-center gap-2 text-gray-600 hover:text-[#2f02c4] transition-colors"
                        >
                          {item.title}
                          <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 border-t border-gray-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Ready to get started?</h2>
          <p className="mt-2 text-gray-600">
            Deploy {product.name} in minutes with our comprehensive guides.
          </p>
          {product.sidebar && product.sidebar.length > 0 && (
            <Link
              href={`/products/${product.slug}/docs/${product.sidebar[0].items[0]?.slug || 'getting-started'}`}
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)',
                boxShadow: '0 4px 14px rgba(80, 32, 232, 0.3)',
              }}
            >
              Read Documentation
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}

export function generateStaticParams() {
  const products = loadProductsClient();
  return products.map((p: any) => ({ slug: p.slug }));
}
