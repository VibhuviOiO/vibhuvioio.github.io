'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Box,
  Cloud,
  Cpu,
  Database,
  KeyRound,
  Network,
  Pause,
  Play,
  RotateCcw,
  Server,
  Shield,
  Sparkles,
  Wifi,
  Zap,
} from 'lucide-react';

type ScenarioId = 'healthy' | 'cache' | 'fallback';

type StageId = 'auth' | 'cache' | 'route' | 'provider' | 'response';

type Stage = {
  id: StageId;
  label: string;
  icon: typeof Shield;
};

const STAGES: Stage[] = [
  { id: 'auth', label: 'Auth + Virtual Key', icon: KeyRound },
  { id: 'cache', label: 'Cache Lookup', icon: Database },
  { id: 'route', label: 'Routing + Budget', icon: Network },
  { id: 'provider', label: 'Provider Call', icon: Cloud },
  { id: 'response', label: 'Response', icon: Activity },
];

type ProviderId = 'ollama' | 'gemini' | 'groq' | 'bedrock' | 'openrouter';

type Provider = {
  id: ProviderId;
  label: string;
  sub: string;
  icon: typeof Cloud;
  color: string;
};

const PROVIDERS: Provider[] = [
  { id: 'ollama', label: 'Ollama', sub: 'local', icon: Cpu, color: '#10b981' },
  { id: 'gemini', label: 'Gemini', sub: 'free tier', icon: Sparkles, color: '#3b82f6' },
  { id: 'groq', label: 'Groq', sub: 'fast', icon: Zap, color: '#f97316' },
  { id: 'bedrock', label: 'Bedrock', sub: 'enterprise', icon: Cloud, color: '#6366f1' },
  { id: 'openrouter', label: 'OpenRouter', sub: 'hosted', icon: Wifi, color: '#a855f7' },
];

type ClientId = 'sdk' | 'agent' | 'app';
type Client = { id: ClientId; label: string; icon: typeof Box; sub: string };

const CLIENTS: Client[] = [
  { id: 'sdk', label: 'OpenAI SDK', sub: 'Python / TS', icon: Box },
  { id: 'agent', label: 'LangGraph', sub: 'agent loop', icon: Server },
  { id: 'app', label: 'Custom App', sub: 'curl / HTTP', icon: Cpu },
];

type Scenario = {
  id: ScenarioId;
  title: string;
  summary: string;
  accent: string;
  client: ClientId;
  primary: ProviderId;
  fallback?: ProviderId;
  cacheHit?: boolean;
  primaryFails?: boolean;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'healthy',
    title: 'Healthy route',
    summary: 'OpenAI-compatible request → routed to the cheapest provider that meets the SLA → answered.',
    accent: '#10b981',
    client: 'sdk',
    primary: 'gemini',
  },
  {
    id: 'cache',
    title: 'Cache hit',
    summary: 'Request matches a recent prompt → semantic cache returns the answer → no provider call, no spend.',
    accent: '#3b82f6',
    client: 'agent',
    primary: 'bedrock',
    cacheHit: true,
  },
  {
    id: 'fallback',
    title: 'Fallback after failure',
    summary: 'Primary provider returns a 5xx → circuit breaker trips → request retried on the declared fallback.',
    accent: '#f97316',
    client: 'app',
    primary: 'groq',
    fallback: 'bedrock',
    primaryFails: true,
  },
];

const TICK_MS = 520;
const STEPS_PER_SCENARIO = 36;

export default function LiteLLMGatewayFlow() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const scenario = SCENARIOS[scenarioIdx];

  useEffect(() => {
    if (!playing) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => {
      setStep((s) => {
        if (s + 1 >= STEPS_PER_SCENARIO) {
          setScenarioIdx((i) => (i + 1) % SCENARIOS.length);
          return 0;
        }
        return s + 1;
      });
    }, TICK_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing]);

  const phase = useMemo(() => phaseFor(step, scenario), [step, scenario]);

  return (
    <div className="my-8 rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm lg:-mx-6 xl:-mx-16">
      <Header
        scenario={scenario}
        playing={playing}
        onToggle={() => setPlaying((p) => !p)}
        onReset={() => {
          setStep(0);
          setScenarioIdx(0);
        }}
        onPick={(i) => {
          setScenarioIdx(i);
          setStep(0);
        }}
        scenarioIdx={scenarioIdx}
      />
      <FlowCanvas scenario={scenario} step={step} phase={phase} />
      <Legend />
    </div>
  );
}

