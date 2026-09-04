import { phonicsWorld, worlds } from './worlds.js';
import { initAlphaBlocks } from './alphaBlocks.js';
import { isCorrectAnswer, makeProblem } from './problems.js';
import { session } from './storage.js';
import { playEffect, playWorldRoar, playCorrectCelebration, setSound, unlockAudio } from './audio.js';
import { setupVoices, speakStoryText, stopSpeaking, speechSupported } from './tts.js';
import { confettiColors, effectForWorld } from '../animations/effects.js';

const app = document.querySelector('#app') || (() => {
  const mount = document.createElement('div');
  mount.id = 'app';
  document.body.appendChild(mount);
  return mount;
})();
app.innerHTML = `
  <main class="app">
    <div class="toolbar">
      <div class="session-score" aria-live="polite"><span aria-hidden="true">⭐</span><span id="starCount">0 stars this safari</span></div>
      <div class="tool-group">
        <button class="tool-btn" id="soundToggle" type="button" aria-pressed="true" aria-label="Turn dinosaur roars and effects off"><span class="tool-icon" aria-hidden="true">🔊</span><span>Roars &amp; FX on</span></button>
        <button class="tool-btn" id="storyVoiceToggle" type="button" aria-pressed="true" aria-label="Turn browser story voice off"><span class="tool-icon" aria-hidden="true">🎙️</span><span>Story voice on</span></button>
        <details class="voice-settings"><summary>Voice settings</summary><div class="voice-panel"><strong>Warm browser story voice</strong><p>Slow, clear, and encouraging. Voice is used only when you tap <b>Hear Story</b>.</p><small>The app uses the best English voice available in this browser, so the exact voice varies by device.</small></div></details>
      </div>
    </div>

    <section class="hero" aria-labelledby="heroTitle">
      <div class="hero-copy">
        <span class="eyebrow">Math K–3 + Phonics K–5 · Nine giant worlds</span>
        <h1 id="heroTitle">Stomp into numbers and sounds.</h1>
        <p>Explore eight math worlds or enter Phonics Lagoon, where letter dinos wiggle, speak, hold hands, and blend into words.</p>
        <div class="hero-actions"><button class="primary" id="exploreBtn" type="button">Explore the worlds <span aria-hidden="true">↓</span></button><button class="secondary" id="surpriseBtn" type="button">Surprise me! <span aria-hidden="true">🥚</span></button></div>
      </div>
      <div class="hero-art"><div class="horn-row" aria-hidden="true"><span class="horn"></span><span class="horn"></span></div><button class="hero-dino" type="button" data-sound="roar" aria-label="Tap the T-Rex for a roar"><img class="dino-art" src="assets/images/dinos/trex.svg" alt=""></button><div class="dino-claws" aria-hidden="true"><span class="claw"></span><span class="claw"></span></div><div class="egg-nest" aria-hidden="true"><span class="egg">🥚</span><span class="egg">🥚</span><span class="egg">🥚</span></div></div>
    </section>

    <section class="map-section" id="worlds" aria-labelledby="worldsTitle">
      <div class="section-head"><div><h2 id="worldsTitle">Choose a prehistoric world</h2><p>Each math world generates fresh randomized practice.</p></div><div class="difficulty" aria-label="Choose level"><button type="button" data-difficulty="kindergarten" aria-pressed="true">Kindergarten</button><button type="button" data-difficulty="easy" aria-pressed="false">Grade 1</button><button type="button" data-difficulty="medium" aria-pressed="false">Grade 2</button><button type="button" data-difficulty="hard" aria-pressed="false">Grade 3</button></div></div>
      <details class="kindergarten-guide" id="kindergartenGuide" open><summary>All 21 Kindergarten challenges</summary><ol><li>Count dinos to 10 and count to 20</li><li>Recognize numbers 0–20</li><li>Match one dino to each count</li><li>Trace and write numbers 0–20</li><li>Compare more, less, or equal</li><li>Add dino eggs within 5</li><li>Subtract dinos within 5</li><li>Break apart numbers to 10</li><li>Make 10 with dino friends</li><li>Name 2D shapes</li><li>Sort by color, size, or type</li><li>Continue AB patterns</li><li>Compare length, height, and weight</li><li>Use position words</li><li>Explore 3D shapes</li><li>Count dino stomps by twos to 20</li><li>Put numbers 0–20 in order</li><li>Make equal groups; meet odd and even</li><li>Solve story problems within 10</li><li>Fill ten-frames with dino eggs</li><li>Say Coins: speak numbers 1-10 to flip coins and hear dino roars</li></ol></details>
      <div class="world-map" id="worldMap"></div>
    </section>

    <section class="phonics-world" id="phonicsWorld" aria-live="polite"></section>

    <section class="game" id="game" aria-live="polite">
      <div class="game-head"><div class="world-id"><div class="big-dino" id="gameDino" aria-hidden="true"></div><div><h2 id="gameTitle">Dino Counting Valley</h2><p id="gameSkills"></p></div></div><button class="back-btn" id="backBtn" type="button">← All worlds</button></div>
      <div class="progress-card"><span id="roundLabel">Egg 1 of 4</span><div class="progress-track" aria-hidden="true"><div class="progress-fill" id="progressFill"></div><span class="walker" id="walker">🦕</span></div><span id="roundStars">☆ ☆ ☆ ☆</span></div>
      <div class="play-layout" id="playLayout">
        <article class="story-card" id="storyCard"><div class="story-copy"><div class="story-kicker" id="storyKicker">FIRST, THE DINO CLUE</div><div class="story-heading"><h3 id="storyTitle"></h3><button class="voice-btn" id="storySpeakBtn" type="button" aria-label="Hear this dino story"><span aria-hidden="true">🎙️</span> Hear Story</button></div><p class="story-text" id="storyText"></p><div class="voice-unavailable" id="voiceUnavailable" hidden>Story voice is not available in this browser.</div></div><div class="visual" id="visual"></div><div class="explain-action"><button class="ready-btn" id="readyBtn" type="button">I see it — ask me! →</button></div></article>
        <aside class="quiz-card" aria-labelledby="questionText"><div class="quiz-kicker"><span><span class="q-badge" aria-hidden="true">?</span> Quick dino check</span><span id="skillTag"></span></div><div id="quizWaiting" class="waiting"><div><span class="waiting-icon" aria-hidden="true">🥚</span>Read the dino clue first.<br>The question will hatch when you’re ready!</div></div><div id="quizBody" hidden><h3 class="question" id="questionText"></h3><div class="answers" id="answers"></div><div class="feedback" id="feedback" role="status">Choose the answer you think is right.</div><button class="next-btn" id="nextBtn" type="button" disabled>Next egg →</button></div></aside>
      </div>
      <div class="batch-end" id="batchEnd"><div class="trophy" aria-hidden="true">🏅</div><h3 id="finishTitle">Egg hunt complete!</h3><p id="finishText"></p><button class="more-btn" id="moreBtn" type="button">More Dino Eggs! 🥚</button></div>
    </section>

    <section class="badge-shelf" aria-labelledby="badgesTitle"><h2 id="badgesTitle">Dino badge shelf</h2><div class="badges" id="badges"></div></section>
    <p class="parent-note">Grown-ups: Math builds from counting within 20 to Grade 3 reasoning with numbers below 100. Phonics grows from letter sounds and CVC words to morphology, fluent reading, and comprehension.</p>
  </main>
  <div class="burst" id="burst" aria-hidden="true"></div>`;

