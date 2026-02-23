import Link from 'next/link';
import {
  BookOpen, BarChart2, CheckCircle2,
  ArrowLeft, Play, FileText, Clock, Github,
  Calendar, FlaskConical,
} from 'lucide-react';
import Prerequisites from '@/components/docs/Prerequisites';
import CurriculumAccordion from '@/components/layout/CurriculumAccordion';

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

interface CourseLandingProps {
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  sections: CurriculumSection[];
  basePath: string;
  level: string;
  whatYoullLearn: string[];
  updated?: string;
  totalDuration?: string;
  readingTime?: string;
  labTime?: string;
  githubUrl?: string;
}

export default function CourseLanding({
  title,
  description,
  color,
  icon,
  sections,
  basePath,
  level,
  whatYoullLearn,
  updated,
  totalDuration,
  readingTime,
  labTime,
  githubUrl,
}: CourseLandingProps) {
  const totalLessons = sections.reduce((sum, s) => sum + s.items.length, 0);
  const firstLesson = sections[0]?.items[0];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Compact hero */}
      <div style={{ background: color }}>
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Courses
          </Link>

          <div className="flex items-start gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white/90 uppercase tracking-wider">
                  {level}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 leading-tight">
                {title}
              </h1>
              <p className="text-white/70 text-sm sm:text-base max-w-3xl leading-relaxed">
                {description}
              </p>
            </div>

            {/* Course icon — large screens only */}
            <div className="hidden xl:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 shrink-0">
              {icon}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column content */}
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

          {/* LEFT — main content */}
          <div className="space-y-6">
            {/* What you'll learn */}
            {whatYoullLearn.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">What you&apos;ll learn</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {whatYoullLearn.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum accordion */}
            <CurriculumAccordion
              sections={sections}
              basePath={basePath}
              totalLessons={totalLessons}
              totalDuration={totalDuration}
            />

            {/* Prerequisites */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Prerequisites</h2>
              <Prerequisites />
            </div>
          </div>

          {/* RIGHT — sticky sidebar */}
          <div className="lg:sticky lg:top-24">
            <aside className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              {/* Preview area */}
              <div
                className="h-40 flex items-center justify-center"
                style={{ background: color }}
              >
                <div className="w-16 h-16 text-white/80 [&_svg]:w-full [&_svg]:h-full">
                  {icon}
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Free badge */}
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-green-50 text-green-700 text-sm font-semibold border border-green-100">
                  FREE Course
                </span>

                {/* Start CTA */}
                {firstLesson && (
                  <Link
                    href={`${basePath}/${firstLesson.slug}`}
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#2702a6] px-6 py-3 text-sm font-bold text-white hover:bg-[#200289] transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    Start Course Now
                  </Link>
                )}

                {/* Stats */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    This course includes
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <BookOpen className="h-4 w-4 text-gray-400 shrink-0" />
                      {totalLessons} lessons
                    </div>
                    {totalDuration && (
                      <div className="flex items-center gap-2.5 text-sm text-gray-700">
                        <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                        {totalDuration} total duration
                      </div>
                    )}
                    {readingTime && (
                      <div className="flex items-center gap-2.5 text-sm text-gray-700">
                        <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                        {readingTime} reading
                      </div>
                    )}
                    {labTime && (
                      <div className="flex items-center gap-2.5 text-sm text-gray-700">
                        <FlaskConical className="h-4 w-4 text-gray-400 shrink-0" />
                        {labTime} hands-on labs
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <BarChart2 className="h-4 w-4 text-gray-400 shrink-0" />
                      {level} level
                    </div>
                    {updated && (
                      <div className="flex items-center gap-2.5 text-sm text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                        Updated {updated}
                      </div>
                    )}
                  </div>
                </div>

                {/* GitHub link */}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </a>
                )}
              </div>
            </aside>
          </div>

        </div>
      </div>
    </main>
  );
}
