'use client';

import { useState, useCallback } from 'react';
import { Download, ChevronRight, ChevronDown, FolderOpen, File, Copy, Check } from 'lucide-react';

interface FileEntry {
  name: string;
  path: string;
  content: string;
  lang: string;
}

interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children: TreeNode[];
  file?: FileEntry;
}

interface ProjectExplorerProps {
  name: string;
  files: FileEntry[];
}

// Syntax highlighting for YAML
function highlightYAML(code: string): string {
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(#.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
    .replace(/(^|\s+)([a-zA-Z_][a-zA-Z0-9_.-]*)(:)/gm, '$1<span class="text-blue-400">$2</span><span class="text-gray-400">$3</span>')
    .replace(/(:\s*)("(?:[^"\\]|\\.)*")/g, '$1<span class="text-green-400">$2</span>')
    .replace(/(:\s*)('(?:[^'\\]|\\.)*')/g, '$1<span class="text-green-400">$2</span>')
    .replace(/(:\s*)(\d+(?:\.\d+)?)([\s,\n]|$)/gm, '$1<span class="text-orange-400">$2</span>$3')
    .replace(/(:\s*)(true|false|yes|no|null)([\s,\n]|$)/gmi, '$1<span class="text-purple-400">$2</span>$3')
    .replace(/^(\s*)(-)(\s)/gm, '$1<span class="text-gray-500">$2</span>$3');
}

// Syntax highlighting for env/bash/conf
function highlightEnv(code: string): string {
  const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.split('\n').map(line => {
    // Comment lines
    if (/^\s*#/.test(line)) {
      return `<span class="text-gray-500 italic">${line}</span>`;
    }
    // KEY=VALUE lines
    const kvMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)(=)(.*)$/);
    if (kvMatch) {
      const [, key, eq, val] = kvMatch;
      // Check for inline comment
      const commentIdx = val.indexOf(' #');
      if (commentIdx !== -1) {
        const value = val.slice(0, commentIdx);
        const comment = val.slice(commentIdx);
        return `<span class="text-blue-400">${key}</span><span class="text-gray-400">${eq}</span><span class="text-green-400">${value}</span><span class="text-gray-500 italic">${comment}</span>`;
      }
      return `<span class="text-blue-400">${key}</span><span class="text-gray-400">${eq}</span><span class="text-green-400">${val}</span>`;
    }
    return line;
  }).join('\n');
}

// Syntax highlighting for JSON
function highlightJSON(code: string): string {
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span class="text-blue-400">$1</span>$2')
    .replace(/(:\s*)("(?:[^"\\]|\\.)*")/g, '$1<span class="text-green-400">$2</span>')
    .replace(/(:\s*)(\d+(?:\.\d+)?)/g, '$1<span class="text-orange-400">$2</span>')
    .replace(/(:\s*)(true|false|null)/g, '$1<span class="text-purple-400">$2</span>');
}

// Syntax highlighting for conf/ini files
function highlightConf(code: string): string {
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(#.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
    .replace(/^(\[.*\])$/gm, '<span class="text-purple-400 font-semibold">$1</span>')
    .replace(/^([a-zA-Z_][a-zA-Z0-9_.]*)\s*(=)/gm, '<span class="text-blue-400">$1</span> <span class="text-gray-400">$2</span>');
}

function highlightCode(content: string, lang: string): string {
  switch (lang) {
    case 'yaml': return highlightYAML(content);
    case 'json': return highlightJSON(content);
    case 'bash':
    case 'env':
      return highlightEnv(content);
    case 'conf':
    case 'properties':
    case 'toml':
      return highlightConf(content);
    default:
      return content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

// File icon color by extension
function fileIconColor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const colors: Record<string, string> = {
    yml: 'text-red-400', yaml: 'text-red-400',
    json: 'text-yellow-400',
    env: 'text-green-400',
    conf: 'text-blue-400',
    sh: 'text-green-300',
    toml: 'text-orange-400',
    cfg: 'text-blue-300',
    properties: 'text-blue-300',
    log: 'text-gray-400',
  };
  return colors[ext] || 'text-gray-400';
}

function buildTree(files: FileEntry[], rootName: string): TreeNode {
  const root: TreeNode = { name: rootName, path: '', isDir: true, children: [] };

  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        current.children.push({
          name: part, path: file.path, isDir: false, children: [], file,
        });
      } else {
        let dir = current.children.find(c => c.isDir && c.name === part);
        if (!dir) {
          dir = { name: part, path: parts.slice(0, i + 1).join('/'), isDir: true, children: [] };
          current.children.push(dir);
        }
        current = dir;
      }
    }
  }

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(n => { if (n.isDir) sortNodes(n.children); });
  };
  sortNodes(root.children);
  return root;
}

