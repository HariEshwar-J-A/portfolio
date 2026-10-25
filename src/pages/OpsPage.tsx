import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, useReducedMotion, m } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { glassPanel } from '../components/SectionShell';
import HatDisclosure from '../components/HatDisclosure';
import { applyOpsMeta } from '../lib/pageMeta';
import { OPS_FOOTNOTE } from '../lib/ops/copy';
import type { OpsBody } from '../lib/ops/buildOps';
import type { SourceBucket } from '../lib/ops/privacy';

type Tab = 'traffic' | 'hats' | 'sources' | 'speed' | 'health';

const TABS: { id: Tab; label: string }[] = [
  { id: 'traffic', label: 'Traffic' },
  { id: 'hats', label: 'Hats' },
  { id: 'sources', label: 'Sources' },
  { id: 'speed', label: 'Speed' },
  { id: 'health', label: 'Health' },
];

const HAT_LABELS: Record<string, string> = {
  '/': 'Home',
  '/full-stack': 'Full-stack',
  '/ai-engineer': 'AI engineer',
  '/sde': 'SDE',
  '/fde': 'FDE',
  '/pm': 'Product-minded',
  '/chess': 'Chess',
};

const SOURCE_LABELS: Record<SourceBucket, string> = {
  search: 'Search',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  x: 'X',
  direct: 'Direct',
  other: 'Other',
};

interface BundleMeta {
  jsBytes: number;
  jsGzipBytes: number;
}

