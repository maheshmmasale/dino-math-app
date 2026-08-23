import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('session progress storage', () => {
  beforeEach(() => {
    vi.resetModules();
    globalThis.localStorage = {
      getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn()
    };
  });

  it('tracks stars and correct answers during the current safari', async () => {
    const { session } = await import('../../assets/js/storage.js');
    expect(session.state.stars).toBe(0);
    session.awardStar();
    expect(session.state.stars).toBe(1);
    expect(session.state.roundCorrect).toBe(1);
  });

  it('saves and checks earned badges in session state', async () => {
    const { session } = await import('../../assets/js/storage.js');
    session.awardBadge(3);
    expect(session.hasBadge(3)).toBe(true);
    expect(session.hasBadge(2)).toBe(false);
  });

  it('resets round progress without deleting total stars or badges', async () => {
    const { session } = await import('../../assets/js/storage.js');
    session.awardStar();
    session.awardBadge(1);
    session.state.round = 3;
    session.state.answered = true;
    session.resetRound();
    expect(session.state).toMatchObject({ round: 0, roundCorrect: 0, answered: false, stars: 1 });
    expect(session.hasBadge(1)).toBe(true);
  });

  it('does not silently persist child progress in localStorage', async () => {
    const { session } = await import('../../assets/js/storage.js');
    session.awardStar();
    session.awardBadge(0);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
