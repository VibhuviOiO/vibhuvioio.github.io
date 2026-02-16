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
    <span className="bg-gradient-to-r from-[#2702a6] to-[#200289] bg-clip-text text-transparent">
      {currentPhrase.slice(0, charCount)}
      <span className="animate-[blink_1s_infinite]">|</span>
    </span>
  );
}

export default function HomeContent() {
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
            background: 'radial-gradient(ellipse at 50% 0%,  rgba(32, 2, 137, 0.06) 0%, transparent 50%)',
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
                  background: 'linear-gradient(135deg, #2702a6 0%, #200289 100%)',
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

      {/* Everything Connected - Centralised Operations - Docusaurus Style */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Grid Layout matching Docusaurus */}
          <div 
            className="grid gap-4"
            style={{
              gridTemplateColumns: '1fr 320px 1fr',
              gridTemplateRows: 'auto auto 1fr 1fr',
              gridTemplateAreas: `
                "badge badge badge"
                "title title title"
                "left center topRight"
                "left center bottomRight"
              `,
              minHeight: '440px',
            }}
          >
            {/* Badge - centered at top */}
            <div style={{ gridArea: 'badge', textAlign: 'center', marginBottom: '0.5rem' }}>
              <span 
                className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(80, 32, 232, 0.15) 0%, rgba(39, 2, 166, 0.15) 100%)',
                  border: '1px solid rgba(80, 32, 232, 0.3)',
                  color: '#2702a6',
                }}
              >
                AI-Powered Platform
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
              Everything Connected
            </h2>
            
            {/* Left item - Hub */}
            <div style={{ gridArea: 'left', justifySelf: 'end', textAlign: 'right', paddingRight: '1rem' }}>
              <div className="flex items-center gap-3 flex-row-reverse" style={{ maxWidth: '280px' }}>
                <span 
                  className="flex items-center justify-center rounded-lg text-white flex-shrink-0"
                  style={{ 
                    width: '36px', 
                    height: '36px',
                    background: 'linear-gradient(135deg, #2702a6 0%, #200289 100%)',
                    boxShadow: '0 4px 14px rgba(80, 32, 232, 0.3)',
                    fontSize: '1.1rem',
                  }}
                >
                  ◉
                </span>
                <span className="text-gray-700 text-sm">Unified control plane for infrastructure</span>
              </div>
            </div>
            
            {/* Center Animation - Orbit System */}
            <div style={{ gridArea: 'center', justifySelf: 'center', alignSelf: 'center' }}>
              <div 
                className="relative flex items-center justify-center"
                style={{ width: '280px', height: '280px' }}
              >
                {/* Hub Center */}
                <div 
                  className="absolute flex items-center justify-center rounded-full z-10"
                  style={{ 
                    width: '80px', 
                    height: '80px',
                    background: 'linear-gradient(135deg, #2702a6 0%, #200289 100%)',
                    boxShadow: '0 0 40px rgba(80, 32, 232, 0.5)',
                    animation: 'hubPulse 3s ease-in-out infinite',
                  }}
                >
                  <span className="text-2xl text-white">◉</span>
                </div>
                
                {/* Inner Orbit Ring */}
                <div 
                  className="absolute rounded-full"
                  style={{ 
                    width: '200px', 
                    height: '200px',
                    border: '1px solid rgba(80, 32, 232, 0.2)',
                    animation: 'orbitRotate 20s linear infinite',
                  }}
                >
                  {[0, 72, 144, 216, 288].map((angle, i) => (
                    <span
                      key={i}
                      className="absolute flex items-center justify-center rounded-lg text-sm"
                      style={{
                        width: '32px',
                        height: '32px',
                        top: '50%',
                        left: '50%',
                        margin: '-16px 0 0 -16px',
                        background: 'rgba(80, 32, 232, 0.08)',
                        border: '1px solid rgba(80, 32, 232, 0.25)',
                        color: '#2702a6',
                        transform: `rotate(${angle}deg) translateX(100px) rotate(-${angle}deg)`,
                        animation: 'nodeGlow 3s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`,
                      }}
                    >
                      ◈
                    </span>
                  ))}
                </div>
                
                {/* Outer Orbit Ring */}
                <div 
                  className="absolute rounded-full"
                  style={{ 
                    width: '260px', 
                    height: '260px',
                    border: '1px dashed rgba(0, 188, 212, 0.15)',
                    animation: 'orbitRotateReverse 30s linear infinite',
                  }}
                >
                  {[36, 108, 180, 252, 324].map((angle, i) => (
                    <span
                      key={i}
                      className="absolute flex items-center justify-center rounded text-xs"
                      style={{
                        width: '28px',
                        height: '28px',
                        top: '50%',
                        left: '50%',
                        margin: '-14px 0 0 -14px',
                        background: 'rgba(0, 188, 212, 0.06)',
                        border: '1px solid rgba(0, 188, 212, 0.2)',
                        color: '#0891b2',
                        transform: `rotate(${angle}deg) translateX(130px) rotate(-${angle}deg)`,
                      }}
                    >
                      ◇
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Top Right item - Inner */}
            <div style={{ gridArea: 'topRight', justifySelf: 'start', paddingLeft: '1rem' }}>
              <div className="flex items-center gap-3" style={{ maxWidth: '280px' }}>
                <span 
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ 
                    width: '36px', 
                    height: '36px',
                    background: 'rgba(80, 32, 232, 0.08)',
                    border: '1px solid rgba(80, 32, 232, 0.25)',
                    fontSize: '1.1rem',
                    color: '#2702a6',
                  }}
                >
                  ◈
                </span>
                <span className="text-gray-700 text-sm">AI-assisted tools built for your stack</span>
              </div>
            </div>
            
            {/* Bottom Right item - Outer */}
            <div style={{ gridArea: 'bottomRight', justifySelf: 'start', paddingLeft: '1rem' }}>
              <div className="flex items-center gap-3" style={{ maxWidth: '280px' }}>
                <span 
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ 
                    width: '36px', 
                    height: '36px',
                    background: 'rgba(0, 188, 212, 0.06)',
                    border: '1px solid rgba(0, 188, 212, 0.2)',
                    fontSize: '1.1rem',
                    color: '#0891b2',
                  }}
                >
                  ◇
                </span>
                <span className="text-gray-700 text-sm">On-demand products for infrastructure needs</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Sleep Soundly - Conscious Operations */}
      <section className="py-20" style={{ background: 'linear-gradient(to bottom, #ffffff, #f1f5f9, #ffffff)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Grid Layout */}
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
                    background: 'linear-gradient(135deg, #2702a6 0%, #200289 100%)',
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
                    color: '#2702a6',
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


      {/* Built on Industry Standards */}
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
                    color: '#2702a6',
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
                    color: '#2702a6',
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
                    color: '#2702a6',
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
                    color: '#2702a6',
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
                    color: '#2702a6',
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
                    color: '#2702a6',
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


      {/* We Listen to Your Team - Docusaurus Style */}
      <section className="py-20" style={{ background: 'linear-gradient(180deg, rgba(80, 32, 232, 0.03) 0%, transparent 60%)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-center mb-2">
              <span 
                className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.15) 0%, rgba(0, 188, 212, 0.1) 100%)',
                  border: '1px solid rgba(0, 188, 212, 0.3)',
                  color: '#0891b2',
                }}
              >
                Collaborative Approach
              </span>
            </div>
            <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight mb-3">
              We Listen to Your Team
            </h2>
            <p className="text-center text-lg text-gray-600 max-w-2xl mx-auto">
              We turn complex conversations into simple, actionable solutions.
            </p>
          </div>

          {/* Sound Wave Visualization */}
          <div 
            className="relative mx-auto mb-12"
            style={{ width: '600px', height: '400px', maxWidth: '100%' }}
          >
            {/* Central Ear/Listening Element */}
            <div 
              className="absolute flex flex-col items-center gap-2 z-10"
              style={{ 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div 
                className="flex items-center justify-center rounded-full"
                style={{ 
                  width: '80px', 
                  height: '80px',
                  background: 'linear-gradient(135deg, rgba(80, 32, 232, 0.1) 0%, rgba(0, 188, 212, 0.1) 100%)',
                  border: '2px solid rgba(80, 32, 232, 0.2)',
                  padding: '1rem',
                  animation: 'earPulse 3s ease-in-out infinite',
                }}
              >
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path 
                    d="M32 8C20 8 12 18 12 30c0 8 4 14 10 18v6c0 4 4 6 8 6s8-2 8-6v-4c0-4-2-6-4-8-2-2-4-4-4-8 0-4 4-8 8-8s8 4 8 8" 
                    stroke="url(#earGrad)" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="earGrad" x1="12" y1="8" x2="52" y2="56">
                      <stop stopColor="#5020e8"/>
                      <stop offset="1" stopColor="#00bcd4"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span 
                className="text-xs font-semibold text-gray-500 uppercase tracking-widest"
              >
                Listening
              </span>
            </div>

            {/* Sound Waves */}
            <div className="absolute inset-0 pointer-events-none">
              {[0, 0.8, 1.6, 2.4, 3.2].map((delay, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border-2"
                  style={{
                    width: `${100 + i * 100}px`,
                    height: `${100 + i * 100}px`,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    borderColor: 'rgba(80, 32, 232, 0.15)',
                    opacity: 0,
                    animation: 'waveExpand 4s ease-out infinite',
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>

            {/* Team Voices - 8 positions around the center */}
            {[
              { label: 'Tech Stack', position: 'top-[15%] left-[17%]', delay: '0s' },
              { label: 'CI/CD', position: 'top-[9%] left-1/2 -translate-x-1/2', delay: '0.3s' },
              { label: 'GitOps', position: 'top-[15%] right-[17%]', delay: '0.6s' },
              { label: 'Security', position: 'top-1/2 left-[6%] -translate-y-1/2', delay: '0.9s' },
              { label: 'Monitoring', position: 'top-1/2 right-[6%] -translate-y-1/2', delay: '1.2s' },
              { label: 'Pain Points', position: 'bottom-[15%] left-[17%]', delay: '1.5s' },
              { label: 'Cost Control', position: 'bottom-[9%] left-1/2 -translate-x-1/2', delay: '1.8s' },
              { label: 'Alert Hell', position: 'bottom-[15%] right-[17%]', delay: '2.1s' },
            ].map((voice, i) => (
              <div
                key={voice.label}
                className={`absolute flex flex-col items-center gap-1 ${voice.position}`}
                style={{ animation: 'voiceFloat 3s ease-in-out infinite', animationDelay: voice.delay }}
              >
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ 
                    background: 'linear-gradient(135deg, #5020e8, #00bcd4)',
                    animation: 'voicePulse 2s ease-in-out infinite',
                    animationDelay: voice.delay,
                  }}
                />
                <span 
                  className="text-xs font-bold text-gray-700 px-2 py-1 rounded-full whitespace-nowrap"
                  style={{ 
                    background: 'rgba(80, 32, 232, 0.08)',
                    border: '1px solid rgba(80, 32, 232, 0.15)',
                  }}
                >
                  {voice.label}
                </span>
              </div>
            ))}

            {/* Connecting Lines SVG */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 600 400" 
              preserveAspectRatio="xMidYMid meet"
              style={{ zIndex: 1 }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5020e8" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#00bcd4" stopOpacity="0.9"/>
                </linearGradient>
              </defs>
              {/* Tech Stack line */}
              <line x1="300" y1="200" x2="100" y2="60" stroke="url(#lineGradient)" strokeWidth="2.5" strokeDasharray="10,5" opacity="0.9" style={{ animation: 'lineDash 2s linear infinite' }} />
              {/* CI/CD line */}
              <line x1="300" y1="200" x2="300" y2="35" stroke="url(#lineGradient)" strokeWidth="2.5" strokeDasharray="10,5" opacity="0.9" style={{ animation: 'lineDash 2s linear infinite 0.25s' }} />
              {/* GitOps line */}
              <line x1="300" y1="200" x2="500" y2="60" stroke="url(#lineGradient)" strokeWidth="2.5" strokeDasharray="10,5" opacity="0.9" style={{ animation: 'lineDash 2s linear infinite 0.5s' }} />
              {/* Security line */}
              <line x1="300" y1="200" x2="35" y2="200" stroke="url(#lineGradient)" strokeWidth="2.5" strokeDasharray="10,5" opacity="0.9" style={{ animation: 'lineDash 2s linear infinite 0.75s' }} />
              {/* Monitoring line */}
              <line x1="300" y1="200" x2="565" y2="200" stroke="url(#lineGradient)" strokeWidth="2.5" strokeDasharray="10,5" opacity="0.9" style={{ animation: 'lineDash 2s linear infinite 1s' }} />
              {/* Pain Points line */}
              <line x1="300" y1="200" x2="100" y2="340" stroke="url(#lineGradient)" strokeWidth="2.5" strokeDasharray="10,5" opacity="0.9" style={{ animation: 'lineDash 2s linear infinite 1.25s' }} />
              {/* Cost Control line */}
              <line x1="300" y1="200" x2="300" y2="365" stroke="url(#lineGradient)" strokeWidth="2.5" strokeDasharray="10,5" opacity="0.9" style={{ animation: 'lineDash 2s linear infinite 1.5s' }} />
              {/* Alert Hell line */}
              <line x1="300" y1="200" x2="500" y2="340" stroke="url(#lineGradient)" strokeWidth="2.5" strokeDasharray="10,5" opacity="0.9" style={{ animation: 'lineDash 2s linear infinite 1.75s' }} />
            </svg>
          </div>

          {/* Text Below Animation */}
          <div className="text-center max-w-2xl mx-auto px-4">
            <p className="text-xl font-bold text-gray-900 mb-2">
              Thinking complex is simple. Making things simple is complex.
            </p>
            <p className="text-gray-600">
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
                background: 'linear-gradient(135deg, #2702a6 0%, #200289 100%)',
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
