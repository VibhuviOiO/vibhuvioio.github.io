'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { ChevronDown, CheckCircle2, Circle, BookOpen, ArrowLeft } from 'lucide-react';

interface LessonItem {
  id: string;
  title: string;
  slug: string;
}

interface CurriculumSection {
  title: string;
  items: LessonItem[];
}

interface CourseSidebarProps {
  sections: CurriculumSection[];
  basePath: string;
  courseTitle: string;
  courseSlug: string;
}

// Sidebar for lesson pages — shows curriculum with active lesson highlighted
export function CourseSidebar({ sections, basePath, courseTitle, courseSlug }: CourseSidebarProps) {
  const pathname = usePathname();
  const totalLessons = sections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <aside className="w-72 shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-4rem)]">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        {/* Course header */}
        <div className="p-4 border-b border-gray-200">
          <Link
            href="/operations"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-2"
          >
            <ArrowLeft className="h-3 w-3" />
            All Courses
          </Link>
          <h2 className="text-sm font-bold text-gray-900 leading-tight">{courseTitle}</h2>
          <p className="text-[11px] text-gray-500 mt-1">{totalLessons} lessons</p>
        </div>

        {/* Curriculum sections */}
        <nav className="p-2">
          {sections.map((section, sIdx) => (
            <CurriculumAccordion
              key={sIdx}
              section={section}
              sectionIndex={sIdx}
              basePath={basePath}
              pathname={pathname}
              defaultOpen={section.items.some(item => pathname === `${basePath}/${item.slug}`)}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

function CurriculumAccordion({
  section,
  sectionIndex,
  basePath,
  pathname,
  defaultOpen,
}: {
  section: CurriculumSection;
  sectionIndex: number;
  basePath: string;
  pathname: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 text-left rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          {section.title}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">{section.items.length}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5 ml-1">
          {section.items.map((item, idx) => {
            const href = `${basePath}/${item.slug}`;
            const isActive = pathname === href;
            const lessonNum = section.items.indexOf(item) + 1;
            return (
              <Link
                key={item.id}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#2702a6] text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {lessonNum}
                </span>
                <span className="truncate text-[13px]">{item.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Lesson page layout — sidebar + content
export function CourseLessonLayout({
  children,
  sections,
  basePath,
  courseTitle,
  courseSlug,
}: {
  children: ReactNode;
  sections: CurriculumSection[];
  basePath: string;
  courseTitle: string;
  courseSlug: string;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <CourseSidebar
        sections={sections}
        basePath={basePath}
        courseTitle={courseTitle}
        courseSlug={courseSlug}
      />
      <main className="flex-1 min-w-0 bg-white">
        <div className="w-full px-6 md:px-10 lg:px-12 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
