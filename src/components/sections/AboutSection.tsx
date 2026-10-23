import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useReducedMotion, useScroll as useScrollMotion, useTransform } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { MarketingData, portfolioData } from '../../data/portfolioData';
import { navigateTo } from '../../store/slices/navigationSlice';
import { RootState } from '../../store/store';
import { getPalette } from '../../data/osPersona';
import TypewriterText from '../TypewriterText';
import { glassPanel } from '../SectionShell';
import { OPEN_COLLAB_EVENT } from '../CollabWizard';
import { useHat } from '../../context/hat-context';
import type { HatConfig } from '../../data/hats';
import { OfferingsData } from '../../data/portfolioData';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Github as GitHub,
  Globe,
  Linkedin,
} from 'lucide-react';

const HatHero: React.FC<{ hat: HatConfig }> = ({ hat }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const palette = getPalette(useSelector((state: RootState) => state.theme.palette));
  const isDark = theme.mode === 'dark';
  const { name, photo, socialLinks } = portfolioData.personal;
  const infoSentry = OfferingsData.flagship.sourceUrl;
  const rise = reduce ? 0 : 10;
  const fade = {
    hidden: { opacity: 0, y: rise },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.32, ease: 'easeOut' as const } },
  };

  const socials = [
    { url: socialLinks.github, label: 'GitHub', icon: <GitHub size={18} /> },
    { url: socialLinks.linkedin, label: 'LinkedIn', icon: <Linkedin size={18} /> },
    { url: socialLinks.website, label: 'Website', icon: <Globe size={18} /> },
  ].filter((social) => Boolean(social.url));

  return (
    <section id="about" className="relative flex min-h-[100svh] items-center pb-16 pt-28">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <motion.div
            variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.08 } } }}
            initial="hidden"
            animate="show"
          >
            <motion.p
              variants={fade}
              className={`text-xs font-bold uppercase tracking-[0.22em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
            >
              {hat.roleLine}
            </motion.p>

            <motion.h1 variants={fade} className="mt-4 text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: palette.heroGradient }}>
                {name}
              </span>
            </motion.h1>

            <motion.h2 variants={fade} className="mt-6 max-w-xl text-2xl font-bold leading-snug md:text-3xl">
              {hat.headline}
            </motion.h2>
            <motion.p
              variants={fade}
              className={`mt-3 max-w-xl text-base leading-relaxed md:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
            >
              {hat.summary}
            </motion.p>

            <motion.div variants={fade} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <motion.button
                type="button"
                onClick={() => dispatch(navigateTo(hat.primaryCta.section))}
                whileHover={reduce ? undefined : { y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 font-bold text-white shadow-xl"
                style={{
                  backgroundColor: theme.colors.primary,
                  boxShadow: `0 12px 36px ${theme.colors.primary}55`,
                }}
              >
                {hat.primaryCta.label}
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </motion.button>
              <button
                type="button"
                onClick={() => dispatch(navigateTo('products'))}
                className={`text-sm font-semibold underline-offset-4 hover:underline ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
              >
                InfoSentry
              </button>
              <a
                href={infoSentry}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm font-semibold underline-offset-4 hover:underline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                GitHub
              </a>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event(OPEN_COLLAB_EVENT))}
                className={`text-sm font-semibold underline-offset-4 hover:underline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                Collaboration
              </button>
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {social.icon}
                </a>
              ))}
            </motion.div>

            <motion.div variants={fade} className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {hat.proofPoints.map((point) => (
                <div key={point.metric} className={`${glassPanel(isDark)} px-3 py-4 text-center`}>
                  <p className="text-3xl font-black tracking-tight md:text-4xl" style={{ color: theme.colors.primary }}>
                    {point.metric}
                  </p>
                  <p className={`mt-1 text-xs font-medium leading-snug ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {point.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: rise }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.4, ease: 'easeOut', delay: reduce ? 0 : 0.12 }}
            className="relative mx-auto w-full max-w-xs lg:max-w-md"
          >
            <div className={`${glassPanel(isDark)} relative overflow-hidden !rounded-[2rem] p-2`}>
              <img
                src={photo}
                alt={name}
                className="h-auto max-h-64 w-full rounded-[1.6rem] object-cover md:max-h-[460px]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const AboutSection: React.FC = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const palette = getPalette(useSelector((state: RootState) => state.theme.palette));
  const isMinimal = useSelector((state: RootState) => state.view.mode) === 'minimal';
  const isDark = theme.mode === 'dark';
  const { name, photo, socialLinks } = portfolioData.personal;
  const hat = useHat();
  const title = hat?.roleTitle ?? portfolioData.personal.title;
  const headline = hat?.headline ?? MarketingData.headline;
  const tagline = hat?.summary ?? MarketingData.tagline;
  const proofPoints = hat?.proofPoints ?? MarketingData.proofPoints;
  const { heroOrbitLabels } = MarketingData;

  // Gentle parallax: copy drifts up, portrait drifts down as the visitor scrolls away.
  const { scrollY } = useScrollMotion();
  const copyY = useTransform(scrollY, [0, 700], [0, -50]);
  const portraitY = useTransform(scrollY, [0, 700], [0, 70]);

  const socials = [
    { url: socialLinks.github, label: 'GitHub', icon: <GitHub size={20} /> },
    { url: socialLinks.linkedin, label: 'LinkedIn', icon: <Linkedin size={20} /> },
    { url: socialLinks.website, label: 'Website', icon: <Globe size={20} /> },
  ].filter((social) => Boolean(social.url));

  if (hat) return <HatHero hat={hat} />;

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

            <div className={`mt-10 grid max-w-xl gap-3 sm:grid-cols-3 ${isMinimal ? 'hidden' : ''}`}>
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
                className="absolute -inset-4 rounded-[2.5rem] opacity-60 blur-2xl transition-all duration-700"
                style={{
                  background: `conic-gradient(from 140deg, ${palette.primary}80, ${palette.secondary}80, ${palette.accent}59, ${palette.primary}80)`,
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
        className={`hover-primary absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-[0.25em] transition-colors md:flex ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}
        aria-label="Scroll to skills"
      >
        Scroll · or press S
        <ChevronDown size={18} className="animate-bounce" />
      </motion.button>
    </section>
  );
};

export default AboutSection;
