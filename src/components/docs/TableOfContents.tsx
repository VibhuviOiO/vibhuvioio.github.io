'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

// Extract headings from markdown content
function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Match h2 and h3 headings (## and ###)
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*/g, '').replace(/\*/g, '').trim();
      // Create ID from text (same logic as renderMarkdown)
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      headings.push({ id, text, level });
    }
  }
  
  return headings;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const headings = extractHeadings(content);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Add IDs to rendered headings
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );

    // Observe all h2 and h3 elements
    const h2Elements = document.querySelectorAll('h2[id]');
    const h3Elements = document.querySelectorAll('h3[id]');
    
    h2Elements.forEach((el) => observer.observe(el));
    h3Elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [content]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; // Account for sticky header
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <nav className="hidden xl:block w-48 shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          On this page
        </h4>
        <ul className="space-y-0.5">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={`
                ${heading.level === 3 ? 'pl-4' : ''}
              `}
            >
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`
                  block w-full text-left py-1 text-[13px] leading-snug transition-all
                  ${activeId === heading.id
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
