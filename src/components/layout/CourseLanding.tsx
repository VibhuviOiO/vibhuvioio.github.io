import Link from 'next/link';
import {
  BookOpen, BarChart2, CheckCircle2, ChevronRight,
  ArrowLeft, Play, FileText, Clock, Github, Youtube,
  Calendar, GraduationCap,
} from 'lucide-react';

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
  prerequisites?: string[];
  updated?: string;
  totalDuration?: string;
  readingTime?: string;
  labTime?: string;
  githubUrl?: string;
}

function LessonIcon({ type }: { type?: string }) {
  if (type === 'video') {
    return <Youtube className="h-4 w-4 text-red-400 shrink-0" />;
  }
  if (type === 'github') {
    return <Github className="h-4 w-4 text-gray-500 shrink-0" />;
  }
  return <FileText className="h-4 w-4 text-gray-400 shrink-0" />;
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
  prerequisites,
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
      {/* Full-width hero — primary dark */}
      <div style={{ background: 'linear-gradient(135deg, #200289 0%, #2702a6 50%, #3d0fd4 100%)' }}>
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/operations"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Courses
          </Link>

          <div className="flex items-start gap-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 leading-tight">{title}</h1>
              <p className="text-white/70 text-sm sm:text-base max-w-2xl mb-6 leading-relaxed">{description}</p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="flex items-center gap-1.5 text-white/60 text-sm">
                  <BookOpen className="h-4 w-4" />
                  {totalLessons} lessons
                </span>
                {totalDuration && (
                  <span className="flex items-center gap-1.5 text-white/60 text-sm">
                    <Clock className="h-4 w-4" />
                    {totalDuration}
                  </span>
                )}
                {readingTime && (
                  <span className="flex items-center gap-1.5 text-white/60 text-sm">
                    <FileText className="h-4 w-4" />
                    {readingTime} reading
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-white/60 text-sm">
                  <BarChart2 className="h-4 w-4" />
                  {level}
                </span>
                {updated && (
                  <span className="flex items-center gap-1.5 text-white/60 text-sm">
                    <Calendar className="h-4 w-4" />
                    Updated {updated}
                  </span>
                )}
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                  Free
                </span>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3 flex-wrap">
                {firstLesson && (
                  <Link
                    href={`${basePath}/${firstLesson.slug}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-[#2702a6] hover:bg-gray-100 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    Start Course
                  </Link>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 border border-white/20 px-5 py-3 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
              </div>
            </div>

            {/* Icon */}
            <div className="hidden lg:flex items-center justify-center w-28 h-28 rounded-2xl bg-white/10 shrink-0">
              {icon}
            </div>
          </div>
        </div>
      </div>

      {/* Content — full width */}
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* What you'll learn */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">What you&apos;ll learn</h2>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {whatYoullLearn.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            {prerequisites && prerequisites.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Prerequisites</h2>
                <ul className="space-y-2">
                  {prerequisites.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Curriculum */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Course Curriculum</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {sections.length} sections &middot; {totalLessons} lessons
                    {totalDuration && <> &middot; {totalDuration} total</>}
                  </p>
                </div>
              </div>

              {sections.map((section, sIdx) => (
                <div key={sIdx} className="border-b border-gray-100 last:border-0">
                  <div className="px-6 py-3 bg-gray-50/80 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{section.title}</span>
                    <span className="text-xs text-gray-400">{section.items.length} lessons</span>
                  </div>
                  <div>
                    {section.items.map((item, idx) => (
                      <Link
                        key={item.id}
                        href={`${basePath}/${item.slug}`}
                        className="group flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors border-t border-gray-50 first:border-0"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-500 group-hover:bg-[#2702a6] group-hover:text-white transition-colors">
                          {idx + 1}
                        </span>
                        <LessonIcon type={item.type} />
                        <span className="text-sm text-gray-700 group-hover:text-[#2702a6] transition-colors flex-1">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-3">
                          {item.videoUrl && (
                            <Youtube className="h-3.5 w-3.5 text-red-400" />
                          )}
                          {item.githubUrl && (
                            <Github className="h-3.5 w-3.5 text-gray-400" />
                          )}
                          {item.duration && (
                            <span className="text-[11px] text-gray-400 whitespace-nowrap">
                              {item.duration}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Course card */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-gray-900">Free</div>
                  <p className="text-xs text-gray-500 mt-1">Full access to all lessons</p>
                </div>

                {firstLesson && (
                  <Link
                    href={`${basePath}/${firstLesson.slug}`}
                    className="flex items-center justify-center gap-2 w-full rounded-lg py-3 text-sm font-bold text-white transition-colors"
                    style={{ background: 'linear-gradient(135deg, #200289 0%, #2702a6 100%)' }}
                  >
                    <Play className="h-4 w-4" />
                    Start Course
                  </Link>
                )}

                <div className="space-y-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span>{totalLessons} lessons</span>
                  </div>
                  {totalDuration && (
                    <div className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{totalDuration} total</span>
                    </div>
                  )}
                  {readingTime && (
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span>{readingTime} reading</span>
                    </div>
                  )}
                  {labTime && (
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      <span>{labTime} hands-on</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <BarChart2 className="h-4 w-4 text-gray-400" />
                    <span>{level} level</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>Hands-on docs + code</span>
                  </div>
                  {githubUrl && (
                    <div className="flex items-center gap-2.5">
                      <Github className="h-4 w-4 text-gray-400" />
                      <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-[#2702a6] hover:underline">
                        Source code
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Share / info */}
              {updated && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                  <p className="text-xs text-gray-400">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Last updated {updated}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
