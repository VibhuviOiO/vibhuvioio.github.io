'use client';

import { useState, useCallback } from 'react';
import { Search, Plus, RotateCcw, Database } from 'lucide-react';

interface DocField {
  key: string;
  value: string;
  type: 'text' | 'keyword';
}

interface Doc {
  _id: number;
  fields: DocField[];
}

const SAMPLE_DOCS: Doc[] = [
  {
    _id: 1,
    fields: [
      { key: 'name',  value: 'Alice Johnson', type: 'text' },
      { key: 'city',  value: 'New York',      type: 'keyword' },
      { key: 'role',  value: 'engineer',      type: 'keyword' },
    ],
  },
  {
    _id: 2,
    fields: [
      { key: 'name',  value: 'Bob Smith',  type: 'text' },
      { key: 'city',  value: 'New York',   type: 'keyword' },
      { key: 'role',  value: 'designer',   type: 'keyword' },
    ],
  },
  {
    _id: 3,
    fields: [
      { key: 'name',  value: 'Alice Smith', type: 'text' },
      { key: 'city',  value: 'Chicago',     type: 'keyword' },
      { key: 'role',  value: 'engineer',    type: 'keyword' },
    ],
  },
];

function tokenize(field: DocField): string[] {
  // text  → lowercase, split by whitespace (like ES standard analyzer)
  // keyword → stored as-is (lowercased for demo parity)
  return field.type === 'text'
    ? field.value.toLowerCase().split(/\s+/).filter(Boolean)
    : [field.value.toLowerCase()];
}

