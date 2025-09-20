import { describe, it, expect } from 'vitest';
import { isEligible, rankOrder, type Rank } from '../src';

describe('rankOrder', () => {
  it('orders correctly', () => {
    expect(rankOrder.UNKNOWN).toBe(0);
    expect(rankOrder.LOW_D).toBe(1);
    expect(rankOrder.MID_D).toBe(2);
    expect(rankOrder.HIGH_D).toBe(3);
  });
});

describe('isEligible', () => {
  const cases: Array<{ player?: Rank; min?: Rank; ok: boolean }> = [
    { player: 'HIGH_D', min: 'MID_D', ok: true },
    { player: 'LOW_D', min: 'MID_D', ok: false },
    { player: 'UNKNOWN', min: 'LOW_D', ok: false },
    { player: 'MID_D', min: 'MID_D', ok: true },
    { player: 'HIGH_D', min: undefined, ok: true },
    { player: undefined, min: 'LOW_D', ok: false },
  ];

  for (const c of cases) {
    it(`player=${c.player} min=${c.min} => ${c.ok}`, () => {
      expect(isEligible(c.player, c.min)).toBe(c.ok);
    });
  }
});


