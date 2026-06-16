'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Shield,
  Search,
  Trash2,
  Layers,
  Globe,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Package,
  Tag,
  FileSearch,
} from 'lucide-react';

const PHASES = [
  {
    id: 'browse',
    title: 'Browse Images',
    description: 'Connect to any Docker Registry v2 and explore repositories, tags, and layers in a clean web UI.',
    active: ['registry', 'ui'],
    arrow: 'registry-ui',
  },
  {
    id: 'scan',
    title: 'Scan for CVEs',
    description: 'Send any image to the built-in or remote Trivy scanner and see vulnerabilities by severity.',
    active: ['ui', 'trivy'],
    arrow: 'ui-trivy',
  },
  {
    id: 'cleanup',
    title: 'Clean Up',
    description: 'Bulk delete old tags by pattern, age, or retention policy with a safe dry-run mode.',
    active: ['ui', 'registry'],
    arrow: 'ui-registry',
  },
];

export default function DockerRegistryUIAnimation() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const phase = PHASES[phaseIndex];

  return (
    <div className="relative w-full max-w-xl mx-auto select-none">
      {/* Soft background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2702a6]/10 via-transparent to-cyan-500/10 blur-3xl" />

      {/* Stage */}
      <div className="relative h-[360px]">
        {/* Left: Docker Registry */}
        <Node
          icon={<Container className="w-8 h-8 text-sky-600" />}
          label="Docker Registry"
          sublabel="your images"
          position="left"
          active={phase.active.includes('registry')}
        />

        {/* Center: Registry UI Browser */}
        <Node
          icon={<Globe className="w-8 h-8 text-[#2702a6]" />}
          label="Registry UI"
          sublabel="web interface"
          position="center"
          active={phase.active.includes('ui')}
          isMain
        />

        {/* Right: Trivy Scanner */}
        <Node
          icon={<Shield className="w-8 h-8 text-red-500" />}
          label="Trivy Scanner"
          sublabel="CVE detection"
          position="right"
          active={phase.active.includes('trivy')}
        />

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <marker id="arrow-registry-ui" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill={phase.arrow === 'registry-ui' ? '#2702a6' : '#cbd5e1'} />
            </marker>
            <marker id="arrow-ui-trivy" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill={phase.arrow === 'ui-trivy' ? '#ef4444' : '#cbd5e1'} />
            </marker>
            <marker id="arrow-ui-registry" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill={phase.arrow === 'ui-registry' ? '#0ea5e9' : '#cbd5e1'} />
            </marker>
          </defs>

          {/* Registry ↔ UI */}
          <line
            x1="105" y1="180" x2="210" y2="180"
            stroke={phase.arrow === 'registry-ui' || phase.arrow === 'ui-registry' ? '#2702a6' : '#cbd5e1'}
            strokeWidth="2"
            className="transition-colors duration-700"
            markerEnd="url(#arrow-registry-ui)"
          />

          {/* UI → Trivy */}
          <line
            x1="290" y1="180" x2="395" y2="180"
            stroke={phase.arrow === 'ui-trivy' ? '#ef4444' : '#cbd5e1'}
            strokeWidth="2"
            className="transition-colors duration-700"
            markerEnd="url(#arrow-ui-trivy)"
          />
        </svg>

        {/* Animated packet */}
        <Packet phase={phase} />

        {/* Feature mini-cards near UI */}
        <FeatureBadge phase={phase} />
      </div>

      {/* Caption */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{phase.title}</h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto">{phase.description}</p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-4">
        {PHASES.map((_, i) => (
          <button
            key={i}
            onClick={() => setPhaseIndex(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === phaseIndex ? 22 : 7,
              height: 7,
              background: i === phaseIndex ? '#2702a6' : '#d1d5db',
            }}
            aria-label={`Show phase ${i + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes packetMove {
          0% { transform: translateX(0) scale(0.8); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(var(--dx)) scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function Node({
  icon,
  label,
  sublabel,
  position,
  active,
  isMain,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  position: 'left' | 'center' | 'right';
  active: boolean;
  isMain?: boolean;
}) {
  const posClasses = {
    left: 'left-0 top-1/2 -translate-y-1/2',
    center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    right: 'right-0 top-1/2 -translate-y-1/2',
  };

  return (
    <div className={`absolute flex flex-col items-center ${posClasses[position]} z-10`}>
      <div
        className={`rounded-2xl flex items-center justify-center shadow-lg border-2 transition-all duration-700 ${
          isMain ? 'w-24 h-24' : 'w-20 h-20'
        } ${active ? 'scale-110' : 'opacity-70 scale-100'}`}
        style={{
          backgroundColor: active ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.85)',
          borderColor: active ? '#2702a6' : 'rgba(226, 232, 240, 0.9)',
          boxShadow: active ? '0 0 30px rgba(39, 2, 166, 0.2)' : '0 10px 25px -5px rgba(0,0,0,0.1)',
        }}
      >
        {icon}
      </div>
      <div className="mt-3 text-center">
        <div className="text-sm font-bold text-white drop-shadow-md">{label}</div>
        <div className="text-xs text-white/80 drop-shadow-md">{sublabel}</div>
      </div>
    </div>
  );
}

function Packet({ phase }: { phase: (typeof PHASES)[number] }) {
  const config: Record<string, { start: string; dx: string; color: string }> = {
    'registry-ui': { start: 'left-[105px] top-[174px]', dx: '105px', color: '#2702a6' },
    'ui-trivy': { start: 'left-[290px] top-[174px]', dx: '105px', color: '#ef4444' },
    'ui-registry': { start: 'left-[290px] top-[186px]', dx: '-105px', color: '#0ea5e9' },
  };

  const cfg = config[phase.arrow];
  if (!cfg) return null;

  return (
    <div
      className={`absolute w-3 h-3 rounded-full z-20 ${cfg.start}`}
      style={{
        backgroundColor: cfg.color,
        boxShadow: `0 0 12px ${cfg.color}`,
        '--dx': cfg.dx,
        animation: 'packetMove 1.8s ease-in-out infinite',
      } as React.CSSProperties}
    />
  );
}

function FeatureBadge({ phase }: { phase: (typeof PHASES)[number] }) {
  const configs: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
    browse: {
      icon: <Search className="w-3 h-3" />,
      label: 'Browse repos & tags',
      color: 'text-[#2702a6]',
      bg: 'bg-white/95',
    },
    scan: {
      icon: <AlertTriangle className="w-3 h-3" />,
      label: 'Critical: 2  High: 5',
      color: 'text-red-600',
      bg: 'bg-white/95',
    },
    cleanup: {
      icon: <Trash2 className="w-3 h-3" />,
      label: 'Dry-run delete 12 tags',
      color: 'text-sky-600',
      bg: 'bg-white/95',
    },
  };

  const cfg = configs[phase.id];
  if (!cfg) return null;

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[60px] z-20">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border transition-all duration-700 ${cfg.color} ${cfg.bg}`}
        style={{ borderColor: phase.id === 'scan' ? '#fecaca' : phase.id === 'cleanup' ? '#bae6fd' : '#c4b5fd' }}
      >
        {cfg.icon}
        {cfg.label}
      </div>
    </div>
  );
}
