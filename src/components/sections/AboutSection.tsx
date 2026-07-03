import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useScroll as useScrollMotion, useTransform } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { MarketingData, portfolioData } from '../../data/portfolioData';
import { navigateTo } from '../../store/slices/navigationSlice';
import { RootState } from '../../store/store';
import { getPalette } from '../../data/osPersona';
import TypewriterText from '../TypewriterText';
import { glassPanel } from '../SectionShell';
import { OPEN_COLLAB_EVENT } from '../CollabWizard';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Github as GitHub,
  Globe,
  Linkedin,
} from 'lucide-react';

const AboutSection: React.FC = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const palette = getPalette(useSelector((state: RootState) => state.theme.palette));
  const isDark = theme.mode === 'dark';
  const { name, title, photo, socialLinks } = portfolioData.personal;
  const { headline, tagline, heroOrbitLabels, proofPoints } = MarketingData;

  // Gentle parallax: copy drifts up, portrait drifts down as the visitor scrolls away.
  const { scrollY } = useScrollMotion();
  const copyY = useTransform(scrollY, [0, 700], [0, -50]);
  const portraitY = useTransform(scrollY, [0, 700], [0, 70]);

  const socials = [
    { url: socialLinks.github, label: 'GitHub', icon: <GitHub size={20} /> },
    { url: socialLinks.linkedin, label: 'LinkedIn', icon: <Linkedin size={20} /> },
    { url: socialLinks.website, label: 'Website', icon: <Globe size={20} /> },
  ].filter((social) => Boolean(social.url));

  return (
    <section id="about" className="relative flex min-h-screen items-center pb-20 pt-28">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            style={{ y: copyY }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_COLLAB_EVENT))}
              className={`group inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] transition hover:-translate-y-0.5 ${
                isDark
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:border-emerald-300/60'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:border-emerald-500/60'
              }`}
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Open to collaboration
              <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
            </button>

            <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: palette.heroGradient }}
              >
                {name}
              </span>
            </h1>

            <p
              className={`mt-4 text-sm font-bold uppercase tracking-[0.25em] ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {title} ·{' '}
              <span style={{ color: theme.colors.primary }}>
                <TypewriterText strings={heroOrbitLabels} />
              </span>
            </p>

            <h2 className="mt-8 max-w-xl text-2xl font-bold leading-snug md:text-3xl">{headline}</h2>
            <p className={`mt-4 max-w-xl text-lg leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {tagline}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => dispatch(navigateTo('projects'))}
                className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 font-bold text-white shadow-xl transition hover:-translate-y-0.5"
                style={{
                  backgroundColor: theme.colors.primary,
                  boxShadow: `0 12px 36px ${theme.colors.primary}55`,
                }}
              >
                Explore my work
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </button>
              <a
                href="https://sentry.harieshwar.dev"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 rounded-2xl border px-6 py-3.5 font-bold backdrop-blur transition hover:-translate-y-0.5 ${
                  isDark
                    ? 'border-white/15 bg-white/5 text-white hover:border-indigo-300/50'
                    : 'border-slate-300 bg-white/60 text-slate-800 hover:border-indigo-400/60'
                }`}
              >
                InfoSentry
                <ArrowUpRight size={18} />
              </a>
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border backdrop-blur transition hover:-translate-y-0.5 ${
                    isDark
                      ? 'border-white/15 bg-white/5 text-slate-300 hover:text-white'
                      : 'border-slate-300 bg-white/60 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div key={point.metric} className={`${glassPanel(isDark)} p-4`}>
                  <p
                    className="text-2xl font-black"
                    style={{ color: theme.colors.primary }}
                  >
                    {point.metric}
                  </p>
                  <p className={`mt-1 text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {point.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            style={{ y: portraitY }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
            className="relative mx-auto w-full max-w-sm lg:max-w-md"
          >
            <div className="animate-float-slow relative">
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[2.5rem] opacity-60 blur-2xl"
                style={{
                  background: isDark
                    ? 'conic-gradient(from 140deg, rgba(34,211,238,0.5), rgba(99,102,241,0.5), rgba(217,70,239,0.35), rgba(34,211,238,0.5))'
                    : 'conic-gradient(from 140deg, rgba(59,130,246,0.4), rgba(99,102,241,0.4), rgba(16,185,129,0.3), rgba(59,130,246,0.4))',
                }}
              />
              <div className={`${glassPanel(isDark)} relative overflow-hidden !rounded-[2rem] p-2`}>
                <img
                  src={photo}
                  alt={name}
                  className="h-auto w-full rounded-[1.6rem] object-cover"
                  style={{ maxHeight: '520px' }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={() => dispatch(navigateTo('skills'))}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className={`absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-[0.25em] md:flex ${
          isDark ? 'text-slate-500 hover:text-cyan-300' : 'text-slate-400 hover:text-blue-600'
        } transition-colors`}
        aria-label="Scroll to skills"
      >
        Scroll · or press S
        <ChevronDown size={18} className="animate-bounce" />
      </motion.button>
    </section>
  );
};

export default AboutSection;
