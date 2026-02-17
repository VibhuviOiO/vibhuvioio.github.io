import Link from 'next/link';
import Image from 'next/image';
import { Github, ArrowRight, ExternalLink, Play } from 'lucide-react';

export type ProductFeature = {
  icon: string;
  title: string;
  desc: string;
};

export type ProductDoc = {
  href: string;
  title: string;
  desc: string;
};

export type ProductScreenshot = {
  src: string;
  alt: string;
};

export type QuickStartBlock = {
  title: string;
  code: string;
  language?: 'bash' | 'yaml';
};

export type ProductPageConfig = {
  // Hero
  name: string;
  description: string;
  heroIcon?: string;
  heroImage?: string;
  heroScreenshot: { src: string; alt: string };
  tryInBrowserUrl?: string;
  docsUrl: string;
  githubUrl: string;

  // Trust badges
  badges: string[];

  // Features
  featuresHeading: string;
  features: ProductFeature[];

  // Video (optional)
  video?: {
    url: string;
    title?: string;
    description?: string;
    highlights?: string[];
  };

  // Screenshots
  screenshots: ProductScreenshot[];

  // Quick Start
  quickStart: QuickStartBlock[];
  quickStartPort?: string;

  // Docs
  docs: ProductDoc[];

  // CTA
  ctaDescription: string;
};

// Syntax highlighting helpers
function highlightBash(code: string): React.ReactNode[] {
  return code.split('\n').map((line, i) => {
    const parts: React.ReactNode[] = [];
    let rest = line;

    // Line continuation backslash
    if (rest.endsWith('\\')) {
      rest = rest.slice(0, -1);
      const tokens = tokenizeBashLine(rest);
      parts.push(...tokens);
      parts.push(<span key={`bs-${i}`} className="text-gray-500">\</span>);
    } else {
      parts.push(...tokenizeBashLine(rest));
    }

    return (
      <span key={i}>
        {parts}
        {i < code.split('\n').length - 1 ? '\n' : ''}
      </span>
    );
  });
}

