'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Layers, Database, Search, Server, HardDrive, Activity } from 'lucide-react';

const PHASE_DURATION = 5000;

interface FlowPhase {
  id: string;
  title: string;
  description: string;
  highlight: string[];
  dataFlow?: { from: string; to: string; label: string; color: string }[];
}

const PHASES: FlowPhase[] = [
  {
    id: 'write',
    title: 'Vector Ingestion Flow',
    description: 'Client sends vectors via Proxy → Streaming Nodes write to WAL → Data Nodes flush to Object Storage',
    highlight: ['client', 'proxy', 'streaming', 'wal', 'datanode', 'objectstore'],
    dataFlow: [
      { from: 'client', to: 'proxy', label: 'DML', color: '#10b981' },
      { from: 'proxy', to: 'streaming', label: 'Insert', color: '#10b981' },
      { from: 'streaming', to: 'wal', label: 'Append', color: '#f59e0b' },
      { from: 'streaming', to: 'datanode', label: 'Delegate', color: '#8b5cf6' },
      { from: 'datanode', to: 'objectstore', label: 'Flush', color: '#06b6d4' },
    ],
  },
  {
    id: 'metadata',
    title: 'Metadata & Coordination',
    description: 'RootCoord manages DDL/DCL operations. All metadata stored in etcd. Service discovery and registration handled by coordinators.',
    highlight: ['proxy', 'rootcoord', 'datacoord', 'querycoord', 'etcd'],
    dataFlow: [
      { from: 'proxy', to: 'rootcoord', label: 'DDL/DCL', color: '#3b82f6' },
      { from: 'rootcoord', to: 'etcd', label: 'Persist', color: '#ef4444' },
      { from: 'datacoord', to: 'etcd', label: 'Register', color: '#ef4444' },
      { from: 'querycoord', to: 'etcd', label: 'Register', color: '#ef4444' },
    ],
  },
  {
    id: 'search',
    title: 'Vector Search Flow',
    description: 'Query requests go through Proxy → Query Coord routes to Query Nodes → Results aggregated and returned',
    highlight: ['client', 'proxy', 'querycoord', 'querynode', 'objectstore'],
    dataFlow: [
      { from: 'client', to: 'proxy', label: 'DQL', color: '#10b981' },
      { from: 'proxy', to: 'querycoord', label: 'Search', color: '#8b5cf6' },
      { from: 'querycoord', to: 'querynode', label: 'Route', color: '#8b5cf6' },
      { from: 'querynode', to: 'objectstore', label: 'Load Segments', color: '#06b6d4' },
      { from: 'querynode', to: 'proxy', label: 'Results', color: '#10b981' },
    ],
  },
  {
    id: 'index',
    title: 'Indexing & Compaction',
    description: 'DataNodes build indexes. IndexCoord manages index nodes. Compaction runs in background to merge small segments.',
    highlight: ['datacoord', 'datanode', 'indexcoord', 'indexnode', 'objectstore'],
    dataFlow: [
      { from: 'datacoord', to: 'datanode', label: 'Seal', color: '#f59e0b' },
      { from: 'indexcoord', to: 'indexnode', label: 'Build', color: '#8b5cf6' },
      { from: 'indexnode', to: 'objectstore', label: 'Store Index', color: '#06b6d4' },
      { from: 'datacoord', to: 'objectstore', label: 'Compact', color: '#06b6d4' },
    ],
  },
];

