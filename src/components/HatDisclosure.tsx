import React from 'react';
import { AnimatePresence, useReducedMotion, m } from 'framer-motion';

/** Height + fade for hat-page "Show all" panels. Reduced motion snaps open. */
const HatDisclosure: React.FC<{ open: boolean; instant?: boolean; children: React.ReactNode }> = ({
  open,
  instant = false,
  children,
}) => {
  const reduce = useReducedMotion();
  if (instant) return open ? <>{children}</> : null;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <m.div
          key="disclosure"
          initial={reduce ? false : { height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.28, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default HatDisclosure;
