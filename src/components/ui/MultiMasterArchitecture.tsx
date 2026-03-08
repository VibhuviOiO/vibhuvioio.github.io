'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Server, Play, Pause, RotateCcw, Users, Shield, Database, Activity } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface ReplicatingEntry {
  id: string;
  dn: string;
  fromNode: number;
  toNode: number;
  progress: number; // 0–1
  color: string;
}

interface NodeState {
  id: number;
  label: string;
  port: number;
  entries: string[];
  status: 'idle' | 'writing' | 'syncing';
}

// ============================================================================
// Constants
// ============================================================================

const SAMPLE_DNS = [
  'cn=Arjuna,ou=People',
  'cn=Karna,ou=People',
  'cn=Bhishma,ou=People',
  'cn=Krishna,ou=People',
  'cn=Draupadi,ou=People',
  'cn=Yudhishthira,ou=People',
  'cn=Nakula,ou=People',
  'cn=Sahadeva,ou=People',
  'cn=Duryodhana,ou=People',
  'cn=Drona,ou=People',
  'cn=Vidura,ou=People',
  'cn=Ganesha,ou=People',
  'cn=DevOps,ou=Groups',
  'cn=Engineering,ou=Groups',
  'cn=Platform,ou=Groups',
];

const NODE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6'];
const ENTRY_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

// ============================================================================
// Component
// ============================================================================

const MAX_WRITES = 20;