// Component definitions with positions and styles
const COMPONENTS: Record<string, { x: number; y: number; width: number; height: number; color: string; icon: React.ReactNode; label: string; subtitle?: string }> = {
  // Left side - Client
  client: { x: 20, y: 280, width: 80, height: 60, color: '#64748b', icon: <Layers className="w-4 h-4" />, label: 'Client', subtitle: 'SDK' },
  
  // Proxy layer
  proxy: { x: 140, y: 280, width: 70, height: 60, color: '#3b82f6', icon: <Server className="w-4 h-4" />, label: 'Proxy', subtitle: 'DML/DQL' },
  
  // Coordinators (top center)
  rootcoord: { x: 280, y: 60, width: 90, height: 50, color: '#f59e0b', icon: <Activity className="w-4 h-4" />, label: 'RootCoord', subtitle: 'DDL/DCL' },
  datacoord: { x: 400, y: 60, width: 90, height: 50, color: '#f59e0b', icon: <Activity className="w-4 h-4" />, label: 'DataCoord', subtitle: 'Segments' },
  querycoord: { x: 520, y: 60, width: 90, height: 50, color: '#f59e0b', icon: <Activity className="w-4 h-4" />, label: 'QueryCoord', subtitle: 'Routing' },
  indexcoord: { x: 640, y: 60, width: 90, height: 50, color: '#f59e0b', icon: <Activity className="w-4 h-4" />, label: 'IndexCoord', subtitle: 'Indexing' },
  
  // Workers - Streaming Nodes
  streaming: { x: 280, y: 180, width: 180, height: 70, color: '#8b5cf6', icon: <Activity className="w-4 h-4" />, label: 'Streaming Nodes', subtitle: 'Write Path' },
  
  // Workers - Query Nodes
  querynode: { x: 280, y: 320, width: 180, height: 70, color: '#10b981', icon: <Search className="w-4 h-4" />, label: 'Query Nodes', subtitle: 'Read Path' },
  
  // Workers - Data/Index Nodes
  datanode: { x: 520, y: 220, width: 90, height: 60, color: '#06b6d4', icon: <Database className="w-4 h-4" />, label: 'DataNode', subtitle: 'Flush' },
  indexnode: { x: 520, y: 320, width: 90, height: 60, color: '#06b6d4', icon: <Database className="w-4 h-4" />, label: 'IndexNode', subtitle: 'Build' },
  
  // Storage - Right side
  etcd: { x: 780, y: 80, width: 100, height: 70, color: '#ef4444', icon: <Database className="w-4 h-4" />, label: 'etcd', subtitle: 'Meta Storage' },
  wal: { x: 780, y: 200, width: 100, height: 70, color: '#f97316', icon: <HardDrive className="w-4 h-4" />, label: 'WAL', subtitle: 'Pulsar/Kafka' },
  objectstore: { x: 780, y: 340, width: 100, height: 90, color: '#06b6d4', icon: <HardDrive className="w-4 h-4" />, label: 'Object Storage', subtitle: 'S3/MinIO/GCS' },
};

function NodeComponent({ 
  id, 
  data, 
  isHighlighted 
}: { 
  id: string; 
  data: typeof COMPONENTS[string]; 
  isHighlighted: boolean;
}) {
  return (
    <div
      className={`absolute flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-500 ${
        isHighlighted ? 'scale-105 shadow-lg' : 'opacity-70'
      }`}
      style={{
        left: data.x,
        top: data.y,
        width: data.width,
        height: data.height,
        backgroundColor: `${data.color}20`,
        borderColor: isHighlighted ? data.color : `${data.color}40`,
        boxShadow: isHighlighted ? `0 0 20px ${data.color}40` : 'none',
      }}
    >
      <div 
        className="flex items-center justify-center w-6 h-6 rounded-full mb-1"
        style={{ backgroundColor: `${data.color}30`, color: data.color }}
      >
        {data.icon}
      </div>
      <span className="text-[10px] font-semibold text-gray-700 leading-tight">{data.label}</span>
      {data.subtitle && (
        <span className="text-[8px] text-gray-500 leading-tight">{data.subtitle}</span>
      )}
    </div>
  );
}

