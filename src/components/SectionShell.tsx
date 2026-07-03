import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

/** Shared glass-panel styling so every card floats consistently above the ambient layer. */
export const glassPanel = (isDark: boolean) =>
  isDark
    ? 'glass-card rounded-2xl border border-white/10 bg-slate-900/40 shadow-xl shadow-black/20 backdrop-blur-xl'
    : 'glass-card rounded-2xl border border-white/70 bg-white/70 shadow-xl shadow-slate-300/40 backdrop-blur-xl';

interface SectionShellProps {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Base layout for every homepage section: transparent over the ambient
 * background, consistent vertical rhythm, and an animated header that
 * reveals once as the section scrolls into view.
 */
const SectionShell: React.FC<SectionShellProps> = ({
  id,
  eyebrow,
  title,
  subtitle,
  headerExtra,
  children,
}) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  return (
    <section id={id} className="relative min-h-screen py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-14 text-center"
        >
          <p
            className="text-xs font-black uppercase tracking-[0.3em]"
            style={{ color: theme.colors.primary }}
          >
            {eyebrow}
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">{title}</h2>
          <motion.span
            aria-hidden
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: '4rem', opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
            className="os-border-flow mx-auto mt-5 block h-1 rounded-full"
          />
          {subtitle && (
            <p className={`mx-auto mt-5 max-w-2xl text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {subtitle}
            </p>
          )}
          {headerExtra}
        </motion.div>
        {children}
      </div>
    </section>
  );
};

export default SectionShell;
