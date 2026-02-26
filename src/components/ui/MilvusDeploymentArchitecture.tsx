'use client';

import { useState } from 'react';
import { 
  Server, Database, HardDrive, Activity, 
  Layers, Box, Container, Search,
  Cpu, ArrowRightLeft
} from 'lucide-react';

interface DeploymentMode {
  id: 'standalone' | 'distributed';
  label: string;
  description: string;
  containerCount: number;
}

const MODES: DeploymentMode[] = [
  { 
    id: 'standalone', 
    label: 'Standalone', 
    description: 'Single container with embedded services',
    containerCount: 1
  },
  { 
    id: 'distributed', 
    label: 'Docker Compose', 
    description: 'Separate containers per component',
    containerCount: 10
  },
];

// Component definitions
interface CompDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  standalone?: 'embedded' | 'internal';
}

const COMPONENTS: CompDef[] = [
  { 
    id: 'proxy', 
    label: 'Proxy', 
    icon: <Server className="w-4 h-4" />, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    standalone: 'internal'
  },
  { 
    id: 'rootcoord', 
    label: 'RootCoord', 
    icon: <Activity className="w-4 h-4" />, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    standalone: 'internal'
  },
  { 
    id: 'querycoord', 
    label: 'QueryCoord', 
    icon: <Activity className="w-4 h-4" />, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    standalone: 'internal'
  },
  { 
    id: 'datacoord', 
    label: 'DataCoord', 
    icon: <Activity className="w-4 h-4" />, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    standalone: 'internal'
  },
  { 
    id: 'indexcoord', 
    label: 'IndexCoord', 
    icon: <Activity className="w-4 h-4" />, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    standalone: 'internal'
  },
  { 
    id: 'querynode', 
    label: 'QueryNode', 
    icon: <Search className="w-4 h-4" />, 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    standalone: 'internal'
  },
  { 
    id: 'datanode', 
    label: 'DataNode', 
    icon: <Database className="w-4 h-4" />, 
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    standalone: 'internal'
  },
  { 
    id: 'indexnode', 
    label: 'IndexNode', 
    icon: <Layers className="w-4 h-4" />, 
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    standalone: 'internal'
  },
  { 
    id: 'etcd', 
    label: 'etcd', 
    icon: <Database className="w-4 h-4" />, 
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    standalone: 'embedded'
  },
  { 
    id: 'minio', 
    label: 'MinIO', 
    icon: <HardDrive className="w-4 h-4" />, 
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    standalone: 'embedded'
  },
];

function ComponentCard({ 
  comp, 
  mode,
  isExternal = false
}: { 
  comp: CompDef; 
  mode: 'standalone' | 'distributed';
  isExternal?: boolean;
}) {
  const isEmbedded = mode === 'standalone' && comp.standalone === 'embedded';
  const isInternal = mode === 'standalone' && comp.standalone === 'internal';
  
  return (
    <div 
      className={`
        relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300
        ${comp.bgColor} ${comp.borderColor}
        ${isEmbedded ? 'ring-2 ring-offset-2 ring-red-300' : ''}
        ${isExternal ? 'shadow-md' : ''}
        hover:shadow-lg hover:scale-105
      `}
    >
      <div className={`w-8 h-8 rounded-lg ${comp.bgColor} ${comp.color} flex items-center justify-center mb-1.5`}>
        {comp.icon}
      </div>
      <span className="text-[10px] font-semibold text-gray-700">{comp.label}</span>
      
      {isEmbedded && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold">
          Embedded
        </div>
      )}
      
      {mode === 'distributed' && isExternal && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center">
          <Container className="w-2.5 h-2.5 text-gray-400" />
        </div>
      )}
    </div>
  );
}