function Header({
  scenario,
  playing,
  onToggle,
  onReset,
  onPick,
  scenarioIdx,
}: {
  scenario: Scenario;
  playing: boolean;
  onToggle: () => void;
  onReset: () => void;
  onPick: (i: number) => void;
  scenarioIdx: number;
}) {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {SCENARIOS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onPick(i)}
              className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                i === scenarioIdx
                  ? 'border-transparent text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
              style={i === scenarioIdx ? { background: s.accent } : undefined}
            >
              {s.title}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

type Phase = {
  stage: StageId | 'idle';
  label: string;
  detail: string;
  icon: React.ReactNode;
  focus: { x: number; y: number };
};

function phaseFor(step: number, scenario: Scenario): Phase {
  const client = CLIENTS.find((c) => c.id === scenario.client)!;
  const primary = PROVIDERS.find((p) => p.id === scenario.primary)!;
  const fallback = scenario.fallback ? PROVIDERS.find((p) => p.id === scenario.fallback)! : null;

  const clientAnchor = { x: CLIENT_X + CLIENT_W, y: clientY(client.id) };
  const gatewayMid = { x: GATEWAY_X + GATEWAY_W / 2, y: 200 };
  const gatewayLeft = { x: GATEWAY_X, y: 110 };
  const gatewayOut = { x: GATEWAY_X + GATEWAY_W, y: 250 };
  const primaryAnchor = { x: PROVIDER_X + PROVIDER_W / 2, y: providerY(primary.id) };
  const fallbackAnchor = fallback
    ? { x: PROVIDER_X + PROVIDER_W / 2, y: providerY(fallback.id) }
    : primaryAnchor;

  if (step < 5) {
    return {
      stage: 'auth',
      label: 'Application sends an OpenAI-compatible request',
      detail: 'Client SDK does not know which provider will answer — only the gateway URL.',
      icon: <Box className="h-3 w-3" />,
      focus: midpoint(clientAnchor, gatewayLeft),
    };
  }
  if (step < 10) {
    return {
      stage: 'auth',
      label: 'Gateway validates the virtual key',
      detail: 'Per-team key, budget check, TPM/RPM rate limit, model-access scope.',
      icon: <KeyRound className="h-3 w-3" />,
      focus: { x: GATEWAY_X + GATEWAY_W / 2, y: 122 },
    };
  }
  if (step < 15) {
    if (scenario.cacheHit && step >= 12) {
      return {
        stage: 'cache',
        label: 'Semantic cache HIT — short-circuiting the provider call',
        detail: 'Redis returns the prior answer. No tokens spent, p95 latency drops to single-digit ms.',
        icon: <Database className="h-3 w-3" />,
        focus: { x: GATEWAY_X + GATEWAY_W / 2, y: 168 },
      };
    }
    return {
      stage: 'cache',
      label: 'Cache lookup',
      detail: 'Exact-match + semantic embedding lookup in Redis.',
      icon: <Database className="h-3 w-3" />,
      focus: { x: GATEWAY_X + GATEWAY_W / 2, y: 168 },
    };
  }
  if (scenario.cacheHit) {
    return {
      stage: 'response',
      label: 'Cached response returned to the client',
      detail: 'Same response shape as a real provider call. The client cannot tell the difference.',
      icon: <Activity className="h-3 w-3" />,
      focus: midpoint(gatewayLeft, clientAnchor),
    };
  }
  if (step < 20) {
    return {
      stage: 'route',
      label: 'Routing strategy picks a provider',
      detail: 'simple-shuffle, least-busy, latency-aware, or cost-aware — your YAML, your choice.',
      icon: <Network className="h-3 w-3" />,
      focus: { x: GATEWAY_X + GATEWAY_W / 2, y: 214 },
    };
  }
  if (step < 27) {
    if (scenario.primaryFails && step >= 23) {
      return {
        stage: 'provider',
        label: 'Primary returned 5xx — circuit breaker tripped',
        detail: 'Declared fallback chain takes over. Retried on the next provider.',
        icon: <AlertTriangle className="h-3 w-3" />,
        focus: midpoint(gatewayOut, fallbackAnchor),
      };
    }
    return {
      stage: 'provider',
      label: 'Provider call in flight',
      detail: 'Same OpenAI-compatible wire format on the way out, regardless of provider.',
      icon: <Cloud className="h-3 w-3" />,
      focus: midpoint(gatewayOut, primaryAnchor),
    };
  }
  if (step < 32) {
    return {
      stage: 'response',
      label: 'Response streamed back, metrics + cost recorded',
      detail: 'Postgres logs the call, Prometheus exporter updates dashboards, audit trail written.',
      icon: <Activity className="h-3 w-3" />,
      focus: midpoint(gatewayLeft, clientAnchor),
    };
  }
  return {
    stage: 'idle',
    label: 'Request complete',
    detail: 'Next request will reuse the same auth, cache, and routing path.',
    icon: <Activity className="h-3 w-3" />,
    focus: { x: clientAnchor.x + 20, y: clientAnchor.y },
  };
}

function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

const W = 960;
const H = 420;

const CLIENT_X = 70;
const CLIENT_W = 130;
const GATEWAY_X = 380;
const GATEWAY_W = 220;
const PROVIDER_X = 790;
const PROVIDER_W = 120;

function clientY(id: ClientId) {
  const idx = CLIENTS.findIndex((c) => c.id === id);
  return 80 + idx * 110;
}

function providerY(id: ProviderId) {
  const idx = PROVIDERS.findIndex((p) => p.id === id);
  return 50 + idx * 70;
}

function FlowCanvas({ scenario, step, phase }: { scenario: Scenario; step: number; phase: Phase }) {
  const client = CLIENTS.find((c) => c.id === scenario.client)!;
  const primary = PROVIDERS.find((p) => p.id === scenario.primary)!;
  const fallback = scenario.fallback ? PROVIDERS.find((p) => p.id === scenario.fallback)! : null;

  const gatewayInY = clientY(client.id);
  const gatewayEdgeInY = 122;     // matches auth/key stage row centerline
  const gatewayEdgeOutY = 250;    // matches provider stage row centerline

  // Packet positions — interpolate per phase
  const inboundT = Math.min(1, Math.max(0, (step - 0) / 5));
  const cacheT = scenario.cacheHit
    ? Math.min(1, Math.max(0, (step - 10) / 5))
    : 0;
  const outboundToProviderT = scenario.cacheHit
    ? 0
    : Math.min(1, Math.max(0, (step - 15) / 5));
  const providerFailT = scenario.primaryFails
    ? Math.min(1, Math.max(0, (step - 20) / 3))
    : 0;
  const fallbackT =
    scenario.primaryFails && scenario.fallback
      ? Math.min(1, Math.max(0, (step - 23) / 4))
      : 0;
  const returnFromProviderT = scenario.cacheHit
    ? 0
    : Math.min(1, Math.max(0, (step - 27) / 5));
  const returnToClientT = Math.min(1, Math.max(0, (step - 27) / 5));

  // Stage activations
  const stageActive: Record<StageId, boolean> = {
    auth: step >= 5 && step < 15,
    cache: step >= 10 && step < 15,
    route: step >= 15 && step < 20 && !scenario.cacheHit,
    provider: step >= 20 && step < 27 && !scenario.cacheHit,
    response: step >= 27,
  };

  const primaryActive = step >= 20 && !scenario.cacheHit;
  const primaryDown = scenario.primaryFails && step >= 23;
  const fallbackActive = !!fallback && step >= 25;

  const clientEdge = { x: CLIENT_X + CLIENT_W, y: gatewayInY };
  const gatewayInEdge = { x: GATEWAY_X, y: gatewayEdgeInY };
  const gatewayOutEdge = { x: GATEWAY_X + GATEWAY_W, y: gatewayEdgeOutY };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 760 }}>
        <defs>
          <linearGradient id="gateway-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Column labels */}
        <text x={CLIENT_X + 35} y={26} fontSize="11" fill="#94a3b8" fontWeight="600">
          APPLICATIONS
        </text>
        <text x={GATEWAY_X + 58} y={26} fontSize="11" fill="#94a3b8" fontWeight="600">
          LITELLM GATEWAY
        </text>
        <text x={PROVIDER_X + 30} y={26} fontSize="11" fill="#94a3b8" fontWeight="600">
          PROVIDERS
        </text>

        {/* Clients */}
        {CLIENTS.map((c) => (
          <ClientNode
            key={c.id}
            client={c}
            active={c.id === scenario.client && step < 32}
            accent={scenario.accent}
          />
        ))}

        {/* Gateway box */}
        <g>
          <rect
            x={GATEWAY_X}
            y={50}
            width={GATEWAY_W}
            height={330}
            rx={16}
            fill="url(#gateway-grad)"
            opacity={0.95}
          />
          <text x={GATEWAY_X + GATEWAY_W / 2} y={74} textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700" opacity={0.85}>
            OpenAI-compatible API
          </text>
          {STAGES.map((s, i) => (
            <StageRow
              key={s.id}
              stage={s}
              y={100 + i * 52}
              active={stageActive[s.id]}
              dimmed={
                (s.id === 'route' || s.id === 'provider') && !!scenario.cacheHit
              }
            />
          ))}
        </g>

        {/* Providers */}
        {PROVIDERS.map((p) => {
          const isPrimary = p.id === scenario.primary;
          const isFallback = fallback && p.id === fallback.id;
          const active = (isPrimary && primaryActive && !primaryDown) || (isFallback && fallbackActive);
          const failed = isPrimary && primaryDown;
          return (
            <ProviderNode
              key={p.id}
              provider={p}
              active={!!active}
              failed={!!failed}
              dimmed={!isPrimary && !isFallback}
            />
          );
        })}

        {/* Connector: client → gateway */}
        <Wire from={clientEdge} to={gatewayInEdge} color="#cbd5e1" />
        {/* Connector: gateway → primary */}
        <Wire
          from={gatewayOutEdge}
          to={{ x: PROVIDER_X, y: providerY(primary.id) }}
          color={primaryDown ? '#fca5a5' : '#cbd5e1'}
          dashed={primaryDown}
        />
        {/* Connector: gateway → fallback */}
        {fallback && (
          <Wire
            from={gatewayOutEdge}
            to={{ x: PROVIDER_X, y: providerY(fallback.id) }}
            color={fallbackActive ? '#fdba74' : '#e2e8f0'}
          />
        )}

        {/* Animated packets */}
        {inboundT > 0 && inboundT < 1 && (
          <Packet from={clientEdge} to={gatewayInEdge} t={inboundT} color={scenario.accent} label="req" />
        )}
        {outboundToProviderT > 0 && outboundToProviderT < 1 && !scenario.cacheHit && (
          <Packet
            from={gatewayOutEdge}
            to={{ x: PROVIDER_X, y: providerY(primary.id) }}
            t={outboundToProviderT}
            color={primary.color}
            label="call"
          />
        )}
        {providerFailT > 0 && providerFailT < 1 && (
          <Packet
            from={{ x: PROVIDER_X, y: providerY(primary.id) }}
            to={gatewayOutEdge}
            t={providerFailT}
            color="#ef4444"
            label="5xx"
          />
        )}
        {fallbackT > 0 && fallbackT < 1 && fallback && (
          <Packet
            from={gatewayOutEdge}
            to={{ x: PROVIDER_X, y: providerY(fallback.id) }}
            t={fallbackT}
            color={fallback.color}
            label="retry"
          />
        )}
        {returnFromProviderT > 0 && returnFromProviderT < 1 && !scenario.cacheHit && (
          <Packet
            from={{
              x: PROVIDER_X,
              y: providerY(fallback && scenario.primaryFails ? fallback.id : primary.id),
            }}
            to={gatewayOutEdge}
            t={returnFromProviderT}
            color="#10b981"
            label="200"
          />
        )}
        {cacheT > 0 && cacheT < 1 && scenario.cacheHit && (
          <Packet
            from={{ x: GATEWAY_X + GATEWAY_W / 2, y: 160 }}
            to={{ x: GATEWAY_X + GATEWAY_W / 2, y: 320 }}
            t={cacheT}
            color="#3b82f6"
            label="hit"
          />
        )}
        {returnToClientT > 0 && returnToClientT < 1 && (
          <Packet
            from={gatewayInEdge}
            to={clientEdge}
            t={returnToClientT}
            color={scenario.accent}
            label="resp"
          />
        )}

        {/* Floating caption that travels with the active step */}
        <FloatingCaption phase={phase} accent={scenario.accent} />
      </svg>
    </div>
  );
}

