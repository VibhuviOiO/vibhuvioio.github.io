'use client';

import { useState, useEffect } from 'react';
import { Terminal, Pause, Play } from 'lucide-react';

const PHASE_DURATION = 3800;

const PHASES = [
  {
    id: 'deploy',
    label: 'Deploy',
    curriculum: 'Phase 2',
    title: 'Spin up your first node',
    description:
      'Pull the Docker image, write a 20-line docker-compose.yml, run one command. Elasticsearch is up on port 9200.',
    color: '#3b82f6',
  },
  {
    id: 'configure',
    label: 'Configure',
    curriculum: 'Phase 3',
    title: 'Tune it for your environment',
    description:
      'Set JVM heap, lock memory, configure discovery and network host. Learn what every line in elasticsearch.yml actually does.',
    color: '#8b5cf6',
  },
  {
    id: 'index',
    label: 'Index Data',
    curriculum: 'Phase 4',
    title: 'Store and search documents',
    description:
      'Create indices with explicit mappings, index JSON documents, run full-text and keyword queries via the REST API.',
    color: '#10b981',
  },
  {
    id: 'scale',
    label: 'Scale',
    curriculum: 'Phase 5',
    title: 'Build a production cluster',
    description:
      'Add nodes and watch shards redistribute automatically. Kill a node — the cluster stays healthy. Add replicas for read scaling.',
    color: '#f59e0b',
  },
  {
    id: 'secure',
    label: 'Secure',
    curriculum: 'Phase 7',
    title: 'TLS + role-based access',
    description:
      'Generate CA and node certificates, enable xpack.security, create users with granular index-level permissions.',
    color: '#ef4444',
  },
  {
    id: 'ship',
    label: 'Ship Data',
    curriculum: 'Phase 8',
    title: 'Build Logstash pipelines',
    description:
      'Pull from MongoDB, migrate between clusters, stream from S3 — each pipeline is input → filter → output.',
    color: '#f97316',
  },
  {
    id: 'observe',
    label: 'Observe',
    curriculum: 'Phases 9–10',
    title: 'Collect metrics, build dashboards',
    description:
      'Deploy Filebeat for logs and Metricbeat for system stats. Visualise everything in Kibana dashboards.',
    color: '#06b6d4',
  },
];

const PERSONAS = [
  {
    role: 'DevOps / Platform',
    emoji: '⚙️',
    points: [
      'Deploy and upgrade clusters without downtime',
      'Configure ILM policies and snapshots',
      'Tune JVM and OS settings for production',
    ],
  },
  {
    role: 'Backend Developer',
    emoji: '💻',
    points: [
      'Design mappings that fit your data model',
      'Write match, term, bool, and range queries',
      'Use the REST API directly — no SDK needed',
    ],
  },
  {
    role: 'Data Engineer',
    emoji: '🔄',
    points: [
      'Build Logstash pipelines from any source',
      'Migrate data between clusters live',
      'Connect MongoDB, S3, and Kafka',
    ],
  },
  {
    role: 'SRE',
    emoji: '📡',
    points: [
      'Read slow logs and hot thread dumps',
      'Monitor cluster health and set alerts',
      'Plan and test backup and recovery',
    ],
  },
];

// ── Node ─────────────────────────────────────────────────────────────────────