const defaultState = {
  world: 0,
  difficulty: 'kindergarten',
  round: 0,
  stars: 0,
  roundCorrect: 0,
  badges: new Set(),
  problem: null,
  answered: false,
  sound: true,
  storyVoice: true
};
const state = Object.assign(defaultState, session?.state && typeof session.state === 'object' ? session.state : {});
const $ = (selector) => document.querySelector(selector);
const worldMap = $('#worldMap');
const game = $('#game');
const phonicsWorldSection = $('#phonicsWorld');
const answers = $('#answers');
const feedback = $('#feedback');
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const dinoImage = (world, decorative = true) => `<img class="dino-art" src="${world.image}" ${decorative ? 'alt=""' : `alt="Friendly ${world.dinoName}"`}>`;

const kindergartenWorldSkills = [
  'Count dinos to 10 and 20 · recognize, match, write, and order numbers 0–20.',
  'Add eggs within 5 · break apart numbers · make 10 · fill ten-frames.',
  'Subtract within 5 · compare groups · solve story problems within 10.',
  'Sort by color, size, and type · continue AB patterns · meet odd and even.',
  'Compare longer, taller, and heavier · use above, below, front, and behind.',
  'Name circles, squares, triangles, rectangles, and hexagons · explore 3D shapes.',
  'Build equal groups · count dino stomps by twos to 20.',
  'Match one dino to one count · reason through number stories and ten-frames.'
];

