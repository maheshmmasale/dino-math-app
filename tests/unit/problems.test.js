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
  expect(item.options).toHaveLength(4);
  expect(item.options).toContain(item.correct);
}

function cappedNumber(value) {
  const match = String(value).match(/^(\d+)(?:\s*(?:¢|cm|in|units|square units))?$/);
  return match ? Number(match[1]) : null;
}

describe('problem generation', () => {
  it('keeps exactly 20 distinct Kindergarten challenge types', () => {
    expect(KINDERGARTEN_CHALLENGE_COUNT).toBe(20);
    const cycle = Array.from({ length: 20 }, () => makeProblem(0, 'kindergarten'));
    expect(new Set(cycle.map((item) => item.skill)).size).toBe(20);
    cycle.forEach(expectProblemShape);
  });

  it.each([
    ['kindergarten', 30],
    ['easy', 500],
    ['medium', 1000],
    ['hard', 5000]
  ])('caps generated numeric answers for %s at %i', (difficulty, expectedLimit) => {
    expect(limits[difficulty]).toBe(expectedLimit);
    const rounds = difficulty === 'kindergarten' ? 20 : 15;
    for (let round = 0; round < rounds; round += 1) {
      for (let worldIndex = 0; worldIndex < worlds.length; worldIndex += 1) {
        const item = makeProblem(worldIndex, difficulty);
        expectProblemShape(item);
        [item.correct, ...item.options].forEach((value) => {
          const number = cappedNumber(value);
          if (number !== null) {
            expect(number).toBeGreaterThanOrEqual(0);
            expect(number).toBeLessThanOrEqual(expectedLimit);
            expect(number).toBeLessThan(6000);
          }
        });
      }
    }
  });

  it('continues generating valid problems without exhausting a deck', () => {
    for (let index = 0; index < 100; index += 1) {
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

  it('includes new lesson types: before/after, missing, order, bigger/smaller, odd/even, tables', () => {
    const skills = new Set();
    for (let i=0;i<100;i++) {
      const item = makeProblem(0, 'easy');
      skills.add(item.skill.toLowerCase());
    }
    const skillText = [...skills].join(' ');
    expect(skillText).toMatch(/before|after|missing|ascend|descend|bigger|smaller|odd|even|prime|table|count/);
  });
});
