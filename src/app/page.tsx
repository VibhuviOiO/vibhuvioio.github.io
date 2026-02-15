'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const rotatingPhrases = [
  'Infrastructure Boring.',
  'Operations Invisible.',
  'Monitoring Effortless.',
];

function RotatingText() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = rotatingPhrases[phraseIndex];

    if (!isDeleting && charCount < currentPhrase.length) {
      const timeout = setTimeout(() => setCharCount(charCount + 1), 150);
      return () => clearTimeout(timeout);
    }

    if (!isDeleting && charCount === currentPhrase.length) {
      const timeout = setTimeout(() => setIsDeleting(true), 3500);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && charCount > 0) {
      const timeout = setTimeout(() => setCharCount(charCount - 1), 60);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && charCount === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
    }
  }, [charCount, isDeleting, phraseIndex]);

  const currentPhrase = rotatingPhrases[phraseIndex];

  return (
    <span className="bg-gradient-to-r from-[#5020e8] to-[#2f02c4] bg-clip-text text-transparent">
      {currentPhrase.slice(0, charCount)}
      <span className="animate-[blink_1s_infinite]">|</span>
    </span>
  );
}

export default function Home() {
  return (
    <main>
      {/* Hero Section with Grid Background */}
      <section 
        className="relative overflow-hidden py-20 lg:py-32"
        style={{
          backgroundColor: '#f8fafc',
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      >
        {/* Radial gradient spotlight effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(47, 2, 196, 0.06) 0%, transparent 50%)',
          }}
        />
        
        {/* Secondary glow effect */}
        <div 
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            right: '-10%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(0, 188, 212, 0.04) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              We Make Your
              <br />
              <RotatingText />
            </h1>
            <p className="mt-6 text-xl text-gray-600">We handle the ops. You ship the code.</p>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Production-ready open source tools and battle-tested automation
              for teams that want infrastructure they never have to think about.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)',
                  boxShadow: '0 4px 14px rgba(80, 32, 232, 0.3)',
                }}
              >
                Explore Products
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
              >
                Read the Docs
              </Link>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-gray-200 pt-10">
              <div>
                <div className="text-3xl font-bold text-gray-900">140+</div>
                <div className="mt-1 text-sm text-gray-500">Guides</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">5</div>
                <div className="mt-1 text-sm text-gray-500">Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">100%</div>
                <div className="mt-1 text-sm text-gray-500">Open Source</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Everything Connected - Centralised Operations */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: 'rgba(47, 2, 196, 0.1)', color: '#2f02c4' }}>
                AI-Powered Platform
              </span>
              <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                Everything Connected
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Unified control plane for infrastructure. AI-assisted tools built 
                for your stack. On-demand products for infrastructure needs.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)' }}>◉</span>
                  <span className="text-gray-700">Unified control plane for infrastructure</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #8a5ff3 0%, #5020e8 100%)' }}>◈</span>
                  <span className="text-gray-700">AI-assisted tools built for your stack</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #00bcd4 0%, #5020e8 100%)' }}>◇</span>
                  <span className="text-gray-700">On-demand products for infrastructure needs</span>
                </div>
              </div>
            </div>
            
            {/* Orbit Animation */}
            <div className="relative flex h-80 items-center justify-center">
              <div className="absolute h-16 w-16 rounded-full flex items-center justify-center shadow-2xl shadow-blue-600/30 z-10" style={{ background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)' }}>
                <span className="text-2xl text-white">◉</span>
              </div>
              
              {/* Inner orbit */}
              <div className="absolute h-40 w-40 rounded-full border border-gray-200 animate-[orbit_20s_linear_infinite]">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[#5020e8]">◈</span>
                <span className="absolute top-1/2 -right-2 -translate-y-1/2 text-[#5020e8]">◈</span>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[#5020e8]">◈</span>
                <span className="absolute top-1/2 -left-2 -translate-y-1/2 text-[#5020e8]">◈</span>
              </div>
              
              {/* Outer orbit */}
              <div className="absolute h-64 w-64 rounded-full border border-gray-200 animate-[orbit-reverse_30s_linear_infinite]">
                <span className="absolute -top-2 left-1/3 text-[#00bcd4]">◇</span>
                <span className="absolute top-1/3 -right-2 text-[#00bcd4]">◇</span>
                <span className="absolute -bottom-2 right-1/3 text-[#00bcd4]">◇</span>
                <span className="absolute bottom-1/3 -left-2 text-[#00bcd4]">◇</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Sleep Soundly - Conscious Operations - Exact Layout from Docusaurus */}
      <section className="py-20" style={{ background: 'linear-gradient(to bottom, #ffffff, #f1f5f9, #ffffff)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Grid Layout matching Docusaurus exactly */}
          <div 
            className="grid gap-4"
            style={{
              gridTemplateColumns: '1fr 300px 1fr',
              gridTemplateRows: 'auto auto 1fr 1fr',
              gridTemplateAreas: `
                "badge badge badge"
                "title title title"
                "leftTop center right"
                "leftBottom center right"
              `,
              minHeight: '420px',
            }}
          >
            {/* Badge - centered at top */}
            <div style={{ gridArea: 'badge', textAlign: 'center', marginBottom: '0.5rem' }}>
              <span 
                className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                }}
              >
                Zero Stress Ops
              </span>
            </div>
            
            {/* Title - centered */}
            <h2 
              style={{ 
                gridArea: 'title', 
                textAlign: 'center', 
                fontSize: '2rem',
                fontWeight: 800,
                color: '#1a1a2e',
                marginBottom: '1rem',
                letterSpacing: '-0.02em',
              }}
            >
              Sleep Soundly
            </h2>
            
            {/* Left Top Item */}
            <div style={{ gridArea: 'leftTop', justifySelf: 'end', textAlign: 'right', paddingRight: '1rem' }}>
              <div className="flex items-center gap-3 flex-row-reverse" style={{ maxWidth: '280px' }}>
                <span 
                  className="flex items-center justify-center rounded-lg text-white flex-shrink-0"
                  style={{ 
                    width: '36px', 
                    height: '36px',
                    background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)',
                    boxShadow: '0 4px 14px rgba(80, 32, 232, 0.3)',
                    fontSize: '1.1rem',
                  }}
                >
                  🛡
                </span>
                <span className="text-gray-700 text-sm">Stable by default. No firefighting.</span>
              </div>
            </div>
            
            {/* Left Bottom Item */}
            <div style={{ gridArea: 'leftBottom', justifySelf: 'end', textAlign: 'right', paddingRight: '1rem' }}>
              <div className="flex items-center gap-3 flex-row-reverse" style={{ maxWidth: '280px' }}>
                <span 
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ 
                    width: '36px', 
                    height: '36px',
                    background: 'rgba(80, 32, 232, 0.08)',
                    border: '1px solid rgba(80, 32, 232, 0.35)',
                    fontSize: '1.1rem',
                    color: '#5020e8',
                  }}
                >
                  ☾
                </span>
                <span className="text-gray-700 text-sm">No 3 AM pages. No deployment anxiety.</span>
              </div>
            </div>
            
            {/* Center Animation */}
            <div style={{ gridArea: 'center', justifySelf: 'center', alignSelf: 'center' }}>
              <div className="relative flex items-center justify-center" style={{ width: '260px', height: '260px' }}>
                {/* Pulse rings */}
                <div 
                  className="absolute rounded-full"
                  style={{ 
                    width: '140px', 
                    height: '140px',
                    border: '1px solid rgba(61, 122, 181, 0.2)',
                    animation: 'pulseExpand 4s ease-out infinite',
                  }}
                />
                <div 
                  className="absolute rounded-full"
                  style={{ 
                    width: '180px', 
                    height: '180px',
                    border: '1px solid rgba(61, 122, 181, 0.2)',
                    animation: 'pulseExpand 4s ease-out infinite 1.3s',
                  }}
                />
                <div 
                  className="absolute rounded-full"
                  style={{ 
                    width: '220px', 
                    height: '220px',
                    border: '1px solid rgba(61, 122, 181, 0.2)',
                    animation: 'pulseExpand 4s ease-out infinite 2.6s',
                  }}
                />
                
                {/* Core moon */}
                <div 
                  className="relative flex items-center justify-center rounded-full z-10"
                  style={{ 
                    width: '90px', 
                    height: '90px',
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #3d7ab5 100%)',
                    boxShadow: '0 0 40px rgba(61, 122, 181, 0.4), inset -10px -10px 20px rgba(0, 0, 0, 0.3)',
                    animation: 'coreBreathe 6s ease-in-out infinite',
                  }}
                >
                  <span 
                    className="text-white"
                    style={{ 
                      fontSize: '2.5rem',
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                      opacity: 0.9,
                    }}
                  >
                    ☽
                  </span>
                </div>
                
                {/* Floating Z's */}
                <span 
                  className="absolute font-semibold pointer-events-none"
                  style={{ 
                    top: '20%',
                    right: '15%',
                    fontSize: '1.5rem',
                    color: 'rgba(61, 122, 181, 0.6)',
                    animation: 'floatZ 5s ease-in-out infinite',
                  }}
                >
                  Z
                </span>
                <span 
                  className="absolute font-semibold pointer-events-none"
                  style={{ 
                    top: '35%',
                    right: '8%',
                    fontSize: '1rem',
                    color: 'rgba(61, 122, 181, 0.6)',
                    animation: 'floatZ 5s ease-in-out infinite 1.6s',
                  }}
                >
                  z
                </span>
                <span 
                  className="absolute font-semibold pointer-events-none"
                  style={{ 
                    top: '15%',
                    right: '25%',
                    fontSize: '1.2rem',
                    color: 'rgba(61, 122, 181, 0.6)',
                    animation: 'floatZ 5s ease-in-out infinite 3.2s',
                  }}
                >
                  Z
                </span>
              </div>
            </div>
            
            {/* Right Item */}
            <div style={{ gridArea: 'right', justifySelf: 'start', paddingLeft: '1rem' }}>
              <div className="flex items-center gap-3" style={{ maxWidth: '280px' }}>
                <span 
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ 
                    width: '36px', 
                    height: '36px',
                    background: 'rgba(0, 188, 212, 0.06)',
                    border: '1px solid rgba(0, 188, 212, 0.3)',
                    fontSize: '1.1rem',
                    color: '#00bcd4',
                  }}
                >
                  ✓
                </span>
                <span className="text-gray-700 text-sm">Proactive monitoring. Automated remediation.</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Built on Industry Standards - Exact Animation Replication */}
      <section className="py-20" style={{ background: '#f8fafc' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Grid Layout */}
          <div 
            className="grid gap-6"
            style={{
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: 'auto auto 1fr',
              gridTemplateAreas: `
                "badge badge"
                "title title"
                "center right"
              `,
              minHeight: '480px',
            }}
          >
            {/* Badge */}
            <div style={{ gridArea: 'badge', textAlign: 'center', marginBottom: '0.5rem' }}>
              <span 
                className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#d97706',
                }}
              >
                Reliability First
              </span>
            </div>
            
            {/* Title */}
            <h2 
              style={{ 
                gridArea: 'title', 
                textAlign: 'center', 
                fontSize: '2rem',
                fontWeight: 800,
                color: '#1a1a2e',
                marginBottom: '1rem',
                letterSpacing: '-0.02em',
              }}
            >
              Built on Industry Standards
            </h2>
            
            {/* Left Content */}
            <div style={{ gridArea: 'center', justifySelf: 'end', alignSelf: 'center', maxWidth: '460px', padding: '0 1rem' }}>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Every system is measured against real reliability targets — 
                not just uptime numbers, but SLAs, SLOs, and SLIs that your 
                business can depend on.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'rgba(80, 32, 232, 0.08)', border: '1px solid rgba(80, 32, 232, 0.2)', color: '#4b5563' }}>
                  Error Budgets
                </span>
                <span className="px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'rgba(80, 32, 232, 0.08)', border: '1px solid rgba(80, 32, 232, 0.2)', color: '#4b5563' }}>
                  Latency Targets
                </span>
                <span className="px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'rgba(80, 32, 232, 0.08)', border: '1px solid rgba(80, 32, 232, 0.2)', color: '#4b5563' }}>
                  Availability Guarantees
                </span>
              </div>
              
              {/* SLA → SLO → SLI → Uptime Observability Bridge */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <span 
                  className="px-3 py-1.5 rounded text-xs font-bold"
                  style={{ 
                    background: 'rgba(80, 32, 232, 0.08)', 
                    border: '1px solid rgba(80, 32, 232, 0.2)',
                    color: '#5020e8',
                    animation: 'floatStandard 3s ease-in-out infinite',
                  }}
                >
                  SLA
                </span>
                <span 
                  className="text-gray-400"
                  style={{ animation: 'arrowPulse 2s ease-in-out infinite' }}
                >
                  →
                </span>
                <span 
                  className="px-3 py-1.5 rounded text-xs font-bold"
                  style={{ 
                    background: 'rgba(80, 32, 232, 0.08)', 
                    border: '1px solid rgba(80, 32, 232, 0.2)',
                    color: '#5020e8',
                    animation: 'floatStandard 3s ease-in-out infinite 0.5s',
                  }}
                >
                  SLO
                </span>
                <span 
                  className="text-gray-400"
                  style={{ animation: 'arrowPulse 2s ease-in-out infinite 0.33s' }}
                >
                  →
                </span>
                <span 
                  className="px-3 py-1.5 rounded text-xs font-bold"
                  style={{ 
                    background: 'rgba(80, 32, 232, 0.08)', 
                    border: '1px solid rgba(80, 32, 232, 0.2)',
                    color: '#5020e8',
                    animation: 'floatStandard 3s ease-in-out infinite 1s',
                  }}
                >
                  SLI
                </span>
                <span 
                  className="text-gray-400"
                  style={{ animation: 'arrowPulse 2s ease-in-out infinite 0.66s' }}
                >
                  →
                </span>
                <span 
                  className="px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap"
                  style={{ 
                    background: 'rgba(16, 185, 129, 0.08)', 
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#059669',
                    animation: 'floatStandard 3s ease-in-out infinite 1.5s',
                  }}
                >
                  Uptime Observability
                </span>
              </div>
            </div>
            
            {/* Right Animation - Targets with Orbiting Badges */}
            <div style={{ gridArea: 'right', justifySelf: 'start', alignSelf: 'center', paddingLeft: '1rem' }}>
              <div className="relative flex items-center justify-center" style={{ width: '380px', height: '380px' }}>
                {/* Outer ring - dashed cyan */}
                <div 
                  className="absolute rounded-full"
                  style={{ 
                    width: '340px', 
                    height: '340px',
                    border: '1px dashed rgba(0, 188, 212, 0.15)',
                    animation: 'targetPulse 4s ease-in-out infinite',
                  }}
                />
                
                {/* Middle ring - green */}
                <div 
                  className="absolute rounded-full"
                  style={{ 
                    width: '240px', 
                    height: '240px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    animation: 'targetPulse 4s ease-in-out infinite 0.66s',
                  }}
                />
                
                {/* Inner ring - purple */}
                <div 
                  className="absolute rounded-full"
                  style={{ 
                    width: '140px', 
                    height: '140px',
                    border: '1px solid rgba(80, 32, 232, 0.25)',
                    animation: 'targetPulse 4s ease-in-out infinite 1.33s',
                  }}
                />
                
                {/* Center checkmark */}
                <div 
                  className="relative flex items-center justify-center rounded-full z-10"
                  style={{ 
                    width: '44px', 
                    height: '44px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <span className="text-white text-lg font-bold">✓</span>
                </div>
                
                {/* Inner orbit badges - SLA, SLO, SLI */}
                <span 
                  className="absolute px-1.5 py-0.5 rounded text-[0.55rem] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{ 
                    background: 'rgba(80, 32, 232, 0.1)',
                    border: '1px solid rgba(80, 32, 232, 0.2)',
                    color: '#5020e8',
                    animation: 'orbitInner 20s linear infinite',
                  }}
                >
                  SLA
                </span>
                <span 
                  className="absolute px-1.5 py-0.5 rounded text-[0.55rem] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{ 
                    background: 'rgba(80, 32, 232, 0.1)',
                    border: '1px solid rgba(80, 32, 232, 0.2)',
                    color: '#5020e8',
                    animation: 'orbitInner 20s linear infinite',
                    animationDelay: '-6.66s',
                  }}
                >
                  SLO
                </span>
                <span 
                  className="absolute px-1.5 py-0.5 rounded text-[0.55rem] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{ 
                    background: 'rgba(80, 32, 232, 0.1)',
                    border: '1px solid rgba(80, 32, 232, 0.2)',
                    color: '#5020e8',
                    animation: 'orbitInner 20s linear infinite',
                    animationDelay: '-13.33s',
                  }}
                >
                  SLI
                </span>
                
                {/* Middle orbit badges - Uptime, 99.9% */}
                <span 
                  className="absolute px-2.5 py-1 rounded text-xs font-semibold tracking-wide whitespace-nowrap"
                  style={{ 
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#059669',
                    animation: 'orbitMiddle 25s linear infinite reverse',
                  }}
                >
                  Uptime
                </span>
                <span 
                  className="absolute px-2.5 py-1 rounded text-xs font-semibold tracking-wide whitespace-nowrap"
                  style={{ 
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#059669',
                    animation: 'orbitMiddle 25s linear infinite reverse',
                    animationDelay: '-12.5s',
                  }}
                >
                  99.9%
                </span>
                
                {/* Outer orbit badges - Latency, Errors, Observability */}
                <span 
                  className="absolute px-3 py-1 rounded text-sm font-semibold tracking-wide whitespace-nowrap"
                  style={{ 
                    background: 'rgba(0, 188, 212, 0.1)',
                    border: '1px solid rgba(0, 188, 212, 0.2)',
                    color: '#0891b2',
                    animation: 'orbitOuter 30s linear infinite',
                  }}
                >
                  Latency
                </span>
                <span 
                  className="absolute px-3 py-1 rounded text-sm font-semibold tracking-wide whitespace-nowrap"
                  style={{ 
                    background: 'rgba(0, 188, 212, 0.1)',
                    border: '1px solid rgba(0, 188, 212, 0.2)',
                    color: '#0891b2',
                    animation: 'orbitOuter 30s linear infinite',
                    animationDelay: '-10s',
                  }}
                >
                  Errors
                </span>
                <span 
                  className="absolute px-3 py-1 rounded text-sm font-semibold tracking-wide whitespace-nowrap"
                  style={{ 
                    background: 'rgba(0, 188, 212, 0.1)',
                    border: '1px solid rgba(0, 188, 212, 0.2)',
                    color: '#0891b2',
                    animation: 'orbitOuter 30s linear infinite',
                    animationDelay: '-20s',
                  }}
                >
                  Observability
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* We Listen to Your Team */}
      <section className="py-20" style={{ background: 'linear-gradient(to bottom, #ffffff, #f1f5f9, #ffffff)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: 'rgba(47, 2, 196, 0.1)', color: '#2f02c4' }}>
              Collaborative Approach
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              We Listen to Your Team
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              We turn complex conversations into simple, actionable solutions.
            </p>
          </div>
          
          {/* Sound Wave Visualization */}
          <div className="relative h-80 flex items-center justify-center">
            {/* Center listening element */}
            <div className="relative z-10">
              <div className="h-16 w-16 rounded-full flex items-center justify-center shadow-2xl" style={{ background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)' }}>
                <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4C8 4 5 7 5 11c0 3 2 5 4 6v2c0 1 1 2 2 2s2-1 2-2v-1c0-1-1-2-2-3-1-1-2-2-2-4 0-2 2-3 4-3s4 1 4 3" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400">Listening</span>
            </div>
            
            {/* Sound waves */}
            <div className="absolute flex items-center justify-center gap-1">
              {[...Array(8)].map((_, i) => (
                <span 
                  key={i}
                  className="w-1 rounded-full animate-[wave_1.5s_ease-in-out_infinite]"
                  style={{ 
                    height: `${20 + Math.random() * 40}px`,
                    animationDelay: `${i * 0.1}s`,
                    background: 'linear-gradient(to top, #5020e8, #8a5ff3)',
                  }}
                />
              ))}
            </div>
            
            {/* Team voice points */}
            {[
              { label: 'Tech Stack', x: '10%', y: '20%' },
              { label: 'CI/CD', x: '50%', y: '5%' },
              { label: 'GitOps', x: '85%', y: '20%' },
              { label: 'Security', x: '5%', y: '50%' },
              { label: 'Monitoring', x: '90%', y: '50%' },
              { label: 'Pain Points', x: '15%', y: '80%' },
              { label: 'Cost Control', x: '50%', y: '90%' },
              { label: 'Alert Hell', x: '80%', y: '80%' },
            ].map((point, i) => (
              <div 
                key={point.label}
                className="absolute flex flex-col items-center gap-1"
                style={{ left: point.x, top: point.y }}
              >
                <div className="h-2 w-2 rounded-full animate-[voice-pulse_2s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.2}s`, background: '#5020e8' }} />
                <span className="text-xs text-gray-500">{point.label}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xl font-medium text-gray-900">
              Thinking complex is simple. Making things simple is complex.
            </p>
            <p className="mt-2 text-gray-500">
              The possibility of complexity is higher, so we think simple. 
              We listen to your team to understand systems.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20" style={{ background: '#f8fafc' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Ready to Simplify Your Infrastructure?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Everything is open source. Start deploying in minutes, not weeks.
          </p>
          <div className="mt-8">
            <Link
              href="/docs"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 text-base font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)',
                boxShadow: '0 4px 14px rgba(80, 32, 232, 0.3)',
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