function renderWorlds() {
  const levelLabel = state.difficulty === 'kindergarten' ? 'Kindergarten' : state.difficulty === 'easy' ? 'Grade 1' : state.difficulty === 'medium' ? 'Grade 2' : 'Grade 3';
  const mathCards = worlds.map((world, index) => `<button class="world" type="button" data-world="${index}" style="--c:${world.color}" aria-label="Open ${world.name} for ${levelLabel}"><div class="world-top"><span class="world-dino" style="animation-delay:${index * 0.12}s">${dinoImage(world)}</span><span class="world-num">${index + 1}</span></div><h3>${world.icon} ${world.name}</h3><p>${state.difficulty === 'kindergarten' ? kindergartenWorldSkills[index] : world.short}</p><div class="world-foot"><span>${levelLabel}</span><span class="world-stars">${session.hasBadge(index) ? '★ Badge' : '∞ practice'}</span></div></button>`).join('');
  const phonicsCard = `<button class="world phonics-entry" type="button" data-phonics-entry style="--c:${phonicsWorld.color}" aria-label="Open ${phonicsWorld.name} for Kindergarten through Grade 5"><div class="world-top"><span class="world-dino alpha-preview" aria-hidden="true"><i>A</i><i>T</i></span><span class="world-num">9</span></div><h3>${phonicsWorld.icon} ${phonicsWorld.name}</h3><p>${phonicsWorld.short}</p><div class="world-foot"><span>K–Grade 5</span><span class="world-stars">★ interactive</span></div></button>`;
  worldMap.innerHTML = mathCards + phonicsCard;
}

function renderBadges() {
  $('#badges').innerHTML = worlds.map((world, index) => `<div class="badge-item ${session.hasBadge(index) ? 'earned' : ''}"><strong>${session.hasBadge(index) ? '🏅' : '🥚'}</strong><span>${world.name.replace(/ (Valley|Volcano|Swamp|Jungle|Mountain|Canyon|Plains|Reef)/, '')}</span></div>`).join('');
}

let coinNumbers = [];
let flippedSet = new Set();
let coinRecognition = null;
let coinRecognitionActive = false;
let coinSpeechWanted = false;
let coinRestartTimer = null;
let coinPrivacyShown = false;

const coinWordNumbers = {
  zero: 0,
  one: 1,
  won: 1,
  two: 2,
  to: 2,
  too: 2,
  three: 3,
  four: 4,
  for: 4,
  fore: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  ate: 8,
  nine: 9,
  ten: 10
};

function updateCoinProgress() {
  const progress = $('#coinProgress');
  if (progress) progress.textContent = `${flippedSet.size} of 10 coins flipped`;
}

function parseCoinNumber(transcript) {
  const source = String(transcript || '').toLowerCase();
  const words = source.match(/[a-z]+|\d+/g) || [];
  const candidates = [];
  words.forEach((word, index) => {
    if (word !== 'number' || !words[index + 1]) return;
    const nextWord = words[index + 1];
    candidates.push(/^\d+$/.test(nextWord) ? Number(nextWord) : coinWordNumbers[nextWord]);
  });
  for (const match of source.matchAll(/\b(10|[1-9])\b/g)) candidates.push(Number(match[1]));
  words.forEach((word) => candidates.push(coinWordNumbers[word]));
  return candidates.find((value) => value >= 1 && value <= 10 && coinNumbers.includes(value) && !flippedSet.has(value)) ?? null;
}

function coinGameIsOpen() {
  return state.problem?.skill === 'Say Coins' && game.classList.contains('active') && flippedSet.size < 10;
}

function setCoinListeningUI(listening) {
  const button = $('#coinMicBtn');
  if (!button) return;
  button.classList.toggle('listening', listening);
  button.setAttribute('aria-pressed', String(listening));
  button.textContent = listening ? '⏹ Stop listening' : '🎙️ Tap to speak';
}

function stopCoinSpeech() {
  const shouldStopRecognition = coinRecognition && (coinRecognitionActive || coinSpeechWanted);
  coinSpeechWanted = false;
  if (coinRestartTimer) {
    window.clearTimeout(coinRestartTimer);
    coinRestartTimer = null;
  }
  if (shouldStopRecognition) {
    try { coinRecognition.stop(); } catch (error) { console.warn('Could not stop coin speech recognition', error); }
  }
  coinRecognitionActive = false;
  setCoinListeningUI(false);
}

