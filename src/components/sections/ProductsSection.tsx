import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  GitBranch,
  Github,
  MessageSquare,
  Rss,
  Sparkles,
  Video,
} from 'lucide-react';
import { OfferingsData } from '../../data/portfolioData';
import SectionShell from '../SectionShell';

const MODULE_ICONS: Record<string, React.ReactNode> = {
  iFeeds: <Rss size={18} />,
  iChat: <MessageSquare size={18} />,
  iGitHub: <GitBranch size={18} />,
  iVideos: <Video size={18} />,
  iSurprise: <Sparkles size={18} />,
};

const ProductsSection: React.FC = () => {
  const flagship = OfferingsData.flagship;

  return (
    <SectionShell
      id="products"
      eyebrow="Offerings"
      title="Products I design, build, and run end to end"
      subtitle="Not just portfolio pieces — live, self-hosted products with real users, real pipelines, and real uptime to defend."
    >
        {/* Flagship: InfoSentry — always dark, on-brand with its indigo marketing site */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-indigo-500/30 bg-[#0a0a14] p-8 text-white shadow-2xl shadow-indigo-950/40 md:p-12"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 0%, rgba(99,102,241,0.18), transparent 45%), radial-gradient(circle, #1e1e2e 1px, transparent 1px)',
              backgroundSize: '100% 100%, 28px 28px',
            }}
          />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* InfoSentry "i" mark */}
                <span className="flex flex-col items-center gap-0.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                  <span className="h-3 w-1 rounded-sm bg-indigo-200" />
                </span>
                <span className="text-2xl font-black tracking-tight">
                  Info<span className="text-indigo-400">Sentry</span>
                </span>
                <span className="rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                  Flagship
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {flagship.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-indigo-300"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <h3 className="mt-8 bg-gradient-to-r from-indigo-100 via-indigo-300 to-indigo-500 bg-clip-text text-4xl font-black leading-tight text-transparent md:text-5xl">
              {flagship.tagline}
            </h3>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">
              {flagship.description}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {flagship.modules.map((module) => (
                <div
                  key={module.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-indigo-400/50 hover:bg-indigo-500/10"
                >
                  <span className="text-indigo-400">{MODULE_ICONS[module.key]}</span>
                  <p className="mt-2 font-bold text-white">{module.key}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{module.blurb}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-6">
              {flagship.stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-mono text-xl font-bold text-indigo-400">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
              <div className="ml-auto flex flex-wrap gap-3">
                <a
                  href={flagship.marketingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-400"
                >
                  Explore {flagship.name}
                  <ArrowUpRight size={16} />
                </a>
                <a
                  href={flagship.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-white/35"
                >
                  <Github size={16} />
                  Source
                </a>
              </div>
            </div>
          </div>
        </motion.div>
    </SectionShell>
  );
};

export default ProductsSection;
