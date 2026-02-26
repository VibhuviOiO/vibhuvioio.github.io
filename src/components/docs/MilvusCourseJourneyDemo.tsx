'use client';

import { useState, useEffect } from 'react';
import { Terminal, Pause, Play, Layers, Database, Search, Activity } from 'lucide-react';

const PHASE_DURATION = 4500;

const PHASES = [
  {
    id: 'deploy',
    label: 'Deploy',
    curriculum: 'Phase 2',
    title: 'Choose your deployment mode',
    description:
      'Start with Milvus Lite for development, Standalone for small production, or Distributed with Kubernetes for billion-scale vectors.',
    color: '#3b82f6',
  },
  {
    id: 'dependencies',
    label: 'Dependencies',
    curriculum: 'Phase 3',
    title: 'Configure etcd, MinIO, and Pulsar',
    description:
      'Set up the three pillars: etcd for metadata, MinIO/S3 for object storage, and Pulsar/Kafka for message streaming.',
    color: '#8b5cf6',
  },
  {
    id: 'configure',
    label: 'Configure',
    curriculum: 'Phase 4',
    title: 'Master milvus.yaml',
    description:
      'Learn the 20% of configuration parameters that affect 80% of performance. Tune segments, memory, and rate limits.',
    color: '#f59e0b',
  },
  {
    id: 'data',
    label: 'Data Design',
    curriculum: 'Phase 5',
    title: 'Collections, partitions, and indexes',
    description:
      'Design schemas for your use case. Choose the right index (HNSW, IVF, DISKANN) for your latency/recall requirements.',
    color: '#10b981',
  },
  {
    id: 'scale',
    label: 'Scale',
    curriculum: 'Phase 6',
    title: 'Horizontal scaling and resource planning',
    description:
      'Add Query Nodes for read scaling, Data Nodes for write throughput. Plan resources for your vector count.',
    color: '#ef4444',
  },
  {
    id: 'optimize',
    label: 'Optimize',
    curriculum: 'Phase 7',
    title: 'Query performance tuning',
    description:
      'Optimize search latency with MMAP, cache sizing, and segment management. Balance memory vs speed.',
    color: '#f97316',
  },
  {
    id: 'secure',
    label: 'Secure',
    curriculum: 'Phase 8',
    title: 'Authentication and TLS',
    description:
      'Enable RBAC for multi-tenant access. Configure TLS for inter-service and client communication.',
    color: '#06b6d4',
  },
  {
    id: 'backup',
    label: 'Backup',
    curriculum: 'Phase 9',
    title: 'Disaster recovery and migration',
    description:
      'Backup etcd snapshots and object storage. Test recovery procedures. Cross-cluster migration.',
    color: '#ec4899',
  },
  {
    id: 'observe',
    label: 'Observe',
    curriculum: 'Phase 10',
    title: 'Monitoring and troubleshooting',
    description:
      'Set up metrics, alerts, and dashboards. Debug common issues with logs and traces.',
    color: '#14b8a6',
  },
];

const PERSONAS = [
  {
    role: 'ML Engineer',
    emoji: '🤖',
    points: [
      'Deploy vector stores for your models',
      'Choose indexes for latency/recall tradeoffs',
      'Integrate with embedding pipelines',
    ],
  },
  {
    role: 'Platform Engineer',
    emoji: '⚙️',
    points: [
      'Run reliable vector infrastructure',
      'Scale clusters with growing data',
      'Configure dependencies for HA',
    ],
  },
  {
    role: 'DevOps/SRE',
    emoji: '📡',
    points: [
      'Monitor cluster health and set alerts',
      'Automate backups and disaster recovery',
      'Troubleshoot performance issues',
    ],
  },
  {
    role: 'AI Product Team',
    emoji: '🚀',
    points: [
      'Understand operational constraints',
      'Plan capacity for AI features',
      'Design for multi-tenancy',
    ],
  },
];

