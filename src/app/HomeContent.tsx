'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

const rotatingPhrases = [
  'Infrastructure Boring.',
  'Operations Invisible.',
  'Monitoring Effortless.',
];

function RotatingText() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = rotatingPhrases[phraseIndex];

    if (!isDeleting && charCount < currentPhrase.length) {
      const timeout = setTimeout(() => setCharCount(charCount + 1), 150);
      return () => clearTimeout(timeout);
    }

    if (!isDeleting && charCount === currentPhrase.length) {
      const timeout = setTimeout(() => setIsDeleting(true), 3500);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && charCount > 0) {
      const timeout = setTimeout(() => setCharCount(charCount - 1), 60);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && charCount === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
    }
  }, [charCount, isDeleting, phraseIndex]);

  const currentPhrase = rotatingPhrases[phraseIndex];

  return (
    <span className="text-gradient-primary">
      {currentPhrase.slice(0, charCount)}
      <span className="animate-[blink_1s_infinite]">|</span>
    </span>
  );
}

type ChatMessage = {
  from: 'user' | 'team';
  text: string;
};

type Conversation = {
  label: string;
  messages: ChatMessage[];
};

// Each conversation is a different client with a different use case
const conversations: Conversation[] = [
  {
    label: 'Cost Optimization',
    messages: [
      { from: 'user', text: 'Our infrastructure costs are growing out of control. Can you help?' },
      { from: 'team', text: 'Absolutely. We will audit your stack and right-size everything. Autoscaling + spot instances can cut costs significantly.' },
      { from: 'user', text: 'Can you handle the migration to the new setup too?' },
      { from: 'team', text: 'Yes — zero-downtime migration with rollback plans. We will do a screenshare to walk through the plan together first.' },
    ],
  },
  {
    label: 'Alert Fatigue',
    messages: [
      { from: 'user', text: 'Too many alerts! Our on-call team is burning out.' },
      { from: 'team', text: 'We will restructure your alerting — proper thresholds, smart routing, only actionable alerts reach your team.' },
      { from: 'user', text: 'What about our existing Prometheus and Grafana setup?' },
      { from: 'team', text: 'We integrate with what you have. No rip-and-replace. Let us hop on a video call to review your dashboards together.' },
    ],
  },
  {
    label: 'Infrastructure Review',
    messages: [
      { from: 'user', text: 'Can you do a full review of our current infrastructure?' },
      { from: 'team', text: 'We do deep infrastructure audits — networking, compute, storage, security, costs — and give you an actionable report.' },
      { from: 'user', text: 'We are also not sure about our HA strategy.' },
      { from: 'team', text: 'Let us brainstorm together. We will whiteboard the options and find the best fit for your scale and budget.' },
    ],
  },
  {
    label: 'Compliance & Security',
    messages: [
      { from: 'user', text: 'We need to pass SOC 2 compliance by next quarter.' },
      { from: 'team', text: 'Security-first design with automated compliance scanning and hardened configs. We have done this many times.' },
      { from: 'user', text: 'Our app also needs end-to-end encryption for all services.' },
      { from: 'team', text: 'TLS everywhere, secrets management, and certificate rotation — all automated. Let us schedule a planning session.' },
    ],
  },
  {
    label: 'Observability',
    messages: [
      { from: 'user', text: 'We need better visibility into our distributed systems.' },
      { from: 'team', text: 'Full observability stack: metrics, logs, traces, and custom dashboards tailored to your services.' },
      { from: 'user', text: 'Can we get real-time anomaly detection too?' },
      { from: 'team', text: 'Yes. ML-based anomaly detection with smart baselines. Catches issues before your users do.' },
    ],
  },
  {
    label: 'Custom Tooling',
    messages: [
      { from: 'user', text: 'We need a custom internal tool for our deployment workflow.' },
      { from: 'team', text: 'We build custom tools when off-the-shelf does not fit. Your workflow, our engineering.' },
      { from: 'user', text: 'It needs to integrate with our GitLab and Slack.' },
      { from: 'team', text: 'Webhooks, APIs, ChatOps — we wire it all together into one seamless flow.' },
    ],
  },
  {
    label: 'Migration Planning',
    messages: [
      { from: 'user', text: 'We are planning a big migration to Kubernetes next quarter.' },
      { from: 'team', text: 'Let us build a migration plan together. We will map workloads, identify risks, and create a phased rollout.' },
      { from: 'user', text: 'Can we do a screenshare to walk through our current architecture first?' },
      { from: 'team', text: 'Of course! We always start with understanding your current state. Let us set up a call.' },
    ],
  },
  {
    label: 'Self-Hosted & Private Cloud',
    messages: [
      { from: 'user', text: 'We run everything on bare metal and our own racks. Maintenance is killing us — patching, networking, hardware failures.' },
      { from: 'team', text: 'We specialize in self-hosted infrastructure. We will automate patching, set up proper fleet management, and build failover for hardware issues.' },
      { from: 'user', text: 'We also want a deploy platform like a PaaS — git push and it deploys, with rollbacks and preview environments.' },
      { from: 'team', text: 'We can build you a custom CI/CD platform on your own infrastructure — push-to-deploy pipelines, automatic previews, rollback in one click. All self-hosted, fully yours.' },
    ],
  },
  {
    label: 'Uptime Observability',
    messages: [
      { from: 'user', text: 'We have no idea what is up or down across our infra — servers, databases, apps, everything.' },
      { from: 'team', text: 'We will set up end-to-end uptime observability — health checks for every layer: hardware, OS, databases, services, and endpoints. One dashboard to see it all.' },
      { from: 'user', text: 'Can we track uptime per service with SLA reports for our customers?' },
      { from: 'team', text: 'Absolutely. SLA tracking with SLOs and SLIs per service, historical uptime reports, and automatic alerts when error budgets are burning too fast.' },
    ],
  },
];

