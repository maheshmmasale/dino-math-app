import { LETTERS, PHONEMES, PHONICS_LEVELS, VOWELS, blendLetters, randomWord, segmentWord, soundPopChoices } from './phonics.js';
import { phonicsStory } from './stories.js';

const ACTIVITIES = [
  { id: 'sound', label: 'Sound Pop', icon: '👂' },
  { id: 'build', label: 'Build It', icon: '🧩' },
  { id: 'mix', label: 'Mix & Match', icon: '🔁' },
  { id: 'sentence', label: 'Silly Sentences', icon: '💬' }
];

export function createLetterBlock(letter, options = {}) {
  const value = String(letter).toLowerCase();
  const vowel = VOWELS.has(value);
  return `<button class="alpha-block ${vowel ? 'vowel' : 'consonant'} ${options.small ? 'small' : ''}" type="button" draggable="true" data-letter="${value}" aria-label="${value.toUpperCase()}, sound ${PHONEMES[value]?.mark || value}"><span class="dino-horns" aria-hidden="true"></span><span class="block-eyes" aria-hidden="true"><i></i><i></i></span><b>${value.toUpperCase()}</b><small>${PHONEMES[value]?.mark || ''}</small><span class="block-mouth" aria-hidden="true"></span><span class="dino-tail" aria-hidden="true"></span></button>`;
}

function speech(text, rate = 0.78) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1.08;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function speakPhoneme(letter) {
  return speech(PHONEMES[String(letter).toLowerCase()]?.speak || String(letter));
}

function popTone(frequency = 540) {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = 'triangle';
    gain.gain.setValueAtTime(.06, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .11);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + .12);
  } catch (_) { /* sound is an enhancement */ }
}

export function setupDragAndDrop(root, onLetterDrop) {
  root.addEventListener('dragstart', (event) => {
    const block = event.target.closest('[data-letter]');
    if (!block || !event.dataTransfer) return;
    event.dataTransfer.setData('text/plain', block.dataset.letter);
    event.dataTransfer.effectAllowed = 'copy';
    block.classList.add('dragging');
  });
  root.addEventListener('dragend', (event) => event.target.closest('[data-letter]')?.classList.remove('dragging'));
  root.addEventListener('dragover', (event) => {
    const line = event.target.closest('[data-blend-line]');
    if (!line) return;
    event.preventDefault();
    line.classList.add('drop-ready');
  });
  root.addEventListener('dragleave', (event) => event.target.closest('[data-blend-line]')?.classList.remove('drop-ready'));
  root.addEventListener('drop', (event) => {
    const line = event.target.closest('[data-blend-line]');
    if (!line) return;
    event.preventDefault();
    line.classList.remove('drop-ready');
    const letter = event.dataTransfer?.getData('text/plain');
    if (letter) onLetterDrop(letter);
  });
}

export function animateBlend(line, letters, word, onComplete) {
  const blocks = [...line.querySelectorAll('.alpha-block')];
  blocks.forEach((block, index) => window.setTimeout(() => {
    block.classList.add('speaking');
    speakPhoneme(letters[index]);
    window.setTimeout(() => block.classList.remove('speaking'), 380);
  }, index * 430));
  window.setTimeout(() => {
    line.classList.add('holding-hands', 'blend-glow');
    speech(word, .72);
    popTone(720);
    window.setTimeout(() => line.classList.remove('blend-glow'), 900);
    onComplete?.();
  }, letters.length * 430 + 80);
}

export function splitWord(line) {
  line.classList.remove('holding-hands', 'blend-glow');
  line.classList.add('segmenting');
  [...line.children].forEach((block, index) => window.setTimeout(() => popTone(420 + index * 70), index * 95));
  window.setTimeout(() => line.classList.remove('segmenting'), 800);
}