function finishCoinGame() {
  if (state.answered) return;
  state.answered = true;
  stopCoinSpeech();
  session.awardStar();
  state.stars = session.state.stars;
  state.roundCorrect = session.state.roundCorrect;
  $('#quizWaiting').hidden = true;
  $('#quizBody').hidden = false;
  $('#readyBtn').disabled = true;
  $('#readyBtn').textContent = 'All coins flipped! 🦖';
  answers.querySelectorAll('button').forEach((button) => { button.disabled = true; });
  feedback.className = 'feedback good';
  feedback.textContent = 'All coins flipped! ROAR!';
  $('#nextBtn').disabled = false;
  $('#nextBtn').textContent = state.round === 3 ? 'See my badge →' : 'Next dino egg →';
  updateProgress();
}

function flipCoin(number, element) {
  if (!coinNumbers.includes(number) || flippedSet.has(number)) return;
  const coin = element || document.querySelector(`.coin[data-number="${number}"]`);
  if (!coin) return;
  unlockAudio();
  flippedSet.add(number);
  coin.classList.add('flipped');
  coin.disabled = true;
  coin.setAttribute('aria-label', `Coin ${number} flipped`);
  const matchingAnswer = answers.querySelector(`[data-answer="${number}"]`);
  if (matchingAnswer) {
    matchingAnswer.classList.add('correct');
    matchingAnswer.disabled = true;
  }
  playWorldRoar(0);
  playCorrectCelebration(0);
  playEffect('pop');
  celebrate();
  updateCoinProgress();
  const status = $('#coinStatus');
  if (status) status.textContent = `Number ${number} flipped! Say another number.`;
  if (flippedSet.size === 10) finishCoinGame();
}

function setupCoinSpeech() {
  const micButton = $('#coinMicBtn');
  const status = $('#coinStatus');
  const privacy = $('#coinPrivacy');
  if (!micButton) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    coinRecognition = null;
    micButton.disabled = true;
    micButton.textContent = '🎙️ Voice unavailable';
    micButton.setAttribute('aria-pressed', 'false');
    if (status) status.textContent = 'Tap coins to flip!';
    return;
  }

  const recognition = new SpeechRecognition();
  coinRecognition = recognition;
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;

  micButton.disabled = false;
  micButton.textContent = '🎙️ Tap to speak';
  micButton.setAttribute('aria-pressed', 'false');
  if (status) status.textContent = 'Tap mic and say a number 1-10!';

  const scheduleRestart = () => {
    if (!coinSpeechWanted || !coinGameIsOpen() || coinRecognition !== recognition) return;
    if (coinRestartTimer) window.clearTimeout(coinRestartTimer);
    coinRestartTimer = window.setTimeout(() => {
      coinRestartTimer = null;
      if (!coinSpeechWanted || !coinGameIsOpen() || coinRecognition !== recognition) return;
      try {
        recognition.start();
        if (status) status.textContent = 'Listening... say 1-10';
      } catch (error) {
        coinSpeechWanted = false;
        setCoinListeningUI(false);
        if (status) status.textContent = 'Mic could not start - tap coins to flip!';
      }
    }, 1000);
  };

  recognition.onstart = () => {
    if (!coinSpeechWanted || coinRecognition !== recognition) {
      try { recognition.stop(); } catch (error) { console.warn('Could not cancel coin speech recognition', error); }
      return;
    }
    coinRecognitionActive = true;
    setCoinListeningUI(true);
  };

  recognition.onresult = (event) => {
    let matchedNumber = null;
    let heard = '';
    for (let resultIndex = event.resultIndex || 0; resultIndex < event.results.length && matchedNumber === null; resultIndex += 1) {
      const result = event.results[resultIndex];
      const alternativeCount = Math.min(result.length, recognition.maxAlternatives);
      for (let alternativeIndex = 0; alternativeIndex < alternativeCount; alternativeIndex += 1) {
        const transcript = result[alternativeIndex]?.transcript?.trim() || '';
        if (!heard && transcript) heard = transcript;
        const number = parseCoinNumber(transcript);
        if (number !== null && coinNumbers.includes(number) && !flippedSet.has(number)) {
          matchedNumber = number;
          break;
        }
      }
    }

    if (matchedNumber !== null) {
      flipCoin(matchedNumber);
      if (status) status.textContent = `You said ${matchedNumber}! Flipped! 🦖`;
    } else if (status) {
      status.textContent = `I heard '${heard || 'something else'}' - try saying 1-10`;
    }
  };

  recognition.onerror = (event) => {
    coinRecognitionActive = false;
    const permissionDenied = ['not-allowed', 'service-not-allowed', 'permission-denied'].includes(event.error);
    if (permissionDenied) {
      coinSpeechWanted = false;
      setCoinListeningUI(false);
      if (status) status.textContent = 'Mic blocked - tap coins to flip!';
    } else if (event.error === 'audio-capture') {
      coinSpeechWanted = false;
      setCoinListeningUI(false);
      if (status) status.textContent = 'Mic unavailable - tap coins to flip!';
    } else if (event.error !== 'aborted' && status) {
      status.textContent = event.error === 'no-speech'
        ? 'I did not hear a number - try saying 1-10'
        : 'Could not hear that - try saying 1-10';
    }
  };

  recognition.onend = () => {
    coinRecognitionActive = false;
    scheduleRestart();
  };

  micButton.addEventListener('click', () => {
    if (coinSpeechWanted) {
      stopCoinSpeech();
      if (status) status.textContent = 'Listening stopped. Tap mic or tap a coin!';
      return;
    }
    unlockAudio();
    coinSpeechWanted = true;
    setCoinListeningUI(true);
    if (!coinPrivacyShown && privacy) {
      privacy.hidden = false;
      coinPrivacyShown = true;
    }
    if (status) status.textContent = 'Listening... say 1-10';
    try {
      recognition.start();
    } catch (error) {
      coinSpeechWanted = false;
      setCoinListeningUI(false);
      if (status) status.textContent = 'Mic could not start - tap coins to flip!';
    }
  });
}

