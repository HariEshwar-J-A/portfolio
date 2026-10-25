import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { MarketingData, OfferingsData, portfolioData } from '../../data/portfolioData';
import { navigateTo } from '../../store/slices/navigationSlice';
import { RootState } from '../../store/store';
import { getPalette } from '../../data/osPersona';
import { glassPanel } from '../SectionShell';
import { OPEN_COLLAB_EVENT } from '../CollabWizard';
import { useHat } from '../../context/hat-context';
import type { HatConfig } from '../../data/hats';
import HatDisclosure from '../HatDisclosure';
import {
  ArrowRight,
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
            {hat.detail ? (
              <motion.p
                variants={fade}
                className={`mt-2 max-w-xl text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              >
                {hat.detail}
              </motion.p>
            ) : null}
            {hat.rating ? (
              <motion.p variants={fade} className="mt-2 text-sm font-semibold">
                {hat.rating}
              </motion.p>
            ) : null}

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
              {hat.links?.map((link) => {
                const external = link.href.startsWith('http');
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className={`text-sm font-semibold underline-offset-4 hover:underline ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                  >
                    {link.label}
                  </a>
                );
              })}
              {hat.primaryCta.section !== 'products' && (
                <button
                  type="button"
                  onClick={() => dispatch(navigateTo('products'))}
                  className={`text-sm font-semibold underline-offset-4 hover:underline ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                >
                  InfoSentry
                </button>
              )}
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
  const reduce = useReducedMotion();
  const [showRest, setShowRest] = useState(false);
  const palette = getPalette(useSelector((state: RootState) => state.theme.palette));
  const isMinimal = useSelector((state: RootState) => state.view.mode) === 'minimal';
  const isDark = theme.mode === 'dark';
  const { name, photo, socialLinks } = portfolioData.personal;
  const hat = useHat();
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

  if (hat) return <HatHero hat={hat} />;

  return (
    <section id="about" className="relative flex min-h-[100svh] items-center pb-16 pt-28">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <motion.div
            variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.08 } } }}
            initial="hidden"
            animate="show"
          >
            <motion.h1 variants={fade} className="text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: palette.heroGradient }}>
                {name}
              </span>
            </motion.h1>

            <motion.h2 variants={fade} className="mt-6 max-w-xl text-2xl font-bold leading-snug md:text-3xl">
              {MarketingData.headline}
            </motion.h2>
            <motion.p
              variants={fade}
              className={`mt-3 max-w-xl text-base leading-relaxed md:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
            >
              {MarketingData.heroSupport}
            </motion.p>

            <motion.div variants={fade} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <motion.button
                type="button"
                onClick={() => dispatch(navigateTo('projects'))}
                whileHover={reduce ? undefined : { y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 font-bold text-white shadow-xl"
                style={{
                  backgroundColor: theme.colors.primary,
                  boxShadow: `0 12px 36px ${theme.colors.primary}55`,
                }}
              >
                Explore my work
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </motion.button>
              <a
                href={OfferingsData.flagship.marketingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm font-semibold underline-offset-4 hover:underline ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
              >
                InfoSentry
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

            <motion.div variants={fade} className="mt-10 max-w-lg">
              <div className={`grid grid-cols-3 gap-3 ${isMinimal ? 'hidden' : ''}`}>
                {MarketingData.proofPoints.map((point) => (
                  <div key={point.metric} className={`${glassPanel(isDark)} px-3 py-4 text-center`}>
                    <p className="text-3xl font-black tracking-tight md:text-4xl" style={{ color: theme.colors.primary }}>
                      {point.metric}
                    </p>
                    <p className={`mt-1 text-xs font-medium leading-snug ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {point.shortLabel}
                    </p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowRest((open) => !open)}
                className="mt-4 text-sm font-semibold"
                style={{ color: theme.colors.primary }}
              >
                {showRest ? 'Show less' : 'Show all'}
              </button>
              <HatDisclosure open={showRest}>
                <div className={`max-w-xl pt-3 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <p>{MarketingData.tagline}</p>
                  <ul className="mt-4 space-y-1">
                    {MarketingData.proofPoints.map((point) => (
                      <li key={point.metric}>
                        <span className="font-bold" style={{ color: theme.colors.primary }}>
                          {point.metric}
                        </span>{' '}
                        {point.label}
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {MarketingData.heroOrbitLabels.map((label) => (
                      <li
                        key={label}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          isDark ? 'border-white/15 text-slate-300' : 'border-slate-300 text-slate-600'
                        }`}
                      >
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              </HatDisclosure>
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

export default AboutSection;