// Visual components for each phase
function DeployVisual({ c }: { c: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col gap-2">
        <div className="px-3 py-1.5 rounded border text-[10px] font-mono" style={{ borderColor: `${c}44`, background: `${c}15`, color: c }}>
          Milvus Lite
        </div>
        <div className="px-3 py-1.5 rounded border text-[10px] font-mono" style={{ borderColor: `${c}44`, background: `${c}15`, color: c }}>
          Standalone
        </div>
        <div className="px-3 py-1.5 rounded border text-[10px] font-mono" style={{ borderColor: `${c}44`, background: `${c}15`, color: c }}>
          Distributed
        </div>
      </div>
      <div className="text-lg" style={{ color: c }}>→</div>
      <div 
        className="w-16 h-16 rounded-lg flex items-center justify-center"
        style={{ background: `radial-gradient(circle at 35% 35%, ${c}ee, ${c}77)`, boxShadow: `0 0 14px ${c}33` }}
      >
        <Layers className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}

function DependenciesVisual({ c }: { c: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center gap-1">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: `${c}20`, border: `1px solid ${c}40` }}>
          <Database className="w-5 h-5" style={{ color: c }} />
        </div>
        <span className="text-[8px] text-gray-500">etcd</span>
      </div>
      <div className="w-6 h-px" style={{ background: `${c}60` }} />
      <div className="flex flex-col items-center gap-1">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: `${c}20`, border: `1px solid ${c}40` }}>
          <Activity className="w-5 h-5" style={{ color: c }} />
        </div>
        <span className="text-[8px] text-gray-500">MinIO</span>
      </div>
      <div className="w-6 h-px" style={{ background: `${c}60` }} />
      <div className="flex flex-col items-center gap-1">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: `${c}20`, border: `1px solid ${c}40` }}>
          <Search className="w-5 h-5" style={{ color: c }} />
        </div>
        <span className="text-[8px] text-gray-500">Pulsar</span>
      </div>
    </div>
  );
}

function ConfigureVisual({ c }: { c: string }) {
  const lines = [
    ['segment.maxSize', '1024MB'],
    ['queryNode.cache', '4GB'],
    ['index.type', 'HNSW'],
  ];
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col gap-1 px-3 py-2 rounded-lg border text-[10px] font-mono" style={{ borderColor: `${c}44`, background: `${c}10` }}>
        {lines.map(([k, v], i) => (
          <div key={i}>
            <span style={{ color: c }}>{k}</span>
            <span className="text-gray-600">: </span>
            <span className="text-green-400">{v}</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500">500+<br/>params</div>
    </div>
  );
}

function DataVisual({ c }: { c: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-2 py-1 rounded border text-[9px]" style={{ borderColor: `${c}44`, background: `${c}10` }}>
          <span style={{ color: c }}>📊</span>
          <span className="text-gray-400">Collections</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded border text-[9px]" style={{ borderColor: `${c}44`, background: `${c}10` }}>
          <span style={{ color: c }}>🔍</span>
          <span className="text-gray-400">HNSW Index</span>
        </div>
      </div>
      <div className="text-[10px] text-gray-500">Schema<br/>Design</div>
    </div>
  );
}

function ScaleVisual({ c }: { c: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded flex items-center justify-center text-[9px] font-mono text-white" style={{ background: c }}>QN</div>
        <div className="w-10 h-10 rounded flex items-center justify-center text-[9px] font-mono text-white" style={{ background: c }}>QN</div>
        <div className="w-10 h-10 rounded flex items-center justify-center text-[9px] font-mono text-white" style={{ background: c, opacity: 0.6 }}>+</div>
      </div>
      <span className="text-[9px] text-gray-500">Query Nodes scale reads</span>
    </div>
  );
}

function OptimizeVisual({ c }: { c: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <div className="px-2 py-1 rounded text-[9px]" style={{ background: `${c}20`, color: c }}>Latency</div>
        <div className="text-gray-500">⚡</div>
        <div className="px-2 py-1 rounded text-[9px]" style={{ background: `${c}20`, color: c }}>Recall</div>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-16 h-1.5 rounded-full" style={{ background: `${c}40` }}>
          <div className="h-full rounded-full" style={{ width: '85%', background: c }} />
        </div>
        <span className="text-[8px] text-gray-500">95%</span>
      </div>
    </div>
  );
}

function SecureVisual({ c }: { c: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center border" style={{ borderColor: `${c}44`, background: `${c}10` }}>
        <span className="text-lg">🔐</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[9px] px-2 py-0.5 rounded" style={{ background: `${c}20`, color: c }}>TLS</span>
        <span className="text-[9px] px-2 py-0.5 rounded" style={{ background: `${c}20`, color: c }}>RBAC</span>
      </div>
    </div>
  );
}

function BackupVisual({ c }: { c: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${c}20`, border: `1px solid ${c}40` }}>
          <Database className="w-4 h-4" style={{ color: c }} />
        </div>
        <span className="text-[7px] text-gray-500">etcd</span>
      </div>
      <div className="text-xs" style={{ color: c }}>+</div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${c}20`, border: `1px solid ${c}40` }}>
          <Layers className="w-4 h-4" style={{ color: c }} />
        </div>
        <span className="text-[7px] text-gray-500">MinIO</span>
      </div>
      <div className="text-lg" style={{ color: c }}>→</div>
      <div className="text-[10px] text-gray-400">Backup</div>
    </div>
  );
}