function TreeItem({
  node, depth, selectedPath, onSelect, expandedDirs, onToggleDir,
}: {
  node: TreeNode; depth: number; selectedPath: string;
  onSelect: (path: string) => void;
  expandedDirs: Set<string>; onToggleDir: (path: string) => void;
}) {
  const isExpanded = expandedDirs.has(node.path || node.name);
  const isSelected = !node.isDir && node.path === selectedPath;

  return (
    <>
      <button
        onClick={() => node.isDir ? onToggleDir(node.path || node.name) : onSelect(node.path)}
        className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-left text-[13px] rounded-sm transition-colors ${
          isSelected
            ? 'bg-[#2702a6]/20 text-[#a78bfa]'
            : 'text-gray-300 hover:bg-[#2a2d2e] hover:text-gray-100'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {node.isDir ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-gray-500 shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-gray-500 shrink-0" />
            )}
            <FolderOpen className="h-4 w-4 text-yellow-400 shrink-0" />
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" />
            <File className={`h-4 w-4 shrink-0 ${fileIconColor(node.name)}`} />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {node.isDir && isExpanded && node.children.map(child => (
        <TreeItem
          key={child.path || child.name}
          node={child} depth={depth + 1}
          selectedPath={selectedPath} onSelect={onSelect}
          expandedDirs={expandedDirs} onToggleDir={onToggleDir}
        />
      ))}
    </>
  );
}

export default function ProjectExplorer({ name, files }: ProjectExplorerProps) {
  const [selectedPath, setSelectedPath] = useState(files[0]?.path || '');
  const [copied, setCopied] = useState(false);
  const tree = buildTree(files, name);

  // Expand all directories by default
  const allDirs = new Set<string>();
  const collectDirs = (node: TreeNode) => {
    if (node.isDir) { allDirs.add(node.path || node.name); node.children.forEach(collectDirs); }
  };
  collectDirs(tree);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(allDirs);

  const selectedFile = files.find(f => f.path === selectedPath);

  const toggleDir = (path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  };

  const copyToClipboard = useCallback(() => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [selectedFile]);

  const downloadAll = () => {
    files.forEach((file, i) => {
      setTimeout(() => {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, i * 200);
    });
  };

  const lineCount = selectedFile ? selectedFile.content.split('\n').length : 0;

  return (
    <div className="rounded-lg border border-gray-700 overflow-hidden mb-6 shadow-lg">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#323233] border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[13px] font-medium text-gray-400">{name}</span>
        </div>
        <button
          onClick={downloadAll}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#2702a6] hover:bg-[#200289] text-white text-xs font-medium transition-colors"
          title="Download all files"
        >
          <Download className="h-3.5 w-3.5" />
          Download All
        </button>
      </div>

      {/* IDE body */}
      <div className="flex" style={{ minHeight: '320px', maxHeight: '520px' }}>
        {/* Sidebar - file tree */}
        <div className="w-52 shrink-0 bg-[#252526] border-r border-gray-700/50 overflow-y-auto py-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
            Explorer
          </div>
          {tree.children.map(node => (
            <TreeItem
              key={node.path || node.name}
              node={node} depth={0}
              selectedPath={selectedPath} onSelect={setSelectedPath}
              expandedDirs={expandedDirs} onToggleDir={toggleDir}
            />
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0 bg-[#1e1e1e] flex flex-col">
          {/* Tab bar */}
          {selectedFile && (
            <div className="flex items-center justify-between border-b border-gray-700/50 bg-[#252526]">
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1e1e1e] border-r border-gray-700/50 border-b-2 border-b-[#2702a6] text-[13px] text-gray-300">
                <File className={`h-3.5 w-3.5 ${fileIconColor(selectedFile.name)}`} />
                {selectedFile.name}
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-3 py-1 mr-2 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors"
                title="Copy file contents"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-green-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* File content with line numbers */}
          <div className="flex-1 overflow-auto">
            {selectedFile ? (
              <div className="flex">
                {/* Line numbers */}
                <div className="shrink-0 py-3 pr-3 pl-4 text-right select-none border-r border-gray-800">
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i} className="text-[13px] leading-[1.6] font-mono text-gray-600">
                      {i + 1}
                    </div>
                  ))}
                </div>
                {/* Code */}
                <pre
                  className="flex-1 py-3 px-4 text-[13px] font-mono leading-[1.6] text-gray-300 whitespace-pre overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: highlightCode(selectedFile.content, selectedFile.lang) }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Select a file to view its contents
              </div>
            )}
          </div>

          {/* Status bar */}
          {selectedFile && (
            <div className="flex items-center justify-between px-4 py-1 bg-[#2702a6] text-[11px] text-white/70 border-t border-gray-700/50">
              <div className="flex items-center gap-3">
                <span>{selectedFile.lang.toUpperCase()}</span>
                <span>UTF-8</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Ln {lineCount}</span>
                <span>{files.length} files</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
