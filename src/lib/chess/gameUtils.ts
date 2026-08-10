import { Chess, type Square } from 'chess.js';
import { AGENT_NAME, OS_NAME } from '../../data/osIdentity';
import { sanitizeText } from './sanitize';

export type BanterMode = 'llm' | 'fallback';

export interface BanterRequestBody {
  event?: string;
  lastMove?: string;
  fen?: string;
  evalPawns?: number;
  visitorClockMs?: number;
  sentryClockMs?: number;
  ply?: number;
  userMessage?: string;
}

export const MAX_BANTER_BODY_BYTES = 4_000;
export const MAX_BANTER_TOKENS = 80;

/** Validate / normalize client banter payload (shared client + server). */
export const normalizeBanterRequest = (raw: unknown): BanterRequestBody | null => {
  if (typeof raw !== 'object' || raw === null) return null;
  const o = raw as Record<string, unknown>;
  return {
    event: sanitizeText(o.event, 40) || undefined,
    lastMove: sanitizeText(o.lastMove, 16) || undefined,
    fen: sanitizeText(o.fen, 100) || undefined,
    evalPawns:
      typeof o.evalPawns === 'number' && Number.isFinite(o.evalPawns)
        ? Math.max(-40, Math.min(40, o.evalPawns))
        : undefined,
    visitorClockMs:
      typeof o.visitorClockMs === 'number' && Number.isFinite(o.visitorClockMs)
        ? Math.max(0, Math.min(3_600_000, Math.round(o.visitorClockMs)))
        : undefined,
    sentryClockMs:
      typeof o.sentryClockMs === 'number' && Number.isFinite(o.sentryClockMs)
        ? Math.max(0, Math.min(3_600_000, Math.round(o.sentryClockMs)))
        : undefined,
    ply:
      typeof o.ply === 'number' && Number.isFinite(o.ply)
        ? Math.max(0, Math.min(500, Math.round(o.ply)))
        : undefined,
    userMessage: sanitizeText(o.userMessage, 200) || undefined,
  };
};

export const buildSentrySystemPrompt = (): string =>
  `You are ${AGENT_NAME}, the AI agent that runs ${OS_NAME} for Harieshwar. ` +
  `Chess Arena is one OS process you manage — you are NOT Harieshwar the human. ` +
  `Voice: competitive, guiding, and supportive, with light sarcastic jokes and warm nods to happy chess memories ` +
  `(college captain, coaching kids, zonal podiums, late-night blitz stories). ` +
  `Speak in first person as ${AGENT_NAME}. Keep them playing. 1-2 short sentences max. ` +
  `No markdown, no HTML, no URLs except if they ask for the real human ` +
  `(then mention email contact or Lichess HariEshwar). Never claim to be the human.`;

/** Rough CPL from sequential evals in pawns (visitor side). */
export const estimateMoveCpl = (evalBefore: number, evalAfter: number, visitorJustMoved: boolean): number => {
  // eval from white's perspective in pawns
  const delta = evalAfter - evalBefore;
  const lossForMover = visitorJustMoved ? -delta : delta;
  return Math.max(0, Math.round(lossForMover * 100));
};

export const pieceUnicode = (type: string, color: 'w' | 'b'): string => {
  const map: Record<string, [string, string]> = {
    k: ['♔', '♚'],
    q: ['♕', '♛'],
    r: ['♖', '♜'],
    b: ['♗', '♝'],
    n: ['♘', '♞'],
    p: ['♙', '♟'],
  };
  const pair = map[type];
  if (!pair) return '';
  return color === 'w' ? pair[0] : pair[1];
};

export const squareName = (file: number, rank: number): Square =>
  (`${'abcdefgh'[file]}${rank + 1}` as Square);

export const createGame = (): Chess => new Chess();

export { Chess };
export type { Square };