export default function MilvusDeploymentArchitecture() {
  const [mode, setMode] = useState<'standalone' | 'distributed'>('standalone');
  
  const internalComps = COMPONENTS.filter(c => c.standalone === 'internal');
  const externalComps = COMPONENTS.filter(c => c.standalone === 'embedded');
  
  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white">
      {/* Header with Toggle */}
      <div className="px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Box className="h-5 w-5 text-cyan-400" />
            <span className="text-white font-semibold">Deployment Architecture</span>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-800">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${mode === m.id 
                    ? 'bg-cyan-500 text-white shadow-md' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }
                `}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Mode Description */}
        <p className="mt-2 text-sm text-gray-400">
          {MODES.find(m => m.id === mode)?.description}
          {' '}
          <span className="text-cyan-400 font-medium">
            {MODES.find(m => m.id === mode)?.containerCount} container{MODES.find(m => m.id === mode)?.containerCount !== 1 ? 's' : ''}
          </span>
        </p>
      </div>

      {/* Architecture View */}
      <div className="p-6">
        {mode === 'standalone' ? (
          /* Standalone View */
          <div className="space-y-4">
            {/* Single Container */}
            <div className="relative rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/30 p-6">
              <div className="absolute -top-3 left-4 px-2 bg-white">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Docker Container</span>
              </div>
              
              {/* Internal Components Grid */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {internalComps.map((comp) => (
                  <ComponentCard key={comp.id} comp={comp} mode={mode} />
                ))}
              </div>
              
              {/* Embedded Services Row */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-blue-200">
                <span className="text-xs text-gray-500 mr-2">Embedded Services:</span>
                {externalComps.map((comp) => (
                  <div key={comp.id} className="flex items-center gap-2">
                    <ComponentCard comp={comp} mode={mode} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                  <Container className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Single Container</div>
                  <div className="text-xs text-gray-500">All-in-one deployment</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Embedded etcd</div>
                  <div className="text-xs text-gray-500">Built-in metadata</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-50 border border-cyan-100">
                <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center text-white">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Embedded MinIO</div>
                  <div className="text-xs text-gray-500">Built-in storage</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Docker Compose View */
          <div className="space-y-4">
            {/* Layers */}
            <div className="space-y-3">
              {/* Access Layer */}
              <div className="flex items-center gap-4">
                <span className="w-20 text-xs font-bold text-gray-400 uppercase">Access</span>
                <div className="flex-1 flex gap-3">
                  <ComponentCard comp={COMPONENTS.find(c => c.id === 'proxy')!} mode={mode} isExternal />
                </div>
              </div>
              
              {/* Coordination Layer */}
              <div className="flex items-center gap-4">
                <span className="w-20 text-xs font-bold text-gray-400 uppercase">Coord</span>
                <div className="flex-1 flex gap-3">
                  {COMPONENTS.filter(c => ['rootcoord', 'querycoord', 'datacoord', 'indexcoord'].includes(c.id)).map(comp => (
                    <ComponentCard key={comp.id} comp={comp} mode={mode} isExternal />
                  ))}
                </div>
              </div>
              
              {/* Worker Layer */}
              <div className="flex items-center gap-4">
                <span className="w-20 text-xs font-bold text-gray-400 uppercase">Workers</span>
                <div className="flex-1 flex gap-3">
                  {COMPONENTS.filter(c => ['querynode', 'datanode', 'indexnode'].includes(c.id)).map(comp => (
                    <ComponentCard key={comp.id} comp={comp} mode={mode} isExternal />
                  ))}
                </div>
              </div>
              
              {/* Storage Layer */}
              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <span className="w-20 text-xs font-bold text-gray-400 uppercase">Storage</span>
                <div className="flex-1 flex gap-3">
                  {COMPONENTS.filter(c => ['etcd', 'minio'].includes(c.id)).map(comp => (
                    <ComponentCard key={comp.id} comp={comp} mode={mode} isExternal />
                  ))}
                  {/* Pulsar for distributed */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl border-2 bg-orange-50 border-orange-200 hover:shadow-lg hover:scale-105 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-1.5">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-700">Pulsar</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 pt-4">
              {[
                { label: 'Containers', value: '10+', color: 'bg-gray-100' },
                { label: 'Coordinators', value: '4', color: 'bg-amber-50' },
                { label: 'Worker Types', value: '3', color: 'bg-emerald-50' },
                { label: 'Storage Svcs', value: '3', color: 'bg-red-50' },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.color} rounded-xl p-3 text-center border border-gray-200`}>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Comparison */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">Access</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-gray-600">Coordinator</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-gray-600">Query</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-gray-600">Data/Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-500" />
            <span className="text-gray-600">Index</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600">etcd</span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-gray-400">
            <ArrowRightLeft className="w-4 h-4" />
            <span className="text-xs">Toggle to compare</span>
          </div>
        </div>
      </div>
    </div>
  );
}
