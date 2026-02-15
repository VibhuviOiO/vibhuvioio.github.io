'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const rotatingPhrases = [
  'Infrastructure Boring.',
  'Deployments Seamless.',
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
          backgroundColor: '#ffffff',
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      >
        {/* Radial gradient spotlight effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(47, 2, 196, 0.08) 0%, transparent 50%)',
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
            background: 'radial-gradient(circle, rgba(0, 188, 212, 0.05) 0%, transparent 70%)',
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
              <div className="absolute h-16 w-16 rounded-full flex items-center justify-center shadow-2xl z-10" style={{ background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)' }}>
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

      {/* Sleep Soundly - Conscious Operations */}
      <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Moon Animation */}
            <div className="relative flex h-80 items-center justify-center order-2 lg:order-1">
              <div className="relative">
                {/* Pulse rings */}
                <div className="absolute inset-0 h-32 w-32 -m-8 rounded-full border border-purple-200 animate-[pulse-ring_3s_ease-out_infinite]"></div>
                <div className="absolute inset-0 h-32 w-32 -m-8 rounded-full border border-purple-200 animate-[pulse-ring_3s_ease-out_infinite_1s]"></div>
                <div className="absolute inset-0 h-32 w-32 -m-8 rounded-full border border-purple-100 animate-[pulse-ring_3s_ease-out_infinite_2s]"></div>
                
                {/* Moon */}
                <div className="relative h-16 w-16 rounded-full flex items-center justify-center shadow-2xl" style={{ background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)' }}>
                  <span className="text-2xl text-white">☽</span>
                </div>
                
                {/* Floating Z's */}
                <span className="absolute -top-8 -right-4 text-[#5020e8] text-sm animate-[float_3s_ease-in-out_infinite]">Z</span>
                <span className="absolute -top-12 right-0 text-[#8a5ff3] text-xs animate-[float_3s_ease-in-out_infinite_0.5s]">z</span>
                <span className="absolute top-0 -right-8 text-[#8a5ff3] text-xs animate-[float_3s_ease-in-out_infinite_1s]">Z</span>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: 'rgba(47, 2, 196, 0.1)', color: '#2f02c4' }}>
                Zero Stress Ops
              </span>
              <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                Sleep Soundly
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Stable by default. No firefighting. No 3 AM pages. No deployment anxiety.
                Proactive monitoring with automated remediation.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)' }}>🛡</span>
                  <span className="text-gray-700">Stable by default. No firefighting.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #8a5ff3 0%, #5020e8 100%)' }}>☾</span>
                  <span className="text-gray-700">No 3 AM pages. No deployment anxiety.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #00bcd4 0%, #5020e8 100%)' }}>✓</span>
                  <span className="text-gray-700">Proactive monitoring. Automated remediation.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built on Industry Standards */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              Reliability First
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Built on Industry Standards
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-600">
                Every system is measured against real reliability targets — 
                not just uptime numbers, but SLAs, SLOs, and SLIs that your 
                business can depend on.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full px-4 py-2 text-sm text-white" style={{ background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)' }}>Error Budgets</span>
                <span className="rounded-full px-4 py-2 text-sm text-white" style={{ background: 'linear-gradient(135deg, #8a5ff3 0%, #5020e8 100%)' }}>Latency Targets</span>
                <span className="rounded-full px-4 py-2 text-sm text-white" style={{ background: 'linear-gradient(135deg, #00bcd4 0%, #5020e8 100%)' }}>Availability Guarantees</span>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm">
                <span className="px-2 py-1 rounded text-white" style={{ background: '#2f02c4' }}>SLA</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 rounded text-white" style={{ background: '#5020e8' }}>SLO</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 rounded text-white" style={{ background: '#8a5ff3' }}>SLI</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 rounded text-white" style={{ background: 'linear-gradient(135deg, #00bcd4 0%, #5020e8 100%)' }}>Uptime Observability</span>
              </div>
            </div>
            
            {/* Target Animation */}
            <div className="relative flex h-80 items-center justify-center">
              <div className="absolute h-48 w-48 rounded-full border border-gray-200"></div>
              <div className="absolute h-32 w-32 rounded-full border border-gray-200"></div>
              <div className="absolute h-16 w-16 rounded-full border border-gray-200"></div>
              <div className="absolute h-8 w-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5020e8 0%, #2f02c4 100%)' }}>
                <span className="text-white font-bold">✓</span>
              </div>
              
              {/* Orbiting labels */}
              <span className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-[#2f02c4] animate-[voice-pulse_2s_ease-in-out_infinite]">SLA</span>
              <span className="absolute bottom-4 left-1/4 text-xs text-[#5020e8] animate-[voice-pulse_2s_ease-in-out_infinite_0.3s]">SLO</span>
              <span className="absolute bottom-4 right-1/4 text-xs text-[#8a5ff3] animate-[voice-pulse_2s_ease-in-out_infinite_0.6s]">SLI</span>
              <span className="absolute top-1/3 right-8 text-xs text-gray-400">99.9%</span>
              <span className="absolute top-1/2 -right-4 text-xs text-gray-400">Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* We Listen to Your Team */}
      <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white">
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
      <section className="py-20 bg-white">
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
