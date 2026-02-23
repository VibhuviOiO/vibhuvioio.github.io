import { Github, Clock, BookOpen, FlaskConical } from 'lucide-react';

interface LessonHeaderProps {
  title: string;
  description?: string;
  duration?: string;
  readingTime?: string;
  labTime?: string;
  githubUrl?: string;
}

export default function LessonHeader({
  title,
  description,
  duration,
  readingTime,
  labTime,
  githubUrl,
}: LessonHeaderProps) {
  const hasMeta = duration || readingTime || labTime;

  return (
    <div className="border-b border-gray-200 pb-6 mb-8">
      <div className="flex items-start gap-3 mb-3">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {title}
        </h1>
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-1 rounded-md bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 transition-colors shrink-0"
            title="View source on GitHub"
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>
        )}
      </div>
      {description && (
        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mb-3">
          {description}
        </p>
      )}
      {hasMeta && (
        <div className="flex items-center gap-4 flex-wrap">
          {duration && (
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              {duration}
            </span>
          )}
          {readingTime && (
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <BookOpen className="h-3.5 w-3.5" />
              {readingTime} reading
            </span>
          )}
          {labTime && (
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <FlaskConical className="h-3.5 w-3.5" />
              {labTime} lab
            </span>
          )}
        </div>
      )}
    </div>
  );
}
