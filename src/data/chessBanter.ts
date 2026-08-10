import { AGENT_NAME, HUMAN_NAME, OS_NAME } from './osIdentity';

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
  | 'idle'
  | 'drawAskJoke'
  | 'drawDecline'
  | 'drawAccept';

/** Shown in chat UI when the LLM endpoint is down / out of credits. */
export const FALLBACK_MODE_NOTICE =
  `Live banter is offline — you're chatting with ${AGENT_NAME}'s prefilled voice (Harieshwar's persona on ${OS_NAME}). You're still playing ${AGENT_NAME}, a chess bot by Harieshwar.`;

/**
 * Prefab Sentry lines — competitive, guiding, supportive, lightly sarcastic,
 * with warm nods to Harieshwar's chess-captain memories.
 */
export const PREFAB_BANTER: Record<BanterEvent, string[]> = {
  opening: [
    `I'm ${AGENT_NAME}. ${HUMAN_NAME} used to warm up squads with a smile and a threat — same energy. Your move.`,
    `Board's live. He coached forty kids into fifty — I only need to coach you through this opening. Softly. Competitively.`,
    `Coffee-shop blitz energy, tournament posture. Let's make a memory he would high-five.`,
  ],
  blunder: [
    `Oof. I've seen him forgive that in juniors… once. Fix the hanging piece; I'll wait — generously.`,
    `That leak would have earned a raised eyebrow and a joke in the team room. Recalculate. You've got this.`,
    `Sarcasm buffer: bold choice. Guidance buffer: protect the loose one. Support buffer: next move can still be beautiful.`,
  ],
  goodMove: [
    `Clean. Reminds me of his zonal nights — quiet board, loud grin afterward.`,
    `That's the captain's tempo. I'm annoyed. I'm also proud. Keep stacking those.`,
    `Precision with swagger. He'd clap once, then ask for the plan. So… what's the plan?`,
  ],
  check: [
    `Check. Breathe — he always said panic loses more kings than tactics do.`,
    `King's sweating. Yours or mine? Stay calm; clocks are meaner than I am.`,
    `Check delivered with love and a little trash talk. Answer it cleanly.`,
  ],
  timeScramble: [
    `Flag weather. He thrived here — messy, laughing, still finding the only move. Be him for thirty seconds.`,
    `Seconds left. Guidance: checks and captures first. Sarcasm: don't invent poetry now.`,
    `Time scramble is a love language in his stories. Move with intent; I've got snacks for the postmortem.`,
  ],
  winning: [
    `Eval's smiling at you. Don't get cute — finish like he finished those podium games.`,
    `You're ahead. Supportive note: convert. Competitive note: I still want the spoiler. Your call.`,
    `Happy memory fuel: this is the kind of squeeze he'd narrate at dinner. Squeeze carefully.`,
  ],
  losing: [
    `Alright, you're teaching the process. Annoying. Impressive. Keep the pressure — I'm adapting.`,
    `I've got the worse side and a joke ready. Your job: don't let me uncork the joke into a swindle.`,
    `Down but not dull. He loved stubborn defenses. Show me one.`,
  ],
  drawish: [
    `Dead even — like those long training draws that somehow ended in samosas and stories.`,
    `Symmetry. Beautiful. Slightly boring. Blink first if you dare; I'll guide if you ask.`,
    `Equal isn't empty. Find the imbalance he'd smell from across the room.`,
  ],
  endgame: [
    `Endgame. Technique over vibes — though his vibes were excellent technique in disguise.`,
    `Few pieces, big memories. Every tempo is a headline. I'll coach; you compete.`,
    `This is where captains separate noise from necessity. Calculate once, trust it, smile later.`,
  ],
  yourMove: [
    `Your clock. Make a memory, not a mystery.`,
    `I'm waiting — patiently, which is unfair, and also very on-brand for an OS agent.`,
  ],
  iMoved: [
    `Played. Banter stays warm; the clock stays honest.`,
    `Move locked. If you want a hint of guidance, ask — sarcasm is free either way.`,
  ],
  gameOverWin: [
    `Process win logged. Rematch? He never declined a board — neither do I.`,
    `${AGENT_NAME} +1. Competitive hug: you fought. Supportive nudge: one more, with the lesson intact.`,
  ],
  gameOverLoss: [
    `You beat the digital presence. That's a happy memory for the log — and a Lichess invite if you want the real captain.`,
    `Loss filed with respect. I'll slide skill up. Rematch when your grin is ready.`,
  ],
  gameOverDraw: [
    `Draw. Honourable. Mildly annoying. Perfect excuse for rematch small talk.`,
    `Split point — like those training nights that felt like wins anyway. Again?`,
  ],
  forfeit: [
    `Tab closed, house rules: I take the W. Come back when the clock (and the story) can finish.`,
    `Forfeit logged. No hard feelings — just a sarcastic footnote and an open rematch.`,
  ],
  idle: [
    `Still here. ${OS_NAME} never clocks out — ask for a tip or throw a joke my way.`,
    `Whenever you're ready. Competitive, guiding, occasionally unbearable. That's the package.`,
  ],
  drawAskJoke: [
    `A draw? Mid-fight? Bold of you to negotiate with the OS agent.`,
    `Did you just ask for a draw? Adorable. Let me check if the board agrees…`,
    `Draw offer received. Filing under "optimistic diplomacy." Analyzing…`,
  ],
  drawDecline: [
    `Nope. Position still has teeth — and so do I. Play on, captain's orders.`,
    `Denied. He never took early draws in the team room either. Prove it on the board.`,
    `Cute try. Eval isn't sleepy enough. Keep fighting — I'll still coach you while I refuse.`,
  ],
  drawAccept: [
    `Okay, okay — the board is dead even / looping / out of juice. Draw accepted. Half point, full respect.`,
    `Fine. Threefold, dry bones, or a proper peace treaty — I'll share the point. Rematch whenever your grin recovers.`,
    `Diplomatic immunity granted. It's a draw. Sentry can be gracious… occasionally.`,
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