function ClientNode({
  client,
  active,
  accent,
}: {
  client: Client;
  active: boolean;
  accent: string;
}) {
  const y = clientY(client.id);
  return (
    <g>
      <rect
        x={CLIENT_X}
        y={y - 28}
        width={CLIENT_W}
        height={56}
        rx={12}
        fill={active ? '#ffffff' : '#f8fafc'}
        stroke={active ? accent : '#e2e8f0'}
        strokeWidth={active ? 2 : 1}
        filter={active ? 'url(#glow)' : undefined}
      />
      <text x={CLIENT_X + 14} y={y - 6} fontSize="13" fontWeight="700" fill="#0f172a">
        {client.label}
      </text>
      <text x={CLIENT_X + 14} y={y + 12} fontSize="11" fill="#64748b">
        {client.sub}
      </text>
    </g>
  );
}

function StageRow({
  stage,
  y,
  active,
  dimmed,
}: {
  stage: Stage;
  y: number;
  active: boolean;
  dimmed: boolean;
}) {
  return (
    <g opacity={dimmed ? 0.4 : 1}>
      <rect
        x={GATEWAY_X + 16}
        y={y}
        width={GATEWAY_W - 32}
        height={40}
        rx={9}
        fill={active ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.18)'}
        stroke={active ? '#ffffff' : 'rgba(255,255,255,0.25)'}
        strokeWidth={active ? 1.5 : 1}
      />
      <circle
        cx={GATEWAY_X + 34}
        cy={y + 20}
        r={7}
        fill={active ? '#22c55e' : 'rgba(255,255,255,0.3)'}
      />
      <text
        x={GATEWAY_X + 50}
        y={y + 25}
        fontSize="12"
        fontWeight={active ? 700 : 600}
        fill={active ? '#0f172a' : '#ffffff'}
      >
        {stage.label}
      </text>
    </g>
  );
}

