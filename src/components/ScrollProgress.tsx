import React, { useEffect, useState } from 'react';

/** Slim top-edge reading-progress bar, colored by the active theme persona. */
const ScrollProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxScroll <= 0 ? 0 : Math.min(1, window.scrollY / maxScroll));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[60] h-[3px] w-full">
      <div
        className="h-full origin-left transition-transform duration-150 ease-out"
        style={{
          transform: `scaleX(${progress})`,
          background: 'linear-gradient(90deg, var(--os-primary), var(--os-secondary))',
        }}
      />
    </div>
  );
};

export default ScrollProgress;
