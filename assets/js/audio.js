const roarFiles = [
  '../sounds/roars/bronto-hum.mp3',
  '../sounds/roars/trex-roar.mp3',
  '../sounds/roars/tricera-trumpet.mp3',
  '../sounds/roars/raptor-chirp.mp3',
  '../sounds/roars/stego-thump.mp3',
  '../sounds/roars/ptero-screech.mp3',
  '../sounds/roars/ankylo-stomp.mp3',
  '../sounds/roars/mosa-splash.mp3'
];
const effectFiles = {
  crack: '../sounds/fx/egg-crack.mp3',
  boom: '../sounds/fx/volcano-boom.mp3',
  correct: '../sounds/fx/correct-chime.mp3',
  wrong: '../sounds/fx/try-again-grunt.mp3',
  pop: '../sounds/fx/button-pop.mp3',
  confetti: '../sounds/fx/confetti.mp3'
};

const makeAudio = (path) => {
  const resolved = new URL(path, import.meta.url).href;
  const element = new Audio(resolved);
  element.preload = 'auto';
  element.volume = 0.8;
  element.dataset.source = resolved;
  element.load();
  return element;
};
const roars = roarFiles.map(makeAudio);
const effects = Object.fromEntries(Object.entries(effectFiles).map(([name, path]) => [name, makeAudio(path)]));
let enabled = true;
let context;

function ctx() {
  if (!context) context = new (window.AudioContext || window.webkitAudioContext)();
  if (context.state === 'suspended') context.resume();
  return context;
}

function tone(frequency, start, duration, type = 'sine', gain = 0.055) {
  if (!enabled) return;
  const audioContext = ctx();
  const oscillator = audioContext.createOscillator();
  const envelope = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + start);
  envelope.gain.setValueAtTime(0.001, audioContext.currentTime + start);
  envelope.gain.exponentialRampToValueAtTime(gain, audioContext.currentTime + start + 0.015);
  envelope.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + start + duration);
  oscillator.connect(envelope).connect(audioContext.destination);
  oscillator.start(audioContext.currentTime + start);
  oscillator.stop(audioContext.currentTime + start + duration + 0.03);
}

function fallbackEffect(kind) {
  if (kind === 'wrong') { tone(190, 0, 0.14, 'sawtooth', 0.03); tone(145, 0.15, 0.23, 'sawtooth', 0.025); }
  else if (kind === 'crack') { tone(520, 0, 0.12, 'triangle', 0.04); tone(760, 0.08, 0.08, 'square', 0.025); }
  else if (kind === 'pop') tone(610, 0, 0.08, 'sine', 0.04);
  else { tone(392, 0, 0.13, 'triangle'); tone(523, 0.12, 0.15, 'triangle'); tone(659, 0.25, 0.28, 'triangle'); }
}

function synthRoar(worldIndex) {
  if (!enabled) return;
  const audioContext = ctx();
  const profiles = [
    { duration: 1.25, low: 78, high: 180, sweep: -34, gain: .17 },
    { duration: 1.05, low: 52, high: 145, sweep: -28, gain: .22 },
    { duration: .88, low: 105, high: 410, sweep: -45, gain: .17 },
    { duration: .55, low: 360, high: 1450, sweep: 260, gain: .13 },
    { duration: .92, low: 68, high: 210, sweep: -18, gain: .18 },
    { duration: .72, low: 620, high: 2300, sweep: 420, gain: .12 },
    { duration: .95, low: 62, high: 185, sweep: -20, gain: .2 },
    { duration: 1.18, low: 48, high: 170, sweep: -26, gain: .2 }
  ];
  const profile = profiles[worldIndex] || profiles[1];
  const length = Math.floor(audioContext.sampleRate * profile.duration);
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = last * .88 + white * .12;
    const envelope = Math.sin(Math.PI * i / length) ** .55;
    data[i] = (last * .72 + white * .28) * envelope;
  }
  const source = audioContext.createBufferSource();
  const band = audioContext.createBiquadFilter();
  const low = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  source.buffer = buffer;
  band.type = 'bandpass';
  band.Q.value = worldIndex === 5 ? 3.2 : 1.1;
  band.frequency.setValueAtTime(profile.high, audioContext.currentTime);
  band.frequency.exponentialRampToValueAtTime(Math.max(45, profile.high + profile.sweep), audioContext.currentTime + profile.duration);
  low.type = 'lowpass';
  low.frequency.value = Math.max(180, profile.high * 1.7);
  gain.gain.setValueAtTime(.001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(profile.gain, audioContext.currentTime + .05);
  gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + profile.duration);
  source.connect(band).connect(low).connect(gain).connect(audioContext.destination);
  source.start();
  tone(profile.low, 0, profile.duration * .88, 'sawtooth', profile.gain * .32);
  if ([2, 3, 5].includes(worldIndex)) tone(profile.high * 1.25, .1, profile.duration * .45, 'triangle', profile.gain * .22);
}

function playElement(element, onFailure) {
  if (!enabled) return;
  const fail = (error) => {
    console.warn(`Dino audio failed: ${element.dataset.source || element.src}`, error);
    onFailure();
  };
  try {
    element.pause();
    element.currentTime = 0;
    element.volume = 0.8;
    const promise = element.play();
    if (promise) promise.catch(fail);
  } catch (error) { fail(error); }
}

export function playEffect(name) {
  if (!enabled) return;
  const effect = effects[name] || effects.pop;
  playElement(effect, () => fallbackEffect(name));
}

export function unlockAudio() {
  if (!enabled) return;
  try { ctx(); } catch (error) { console.warn('Could not unlock dinosaur audio', error); }
}

export function playWorldRoar(worldIndex) {
  if (!enabled) return;
  unlockAudio();
  const roar = roars[worldIndex];
  if (!roar) {
    console.warn(`No roar file configured for world ${worldIndex}; using synthesized fallback.`);
    synthRoar(worldIndex);
    return;
  }
  playElement(roar, () => synthRoar(worldIndex));

export { roarFiles };
export const AUDIO_VOLUME = 0.8;
}

export function playCorrectCelebration(worldIndex) {
  playWorldRoar(worldIndex);
  window.setTimeout(() => playEffect('confetti'), 480);
}

export function setSound(on) {
  enabled = on;
  if (!on) {
    roars.forEach((audio) => { audio.pause(); audio.currentTime = 0; });
    Object.values(effects).forEach((audio) => { audio.pause(); audio.currentTime = 0; });
    if (context) context.suspend();
  }
  if (on) { ctx(); playEffect('pop'); }
}

export function soundEnabled() { return enabled; }