function ProviderNode({
  provider,
  active,
  failed,
  dimmed,
}: {
  provider: Provider;
  active: boolean;
  failed: boolean;
  dimmed: boolean;
}) {
  const y = providerY(provider.id);
  const border = failed ? '#ef4444' : active ? provider.color : '#e2e8f0';
  return (
    <g opacity={dimmed ? 0.5 : 1}>
      <rect
        x={PROVIDER_X}
        y={y - 24}
        width={PROVIDER_W}
        height={52}
        rx={11}
        fill="#ffffff"
        stroke={border}
        strokeWidth={active || failed ? 2 : 1}
        filter={active || failed ? 'url(#glow)' : undefined}
      />
      <circle
        cx={PROVIDER_X + 16}
        cy={y + 2}
        r={7}
        fill={failed ? '#ef4444' : active ? provider.color : '#cbd5e1'}
      />
      <text x={PROVIDER_X + 32} y={y - 4} fontSize="13" fontWeight="700" fill="#0f172a">
        {provider.label}
      </text>
      <text x={PROVIDER_X + 32} y={y + 14} fontSize="11" fill="#64748b">
        {failed ? '5xx · degraded' : provider.sub}
      </text>
    </g>
  );
}

function Wire({
  from,
  to,
  color,
  dashed,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  dashed?: boolean;
}) {
  const path = curvePath(from, to);
  return (
    <path
      d={path}
      stroke={color}
      strokeWidth={1.5}
      fill="none"
      strokeDasharray={dashed ? '4 4' : undefined}
    />
  );
}

