interface DocContentProps {
  content: string;
}

// Simple syntax highlighter for YAML
function highlightYAML(code: string): string {
  return code
    // Comments (must be first)
    .replace(/(#.*$)/gm, '<span class="text-gray-500">$1</span>')
    // Keys (before colon) - match at start of line or after whitespace
    .replace(/(^|\s+)([a-zA-Z_][a-zA-Z0-9_]*)(:)/gm, '$1<span class="text-blue-400">$2</span><span class="text-gray-300">$3</span>')
    // String values with quotes
    .replace(/(:\s*)("[^"]*")/g, '$1<span class="text-green-400">$2</span>')
    // Numbers
    .replace(/(:\s*)(\d+)(\s*$|\s*#)/gm, '$1<span class="text-orange-400">$2</span>$3')
    // Boolean values
    .replace(/(:\s*)(true|false)(\s*$|\s*#)/gmi, '$1<span class="text-purple-400">$2</span>$3')
    // List markers at start of line
    .replace(/^(\s*)(-)(\s)(?!\s)/gm, '$1<span class="text-gray-400">$2</span>$3');
}

// Simple syntax highlighter for Bash
function highlightBash(code: string): string {
  return code
    // Comments (must be first)
    .replace(/(#.*$)/gm, '<span class="text-gray-500">$1</span>')
    // Strings in quotes (before other patterns to avoid conflicts)
    .replace(/("[^"]*"|'[^']*')/g, '<span class="text-green-400">$1</span>')
    // URLs (before commands to avoid conflicts)
    .replace(/(https?:\/\/[^\s]+)/g, '<span class="text-cyan-400">$1</span>')
    // Commands at start of line or after &&, ||, ;, |, $(
    .replace(/(^|\&\&|\|\||;|\||\$\(|\`\s*)(\s*)([a-zA-Z_][a-zA-Z0-9_-]+)/gm, '$1$2<span class="text-yellow-400">$3</span>')
    // Flags and options
    .replace(/(\s|^)(-[a-zA-Z-]+)/g, '$1<span class="text-blue-400">$2</span>');
}

// Markdown renderer with proper handling of nested elements
function renderMarkdown(content: string): string {
  // Step 1: Extract code blocks FIRST (before any processing) to preserve their indentation
  const codeBlocks: string[] = [];
  let processed = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `___CODE_BLOCK_${codeBlocks.length}___`;
    
    // Apply syntax highlighting BEFORE escaping HTML (using the raw code)
    const language = (lang || '').toLowerCase();
    // Auto-detect YAML if no language specified but content looks like YAML
    const looksLikeYAML = !language && (
      /^\s*[a-zA-Z_][a-zA-Z0-9_]*:/m.test(code) || 
      /^\s*-\s+[a-zA-Z_]/m.test(code) ||
      /:\s*["']?[^\n]*["']?\s*$/m.test(code)
    );
    // Auto-detect bash if no language specified but content looks like bash
    const looksLikeBash = !language && /^(docker|kubectl|npm|pip|python|curl|wget|cd|ls|cat|echo|export|source|mkdir|rm|cp|mv|chmod|chown)/m.test(code);
    
    let highlightedCode = code;
    if (language === 'yaml' || language === 'yml' || looksLikeYAML) {
      highlightedCode = highlightYAML(code);
    } else if (language === 'bash' || language === 'sh' || language === 'shell' || looksLikeBash) {
      highlightedCode = highlightBash(code);
    }
    
    // Now escape HTML (but preserve our span tags)
    // First protect our span tags
    const spans: string[] = [];
    highlightedCode = highlightedCode.replace(/<span class="[^"]*">[^<]*<\/span>/g, (spanMatch: string) => {
      spans.push(spanMatch);
      return `___SPAN_${spans.length - 1}___`;
    });
    
    // Escape remaining HTML
    highlightedCode = highlightedCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Restore span tags
    spans.forEach((span, i) => {
      highlightedCode = highlightedCode.replace(`___SPAN_${i}___`, span);
    });
    
    codeBlocks.push(
      `<pre class="overflow-x-auto rounded-lg bg-[#1e1e1e] p-4 mb-4"><code class="text-sm font-mono text-gray-300">${highlightedCode}</code></pre>`
    );
    return placeholder;
  });

  // Step 2: Now remove excessive indentation from the processed content (code blocks are protected)
  const lines = processed.split('\n');
  const cleanedLines = lines.map(line => line.replace(/^[\s\t]{8,}/, ''));
  processed = cleanedLines.join('\n');

  // Step 3: Process blockquotes BEFORE bold/italic to capture raw markdown
  // Info/Tip boxes - blockquotes with bold label at start
  processed = processed
    .replace(/^\s*> \*\*Note:\*\*\s*\*\*(Tip|Security|Warning):\*\*\s*(.+?)(?=\n\s*\n|___CODE_BLOCK|$)/gmi, 
      '<div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r-lg"><p class="m-0 text-gray-700"><strong class="text-gray-900">$1:</strong> $2</p></div>')
    .replace(/^\s*> \*\*(Tip|Warning|Security):\*\*\s*(.+?)(?=\n\s*\n|___CODE_BLOCK|$)/gmi, 
      '<div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r-lg"><p class="m-0 text-gray-700"><strong class="text-gray-900">$1:</strong> $2</p></div>')
    // Regular blockquotes (that weren't matched above)
    .replace(/^\s*> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">$1</blockquote>');

  // Step 4: Process lists
  processed = processed.replace(/(^\s*- .+\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(line => {
      return line.replace(/^\s*- (.+)$/, '<li class="text-gray-700 mb-1">$1</li>');
    }).join('');
    return `<ul class="list-disc pl-6 mb-4">${items}</ul>`;
  });

  // Step 5: Process remaining markdown
  processed = processed
    // Headers - dark blue color like in expected design
    .replace(/^\s*# (.+)$/gm, '<h1 class="text-4xl font-bold text-[#1a365d] mb-4 mt-8">$1</h1>')
    .replace(/^\s*## (.+)$/gm, '<h2 class="text-3xl font-bold text-[#1a365d] mb-3 mt-8">$1</h2>')
    .replace(/^\s*### (.+)$/gm, '<h3 class="text-2xl font-bold text-[#1a365d] mb-3 mt-6">$1</h3>')
    .replace(/^\s*#### (.+)$/gm, '<h4 class="text-xl font-semibold text-[#1a365d] mb-2 mt-4">$1</h4>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg border border-gray-200 my-6 max-w-full" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
    // Inline code - pink/red background like in expected design
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 text-sm font-mono">$1</code>')
    // Horizontal rule
    .replace(/^\s*---$/gm, '<hr class="border-gray-200 my-8" />');

  // Step 6: Paragraphs - must be last, but don't wrap block elements
  processed = processed.replace(/\n\n([^<\n][^\n]*(?:\n[^<\n][^\n]*)*)\n\n/g, '\n\n<p class="text-gray-700 mb-4 leading-relaxed">$1</p>\n\n');
  processed = processed.replace(/\n\n([^<\n][^\n]*)$/g, '\n\n<p class="text-gray-700 mb-4 leading-relaxed">$1</p>');

  // Step 7: Restore code blocks
  codeBlocks.forEach((block, i) => {
    processed = processed.replace(`___CODE_BLOCK_${i}___`, block);
  });

  return processed;
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
