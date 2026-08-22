const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let selectedVoice = null;

export function refreshVoices() {
  if (!supported) return;
  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter((voice) => /^en/i.test(voice.lang));
  selectedVoice = english.find((voice) => /Samantha|Zira|Ava|Google US English|female/i.test(voice.name)) || english[0] || voices[0] || null;
}

export function mathSpeech(text) {
  return String(text)
    .replaceAll('×', ' times ')
    .replaceAll('÷', ' divided by ')
    .replaceAll('−', ' minus ')
    .replaceAll('+', ' plus ')
    .replaceAll('=', ' equals ')
    .replaceAll('≈', ' about ')
    .replace(/(\d+)\/(\d+)/g, '$1 out of $2')
    .replace(/¢/g, ' cents')
    .replace(/[🦕🦖🦏🦎🐊🖐️🐾🦴🥚🦷📯🪽🪺🍪🌋💦]/gu, ' ');
}

export function speak(text) {
  if (!supported) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(mathSpeech(text));
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
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

export const speechSupported = supported;
