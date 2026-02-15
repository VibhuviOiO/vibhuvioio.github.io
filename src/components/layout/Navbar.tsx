'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, ChevronDown, BookOpen, Grid3X3 } from 'lucide-react';

// Logo Title component with exact styling from Docusaurus
function LogoTitle() {
  return (
    <div className="flex items-baseline">
      {/* "Vibhuvi" in purple */}
      <span 
        className="font-extrabold whitespace-nowrap"
        style={{ 
          color: '#2f02c4',
          fontSize: '1.25rem',
          letterSpacing: '-0.02em',
        }}
      >
        Vibhuvi
      </span>
      {/* Space */}
      <span>&nbsp;</span>
      {/* "OiO" with gradient - O in turquoise, i in purple, O in turquoise */}
      <span 
        className="font-extrabold whitespace-nowrap"
        style={{ 
          fontSize: '1.5rem',
          letterSpacing: '-0.02em',
          background: 'linear-gradient(90deg, #00bcd4 0%, #00bcd4 36%, #2f02c4 36%, #2f02c4 64%, #00bcd4 64%, #00bcd4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        OiO
      </span>
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

// Live products data
const liveProducts = [
  { slug: '/docker-registry-ui', name: 'Docker Registry UI', icon: '🐳' },
  { slug: '/products/ldap-manager', name: 'LDAP Manager', icon: '🔐' },
  { slug: '/products/openldap-docker', name: 'OpenLDAP Docker', icon: '📦' },
  { slug: '/products/suchaka', name: 'Suchaka Status', icon: '📊' },
];

// In development products data
const devProducts = [
  { slug: '/products/uptime-o', name: 'Uptime O', icon: '⏱️', badge: 'Beta' },
  { slug: '/products/solrlens', name: 'SolrLens', icon: '🔍', badge: undefined },
  { slug: '/products/infra-mirror', name: 'Infra Mirror', icon: '📡', badge: undefined },
  { slug: '/products/container-talks', name: 'Container Talks', icon: '📚', badge: undefined },
];

// Combined products for mobile menu
type Product = { slug: string; name: string; icon: string; badge?: string };
const allProducts: Product[] = [
  ...liveProducts,
  ...devProducts,
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  const navItems = [
    { href: '/docs', label: 'Docs', icon: BookOpen },
    { href: '/operations', label: 'Operations' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo with Image + Title */}
        <Link href="/" className="flex items-center gap-2">
          {/* Logo Image - Reduced size to match text height */}
          <Image 
            src="/img/logo.svg" 
            alt="" 
            width={28} 
            height={28}
            className="h-7 w-7"
            priority
          />
          {/* Logo Title */}
          <LogoTitle />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {/* Products Mega Menu */}
          <div className="relative">
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              onMouseEnter={() => setProductsOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#2f02c4] transition-colors"
            >
              <NineDotsIcon className="h-5 w-5" />
              <span>Products</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Mega Menu Dropdown */}
            {productsOpen && (
              <div 
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[560px] rounded-xl border border-gray-200 bg-white p-5 shadow-2xl"
                onMouseLeave={() => setProductsOpen(false)}
              >
                <div className="grid grid-cols-2 gap-6">
                  {/* Live Products Column */}
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
                      🚀 Live Products
                    </div>
                    <div className="space-y-1">
                      {liveProducts.map((product) => (
                        <Link
                          key={product.slug}
                          href={product.slug}
                          className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2f02c4] transition-colors"
                        >
                          <span className="text-lg">{product.icon}</span>
                          <span>{product.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  
                  {/* In Development Column */}
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
                      🔨 In Development
                    </div>
                    <div className="space-y-1">
                      {devProducts.map((product) => (
                        <Link
                          key={product.slug}
                          href={product.slug}
                          className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2f02c4] transition-colors"
                        >
                          <span className="text-lg">{product.icon}</span>
                          <span className="flex items-center gap-2">
                            {product.name}
                            {product.badge && (
                              <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700">
                                {product.badge}
                              </span>
                            )}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* View All Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <Link
                    href="/products"
                    className="flex items-center justify-center gap-1 text-sm text-[#2f02c4] hover:opacity-80 font-medium"
                  >
                    View All Products
                    <ChevronDown className="h-4 w-4 -rotate-90" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
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
            {/* Products Section */}
            <div className="px-3 py-2 text-sm font-semibold text-gray-900">
              🚀 Products
            </div>
            {allProducts.map((product) => (
              <Link
                key={product.slug}
                href={product.slug}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{product.icon}</span>
                {product.name}
                {product.badge && (
                  <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700">
                    {product.badge}
                  </span>
                )}
              </Link>
            ))}
            <Link
              href="/products"
              className="block px-3 py-2 text-sm text-[#2f02c4] font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              View All Products →
            </Link>
            
            <div className="border-t border-gray-100 my-2 pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
