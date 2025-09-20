import { describe, it, expect } from 'vitest';

import { fetchOpenSessions } from '@repo/player-api';

describe('OpenSessions query key wiring', () => {
  it('placeholder', () => {
    expect(typeof fetchOpenSessions).toBe('function');
  });
});


