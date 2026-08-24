import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { LETTERS, PHONEMES, PHONICS_LEVELS, WORD_BANK, blendLetters, changeInitialSound, generateCVC, isCVC, segmentWord, soundPopChoices } from '../../assets/js/phonics.js';
import { createLetterBlock, setupDragAndDrop, animateBlend, splitWord } from '../../assets/js/alphaBlocks.js';
import { phonicsStories } from '../../assets/js/stories.js';
import { phonicsWorld, worlds } from '../../assets/js/worlds.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('K-5 phonics curriculum and logic', () => {
  it('defines all six levels from Kindergarten through Grade 5', () => {
    expect(Object.keys(PHONICS_LEVELS)).toEqual(['kindergarten', 'grade1', 'grade2', 'grade3', 'grade4', 'grade5']);
    Object.values(PHONICS_LEVELS).forEach((level) => {
      expect(level.skills.length).toBeGreaterThanOrEqual(4);
      expect(level.patterns.length).toBeGreaterThanOrEqual(4);
    });
    expect(Object.keys(phonicsStories)).toEqual(Object.keys(PHONICS_LEVELS));
  });

  it('provides all 26 letter dinos with phoneme cues', () => {
    expect(LETTERS).toHaveLength(26);
    expect(new Set(LETTERS).size).toBe(26);
    LETTERS.forEach((letter) => expect(PHONEMES[letter]).toMatchObject({ mark: expect.stringMatching(/^\/.+\/$/), speak: expect.any(String) }));
  });

  it('blends, segments, changes initial sounds, and generates CVC words', () => {
    expect(blendLetters(['c', 'a', 't'])).toBe('cat');
    expect(segmentWord('ship')).toEqual(['sh', 'i', 'p']);
    expect(segmentWord('train')).toEqual(['t', 'r', 'ai', 'n']);
    expect(changeInitialSound('cat', 'b')).toBe('bat');
    for (let i = 0; i < 20; i += 1) expect(isCVC(generateCVC('-at'))).toBe(true);
  });

  it('includes digraphs, word families, and grade-appropriate word banks', () => {
    expect(WORD_BANK.kindergarten.some((item) => item.family === '-at')).toBe(true);
    expect(WORD_BANK.grade1.map((item) => item.family)).toEqual(expect.arrayContaining(['sh', 'ch', 'th']));
    expect(WORD_BANK.grade2.map((item) => item.family)).toEqual(expect.arrayContaining(['ai', 'ee', 'oa']));
    Object.values(WORD_BANK).forEach((words) => expect(words.length).toBeGreaterThanOrEqual(6));
  });

  it('builds four unique sound-pop choices containing the target', () => {
    const choices = soundPopChoices('b');
    expect(choices).toHaveLength(4);
    expect(new Set(choices).size).toBe(4);
    expect(choices).toContain('b');
  });

  it('exports drag, blend, and segment interaction helpers', () => {
    expect(createLetterBlock('a')).toContain('data-letter="a"');
    expect(createLetterBlock('a')).toContain('vowel');
    expect([setupDragAndDrop, animateBlend, splitWord].every((value) => typeof value === 'function')).toBe(true);
  });

  it('adds Phonics Lagoon without removing any math worlds', () => {
    expect(worlds).toHaveLength(8);
    expect(phonicsWorld).toMatchObject({ id: 'phonics', name: 'Phonics Lagoon', grades: 'Kindergarten–Grade 5' });
    expect(fs.existsSync(path.join(root, 'assets/js/phonics.js'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'assets/js/alphaBlocks.js'))).toBe(true);
  });
});
