'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, BookOpen, Server } from 'lucide-react';

// Logo Title component with exact styling from Docusaurus
function LogoTitle() {
  return (
    <div className="flex items-baseline">
      {/* "Vibhuvi" in purple */}
      <span className="logo-vibhuvi">Vibhuvi</span>
      {/* Space */}
      <span>&nbsp;</span>
      {/* "OiO" with gradient - O in turquoise, i in purple, O in turquoise */}
      <span className="logo-oio">OiO</span>
    </div>
  );
}

// Nine dots grid icon for products menu
function NineDotsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="5" cy="5" r="2" />
      <circle cx="12" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="12" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
    </svg>
  );
}

// Products data
type Product = { slug: string; name: string; icon: string; image?: string; badge?: string; disabled?: boolean };

const liveProducts: Product[] = [
  { slug: '/docker-registry-ui', name: 'Docker Registry UI', icon: '🐳', image: '/img/docker-registry-ui/docker-registry-ui.svg' },
  { slug: '/ldap-manager', name: 'LDAP Manager', icon: '🗂️', image: '/img/ldap-manager/ldap-manager-ui.png' },
  { slug: '/products/openldap-docker', name: 'OpenLDAP Docker', icon: '📦', disabled: true },
  { slug: '/products/suchaka', name: 'Suchaka Status', icon: '📊', disabled: true },
];

const devProducts: Product[] = [
  { slug: '/products/uptime-o', name: 'Uptime O', icon: '⏱️', badge: 'Beta', disabled: true },
  { slug: '/products/solrlens', name: 'SolrLens', icon: '🔍', disabled: true },
  { slug: '/products/infra-mirror', name: 'Infra Mirror', icon: '📡', disabled: true },
  { slug: '/products/container-talks', name: 'Container Talks', icon: '📚', disabled: true },
];

function ProductIcon({ product, disabled }: { product: Product; disabled?: boolean }) {
  if (product.image) {
    return (
      <Image
        src={product.image}
        alt=""
        width={24}
        height={24}
        className={`w-6 h-6 rounded ${disabled ? 'grayscale opacity-40' : ''}`}
      />
    );
  }
  return <span className={`text-xl ${disabled ? 'grayscale opacity-40' : ''}`}>{product.icon}</span>;
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl">
      <div className="flex h-[4.5rem] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo with Image + Title */}
        <Link href="/" className="flex items-center gap-2">
          {/* Logo Image */}
          <Image
            src="/img/logo.svg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8"
            priority
          />
          {/* Logo Title */}
          <LogoTitle />
        </Link>

        {/* Desktop Navigation - Right Side */}
        <div className="hidden md:flex items-center gap-1">
          {/* Docs with Icon */}
          <Link
            href="/docs"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#2702a6] transition-colors rounded-lg hover:bg-gray-50"
          >
            <BookOpen className="h-4 w-4" />
            <span>Docs</span>
          </Link>
          
          {/* Learn with Icon */}
          <Link
            href="/operations"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#2702a6] transition-colors rounded-lg hover:bg-gray-50"
          >
            <Server className="h-4 w-4" />
            <span>Learn</span>
          </Link>

          {/* Products Mega Menu Trigger - button with icon + label */}
          <div className="relative">
            <button
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              className="flex items-center gap-2 ml-2 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:text-[#2702a6] hover:border-[#2702a6]/30 hover:bg-[#2702a6]/5 transition-all"
            >
              <NineDotsIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Products</span>
              <svg className={`h-4 w-4 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Mega Menu Dropdown */}
            {megaMenuOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setMegaMenuOpen(false)}
                />
                {/* Menu */}
                <div 
                  className="absolute top-full right-0 mt-2 w-[480px] rounded-xl border border-gray-200 bg-white p-5 shadow-2xl z-50"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {/* Live Products Column */}
                    <div>
                      <div className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-1 uppercase tracking-wider">
                        🚀 Live Products
                      </div>
                      <div className="space-y-1">
                        {liveProducts.map((product) => (
                          product.disabled ? (
                            <span
                              key={product.slug}
                              className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-300 cursor-default"
                            >
                              <ProductIcon product={product} disabled />
                              <span>{product.name}</span>
                            </span>
                          ) : (
                            <Link
                              key={product.slug}
                              href={product.slug}
                              onClick={() => setMegaMenuOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2702a6] transition-colors"
                            >
                              <ProductIcon product={product} />
                              <span>{product.name}</span>
                            </Link>
                          )
                        ))}
                      </div>
                    </div>
                    
                    {/* In Development Column */}
                    <div>
                      <div className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-1 uppercase tracking-wider">
                        🔨 In Development
                      </div>
                      <div className="space-y-1">
                        {devProducts.map((product) => (
                          product.disabled ? (
                            <span
                              key={product.slug}
                              className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-300 cursor-default"
                            >
                              <ProductIcon product={product} disabled />
                              <span className="flex items-center gap-2">
                                {product.name}
                                {product.badge && (
                                  <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400 font-medium">
                                    {product.badge}
                                  </span>
                                )}
                              </span>
                            </span>
                          ) : (
                            <Link
                              key={product.slug}
                              href={product.slug}
                              onClick={() => setMegaMenuOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2702a6] transition-colors"
                            >
                              <ProductIcon product={product} />
                              <span className="flex items-center gap-2">
                                {product.name}
                                {product.badge && (
                                  <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-700 font-medium">
                                    {product.badge}
                                  </span>
                                )}
                              </span>
                            </Link>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* View All Footer */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Link
                      href="/products"
                      onClick={() => setMegaMenuOpen(false)}
                      className="flex items-center justify-center gap-1 text-sm text-[#2702a6] hover:opacity-80 font-medium"
                    >
                      View All Products
                      <svg className="h-4 w-4 rotate-[-90deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-gray-500 hover:text-gray-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/docs"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen className="h-4 w-4" />
              Docs
            </Link>
            <Link
              href="/operations"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Server className="h-4 w-4" />
              Learn
            </Link>
            <div className="border-t border-gray-100 my-2 pt-2">
              <div className="px-3 py-2 text-sm font-semibold text-gray-900 flex items-center gap-2">
                <NineDotsIcon className="h-4 w-4" />
                Products
              </div>
              {([...liveProducts, ...devProducts] as Product[]).map((product) => (
                product.disabled ? (
                  <span
                    key={product.slug}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 cursor-default"
                  >
                    <ProductIcon product={product} disabled />
                    {product.name}
                    {product.badge && (
                      <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400">
                        {product.badge}
                      </span>
                    )}
                  </span>
                ) : (
                  <Link
                    key={product.slug}
                    href={product.slug}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ProductIcon product={product} />
                    {product.name}
                    {product.badge && (
                      <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-700">
                        {product.badge}
                      </span>
                    )}
                  </Link>
                )
              ))}
              <Link
                href="/products"
                className="block px-3 py-2 text-sm text-[#2702a6] font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                View All Products →
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