const countText = (visits: number | null) => (visits == null ? 'Under 5' : visits.toLocaleString('en-US'));

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} kB`;

const Trend: React.FC<{ points: { visits: number | null }[] }> = ({ points }) => {
  const values = points.map((point) => point.visits).filter((value): value is number => value != null);
  if (values.length < 2) return <p className="text-sm opacity-70">Not enough days to draw.</p>;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const width = 320;
  const height = 72;
  const coords = points
    .map((point, index) => {
      if (point.visits == null) return null;
      const x = points.length === 1 ? 0 : (index / (points.length - 1)) * width;
      const y = height - 8 - ((point.visits - min) / (max - min || 1)) * (height - 16);
      return `${x},${y}`;
    })
    .filter((point): point is string => point != null);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-16 w-full" role="img" aria-label="Visits by day">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={coords.join(' ')} />
    </svg>
  );
};

const OpsPage: React.FC = () => {
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const isDark = theme.mode === 'dark';
  const [tab, setTab] = useState<Tab>('traffic');
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const [body, setBody] = useState<OpsBody | null>(null);
  const [mock, setMock] = useState(false);
  const [bundle, setBundle] = useState<BundleMeta | null>(null);
  const [countriesOpen, setCountriesOpen] = useState(false);
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  useEffect(() => {
    applyOpsMeta();
  }, []);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        const response = await fetch(`/api/ops?range=${range}`);
        const payload = response.ok ? ((await response.json()) as OpsBody) : null;
        if (cancel) return;
        if (payload?.ok) {
          setBody(payload);
          setMock(false);
          const metaResponse = await fetch('/ops-meta.json');
          if (!cancel && metaResponse.ok) setBundle((await metaResponse.json()) as BundleMeta);
          return;
        }
        if (payload && !payload.ok) setBody(payload);
      } catch {
        /* The dev server has no function. Fall through. */
      }
      if (cancel) return;
      if (import.meta.env.DEV) {
        const fixture = await import('../lib/ops/fixture');
        if (!cancel) {
          setBody({ ...fixture.OPS_FIXTURE, range });
          setMock(true);
          setBundle(fixture.OPS_SAMPLE_BUNDLE);
        }
        return;
      }
      if (!cancel) setMock(false);
    };
    void load();
    return () => {
      cancel = true;
    };
  }, [range]);

  const live = body?.ok ? body : null;
  const countries = live?.traffic.countries ?? [];
  const hiddenCountries = countries.slice(4);

  return (
    <main className={`min-h-screen px-4 pb-16 pt-8 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <p className={`font-mono text-[10px] font-bold uppercase tracking-[0.22em] ${muted}`}>hari.os</p>
          <Link to="/" className={`text-sm font-semibold underline-offset-4 hover:underline ${muted}`}>
            Portfolio
          </Link>
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight">Ops</h1>
        <p className={`mt-2 max-w-xl text-base ${muted}`}>Build in public. Aggregates only, from Cloudflare Web Analytics.</p>

        {mock && (
          <p
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
              isDark ? 'border-amber-300/30 bg-amber-300/10 text-amber-100' : 'border-amber-700/20 bg-amber-50 text-amber-950'
            }`}
          >
            Sample data for local preview. Not live Cloudflare numbers.
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {(['7d', '30d'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              aria-pressed={range === value}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${range === value ? 'text-white' : muted}`}
              style={range === value ? { backgroundColor: theme.colors.primary } : undefined}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-1 overflow-x-auto" role="tablist" aria-label="Ops">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${tab === item.id ? '' : muted}`}
              style={tab === item.id ? { color: theme.colors.primary } : undefined}
            >
              {item.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <m.section
            key={tab}
            role="tabpanel"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: reduce ? 0.01 : 0.2, ease: 'easeOut' }}
            className={`${glassPanel(isDark)} mt-4 p-5`}
          >
            {!live && <p>Warming up. Counts show here once Cloudflare analytics is connected.</p>}

            {live && tab === 'traffic' && (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-black">{countText(live.traffic.visits)}</p>
                    <p className={`text-sm ${muted}`}>Visits</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black">{countText(live.traffic.pageViews)}</p>
                    <p className={`text-sm ${muted}`}>Page views</p>
                  </div>
                </div>
                <Trend points={live.traffic.trend} />
                <ul className="mt-4 space-y-2 text-sm">
                  {countries.slice(0, 4).map((country) => (
                    <li key={country.name} className="flex justify-between gap-4">
                      <span>{country.name}</span>
                      <span className="font-semibold">{country.visits}</span>
                    </li>
                  ))}
                </ul>
                {hiddenCountries.length > 0 && (
                  <>
                    <HatDisclosure open={countriesOpen}>
                      <ul className="space-y-2 pt-2 text-sm">
                        {hiddenCountries.map((country) => (
                          <li key={country.name} className="flex justify-between gap-4">
                            <span>{country.name}</span>
                            <span className="font-semibold">{country.visits}</span>
                          </li>
                        ))}
                      </ul>
                    </HatDisclosure>
                    <button type="button" onClick={() => setCountriesOpen((open) => !open)} className="mt-3 text-sm font-semibold" style={{ color: theme.colors.primary }}>
                      {countriesOpen ? 'Show less' : 'Show all'}
                    </button>
                  </>
                )}
              </div>
            )}

            {live && tab === 'hats' && (
              <ul className="space-y-2 text-sm">
                {live.hats.map((hat) => (
                  <li key={hat.path} className="flex justify-between gap-4">
                    <span>{HAT_LABELS[hat.path] ?? hat.path}</span>
                    <span className="font-semibold">{countText(hat.visits)}</span>
                  </li>
                ))}
              </ul>
            )}

            {live && tab === 'sources' && (
              <ul className="space-y-2 text-sm">
                {live.sources.map((source) => (
                  <li key={source.bucket} className="flex justify-between gap-4">
                    <span>{SOURCE_LABELS[source.bucket]}</span>
                    <span className="font-semibold">{source.visits}</span>
                  </li>
                ))}
                {live.sources.length === 0 && <li>No source has 5 or more visits in this window.</li>}
              </ul>
            )}

            {live && tab === 'speed' && (
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  ['LCP', live.speed.lcpMs == null ? '—' : `${live.speed.lcpMs} ms`],
                  ['INP', live.speed.inpMs == null ? '—' : `${live.speed.inpMs} ms`],
                  ['CLS', live.speed.cls == null ? '—' : String(live.speed.cls)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-2xl font-black">{value}</p>
                    <p className={`text-xs ${muted}`}>{label} p75</p>
                  </div>
                ))}
              </div>
            )}

            {live && tab === 'health' && (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className={muted}>HTTP status</dt>
                  <dd className="font-semibold">{live.health.httpStatus ?? 'Unreachable'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className={muted}>Commit</dt>
                  <dd className="font-semibold">{live.health.sha ?? 'Not in this build'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className={muted}>Committed</dt>
                  <dd className="font-semibold">
                    {live.health.committedAt ? new Date(live.health.committedAt).toLocaleString() : '—'}
                  </dd>
                </div>
                <div>
                  <dt className={muted}>Subject</dt>
                  <dd className="mt-1 font-semibold">{live.health.subject ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className={muted}>Main bundle</dt>
                  <dd className="font-semibold">
                    {bundle ? `${kb(bundle.jsBytes)} / ${kb(bundle.jsGzipBytes)} gzip` : 'Not in this build'}
                  </dd>
                </div>
              </dl>
            )}
          </m.section>
        </AnimatePresence>

        <p className={`mt-4 text-xs leading-relaxed ${muted}`}>{OPS_FOOTNOTE}</p>
      </div>
    </main>
  );
};

export default OpsPage;