function Node({ label, color, size = 52 }: { label: string; color: string; size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full font-mono font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 35%, ${color}ee, ${color}77)`,
        boxShadow: `0 0 0 1.5px ${color}55, 0 0 14px ${color}33`,
        fontSize: size * 0.22,
      }}
    >
      {label}
      <span
        className="absolute inset-0 rounded-full animate-ping opacity-[0.15]"
        style={{ background: color }}
      />
    </div>
  );
}

// ── Arrow ────────────────────────────────────────────────────────────────────

function Arrow({ color, label }: { color: string; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0">
      {label && <span className="text-[9px] font-mono text-gray-600 whitespace-nowrap">{label}</span>}
      <div className="flex items-center">
        <div className="h-px w-8" style={{ background: `linear-gradient(90deg, transparent, ${color}99)` }} />
        <span className="text-[10px]" style={{ color }}>▶</span>
      </div>
    </div>
  );
}

// ── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, emoji, color }: { label: string; emoji: string; color: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium text-white/70 border"
      style={{ borderColor: `${color}44`, background: `${color}15` }}
    >
      <span>{emoji}</span>
      <span className="font-mono">{label}</span>
    </div>
  );
}

// ── Phase visuals ─────────────────────────────────────────────────────────────

function DeployVisual({ c }: { c: string }) {
  return (
    <div className="flex items-center gap-5">
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-2xl">
          💻
        </div>
        <span className="text-[9px] text-gray-600 font-mono">you</span>
      </div>
      <Arrow color={c} label="docker compose up" />
      <div className="flex flex-col items-center gap-1.5">
        <Node label="ES" color={c} size={58} />
        <div className="flex items-center gap-1 text-[10px] font-mono" style={{ color: c }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          healthy
        </div>
      </div>
    </div>
  );
}

function ConfigureVisual({ c }: { c: string }) {
  const lines = [
    ['node.name', 'my-node'],
    ['heap.size', '4g'],
    ['memory_lock', 'true'],
    ['xpack', 'false'],
  ];
  return (
    <div className="flex items-center gap-4">
      <div
        className="flex flex-col gap-1 px-3 py-2 rounded-lg border text-[10px] font-mono"
        style={{ borderColor: `${c}44`, background: `${c}10` }}
      >
        {lines.map(([k, v], i) => (
          <div key={i}>
            <span style={{ color: c }}>{k}</span>
            <span className="text-gray-600"> = </span>
            <span className="text-green-400">{v}</span>
          </div>
        ))}
      </div>
      <Arrow color={c} />
      <Node label="ES" color={c} size={54} />
    </div>
  );
}

function IndexVisual({ c }: { c: string }) {
  const docs = ['{ name: "Alice" }', '{ city: "NYC" }', '{ role: "eng" }'];
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col gap-1.5">
        {docs.map((doc, i) => (
          <div
            key={i}
            className="px-2 py-0.5 rounded text-[10px] font-mono text-gray-400 border"
            style={{ borderColor: `${c}44`, background: `${c}12` }}
          >
            {doc}
          </div>
        ))}
      </div>
      <Arrow color={c} />
      <div className="flex flex-col items-center gap-1">
        <Node label="ES" color={c} size={54} />
        <span className="text-[9px] font-mono text-gray-600">index: users</span>
      </div>
    </div>
  );
}

function ScaleVisual({ c }: { c: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <Node label="N1" color={c} size={46} />
        <div className="h-px w-8 rounded" style={{ background: `${c}66` }} />
        <Node label="N2" color={c} size={46} />
      </div>
      <div className="w-px h-7 rounded" style={{ background: `${c}66` }} />
      <Node label="N3" color={c} size={46} />
      <span className="text-[10px] font-mono text-gray-600 mt-1">3 nodes · shards balanced</span>
    </div>
  );
}

function SecureVisual({ c }: { c: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Node label="N1" color={c} size={46} />
          <span className="absolute -top-1 -right-1 text-xs">🔒</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[8px] font-mono" style={{ color: c }}>TLS</span>
          <div className="h-px w-7" style={{ background: `${c}77` }} />
        </div>
        <div className="relative">
          <Node label="N2" color={c} size={46} />
          <span className="absolute -top-1 -right-1 text-xs">🔒</span>
        </div>
      </div>
      <div className="w-px h-6" style={{ background: `${c}66` }} />
      <div className="relative">
        <Node label="N3" color={c} size={46} />
        <span className="absolute -top-1 -right-1 text-xs">🔒</span>
      </div>
      <span className="text-[10px] font-mono text-gray-600">mTLS between all nodes</span>
    </div>
  );
}

function ShipVisual({ c }: { c: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col gap-2">
        <Chip label="MongoDB" emoji="🍃" color={c} />
        <Chip label="S3" emoji="☁️" color={c} />
        <Chip label="Files" emoji="📄" color={c} />
      </div>
      <Arrow color={c} />
      <div
        className="px-2 py-3 rounded-lg border font-mono text-[11px] font-bold text-white/70 shrink-0"
        style={{ borderColor: `${c}55`, background: `${c}20` }}
      >
        Logstash
      </div>
      <Arrow color={c} />
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex gap-1.5">
          <Node label="N1" color={c} size={34} />
          <Node label="N2" color={c} size={34} />
        </div>
        <Node label="N3" color={c} size={34} />
      </div>
    </div>
  );
}

function ObserveVisual({ c }: { c: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-3">
        <Chip label="Filebeat" emoji="📋" color={c} />
        <Chip label="Metricbeat" emoji="📊" color={c} />
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px]" style={{ color: c }}>▼</span>
        <div className="w-px h-3" style={{ background: `${c}77` }} />
      </div>
      <div className="flex gap-2">
        <Node label="N1" color={c} size={36} />
        <Node label="N2" color={c} size={36} />
        <Node label="N3" color={c} size={36} />
      </div>
      <div className="w-px h-3" style={{ background: `${c}77` }} />
      <div
        className="px-3 py-1 rounded-lg border font-mono text-[11px] font-bold"
        style={{ borderColor: `${c}55`, background: `${c}20`, color: c }}
      >
        📈 Kibana
      </div>
    </div>
  );
}

const VISUALS: Record<string, (c: string) => React.ReactNode> = {
  deploy:    c => <DeployVisual c={c} />,
  configure: c => <ConfigureVisual c={c} />,
  index:     c => <IndexVisual c={c} />,
  scale:     c => <ScaleVisual c={c} />,
  secure:    c => <SecureVisual c={c} />,
  ship:      c => <ShipVisual c={c} />,
  observe:   c => <ObserveVisual c={c} />,
};

// ── Main component ────────────────────────────────────────────────────────────

export default function CourseJourneyDemo() {
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
          What you&apos;ll do in this course
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
            onClick={() => setActive(i)}
            className={`shrink-0 px-3.5 py-2.5 text-xs font-medium transition-all border-b-2 ${
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
                onClick={() => setActive(i)}
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