function DataFlowArrow({ 
  flow, 
  isActive 
}: { 
  flow: { from: string; to: string; label: string; color: string }; 
  isActive: boolean;
}) {
  const from = COMPONENTS[flow.from];
  const to = COMPONENTS[flow.to];
  
  if (!from || !to) return null;
  
  // Calculate center points
  const fromX = from.x + from.width / 2;
  const fromY = from.y + from.height / 2;
  const toX = to.x + to.width / 2;
  const toY = to.y + to.height / 2;
  
  // Calculate angle and distance
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
  
  // Adjust start and end points to edge of boxes
  const startX = fromX + (Math.cos(angle) * from.width / 2);
  const startY = fromY + (Math.sin(angle) * from.height / 2);
  const endX = toX - (Math.cos(angle) * to.width / 2);
  const endY = toY - (Math.sin(angle) * to.height / 2);
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: startX,
        top: startY,
        width: distance - from.width/2 - to.width/2,
        height: 2,
        transformOrigin: '0 50%',
        transform: `rotate(${angle}rad)`,
      }}
    >
      {/* Arrow line */}
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{ 
          background: `linear-gradient(90deg, ${flow.color}60, ${flow.color})`,
          opacity: isActive ? 1 : 0.2,
        }}
      />
      
      {/* Animated flow */}
      {isActive && (
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, transparent, ${flow.color}, transparent)`,
            animation: 'flowAnimation 1s linear infinite',
          }}
        />
      )}
      
      {/* Arrow head */}
      <div 
        className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0"
        style={{
          borderLeft: `8px solid ${flow.color}`,
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          opacity: isActive ? 1 : 0.3,
        }}
      />
      
      {/* Label */}
      <div 
        className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-mono px-1 rounded whitespace-nowrap transition-opacity duration-300"
        style={{ 
          backgroundColor: `${flow.color}20`,
          color: flow.color,
          opacity: isActive ? 1 : 0.4,
        }}
      >
        {flow.label}
      </div>
    </div>
  );
}

export default function MilvusArchitecture() {
  const [activePhase, setActivePhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      setActivePhase((prev) => (prev + 1) % PHASES.length);
    }, PHASE_DURATION);
    return () => clearTimeout(timer);
  }, [activePhase, isPlaying]);

  const phase = PHASES[activePhase];

  return (
    <div className="my-8 rounded-xl overflow-hidden border border-gray-700 shadow-xl bg-[#0d1117]">
      {/* Header */}
      <div className="px-5 py-3 bg-[#161b22] border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="h-4 w-4 text-[#7c6af7]" />
          <span className="text-white font-semibold text-sm">Milvus Architecture — How Data Flows</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              showLabels ? 'bg-[#7c6af7] text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Labels
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>

      {/* Phase tabs */}
      <div className="flex border-b border-gray-800 overflow-x-auto">
        {PHASES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => {
              setActivePhase(i);
              setIsPlaying(false);
            }}
            className={`shrink-0 px-4 py-3 text-xs font-medium transition-all border-b-2 ${
              activePhase === i 
                ? 'border-[#7c6af7] text-[#7c6af7]' 
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Main diagram area */}
      <div className="relative bg-[#0d1117]" style={{ height: 480 }}>
        {/* Background grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(124, 106, 247, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124, 106, 247, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Section labels */}
        {showLabels && (
          <>
            <div className="absolute top-4 left-4 text-[10px] font-mono text-gray-600 uppercase tracking-wider">Access Layer</div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gray-600 uppercase tracking-wider">Coordination Layer</div>
            <div className="absolute top-24 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gray-600 uppercase tracking-wider">Worker Layer</div>
            <div className="absolute top-4 right-4 text-[10px] font-mono text-gray-600 uppercase tracking-wider">Storage Layer</div>
          </>
        )}

        {/* Data flow arrows */}
        {phase.dataFlow?.map((flow, i) => (
          <DataFlowArrow 
            key={`${phase.id}-${i}`} 
            flow={flow} 
            isActive={true}
          />
        ))}

        {/* Components */}
        {Object.entries(COMPONENTS).map(([id, data]) => (
          <NodeComponent
            key={id}
            id={id}
            data={data}
            isHighlighted={phase.highlight.includes(id)}
          />
        ))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          {[
            { color: '#3b82f6', label: 'Proxy' },
            { color: '#f59e0b', label: 'Coordinators' },
            { color: '#8b5cf6', label: 'Streaming' },
            { color: '#10b981', label: 'Query' },
            { color: '#06b6d4', label: 'Data/Index' },
            { color: '#ef4444', label: 'etcd' },
            { color: '#f97316', label: 'Message Queue' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161b22] border border-gray-700">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[9px] text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Description panel */}
      <div className="border-t border-gray-800 p-5 bg-[#161b22]">
        <div className="flex items-start gap-4">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#7c6af720', color: '#7c6af7' }}
          >
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-1">{phase.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{phase.description}</p>
          </div>
          
          {/* Progress dots */}
          <div className="flex gap-1.5 ml-auto shrink-0">
            {PHASES.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setActivePhase(i);
                  setIsPlaying(false);
                }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === activePhase ? 16 : 6,
                  height: 6,
                  background: i === activePhase ? '#7c6af7' : '#374151',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes flowAnimation {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