function Packet({
  from,
  to,
  t,
  color,
  label,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  t: number;
  color: string;
  label?: string;
}) {
  const p = pointOnCurve(from, to, t);
  return (
    <g>
      <circle cx={p.x} cy={p.y} r={8} fill={color} opacity={0.25} />
      <circle cx={p.x} cy={p.y} r={5} fill={color} />
      {label && (
        <text x={p.x + 9} y={p.y - 8} fontSize="9" fontWeight="700" fill={color}>
          {label}
        </text>
      )}
    </g>
  );
}

function curvePath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = (b.x - a.x) * 0.5;
  return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
}

function pointOnCurve(
  a: { x: number; y: number },
  b: { x: number; y: number },
  t: number,
) {
  const c1 = { x: a.x + (b.x - a.x) * 0.5, y: a.y };
  const c2 = { x: b.x - (b.x - a.x) * 0.5, y: b.y };
  const mt = 1 - t;
  const x =
    mt * mt * mt * a.x +
    3 * mt * mt * t * c1.x +
    3 * mt * t * t * c2.x +
    t * t * t * b.x;
  const y =
    mt * mt * mt * a.y +
    3 * mt * mt * t * c1.y +
    3 * mt * t * t * c2.y +
    t * t * t * b.y;
  return { x, y };
}

