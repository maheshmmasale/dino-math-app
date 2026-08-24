const supported = typeof window !== 'undefined'
  && 'speechSynthesis' in window
  && typeof globalThis.SpeechSynthesisUtterance === 'function';
let selectedVoice = null;

const preferredNames = [
  /Google US English.*Female/i,
  /^Samantha$/i,
  /^Karen$/i,
  /^Ava/i,
  /^Zira/i,
  /female/i
];

export function refreshVoices() {
  if (!supported) return;
  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter((voice) => /^en/i.test(voice.lang));
  selectedVoice = preferredNames.reduce((match, pattern) => match || english.find((voice) => pattern.test(voice.name)), null)
    || english.find((voice) => voice.localService)
    || english[0]
    || voices[0]
    || null;
}

function storySpeech(text) {
  return String(text)
    .replace(/([.!?])\s+/g, '$1,   ')
    .replace(/…/g, ',   ')
    .replace(/\b(ROAR|Roar)\b/g, 'roooar')
    .replace(/[🦕🦖🦏🦎🐊🖐️🐾🦴🥚🦷📯🪽🪺🍪🌋💦]/gu, ' ');
}

export function speakStoryText(text) {
  if (!supported) return false;
  window.speechSynthesis.cancel();
  const utterance = new globalThis.SpeechSynthesisUtterance(storySpeech(text));
  utterance.rate = 0.87;
  utterance.pitch = 1.05;
  utterance.volume = 1;
  if (selectedVoice) utterance.voice = selectedVoice;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (supported) window.speechSynthesis.cancel();
}

export function setupVoices() {
  if (!supported) return false;
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
  return true;
}

export function voiceLabel() {
  return selectedVoice ? `Browser story voice: ${selectedVoice.name}` : 'Browser story voice';
}

export const speechSupported = supported;
