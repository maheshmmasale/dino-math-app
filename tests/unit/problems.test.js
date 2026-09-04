import { describe, expect, it } from 'vitest';
import { KINDERGARTEN_CHALLENGE_COUNT, isCorrectAnswer, makeProblem } from '../../assets/js/problems.js';
import { limits, worlds } from '../../assets/js/worlds.js';

function expectProblemShape(item) {
  expect(item).toEqual(expect.objectContaining({
    title: expect.any(String),
    teach: expect.any(String),
    question: expect.any(String),
    correct: expect.any(String),
    options: expect.any(Array),
    visual: expect.any(String),
    skill: expect.any(String)
  }));
  expect(item.options).toHaveLength(item.skill === 'Say Coins' ? 10 : 4);
  expect(item.options).toContain(item.correct);
}

function cappedNumber(value) {
  const match = String(value).match(/^(\d+)(?:\s*(?:¢|cm|in|units|square units))?$/);
  return match ? Number(match[1]) : null;
}

describe('problem generation', () => {
  it('keeps exactly 21 distinct Kindergarten challenge types, including Say Coins', () => {
    expect(KINDERGARTEN_CHALLENGE_COUNT).toBe(21);
    const cycle = Array.from({ length: 21 }, () => makeProblem(0, 'kindergarten'));
    expect(new Set(cycle.map((item) => item.skill)).size).toBe(21);
    const coinGame = cycle.find((item) => item.skill === 'Say Coins');
    expect(coinGame).toEqual(expect.objectContaining({ title: 'Say Coins', question: 'Say all 10 numbers!' }));
    expect(coinGame.options).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
    expect(coinGame.visual).toContain('id="coinGrid"');
    cycle.forEach(expectProblemShape);
  });

  it.each([
    ['kindergarten', 20],
    ['easy', 20],
    ['medium', 50],
    ['hard', 99]
  ])('caps generated numeric answers for %s at %i', (difficulty, expectedLimit) => {
    expect(limits[difficulty]).toBe(expectedLimit);
    for (let round = 0; round < 80; round += 1) {
      for (let worldIndex = 0; worldIndex < worlds.length; worldIndex += 1) {
        const item = makeProblem(worldIndex, difficulty);
        expectProblemShape(item);
        [item.correct, ...item.options].forEach((value) => {
          const number = cappedNumber(value);
          if (number !== null) {
            expect(number).toBeGreaterThanOrEqual(0);
            expect(number).toBeLessThanOrEqual(expectedLimit);
            expect(number).toBeLessThan(100);
          }
        });
      }
    }
  });

  it('continues generating valid problems without exhausting a deck', () => {
    for (let index = 0; index < 500; index += 1) {
      expectProblemShape(makeProblem(index % worlds.length, index % 2 ? 'kindergarten' : 'hard'));
    }
  });

  it('validates answers using the same string-safe comparison as the app', () => {
    const item = makeProblem(1, 'easy');
    expect(isCorrectAnswer(item, item.correct)).toBe(true);
    const wrong = item.options.find((option) => option !== item.correct);
    expect(isCorrectAnswer(item, wrong)).toBe(false);
    expect(isCorrectAnswer({ correct: '7' }, 7)).toBe(true);
  });
});
