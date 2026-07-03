import React from 'react';
import { Construction, Crown, Swords } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { glassPanel } from '../SectionShell';
import { OPEN_COLLAB_EVENT } from '../CollabWizard';

const BACK_RANK = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'];
const WHITE_BACK_RANK = ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'];

const pieceAt = (row: number, col: number): string => {
  if (row === 0) return BACK_RANK[col];
  if (row === 1) return '♟';
  if (row === 6) return '♙';
  if (row === 7) return WHITE_BACK_RANK[col];
  return '';
};

/**
 * Chess Arena — under construction. A live board is coming; until then
 * the arena shows the starting position behind a scanning "build in
 * progress" overlay and routes challengers to the collaboration wizard.
 */
const ChessArena: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  return (
    <div className={`${glassPanel(isDark)} relative overflow-hidden p-6 md:p-8`}>
      <p className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.25em]" style={{ color: 'var(--os-primary)' }}>
        <Swords size={15} />
        Chess arena
      </p>

      <div className="mt-6 grid items-center gap-8 lg:grid-cols-[minmax(0,20rem)_1fr]">
        {/* Board — starting position, persona-tinted squares */}
        <div className="relative mx-auto w-full max-w-[20rem]">
          <div
            className="grid aspect-square grid-cols-8 overflow-hidden rounded-xl border"
            style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 40%, transparent)' }}
            aria-hidden
          >
            {Array.from({ length: 64 }, (_, i) => {
              const row = Math.floor(i / 8);
              const col = i % 8;
              const isDarkSquare = (row + col) % 2 === 1;
              return (
                <div
                  key={i}
                  className="flex items-center justify-center text-lg md:text-xl"
                  style={{
                    backgroundColor: isDarkSquare
                      ? 'color-mix(in srgb, var(--os-primary) 28%, transparent)'
                      : isDark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(255,255,255,0.85)',
                    color: row < 2 ? 'var(--os-secondary)' : isDark ? '#e2e8f0' : '#0f172a',
                  }}
                >
                  {pieceAt(row, col)}
                </div>
              );
            })}
          </div>
          {/* Build-in-progress scan */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
            <div className="os-scanline" />
          </div>
          <div
            className="absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur"
            style={{
              borderColor: 'var(--os-accent)',
              color: 'var(--os-accent)',
              backgroundColor: isDark ? 'rgba(2,6,23,0.85)' : 'rgba(255,255,255,0.9)',
            }}
          >
            <Construction size={12} />
            Under construction
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-2xl font-black">
            <Crown size={22} style={{ color: 'var(--os-primary)' }} />
            Play me. Soon.
          </h3>
          <p className={`mt-3 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Chess isn't a hobby here — it's a lifestyle. College team captain, three consecutive
            years of zonal podium finishes, and a 4-player squad coached into a 50-player program.
            A live arena where you can challenge Hari directly is being built into HARI.OS.
          </p>
          <ul className={`mt-4 space-y-1.5 font-mono text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <li>▸ live board vs. Hari — in development</li>
            <li>▸ async correspondence mode — queued</li>
            <li>▸ puzzle-of-the-day from his games — queued</li>
          </ul>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_COLLAB_EVENT))}
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--os-primary)' }}
          >
            <Swords size={16} />
            Throw down the gauntlet anyway
          </button>
          <p className={`mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Opens the collaboration channel — mention chess and he will find a board.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChessArena;
