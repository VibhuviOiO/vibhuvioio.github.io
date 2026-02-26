'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Server, Database, Search, HardDrive, 
  Activity, Layers, ArrowRight, Terminal, Trash2, 
  Settings, Download, Upload, Cpu, Clock, Shield,
  CheckCircle, XCircle, RefreshCw, Box, Container,
  Zap, Filter
} from 'lucide-react';

// ============================================================================
// Types and Interfaces
// ============================================================================

type InteractionType = 'setup' | 'insert' | 'search' | 'delete' | 'maintain' | 'backup';

interface InteractionFlow {
  id: InteractionType;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  bgColor: string;
}

interface FlowStep {
  id: string;
  from: string;
  to: string;
  label: string;
  type: 'request' | 'response' | 'internal' | 'storage';
  duration: number; // ms
  description?: string;
}

interface ComponentDef {
  id: string;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  bgColor: string;
  category: 'access' | 'coord' | 'worker' | 'storage';
}

// ============================================================================
// Interaction Flow Definitions
// ============================================================================

const INTERACTIONS: InteractionFlow[] = [
  { 
    id: 'setup', 
    label: 'Setup', 
    icon: <Terminal className="w-4 h-4" />,
    description: 'Deploy Milvus standalone with Docker',
    color: '#3b82f6',
    bgColor: 'bg-blue-50'
  },
  { 
    id: 'insert', 
    label: 'Insert Data', 
    icon: <Upload className="w-4 h-4" />,
    description: 'Store vectors and metadata in Milvus',
    color: '#10b981',
    bgColor: 'bg-emerald-50'
  },
  { 
    id: 'search', 
    label: 'Search', 
    icon: <Search className="w-4 h-4" />,
    description: 'Perform similarity search on vectors',
    color: '#8b5cf6',
    bgColor: 'bg-violet-50'
  },
  { 
    id: 'delete', 
    label: 'Delete', 
    icon: <Trash2 className="w-4 h-4" />,
    description: 'Remove collections or entities',
    color: '#ef4444',
    bgColor: 'bg-red-50'
  },
  { 
    id: 'maintain', 
    label: 'Maintain', 
    icon: <Settings className="w-4 h-4" />,
    description: 'Compaction and index optimization',
    color: '#f59e0b',
    bgColor: 'bg-amber-50'
  },
  { 
    id: 'backup', 
    label: 'Backup', 
    icon: <Download className="w-4 h-4" />,
    description: 'Backup and restore operations',
    color: '#06b6d4',
    bgColor: 'bg-cyan-50'
  },
];

