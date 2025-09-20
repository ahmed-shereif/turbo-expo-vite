import { describe, it, expect } from 'vitest';
import { isEligible } from '@repo/player-api';

describe('isEligible', () => {
  it('blocks when player rank below min', () => {
    expect(isEligible('LOW_D', 'MID_D')).toBe(false);
  });
});