function initCoinGame() {
  const grid = $('#coinGrid');
  if (!grid) return;
  stopCoinSpeech();
  coinNumbers = Array.from({ length: 10 }, (_, index) => index + 1).sort(() => Math.random() - 0.5);
  flippedSet = new Set();
  coinPrivacyShown = false;
  grid.innerHTML = coinNumbers.map((number) => `<button class="coin" type="button" data-number="${number}" aria-label="Flip coin ${number}"><span>${number}</span></button>`).join('');
  grid.querySelectorAll('.coin').forEach((coin) => coin.addEventListener('click', () => flipCoin(Number(coin.dataset.number), coin)));
  updateCoinProgress();
  setupCoinSpeech();
}

function openPhonics() {
  stopSpeaking();
  stopCoinSpeech();
  game.classList.remove('active');
  phonicsWorldSection.classList.add('active');
  initAlphaBlocks(phonicsWorldSection, {
    onBack: () => { phonicsWorldSection.classList.remove('active'); $('#worlds').scrollIntoView({ behavior: 'smooth', block: 'start' }); },
    onStory: (text) => { if (state.storyVoice) speakStoryText(text); },
    onStar: () => { state.stars += 1; updateProgress(); },
    onRoar: () => { playCorrectCelebration(2); celebrate(); }
  });
  phonicsWorldSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  playEffect('pop');
}

function openWorld(index) {
  stopSpeaking();
  stopCoinSpeech();
  phonicsWorldSection.classList.remove('active');
  state.world = index;
  session.resetRound();
  const world = worlds[index];
  document.documentElement.style.setProperty('--world', world.color);
  $('#gameDino').innerHTML = dinoImage(world);
  $('#gameTitle').textContent = world.name;
  $('#gameSkills').textContent = `${state.difficulty === 'kindergarten' ? '21 Kindergarten math challenges' : world.skills} · ${world.roar}`;
  game.classList.add('active');
  $('#playLayout').style.display = 'grid';
  $('#batchEnd').classList.remove('active');
  newProblem();
  game.scrollIntoView({ behavior: 'smooth', block: 'start' });
  playEffect('pop');
}

