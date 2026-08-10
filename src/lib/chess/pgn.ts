import { AGENT_NAME, OS_NAME } from '../../data/osIdentity';
import { sanitizeFilename, sanitizePgnTag } from './sanitize';

export interface PgnGameInput {
  visitorName?: string;
  agentName?: string;
  /** Visitor plays white when true. */
  visitorIsWhite: boolean;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  timeControl: string;
  movesSan: string[];
  date?: Date;
  site?: string;
  event?: string;
}

export const buildPgn = (input: PgnGameInput): string => {
  const date = input.date ?? new Date();
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const visitor = sanitizePgnTag(input.visitorName ?? 'Visitor', 40);
  const agent = sanitizePgnTag(input.agentName ?? AGENT_NAME, 40);
  const white = input.visitorIsWhite ? visitor : agent;
  const black = input.visitorIsWhite ? agent : visitor;
  const result = ['1-0', '0-1', '1/2-1/2', '*'].includes(input.result) ? input.result : '*';
  const site = sanitizePgnTag(input.site ?? `${OS_NAME} Chess Arena`, 64);
  const event = sanitizePgnTag(input.event ?? `${OS_NAME} Timed Match`, 64);
  const tc = sanitizePgnTag(input.timeControl, 32);

  const headers = [
    `[Event "${event}"]`,
    `[Site "${site}"]`,
    `[Date "${yyyy}.${mm}.${dd}"]`,
    `[White "${white}"]`,
    `[Black "${black}"]`,
    `[Result "${result}"]`,
    `[TimeControl "${tc}"]`,
  ];

  const moveText: string[] = [];
  input.movesSan.forEach((san, i) => {
    const clean = sanitizePgnTag(san, 16);
    if (!clean) return;
    if (i % 2 === 0) moveText.push(`${Math.floor(i / 2) + 1}. ${clean}`);
    else moveText.push(clean);
  });

  return `${headers.join('\n')}\n\n${moveText.join(' ')} ${result}\n`;
};

export const pgnDownloadFilename = (date = new Date()): string => {
  const stamp = date.toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return sanitizeFilename(`hari-os-chess-${stamp}.pgn`);
};
