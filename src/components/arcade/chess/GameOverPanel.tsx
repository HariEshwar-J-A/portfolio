import React from 'react';
import { Download, Mail, ExternalLink } from 'lucide-react';
import { AGENT_NAME, HUMAN_NAME, LICHESS_URL, OS_NAME } from '../../../data/osIdentity';
import { OPEN_COLLAB_EVENT } from '../../CollabWizard';

interface PlayRealHariCtaProps {
  isDark: boolean;
}

export const PlayRealHariCta: React.FC<PlayRealHariCtaProps> = ({ isDark }) => (
  <div
    className="rounded-xl border p-4"
    style={{ borderColor: 'color-mix(in srgb, var(--os-accent) 40%, transparent)' }}
  >
    <p className="font-mono text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: 'var(--os-accent)' }}>
      Want the real captain?
    </p>
    <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
      You just played <strong>{AGENT_NAME}</strong> on <strong>{OS_NAME}</strong> — not {HUMAN_NAME}.
      For a human board, email him or challenge <strong>HariEshwar</strong> on Lichess.
    </p>
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(OPEN_COLLAB_EVENT))}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-white"
        style={{ backgroundColor: 'var(--os-primary)' }}
      >
        <Mail size={14} /> Email {HUMAN_NAME}
      </button>
      <a
        href={LICHESS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${
          isDark ? 'border-white/20' : 'border-slate-300'
        }`}
      >
        <ExternalLink size={14} /> Lichess · HariEshwar
      </a>
    </div>
  </div>
);

interface GameOverPanelProps {
  result: '1-0' | '0-1' | '1/2-1/2' | null;
  endReason: string | null;
  visitorElo: number;
  sentryElo: number;
  canExport: boolean;
  onExport: () => void;
  onRematch: () => void;
  onLobby: () => void;
  isDark: boolean;
}

export const GameOverPanel: React.FC<GameOverPanelProps> = ({
  result,
  endReason,
  visitorElo,
  sentryElo,
  canExport,
  onExport,
  onRematch,
  onLobby,
  isDark,
}) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-xl font-black">Game over</h3>
      <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        Result {result ?? '*'} {endReason ? `· ${endReason}` : ''}
      </p>
      <p className="mt-2 font-mono text-xs opacity-70">
        Your rating ~{visitorElo} · {AGENT_NAME} ~{sentryElo} this game
      </p>
    </div>
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onRematch}
        className="rounded-lg px-4 py-2 text-sm font-bold text-white"
        style={{ backgroundColor: 'var(--os-primary)' }}
      >
        Rematch
      </button>
      <button
        type="button"
        onClick={onLobby}
        className={`rounded-lg border px-4 py-2 text-sm font-bold ${isDark ? 'border-white/20' : 'border-slate-300'}`}
      >
        Lobby
      </button>
      {canExport && (
        <button
          type="button"
          onClick={onExport}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold ${
            isDark ? 'border-white/20' : 'border-slate-300'
          }`}
        >
          <Download size={14} /> Export PGN
        </button>
      )}
    </div>
    <PlayRealHariCta isDark={isDark} />
  </div>
);
