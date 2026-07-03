import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { getPalette, bootLines } from '../data/osPersona';

const BOOT_KEY = 'hari-os-booted';
const LINE_INTERVAL_MS = 260;
const HOLD_AFTER_MS = 650;

/**
 * First-visit OS boot overlay: types the HARI.OS boot log, fills a
 * progress bar, then dissolves into the site. Shown once per tab
 * session; any click or key skips it instantly. Skipped entirely
 * under prefers-reduced-motion.
 */
const BootSequence: React.FC = () => {
  const palette = getPalette(useSelector((state: RootState) => state.theme.palette));
  const [dismissed, setDismissed] = useState(() => {
    try {
      return (
        window.sessionStorage.getItem(BOOT_KEY) === 'true' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    } catch {
      return false;
    }
  });
  const [visibleLines, setVisibleLines] = useState(0);

  const done = visibleLines >= bootLines.length;
  const progress = Math.min(1, visibleLines / bootLines.length);

  const finish = useMemo(
    () => () => {
      try {
        window.sessionStorage.setItem(BOOT_KEY, 'true');
      } catch {
        // Session storage unavailable — boot may replay next load.
      }
      setDismissed(true);
    },
    []
  );

  useEffect(() => {
    if (dismissed) return;
    if (done) {
      const hold = window.setTimeout(finish, HOLD_AFTER_MS);
      return () => window.clearTimeout(hold);
    }
    const interval = window.setInterval(
      () => setVisibleLines((count) => count + 1),
      LINE_INTERVAL_MS
    );
    return () => window.clearInterval(interval);
  }, [dismissed, done, finish]);

  useEffect(() => {
    if (dismissed) return;
    const skip = () => finish();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [dismissed, finish]);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020617]"
          role="status"
          aria-label="Site loading"
        >
          <div className="w-full max-w-md px-6 font-mono text-sm">
            <div className="min-h-[13rem]">
              {bootLines.slice(0, visibleLines).map((line, index) => (
                <motion.p
                  key={line}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className={index === 0 ? 'font-bold' : ''}
                  style={{ color: index === 0 ? palette.primary : '#94a3b8' }}
                >
                  {line}
                  {index === visibleLines - 1 && !done && (
                    <span className="animate-pulse" style={{ color: palette.primary }}>
                      _
                    </span>
                  )}
                </motion.p>
              ))}
            </div>
            <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: palette.primary }}
                initial={false}
                animate={{ width: `${Math.round(progress * 100)}%` }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              />
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-slate-600">
              click or press any key to skip
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootSequence;