// Flow definitions for each interaction type
const FLOW_STEPS: Record<InteractionType, FlowStep[]> = {
  setup: [
    { id: 's1', from: 'user', to: 'terminal', label: 'docker pull', type: 'request', duration: 800, description: 'Pull Milvus standalone image' },
    { id: 's2', from: 'terminal', to: 'docker', label: 'create', type: 'internal', duration: 600, description: 'Create Docker container' },
    { id: 's3', from: 'docker', to: 'proxy', label: 'start', type: 'internal', duration: 1000, description: 'Initialize Proxy service' },
    { id: 's4', from: 'proxy', to: 'rootcoord', label: 'register', type: 'internal', duration: 500, description: 'Register with coordinators' },
    { id: 's5', from: 'rootcoord', to: 'etcd', label: 'init meta', type: 'storage', duration: 600, description: 'Initialize metadata storage' },
    { id: 's6', from: 'docker', to: 'minio', label: 'init', type: 'storage', duration: 700, description: 'Initialize object storage' },
    { id: 's7', from: 'proxy', to: 'user', label: 'ready', type: 'response', duration: 400, description: 'Milvus is ready on port 19530' },
  ],
  insert: [
    { id: 'i1', from: 'client', to: 'proxy', label: 'insert()', type: 'request', duration: 500, description: 'Client sends insert request with vectors' },
    { id: 'i2', from: 'proxy', to: 'rootcoord', label: 'verify', type: 'internal', duration: 300, description: 'Verify collection exists' },
    { id: 'i3', from: 'rootcoord', to: 'datacoord', label: 'allocate', type: 'internal', duration: 400, description: 'Allocate segment for new data' },
    { id: 'i4', from: 'proxy', to: 'datanode', label: 'stream', type: 'internal', duration: 600, description: 'Stream data to DataNode' },
    { id: 'i5', from: 'datanode', to: 'wal', label: 'wal write', type: 'storage', duration: 400, description: 'Write to Write-Ahead Log' },
    { id: 'i6', from: 'datanode', to: 'minio', label: 'flush', type: 'storage', duration: 800, description: 'Flush segment to object storage' },
    { id: 'i7', from: 'datacoord', to: 'etcd', label: 'update meta', type: 'storage', duration: 300, description: 'Update segment metadata' },
    { id: 'i8', from: 'proxy', to: 'client', label: 'success', type: 'response', duration: 300, description: 'Return insert success with IDs' },
  ],
  search: [
    { id: 'q1', from: 'client', to: 'proxy', label: 'search()', type: 'request', duration: 400, description: 'Client sends search request with query vector' },
    { id: 'q2', from: 'proxy', to: 'querycoord', label: 'route', type: 'internal', duration: 300, description: 'QueryCoord determines target QueryNodes' },
    { id: 'q3', from: 'querycoord', to: 'etcd', label: 'load meta', type: 'storage', duration: 300, description: 'Load collection metadata' },
    { id: 'q4', from: 'proxy', to: 'querynode', label: 'dispatch', type: 'internal', duration: 400, description: 'Dispatch search to QueryNodes' },
    { id: 'q5', from: 'querynode', to: 'minio', label: 'load index', type: 'storage', duration: 600, description: 'Load index files from storage' },
    { id: 'q6', from: 'querynode', to: 'querynode', label: 'ann search', type: 'internal', duration: 800, description: 'Perform ANN search (HNSW/IVF)' },
    { id: 'q7', from: 'querynode', to: 'proxy', label: 'results', type: 'response', duration: 400, description: 'Return partial results' },
    { id: 'q8', from: 'proxy', to: 'client', label: 'topk', type: 'response', duration: 300, description: 'Aggregate and return top-k results' },
  ],
  delete: [
    { id: 'd1', from: 'client', to: 'proxy', label: 'delete()', type: 'request', duration: 400, description: 'Client sends delete request' },
    { id: 'd2', from: 'proxy', to: 'rootcoord', label: 'authorize', type: 'internal', duration: 300, description: 'Verify permissions' },
    { id: 'd3', from: 'proxy', to: 'datanode', label: 'mark del', type: 'internal', duration: 500, description: 'Mark entities as deleted' },
    { id: 'd4', from: 'datanode', to: 'wal', label: 'log del', type: 'storage', duration: 400, description: 'Write delete operation to WAL' },
    { id: 'd5', from: 'datacoord', to: 'etcd', label: 'update', type: 'storage', duration: 300, description: 'Update segment stats' },
    { id: 'd6', from: 'proxy', to: 'client', label: 'ack', type: 'response', duration: 300, description: 'Confirm deletion accepted' },
  ],
  maintain: [
    { id: 'm1', from: 'datacoord', to: 'datanode', label: 'compact', type: 'internal', duration: 500, description: 'Trigger compaction process' },
    { id: 'm2', from: 'datanode', to: 'minio', label: 'read', type: 'storage', duration: 800, description: 'Read small segments' },
    { id: 'm3', from: 'datanode', to: 'datanode', label: 'merge', type: 'internal', duration: 1200, description: 'Merge segments, remove deleted' },
    { id: 'm4', from: 'datanode', to: 'minio', label: 'write', type: 'storage', duration: 800, description: 'Write compacted segment' },
    { id: 'm5', from: 'indexcoord', to: 'indexnode', label: 'build', type: 'internal', duration: 600, description: 'Trigger index build' },
    { id: 'm6', from: 'indexnode', to: 'minio', label: 'create idx', type: 'storage', duration: 1500, description: 'Build HNSW/IVF index' },
    { id: 'm7', from: 'datacoord', to: 'etcd', label: 'gc', type: 'storage', duration: 400, description: 'Clean up obsolete segments' },
  ],
  backup: [
    { id: 'b1', from: 'user', to: 'terminal', label: 'backup cmd', type: 'request', duration: 400, description: 'Execute backup command' },
    { id: 'b2', from: 'terminal', to: 'rootcoord', label: 'snapshot', type: 'internal', duration: 600, description: 'Request metadata snapshot' },
    { id: 'b3', from: 'rootcoord', to: 'etcd', label: 'dump', type: 'storage', duration: 800, description: 'Export etcd data' },
    { id: 'b4', from: 'terminal', to: 'minio', label: 'copy', type: 'storage', duration: 1500, description: 'Copy object storage files' },
    { id: 'b5', from: 'terminal', to: 'user', label: 'complete', type: 'response', duration: 300, description: 'Backup archive created' },
  ],
};

