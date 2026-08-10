import { AGENT_NAME } from './osIdentity';

export type BanterEvent =
  | 'opening'
  | 'blunder'
  | 'goodMove'
  | 'check'
  | 'timeScramble'
  | 'winning'
  | 'losing'
  | 'drawish'
  | 'endgame'
  | 'yourMove'
  | 'iMoved'
  | 'gameOverWin'
  | 'gameOverLoss'
  | 'gameOverDraw'
  | 'forfeit'
  | 'idle';

/** Prefab Sentry lines when the LLM is out of credits or disabled. */
export const PREFAB_BANTER: Record<BanterEvent, string[]> = {
  opening: [
    `I'm ${AGENT_NAME}. Chess Arena is one of my HARI.OS processes — let's see what you've got.`,
    'Opening theory is optional. Nerve is not. Your move.',
  ],
  blunder: [
    'That one leaked. I file leaks.',
    'Hmm. My human would raise an eyebrow. I just take the free tempo.',
  ],
  goodMove: [
    'Clean. Reminds me why he captains boards.',
    'Respect — that was precise. I am adjusting.',
  ],
  check: [
    'Check. The process notices.',
    'King under fire. Stay calm — clocks still tick.',
  ],
  timeScramble: [
    'Seconds left. This is where humans panic and I do not.',
    'Flag danger. Move with intent.',
  ],
  winning: [
    'Eval leans my way. You can still spoil my night.',
    'I like this position. Do you?',
  ],
  losing: [
    'You are teaching this process something. Annoying. Impressive.',
    "Alright — you've got me on the ropes. Don't let go.",
  ],
  drawish: [
    'Symmetry. Beautiful, boring, or both?',
    'Dead even. Someone has to blink.',
  ],
  endgame: [
    'Endgame protocol online. Technique over vibes.',
    'Few pieces left. Every tempo is a headline.',
  ],
  yourMove: [
    'Your clock. Make it count.',
    'I am waiting — patiently, which is unfair.',
  ],
  iMoved: [
    'Played. Banter buffer still warm.',
    'Move locked. Chat stays optional; the clock does not.',
  ],
  gameOverWin: [
    'Process win logged. Rematch? I do not sleep.',
    'Sentry +1. Harieshwar is offline — I am not.',
  ],
  gameOverLoss: [
    'You beat the digital presence. The human might want a word on Lichess.',
    'Loss filed. I will adapt skill for next boot of this process.',
  ],
  gameOverDraw: [
    'Draw. Honourable. Annoying.',
    'Split point. Rematch when you are ready.',
  ],
  forfeit: [
    'Tab closed, process forfeited. I keep the W — house rules.',
    'Leaving mid-game awards me the point. Harsh. Fair.',
  ],
  idle: [
    'Still here. HARI.OS never clocks out.',
    'Whenever you are ready — timed games only.',
  ],
};

export const pickPrefab = (event: BanterEvent, salt = 0): string => {
  const lines = PREFAB_BANTER[event] ?? PREFAB_BANTER.idle;
  const idx = Math.abs(salt) % lines.length;
  return lines[idx]!;
};

/** Map live eval / game signals to a banter event. */
export const eventFromAnalysis = (opts: {
  ply: number;
  visitorCpl?: number;
  evalPawns?: number;
  visitorIsWhite: boolean;
  inCheck: boolean;
  visitorClockMs: number;
  pieceCount: number;
}): BanterEvent => {
  if (opts.ply < 6) return 'opening';
  if (opts.inCheck) return 'check';
  if (opts.visitorClockMs < 20_000) return 'timeScramble';
  if (opts.pieceCount <= 10) return 'endgame';
  if (opts.visitorCpl !== undefined && opts.visitorCpl > 150) return 'blunder';
  if (opts.visitorCpl !== undefined && opts.visitorCpl < 25) return 'goodMove';
  if (opts.evalPawns !== undefined) {
    const fromVisitor = opts.visitorIsWhite ? opts.evalPawns : -opts.evalPawns;
    if (fromVisitor <= -1.5) return 'losing';
    if (fromVisitor >= 1.5) return 'winning';
    if (Math.abs(fromVisitor) < 0.4) return 'drawish';
  }
  return 'idle';
};
