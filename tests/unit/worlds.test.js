import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../assets/js/problems.js';
import { limits, worlds } from '../../assets/js/worlds.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const expected = [
  ['Counting Valley', 'Brontosaurus', 'Grades 1–2'],
  ['Addition Volcano', 'Tyrannosaurus rex', 'Grades 1–3'],
  ['Subtraction Swamp', 'Triceratops', 'Grades 1–3'],
  ['Pattern Jungle', 'Velociraptor', 'Grades 1–3'],
  ['Measure Mountain', 'Stegosaurus', 'Grades 1–3'],
  ['Shape Canyon', 'Pterodactyl', 'Grades 1–3'],
  ['Multiplication Plains', 'Ankylosaurus', 'Grades 2–3'],
  ['Reasoning Reef', 'Mosasaurus', 'Grades 2–3']
];

describe('world definitions', () => {
  it('contains the eight expected worlds plus the Kindergarten level', () => {
    expect(worlds).toHaveLength(8);
    expect(worlds.map((world) => world.name.replace(/^Dino /, ''))).toEqual(expected.map(([name]) => name));
    expect(limits).toEqual({ kindergarten: 30, easy: 500, medium: 1000, hard: 5000 });
  });

  it('maps each world to the intended dinosaur, grades, and roar', () => {
    worlds.forEach((world, index) => {
      expect([world.name.replace(/^Dino /, ''), world.dinoName, world.grades]).toEqual(expected[index]);
      expect(world.roar).toMatch(/roar|hum|trumpet|chirp|thump|screech/i);
    });
  });

  it('keeps a real local dino image for every world', () => {
    worlds.forEach((world) => {
      expect(world.image).toMatch(/^assets\/images\/dinos\/.+\.svg$/);
      expect(fs.existsSync(path.join(root, world.image))).toBe(true);
      expect(fs.statSync(path.join(root, world.image)).size).toBeGreaterThan(100);
    });
  });

  it('generates a story and teaching clue in every world', () => {
    worlds.forEach((_, worldIndex) => {
      const item = makeProblem(worldIndex, 'easy');
      expect(item.title.length).toBeGreaterThan(20);
      expect(item.teach.length).toBeGreaterThan(15);
    });
  });
});
