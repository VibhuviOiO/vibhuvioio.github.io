'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Shield, 
  Search, 
  Trash2, 
  Layers, 
  Server,
  Globe,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const PHASES = [
  {
    id: 'browse',
    title: 'Browse Images',
    description: 'Connect to your registry and explore repositories, tags, and layers.',
    highlight: ['registry', 'ui'],
    flows: [{ from: 'registry', to: 'ui', label: 'repos & tags' }],
  },
  {
    id: 'scan',
    title: 'Scan for CVEs',
    description: 'Click Scan to send any image to Trivy and get vulnerability details.',
    highlight: ['ui', 'trivy'],
    flows: [{ from: 'ui', to: 'trivy', label: 'scan image' }, { from: 'trivy', to: 'ui', label: 'CVE report' }],
  },
  {
    id: 'cleanup',
    title: 'Clean Up',
    description: 'Bulk delete old tags by pattern, age, or retention policy.',
    highlight: ['ui', 'registry'],
    flows: [{ from: 'ui', to: 'registry', label: 'delete tags' }],
  },
];

export default function DockerRegistryUIAnimation() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const phase = PHASES[phaseIndex];
  const isHighlighted = (id: string) => phase.highlight.includes(id);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Subtle glow behind the animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2702a6]/10 via-transparent to-cyan-500/10 blur-3xl" />
      
      {/* Animation stage */}
      <div className="relative h-[420px] w-full">
        
        {/* Browser / User */}
        <div 
          className={`absolute top-0 left-1/2 -translate-x-1/2 transition-all duration-700 ${isHighlighted('ui') ? 'scale-105' : 'opacity-80'}`}
        >
          <div className="flex flex-col items-center">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-colors duration-700"
              style={{
                backgroundColor: isHighlighted('ui') ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.8)',
                borderColor: isHighlighted('ui') ? '#3b82f6' : 'rgba(226, 232, 240, 0.8)',
              }}
            >
              <Globe className="w-9 h-9 text-[#2702a6]" />
            </div>
            <span className="mt-2 text-xs font-semibold text-gray-600">Registry UI</span>
          </div>
        </div>

        {/* Docker Registry */}
        <div 
          className={`absolute bottom-12 left-0 transition-all duration-700 ${isHighlighted('registry') ? 'scale-105' : 'opacity-80'}`}
        >
          <div className="flex flex-col items-center">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-colors duration-700"
              style={{
                backgroundColor: isHighlighted('registry') ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255,255,255,0.8)',
                borderColor: isHighlighted('registry') ? '#0ea5e9' : 'rgba(226, 232, 240, 0.8)',
              }}
            >
              <Container className="w-9 h-9 text-sky-600" />
            </div>
            <span className="mt-2 text-xs font-semibold text-gray-600">Docker Registry</span>
          </div>
        </div>

        {/* Trivy Scanner */}
        <div 
          className={`absolute bottom-12 right-0 transition-all duration-700 ${isHighlighted('trivy') ? 'scale-105' : 'opacity-80'}`}
        >
          <div className="flex flex-col items-center">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-colors duration-700"
              style={{
                backgroundColor: isHighlighted('trivy') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.8)',
                borderColor: isHighlighted('trivy') ? '#ef4444' : 'rgba(226, 232, 240, 0.8)',
              }}
            >
              <Shield className="w-9 h-9 text-red-500" />
            </div>
            <span className="mt-2 text-xs font-semibold text-gray-600">Trivy Scanner</span>
          </div>
        </div>

        {/* Central Hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#2702a6] to-[#3d0fd4] flex items-center justify-center shadow-2xl animate-pulse">
              <Server className="w-12 h-12 text-white" />
            </div>
            
            {/* Orbiting icons */}
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center animate-bounce">
              <Search className="w-4 h-4 text-[#2702a6]" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center animate-bounce" style={{ animationDelay: '1s' }}>
              <Layers className="w-4 h-4 text-sky-600" />
            </div>
          </div>
        </div>

        {/* Animated flow lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#2702a6" />
            </marker>
          </defs>
          
          {/* UI to Registry */}
          <path
            d="M 140 340 Q 200 280 250 230"
            fill="none"
            stroke={phase.id === 'browse' || phase.id === 'cleanup' ? '#2702a6' : '#e2e8f0'}
            strokeWidth="2"
            strokeDasharray="6,4"
            className="transition-colors duration-700"
          />
          
          {/* UI to Trivy */}
          <path
            d="M 380 340 Q 320 280 270 230"
            fill="none"
            stroke={phase.id === 'scan' ? '#ef4444' : '#e2e8f0'}
            strokeWidth="2"
            strokeDasharray="6,4"
            className="transition-colors duration-700"
          />
          
          {/* User to UI */}
          <line
            x1="250" y1="90" x2="250" y2="140"
            stroke={isHighlighted('ui') ? '#2702a6' : '#e2e8f0'}
            strokeWidth="2"
            strokeDasharray="6,4"
            className="transition-colors duration-700"
          />
        </svg>

        {/* Floating particles */}
        {phase.flows.map((flow, idx) => (
          <FlowParticle key={`${phase.id}-${idx}`} flow={flow} />
        ))}

        {/* Feature badges that appear per phase */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full text-center">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-700 shadow-sm"
            style={{
              backgroundColor: phase.id === 'scan' ? 'rgba(239, 68, 68, 0.1)' : phase.id === 'cleanup' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(39, 2, 166, 0.1)',
              color: phase.id === 'scan' ? '#dc2626' : phase.id === 'cleanup' ? '#0284c7' : '#2702a6',
            }}
          >
            {phase.id === 'scan' && <AlertTriangle className="w-4 h-4" />}
            {phase.id === 'cleanup' && <Trash2 className="w-4 h-4" />}
            {phase.id === 'browse' && <Search className="w-4 h-4" />}
            {phase.title}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-center text-sm text-gray-600 mt-4 max-w-sm mx-auto">
        {phase.description}
      </p>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-4">
        {PHASES.map((_, i) => (
          <button
            key={i}
            onClick={() => setPhaseIndex(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === phaseIndex ? 20 : 6,
              height: 6,
              background: i === phaseIndex ? '#2702a6' : '#d1d5db',
            }}
            aria-label={`Show phase ${i + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes flowParticle {
          0% { offset-distance: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function FlowParticle({ flow }: { flow: { from: string; to: string; label: string } }) {
  const color = flow.label.includes('scan') || flow.label.includes('CVE') ? '#ef4444' : '#2702a6';
  
  const getPath = () => {
    if (flow.from === 'registry' && flow.to === 'ui') {
      return "path('M 60 360 Q 140 280 220 220')";
    }
    if (flow.from === 'ui' && flow.to === 'trivy') {
      return "path('M 280 220 Q 360 280 440 360')";
    }
    if (flow.from === 'trivy' && flow.to === 'ui') {
      return "path('M 440 360 Q 360 300 280 220')";
    }
    if (flow.from === 'ui' && flow.to === 'registry') {
      return "path('M 220 220 Q 160 280 80 340')";
    }
    return "";
  };

  return (
    <div
      className="absolute w-3 h-3 rounded-full pointer-events-none"
      style={{
        backgroundColor: color,
        boxShadow: `0 0 12px ${color}`,
        offsetPath: getPath(),
        offsetRotate: '0deg',
        animation: 'flowParticle 2s ease-in-out infinite',
      }}
    />
  );
}
