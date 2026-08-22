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
  const element = new Audio(new URL(path, import.meta.url));
  element.preload = 'auto';
  return element;
};
const roars = roarFiles.map(makeAudio);
const effects = Object.fromEntries(Object.entries(effectFiles).map(([name, path]) => [name, makeAudio(path)]));
let enabled = true;
let context;
let beatTimer;
let beatsOn = false;

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

function fallback(kind) {
  if (kind === 'wrong') { tone(190, 0, 0.14, 'sawtooth', 0.03); tone(145, 0.15, 0.23, 'sawtooth', 0.025); }
  else if (kind === 'crack') { tone(520, 0, 0.12, 'triangle', 0.04); tone(760, 0.08, 0.08, 'square', 0.025); }
  else if (kind === 'pop') tone(610, 0, 0.08, 'sine', 0.04);
  else { tone(392, 0, 0.13, 'triangle'); tone(523, 0.12, 0.15, 'triangle'); tone(659, 0.25, 0.28, 'triangle'); }
}

function playElement(element, fallbackKind = 'correct') {
  if (!enabled) return;
  try {
    element.currentTime = 0;
    const promise = element.play();
    if (promise) promise.catch(() => fallback(fallbackKind));
  } catch { fallback(fallbackKind); }
}

export function playEffect(name) {
  if (!enabled) return;
  const effect = effects[name] || effects.pop;
  playElement(effect, name);
}

export function playWorldRoar(worldIndex) {
  if (!enabled) return;
  playElement(roars[worldIndex], 'correct');
}

export function playCelebration(worldIndex) {
  if (!enabled) return;
  window.setTimeout(() => playEffect('confetti'), 520);
  const roots = [146, 196, 174, 220, 165, 247, 131, 185];
  const root = roots[worldIndex];
  [1, 1.25, 1.5, 2, 1.5, 1.25, 1.5, 2].forEach((multiplier, index) => {
    tone(root * multiplier, 0.62 + index * 0.15, 0.13, index % 2 ? 'triangle' : 'sine', 0.035);
  });
}

function beat() {
  if (!beatsOn || !enabled) return;
  tone([850, 980, 1120][Math.floor(Math.random() * 3)], 0, 0.08, 'sine', 0.012);
  tone([510, 620][Math.floor(Math.random() * 2)], 0.11, 0.06, 'sine', 0.009);
}

export function setBeats(on) {
  beatsOn = on;
  clearInterval(beatTimer);
  if (on) { ctx(); beat(); beatTimer = setInterval(beat, 2600); }
}

export function setSound(on) {
  enabled = on;
  if (!on && context) context.suspend();
  if (on) { ctx(); playEffect('correct'); }
}

export function soundEnabled() { return enabled; }
