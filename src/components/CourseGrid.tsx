'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, BookOpen, Clock, Search, Database, Shield,
  Layers, Activity, Globe, Network,
} from 'lucide-react';

type Operation = {
  id: string;
  name: string;
  iconName: string;
  description: string;
  docs?: string;
  github?: string;
  tags: string[];
  lessons: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  updated: string;
  status: 'live' | 'coming';
};

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Search, Database, Shield, Layers, Activity, Globe, Network,
};

const filters = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;

function LevelBadge({ level }: { level: string }) {
  const colorsLight: Record<string, string> = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-amber-100 text-amber-700',
    Advanced: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${colorsLight[level] || 'bg-gray-100 text-gray-600'}`}>
      {level}
    </span>
  );
}

function CourseCard({ op }: { op: Operation }) {
  const Icon = iconMap[op.iconName] || Globe;
  const isLive = op.status === 'live';
  const Wrapper = isLive ? Link : 'div';
  const wrapperProps = isLive ? { href: op.docs! } : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={`group flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 ${
        isLive
          ? 'border-gray-200 bg-white hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer'
          : 'border-gray-100 bg-white/60 opacity-70'
      }`}
    >
      <div
        className="relative h-52 flex items-center justify-center"
        style={{
          background: isLive
            ? 'linear-gradient(135deg, #200289 0%, #2702a6 50%, #3d0fd4 100%)'
            : 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
        }}
      >
        <Icon className="h-20 w-20 text-white/20" strokeWidth={1} />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <h3 className="text-xl font-extrabold text-white leading-tight">
            {op.name}
          </h3>
        </div>
        {!isLive && (
          <div className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-500 uppercase">
            Coming Soon
          </div>
        )}
        {isLive && (
          <div className="absolute top-4 left-5">
            <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
              Free
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className={`flex items-center gap-1.5 text-sm ${isLive ? 'text-gray-600' : 'text-gray-300'}`}>
            <BookOpen className="h-4 w-4" />
            <span>{op.lessons} lessons</span>
          </div>
          <div className={`flex items-center gap-1.5 text-sm ${isLive ? 'text-gray-600' : 'text-gray-300'}`}>
            <Clock className="h-4 w-4" />
            <span>{op.duration}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <LevelBadge level={op.level} />
          {op.tags.map((tag) => (
            <span
              key={tag}
              className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                isLive ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-300'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          {op.updated ? (
            <span className={`text-xs ${isLive ? 'text-gray-400' : 'text-gray-300'}`}>Updated {op.updated}</span>
          ) : (
            <span />
          )}
          {isLive && (
            <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-[#2702a6] group-hover:translate-x-1 transition-all" />
          )}
        </div>
      </div>
    </Wrapper>
  );
}

export default function CourseGrid({
  liveCourses,
  comingCourses,
}: {
  liveCourses: Operation[];
  comingCourses: Operation[];
}) {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filterCourses = (courses: Operation[]) =>
    activeFilter === 'All' ? courses : courses.filter((c) => c.level === activeFilter);

  const filteredLive = filterCourses(liveCourses);
  const filteredComing = filterCourses(comingCourses);

  return (
    <>
      {/* Live courses */}
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-2xl font-extrabold text-gray-900">Courses to get you started</h2>
          <div className="flex items-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === f
                    ? 'bg-[#2702a6] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#2702a6]/30 hover:text-[#2702a6]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        {filteredLive.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLive.map((op) => (
              <CourseCard key={op.id} op={op} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No live courses match this filter.</p>
        )}
      </div>

      {/* Coming soon */}
      <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Coming Soon</h2>
        {filteredComing.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredComing.map((op) => (
              <CourseCard key={op.id} op={op} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No upcoming courses match this filter.</p>
        )}
      </div>
    </>
  );
}