function tokenizeBashLine(line: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match flags, commands, values, env vars
  const regex = /(-[a-zA-Z][\w-]*|--[\w-]+)|(docker\s+run|docker|ghcr\.io[\w/.:-]+)|([A-Z_]+=)|(["'][^"']*["'])|(\$\([^)]+\))|(\S+)/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(line)) !== null) {
    // Add any whitespace before this match
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    const idx = parts.length;

    if (match[1]) {
      // Flags like -d, -p, -e, -v
      parts.push(<span key={idx} className="text-cyan-400">{match[0]}</span>);
    } else if (match[2]) {
      // Commands like docker run, image names
      parts.push(<span key={idx} className="text-emerald-400">{match[0]}</span>);
    } else if (match[3]) {
      // ENV_VAR= pattern
      parts.push(<span key={idx} className="text-amber-400">{match[3]}</span>);
      const val = match[0].slice(match[3].length);
      if (val) parts.push(<span key={`${idx}v`} className="text-orange-300">{val}</span>);
    } else if (match[4]) {
      // Quoted strings
      parts.push(<span key={idx} className="text-orange-300">{match[0]}</span>);
    } else if (match[5]) {
      // $(command) subshell
      parts.push(<span key={idx} className="text-purple-400">{match[0]}</span>);
    } else {
      // Ports like 5000:5000, paths, values
      if (match[0].includes(':') && /^\d/.test(match[0])) {
        parts.push(<span key={idx} className="text-orange-300">{match[0]}</span>);
      } else if (match[0].startsWith('./') || match[0].startsWith('/')) {
        parts.push(<span key={idx} className="text-yellow-300">{match[0]}</span>);
      } else {
        parts.push(<span key={idx} className="text-gray-200">{match[0]}</span>);
      }
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts;
}

function highlightYaml(code: string): React.ReactNode[] {
  return code.split('\n').map((line, i) => {
    const parts: React.ReactNode[] = [];

    // Comment lines
    if (line.trimStart().startsWith('#')) {
      return (
        <span key={i}>
          <span className="text-gray-500">{line}</span>
          {i < code.split('\n').length - 1 ? '\n' : ''}
        </span>
      );
    }

    // Key: value pattern
    const kvMatch = line.match(/^(\s*)(- )?([A-Za-z_][\w.-]*\s*:)(.*)/);
    if (kvMatch) {
      const [, indent, dash, key, value] = kvMatch;
      parts.push(indent || '');
      if (dash) parts.push(<span key={`d-${i}`} className="text-gray-400">{dash}</span>);
      parts.push(<span key={`k-${i}`} className="text-cyan-400">{key}</span>);
      if (value.trim()) {
        // Quoted value
        if (value.trim().startsWith('"') || value.trim().startsWith("'")) {
          parts.push(<span key={`v-${i}`} className="text-orange-300">{value}</span>);
        } else if (/^\s*\d/.test(value)) {
          // Numeric
          parts.push(<span key={`v-${i}`} className="text-purple-400">{value}</span>);
        } else {
          // String value (image names, etc)
          parts.push(<span key={`v-${i}`} className="text-emerald-400">{value}</span>);
        }
      }
    } else if (line.trimStart().startsWith('- ')) {
      // List items like - CONFIG_FILE=...
      const listMatch = line.match(/^(\s*)(- )(.*)/);
      if (listMatch) {
        const [, indent, dash, val] = listMatch;
        parts.push(indent || '');
        parts.push(<span key={`d-${i}`} className="text-gray-400">{dash}</span>);
        // Check for ENV=value
        const envMatch = val.match(/^([A-Z_]+=)(.*)/);
        if (envMatch) {
          parts.push(<span key={`ek-${i}`} className="text-amber-400">{envMatch[1]}</span>);
          parts.push(<span key={`ev-${i}`} className="text-orange-300">{envMatch[2]}</span>);
        } else if (val.startsWith('"') || val.startsWith("'")) {
          parts.push(<span key={`v-${i}`} className="text-orange-300">{val}</span>);
        } else {
          parts.push(<span key={`v-${i}`} className="text-yellow-300">{val}</span>);
        }
      }
    } else {
      parts.push(<span key={`l-${i}`} className="text-gray-200">{line}</span>);
    }

    return (
      <span key={i}>
        {parts}
        {i < code.split('\n').length - 1 ? '\n' : ''}
      </span>
    );
  });
}

function HighlightedCode({ code, language }: { code: string; language?: 'bash' | 'yaml' }) {
  const highlighted = language === 'yaml' ? highlightYaml(code) : highlightBash(code);
  return <>{highlighted}</>;
}

export default function ProductPageTemplate({ config }: { config: ProductPageConfig }) {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #200289 0%, #2702a6 50%, #3d0fd4 100%)' }}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                {config.heroImage ? (
                  <Image
                    src={config.heroImage}
                    alt={config.name}
                    width={56}
                    height={56}
                  />
                ) : config.heroIcon ? (
                  <span className="text-5xl">{config.heroIcon}</span>
                ) : null}
                <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  Open Source
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                {config.name}
              </h1>
              <p className="text-white/70 text-lg sm:text-xl leading-relaxed mb-8 max-w-lg">
                {config.description}
              </p>
              <div className="flex flex-wrap gap-4">
                {config.tryInBrowserUrl && (
                  <a
                    href={config.tryInBrowserUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-bold text-gray-900 bg-white transition-all hover:bg-gray-100"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Try in Browser
                  </a>
                )}
                <Link
                  href={config.docsUrl}
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-6 py-3 text-base font-bold text-white transition-all hover:bg-white/10"
                >
                  Documentation
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={config.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-6 py-3 text-base font-bold text-white transition-all hover:bg-white/10"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src={config.heroScreenshot.src}
                  alt={config.heroScreenshot.alt}
                  width={800}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <section className="py-6 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            {config.badges.map((badge) => (
              <span key={badge} className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 bg-[#2702a6]/10 text-[#2702a6] border border-[#2702a6]/20">
              Features
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              {config.featuresHeading}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 hover:border-[#2702a6]/30 transition-all duration-300"
              >
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2 group-hover:text-[#2702a6] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots */}
      {config.screenshots.length > 0 && (
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 bg-cyan-50 text-cyan-700 border border-cyan-200">
                Screenshots
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                Product Screenshots
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {config.screenshots.map((shot) => (
                <div key={shot.alt} className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={700}
                    height={440}
                    className="w-full h-auto"
                  />
                  <div className="px-5 py-3 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-600">{shot.alt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video Section (optional) */}
      {config.video && (
        <section className="py-16 lg:py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 bg-[#2702a6]/10 text-[#2702a6] border border-[#2702a6]/20">
                  Watch Demo
                </span>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-6">
                  {config.video.title || `Watch ${config.name} Demo`}
                </h2>
                {config.video.description && (
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-6">
                    {config.video.description}
                  </p>
                )}
                {config.video.highlights && config.video.highlights.length > 0 && (
                  <div className="space-y-4">
                    {config.video.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 text-sm font-bold flex-shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span className="text-gray-700 text-base">{highlight}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                {config.video.url ? (
                  <>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                      <div className="aspect-video">
                        <iframe
                          src={config.video.url}
                          title={`${config.name} Demo`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 text-center mt-3">
                      <Play className="inline h-3.5 w-3.5 mr-1" />
                      {config.name} walkthrough
                    </p>
                  </>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800">
                    <div className="aspect-video flex flex-col items-center justify-center text-center px-8">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                        <Play className="h-8 w-8 text-white/60" />
                      </div>
                      <p className="text-white/80 text-lg font-bold mb-1">Video Coming Soon</p>
                      <p className="text-white/40 text-sm">A product walkthrough video is being prepared</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Start */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 bg-green-50 text-green-700 border border-green-200">
              Quick Start
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Deploy in seconds
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {config.quickStart.map((block) => (
              <div key={block.title} className="flex flex-col rounded-2xl overflow-hidden shadow-lg border border-gray-700/50 bg-gray-950">
                <div className="px-5 py-3 border-b border-gray-700/50 bg-gray-900 flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <h3 className="font-bold text-gray-300 text-sm">{block.title}</h3>
                </div>
                <div className="p-5 overflow-x-auto flex-1">
                  <pre className="text-sm font-mono leading-relaxed">
                    <code><HighlightedCode code={block.code} language={block.language} /></code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            Access the UI at <code className="px-2 py-1 bg-gray-100 rounded text-gray-900 font-medium">http://localhost:{config.quickStartPort || '5000'}</code>
          </p>
        </div>
      </section>

      {/* Documentation */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Documentation
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.docs.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-xl hover:-translate-y-1 hover:border-[#2702a6]/30 transition-all duration-300"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#2702a6] transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-gray-600">{doc.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-[#2702a6] group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 lg:py-20 bg-section-alt">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg sm:text-xl text-gray-600 leading-relaxed">
            {config.ctaDescription}
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href={config.docsUrl}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-10 py-4 text-lg font-bold text-white transition-all hover:opacity-90 bg-gradient-primary shadow-primary"
            >
              View Documentation
            </Link>
            <a
              href={config.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-10 py-4 text-lg font-bold text-gray-700 transition-all hover:bg-gray-50"
            >
              <Github className="h-5 w-5" />
              Star on GitHub
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
