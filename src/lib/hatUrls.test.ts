import { describe, expect, it } from 'vitest';
import { HAT_LIST, SITE_ORIGIN } from '../data/hats';
import { hatHtmlName, hatRedirectRules } from './hatUrls';

describe('hat URLs', () => {
  it('keeps canonical paths free of a trailing slash', () => {
    for (const hat of HAT_LIST) {
      expect(hat.path.startsWith('/')).toBe(true);
      expect(hat.path.endsWith('/')).toBe(false);
      expect(`${SITE_ORIGIN}${hat.path}`.endsWith('/')).toBe(false);
    }
  });

  it('rewrites the no-slash path to a sibling html file and 301s the slash form', () => {
    expect(hatHtmlName('/full-stack')).toBe('full-stack.html');
    expect(hatRedirectRules(HAT_LIST.map((hat) => hat.path))).toContain(
      '/full-stack/  /full-stack  301\n/full-stack  /full-stack.html  200',
    );
    expect(hatRedirectRules(HAT_LIST.map((hat) => hat.path))).toContain(
      '/ai-engineer/  /ai-engineer  301\n/ai-engineer  /ai-engineer.html  200',
    );
  });
});
