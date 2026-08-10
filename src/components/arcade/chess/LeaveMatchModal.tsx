import React from 'react';

interface LeaveMatchModalProps {
  open: boolean;
  isDark: boolean;
  onStay: () => void;
  onLeave: () => void;
}

/** Confirm before abandoning an active timed chess match. */
const LeaveMatchModal: React.FC<LeaveMatchModalProps> = ({ open, isDark, onStay, onLeave }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-match-title"
    >
      <div
        className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl ${
          isDark ? 'border-white/15 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <h2 id="leave-match-title" className="text-lg font-black">
          Leave the match?
        </h2>
        <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          An active timed game is in progress. Leaving forfeits the game to Sentry.
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onStay}
            className={`rounded-xl border px-4 py-2 text-sm font-bold ${
              isDark ? 'border-white/20' : 'border-slate-300'
            }`}
          >
            Stay and play
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="rounded-xl px-4 py-2 text-sm font-bold text-white"
            style={{ backgroundColor: '#dc2626' }}
          >
            Leave &amp; forfeit
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveMatchModal;
