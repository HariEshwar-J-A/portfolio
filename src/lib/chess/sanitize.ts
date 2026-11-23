/** Security helpers for Chess Arena — sanitization & clamps. */

const isStrippedControl = (code: number) =>
  code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127;

/** Strip control chars and cap length for any user/LLM-facing string. */
export const sanitizeText = (input: unknown, maxLen = 280): string => {
  if (typeof input !== 'string') return '';
  let cleaned = '';
  for (const char of input) {
    if (!isStrippedControl(char.charCodeAt(0))) cleaned += char;
  }
  return cleaned.replace(/\s+/g, ' ').trim().slice(0, maxLen);
};

/** PGN tag values cannot contain unescaped quotes or newlines. */
export const sanitizePgnTag = (input: unknown, maxLen = 64): string => {
  return sanitizeText(input, maxLen).replace(/["\\]/g, '').replace(/\r?\n/g, ' ');
};

/** Safe download basename: alphanumeric, dot, underscore, hyphen. */
export const sanitizeFilename = (input: unknown, fallback = 'game.pgn'): string => {
  const cleaned = sanitizeText(input, 80)
    .replace(/\\/g, '/')
    .split('/')
    .pop()!
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^\.+/, '')
    .replace(/^\.+/, '')
    .slice(0, 80);
  if (!cleaned || cleaned === '.' || cleaned === '..') return fallback;
  return cleaned.endsWith('.pgn') ? cleaned : `${cleaned}.pgn`;
};

export const clampInt = (n: unknown, min: number, max: number, fallback: number): number => {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, Math.round(v)));
};