// ============================================================================
// Component Definitions
// ============================================================================

const COMPONENTS: ComponentDef[] = [
  // External entities
  { 
    id: 'user', label: 'User', subtitle: 'Operator',
    icon: <Layers className="w-4 h-4" />,
    x: 20, y: 40, width: 80, height: 50,
    color: '#64748b', bgColor: 'bg-gray-100',
    category: 'access'
  },
  { 
    id: 'terminal', label: 'Terminal', subtitle: 'CLI',
    icon: <Terminal className="w-4 h-4" />,
    x: 140, y: 40, width: 80, height: 50,
    color: '#64748b', bgColor: 'bg-gray-100',
    category: 'access'
  },
  { 
    id: 'client', label: 'Client App', subtitle: 'SDK',
    icon: <Layers className="w-4 h-4" />,
    x: 20, y: 280, width: 80, height: 60,
    color: '#64748b', bgColor: 'bg-gray-100',
    category: 'access'
  },
  { 
    id: 'docker', label: 'Docker', subtitle: 'Container',
    icon: <Container className="w-4 h-4" />,
    x: 260, y: 40, width: 80, height: 50,
    color: '#2496ed', bgColor: 'bg-blue-50',
    category: 'access'
  },
  
  // Milvus Components - Access Layer
  { 
    id: 'proxy', label: 'Proxy', subtitle: 'DML/DQL/DDL',
    icon: <Server className="w-4 h-4" />,
    x: 140, y: 280, width: 90, height: 60,
    color: '#3b82f6', bgColor: 'bg-blue-50',
    category: 'access'
  },
  
  // Coordinators
  { 
    id: 'rootcoord', label: 'RootCoord', subtitle: 'DDL/DCL',
    icon: <Activity className="w-4 h-4" />,
    x: 280, y: 60, width: 100, height: 55,
    color: '#f59e0b', bgColor: 'bg-amber-50',
    category: 'coord'
  },
  { 
    id: 'datacoord', label: 'DataCoord', subtitle: 'Segments',
    icon: <Activity className="w-4 h-4" />,
    x: 410, y: 60, width: 100, height: 55,
    color: '#f59e0b', bgColor: 'bg-amber-50',
    category: 'coord'
  },
  { 
    id: 'querycoord', label: 'QueryCoord', subtitle: 'Routing',
    icon: <Activity className="w-4 h-4" />,
    x: 540, y: 60, width: 100, height: 55,
    color: '#f59e0b', bgColor: 'bg-amber-50',
    category: 'coord'
  },
  { 
    id: 'indexcoord', label: 'IndexCoord', subtitle: 'Indexing',
    icon: <Activity className="w-4 h-4" />,
    x: 670, y: 60, width: 100, height: 55,
    color: '#f59e0b', bgColor: 'bg-amber-50',
    category: 'coord'
  },
  
  // Worker Nodes
  { 
    id: 'datanode', label: 'DataNode', subtitle: 'Write Path',
    icon: <Database className="w-4 h-4" />,
    x: 320, y: 180, width: 90, height: 60,
    color: '#06b6d4', bgColor: 'bg-cyan-50',
    category: 'worker'
  },
  { 
    id: 'querynode', label: 'QueryNode', subtitle: 'Read Path',
    icon: <Search className="w-4 h-4" />,
    x: 320, y: 320, width: 90, height: 60,
    color: '#10b981', bgColor: 'bg-emerald-50',
    category: 'worker'
  },
  { 
    id: 'indexnode', label: 'IndexNode', subtitle: 'Build',
    icon: <Cpu className="w-4 h-4" />,
    x: 480, y: 180, width: 90, height: 60,
    color: '#8b5cf6', bgColor: 'bg-violet-50',
    category: 'worker'
  },
  
  // Storage
  { 
    id: 'etcd', label: 'etcd', subtitle: 'Metadata',
    icon: <Database className="w-4 h-4" />,
    x: 820, y: 60, width: 90, height: 70,
    color: '#ef4444', bgColor: 'bg-red-50',
    category: 'storage'
  },
  { 
    id: 'wal', label: 'WAL', subtitle: 'Pulsar/Kafka',
    icon: <Zap className="w-4 h-4" />,
    x: 820, y: 180, width: 90, height: 60,
    color: '#f97316', bgColor: 'bg-orange-50',
    category: 'storage'
  },
  { 
    id: 'minio', label: 'MinIO', subtitle: 'Object Storage',
    icon: <HardDrive className="w-4 h-4" />,
    x: 820, y: 320, width: 90, height: 80,
    color: '#06b6d4', bgColor: 'bg-cyan-50',
    category: 'storage'
  },
];

