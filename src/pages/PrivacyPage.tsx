import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useReducedMotion, m } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { RootState } from '../store/store';
import { getPalette } from '../data/osPersona';
import AmbientBackground from '../components/AmbientBackground';
import ThemeSwitcher from '../components/ThemeSwitcher';
import Footer from '../components/Footer';
import { glassPanel } from '../components/SectionShell';
import { applyPrivacyMeta } from '../lib/pageMeta';

const PrivacyPage: React.FC = () => {
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const palette = getPalette(useSelector((state: RootState) => state.theme.palette));
  const isDark = theme.mode === 'dark';
  const muted = isDark ? 'text-slate-400' : 'text-slate-600';

  useEffect(() => {
    applyPrivacyMeta();
  }, []);

  useEffect(() => {
    document.body.className = isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900';
  }, [isDark]);

  const rise = reduce ? 0 : 10;
  const fade = {
    hidden: { opacity: 0, y: rise },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.32, ease: 'easeOut' as const } },
  };

  const sections: { title: string; body: React.ReactNode }[] = [
    {
      title: 'Analytics',
      body: (
        <p>
          Cloudflare Web Analytics counts visits. It records page views, the site that referred you, country,
          browser and device, and how long the page took to load. It does not use cookies, fingerprinting, or
          tracking across other sites.
        </p>
      ),
    },
    {
      title: 'Who runs it',
      body: (
        <p>
          This site is hosted on Netlify, behind Cloudflare. The visit counts come from Cloudflare Web Analytics.
        </p>
      ),
    },
    {
      title: 'Cookies',
      body: (
        <p>Analytics does not use cookies. This site&apos;s own code does not set cookies.</p>
      ),
    },
    {
      title: 'On your device',
      body: (
        <>
          <p>
            A few preferences stay in localStorage in this browser until you clear site data. They are not sent
            to analytics.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>The theme you picked</li>
            <li>Whether you use the short or full portfolio</li>
            <li>Playground progress, after you open the playground</li>
            <li>Chess results and recent games, after you play</li>
            <li>That you pressed OK on the analytics notice</li>
          </ul>
          <p className="mt-3">These notes use sessionStorage and disappear when you close the tab:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>That the intro already played</li>
            <li>Why you said you were here, including any detail you typed</li>
            <li>A one-time retry if a page file failed to load</li>
          </ul>
        </>
      ),
    },
    {
      title: 'Ops',
      body: (
        <p>
          The public <Link to="/ops" className="font-semibold underline-offset-4 hover:underline" style={{ color: 'var(--os-primary)' }}>ops</Link> page
          shows aggregated totals. Groups under 5 visits are hidden. It does not list individual visitors.
        </p>
      ),
    },
    {
      title: 'Questions',
      body: (
        <p>
          Use the{' '}
          <Link to="/#contact" className="font-semibold underline-offset-4 hover:underline" style={{ color: 'var(--os-primary)' }}>
            contact form
          </Link>
          .
        </p>
      ),
    },
  ];

  return (
    <div className={`relative flex min-h-screen max-w-full flex-col ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <AmbientBackground />
      <header
        className={`fixed left-0 top-0 z-[130] w-full shadow-md ${
          isDark ? 'bg-slate-950/85 backdrop-blur-md' : 'bg-white/85 backdrop-blur-md'
        }`}
      >
        <div className="container mx-auto flex min-w-0 items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
          <Link
            to="/"
            className={`group inline-flex min-w-0 items-center gap-2 font-mono text-sm font-bold tracking-tight md:text-base ${
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

      <main className="relative z-10 min-w-0 flex-1 px-4 pb-8 pt-28">
        <m.div
          className="mx-auto min-w-0 max-w-3xl"
          variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}
          initial="hidden"
          animate="show"
        >
          <m.p variants={fade} className={`text-xs font-bold uppercase tracking-[0.22em] ${muted}`}>
            hari.os
          </m.p>
          <m.h1 variants={fade} className="mt-4 text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: palette.heroGradient }}>
              Privacy
            </span>
          </m.h1>
          <m.p variants={fade} className={`mt-3 max-w-xl text-base leading-relaxed md:text-lg ${muted}`}>
            A short note on what this site records.
          </m.p>

          <div className="mt-8 space-y-4">
            {sections.map((section) => (
              <m.section key={section.title} variants={fade} className={`${glassPanel(isDark)} p-5 md:p-6`}>
                <h2 className="text-lg font-bold tracking-tight">{section.title}</h2>
                <div className={`mt-2 text-sm leading-relaxed md:text-base ${muted}`}>{section.body}</div>
              </m.section>
            ))}
          </div>
        </m.div>
      </main>
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default PrivacyPage;
