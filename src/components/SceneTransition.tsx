import React from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { RootState } from '../store/store';
import { getPalette } from '../data/osPersona';

/**
 * Video-cut feel for section jumps: while the navigation saga reports
 * isAnimating (palette/keys/nav-driven travel), a soft veil dims the
 * frame and a light band sweeps down the screen — like a scene
 * transition in an edit, matched to the Lenis scroll duration.
 */
const SceneTransition: React.FC = () => {
  const { isAnimating } = useSelector((state: RootState) => state.navigation);
  const palette = getPalette(useSelector((state: RootState) => state.theme.palette));

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="pointer-events-none fixed inset-0 z-[75] overflow-hidden"
          aria-hidden
        >
          {/* Soft dim + defocus, like a camera move */}
          <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" />

          {/* Light band sweeping through the frame */}
          <motion.div
            className="absolute inset-x-0 h-48 blur-2xl"
            style={{
              background: `linear-gradient(180deg, transparent, ${palette.primary}40, transparent)`,
            }}
            initial={{ top: '-30%' }}
            animate={{ top: '115%' }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SceneTransition;