// ============================================================================
// Sub-components
// ============================================================================

function ComponentNode({ 
  comp, 
  isActive, 
  isHighlighted,
  pulse
}: { 
  comp: ComponentDef;
  isActive: boolean;
  isHighlighted: boolean;
  pulse?: boolean;
}) {
  return (
    <div
      className={`
        absolute flex flex-col items-center justify-center rounded-xl border-2 
        transition-all duration-300 cursor-pointer
        ${isActive ? 'scale-105 shadow-lg z-10' : ''}
        ${isHighlighted ? 'ring-2 ring-offset-2' : 'opacity-60'}
        ${pulse ? 'animate-pulse' : ''}
      `}
      style={{
        left: comp.x,
        top: comp.y,
        width: comp.width,
        height: comp.height,
        backgroundColor: isHighlighted ? `${comp.color}30` : `${comp.color}15`,
        borderColor: isHighlighted ? comp.color : `${comp.color}40`,
        boxShadow: isHighlighted ? `0 0 20px ${comp.color}40` : 'none',
      }}
    >
      <div 
        className="flex items-center justify-center w-7 h-7 rounded-lg mb-1"
        style={{ backgroundColor: `${comp.color}25`, color: comp.color }}
      >
        {comp.icon}
      </div>
      <span className="text-[10px] font-bold text-gray-800 leading-tight">{comp.label}</span>
      {comp.subtitle && (
        <span className="text-[8px] text-gray-500 leading-tight">{comp.subtitle}</span>
      )}
    </div>
  );
}

