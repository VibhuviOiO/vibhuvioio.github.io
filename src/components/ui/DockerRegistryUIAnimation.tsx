'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Container,
  Shield,
  Search,
  Trash2,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Package,
  Tag,
  User,
} from 'lucide-react';

const PHASES = [
  {
    id: 'browse',
    step: 1,
    title: 'Browse Your Registry',
    description: 'Connect Docker Registry UI to any Docker Registry v2 API and explore repositories, tags, and image layers.',
    active: ['user', 'ui', 'registry'],
    flow: 'registry → ui',
    badge: { icon: 'search', text: 'nginx:latest, redis:alpine...' },
  },
  {
    id: 'scan',
    step: 2,
    title: 'Scan for Vulnerabilities',
    description: 'Click Scan on any tag. The image is analyzed by Trivy and results are shown as severity badges with CVE details.',
    active: ['user', 'ui', 'trivy'],
    flow: 'ui → trivy',
    badge: { icon: 'shield', text: 'Critical 2 · High 5 · Medium 12' },
  },
  {
    id: 'cleanup',
    step: 3,
    title: 'Clean Up Images',
    description: 'Use bulk operations to delete tags by pattern, age, or retention policy — with a safe dry-run preview first.',
    active: ['user', 'ui', 'registry'],
    flow: 'ui → registry',
    badge: { icon: 'trash', text: 'Delete 12 tags matching dev-*' },
  },
];

