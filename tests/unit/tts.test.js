import { beforeEach, describe, expect, it, vi } from 'vitest';

let synthesis;
let utterances;

beforeEach(() => {
  vi.resetModules();
  utterances = [];
  synthesis = {
    cancel: vi.fn(),
    speak: vi.fn(),
    getVoices: vi.fn(() => [
      { name: 'English Male', lang: 'en-US', localService: true },
      { name: 'Samantha', lang: 'en-US', localService: true },
      { name: 'French Female', lang: 'fr-FR', localService: true }
    ]),
    onvoiceschanged: null
  };
  const Utterance = class {
    constructor(text) {
      this.text = text;
      utterances.push(this);
    }
  };
  globalThis.SpeechSynthesisUtterance = Utterance;
  globalThis.window = { speechSynthesis: synthesis, SpeechSynthesisUtterance: Utterance };
});

describe('Teacher Maya story voice', () => {
  it('does not speak automatically when the module initializes', async () => {
    await import('../../assets/js/tts.js');
    expect(synthesis.speak).not.toHaveBeenCalled();
  });

  it('prefers a warm female English voice', async () => {
    const { refreshVoices, speakStoryText } = await import('../../assets/js/tts.js');
    refreshVoices();
    speakStoryText('A dino story.');
    expect(utterances[0].voice.name).toBe('Samantha');
  });

  it('uses the approved gentle rate and pitch', async () => {
    const { speakStoryText } = await import('../../assets/js/tts.js');
    speakStoryText('Bindi finds three eggs.');
    expect(utterances[0].rate).toBeGreaterThanOrEqual(0.85);
    expect(utterances[0].rate).toBeLessThanOrEqual(0.9);
    expect(utterances[0].pitch).toBe(1.05);
    expect(synthesis.cancel).toHaveBeenCalledOnce();
    expect(synthesis.speak).toHaveBeenCalledWith(utterances[0]);
  });
});