function AnimatedParticle({
  step,
  progress,
  color,
}: {
  step: FlowStep;
  progress: number;
  color: string;
}) {
  const fromComp = COMPONENTS.find(c => c.id === step.from);
  const toComp = COMPONENTS.find(c => c.id === step.to);
  
  if (!fromComp || !toComp) return null;
  
  // Calculate positions
  const fromX = fromComp.x + fromComp.width / 2;
  const fromY = fromComp.y + fromComp.height / 2;
  const toX = toComp.x + toComp.width / 2;
  const toY = toComp.y + toComp.height / 2;
  
  // Linear interpolation
  const currentX = fromX + (toX - fromX) * progress;
  const currentY = fromY + (toY - fromY) * progress;
  
  // Particle styling based on type
  const particleStyles: Record<string, { size: number; icon: React.ReactNode; glow: string }> = {
    request: { size: 24, icon: <ArrowRight className="w-3 h-3" />, glow: '0 0 10px currentColor' },
    response: { size: 20, icon: <CheckCircle className="w-3 h-3" />, glow: '0 0 8px currentColor' },
    internal: { size: 18, icon: <Zap className="w-2.5 h-2.5" />, glow: '0 0 6px currentColor' },
    storage: { size: 20, icon: <Database className="w-3 h-3" />, glow: '0 0 8px currentColor' },
  };
  
  const style = particleStyles[step.type];
  
  return (
    <div
      className="absolute pointer-events-none z-20 flex items-center justify-center rounded-full font-bold text-white transition-transform"
      style={{
        left: currentX - style.size / 2,
        top: currentY - style.size / 2,
        width: style.size,
        height: style.size,
        backgroundColor: color,
        boxShadow: style.glow,
        transform: `scale(${1 + Math.sin(progress * Math.PI) * 0.2})`,
      }}
    >
      {style.icon}
    </div>
  );
}

function ConnectionLine({
  from,
  to,
  isActive,
  color,
  progress,
}: {
  from: string;
  to: string;
  isActive: boolean;
  color: string;
  progress: number;
}) {
  const fromComp = COMPONENTS.find(c => c.id === from);
  const toComp = COMPONENTS.find(c => c.id === to);
  
  if (!fromComp || !toComp) return null;
  
  const fromX = fromComp.x + fromComp.width / 2;
  const fromY = fromComp.y + fromComp.height / 2;
  const toX = toComp.x + toComp.width / 2;
  const toY = toComp.y + toComp.height / 2;
  
  const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
  const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: fromX,
        top: fromY,
        width: length,
        height: 2,
        transformOrigin: '0 50%',
        transform: `rotate(${angle}deg)`,
      }}
    >
      {/* Base line */}
      <div 
        className="absolute inset-0 rounded-full transition-opacity duration-300"
        style={{ 
          background: `linear-gradient(90deg, ${color}30, ${color}50)`,
          opacity: isActive ? 1 : 0.1,
        }}
      />
      
      {/* Active progress */}
      {isActive && (
        <div 
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ 
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      )}
    </div>
  );
}

