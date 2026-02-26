'use client';

import { useState, useEffect } from 'react';
import { 
  Container, Boxes, Server, Database, 
  Settings, Network, Shield, ChevronRight,
  Play, Pause, Clock, BookOpen
} from 'lucide-react';

interface LearningStep {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  duration: string;
  lessons: { title: string; desc: string }[];
  lab?: string;
}

const STEPS: LearningStep[] = [
  { 
    id: 'intro', 
    label: 'Introduction', 
    sublabel: 'Start',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    duration: '30m',
    lessons: [
      { title: 'Course Overview', desc: 'Understand Qdrant\'s architecture and advantages' },
      { title: 'Course Roadmap', desc: 'Map out the learning journey' },
    ]
  },
  { 
    id: 'deploy', 
    label: 'Deployment', 
    sublabel: '3 Ways',
    icon: <Container className="w-5 h-5" />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    duration: '1.5h',
    lessons: [
      { title: 'Docker Deployment', desc: 'Run Qdrant in a single container' },
      { title: 'Docker Compose', desc: 'Multi-service setup with persistence' },
      { title: 'Kubernetes with Helm', desc: 'Production deployment on K8s' },
    ],
    lab: 'Deploy Qdrant three ways and compare'
  },
  { 
    id: 'config', 
    label: 'Configuration', 
    sublabel: 'Tune',
    icon: <Settings className="w-5 h-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    duration: '1h',
    lessons: [
      { title: 'Configuration File', desc: 'Master config.yaml parameters' },
      { title: 'Storage & Memory', desc: 'Configure storage options' },
      { title: 'Performance Tuning', desc: 'Optimize for your workload' },
    ]
  },
  { 
    id: 'data', 
    label: 'Data Operations', 
    sublabel: 'Vectors',
    icon: <Database className="w-5 h-5" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    duration: '1h',
    lessons: [
      { title: 'Collections & Points', desc: 'Create collections, insert vectors' },
      { title: 'Vector Types & Quantization', desc: 'Scalar and product quantization' },
      { title: 'Payload & Filtering', desc: 'Index payloads, filter queries' },
    ],
    lab: 'Build a semantic search system with payload filtering'
  },
  { 
    id: 'cluster', 
    label: 'Distributed', 
    sublabel: 'Scale',
    icon: <Network className="w-5 h-5" />,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    duration: '1.5h',
    lessons: [
      { title: 'Clustering Concepts', desc: 'Understand distributed architecture' },
      { title: 'Sharding Strategy', desc: 'Configure sharding for your data' },
      { title: 'Replication & HA', desc: 'Set up replicas for high availability' },
      { title: 'Scaling Operations', desc: 'Add and remove nodes' },
    ],
    lab: 'Create a 3-node Qdrant cluster'
  },
  { 
    id: 'prod', 
    label: 'Production', 
    sublabel: 'Ops',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    duration: '1.5h',
    lessons: [
      { title: 'Backup & Restore', desc: 'Snapshot and recovery procedures' },
      { title: 'Monitoring & Metrics', desc: 'Prometheus and Grafana setup' },
      { title: 'Security & TLS', desc: 'Enable authentication and encryption' },
      { title: 'Troubleshooting', desc: 'Debug common issues' },
    ],
    lab: 'Set up monitoring and alerts for your cluster'
  },
];

export default function QdrantLearningPath() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const currentStepData = STEPS[activeStep];

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-violet-900 to-purple-800 border-b border-violet-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Network className="w-4 h-4 text-violet-200" />
          </div>
          <span className="text-white font-semibold">Qdrant Learning Path</span>
        </div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded-lg hover:bg-white/10 text-violet-200 hover:text-white transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      {/* Path Visualization */}
      <div className="p-6 bg-gray-50">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step Card */}
              <button
                onClick={() => {
                  setActiveStep(index);
                  setIsPlaying(false);
                }}
                className={`
                  relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-500 min-w-[80px]
                  ${index === activeStep 
                    ? `${step.bgColor} ${step.borderColor} shadow-lg scale-105 ring-2 ring-offset-2 ${step.color.replace('text-', 'ring-')}` 
                    : index < activeStep 
                      ? 'bg-white border-gray-200 opacity-80'
                      : 'bg-white border-gray-200 opacity-50'
                  }
                  hover:shadow-md hover:scale-105
                `}
              >
                {/* Icon */}
                <div className={`
                  w-9 h-9 rounded-lg mb-1.5 flex items-center justify-center
                  ${index === activeStep ? step.bgColor : 'bg-gray-100'}
                  ${index === activeStep ? step.color : 'text-gray-500'}
                `}>
                  {step.icon}
                </div>
                
                {/* Labels */}
                <span className={`
                  text-xs font-semibold
                  ${index === activeStep ? 'text-gray-900' : 'text-gray-600'}
                `}>
                  {step.label}
                </span>
                <span className="text-[10px] text-gray-400">{step.sublabel}</span>
                
                {/* Duration Badge */}
                <div className={`
                  mt-1 px-1.5 py-0.5 rounded text-[9px] font-medium
                  ${index === activeStep ? 'bg-white/60 text-gray-700' : 'bg-gray-100 text-gray-500'}
                `}>
                  <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                  {step.duration}
                </div>
                
                {/* Completed Check */}
                {index < activeStep && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm">
                    ✓
                  </div>
                )}
              </button>
              
              {/* Arrow (except last) */}
              {index < STEPS.length - 1 && (
                <div className="flex items-center mx-1">
                  <ChevronRight className={`
                    w-4 h-4 transition-colors duration-500
                    ${index < activeStep ? 'text-emerald-400' : 'text-gray-300'}
                  `} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Step Details */}
      <div className={`px-6 py-5 transition-colors duration-500 ${currentStepData.bgColor}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl ${currentStepData.bgColor} ${currentStepData.color} flex items-center justify-center border-2 ${currentStepData.borderColor}`}>
            {currentStepData.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Phase {activeStep + 1}: {currentStepData.label}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              {currentStepData.duration}
              {currentStepData.lab && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-violet-700 font-medium">Lab included</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Lessons Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/2">
                  Lesson
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  What You&apos;ll Do
                </th>
              </tr>
            </thead>
            <tbody>
              {currentStepData.lessons.map((lesson, idx) => (
                <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {lesson.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {lesson.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lab Section */}
        {currentStepData.lab && (
          <div className="mt-4 p-4 rounded-xl bg-violet-100 border border-violet-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500 text-white flex items-center justify-center shrink-0">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-violet-900">Lab</div>
                <div className="text-sm text-violet-700">{currentStepData.lab}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-sm font-medium text-gray-600 shrink-0">
            {activeStep + 1} / {STEPS.length}
          </div>
        </div>
      </div>
    </div>
  );
}