export function initAlphaBlocks(root, callbacks = {}) {
  if (!root || root.dataset.ready === 'true') return;
  root.dataset.ready = 'true';
  const state = {
    level: 'kindergarten', activity: 'build', letters: [], stars: 0,
    completedPatterns: new Set(), current: randomWord('kindergarten'), soundTarget: 'b', soundChoices: soundPopChoices('b')
  };

  root.innerHTML = `
    <div class="phonics-head">
      <div class="phonics-title"><img src="assets/images/dinos/triceratops.svg" alt="Friendly triceratops phonics guide"><div><span>NEW READING WORLD</span><h2>Alpha Dino Blocks</h2><p>Tap, drag, blend, split—and listen to letters come alive.</p></div></div>
      <button class="back-btn" type="button" data-phonics-back>← Math worlds</button>
    </div>
    <div class="phonics-dashboard">
      <div class="phonics-levels" role="group" aria-label="Choose phonics grade">${Object.entries(PHONICS_LEVELS).map(([id, level]) => `<button type="button" data-phonics-level="${id}" aria-pressed="${id === state.level}"><b>${level.short}</b><span>${level.label}</span></button>`).join('')}</div>
      <div class="phonics-progress" aria-live="polite"><span>⭐ <b data-phonics-stars>0</b> sound stars</span><span class="family-egg" data-family-egg>🥚 <b>Family egg</b></span></div>
    </div>
    <div class="phonics-skill-strip" data-skill-strip></div>
    <div class="activity-tabs" role="tablist" aria-label="Phonics activities">${ACTIVITIES.map((activity) => `<button role="tab" type="button" data-activity="${activity.id}" aria-selected="${activity.id === state.activity}"><span aria-hidden="true">${activity.icon}</span>${activity.label}</button>`).join('')}</div>
    <div class="phonics-workbench">
      <article class="sound-stage" data-stage></article>
      <aside class="letter-lab">
        <div class="tray-head"><div><span>LETTER DINOS</span><h3>Tap or drag a block</h3></div><button type="button" class="clear-line" data-clear>Clear line</button></div>
        <div class="letter-tray" data-letter-tray>${LETTERS.map((letter) => createLetterBlock(letter, { small: true })).join('')}</div>
      </aside>
    </div>`;

  const stage = root.querySelector('[data-stage]');
  const skillStrip = root.querySelector('[data-skill-strip]');
  const stars = root.querySelector('[data-phonics-stars]');
  const egg = root.querySelector('[data-family-egg]');

  function award(pattern, message) {
    state.stars += 1;
    state.completedPatterns.add(pattern);
    stars.textContent = state.stars;
    callbacks.onStar?.();
    callbacks.onRoar?.();
    if (state.completedPatterns.size >= 3) {
      egg.classList.add('hatched');
      egg.innerHTML = '🐣 <b>Family hatched!</b>';
    }
    const status = stage.querySelector('[data-phonics-status]');
    if (status) { status.className = 'phonics-status success'; status.textContent = message; }
  }

  function updateSkillStrip() {
    skillStrip.innerHTML = PHONICS_LEVELS[state.level].skills.map((skill) => `<span>${skill}</span>`).join('');
  }

  function lineMarkup() {
    return `<div class="blend-line" data-blend-line aria-label="Blending line">${state.letters.length ? state.letters.map((letter) => createLetterBlock(letter)).join('') : '<p>Drop or tap letter dinos here</p>'}</div>`;
  }

  function buildStage() {
    const target = state.current;
    stage.innerHTML = `<div class="stage-intro"><span>BUILD IT · ${target.family}</span><h3>Build “${target.word}”</h3><p>Clue: ${target.clue}. Tap each letter, then bring the dinos together.</p></div>${lineMarkup()}<div class="blend-controls"><button type="button" data-blend>Hold hands &amp; blend</button><button type="button" data-split>Pop apart</button><button type="button" data-new-word>New word</button></div><div class="phonics-status" data-phonics-status>Build the word in the blending line.</div>`;
  }

  function soundStage() {
    stage.innerHTML = `<div class="stage-intro"><span>SOUND POP</span><h3>Which dino says ${PHONEMES[state.soundTarget].mark}?</h3><p>Listen, then tap the matching letter dino.</p></div><button class="hear-sound" type="button" data-hear-target>▶ Hear the sound</button><div class="sound-choices">${state.soundChoices.map((letter) => createLetterBlock(letter)).join('')}</div><div class="phonics-status" data-phonics-status>Use your ears and your eyes.</div>`;
  }

  function mixStage() {
    const family = state.level === 'kindergarten' ? ['cat', 'bat', 'hat'] : ['ship', 'chip', 'trip'];
    stage.innerHTML = `<div class="stage-intro"><span>MIX &amp; MATCH</span><h3>Make a word hop!</h3><p>Tap a word. Watch its first sound jump out while the family stays together.</p></div><div class="mix-words">${family.map((word) => `<button type="button" data-mix-word="${word}" aria-label="Make the word ${word}"><span class="mix-letter ${VOWELS.has(word[0]) ? 'vowel' : ''}" aria-hidden="true">${word[0].toUpperCase()}</span><strong>${word.slice(1)}</strong></button>`).join('')}</div><div class="mix-result" data-mix-result>cat → bat → hat</div><div class="phonics-status" data-phonics-status>Try all three word-family friends.</div>`;
  }

  function sentenceStage() {
    const words = state.level === 'kindergarten' ? ['cat', 'bat', 'hat', 'can', 'fan'] : ['ship', 'crab', 'train', 'green', 'storm'];
    stage.innerHTML = `<div class="stage-intro"><span>SILLY SENTENCES</span><h3>Choose a word for the dino tale</h3><p>Every choice makes a readable, ridiculous sentence.</p></div><div class="sentence-frame"><span class="sentence-dino" aria-hidden="true">🦖</span><p>The tiny dinosaur put a <button type="button" data-sentence-slot>___</button> on its head and danced.</p></div><div class="sentence-words">${words.map((word) => `<button type="button" data-sentence-word="${word}">${word}</button>`).join('')}</div><div class="phonics-status" data-phonics-status>Pick a word, then read the whole sentence.</div>`;
  }

  function renderStage() {
    if (state.activity === 'sound') soundStage();
    else if (state.activity === 'mix') mixStage();
    else if (state.activity === 'sentence') sentenceStage();
    else buildStage();
  }

  function newChallenge() {
    state.current = randomWord(state.level, state.current.word);
    state.letters = [];
    state.soundTarget = state.current.word[0];
    state.soundChoices = soundPopChoices(state.soundTarget);
    renderStage();
  }

  function addLetter(letter) {
    if (state.activity !== 'build') {
      speakPhoneme(letter);
      return;
    }
    if (state.letters.length >= 18) return;
    state.letters.push(letter);
    speakPhoneme(letter);
    popTone();
    buildStage();
    stage.querySelector('.blend-line .alpha-block:last-of-type')?.classList.add('speaking');
  }

  root.addEventListener('click', (event) => {
    const levelButton = event.target.closest('[data-phonics-level]');
    if (levelButton) {
      state.level = levelButton.dataset.phonicsLevel;
      root.querySelectorAll('[data-phonics-level]').forEach((button) => button.setAttribute('aria-pressed', String(button === levelButton)));
      state.completedPatterns.clear();
      egg.classList.remove('hatched'); egg.innerHTML = '🥚 <b>Family egg</b>';
      updateSkillStrip(); setStory(); newChallenge(); return;
    }
    const activityButton = event.target.closest('[data-activity]');
    if (activityButton) {
      state.activity = activityButton.dataset.activity;
      root.querySelectorAll('[data-activity]').forEach((button) => button.setAttribute('aria-selected', String(button === activityButton)));
      newChallenge(); return;
    }
    if (event.target.closest('[data-phonics-back]')) { callbacks.onBack?.(); return; }
    if (event.target.closest('[data-clear]')) { state.letters = []; if (state.activity === 'build') buildStage(); return; }
    if (event.target.closest('[data-hear-target]')) { speakPhoneme(state.soundTarget); return; }
    const soundChoice = event.target.closest('.sound-choices [data-letter]');
    if (soundChoice) {
      const letter = soundChoice.dataset.letter;
      soundChoice.classList.add('speaking'); speakPhoneme(letter);
      if (letter === state.soundTarget) { award(`sound-${letter}`, `Yes! ${letter.toUpperCase()} says ${PHONEMES[letter].mark}.`); window.setTimeout(newChallenge, 1150); }
      else { stage.querySelector('[data-phonics-status]').textContent = `That is ${PHONEMES[letter].mark}. Listen again for ${PHONEMES[state.soundTarget].mark}.`; }
      return;
    }
    const trayLetter = event.target.closest('.letter-tray [data-letter]');
    if (trayLetter) { addLetter(trayLetter.dataset.letter); return; }
    const lineLetter = event.target.closest('.blend-line [data-letter]');
    if (lineLetter) { lineLetter.classList.add('speaking'); speakPhoneme(lineLetter.dataset.letter); window.setTimeout(() => lineLetter.classList.remove('speaking'), 420); return; }
    if (event.target.closest('[data-blend]')) {
      const line = stage.querySelector('[data-blend-line]');
      if (!state.letters.length) { stage.querySelector('[data-phonics-status]').textContent = 'Choose some letter dinos first.'; return; }
      const built = blendLetters(state.letters);
      animateBlend(line, state.letters, built, () => {
        if (built === state.current.word) award(state.current.family, `ROAR! ${built} is right. The dinos blended it together!`);
        else stage.querySelector('[data-phonics-status]').textContent = `${built} is a brave try. The clue asks for “${state.current.word}.” Pop apart and try again.`;
      }); return;
    }
    if (event.target.closest('[data-split]')) { splitWord(stage.querySelector('[data-blend-line]')); speech(segmentWord(blendLetters(state.letters)).join(', '), .68); return; }
    if (event.target.closest('[data-new-word]')) { newChallenge(); return; }
    const mix = event.target.closest('[data-mix-word]');
    if (mix) {
      root.querySelectorAll('[data-mix-word]').forEach((button) => button.classList.remove('active'));
      mix.classList.add('active');
      const word = mix.dataset.mixWord;
      root.querySelector('[data-mix-result]').textContent = `${word[0].toUpperCase()} hops in: ${segmentWord(word).join(' · ')} → ${word}!`;
      speech(word); award(word.slice(1), `Great switch! You made ${word}.`); return;
    }
    const sentenceWord = event.target.closest('[data-sentence-word]');
    if (sentenceWord) {
      const word = sentenceWord.dataset.sentenceWord;
      const slot = root.querySelector('[data-sentence-slot]');
      slot.textContent = word; slot.classList.add('filled');
      const sentence = `The tiny dinosaur put a ${word} on its head and danced.`;
      speech(sentence, .82); award('sentence', `You decoded “${word}” in a whole sentence!`); return;
    }
    const anyBlock = event.target.closest('[data-letter]');
    if (anyBlock) speakPhoneme(anyBlock.dataset.letter);
  });

  skillStrip.insertAdjacentHTML('afterend', `<article class="phonics-story"><div><span>LAGOON STORY</span><h3 data-phonics-story-title></h3><p data-phonics-story-copy></p></div><button type="button" data-hear-phonics-story>🎙️ Hear Story</button></article>`);
  const storyTitle = root.querySelector('[data-phonics-story-title]');
  const storyCopy = root.querySelector('[data-phonics-story-copy]');
  function setStory() {
    const item = phonicsStory(state.level);
    storyTitle.textContent = item.title;
    storyCopy.textContent = item.text;
  }
  root.querySelector('[data-hear-phonics-story]').addEventListener('click', () => callbacks.onStory?.(`${storyTitle.textContent}. ${storyCopy.textContent}`));

  updateSkillStrip(); setStory(); renderStage();
  setupDragAndDrop(root, addLetter);
}
