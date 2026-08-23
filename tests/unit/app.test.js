import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

function JavaScriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return JavaScriptFiles(full);
    return entry.name.endsWith('.js') ? [full] : [];
  });
}

describe('application integration', () => {
  it('keeps the modular JavaScript structure', () => {
    const expected = ['app.js', 'audio.js', 'problems.js', 'storage.js', 'stories.js', 'tts.js', 'worlds.js'];
    expected.forEach((file) => expect(fs.existsSync(path.join(root, 'assets/js', file))).toBe(true));
    expect(fs.existsSync(path.join(root, 'assets/animations/effects.js'))).toBe(true);
  });

  it('loads the app through an ES module entrypoint', () => {
    const html = read('index.html');
    expect(html).toMatch(/<script\s+type="module"\s+src="assets\/js\/app\.js"><\/script>/);
  });

  it('resolves every relative JavaScript import', () => {
    const files = JavaScriptFiles(path.join(root, 'assets'));
    const importPattern = /(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g;
    files.forEach((file) => {
      const source = fs.readFileSync(file, 'utf8');
      for (const match of source.matchAll(importPattern)) {
        expect(fs.existsSync(path.resolve(path.dirname(file), match[1])), `${path.relative(root, file)} -> ${match[1]}`).toBe(true);
      }
    });
  });

  it('uses Teacher Maya only for the story title, never questions or answers', () => {
    const appSource = read('assets/js/app.js');
    const calls = [...appSource.matchAll(/speakStoryText\(([^)]*)\)/g)].map((match) => match[1].trim());
    expect(calls).toEqual(['state.problem.title']);
    expect(appSource).not.toMatch(/speakStoryText\([^)]*(question|answer|teach)/i);
  });

  it('plays the world-specific roar celebration after a correct answer', () => {
    const appSource = read('assets/js/app.js');
    expect(appSource).toMatch(/if \(correct\)[\s\S]*playCorrectCelebration\(state\.world\)/);
  });
});
