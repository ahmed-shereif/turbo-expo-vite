import { describe, it, expect } from 'vitest';
import { combineDayAndTime, estimateIntendedShareLE } from './index';

describe('combineDayAndTime', () => {
  it('should combine day and time correctly', () => {
    const result = combineDayAndTime('2025-10-02', '18:00');
    const expected = new Date('2025-10-02T18:00:00').toISOString();
    expect(result).toBe(expected);
  });

  it('should handle different times', () => {
    const result = combineDayAndTime('2025-12-25', '09:30');
    const expected = new Date('2025-12-25T09:30:00').toISOString();
    expect(result).toBe(expected);
  });
});

describe('estimateIntendedShareLE', () => {
  it('should calculate share correctly with all parameters', () => {
    const result = estimateIntendedShareLE(100, 50, 4, 10);
    // (100 + 50 + 10) / 4 = 40
    expect(result).toBe(40);
  });

  it('should handle missing court price', () => {
    const result = estimateIntendedShareLE(undefined, 50, 4, 10);
    // (0 + 50 + 10) / 4 = 15
    expect(result).toBe(15);
  });

  it('should handle missing trainer price', () => {
    const result = estimateIntendedShareLE(100, undefined, 4, 10);
    // (100 + 0 + 10) / 4 = 27.5 -> 28 (rounded)
    expect(result).toBe(28);
  });

  it('should handle no app fee', () => {
    const result = estimateIntendedShareLE(100, 50, 4);
    // (100 + 50 + 0) / 4 = 37.5 -> 38 (rounded)
    expect(result).toBe(38);
  });

  it('should round to nearest integer', () => {
    const result = estimateIntendedShareLE(100, 50, 3, 5);
    // (100 + 50 + 5) / 3 = 51.67 -> 52 (rounded)
    expect(result).toBe(52);
  });
});