function AnimatedConversation() {
  const [convIndex, setConvIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const currentConv = conversations[convIndex];

  const advanceMessage = useCallback(() => {
    if (visibleCount >= currentConv.messages.length) return;

    setIsTyping(true);
    const nextMsg = currentConv.messages[visibleCount];
    // Team takes longer to "type" than user
    const typingDuration = nextMsg.from === 'team' ? 1400 : 800;

    setTimeout(() => {
      setIsTyping(false);
      setVisibleCount((prev) => prev + 1);
    }, typingDuration);
  }, [visibleCount, currentConv.messages]);

  // Drive the message sequence
  useEffect(() => {
    if (isTyping || isFading) return;

    // Still have messages to show
    if (visibleCount < currentConv.messages.length) {
      // Delay before next message: first message comes faster, subsequent ones give reading time
      const delay = visibleCount === 0 ? 600 : 2200;
      const timer = setTimeout(advanceMessage, delay);
      return () => clearTimeout(timer);
    }

    // All messages shown — hold for reading, then transition
    const holdTimer = setTimeout(() => {
      setIsFading(true);
      // After fade-out, switch to next conversation
      setTimeout(() => {
        setConvIndex((prev) => (prev + 1) % conversations.length);
        setVisibleCount(0);
        setIsFading(false);
      }, 500);
    }, 4000);

    return () => clearTimeout(holdTimer);
  }, [visibleCount, isTyping, isFading, currentConv.messages.length, advanceMessage]);

  return (
    <div className="max-w-2xl mx-auto" style={{ minHeight: '300px' }}>
      {/* Conversation topic label */}
      <div
        className="flex items-center gap-2 mb-4 transition-opacity duration-500"
        style={{ opacity: isFading ? 0 : 1 }}
      >
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {currentConv.label}
        </span>
      </div>

      {/* Messages */}
      <div
        className="space-y-3 transition-opacity duration-500"
        style={{ opacity: isFading ? 0 : 1 }}
      >
        {currentConv.messages.slice(0, visibleCount).map((msg, i) => (
          <div
            key={`${convIndex}-${i}`}
            className={`flex items-end gap-3 ${msg.from === 'team' ? 'flex-row-reverse' : ''}`}
            style={{ animation: 'chatSlideIn 0.4s ease-out both' }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                msg.from === 'user'
                  ? 'bg-white/80 border border-gray-300'
                  : 'bg-gradient-primary text-white'
              }`}
            >
              {msg.from === 'user' ? '👤' : '🧑‍💻'}
            </div>
            <div
              className={`rounded-2xl px-4 py-2.5 shadow-sm max-w-md ${
                msg.from === 'user'
                  ? 'bg-white border border-gray-200 rounded-bl-none'
                  : 'bg-primary-light border border-primary rounded-br-none'
              }`}
            >
              <p className={`text-sm sm:text-base leading-relaxed ${msg.from === 'user' ? 'text-gray-700' : 'text-gray-800 font-medium'}`}>
                {msg.text}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div
            className={`flex items-end gap-3 ${
              currentConv.messages[visibleCount]?.from === 'team' ? 'flex-row-reverse' : ''
            }`}
            style={{ animation: 'chatSlideIn 0.3s ease-out both' }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                currentConv.messages[visibleCount]?.from === 'user'
                  ? 'bg-white/80 border border-gray-300'
                  : 'bg-gradient-primary text-white'
              }`}
            >
              {currentConv.messages[visibleCount]?.from === 'user' ? '👤' : '🧑‍💻'}
            </div>
            <div
              className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                currentConv.messages[visibleCount]?.from === 'user'
                  ? 'bg-white border border-gray-200 rounded-bl-none'
                  : 'bg-primary-light border border-primary rounded-br-none'
              }`}
            >
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-[typingDot_1.4s_ease-in-out_infinite]" />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-[typingDot_1.4s_ease-in-out_infinite_0.2s]" />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-[typingDot_1.4s_ease-in-out_infinite_0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conversation progress dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {conversations.map((_, i) => (
          <span
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === convIndex
                ? 'w-6 h-2 bg-primary'
                : 'w-2 h-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Icon types for grid junctions
type JIcon = 'server' | 'db' | 'cloud' | 'shield' | 'eye' | 'container' | 'globe' | 'user' | 'gear' | 'bolt' | 'cpu' | 'layers';

// Junction nodes at grid intersections — center is clear for hero text
// viewBox 1200×500, grid spacing ~120px
const junctions: { x: number; y: number; icon: JIcon }[] = [
  // Top row (y=25)
  { x: 60,   y: 25, icon: 'cloud' },
  { x: 180,  y: 25, icon: 'globe' },
  { x: 300,  y: 25, icon: 'shield' },
  { x: 420,  y: 25, icon: 'bolt' },
  { x: 600,  y: 25, icon: 'gear' },
  { x: 780,  y: 25, icon: 'layers' },
  { x: 900,  y: 25, icon: 'eye' },
  { x: 1020, y: 25, icon: 'user' },
  { x: 1140, y: 25, icon: 'user' },
  // Top-inner row (y=80) — short stubs
  { x: 60,   y: 80, icon: 'gear' },
  { x: 180,  y: 80, icon: 'cpu' },
  { x: 300,  y: 80, icon: 'container' },
  { x: 900,  y: 80, icon: 'server' },
  { x: 1020, y: 80, icon: 'bolt' },
  { x: 1140, y: 80, icon: 'shield' },
  // Left column
  { x: 60,  y: 160, icon: 'container' },
  { x: 60,  y: 250, icon: 'cpu' },
  { x: 60,  y: 340, icon: 'server' },
  { x: 60,  y: 420, icon: 'db' },
  // Right column
  { x: 1140, y: 160, icon: 'user' },
  { x: 1140, y: 250, icon: 'eye' },
  { x: 1140, y: 340, icon: 'layers' },
  { x: 1140, y: 420, icon: 'globe' },
  // Bottom-inner row (y=420)
  { x: 60,   y: 420, icon: 'db' },   // shares with left col
  { x: 180,  y: 420, icon: 'layers' },
  { x: 300,  y: 420, icon: 'bolt' },
  { x: 900,  y: 420, icon: 'gear' },
  { x: 1020, y: 420, icon: 'container' },
  { x: 1140, y: 420, icon: 'globe' }, // shares with right col
  // Bottom row (y=475)
  { x: 60,   y: 475, icon: 'server' },
  { x: 180,  y: 475, icon: 'db' },
  { x: 300,  y: 475, icon: 'cloud' },
  { x: 420,  y: 475, icon: 'cpu' },
  { x: 600,  y: 475, icon: 'container' },
  { x: 780,  y: 475, icon: 'shield' },
  { x: 900,  y: 475, icon: 'eye' },
  { x: 1020, y: 475, icon: 'user' },
  { x: 1140, y: 475, icon: 'gear' },
];

// Remove duplicate coordinates for rendering (some share positions)
const uniqueJunctions = junctions.filter((j, i, arr) =>
  arr.findIndex(k => k.x === j.x && k.y === j.y) === i
);

// Grid line segments — horizontal and vertical only, forming a frame
const gridLines: [number, number, number, number][] = [
  // Top horizontal
  [60, 25, 1140, 25],
  // Bottom horizontal
  [60, 475, 1140, 475],
  // Left vertical (full)
  [60, 25, 60, 475],
  // Right vertical (full)
  [1140, 25, 1140, 475],
  // Top inner horizontal
  [60, 80, 300, 80],
  [900, 80, 1140, 80],
  // Bottom inner horizontal
  [60, 420, 300, 420],
  [900, 420, 1140, 420],
  // Short vertical stubs — top
  [180, 25, 180, 80],
  [300, 25, 300, 80],
  [900, 25, 900, 80],
  [1020, 25, 1020, 80],
  // Short vertical stubs — bottom
  [180, 420, 180, 475],
  [300, 420, 300, 475],
  [420, 25, 420, 25],  // dot only (top)
  [600, 25, 600, 25],  // dot only (top)
  [780, 25, 780, 25],  // dot only (top)
  [900, 420, 900, 475],
  [1020, 420, 1020, 475],
  // Vertical stubs connecting bottom inner to bottom
  [420, 475, 420, 475],
  [600, 475, 600, 475],
  [780, 475, 780, 475],
];

// Multi-point routes — dots travel along grid lines, turning at junctions
const routes: { path: string; color: string; dur: number; delay: number }[] = [
  // Route 1: top-left → right across top → down right side → across bottom (clockwise)
  { path: 'M 60 25 L 300 25 L 420 25 L 600 25 L 780 25 L 900 25 L 1140 25 L 1140 160 L 1140 250 L 1140 340 L 1140 475',
    color: '#2702a6', dur: 18, delay: 0 },
  // Route 2: bottom-left → right across bottom → up right side
  { path: 'M 60 475 L 180 475 L 300 475 L 420 475 L 600 475 L 780 475 L 900 475 L 1020 475 L 1140 475 L 1140 420 L 1140 340',
    color: '#0891b2', dur: 16, delay: 4 },
  // Route 3: top-left corner → down left → across bottom-left
  { path: 'M 60 25 L 60 80 L 60 160 L 60 250 L 60 340 L 60 420 L 60 475 L 180 475 L 300 475',
    color: '#7c3aed', dur: 14, delay: 2 },
  // Route 4: top-left inner → right along inner-top → down stub
  { path: 'M 60 80 L 180 80 L 300 80 L 300 25',
    color: '#059669', dur: 6, delay: 1 },
  // Route 5: top-right inner → left along inner-top → down
  { path: 'M 1140 80 L 1020 80 L 900 80 L 900 25',
    color: '#059669', dur: 6, delay: 7 },
  // Route 6: bottom-left inner → right along inner-bottom → up stub
  { path: 'M 60 420 L 180 420 L 300 420 L 300 475',
    color: '#d97706', dur: 6, delay: 3 },
  // Route 7: bottom-right inner → left along inner-bottom → up
  { path: 'M 1140 420 L 1020 420 L 900 420 L 900 475',
    color: '#d97706', dur: 6, delay: 9 },
  // Route 8: Full right side down
  { path: 'M 1140 25 L 1140 80 L 1140 160 L 1140 250 L 1140 340 L 1140 420 L 1140 475',
    color: '#2702a6', dur: 12, delay: 6 },
  // Route 9: Top across → turn down left inner
  { path: 'M 420 25 L 600 25 L 780 25 L 900 25 L 900 80',
    color: '#0891b2', dur: 7, delay: 5 },
  // Route 10: Bottom middle across
  { path: 'M 300 475 L 420 475 L 600 475 L 780 475 L 900 475',
    color: '#7c3aed', dur: 8, delay: 8 },
];

// Render small iconic shapes at junctions
function JunctionDot({ x, y, icon }: { x: number; y: number; icon: JIcon }) {
  const s = 5; // half-size of icon
  const c1 = '#2702a6'; // primary
  const c2 = '#0891b2'; // cyan accent
  const sw = 0.8;

  switch (icon) {
    case 'server': // small rack: rect with two horizontal lines
      return (
        <g>
          <rect x={x-s} y={y-s} width={s*2} height={s*2} rx="1" fill={c1} fillOpacity="0.06" stroke={c1} strokeWidth={sw} strokeOpacity="0.4" />
          <line x1={x-3} y1={y-1.5} x2={x+3} y2={y-1.5} stroke={c1} strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1={x-3} y1={y+1.5} x2={x+3} y2={y+1.5} stroke={c1} strokeWidth="0.5" strokeOpacity="0.4" />
        </g>
      );
    case 'db': // cylinder: two ellipses connected
      return (
        <g>
          <ellipse cx={x} cy={y-3} rx={s-1} ry="2.5" fill={c1} fillOpacity="0.06" stroke={c1} strokeWidth={sw} strokeOpacity="0.4" />
          <line x1={x-(s-1)} y1={y-3} x2={x-(s-1)} y2={y+2} stroke={c1} strokeWidth={sw} strokeOpacity="0.4" />
          <line x1={x+(s-1)} y1={y-3} x2={x+(s-1)} y2={y+2} stroke={c1} strokeWidth={sw} strokeOpacity="0.4" />
          <ellipse cx={x} cy={y+2} rx={s-1} ry="2.5" fill={c1} fillOpacity="0.06" stroke={c1} strokeWidth={sw} strokeOpacity="0.4" />
        </g>
      );
    case 'cloud': // small cloud arc
      return (
        <path d={`M${x-5} ${y+2} Q${x-5} ${y-4} ${x-1} ${y-4} Q${x} ${y-6} ${x+2} ${y-4} Q${x+5} ${y-4} ${x+5} ${y+2} Z`}
          fill={c2} fillOpacity="0.06" stroke={c2} strokeWidth={sw} strokeOpacity="0.4" />
      );
    case 'shield': // small shield shape
      return (
        <path d={`M${x} ${y-s} L${x+s} ${y-2} L${x+s} ${y+1} Q${x} ${y+s+1} ${x} ${y+s+1} Q${x} ${y+s+1} ${x-s} ${y+1} L${x-s} ${y-2} Z`}
          fill={c1} fillOpacity="0.06" stroke={c1} strokeWidth={sw} strokeOpacity="0.4" />
      );
    case 'eye': // simplified eye
      return (
        <g>
          <ellipse cx={x} cy={y} rx={s} ry={s-2} fill="none" stroke={c2} strokeWidth={sw} strokeOpacity="0.4" />
          <circle cx={x} cy={y} r="1.5" fill={c2} fillOpacity="0.3" />
        </g>
      );
    case 'container': // small box with dashed inside
      return (
        <g>
          <rect x={x-s} y={y-s} width={s*2} height={s*2} rx="0.5" fill={c2} fillOpacity="0.06" stroke={c2} strokeWidth={sw} strokeOpacity="0.4" />
          <rect x={x-2.5} y={y-2.5} width="5" height="5" rx="0.5" fill="none" stroke={c2} strokeWidth="0.4" strokeOpacity="0.3" strokeDasharray="1.5 1" />
        </g>
      );
    case 'globe': // circle with cross lines
      return (
        <g>
          <circle cx={x} cy={y} r={s} fill={c1} fillOpacity="0.06" stroke={c1} strokeWidth={sw} strokeOpacity="0.4" />
          <ellipse cx={x} cy={y} rx="2.5" ry={s} fill="none" stroke={c1} strokeWidth="0.4" strokeOpacity="0.3" />
          <line x1={x-s} y1={y} x2={x+s} y2={y} stroke={c1} strokeWidth="0.4" strokeOpacity="0.3" />
        </g>
      );
    case 'user': // simple person silhouette
      return (
        <g>
          <circle cx={x} cy={y-2.5} r="2" fill={c1} fillOpacity="0.08" stroke={c1} strokeWidth={sw} strokeOpacity="0.4" />
          <path d={`M${x-3.5} ${y+5} Q${x-3.5} ${y+1} ${x} ${y+1} Q${x+3.5} ${y+1} ${x+3.5} ${y+5}`}
            fill={c1} fillOpacity="0.06" stroke={c1} strokeWidth={sw} strokeOpacity="0.4" />
        </g>
      );
    case 'gear': // hexagon-ish gear
      return (
        <g>
          <polygon
            points={`${x} ${y-s},${x+4} ${y-2.5},${x+4} ${y+2.5},${x} ${y+s},${x-4} ${y+2.5},${x-4} ${y-2.5}`}
            fill={c1} fillOpacity="0.06" stroke={c1} strokeWidth={sw} strokeOpacity="0.4" />
          <circle cx={x} cy={y} r="1.5" fill="none" stroke={c1} strokeWidth="0.5" strokeOpacity="0.3" />
        </g>
      );
    case 'bolt': // lightning bolt
      return (
        <path d={`M${x+1} ${y-s} L${x-2} ${y} L${x+1} ${y} L${x-1} ${y+s}`}
          fill="none" stroke={c2} strokeWidth="1" strokeOpacity="0.45" strokeLinecap="round" strokeLinejoin="round" />
      );
    case 'cpu': // chip: square with pins
      return (
        <g>
          <rect x={x-3} y={y-3} width="6" height="6" rx="0.5" fill={c2} fillOpacity="0.06" stroke={c2} strokeWidth={sw} strokeOpacity="0.4" />
          <line x1={x-1.5} y1={y-3} x2={x-1.5} y2={y-s} stroke={c2} strokeWidth="0.5" strokeOpacity="0.35" />
          <line x1={x+1.5} y1={y-3} x2={x+1.5} y2={y-s} stroke={c2} strokeWidth="0.5" strokeOpacity="0.35" />
          <line x1={x-1.5} y1={y+3} x2={x-1.5} y2={y+s} stroke={c2} strokeWidth="0.5" strokeOpacity="0.35" />
          <line x1={x+1.5} y1={y+3} x2={x+1.5} y2={y+s} stroke={c2} strokeWidth="0.5" strokeOpacity="0.35" />
        </g>
      );
    case 'layers': // stacked lines
      return (
        <g>
          <path d={`M${x-s} ${y+1} L${x} ${y-1.5} L${x+s} ${y+1}`} fill="none" stroke={c1} strokeWidth={sw} strokeOpacity="0.4" />
          <path d={`M${x-s} ${y-1} L${x} ${y-3.5} L${x+s} ${y-1}`} fill={c1} fillOpacity="0.06" stroke={c1} strokeWidth={sw} strokeOpacity="0.4" />
          <path d={`M${x-s} ${y+3} L${x} ${y+0.5} L${x+s} ${y+3}`} fill="none" stroke={c1} strokeWidth="0.5" strokeOpacity="0.3" />
        </g>
      );
    default:
      return <circle cx={x} cy={y} r="2" fill={c1} fillOpacity="0.3" />;
  }
}

function InfraGrid() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid lines — thin, following the grid */}
      {gridLines.map(([x1, y1, x2, y2], i) => (
        <line
          key={`gl-${i}`}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#2702a6"
          strokeWidth="0.6"
          strokeOpacity="0.08"
        />
      ))}

      {/* Animated traveling dots along multi-point routes */}
      {routes.map((route, i) => (
        <g key={`route-${i}`}>
          {/* Glow trail */}
          <circle r="5" fill={route.color} fillOpacity="0.12">
            <animateMotion
              dur={`${route.dur}s`}
              repeatCount="indefinite"
              begin={`${route.delay}s`}
              path={route.path}
            />
          </circle>
          {/* Core dot */}
          <circle r="2" fill={route.color} fillOpacity="0.5">
            <animateMotion
              dur={`${route.dur}s`}
              repeatCount="indefinite"
              begin={`${route.delay}s`}
              path={route.path}
            />
          </circle>
        </g>
      ))}

      {/* Junction icons at grid intersections */}
      {uniqueJunctions.map((j, i) => (
        <g key={`j-${i}`} opacity="0.55">
          <JunctionDot x={j.x} y={j.y} icon={j.icon} />
        </g>
      ))}
    </svg>
  );
}

export default function HomeContent() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-grid">
        <div className="absolute inset-0 pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(32,2,137,0.06)_0%,transparent_50%)]" />
        <div className="absolute top-1/2 -right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,188,212,0.04)_0%,transparent_70%)] blur-[60px] pointer-events-none" />

        {/* Animated infrastructure grid */}
        <InfraGrid />

        <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              We Make Your
              <br />
              <RotatingText />
            </h1>
            <p className="mt-6 text-xl sm:text-2xl text-gray-600 font-medium">We handle the ops. You ship the code.</p>
            <p className="mx-auto mt-4 max-w-2xl text-lg sm:text-xl text-gray-500 leading-relaxed">
              Production-ready open source tools and battle-tested automation
              for teams that want infrastructure they never have to think about.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3.5 text-base font-bold text-white transition-all hover:opacity-90 bg-gradient-primary shadow-primary"
              >
                Explore Products
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-8 py-3.5 text-base font-bold text-gray-700 transition-all hover:bg-gray-50"
              >
                Read the Docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Built on Industry Standards */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              {/* Badge */}
              <span className="badge-amber inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                Reliability First
              </span>
              
              {/* Title */}
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-6">
                Built on Industry Standards
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6">
                Every system is measured against real reliability targets —
                not just uptime numbers, but SLAs, SLOs, and SLIs that your
                business can depend on.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="tag-primary px-4 py-2 rounded-full text-sm sm:text-base font-medium">Error Budgets</span>
                <span className="tag-primary px-4 py-2 rounded-full text-sm sm:text-base font-medium">Latency Targets</span>
                <span className="tag-primary px-4 py-2 rounded-full text-sm sm:text-base font-medium">Availability Guarantees</span>
              </div>
              
              {/* SLA → SLO → SLI Bridge */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <span className="px-3 py-1.5 rounded text-xs font-bold text-primary bg-primary-light border border-primary-light animate-[floatStandard_3s_ease-in-out_infinite]">
                  SLA
                </span>
                <span className="text-gray-400 animate-[arrowPulse_2s_ease-in-out_infinite]">→</span>
                <span className="px-3 py-1.5 rounded text-xs font-bold text-primary bg-primary-light border border-primary-light animate-[floatStandard_3s_ease-in-out_infinite_0.5s]">
                  SLO
                </span>
                <span className="text-gray-400 animate-[arrowPulse_2s_ease-in-out_infinite_0.33s]">→</span>
                <span className="px-3 py-1.5 rounded text-xs font-bold text-primary bg-primary-light border border-primary-light animate-[floatStandard_3s_ease-in-out_infinite_1s]">
                  SLI
                </span>
                <span className="text-gray-400 animate-[arrowPulse_2s_ease-in-out_infinite_0.66s]">→</span>
                <span className="px-3 py-1.5 rounded text-xs font-bold text-green-700 bg-green-50 border border-green-200 whitespace-nowrap animate-[floatStandard_3s_ease-in-out_infinite_1.5s]">
                  Uptime Observability
                </span>
              </div>
            </div>
            
            {/* Right Animation */}
            <div className="flex justify-center items-center">
              <div className="relative flex items-center justify-center w-[400px] h-[400px]">
                {/* Orbit rings */}
                <div className="absolute w-[360px] h-[360px] rounded-full border border-dashed border-cyan-200/50 animate-[targetPulse_4s_ease-in-out_infinite]" />
                <div className="absolute w-[260px] h-[260px] rounded-full border border-green-200/50 animate-[targetPulse_4s_ease-in-out_infinite_0.66s]" />
                <div className="absolute w-[160px] h-[160px] rounded-full border border-primary/25 animate-[targetPulse_4s_ease-in-out_infinite_1.33s]" />
                
                {/* Center checkmark */}
                <div className="relative flex items-center justify-center w-11 h-11 rounded-full z-10 bg-gradient-primary shadow-primary">
                  <span className="text-white text-lg font-bold">✓</span>
                </div>
                
                {/* Orbiting badges */}
                <span className="absolute px-1.5 py-0.5 rounded text-[0.55rem] font-bold uppercase tracking-wider whitespace-nowrap bg-primary-light border border-primary-light text-primary animate-[orbitInner_20s_linear_infinite]">SLA</span>
                <span className="absolute px-1.5 py-0.5 rounded text-[0.55rem] font-bold uppercase tracking-wider whitespace-nowrap bg-primary-light border border-primary-light text-primary animate-[orbitInner_20s_linear_infinite]" style={{ animationDelay: '-6.66s' }}>SLO</span>
                <span className="absolute px-1.5 py-0.5 rounded text-[0.55rem] font-bold uppercase tracking-wider whitespace-nowrap bg-primary-light border border-primary-light text-primary animate-[orbitInner_20s_linear_infinite]" style={{ animationDelay: '-13.33s' }}>SLI</span>
                
                <span className="absolute px-2.5 py-1 rounded text-xs font-semibold tracking-wide whitespace-nowrap bg-green-50 border border-green-200 text-green-700 animate-[orbitMiddle_25s_linear_infinite_reverse]">Uptime</span>
                <span className="absolute px-2.5 py-1 rounded text-xs font-semibold tracking-wide whitespace-nowrap bg-green-50 border border-green-200 text-green-700 animate-[orbitMiddle_25s_linear_infinite_reverse]" style={{ animationDelay: '-12.5s' }}>99.9%</span>
                
                <span className="absolute px-3 py-1 rounded text-sm font-semibold tracking-wide whitespace-nowrap bg-cyan-50 border border-cyan-200 text-cyan-700 animate-[orbitOuter_30s_linear_infinite]">Latency</span>
                <span className="absolute px-3 py-1 rounded text-sm font-semibold tracking-wide whitespace-nowrap bg-cyan-50 border border-cyan-200 text-cyan-700 animate-[orbitOuter_30s_linear_infinite]" style={{ animationDelay: '-10s' }}>Errors</span>
                <span className="absolute px-3 py-1 rounded text-sm font-semibold tracking-wide whitespace-nowrap bg-cyan-50 border border-cyan-200 text-cyan-700 animate-[orbitOuter_30s_linear_infinite]" style={{ animationDelay: '-20s' }}>Observability</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 lg:py-10 bg-gray-50">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">140+</div>
              <div className="mt-1 text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Guides</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">5</div>
              <div className="mt-1 text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Products</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">100%</div>
              <div className="mt-1 text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Open Source</div>
            </div>
          </div>
        </div>
      </section>

      {/* Everything Connected */}
      <section className="py-12 lg:py-16 bg-section-alt">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Content */}
            <div>
              {/* Badge */}
              <span className="badge-primary inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                AI-Powered Platform
              </span>
              
              {/* Title */}
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-6">
                Everything Connected
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg text-white flex-shrink-0 icon-box-primary text-lg">
                    ◉
                  </span>
                  <span className="text-gray-700 text-base">Unified control plane for infrastructure</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 icon-box-light text-lg">
                    ◈
                  </span>
                  <span className="text-gray-700 text-base">AI-assisted tools built for your stack</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 orbit-node-outer text-lg">
                    ◇
                  </span>
                  <span className="text-gray-700 text-base">On-demand products for infrastructure needs</span>
                </div>
              </div>
            </div>
            
            {/* Right - Animation */}
            <div className="flex justify-center">
              <div className="relative flex items-center justify-center" style={{ width: '280px', height: '280px' }}>
                {/* Hub Center */}
                <div className="absolute flex items-center justify-center w-20 h-20 rounded-full z-10 bg-gradient-primary shadow-primary-lg hub-pulse">
                  <span className="text-2xl text-white">◉</span>
                </div>
                
                {/* Inner Orbit Ring */}
                <div className="absolute rounded-full" style={{ width: '200px', height: '200px', border: '1px solid rgba(39, 2, 166, 0.2)', animation: 'orbitRotate 20s linear infinite' }}>
                  {[0, 72, 144, 216, 288].map((angle, i) => (
                    <span
                      key={i}
                      className="absolute flex items-center justify-center w-8 h-8 rounded-lg text-sm"
                      style={{
                        width: '32px',
                        height: '32px',
                        top: '50%',
                        left: '50%',
                        margin: '-16px 0 0 -16px',
                        background: 'rgba(39, 2, 166, 0.08)',
                        border: '1px solid rgba(39, 2, 166, 0.25)',
                        color: '#2702a6',
                        transform: `rotate(${angle}deg) translateX(100px) rotate(-${angle}deg)`,
                        animation: 'nodeGlow 3s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`,
                      }}
                    >
                      ◈
                    </span>
                  ))}
                </div>
                
                {/* Outer Orbit Ring */}
                <div className="absolute rounded-full" style={{ width: '260px', height: '260px', border: '1px dashed rgba(0, 188, 212, 0.15)', animation: 'orbitRotateReverse 30s linear infinite' }}>
                  {[36, 108, 180, 252, 324].map((angle, i) => (
                    <span
                      key={i}
                      className="absolute flex items-center justify-center rounded text-xs"
                      style={{
                        width: '28px',
                        height: '28px',
                        top: '50%',
                        left: '50%',
                        margin: '-14px 0 0 -14px',
                        background: 'rgba(0, 188, 212, 0.06)',
                        border: '1px solid rgba(0, 188, 212, 0.2)',
                        color: '#0891b2',
                        transform: `rotate(${angle}deg) translateX(130px) rotate(-${angle}deg)`,
                      }}
                    >
                      ◇
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Sleep Soundly */}
      <section className="py-12 lg:py-16 bg-section-alt">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Animation */}
            <div className="flex justify-center items-center">
              <div className="relative flex items-center justify-center" style={{ width: '380px', height: '380px' }}>
                {/* Pulse rings */}
                <div className="absolute rounded-full" style={{ width: '200px', height: '200px', border: '1px solid rgba(61, 122, 181, 0.2)', animation: 'pulseExpand 4s ease-out infinite' }} />
                <div className="absolute rounded-full" style={{ width: '260px', height: '260px', border: '1px solid rgba(61, 122, 181, 0.2)', animation: 'pulseExpand 4s ease-out infinite 1.3s' }} />
                <div className="absolute rounded-full" style={{ width: '320px', height: '320px', border: '1px solid rgba(61, 122, 181, 0.2)', animation: 'pulseExpand 4s ease-out infinite 2.6s' }} />
                
                {/* Core moon */}
                <div className="relative flex items-center justify-center rounded-full z-10" style={{ width: '110px', height: '110px', background: 'linear-gradient(135deg, #2702a6 0%, #200289 100%)', boxShadow: '0 0 50px rgba(39, 2, 166, 0.4), inset -10px -10px 20px rgba(0, 0, 0, 0.3)', animation: 'coreBreathe 6s ease-in-out infinite' }}>
                  <span className="text-white" style={{ fontSize: '3rem', filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))', opacity: 0.9 }}>
                    ☽
                  </span>
                </div>
                
                {/* Floating Z's */}
                <span className="absolute font-semibold pointer-events-none" style={{ top: '18%', right: '18%', fontSize: '1.8rem', color: 'rgba(39, 2, 166, 0.5)', animation: 'floatZ 5s ease-in-out infinite' }}>Z</span>
                <span className="absolute font-semibold pointer-events-none" style={{ top: '32%', right: '10%', fontSize: '1.2rem', color: 'rgba(39, 2, 166, 0.5)', animation: 'floatZ 5s ease-in-out infinite 1.6s' }}>z</span>
                <span className="absolute font-semibold pointer-events-none" style={{ top: '12%', right: '28%', fontSize: '1.5rem', color: 'rgba(39, 2, 166, 0.5)', animation: 'floatZ 5s ease-in-out infinite 3.2s' }}>Z</span>
              </div>
            </div>
            
            {/* Right - Content */}
            <div>
              {/* Badge */}
              <span className="badge-green inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                Zero Stress Ops
              </span>
              
              {/* Title */}
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-6">
                Sleep Soundly
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6">
                Infrastructure that just works — no midnight alerts, no emergency
                rollbacks, no sweating over deployments. We have got you covered.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="tag-primary px-4 py-2 rounded-full text-sm sm:text-base font-medium">Auto-Remediation</span>
                <span className="tag-primary px-4 py-2 rounded-full text-sm sm:text-base font-medium">Zero Downtime</span>
                <span className="tag-primary px-4 py-2 rounded-full text-sm sm:text-base font-medium">24/7 Monitoring</span>
              </div>
              
              {/* Status Flow */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <span className="px-3 py-1.5 rounded text-xs font-bold text-red-600 bg-red-50 border border-red-200 animate-[floatStandard_3s_ease-in-out_infinite]">
                  Alert
                </span>
                <span className="text-gray-400 animate-[arrowPulse_2s_ease-in-out_infinite]">→</span>
                <span className="px-3 py-1.5 rounded text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 animate-[floatStandard_3s_ease-in-out_infinite_0.5s]">
                  Detect
                </span>
                <span className="text-gray-400 animate-[arrowPulse_2s_ease-in-out_infinite_0.33s]">→</span>
                <span className="px-3 py-1.5 rounded text-xs font-bold text-primary bg-primary-light border border-primary-light animate-[floatStandard_3s_ease-in-out_infinite_1s]">
                  Fix
                </span>
                <span className="text-gray-400 animate-[arrowPulse_2s_ease-in-out_infinite_0.66s]">→</span>
                <span className="px-3 py-1.5 rounded text-xs font-bold text-green-700 bg-green-50 border border-green-200 whitespace-nowrap animate-[floatStandard_3s_ease-in-out_infinite_1.5s]">
                  💤 You Sleep
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* We Listen to Your Team */}
      <section className="py-16 lg:py-20 relative overflow-hidden" style={{ '--conv-bg': 'rgba(39,2,166,0.03)', background: 'linear-gradient(180deg, rgba(39,2,166,0.03) 0%, rgba(0,188,212,0.02) 50%, transparent 100%)' } as React.CSSProperties}>
        {/* Background animated elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating connection dots */}
          <div className="absolute w-2 h-2 rounded-full bg-primary/10" style={{ top: '15%', left: '8%', animation: 'convFloat 8s ease-in-out infinite' }} />
          <div className="absolute w-3 h-3 rounded-full bg-cyan-400/10" style={{ top: '30%', right: '12%', animation: 'convFloat 10s ease-in-out infinite 2s' }} />
          <div className="absolute w-2 h-2 rounded-full bg-primary/8" style={{ top: '60%', left: '5%', animation: 'convFloat 9s ease-in-out infinite 4s' }} />
          <div className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400/8" style={{ top: '75%', right: '7%', animation: 'convFloat 7s ease-in-out infinite 1s' }} />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-primary/10" style={{ top: '45%', left: '15%', animation: 'convFloat 11s ease-in-out infinite 3s' }} />
          <div className="absolute w-2 h-2 rounded-full bg-primary/6" style={{ top: '20%', right: '20%', animation: 'convFloat 12s ease-in-out infinite 5s' }} />

          {/* Subtle connection lines */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="5%" y1="20%" x2="25%" y2="40%" stroke="rgba(39,2,166,0.04)" strokeWidth="1" strokeDasharray="4 6" style={{ animation: 'convLineDash 8s linear infinite' }} />
            <line x1="75%" y1="15%" x2="95%" y2="45%" stroke="rgba(0,188,212,0.04)" strokeWidth="1" strokeDasharray="4 6" style={{ animation: 'convLineDash 10s linear infinite 2s' }} />
            <line x1="10%" y1="70%" x2="30%" y2="85%" stroke="rgba(39,2,166,0.03)" strokeWidth="1" strokeDasharray="4 6" style={{ animation: 'convLineDash 9s linear infinite 4s' }} />
            <line x1="70%" y1="60%" x2="92%" y2="80%" stroke="rgba(0,188,212,0.03)" strokeWidth="1" strokeDasharray="4 6" style={{ animation: 'convLineDash 11s linear infinite 1s' }} />
          </svg>

          {/* Soft radial glows */}
          <div className="absolute w-[300px] h-[300px] rounded-full" style={{ top: '-5%', left: '-5%', background: 'radial-gradient(circle, rgba(39,2,166,0.04) 0%, transparent 70%)', animation: 'convGlow 6s ease-in-out infinite' }} />
          <div className="absolute w-[250px] h-[250px] rounded-full" style={{ bottom: '-5%', right: '-3%', background: 'radial-gradient(circle, rgba(0,188,212,0.03) 0%, transparent 70%)', animation: 'convGlow 8s ease-in-out infinite 3s' }} />
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — text content */}
            <div>
              <span className="badge-cyan inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                Collaborative Approach
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight mb-6">
                We Listen to Your Team
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8">
                Ask us anything — video calls, brainstorming sessions, infra reviews, cost audits. We are here.
              </p>

              <div className="border-t border-gray-200 pt-8">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  Real conversations. Real solutions.
                </p>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
                  Video calls, screenshares, brainstorming — whatever it takes to
                  understand your pain points and architect infrastructure that works for you.
                </p>
              </div>

              {/* Process flow */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                  <span className="text-sm sm:text-base text-gray-700 font-medium">You share problem</span>
                </div>
                <span className="text-gray-300 text-lg">→</span>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary"></span>
                  <span className="text-sm sm:text-base text-gray-700 font-medium">We discuss &amp; design</span>
                </div>
                <span className="text-gray-300 text-lg">→</span>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-sm sm:text-base text-gray-700 font-medium">Build solution</span>
                </div>
              </div>
            </div>

            {/* Right — animated conversation */}
            <div>
              <AnimatedConversation />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 lg:py-20 bg-section-alt">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
            Ready to Simplify Your Infrastructure?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg sm:text-xl text-gray-600 leading-relaxed">
            Everything is open source. Start deploying in minutes, not weeks.
          </p>
          <div className="mt-8">
            <Link
              href="/docs"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-10 py-4 text-lg font-bold text-white transition-all hover:opacity-90 bg-gradient-primary shadow-primary"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