export default function DockerRegistryUIAnimation() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const phase = PHASES[phaseIndex];

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      {/* Soft background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-cyan-300/10 blur-3xl" />

      {/* Architecture diagram */}
      <div className="relative h-[320px]">
        {/* User */}
        <Node
          icon={<User className="w-6 h-6 text-white" />}
          label="You"
          position={{ top: '0%', left: '50%' }}
          active={phase.active.includes('user')}
        />

        {/* Registry UI - center */}
        <Node
          icon={
            <Image
              src="/img/docker-registry-ui/docker-registry-ui.svg"
              alt="Docker Registry UI"
              width={44}
              height={44}
              className="drop-shadow-md"
            />
          }
          label="Registry UI"
          position={{ top: '40%', left: '50%' }}
          active={phase.active.includes('ui')}
          isMain
        />

        {/* Docker Registry - left */}
        <Node
          icon={<Container className="w-7 h-7 text-white" />}
          label="Docker Registry"
          position={{ top: '40%', left: '12%' }}
          active={phase.active.includes('registry')}
        />

        {/* Trivy - right */}
        <Node
          icon={<Shield className="w-7 h-7 text-white" />}
          label="Trivy Scanner"
          position={{ top: '40%', left: '88%' }}
          active={phase.active.includes('trivy')}
        />

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <marker id="arr-ui-registry" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill={phase.flow.includes('registry') ? '#60a5fa' : 'rgba(255,255,255,0.25)'} />
            </marker>
            <marker id="arr-ui-trivy" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill={phase.flow.includes('trivy') ? '#f87171' : 'rgba(255,255,255,0.25)'} />
            </marker>
            <marker id="arr-user-ui" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill={phase.active.includes('user') ? '#a78bfa' : 'rgba(255,255,255,0.25)'} />
            </marker>
          </defs>

          {/* User → UI */}
          <line
            x1="50%" y1="60" x2="50%" y2="130"
            stroke={phase.active.includes('user') ? '#a78bfa' : 'rgba(255,255,255,0.2)'}
            strokeWidth="2"
            className="transition-colors duration-700"
            markerEnd="url(#arr-user-ui)"
          />

          {/* Registry ↔ UI */}
          <line
            x1="22%" y1="160" x2="42%" y2="160"
            stroke={phase.flow.includes('registry') ? '#60a5fa' : 'rgba(255,255,255,0.2)'}
            strokeWidth="2"
            className="transition-colors duration-700"
            markerEnd="url(#arr-ui-registry)"
          />

          {/* UI → Trivy */}
          <line
            x1="58%" y1="160" x2="78%" y2="160"
            stroke={phase.flow.includes('trivy') ? '#f87171' : 'rgba(255,255,255,0.2)'}
            strokeWidth="2"
            className="transition-colors duration-700"
            markerEnd="url(#arr-ui-trivy)"
          />
        </svg>

        {/* Animated packet */}
        <Packet phase={phase} />

        {/* Feature badge */}
        <FeatureBadge phase={phase} />
      </div>

      {/* Caption - light text for dark hero background */}
      <div className="text-center mt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold mb-3">
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
            {phase.step}
          </span>
          Step {phase.step} of {PHASES.length}
        </div>
        <h3 className="text-xl font-bold text-white drop-shadow-lg mb-2">{phase.title}</h3>
        <p className="text-sm text-white/80 drop-shadow-md max-w-md mx-auto leading-relaxed">
          {phase.description}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-5">
        {PHASES.map((_, i) => (
          <button
            key={i}
            onClick={() => setPhaseIndex(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === phaseIndex ? 24 : 8,
              height: 8,
              background: i === phaseIndex ? '#ffffff' : 'rgba(255,255,255,0.35)',
            }}
            aria-label={`Show phase ${i + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes packetMoveRegistry {
          0% { left: 22%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 42%; opacity: 0; }
        }
        @keyframes packetMoveTrivy {
          0% { left: 58%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 78%; opacity: 0; }
        }
        @keyframes packetMoveCleanup {
          0% { left: 42%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 22%; opacity: 0; }
        }
        @keyframes packetMoveUser {
          0% { top: 60px; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 122px; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function Node({
  icon,
  label,
  position,
  active,
  isMain,
}: {
  icon: React.ReactNode;
  label: string;
  position: { top: string; left: string };
  active: boolean;
  isMain?: boolean;
}) {
  return (
    <div
      className="absolute flex flex-col items-center z-10 transition-all duration-700"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, -50%)',
        opacity: active ? 1 : 0.55,
      }}
    >
      <div
        className={`rounded-2xl flex items-center justify-center border-2 transition-all duration-700 ${
          isMain ? 'w-24 h-24' : 'w-18 h-18'
        } ${active ? 'scale-110' : 'scale-100'}`}
        style={{
          backgroundColor: active
            ? isMain
              ? 'rgba(255,255,255,0.2)'
              : 'rgba(255,255,255,0.15)'
            : 'rgba(255,255,255,0.08)',
          borderColor: active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)',
          boxShadow: active
            ? '0 0 40px rgba(255,255,255,0.25), inset 0 0 20px rgba(255,255,255,0.1)'
            : '0 8px 24px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {icon}
      </div>
      <span className="mt-3 text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

function Packet({ phase }: { phase: (typeof PHASES)[number] }) {
  const animations: Record<string, { animation: string; color: string; top: string }> = {
    'registry → ui': { animation: 'packetMoveRegistry 2s ease-in-out infinite', color: '#60a5fa', top: '160px' },
    'ui → trivy': { animation: 'packetMoveTrivy 2s ease-in-out infinite', color: '#f87171', top: '160px' },
    'ui → registry': { animation: 'packetMoveCleanup 2s ease-in-out infinite', color: '#60a5fa', top: '172px' },
  };

  const cfg = animations[phase.flow];
  if (!cfg) return null;

  return (
    <div
      className="absolute w-3 h-3 rounded-full pointer-events-none z-20"
      style={{
        top: cfg.top,
        backgroundColor: cfg.color,
        boxShadow: `0 0 14px ${cfg.color}`,
        animation: cfg.animation,
      }}
    />
  );
}

function FeatureBadge({ phase }: { phase: (typeof PHASES)[number] }) {
  const icons = {
    search: <Search className="w-3.5 h-3.5" />,
    shield: <Shield className="w-3.5 h-3.5" />,
    trash: <Trash2 className="w-3.5 h-3.5" />,
  };

  const colors = {
    browse: { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(96, 165, 250, 0.5)', text: '#bfdbfe' },
    scan: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(248, 113, 113, 0.5)', text: '#fecaca' },
    cleanup: { bg: 'rgba(14, 165, 233, 0.2)', border: 'rgba(56, 189, 248, 0.5)', text: '#bae6fd' },
  };

  const c = colors[phase.id as keyof typeof colors];

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[72%] z-20">
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-md border shadow-xl transition-all duration-700"
        style={{
          backgroundColor: c.bg,
          borderColor: c.border,
          color: c.text,
        }}
      >
        {phase.badge.icon === 'search' && icons.search}
        {phase.badge.icon === 'shield' && icons.shield}
        {phase.badge.icon === 'trash' && icons.trash}
        {phase.badge.text}
      </div>
    </div>
  );
}