function newProblem() {
  stopSpeaking();
  stopCoinSpeech();
  state.problem = makeProblem(state.world, state.difficulty);
  state.answered = false;
  const current = state.problem;
  $('#storyKicker').textContent = `FIRST, THE DINO CLUE · ${current.skill.toUpperCase()}`;
  $('#storyTitle').textContent = current.title;
  $('#storyText').textContent = current.teach;
  $('#visual').innerHTML = current.visual;
  $('#skillTag').textContent = current.skill;
  $('#questionText').textContent = current.question;
  answers.innerHTML = current.options.map((answer) => `<button class="answer" type="button" data-answer="${answer}">${answer}</button>`).join('');
  feedback.className = 'feedback';
  feedback.textContent = 'Choose the answer you think is right.';
  $('#nextBtn').disabled = true;
  $('#quizWaiting').hidden = false;
  $('#quizBody').hidden = true;
  $('#readyBtn').disabled = false;
  $('#readyBtn').textContent = 'I see it — ask me! →';
  updateProgress();
  restartStoryAnimation();
  if ($('#coinGrid')) initCoinGame();
}

function restartStoryAnimation() {
  const card = $('#storyCard');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = 'pageIn .42s ease both';
}

function updateProgress() {
  const percentage = (state.round / 4) * 100;
  $('#roundLabel').textContent = `Egg ${Math.min(state.round + 1, 4)} of 4`;
  $('#progressFill').style.width = `${percentage}%`;
  $('#walker').style.left = `${percentage}%`;
  $('#roundStars').textContent = Array.from({ length: 4 }, (_, index) => index < state.roundCorrect ? '★' : '☆').join(' ');
  $('#starCount').textContent = `${state.stars} star${state.stars === 1 ? '' : 's'} this safari`;
}

