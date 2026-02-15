interface DocContentProps {
  content: string;
}

// Simple markdown renderer for server-side rendering
function renderMarkdown(content: string): string {
  // Remove excessive indentation from content
  const lines = content.split('\n');
  const cleanedLines = lines.map(line => {
    // Remove leading whitespace while preserving relative indentation
    return line.replace(/^[\s\t]{8,}/, '');  // Remove 8+ spaces/tabs at start
  });
  const cleaned = cleanedLines.join('\n');
  
  return cleaned
    // Code blocks with language
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="overflow-x-auto rounded-lg bg-gray-900 p-4 mb-4 border border-gray-700"><code class="text-sm font-mono text-gray-300">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 text-sm font-mono">$1</code>')
    // Headers (with optional leading whitespace)
    .replace(/^\s*# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 mb-4 mt-8">$1</h1>')
    .replace(/^\s*## (.+)$/gm, '<h2 class="text-2xl font-semibold text-gray-900 mb-3 mt-8">$1</h2>')
    .replace(/^\s*### (.+)$/gm, '<h3 class="text-xl font-semibold text-gray-800 mb-3 mt-6">$1</h3>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-gray-900">$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg border border-gray-200 my-6" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-700 underline">$1</a>')
    // Lists (with optional leading whitespace)
    .replace(/^\s*- (.+)$/gm, '<li class="ml-4 text-gray-700">$1</li>')
    // Blockquotes (with optional leading whitespace)
    .replace(/^\s*> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-4">$1</blockquote>')
    // Horizontal rule (with optional leading whitespace)
    .replace(/^\s*---$/gm, '<hr class="border-gray-200 my-8" />')
    // Paragraphs (must be last)
    .replace(/\n\n([^<].*?)\n\n/g, '\n\n<p class="text-gray-700 mb-4 leading-relaxed">$1</p>\n\n');
}

// Server component - renders markdown to HTML at build time
export default function DocContent({ content }: DocContentProps) {
  const html = renderMarkdown(content);
  
  return (
    <div 
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