function ObserveVisual({ c }: { c: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        <div className="w-20 h-8 rounded flex items-center justify-center text-[8px]" style={{ background: `${c}20`, color: c }}>
          📊 Metrics
        </div>
        <div className="w-20 h-8 rounded flex items-center justify-center text-[8px]" style={{ background: `${c}20`, color: c }}>
          📋 Logs
        </div>
      </div>
      <div className="text-[9px] text-gray-500">Grafana + Prometheus</div>
    </div>
  );
}

const VISUALS: Record<string, (c: string) => React.ReactNode> = {
  deploy: c => <DeployVisual c={c} />,
  dependencies: c => <DependenciesVisual c={c} />,
  configure: c => <ConfigureVisual c={c} />,
  data: c => <DataVisual c={c} />,
  scale: c => <ScaleVisual c={c} />,
  optimize: c => <OptimizeVisual c={c} />,
  secure: c => <SecureVisual c={c} />,
  backup: c => <BackupVisual c={c} />,
  observe: c => <ObserveVisual c={c} />,
};

export default function MilvusCourseJourneyDemo() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setActive(p => (p + 1) % PHASES.length), PHASE_DURATION);
    return () => clearTimeout(t);
  }, [active, playing]);

  const phase = PHASES[active];

  return (
    <div className="my-8 rounded-xl overflow-hidden border border-gray-700 shadow-xl bg-[#0d1117]">
      {/* Header */}
      <div className="px-5 py-3 bg-[#161b22] border-b border-gray-700 flex items-center justify-between">
        <span className="text-white font-semibold text-sm flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[#7c6af7]" />
          Milvus Operations Journey
        </span>
        <button
          onClick={() => setPlaying(p => !p)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>

      {/* Phase tabs */}
      <div className="flex border-b border-gray-800 overflow-x-auto">
        {PHASES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => {
              setActive(i);
              setPlaying(false);
            }}
            className={`shrink-0 px-3 py-2.5 text-xs font-medium transition-all border-b-2 ${
              active === i ? 'text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
            style={active === i ? { borderColor: p.color, color: p.color } : {}}
          >
            <span className="text-[9px] text-gray-600 block mb-0.5">{p.curriculum}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Main area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[220px] divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
        {/* Visual */}
        <div className="flex items-center justify-center p-6">
          <div key={phase.id} className="flex items-center justify-center w-full h-44">
            {VISUALS[phase.id]?.(phase.color)}
          </div>
        </div>

        {/* Description */}
        <div className="p-6 flex flex-col justify-center gap-3">
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded w-fit"
            style={{ background: `${phase.color}20`, color: phase.color }}
          >
            {phase.curriculum}
          </span>
          <h3 className="text-white font-semibold text-base leading-snug">{phase.title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{phase.description}</p>

          {/* progress dots */}
          <div className="flex gap-1.5 mt-1">
            {PHASES.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setActive(i);
                  setPlaying(false);
                }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === active ? 16 : 6,
                  height: 6,
                  background: i === active ? phase.color : '#374151',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Who is this for */}
      <div className="border-t border-gray-800 p-5">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Who is this course for
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PERSONAS.map(persona => (
            <div key={persona.role} className="rounded-lg border border-gray-700 bg-[#161b22] p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{persona.emoji}</span>
                <span className="text-xs font-semibold text-white leading-tight">{persona.role}</span>
              </div>
              <ul className="space-y-1">
                {persona.points.map((pt, i) => (
                  <li key={i} className="text-[11px] text-gray-500 flex items-start gap-1.5">
                    <span className="text-[#7c6af7] mt-0.5 shrink-0">›</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
