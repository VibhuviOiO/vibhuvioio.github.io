'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, FileText, PlayCircle, Link2, Github, Clock } from 'lucide-react';

interface LessonItem {
  id: string;
  title: string;
  slug: string;
  duration?: string;
  type?: string;
  videoUrl?: string;
  githubUrl?: string;
}

interface CurriculumSection {
  title: string;
  items: LessonItem[];
}

interface CurriculumAccordionProps {
  sections: CurriculumSection[];
  basePath: string;
  totalLessons: number;
  totalDuration?: string;
}

// Content type config — icon, label, colours
function getTypeConfig(type?: string, hasVideo?: boolean) {
  if (type === 'video' || hasVideo) {
    return {
      icon: <PlayCircle className="h-4 w-4" />,
      label: 'Video',
      iconClass: 'bg-red-50 text-red-500',
      labelClass: 'text-red-500',
    };
  }
  if (type === 'github') {
    return {
      icon: <Link2 className="h-4 w-4" />,
      label: 'Reference',
      iconClass: 'bg-purple-50 text-purple-500',
      labelClass: 'text-purple-500',
    };
  }
  // default: doc / article
  return {
    icon: <FileText className="h-4 w-4" />,
    label: 'Article',
    iconClass: 'bg-blue-50 text-blue-500',
    labelClass: 'text-blue-500',
  };
}

function LessonRow({ item, basePath }: { item: LessonItem; basePath: string }) {
  const cfg = getTypeConfig(item.type, !!item.videoUrl);

  // Reference / github-only lessons open the GitHub URL directly
  const isExternal = item.type === 'github' && !item.slug;

  const rowClass =
    'group flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-0';

  const content = (
    <>
      {/* Type icon */}
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.iconClass}`}>
        {cfg.icon}
      </span>

      {/* Title + type label */}
      <div className="flex-1 min-w-0">
        <span className="block text-sm text-gray-800 group-hover:text-[#2702a6] transition-colors leading-snug truncate">
          {item.title}
        </span>
        <span className={`text-[11px] font-medium ${cfg.labelClass}`}>{cfg.label}</span>
      </div>

      {/* Right side: GitHub chip + duration */}
      <div className="flex items-center gap-2 shrink-0">
        {item.githubUrl && item.type !== 'github' && (
          <a
            href={item.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 rounded-md border border-gray-200 px-1.5 py-0.5 text-[11px] text-gray-500 hover:text-[#2702a6] hover:border-[#2702a6] transition-colors"
          >
            <Github className="h-3 w-3" />
            Code
          </a>
        )}
        {item.duration && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400 whitespace-nowrap">
            <Clock className="h-3 w-3" />
            {item.duration}
          </span>
        )}
      </div>
    </>
  );

  if (isExternal && item.githubUrl) {
    return (
      <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className={rowClass}>
        {content}
      </a>
    );
  }

  return (
    <Link href={`${basePath}/${item.slug}`} className={rowClass}>
      {content}
    </Link>
  );
}

function AccordionSection({
  section,
  basePath,
  defaultOpen,
}: {
  section: CurriculumSection;
  basePath: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Count by type for section summary
  const videosCount = section.items.filter((i) => i.type === 'video' || i.videoUrl).length;
  const refsCount = section.items.filter((i) => i.type === 'github').length;
  const docsCount = section.items.length - videosCount - refsCount;

  const summaryParts: string[] = [];
  if (docsCount > 0) summaryParts.push(`${docsCount} article${docsCount > 1 ? 's' : ''}`);
  if (videosCount > 0) summaryParts.push(`${videosCount} video${videosCount > 1 ? 's' : ''}`);
  if (refsCount > 0) summaryParts.push(`${refsCount} ref${refsCount > 1 ? 's' : ''}`);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ChevronDown
            className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
          <span className="text-sm font-semibold text-gray-800 truncate">{section.title}</span>
        </div>
        <span className="text-xs text-gray-400 ml-4 shrink-0">{summaryParts.join(' · ')}</span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          {section.items.map((item) => (
            <LessonRow key={item.id} item={item} basePath={basePath} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CurriculumAccordion({
  sections,
  basePath,
  totalLessons,
  totalDuration,
}: CurriculumAccordionProps) {
  const totalVideos = sections.flatMap((s) => s.items).filter((i) => i.type === 'video' || i.videoUrl).length;
  const totalRefs = sections.flatMap((s) => s.items).filter((i) => i.type === 'github').length;
  const totalDocs = totalLessons - totalVideos - totalRefs;

  const headerParts: string[] = [];
  if (totalDocs > 0) headerParts.push(`${totalDocs} articles`);
  if (totalVideos > 0) headerParts.push(`${totalVideos} videos`);
  if (totalRefs > 0) headerParts.push(`${totalRefs} references`);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Course content</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {sections.length} sections &middot; {headerParts.join(' · ')}
          {totalDuration && <> &middot; {totalDuration} total</>}
        </p>
      </div>

      {sections.map((section, sIdx) => (
        <AccordionSection
          key={sIdx}
          section={section}
          basePath={basePath}
          defaultOpen={sIdx === 0}
        />
      ))}
    </div>
  );
}
