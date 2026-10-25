import { describe, expect, it } from 'vitest';
import { MarketingData, portfolioData } from './portfolioData';

describe('home hero', () => {
  it('uses a support line already in the bio, and two-word proof labels', () => {
    const support = MarketingData.heroSupport.trim();
    expect(support.split(/\s+/).length).toBeLessThanOrEqual(20);
    expect(portfolioData.personal.bio).toContain(support);

    expect(MarketingData.proofPoints).toHaveLength(3);
    for (const point of MarketingData.proofPoints) {
      const words = point.shortLabel.trim().split(/\s+/);
      expect(words).toHaveLength(2);
      const label = point.label.toLowerCase();
      for (const word of words) {
        expect(label).toContain(word.toLowerCase());
      }
    }
  });
});