function SetupSteps({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = [
    { icon: <Terminal className="w-4 h-4" />, label: 'Pull Image', cmd: 'docker pull milvusdb/milvus:v2.5.4' },
    { icon: <Container className="w-4 h-4" />, label: 'Create Container', cmd: 'docker create --name milvus ...' },
    { icon: <Play className="w-4 h-4" />, label: 'Start Services', cmd: 'docker start milvus' },
    { icon: <Activity className="w-4 h-4" />, label: 'Init Coordinators', cmd: 'RootCoord, DataCoord...' },
    { icon: <Database className="w-4 h-4" />, label: 'Connect etcd', cmd: 'Embedded etcd ready' },
    { icon: <HardDrive className="w-4 h-4" />, label: 'Init Storage', cmd: 'MinIO initialized' },
    { icon: <CheckCircle className="w-4 h-4" />, label: 'Ready', cmd: 'Listening on :19530' },
  ];
  
  return (
    <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs">
      <div className="flex items-center gap-2 mb-3 text-gray-400">
        <Terminal className="w-4 h-4" />
        <span>Setup Progress</span>
      </div>
      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div 
            key={idx}
            className={`flex items-center gap-3 p-2 rounded transition-all ${
              idx < currentStep ? 'bg-green-900/30 text-green-400' :
              idx === currentStep ? 'bg-blue-900/30 text-blue-400 border border-blue-500/50' :
              'bg-gray-800/50 text-gray-600'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              idx < currentStep ? 'bg-green-500/20' :
              idx === currentStep ? 'bg-blue-500/20 animate-pulse' :
              'bg-gray-700'
            }`}>
              {idx < currentStep ? <CheckCircle className="w-3 h-3" /> : 
               idx === currentStep ? <RefreshCw className="w-3 h-3 animate-spin" /> :
               <div className="w-2 h-2 rounded-full bg-current" />}
            </div>
            <div className="flex-1">
              <div className="font-medium">{step.label}</div>
              <div className="text-[10px] opacity-70 truncate">{step.cmd}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function MilvusInteractiveArchitecture() {
  const [activeInteraction, setActiveInteraction] = useState<InteractionType>('insert');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  const currentFlow = INTERACTIONS.find(i => i.id === activeInteraction)!;
  const steps = FLOW_STEPS[activeInteraction];
  const currentStep = steps[currentStepIndex];
  
  // Reset when interaction changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setStepProgress(0);
    setCompletedSteps(new Set());
    setIsPlaying(true);
  }, [activeInteraction]);
  
  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }
    
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      
      if (currentStep) {
        const newProgress = stepProgress + (delta / currentStep.duration);
        
        if (newProgress >= 1) {
          // Step complete
          setCompletedSteps(prev => new Set([...prev, currentStep.id]));
          
          if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            setStepProgress(0);
          } else {
            // Flow complete - restart after delay
            setTimeout(() => {
              setCurrentStepIndex(0);
              setStepProgress(0);
              setCompletedSteps(new Set());
            }, 1500);
          }
        } else {
          setStepProgress(newProgress);
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      lastTimeRef.current = 0;
    };
  }, [isPlaying, currentStep, currentStepIndex, stepProgress, steps]);
  
  // Get active components for highlighting
  const activeComponentIds = new Set<string>();
  steps.forEach(step => {
    activeComponentIds.add(step.from);
    activeComponentIds.add(step.to);
  });
  
  // Current step components
  const currentStepComponents = currentStep ? [currentStep.from, currentStep.to] : [];
  
  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-white">
      {/* Header with Interaction Tabs */}
      <div className="px-4 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Box className="h-5 w-5 text-cyan-400" />
            <span className="text-white font-semibold">Milvus Architecture — Interactive Flow</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-700"
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>
        
        {/* Interaction Type Tabs */}
        <div className="flex flex-wrap gap-2">
          {INTERACTIONS.map((interaction) => (
            <button
              key={interaction.id}
              onClick={() => setActiveInteraction(interaction.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
                ${activeInteraction === interaction.id 
                  ? `${interaction.bgColor} text-gray-900 ring-2 ring-offset-1 ring-offset-gray-900` 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <span style={{ color: interaction.color }}>{interaction.icon}</span>
              {interaction.label}
            </button>
          ))}
        </div>
        
        {/* Description */}
        <p className="mt-3 text-sm text-gray-400">
          {currentFlow.description}
        </p>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row">
        {/* Architecture Diagram */}
        <div className="relative flex-1 bg-gradient-to-br from-gray-50 to-white" style={{ minHeight: 500 }}>
          {/* Grid Background */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(rgba(124, 106, 247, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(124, 106, 247, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
          
          {/* Category Labels */}
          <div className="absolute top-4 left-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Access Layer
          </div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Coordination Layer
          </div>
          <div className="absolute top-[200px] left-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Worker Layer
          </div>
          <div className="absolute top-4 right-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Storage Layer
          </div>
          
          {/* Connection Lines */}
          {steps.map((step, idx) => (
            <ConnectionLine
              key={`line-${step.id}`}
              from={step.from}
              to={step.to}
              isActive={completedSteps.has(step.id) || (idx === currentStepIndex && stepProgress > 0)}
              color={currentFlow.color}
              progress={idx === currentStepIndex ? stepProgress : (completedSteps.has(step.id) ? 1 : 0)}
            />
          ))}
          
          {/* Components */}
          {COMPONENTS.map((comp) => (
            <ComponentNode
              key={comp.id}
              comp={comp}
              isActive={currentStepComponents.includes(comp.id)}
              isHighlighted={activeComponentIds.has(comp.id)}
              pulse={currentStepComponents.includes(comp.id) && isPlaying}
            />
          ))}
          
          {/* Animated Particles */}
          {currentStep && (
            <AnimatedParticle
              step={currentStep}
              progress={stepProgress}
              color={currentFlow.color}
            />
          )}
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {[
              { color: '#3b82f6', label: 'Proxy' },
              { color: '#f59e0b', label: 'Coordinators' },
              { color: '#06b6d4', label: 'Data' },
              { color: '#10b981', label: 'Query' },
              { color: '#8b5cf6', label: 'Index' },
              { color: '#ef4444', label: 'etcd' },
              { color: '#06b6d4', label: 'MinIO' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-gray-200 shadow-sm">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[9px] text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Side Panel - Step Details */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50">
          {/* Progress Bar */}
          <div className="px-4 py-3 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Flow Progress</span>
              <span>{Math.round((completedSteps.size / steps.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${((completedSteps.size + (currentStep ? stepProgress : 0)) / steps.length) * 100}%`,
                  backgroundColor: currentFlow.color,
                }}
              />
            </div>
          </div>
          
          {/* Current Step Info */}
          <div className="p-4">
            {currentStep ? (
              <div className="mb-4">
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium mb-3"
                  style={{ 
                    backgroundColor: `${currentFlow.color}20`,
                    color: currentFlow.color,
                  }}
                >
                  <RefreshCw className={`w-3 h-3 ${isPlaying ? 'animate-spin' : ''}`} />
                  Step {currentStepIndex + 1} of {steps.length}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {currentStep.label}
                </h4>
                <p className="text-sm text-gray-600">
                  {currentStep.description}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>Flow Complete!</p>
              </div>
            )}
            
            {/* Setup-specific steps UI */}
            {activeInteraction === 'setup' && (
              <SetupSteps 
                currentStep={currentStepIndex} 
                totalSteps={steps.length} 
              />
            )}
            
            {/* Step List */}
            <div className="mt-4 space-y-1 max-h-64 overflow-y-auto">
              {steps.map((step, idx) => {
                const isCompleted = completedSteps.has(step.id);
                const isCurrent = idx === currentStepIndex;
                
                return (
                  <div 
                    key={step.id}
                    className={`
                      flex items-center gap-2 p-2 rounded-lg text-xs transition-all
                      ${isCompleted ? 'bg-green-50 text-green-700' : ''}
                      ${isCurrent ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : ''}
                      ${!isCompleted && !isCurrent ? 'text-gray-500' : ''}
                    `}
                  >
                    <div className={`
                      w-5 h-5 rounded-full flex items-center justify-center shrink-0
                      ${isCompleted ? 'bg-green-500 text-white' : ''}
                      ${isCurrent ? 'bg-blue-500 text-white' : ''}
                      ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-400' : ''}
                    `}>
                      {isCompleted ? <CheckCircle className="w-3 h-3" /> :
                       isCurrent ? <RefreshCw className="w-3 h-3 animate-spin" /> :
                       <span className="text-[10px]">{idx + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{step.label}</div>
                      <div className="text-[10px] opacity-70 truncate">{step.from} → {step.to}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer - Interaction Description */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-start gap-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${currentFlow.color}20`, color: currentFlow.color }}
          >
            {currentFlow.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{currentFlow.label} Flow</h3>
            <p className="text-sm text-gray-600">
              {activeInteraction === 'setup' && 'Watch how Milvus standalone initializes — from Docker container creation to all services being ready on port 19530.'}
              {activeInteraction === 'insert' && 'Follow the write path: vectors enter through Proxy, are written to WAL for durability, flushed to object storage, and indexed for search.'}
              {activeInteraction === 'search' && 'See the query path: ANN search requests are routed to QueryNodes, which load index files and perform similarity search.'}
              {activeInteraction === 'delete' && 'Understand deletion: entities are marked as deleted, logged to WAL, and physically removed during compaction.'}
              {activeInteraction === 'maintain' && 'Background operations: compaction merges small segments and removes deleted data, indexing builds search structures.'}
              {activeInteraction === 'backup' && 'Backup process: metadata is exported from etcd while object storage files are copied to create a consistent snapshot.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
