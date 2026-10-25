import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AnimatePresence, useReducedMotion, m } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { RootState } from '../store/store';
import { getPalette } from '../data/osPersona';
import AmbientBackground from '../components/AmbientBackground';
import ThemeSwitcher from '../components/ThemeSwitcher';
import Footer from '../components/Footer';
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
  const palette = getPalette(useSelector((state: RootState) => state.theme.palette));
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
    document.body.className = isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900';
  }, [isDark]);

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

  const rise = reduce ? 0 : 10;
  const fade = {
    hidden: { opacity: 0, y: rise },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.32, ease: 'easeOut' as const } },
  };

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <AmbientBackground />
      <header
        className={`fixed left-0 top-0 z-[130] w-full shadow-md ${
          isDark ? 'bg-slate-950/85 backdrop-blur-md' : 'bg-white/85 backdrop-blur-md'
        }`}
      >
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
          <Link
            to="/"
            className={`group inline-flex shrink-0 items-center gap-2 font-mono text-sm font-bold tracking-tight md:text-base ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <ArrowLeft size={15} className="opacity-70 transition group-hover:-translate-x-0.5 group-hover:opacity-100" />
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: 'var(--os-primary)' }} />
            <span>
              hari<span style={{ color: 'var(--os-primary)' }}>.os</span>
              <span className={`ml-1.5 font-sans text-xs font-semibold ${muted}`}>Portfolio</span>
            </span>
          </Link>
          <ThemeSwitcher />
        </div>
      </header>

      <main className="relative z-10 px-4 pb-8 pt-28">
      <m.div
        className="mx-auto max-w-3xl"
        variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.08 } } }}
        initial="hidden"
        animate="show"
      >
        <m.p variants={fade} className={`text-xs font-bold uppercase tracking-[0.22em] ${muted}`}>
          hari.os
        </m.p>
        <m.h1 variants={fade} className="mt-4 text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: palette.heroGradient }}>
            Ops
          </span>
        </m.h1>
        <m.p variants={fade} className={`mt-3 max-w-xl text-base leading-relaxed md:text-lg ${muted}`}>
          Build in public. Aggregates only, from Cloudflare Web Analytics.
        </m.p>

        {mock && (
          <m.p
            variants={fade}
            className="mt-6 rounded-2xl border px-4 py-3 text-sm font-semibold"
            style={{
              color: 'var(--os-primary)',
              borderColor: 'color-mix(in srgb, var(--os-primary) 45%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--os-primary) 10%, transparent)',
            }}
          >
            Sample data for local preview. Not live Cloudflare numbers.
          </m.p>
        )}

        <m.div variants={fade} className="mt-8 flex flex-wrap items-center gap-3">
          {(['7d', '30d'] as const).map((value) => (
            <m.button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              aria-pressed={range === value}
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className={`rounded-2xl px-4 py-2 text-sm font-bold ${range === value ? 'text-white shadow-xl' : muted}`}
              style={
                range === value
                  ? { backgroundColor: theme.colors.primary, boxShadow: `0 12px 36px ${theme.colors.primary}55` }
                  : undefined
              }
            >
              {value}
            </m.button>
          ))}
        </m.div>

        <m.div variants={fade} className="mt-6 flex gap-5 overflow-x-auto" role="tablist" aria-label="Ops">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`relative shrink-0 px-1 pb-2 text-sm font-medium tracking-wide ${tab === item.id ? '' : muted}`}
              style={tab === item.id ? { color: 'var(--os-primary)' } : undefined}
            >
              {item.label}
              {tab === item.id && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full" style={{ backgroundColor: 'var(--os-primary)' }} />
              )}
            </button>
          ))}
        </m.div>

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

        <m.p variants={fade} className={`mt-4 text-xs leading-relaxed ${muted}`}>
          {OPS_FOOTNOTE}
        </m.p>
      </m.div>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default OpsPage;
