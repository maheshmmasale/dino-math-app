import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const curriculum = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/curriculum.json'), 'utf8'));

describe('curriculum data', () => {
  it('covers Kindergarten and every grade from 1 through 3', () => {
    expect(curriculum.scope).toMatch(/Kindergarten through Grade 3/i);
    expect(curriculum.numberLimits).toEqual({ kindergarten: 20, grade1: 20, grade2: 50, grade3: 99 });
    const grades = new Set(curriculum.worlds.flatMap((world) => world.grades));
    expect([...grades].sort()).toEqual([1, 2, 3]);
  });

  it('maps every grade to the correct Common Core domains', () => {
    expect(curriculum.standardsByGrade).toEqual({
      kindergarten: ['K.CC', 'K.OA', 'K.MD', 'K.G'],
      grade1: ['1.OA', '1.NBT', '1.MD', '1.G'],
      grade2: ['2.OA', '2.NBT', '2.MD', '2.G'],
      grade3: ['3.OA', '3.NBT', '3.NF', '3.MD', '3.G']
    });
    expect(curriculum.kindergarten.standards).toEqual(curriculum.standardsByGrade.kindergarten);
    expect(curriculum.kindergarten.challengeCount).toBe(20);
    expect(curriculum.kindergarten.topics).toHaveLength(20);
  });

  it('has one curriculum mapping for each world', () => {
    expect(curriculum.worlds.map((world) => world.id)).toEqual([
      'counting', 'addition', 'subtraction', 'patterns', 'measure', 'shapes', 'multiplication', 'reasoning'
    ]);
    curriculum.worlds.forEach((world) => {
      expect(world.grades.length).toBeGreaterThan(0);
      expect(world.grades.every((grade) => [1, 2, 3].includes(grade))).toBe(true);
      expect(world.topics.length).toBeGreaterThan(0);
    });
  });
});