function revealQuestion() {
  $('#quizWaiting').hidden = true;
  $('#quizBody').hidden = false;
  $('#readyBtn').disabled = true;
  $('#readyBtn').textContent = 'Question hatched! 🐣';
  playEffect('crack');
  $('#quizBody').style.animation = 'pageIn .35s ease both';
  if (innerWidth < 900) $('#quizBody').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function answerQuestion(button) {
  if (state.answered) return;
  unlockAudio();
  if (state.problem?.skill === 'Say Coins') {
    flipCoin(Number(button.dataset.answer));
    return;
  }
  const correct = isCorrectAnswer(state.problem, button.dataset.answer);
  if (correct) {
    state.answered = true;
    button.classList.add('correct');
    answers.querySelectorAll('button').forEach((answerButton) => { answerButton.disabled = true; });
    feedback.className = 'feedback good';
    feedback.textContent = `Roar-some! ${state.problem.correct} is right. You earned a star!`;
    session.awardStar();
    $('#nextBtn').disabled = false;
    $('#nextBtn').textContent = state.round === 3 ? 'See my badge →' : 'Next dino egg →';
    playCorrectCelebration(state.world);
    celebrate();
    worldEffect();
    updateProgress();
  } else {
    button.classList.add('wrong');
    feedback.className = 'feedback try';
    feedback.textContent = 'Good thinking. Use the clue and try a different answer.';
    playEffect('wrong');
    setTimeout(() => button.classList.remove('wrong'), 520);
  }
}

function next() {
  stopSpeaking();
  stopCoinSpeech();
  state.round += 1;
  if (state.round >= 4) finishBatch();
  else newProblem();
}

function finishBatch() {
  const earned = state.roundCorrect >= 3;
  if (earned) session.awardBadge(state.world);
  $('#playLayout').style.display = 'none';
  $('#batchEnd').classList.add('active');
  $('#finishTitle').textContent = earned ? 'New dino badge earned!' : 'Egg hunt complete!';
  $('#finishText').textContent = `You solved ${state.roundCorrect} of 4 on this hunt. ${earned ? 'Your badge is on the shelf. Keep exploring!' : 'Try another hunt — every new egg is more practice.'}`;
  $('#progressFill').style.width = '100%';
  $('#walker').style.left = '100%';
  $('#roundLabel').textContent = '4 eggs explored';
  renderWorlds();
  renderBadges();
  playEffect(earned ? 'confetti' : 'correct');
  if (earned) celebrate();
  $('#batchEnd').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function more() {
  stopSpeaking();
  stopCoinSpeech();
  session.resetRound();
  $('#batchEnd').classList.remove('active');
  $('#playLayout').style.display = 'grid';
  newProblem();
  game.scrollIntoView({ behavior: 'smooth', block: 'start' });
  playEffect('crack');
}

function celebrate() {
  const box = $('#burst');
  box.innerHTML = Array.from({ length: 30 }, (_, index) => `<i style="left:${Math.random() * 100}%;background:${confettiColors[index % confettiColors.length]};animation-delay:${Math.random() * 0.28}s"></i>`).join('');
  setTimeout(() => { box.innerHTML = ''; }, 1700);
}

function worldEffect() {
  const visual = $('#visual');
  const effect = effectForWorld(state.world, worlds[state.world].dino);
  const element = document.createElement('div');
  element.className = `fx ${effect.className}`;
  element.textContent = effect.symbol;
  visual.appendChild(element);
  setTimeout(() => element.remove(), 900);
}

function speakStory() {
  if (!state.problem || !state.storyVoice) return;
  speakStoryText(state.problem.title);
}

function setStoryVoice(on) {
  state.storyVoice = on;
  const button = $('#storyVoiceToggle');
  button.setAttribute('aria-pressed', String(on));
  button.setAttribute('aria-label', on ? 'Turn browser story voice off' : 'Turn browser story voice on');
  button.querySelector('.tool-icon').textContent = on ? '🎙️' : '🔇';
  button.querySelector('span:last-child').textContent = on ? 'Story voice on' : 'Story voice off';
  $('#storySpeakBtn').disabled = !on || !speechSupported;
  if (!on) stopSpeaking();
}

function tapDino(button) {
  playWorldRoar(1);
  button.style.animation = 'none';
  void button.offsetWidth;
  button.style.animation = 'roar .75s ease';
  const pop = document.createElement('span');
  pop.className = 'sound-pop';
  pop.textContent = 'ROAAR!';
  button.appendChild(pop);
  setTimeout(() => { pop.remove(); button.style.animation = ''; }, 780);
}

worldMap.addEventListener('click', (event) => {
  if (event.target.closest('[data-phonics-entry]')) { openPhonics(); return; }
  const button = event.target.closest('[data-world]');
  if (button) openWorld(Number(button.dataset.world));
});

document.addEventListener('click', (event) => {
  const answer = event.target.closest('.answer');
  if (answer) { answerQuestion(answer); return; }
  const dino = event.target.closest('[data-sound]');
  if (dino) tapDino(dino);
});

document.querySelectorAll('[data-difficulty]').forEach((button) => button.addEventListener('click', () => {
  state.difficulty = button.dataset.difficulty;
  $('#kindergartenGuide').hidden = state.difficulty !== 'kindergarten';
  document.querySelectorAll('[data-difficulty]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  renderWorlds();
  playEffect('pop');
  if (game.classList.contains('active')) {
    session.resetRound();
    $('#batchEnd').classList.remove('active');
    $('#playLayout').style.display = 'grid';
    newProblem();
  }
}));

$('#readyBtn').addEventListener('click', revealQuestion);
$('#storySpeakBtn').addEventListener('click', speakStory);
$('#storyVoiceToggle').addEventListener('click', () => setStoryVoice(!state.storyVoice));
$('#nextBtn').addEventListener('click', next);
$('#moreBtn').addEventListener('click', more);
$('#backBtn').addEventListener('click', () => { stopSpeaking(); stopCoinSpeech(); $('#worlds').scrollIntoView({ behavior: 'smooth', block: 'start' }); playEffect('pop'); });
$('#exploreBtn').addEventListener('click', () => $('#worlds').scrollIntoView({ behavior: 'smooth', block: 'start' }));
$('#surpriseBtn').addEventListener('click', () => openWorld(rand(0, worlds.length - 1)));
$('#soundToggle').addEventListener('click', (event) => {
  state.sound = !state.sound;
  const button = event.currentTarget;
  button.setAttribute('aria-pressed', String(state.sound));
  button.setAttribute('aria-label', state.sound ? 'Turn dinosaur roars and effects off' : 'Turn dinosaur roars and effects on');
  button.querySelector('.tool-icon').textContent = state.sound ? '🔊' : '🔇';
  button.querySelector('span:last-child').textContent = state.sound ? 'Roars & FX on' : 'Roars & FX off';
  setSound(state.sound);
});
if (!setupVoices()) {
  $('#storyVoiceToggle').disabled = true;
  $('#storySpeakBtn').disabled = true;
  $('#voiceUnavailable').hidden = false;
}
$('#kindergartenGuide').hidden = state.difficulty !== 'kindergarten';
renderWorlds();
renderBadges();
