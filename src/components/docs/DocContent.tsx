'use client';

import { useEffect, useState } from 'react';

interface DocContentProps {
  content: string;
}

// Simple markdown renderer for client-side
function renderMarkdown(content: string): string {
  return content
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="overflow-x-auto rounded-lg bg-gray-900 p-4 mb-4 border border-gray-700"><code class="text-sm font-mono text-gray-300">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 text-sm font-mono">$1</code>')
    // Headers
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 mb-4 mt-8">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold text-gray-900 mb-3 mt-8">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-gray-800 mb-3 mt-6">$1</h3>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-gray-900">$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-700 underline">$1</a>')
    // Lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-700">$1</li>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-4">$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-gray-200 my-8" />')
    // Paragraphs (must be last)
    .replace(/\n\n([^<].*?)\n\n/g, '\n\n<p class="text-gray-700 mb-4 leading-relaxed">$1</p>\n\n');
}

export default function DocContent({ content }: DocContentProps) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    setHtml(renderMarkdown(content));
  }, [content]);

  if (!html) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    );
  }

  return (
    <article 
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
