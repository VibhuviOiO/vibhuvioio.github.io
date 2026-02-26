'use client';

import { useState, useEffect } from 'react';
import { 
  UserCircle, Database, Boxes, BarChart3,
  DollarSign, Shield, ChevronRight,
  Play, Pause, TreePine
} from 'lucide-react';

interface LearningStep {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const STEPS: LearningStep[] = [
  { 
    id: 'setup', 
    label: 'Setup', 
    sublabel: 'Account',
    icon: <UserCircle className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  { 
    id: 'first', 
    label: 'First Index', 
    sublabel: 'Create',
    icon: <Database className="w-5 h-5" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  { 
    id: 'concepts', 
    label: 'Concepts', 
    sublabel: 'Arch',
    icon: <Boxes className="w-5 h-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  { 
    id: 'manage', 
    label: 'Manage', 
    sublabel: 'Indexes',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  { 
    id: 'optimize', 
    label: 'Optimize', 
    sublabel: 'Cost',
    icon: <DollarSign className="w-5 h-5" />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50'
  },
  { 
    id: 'prod', 
    label: 'Production', 
    sublabel: 'Ops',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50'
  },
];

export default function PineconeLearningPath() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-green-800 border-b border-emerald-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <TreePine className="w-4 h-4 text-emerald-200" />
          </div>
          <span className="text-white font-semibold">Pinecone Learning Path</span>
        </div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded-lg hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      {/* Path Visualization */}
      <div className="p-8 bg-gray-50">
        <div className="flex items-center justify-center gap-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step Card */}
              <button
                onClick={() => setActiveStep(index)}
                className={`
                  relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-500
                  ${index === activeStep 
                    ? `${step.bgColor} ${step.color.replace('text-', 'border-')} shadow-lg scale-105` 
                    : index < activeStep 
                      ? 'bg-white border-gray-200 opacity-70'
                      : 'bg-white border-gray-200 opacity-50'
                  }
                  hover:shadow-md hover:scale-105
                `}
              >
                {/* Icon */}
                <div className={`
                  w-10 h-10 rounded-lg mb-2 flex items-center justify-center
                  ${index === activeStep ? step.bgColor : 'bg-gray-100'}
                  ${index === activeStep ? step.color : 'text-gray-500'}
                `}>
                  {step.icon}
                </div>
                
                {/* Labels */}
                <span className={`
                  text-sm font-semibold
                  ${index === activeStep ? 'text-gray-900' : 'text-gray-600'}
                `}>
                  {step.label}
                </span>
                <span className="text-xs text-gray-400">{step.sublabel}</span>
                
                {/* Active Indicator */}
                {index === activeStep && (
                  <div className={`
                    absolute -bottom-2 left-1/2 -translate-x-1/2 
                    w-2 h-2 rounded-full
                    ${step.color.replace('text-', 'bg-')}
                    animate-pulse
                  `} />
                )}
                
                {/* Completed Check */}
                {index < activeStep && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </button>
              
              {/* Arrow (except last) */}
              {index < STEPS.length - 1 && (
                <div className="flex items-center mx-2">
                  <ChevronRight className={`
                    w-5 h-5 transition-colors duration-500
                    ${index < activeStep ? 'text-emerald-400' : 'text-gray-300'}
                  `} />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-8 mx-12">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 transition-all duration-500"
              style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-center text-sm text-gray-500">
            Step {activeStep + 1} of {STEPS.length}: <span className="font-semibold text-gray-700">{STEPS[activeStep].label}</span>
          </div>
        </div>
      </div>

      {/* Step Details */}
      <div className="px-6 py-4 bg-white border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Cloud Service', value: 'Fully Managed', desc: 'No infrastructure to maintain' },
            { label: 'Pricing Models', value: '2 Options', desc: 'Pods vs Serverless' },
            { label: 'Focus', value: 'Optimization', desc: 'Cost and performance' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
              <div className="text-lg font-bold text-gray-900 mt-1">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
