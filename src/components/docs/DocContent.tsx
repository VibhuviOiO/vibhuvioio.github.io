interface DocContentProps {
  content: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Syntax highlighters ────────────────────────────────────────────────────

function highlightBash(code: string): string {
  let result = escapeHtml(code);
  return result
    .replace(/(^|\s)(#[^\n]*)/gm, '$1<span class="text-gray-500">$2</span>')
    .replace(/(&quot;[^&]*&quot;|&#039;[^&#]*&#039;)/g, '<span class="text-green-400">$1</span>')
    .replace(/(https?:\/\/[^\s]+)/g, '<span class="text-cyan-400">$1</span>')
    .replace(/(^|&amp;&amp;|\|\||;|\||\$\(|\`\s*)(\s*)([a-zA-Z_][a-zA-Z0-9_-]+)/gm, '$1$2<span class="text-yellow-400">$3</span>')
    .replace(/(\s|^)(-[a-zA-Z-]+)/g, '$1<span class="text-blue-400">$2</span>');
}

function highlightYAML(code: string): string {
  let result = escapeHtml(code);
  return result
    .replace(/(#.*$)/gm, '<span class="text-gray-500">$1</span>')
    .replace(/(^|\s+)([a-zA-Z_][a-zA-Z0-9_]*)(:)/gm, '$1<span class="text-blue-400">$2</span><span class="text-gray-300">$3</span>')
    .replace(/(:\s*)(&quot;[^&]*&quot;)/g, '$1<span class="text-green-400">$2</span>')
    .replace(/(:\s*)(\d+)(\s*$|\s*#)/gm, '$1<span class="text-orange-400">$2</span>$3')
    .replace(/(:\s*)(true|false)(\s*$|\s*#)/gmi, '$1<span class="text-purple-400">$2</span>$3')
    .replace(/^(\s*)(-)(\s)(?!\s)/gm, '$1<span class="text-gray-400">$2</span>$3');
}

// ─── File tree ───────────────────────────────────────────────────────────────

function renderFileTree(code: string): string {
  const lines = code.trim().split('\n');
  const items = lines.map(line => {
    const escaped = escapeHtml(line);
    const match = escaped.match(/^([\s│├└─┬┤┐┘┌┼]*(?:├──|└──)\s*)(.*)/);
    const prefix = match ? match[1] : '';
    const name = match ? match[2] : escaped.trim();
    const isDir = name.endsWith('/') || (!name.includes('.') && name !== '');
    const displayName = name.replace(/\/$/, '');
    const icon = isDir
      ? '<span class="text-yellow-500 mr-1.5">📁</span>'
      : '<span class="text-gray-400 mr-1.5">📄</span>';
    const nameClass = isDir ? 'font-semibold text-gray-800' : 'text-gray-600';
    return `<div class="leading-7 font-mono text-sm whitespace-pre"><span class="text-gray-400">${prefix}</span>${icon}<span class="${nameClass}">${displayName}</span></div>`;
  }).join('');
  return `<div class="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-4">${items}</div>`;
}

// ─── Inline formatting (used for table cells too) ───────────────────────────

function renderInline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 text-[0.875em] font-mono">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#2702a6] hover:underline underline-offset-2 decoration-2" target="_blank" rel="noopener noreferrer">$1</a>');
}

// ─── Tables ──────────────────────────────────────────────────────────────────

function renderTable(block: string): string {
  const rows = block.trim().split('\n');
  if (rows.length < 2) return block;

  const parseRow = (row: string) =>
    row.split('|').slice(1, -1).map(cell => cell.trim());

  const headers = parseRow(rows[0]);
  // rows[1] is the separator (|---|---|), skip it
  const bodyRows = rows.slice(2);

  const thead = `<thead><tr>${headers
    .map(h => `<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">${renderInline(h)}</th>`)
    .join('')}</tr></thead>`;

  const tbody = `<tbody>${bodyRows
    .map((row, i) => {
      const cells = parseRow(row);
      const bg = i % 2 === 0 ? '' : 'class="bg-gray-50/60"';
      return `<tr ${bg}>${cells
        .map(cell => `<td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">${renderInline(cell)}</td>`)
        .join('')}</tr>`;
    })
    .join('')}</tbody>`;

  return `<div class="overflow-x-auto mb-6 rounded-xl border border-gray-200 shadow-sm"><table class="min-w-full divide-y divide-gray-200 bg-white"><thead class="bg-gray-50">${thead.replace('<thead>', '').replace('</thead>', '')}</thead>${tbody}</table></div>`;
}

// ─── Callout boxes ───────────────────────────────────────────────────────────

const calloutConfig: Record<string, { bg: string; border: string; icon: string; titleColor: string }> = {
  Note:     { bg: 'bg-blue-50',   border: 'border-blue-400',   icon: 'ℹ️',  titleColor: 'text-blue-800' },
  Tip:      { bg: 'bg-green-50',  border: 'border-green-400',  icon: '💡', titleColor: 'text-green-800' },
  Warning:  { bg: 'bg-amber-50',  border: 'border-amber-400',  icon: '⚠️', titleColor: 'text-amber-800' },
  Security: { bg: 'bg-red-50',    border: 'border-red-400',    icon: '🔒', titleColor: 'text-red-800' },
  Lab:      { bg: 'bg-purple-50', border: 'border-purple-400', icon: '⚗️', titleColor: 'text-purple-800' },
  Expected: { bg: 'bg-gray-100',  border: 'border-gray-400',   icon: '✅', titleColor: 'text-gray-700' },
};

function makeCallout(label: string, body: string): string {
  const cfg = calloutConfig[label] ?? calloutConfig['Note'];
  return `<div class="flex gap-3 ${cfg.bg} border-l-4 ${cfg.border} px-4 py-3 mb-4 rounded-r-lg">
    <span class="text-base mt-0.5 shrink-0">${cfg.icon}</span>
    <p class="m-0 text-sm text-gray-700 leading-relaxed"><strong class="${cfg.titleColor} font-semibold">${label}:</strong> ${renderInline(body)}</p>
  </div>`;
}

// ─── Main markdown renderer ──────────────────────────────────────────────────

function renderMarkdown(content: string): string {
  // Step 1 — Extract triple-backtick code blocks (protects them from all other processing)
  const codeBlocks: string[] = [];
  let processed = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const placeholder = `___CODE_BLOCK_${codeBlocks.length}___`;
    const language = (lang || '').toLowerCase();

    const looksLikeYAML = !language && (
      /^\s*[a-zA-Z_][a-zA-Z0-9_]*:/m.test(code) ||
      /^\s*-\s+[a-zA-Z_]/m.test(code)
    );
    const looksLikeBash = !language &&
      /^(docker|kubectl|npm|pip|python|curl|wget|cd|ls|cat|echo|export|source|mkdir|rm|cp|mv|chmod|chown)/m.test(code);

    if (language === 'tree') {
      codeBlocks.push(renderFileTree(code));
      return placeholder;
    }

    let highlighted = code;
    if (language === 'yaml' || language === 'yml' || looksLikeYAML) {
      highlighted = highlightYAML(code);
    } else if (language === 'bash' || language === 'sh' || language === 'shell' || looksLikeBash) {
      highlighted = highlightBash(code);
    } else {
      highlighted = escapeHtml(code);
    }

    // Optional filename header: ```bash filename=".env"
    const fileMatch = (lang || '').match(/\w+\s+filename="?([^"]+)"?/);
    const header = fileMatch
      ? `<div class="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700 rounded-t-lg"><span class="text-xs font-mono text-gray-400">${escapeHtml(fileMatch[1])}</span></div>`
      : '';
    const wrapClass = fileMatch ? 'rounded-b-lg rounded-t-none' : 'rounded-lg';

    codeBlocks.push(
      `${header}<pre class="overflow-x-auto ${wrapClass} bg-[#1e1e1e] p-4 mb-4"><code class="text-sm font-mono text-gray-300">${highlighted}</code></pre>`
    );
    return placeholder;
  });

  // Step 1.5 — "📋 Click to view" collapsible blocks
  processed = processed.replace(
    /\*\*📋\s*Click to view ([^*]*)\*\*(?:\s*\([^)]*\))?\s*\n\s*(___CODE_BLOCK_\d+___)/g,
    (_, label, codeRef) =>
      `<details class="mb-4 rounded-lg border border-gray-200 overflow-hidden">`
      + `<summary class="cursor-pointer select-none px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700 flex items-center gap-2">`
      + `<svg class="h-4 w-4 text-gray-500 transition-transform details-open-rotate" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>`
      + `📋 Click to view ${label.trim()}</summary>`
      + `<div class="p-4 bg-white">${codeRef}</div></details>`
  );

  // Step 2 — Extract markdown tables (protects them from paragraph wrapping)
  const tables: string[] = [];
  processed = processed.replace(
    /(\|[^\n]+\|\n)((?:\|[\s:|-]+\|?\n))((?:\|[^\n]+\|\n?)+)/g,
    (match) => {
      const placeholder = `___TABLE_${tables.length}___`;
      tables.push(renderTable(match));
      return placeholder;
    }
  );

  // Step 3 — Reduce excessive indentation
  processed = processed
    .split('\n')
    .map(line => line.replace(/^[\s\t]{8,}/, ''))
    .join('\n');

  // Step 4 — Callout blockquotes (must run before generic blockquote)
  const calloutPattern = Object.keys(calloutConfig).join('|');
  const calloutRe = new RegExp(
    `^\\s*> \\*\\*(${calloutPattern}):\\*\\*\\s*(.+?)(?=\\n\\s*\\n|___CODE_BLOCK|___TABLE|$)`,
    'gmi'
  );
  processed = processed
    .replace(calloutRe, (_, label, body) => makeCallout(label, body))
    // Generic blockquote fallback
    .replace(/^\s*> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">$1</blockquote>');

  // Step 5 — Unordered lists
  processed = processed.replace(/(^\s*- .+\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(line =>
      `<li class="flex items-start gap-2 text-gray-700 mb-1">
        <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#2702a6] shrink-0"></span>
        <span>${renderInline(line.replace(/^\s*- /, ''))}</span>
       </li>`
    ).join('');
    return `<ul class="pl-2 mb-5 space-y-1">${items}</ul>`;
  });

  // Step 6 — Ordered lists (lab steps with numbered badges)
  processed = processed.replace(/(^\s*\d+\. .+\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map((line, idx) => {
      const text = line.replace(/^\s*\d+\.\s*/, '');
      return `<li class="flex items-start gap-3 mb-3">
        <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2702a6] text-white text-xs font-bold mt-0.5">${idx + 1}</span>
        <span class="text-gray-700 text-[15px] leading-relaxed">${renderInline(text)}</span>
      </li>`;
    }).join('');
    return `<ol class="pl-0 mb-5 space-y-1 list-none">${items}</ol>`;
  });

  // Step 7 — Headings, inline formatting, images, links, inline code, HR
  const createId = (text: string) =>
    text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

  processed = processed
    .replace(/^\s*# (.+)$/gm, (_, t) => `<h1 id="${createId(t)}" class="text-3xl md:text-4xl font-bold text-gray-900 mb-6 mt-0">${t}</h1>`)
    .replace(/^\s*## (.+)$/gm, (_, t) => `<h2 id="${createId(t)}" class="text-2xl font-bold text-gray-900 mb-4 mt-10 pb-2 border-b border-gray-100">${t}</h2>`)
    .replace(/^\s*### (.+)$/gm, (_, t) => `<h3 id="${createId(t)}" class="text-lg font-bold text-gray-900 mb-3 mt-7">${t}</h3>`)
    .replace(/^\s*#### (.+)$/gm, (_, t) => `<h4 id="${createId(t)}" class="text-base font-semibold text-gray-800 mb-2 mt-5">${t}</h4>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-8 max-w-full mx-auto shadow-sm" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#2702a6] hover:underline underline-offset-2 decoration-2">$1</a>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 text-[0.875em] font-mono">$1</code>')
    .replace(/^\s*---$/gm, '<hr class="border-gray-200 my-10" />');

  // Step 8 — Paragraphs
  processed = processed.replace(
    /\n\n([^<\n][^\n]*(?:\n[^<\n][^\n]*)*)\n\n/g,
    '\n\n<p class="text-[16px] text-gray-700 mb-5 leading-[1.75]">$1</p>\n\n'
  );
  processed = processed.replace(
    /\n\n([^<\n][^\n]*)$/g,
    '\n\n<p class="text-[16px] text-gray-700 mb-5 leading-[1.75]">$1</p>'
  );

  // Step 9 — Restore code blocks and tables
  codeBlocks.forEach((block, i) => {
    processed = processed.replace(`___CODE_BLOCK_${i}___`, block);
  });
  tables.forEach((table, i) => {
    processed = processed.replace(`___TABLE_${i}___`, table);
  });

  return processed;
}

export default function DocContent({ content }: DocContentProps) {
  const html = renderMarkdown(content);
  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