export default function MultiMasterArchitecture() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [replicating, setReplicating] = useState<ReplicatingEntry[]>([]);
  const [nodes, setNodes] = useState<NodeState[]>([
    { id: 0, label: 'Node 1', port: 392, entries: [], status: 'idle' },
    { id: 1, label: 'Node 2', port: 393, entries: [], status: 'idle' },
    { id: 2, label: 'Node 3', port: 394, entries: [], status: 'idle' },
  ]);
  const [writeCount, setWriteCount] = useState(0);
  const [syncCount, setSyncCount] = useState(0);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const nextEventRef = useRef<number>(0);
  const entryIdRef = useRef(0);
  const writeCountRef = useRef(0);

  const resetState = useCallback(() => {
    setReplicating([]);
    setNodes([
      { id: 0, label: 'Node 1', port: 392, entries: [], status: 'idle' },
      { id: 1, label: 'Node 2', port: 393, entries: [], status: 'idle' },
      { id: 2, label: 'Node 3', port: 394, entries: [], status: 'idle' },
    ]);
    setWriteCount(0);
    setSyncCount(0);
    nextEventRef.current = 0;
    entryIdRef.current = 0;
    writeCountRef.current = 0;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  const reset = useCallback(() => {
    resetState();
    setIsPlaying(false);
  }, [resetState]);

  // Spawn a new write → replicate event
  const spawnWrite = useCallback(() => {
    const sourceNode = Math.floor(Math.random() * 3);
    const dn = SAMPLE_DNS[Math.floor(Math.random() * SAMPLE_DNS.length)];
    const color = ENTRY_COLORS[Math.floor(Math.random() * ENTRY_COLORS.length)];
    const targets = [0, 1, 2].filter(n => n !== sourceNode);

    // Mark source as writing
    setNodes(prev => prev.map(n =>
      n.id === sourceNode ? { ...n, status: 'writing' as const } : n
    ));

    // Add entry to source node immediately
    setTimeout(() => {
      setNodes(prev => prev.map(n =>
        n.id === sourceNode
          ? { ...n, entries: [dn, ...n.entries].slice(0, 6), status: 'idle' as const }
          : n
      ));
      setWriteCount(c => c + 1);
      writeCountRef.current += 1;

      // Start syncRepl to other nodes
      const newEntries: ReplicatingEntry[] = targets.map(t => ({
        id: `entry-${entryIdRef.current++}`,
        dn,
        fromNode: sourceNode,
        toNode: t,
        progress: 0,
        color,
      }));

      setReplicating(prev => [...prev, ...newEntries]);

      // Mark targets as syncing
      setNodes(prev => prev.map(n =>
        targets.includes(n.id) ? { ...n, status: 'syncing' as const } : n
      ));
    }, 300);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    lastTimeRef.current = performance.now();
    if (nextEventRef.current === 0) nextEventRef.current = performance.now() + 800;

    const animate = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Spawn new writes periodically, reset & loop after MAX_WRITES
      if (now >= nextEventRef.current) {
        if (writeCountRef.current >= MAX_WRITES) {
          // Reset and restart the loop
          resetState();
          lastTimeRef.current = now;
          nextEventRef.current = now + 1200;
          animFrameRef.current = requestAnimationFrame(animate);
          return;
        }
        spawnWrite();
        nextEventRef.current = now + 1800 + Math.random() * 1200;
      }

      // Advance replicating entries
      setReplicating(prev => {
        const updated: ReplicatingEntry[] = [];
        const completed: { toNode: number; dn: string }[] = [];

        for (const entry of prev) {
          const speed = 0.0006 + Math.random() * 0.0002;
          const newProgress = Math.min(entry.progress + delta * speed, 1);
          if (newProgress >= 1) {
            completed.push({ toNode: entry.toNode, dn: entry.dn });
          } else {
            updated.push({ ...entry, progress: newProgress });
          }
        }

        // Add completed entries to target nodes
        if (completed.length > 0) {
          setNodes(prev => {
            const next = [...prev];
            for (const c of completed) {
              const node = next[c.toNode];
              next[c.toNode] = {
                ...node,
                entries: [c.dn, ...node.entries].slice(0, 6),
                status: 'idle',
              };
            }
            return next;
          });
          setSyncCount(c => c + completed.length);
        }

        return updated;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isPlaying, spawnWrite, resetState]);

  // ============================================================================
  // SVG geometry helpers
  // ============================================================================

  const svgWidth = 720;
  const svgHeight = 340;

  // Node positions (triangle layout)
  const nodePositions = [
    { x: 120, y: 80 },  // Node 1 — top left
    { x: 360, y: 260 }, // Node 2 — bottom center
    { x: 600, y: 80 },  // Node 3 — top right
  ];

  const nodeRadius = 52;

  function getEdgePath(fromIdx: number, toIdx: number): string {
    const from = nodePositions[fromIdx];
    const to = nodePositions[toIdx];
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    // Slight curve
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const nx = -dy * 0.1;
    const ny = dx * 0.1;
    return `M ${from.x} ${from.y} Q ${mx + nx} ${my + ny} ${to.x} ${to.y}`;
  }

  function getPointOnPath(fromIdx: number, toIdx: number, t: number): { x: number; y: number } {
    const from = nodePositions[fromIdx];
    const to = nodePositions[toIdx];
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const nx = -dy * 0.1;
    const ny = dx * 0.1;
    const cx = mx + nx;
    const cy = my + ny;
    // Quadratic bezier
    const u = 1 - t;
    return {
      x: u * u * from.x + 2 * u * t * cx + t * t * to.x,
      y: u * u * from.y + 2 * u * t * cy + t * t * to.y,
    };
  }

  // All bidirectional edges
  const edges = [
    [0, 1], [1, 0],
    [1, 2], [2, 1],
    [0, 2], [2, 0],
  ];

  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Multi-Master SyncRepl Architecture
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Write to any node — changes replicate to all peers via OpenLDAP syncRepl
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isPlaying
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'Pause' : 'Simulate'}
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-6 py-2.5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-6 text-xs">
        <span className="flex items-center gap-1.5 text-gray-500">
          <Activity className="w-3.5 h-3.5 text-indigo-500" />
          Writes: <span className="font-semibold text-gray-800">{writeCount}</span>
        </span>
        <span className="flex items-center gap-1.5 text-gray-500">
          <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
          SyncRepl ops: <span className="font-semibold text-gray-800">{syncCount}</span>
        </span>
        <span className="flex items-center gap-1.5 text-gray-500">
          <Users className="w-3.5 h-3.5 text-purple-500" />
          In-flight: <span className="font-semibold text-gray-800">{replicating.length}</span>
        </span>
      </div>

      {/* SVG visualization */}
      <div className="px-4 py-6 flex justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[720px]"
          style={{ height: 'auto', maxHeight: '360px' }}
        >
          <defs>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Arrow marker */}
            <marker id="syncArrow" viewBox="0 0 10 7" refX="10" refY="3.5"
              markerWidth="8" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 3.5 L 0 7 z" fill="#94a3b8" />
            </marker>
          </defs>

          {/* Connection lines (bidirectional) */}
          {edges.map(([from, to], i) => (
            <path
              key={`edge-${i}`}
              d={getEdgePath(from, to)}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity={0.8}
            />
          ))}

          {/* syncRepl label on each edge pair */}
          {[[0, 1], [1, 2], [0, 2]].map(([a, b], i) => {
            const mid = getPointOnPath(a, b, 0.5);
            return (
              <text
                key={`label-${i}`}
                x={mid.x}
                y={mid.y}
                textAnchor="middle"
                dy="-8"
                className="text-[10px] font-mono"
                fill="#6366f1"
                opacity={0.7}
              >
                syncRepl
              </text>
            );
          })}

          {/* Animated replicating entries */}
          {replicating.map(entry => {
            const pos = getPointOnPath(entry.fromNode, entry.toNode, entry.progress);
            const scale = 0.8 + Math.sin(entry.progress * Math.PI) * 0.3;
            return (
              <g key={entry.id} transform={`translate(${pos.x}, ${pos.y})`}>
                {/* Glow */}
                <circle r={10 * scale} fill={entry.color} opacity={0.15} filter="url(#glow)" />
                {/* Dot */}
                <circle r={5 * scale} fill={entry.color} opacity={0.9} />
                {/* DN label */}
                <text
                  x={0}
                  y={-12 * scale}
                  textAnchor="middle"
                  className="text-[8px] font-mono"
                  fill={entry.color}
                  fontWeight="600"
                >
                  {entry.dn.split(',')[0]}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node, idx) => {
            const pos = nodePositions[idx];
            const color = NODE_COLORS[idx];
            const isActive = node.status !== 'idle';
            return (
              <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
                {/* Pulse ring when active */}
                {isActive && (
                  <circle
                    r={nodeRadius + 6}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    opacity={0.3}
                  >
                    <animate
                      attributeName="r"
                      values={`${nodeRadius + 2};${nodeRadius + 12};${nodeRadius + 2}`}
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.4;0.1;0.4"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {/* Background */}
                <circle
                  r={nodeRadius}
                  fill="white"
                  stroke={isActive ? color : '#e2e8f0'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className="transition-all duration-300"
                />
                {/* Icon */}
                <g transform="translate(-10, -22)">
                  <Server
                    className="transition-colors duration-300"
                    width={20}
                    height={20}
                    color={color}
                  />
                </g>
                {/* Label */}
                <text
                  y={4}
                  textAnchor="middle"
                  className="text-[12px] font-semibold"
                  fill="#1e293b"
                >
                  {node.label}
                </text>
                {/* Port */}
                <text
                  y={18}
                  textAnchor="middle"
                  className="text-[10px] font-mono"
                  fill="#94a3b8"
                >
                  :{node.port}
                </text>
                {/* Status badge */}
                {node.status !== 'idle' && (
                  <g transform={`translate(${nodeRadius - 14}, ${-nodeRadius + 10})`}>
                    <rect
                      x={-18} y={-8}
                      width={36} height={16}
                      rx={8}
                      fill={node.status === 'writing' ? '#fef3c7' : '#ecfdf5'}
                      stroke={node.status === 'writing' ? '#f59e0b' : '#10b981'}
                      strokeWidth={1}
                    />
                    <text
                      textAnchor="middle"
                      y={3}
                      className="text-[7px] font-semibold"
                      fill={node.status === 'writing' ? '#92400e' : '#065f46'}
                    >
                      {node.status === 'writing' ? 'WRITE' : 'SYNC'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Entry logs per node */}
      <div className="px-6 pb-5 grid grid-cols-3 gap-3">
        {nodes.map((node, idx) => (
          <div
            key={node.id}
            className="rounded-lg border border-gray-100 bg-gray-50/70 overflow-hidden"
          >
            <div
              className="px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 border-b border-gray-100"
              style={{ color: NODE_COLORS[idx] }}
            >
              <Server className="w-3 h-3" />
              {node.label}
              <span className="ml-auto text-gray-400 font-mono text-[10px]">:{node.port}</span>
            </div>
            <div className="px-2 py-1.5 space-y-0.5 min-h-[72px]">
              {node.entries.length === 0 ? (
                <p className="text-[10px] text-gray-300 italic py-2 text-center">No entries yet</p>
              ) : (
                node.entries.map((dn, i) => (
                  <div
                    key={`${dn}-${i}`}
                    className="text-[10px] font-mono text-gray-600 px-1.5 py-0.5 rounded bg-white border border-gray-100 truncate transition-all duration-300"
                    style={{
                      opacity: 1 - i * 0.12,
                      transform: i === 0 ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <span className="text-indigo-500 font-semibold">dn:</span>{' '}
                    {dn}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="px-6 pb-4 flex flex-wrap items-center gap-4 text-[11px] text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
          syncRepl consumer/provider
        </span>
        <span className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-amber-500" />
          Write to any node
        </span>
        <span className="flex items-center gap-1.5">
          <Database className="w-3 h-3 text-emerald-500" />
          Bidirectional replication
        </span>
      </div>
    </div>
  );
}