function allTokensFor(doc: Doc): string[] {
  const seen = new Set<string>();
  return doc.fields.flatMap(f => tokenize(f)).filter(t => !seen.has(t) && seen.add(t));
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function InvertedIndexDemo() {
  const [insertedDocs, setInsertedDocs]   = useState<Set<number>>(new Set());
  const [indexMap, setIndexMap]           = useState<Map<string, number[]>>(new Map());
  const [animatingDoc, setAnimatingDoc]   = useState<number | null>(null);
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
  const [flashTokens, setFlashTokens]     = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm]       = useState('');
  const [searchHits, setSearchHits]       = useState<number[] | null>(null);

  const insertDoc = useCallback(async (doc: Doc) => {
    if (insertedDocs.has(doc._id) || animatingDoc !== null) return;
    setSearchHits(null);
    setAnimatingDoc(doc._id);

    const tokens = allTokensFor(doc);

    // Step 1 — reveal tokens one by one
    for (const token of tokens) {
      await sleep(110);
      setVisibleTokens(prev => new Set([...prev, token]));
    }

    await sleep(250);

    // Step 2 — commit to index + flash new/updated rows
    const newFlash = new Set<string>();
    setIndexMap(prev => {
      const next = new Map(prev);
      for (const token of tokens) {
        const existing = next.get(token) ?? [];
        if (!existing.includes(doc._id)) {
          next.set(token, [...existing, doc._id].sort((a, b) => a - b));
          newFlash.add(token);
        }
      }
      return next;
    });
    setFlashTokens(newFlash);
    setInsertedDocs(prev => new Set([...prev, doc._id]));

    await sleep(700);
    setFlashTokens(new Set());
    setVisibleTokens(new Set());
    setAnimatingDoc(null);
  }, [insertedDocs, animatingDoc]);

  const lookup = useCallback(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return;
    setSearchHits(indexMap.get(term) ?? []);
  }, [searchTerm, indexMap]);

  const reset = useCallback(() => {
    setInsertedDocs(new Set());
    setIndexMap(new Map());
    setAnimatingDoc(null);
    setVisibleTokens(new Set());
    setFlashTokens(new Set());
    setSearchTerm('');
    setSearchHits(null);
  }, []);

  const sortedIndex = [...indexMap.entries()].sort(([a], [b]) => a.localeCompare(b));
  const searchMatchTerm = searchTerm.toLowerCase().trim();

  return (
    <div className="my-8 rounded-xl overflow-hidden border border-gray-700 shadow-xl bg-[#0d1117]">

      {/* Header */}
      <div className="px-5 py-3 bg-[#161b22] border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Database className="h-4 w-4 text-[#7c6af7]" />
          <span className="text-white font-semibold text-sm">Inverted Index — Interactive Demo</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-xs hidden sm:block">
            Insert documents · see how each token is indexed · search to trace it back
          </span>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-700 min-h-[320px]">

        {/* LEFT — Documents */}
        <div className="p-5 space-y-3">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Documents — users index
          </p>

          {SAMPLE_DOCS.map(doc => {
            const isInserted  = insertedDocs.has(doc._id);
            const isAnimating = animatingDoc === doc._id;
            const isMatch     = searchHits?.includes(doc._id);
            const docTokens   = allTokensFor(doc);

            return (
              <div
                key={doc._id}
                className={`rounded-lg border p-3 transition-all duration-300 ${
                  isAnimating ? 'border-[#7c6af7] bg-[#2702a6]/10 shadow-[0_0_16px_rgba(124,106,247,0.25)]'
                  : isMatch   ? 'border-yellow-500/60 bg-yellow-900/10'
                  : isInserted? 'border-green-700/40 bg-green-900/10'
                  :             'border-gray-700 bg-[#161b22]'
                }`}
              >
                {/* Doc header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-gray-400">
                    <span className="text-gray-600">{"{ "}</span>
                    <span className="text-orange-400">&quot;_id&quot;</span>
                    <span className="text-gray-600">: </span>
                    <span className="text-[#7c6af7] font-bold">{doc._id}</span>
                    <span className="text-gray-600">{" }"}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {isMatch     && <span className="text-[10px] text-yellow-400 font-semibold">⚡ match</span>}
                    {isInserted  && <span className="text-[10px] text-green-400 font-semibold">✓ indexed</span>}
                    <button
                      onClick={() => insertDoc(doc)}
                      disabled={isInserted || animatingDoc !== null}
                      className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium transition-all border ${
                        isInserted        ? 'text-gray-600 border-gray-700 cursor-not-allowed'
                        : animatingDoc !== null ? 'text-gray-500 border-gray-700 cursor-not-allowed'
                        : 'text-[#7c6af7] border-[#2702a6]/60 hover:bg-[#2702a6] hover:text-white cursor-pointer'
                      }`}
                    >
                      <Plus className="h-3 w-3" /> Insert
                    </button>
                  </div>
                </div>

                {/* Fields */}
                <div className="font-mono text-xs space-y-0.5 mb-1">
                  {doc.fields.map(f => (
                    <div key={f.key} className="flex items-center gap-2">
                      <span className="text-blue-400 w-14 shrink-0">{f.key}:</span>
                      <span className="text-green-300 flex-1">&ldquo;{f.value}&rdquo;</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-sans ${
                        f.type === 'text'
                          ? 'text-orange-400 bg-orange-900/30 border border-orange-700/30'
                          : 'text-cyan-400 bg-cyan-900/30 border border-cyan-700/30'
                      }`}>{f.type}</span>
                    </div>
                  ))}
                </div>

                {/* Token animation strip */}
                {isAnimating && (
                  <div className="mt-2 pt-2 border-t border-gray-700/60">
                    <p className="text-[10px] text-gray-600 mb-1.5">Tokens being extracted →</p>
                    <div className="flex flex-wrap gap-1">
                      {docTokens.map(token => (
                        <span
                          key={token}
                          className={`font-mono text-[11px] px-1.5 py-0.5 rounded transition-all duration-200 ${
                            visibleTokens.has(token)
                              ? 'bg-[#2702a6] text-white scale-100 opacity-100'
                              : 'bg-gray-800 text-gray-600 scale-95 opacity-40'
                          }`}
                        >
                          {token}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT — Inverted Index */}
        <div className="p-5">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Inverted Index
            {sortedIndex.length > 0 && (
              <span className="ml-2 normal-case font-normal text-gray-600">
                {sortedIndex.length} tokens across {insertedDocs.size} doc{insertedDocs.size !== 1 ? 's' : ''}
              </span>
            )}
          </p>

          {sortedIndex.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-gray-700 rounded-lg gap-3">
              <div className="text-3xl opacity-30">📖</div>
              <p className="text-gray-600 text-xs text-center leading-relaxed">
                Index is empty.<br />Insert a document on the left<br />to see it build.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-700 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto] bg-[#161b22] border-b border-gray-700 px-3 py-2">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Token</span>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Doc IDs</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-800/60 max-h-72 overflow-y-auto">
                {sortedIndex.map(([token, docIds]) => {
                  const isFlashing  = flashTokens.has(token);
                  const isHighlight = searchMatchTerm && token === searchMatchTerm;
                  return (
                    <div
                      key={token}
                      className={`grid grid-cols-[1fr_auto] px-3 py-1.5 transition-all duration-400 ${
                        isHighlight ? 'bg-yellow-900/25'
                        : isFlashing ? 'bg-[#2702a6]/25'
                        :              'hover:bg-white/[0.02]'
                      }`}
                    >
                      <span className={`font-mono text-xs ${isHighlight ? 'text-yellow-300 font-bold' : 'text-gray-300'}`}>
                        {token}
                      </span>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {docIds.map(id => (
                          <span
                            key={id}
                            className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded transition-colors ${
                              searchHits?.includes(id) && isHighlight
                                ? 'bg-yellow-400 text-black'
                                : isFlashing
                                ? 'bg-[#2702a6] text-white'
                                : 'bg-[#2702a6]/35 text-[#9d91f7]'
                            }`}
                          >
                            #{id}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Search bar */}
      <div className="border-t border-gray-700 bg-[#161b22] px-5 py-3 flex items-center gap-3">
        <Search className="h-4 w-4 text-gray-600 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setSearchHits(null); }}
          onKeyDown={e => e.key === 'Enter' && lookup()}
          placeholder='Lookup a token — try "alice", "new", "engineer", "york"...'
          className="flex-1 bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none min-w-0"
        />
        <button
          onClick={lookup}
          disabled={!searchTerm.trim() || insertedDocs.size === 0}
          className="shrink-0 text-xs px-3 py-1.5 rounded bg-[#2702a6] text-white font-medium disabled:opacity-40 hover:bg-[#200289] transition-colors"
        >
          Lookup
        </button>
        {searchHits !== null && (
          <span className="shrink-0 text-xs text-gray-400">
            {searchHits.length === 0
              ? 'no match'
              : `→ doc${searchHits.length > 1 ? 's' : ''} ${searchHits.map(id => `#${id}`).join(', ')}`}
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-800 px-5 py-2 bg-[#0d1117] flex flex-wrap gap-4 text-[11px] text-gray-600">
        <span><span className="text-orange-400 font-semibold">text</span> — analyzed: lowercased + split into tokens</span>
        <span><span className="text-cyan-400 font-semibold">keyword</span> — stored as-is, exact match only</span>
        <span><span className="text-[#9d91f7] font-semibold">#id</span> — posting list: which docs contain this token</span>
      </div>
    </div>
  );
}
