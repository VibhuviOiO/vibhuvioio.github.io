'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, BookOpen, Server, ChevronDown } from 'lucide-react';

// Logo Title component with larger text for better visibility
function LogoTitle() {
  return (
    <div className="flex items-baseline">
      {/* "Vibhuvi" in purple */}
      <span className="text-xl font-bold text-[#2702a6]">Vibhuvi</span>
      {/* Space */}
      <span>&nbsp;</span>
      {/* "OiO" with gradient */}
      <span className="text-xl font-bold bg-gradient-to-r from-[#00bcd4] via-[#2702a6] to-[#00bcd4] bg-clip-text text-transparent">OiO</span>
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
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        {/* Logo with Image + Title */}
        <Link href="/" className="flex items-center gap-2.5">
          {/* Logo Image */}
          <Image
            src="/img/logo.svg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9"
            priority
          />
          {/* Logo Title */}
          <LogoTitle />
        </Link>

        {/* Desktop Navigation - Right Side */}
        <div className="hidden md:flex items-center gap-2">
          {/* Docs with Icon */}
          <Link
            href="/docs"
            className="flex items-center gap-2 px-4 py-2.5 text-[15px] font-semibold text-gray-700 hover:text-[#2702a6] transition-all rounded-lg hover:bg-gray-50/80"
          >
            <BookOpen className="h-[18px] w-[18px]" />
            <span>Docs</span>
          </Link>
          
          {/* Learn with Icon */}
          <Link
            href="/operations"
            className="flex items-center gap-2 px-4 py-2.5 text-[15px] font-semibold text-gray-700 hover:text-[#2702a6] transition-all rounded-lg hover:bg-gray-50/80"
          >
            <Server className="h-[18px] w-[18px]" />
            <span>Learn</span>
          </Link>

          {/* Products Mega Menu Trigger */}
          <div className="relative ml-2">
            <button
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#2702a6] text-white hover:bg-[#1a0175] transition-all shadow-lg shadow-[#2702a6]/20"
            >
              <NineDotsIcon className="h-5 w-5" />
              <span className="text-[15px] font-semibold">Products</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Mega Menu Dropdown */}
            {megaMenuOpen && (
              <>
                {/* Invisible backdrop to catch clicks - doesn't affect appearance */}
                <div 
                  className="fixed inset-0 z-[-1]"
                  onClick={() => setMegaMenuOpen(false)}
                />
                {/* Menu with its own shadow */}
                <div className="absolute top-full right-0 mt-3 w-[520px] rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl z-50">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Live Products Column */}
                    <div>
                      <div className="text-xs font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Live Products
                      </div>
                      <div className="space-y-1">
                        {liveProducts.map((product) => (
                          product.disabled ? (
                            <span
                              key={product.slug}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-gray-300 cursor-default"
                            >
                              <ProductIcon product={product} disabled />
                              <span className="font-medium">{product.name}</span>
                            </span>
                          ) : (
                            <Link
                              key={product.slug}
                              href={product.slug}
                              onClick={() => setMegaMenuOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-gray-700 hover:bg-[#2702a6]/5 hover:text-[#2702a6] transition-all group"
                            >
                              <ProductIcon product={product} />
                              <span className="font-medium">{product.name}</span>
                            </Link>
                          )
                        ))}
                      </div>
                    </div>
                    
                    {/* In Development Column */}
                    <div>
                      <div className="text-xs font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        Coming Soon
                      </div>
                      <div className="space-y-1">
                        {devProducts.map((product) => (
                          product.disabled ? (
                            <span
                              key={product.slug}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-gray-300 cursor-default"
                            >
                              <ProductIcon product={product} disabled />
                              <span className="font-medium flex items-center gap-2">
                                {product.name}
                                {product.badge && (
                                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400 font-semibold">
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
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-gray-700 hover:bg-[#2702a6]/5 hover:text-[#2702a6] transition-all group"
                            >
                              <ProductIcon product={product} />
                              <span className="font-medium flex items-center gap-2">
                                {product.name}
                                {product.badge && (
                                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] text-purple-700 font-semibold">
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
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <Link
                      href="/products"
                      onClick={() => setMegaMenuOpen(false)}
                      className="flex items-center justify-center gap-2 text-[14px] text-[#2702a6] hover:text-[#1a0175] font-semibold transition-colors"
                    >
                      Explore All Products
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
        <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-4 space-y-1">
            <Link
              href="/docs"
              className="flex items-center gap-3 px-4 py-3 text-[16px] font-semibold text-gray-700 hover:text-[#2702a6] hover:bg-gray-50 rounded-lg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen className="h-5 w-5" />
              Docs
            </Link>
            <Link
              href="/operations"
              className="flex items-center gap-3 px-4 py-3 text-[16px] font-semibold text-gray-700 hover:text-[#2702a6] hover:bg-gray-50 rounded-lg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Server className="h-5 w-5" />
              Learn
            </Link>
            <div className="border-t border-gray-100 my-3 pt-3">
              <div className="px-4 py-2 text-[14px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <NineDotsIcon className="h-4 w-4" />
                Products
              </div>
              {([...liveProducts, ...devProducts] as Product[]).map((product) => (
                product.disabled ? (
                  <span
                    key={product.slug}
                    className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-300 cursor-default"
                  >
                    <ProductIcon product={product} disabled />
                    {product.name}
                    {product.badge && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-400 font-medium">
                        {product.badge}
                      </span>
                    )}
                  </span>
                ) : (
                  <Link
                    key={product.slug}
                    href={product.slug}
                    className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-700 hover:text-[#2702a6] hover:bg-gray-50 rounded-lg transition-all font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ProductIcon product={product} />
                    {product.name}
                    {product.badge && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] text-purple-700 font-medium">
                        {product.badge}
                      </span>
                    )}
                  </Link>
                )
              ))}
              <Link
                href="/products"
                className="flex items-center gap-2 px-4 py-3 mt-2 text-[15px] text-[#2702a6] font-semibold hover:bg-[#2702a6]/5 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore All Products
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
