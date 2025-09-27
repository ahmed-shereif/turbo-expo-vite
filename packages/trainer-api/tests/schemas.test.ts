import { describe, it, expect } from 'vitest';
import { TrainerProfile, Rank } from '../src/schemas';

describe('TrainerProfile Schema', () => {
  it('should validate correct trainer profile', () => {
    const validProfile = {
      id: 'trainer_123',
      hourlyPriceLE: 500,
      maxLevel: 'HIGH_D' as const,
      areasCovered: ['Zamalek', 'Nasr City'],
      acceptedCourtIds: ['court_1', 'court_2'],
    };

    const result = TrainerProfile.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('should reject hourly price below minimum', () => {
    const invalidProfile = {
      id: 'trainer_123',
      hourlyPriceLE: 30, // Below minimum of 50
      maxLevel: 'HIGH_D' as const,
      areasCovered: ['Zamalek'],
      acceptedCourtIds: ['court_1'],
    };

    const result = TrainerProfile.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });

  it('should reject hourly price above maximum', () => {
    const invalidProfile = {
      id: 'trainer_123',
      hourlyPriceLE: 15000, // Above maximum of 10000
      maxLevel: 'HIGH_D' as const,
      areasCovered: ['Zamalek'],
      acceptedCourtIds: ['court_1'],
    };

    const result = TrainerProfile.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });

  it('should reject empty areas covered', () => {
    const invalidProfile = {
      id: 'trainer_123',
      hourlyPriceLE: 500,
      maxLevel: 'HIGH_D' as const,
      areasCovered: [], // Empty array not allowed
      acceptedCourtIds: ['court_1'],
    };

    const result = TrainerProfile.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });
});

describe('Rank Schema', () => {
  it('should accept valid rank values', () => {
    const validRanks = ['UNKNOWN', 'LOW_D', 'MID_D', 'HIGH_D'];
    
    validRanks.forEach(rank => {
      const result = Rank.safeParse(rank);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid rank values', () => {
    const invalidRanks = ['INVALID', 'low_d', 'HIGH', ''];
    
    invalidRanks.forEach(rank => {
      const result = Rank.safeParse(rank);
      expect(result.success).toBe(false);
    });
  });
});