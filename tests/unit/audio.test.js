import { beforeEach, describe, expect, it, vi } from 'vitest';

const audioInstances = [];
let context;

class MockAudio {
  constructor(src) {
    this.src = src;
    this.dataset = {};
    this.volume = 1;
    this.currentTime = 0;
    this.preload = '';
    this.load = vi.fn();
    this.pause = vi.fn();
    this.play = vi.fn(() => Promise.resolve());
    audioInstances.push(this);
  }
}

function node(extra = {}) {
  return { connect(next) { return next; }, ...extra };
}

function makeContext() {
  return {
    state: 'running',
    currentTime: 0,
    sampleRate: 8000,
    destination: {},
    resume: vi.fn(),
    suspend: vi.fn(),
    createOscillator: vi.fn(() => node({
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      start: vi.fn(),
      stop: vi.fn()
    })),
    createGain: vi.fn(() => node({ gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() } })),
    createBuffer: vi.fn((channels, length) => ({ getChannelData: () => new Float32Array(length) })),
    createBufferSource: vi.fn(() => node({ buffer: null, start: vi.fn() })),
    createBiquadFilter: vi.fn(() => node({ type: '', Q: { value: 0 }, frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() } }))
  };
}

beforeEach(() => {
  vi.resetModules();
  audioInstances.length = 0;
  context = makeContext();
  globalThis.Audio = MockAudio;
  globalThis.window = { AudioContext: class { constructor() { return context; } }, setTimeout };
});

describe('dinosaur audio', () => {
  it('defines one world-specific roar for each of the eight worlds', async () => {
    const { roarFiles } = await import('../../assets/js/audio.js');
    expect(roarFiles).toHaveLength(8);
    expect(new Set(roarFiles).size).toBe(8);
    expect(roarFiles).toEqual(expect.arrayContaining([
      expect.stringContaining('trex-roar'),
      expect.stringContaining('tricera-trumpet'),
      expect.stringContaining('ptero-screech')
    ]));
  });

  it('preloads audio at volume 0.8 without auto-playing on import', async () => {
    const { AUDIO_VOLUME } = await import('../../assets/js/audio.js');
    expect(AUDIO_VOLUME).toBe(0.8);
    expect(audioInstances.length).toBeGreaterThanOrEqual(8);
    audioInstances.forEach((audio) => {
      expect(audio.volume).toBe(0.8);
      expect(audio.load).toHaveBeenCalledOnce();
      expect(audio.play).not.toHaveBeenCalled();
    });
  });

  it('plays the selected world roar after an explicit call', async () => {
    const { playWorldRoar } = await import('../../assets/js/audio.js');
    playWorldRoar(2);
    expect(audioInstances[2].play).toHaveBeenCalledOnce();
  });

  it('uses synthesized fallback when a roar file cannot play', async () => {
    const { playWorldRoar } = await import('../../assets/js/audio.js');
    audioInstances[0].play.mockRejectedValueOnce(new Error('decode failed'));
    playWorldRoar(0);
    await Promise.resolve();
    await Promise.resolve();
    expect(context.createBufferSource).toHaveBeenCalled();
  });
});