function FloatingCaption({ phase, accent }: { phase: Phase; accent: string }) {
  // Anchor a 280×72 caption near the focus point, clamping inside the viewBox.
  const boxW = 300;
  const boxH = 78;
  const margin = 12;
  let x = phase.focus.x - boxW / 2;
  let y = phase.focus.y + 24;
  if (y + boxH > H - margin) y = phase.focus.y - boxH - 24;
  if (x < margin) x = margin;
  if (x + boxW > W - margin) x = W - boxW - margin;

  // Connector from focus to the caption's nearest edge midpoint.
  const captionAnchor = {
    x: Math.max(x + 12, Math.min(x + boxW - 12, phase.focus.x)),
    y: y > phase.focus.y ? y : y + boxH,
  };

  return (
    <g
      key={phase.label}
      style={{
        transformOrigin: `${phase.focus.x}px ${phase.focus.y}px`,
        animation: 'litellm-caption-in 320ms ease-out both',
      }}
    >
      <style>{`
        @keyframes litellm-caption-in {
          0%   { opacity: 0; transform: translateY(6px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      {/* Pulsing focus dot */}
      <circle cx={phase.focus.x} cy={phase.focus.y} r={10} fill={accent} opacity={0.18}>
        <animate attributeName="r" values="10;16;10" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.22;0.05;0.22" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx={phase.focus.x} cy={phase.focus.y} r={5} fill={accent} />
      {/* Connector to caption */}
      <line
        x1={phase.focus.x}
        y1={phase.focus.y}
        x2={captionAnchor.x}
        y2={captionAnchor.y}
        stroke={accent}
        strokeWidth={1.5}
        strokeDasharray="3 3"
        opacity={0.55}
      />
      {/* Caption card */}
      <rect
        x={x}
        y={y}
        width={boxW}
        height={boxH}
        rx={10}
        fill="#0f172a"
        stroke={accent}
        strokeWidth={1.25}
        opacity={0.97}
      />
      <rect x={x} y={y} width={3} height={boxH} rx={1.5} fill={accent} />
      <foreignObject x={x + 12} y={y + 8} width={boxW - 24} height={boxH - 16}>
        <div
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#f8fafc',
            lineHeight: 1.35,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700 }}>{phase.label}</div>
          <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 2 }}>
            {phase.detail}
          </div>
        </div>
      </foreignObject>
    </g>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500">
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-emerald-500" /> active stage
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-blue-500" /> cache hit path
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-orange-500" /> fallback path
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-red-500" /> provider failed
      </span>
      <span className="ml-auto text-gray-400">Scenarios auto-cycle. Click a chip to jump.</span>
    </div>
  );
}
