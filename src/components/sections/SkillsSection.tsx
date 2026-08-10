import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, useInView } from 'framer-motion';
import { Boxes, Briefcase, Package, Server } from 'lucide-react';
import { RootState } from '../../store/store';
import { useTheme } from '../../hooks/useTheme';
import { portfolioData } from '../../data/portfolioData';
import SectionShell, { glassPanel } from '../SectionShell';

/** Real, defensible numbers pulled from the career record — not vanity percentages. */
const KPI_WIDGETS = [
  { value: 6, suffix: '+', label: 'Years shipping software', icon: <Briefcase size={18} /> },
  { value: 5, suffix: '', label: 'Companies across 2 countries', icon: <Boxes size={18} /> },
  { value: 10, suffix: '+', label: 'Projects delivered end to end', icon: <Package size={18} /> },
  { value: 1, suffix: '', label: 'Live product run solo (InfoSentry)', icon: <Server size={18} /> },
];

/** Years actively building in each domain, derived from the roles below. */
const DOMAIN_DEPTH = [
  { domain: 'Frontend (React · TypeScript)', years: 6 },
  { domain: 'Backend & APIs (Node · Python)', years: 5 },
  { domain: 'Data visualization (D3 · Plotly)', years: 5 },
  { domain: 'Cloud & DevOps (AWS · CI/CD)', years: 4 },
  { domain: 'IoT & industrial systems', years: 4 },
  { domain: 'AI & GenAI integrations', years: 3 },
];

const MAX_YEARS = Math.max(...DOMAIN_DEPTH.map((d) => d.years));

/** Eased count-up that starts when the widget scrolls into view. */
const CountUp: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 900;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(value * (1 - (1 - t) ** 3)));
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
};

const SkillsSection: React.FC = () => {
  const { theme } = useTheme();
  const { skills } = portfolioData;
  const isDark = theme.mode === 'dark';
  const isMinimal = useSelector((state: RootState) => state.view.mode) === 'minimal';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <SectionShell
      id="skills"
      eyebrow="Capabilities"
      title="Skills & Expertise"
      subtitle="Measured in years shipped and systems running — not self-scored percentages."
    >
      {/* KPI widgets */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI_WIDGETS.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className={`${glassPanel(isDark)} p-5`}
          >
            <span style={{ color: 'var(--os-primary)' }}>{kpi.icon}</span>
            <p className="mt-2 text-3xl font-black md:text-4xl" style={{ color: 'var(--os-primary)' }}>
              <CountUp value={kpi.value} suffix={kpi.suffix} />
            </p>
            <p className={`mt-1 text-xs leading-snug ${mutedText}`}>{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Minimal view stops at the KPIs — a quick, honest headline */}
      {isMinimal ? (
        <div className="flex flex-wrap justify-center gap-2">
          {skills
            .flatMap((category) => category.skills.map((skill) => skill.name))
            .map((name) => (
              <span
                key={name}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/70'
                }`}
              >
                {name}
              </span>
            ))}
        </div>
      ) : (
        <>
      {/* Domain depth widget */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5 }}
        className={`${glassPanel(isDark)} mb-16 p-6 md:p-8`}
      >
        <p className="font-mono text-xs font-black uppercase tracking-[0.25em]" style={{ color: 'var(--os-primary)' }}>
          Domain depth · years actively building
        </p>
        <div className="mt-5 space-y-4">
          {DOMAIN_DEPTH.map((entry, index) => (
            <div key={entry.domain}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold">{entry.domain}</p>
                <p className="font-mono text-xs font-bold" style={{ color: 'var(--os-primary)' }}>
                  {entry.years} yrs
                </p>
              </div>
              <div className={`mt-1.5 h-2 overflow-hidden rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, var(--os-primary), var(--os-secondary))',
                  }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(entry.years / MAX_YEARS) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: index * 0.08, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stack breakdown by category */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {skills.map((category, index) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`p-6 ${glassPanel(isDark)}`}
          >
            <h3 className="text-xl font-semibold mb-4">{category.category}</h3>
            <div className="space-y-4">
              {category.skills.map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>{skill.name}</span>
                    <span className="text-sm opacity-80">{skill.level}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, var(--os-primary), var(--os-secondary))',
                      }}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
        </>
      )}
    </SectionShell>
  );
};

export default SkillsSection;
