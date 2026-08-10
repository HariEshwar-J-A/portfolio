import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Maximize2, Minimize2 } from 'lucide-react';
import { RootState } from '../store/store';
import { toggleViewMode } from '../store/slices/viewSlice';
import { useTheme } from '../hooks/useTheme';

/** Header switch between the minimalist quick-peek and the full record. */
const ViewModeToggle: React.FC<{ withLabel?: boolean }> = ({ withLabel = false }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const mode = useSelector((state: RootState) => state.view.mode);
  const isMinimal = mode === 'minimal';
  const isDark = theme.mode === 'dark';

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleViewMode())}
      aria-label={isMinimal ? 'Switch to comprehensive view' : 'Switch to minimalist view'}
      title={isMinimal ? 'Minimal view on — click for full detail' : 'Full view on — click for a quick peek'}
      className={`inline-flex items-center gap-1.5 rounded-full p-2 text-xs font-semibold transition ${
        withLabel
          ? `border px-3 ${
              isDark ? 'border-slate-700 bg-slate-800/80 text-slate-300' : 'border-slate-300 bg-white/80 text-slate-600'
            }`
          : ''
      }`}
    >
      {isMinimal ? (
        <Minimize2 size={withLabel ? 15 : 19} style={{ color: 'var(--os-primary)' }} />
      ) : (
        <Maximize2 size={withLabel ? 15 : 19} className={isDark ? 'text-slate-300' : 'text-slate-600'} />
      )}
      {withLabel && (isMinimal ? 'Minimal view' : 'Full view')}
    </button>
  );
};

export default ViewModeToggle;
