import { worlds } from './worlds.js';
import { makeProblem } from './problems.js';
import { session } from './storage.js';
import { playEffect, playWorldRoar, playCelebration, setBeats, setSound } from './audio.js';
import { setupVoices, speak, stopSpeaking, speechSupported } from './tts.js';
import { confettiColors, effectForWorld } from '../animations/effects.js';

const app = document.querySelector('#app');
app.innerHTML = `
  <main class="app">
    <div class="toolbar">
      <div class="session-score" aria-live="polite"><span aria-hidden="true">⭐</span><span id="starCount">0 stars this safari</span></div>
      <div class="tool-group">
        <button class="tool-btn" id="jungleToggle" type="button" aria-pressed="false" aria-label="Turn dino beats on"><span class="tool-icon" aria-hidden="true">🦴</span><span>Dino beats off</span></button>
        <button class="tool-btn" id="soundToggle" type="button" aria-pressed="true" aria-label="Turn sounds off"><span class="tool-icon" aria-hidden="true">🔊</span><span>Sounds on</span></button>
        <button class="tool-btn" id="readToggle" type="button" aria-pressed="false" aria-label="Turn read aloud on"><span class="tool-icon" aria-hidden="true">🔊</span><span>Read Aloud</span></button>
      </div>
    </div>

    <section class="hero" aria-labelledby="heroTitle">
      <div class="hero-copy">
        <span class="eyebrow">Grades 1–3 · Eight giant worlds</span>
        <h1 id="heroTitle">Your dino math adventure keeps growing.</h1>
        <p>Hear a dinosaur story, discover the math clue, then tackle a quick four-question egg hunt. Every visit creates new challenges.</p>
        <div class="hero-actions"><button class="primary" id="exploreBtn" type="button">Explore the worlds <span aria-hidden="true">↓</span></button><button class="secondary" id="surpriseBtn" type="button">Surprise me! <span aria-hidden="true">🥚</span></button></div>
      </div>
      <div class="hero-art"><div class="horn-row" aria-hidden="true"><span class="horn"></span><span class="horn"></span></div><button class="hero-dino" type="button" data-sound="roar" aria-label="Tap the T-Rex for a roar"><img class="dino-art" src="assets/images/dinos/trex.svg" alt=""></button><div class="dino-claws" aria-hidden="true"><span class="claw"></span><span class="claw"></span></div><div class="egg-nest" aria-hidden="true"><span class="egg">🥚</span><span class="egg">🥚</span><span class="egg">🥚</span></div></div>
    </section>

    <section class="map-section" id="worlds" aria-labelledby="worldsTitle">
      <div class="section-head"><div><h2 id="worldsTitle">Choose a dino world</h2><p>Each world makes unlimited new stories and questions.</p></div><div class="difficulty" aria-label="Choose difficulty"><button type="button" data-difficulty="easy" aria-pressed="true">Easy · Grade 1</button><button type="button" data-difficulty="medium" aria-pressed="false">Medium · Grade 2</button><button type="button" data-difficulty="hard" aria-pressed="false">Hard · Grade 3</button></div></div>
      <div class="world-map" id="worldMap"></div>
    </section>

    <section class="game" id="game" aria-live="polite">
      <div class="game-head"><div class="world-id"><div class="big-dino" id="gameDino" aria-hidden="true"></div><div><h2 id="gameTitle">Dino Counting Valley</h2><p id="gameSkills"></p></div></div><button class="back-btn" id="backBtn" type="button">← All worlds</button></div>
      <div class="progress-card"><span id="roundLabel">Egg 1 of 4</span><div class="progress-track" aria-hidden="true"><div class="progress-fill" id="progressFill"></div><span class="walker" id="walker">🦕</span></div><span id="roundStars">☆ ☆ ☆ ☆</span></div>
      <div class="play-layout" id="playLayout">
        <article class="story-card" id="storyCard"><div class="story-copy"><div class="story-kicker" id="storyKicker">FIRST, THE DINO CLUE</div><h3 id="storyTitle"></h3><div class="story-voice-row"><p class="story-text" id="storyText"></p><button class="voice-btn" id="storySpeakBtn" type="button" aria-label="Hear the dino story"><span aria-hidden="true">🎙️</span> Hear Story</button></div><div class="voice-unavailable" id="voiceUnavailable" hidden>Voice reading is not available in this browser.</div></div><div class="visual" id="visual"></div><div class="explain-action"><button class="ready-btn" id="readyBtn" type="button">I see it — ask me! →</button></div></article>
        <aside class="quiz-card" aria-labelledby="questionText"><div class="quiz-kicker"><span><span class="q-badge" aria-hidden="true">?</span> Quick dino check</span><span id="skillTag"></span></div><div id="quizWaiting" class="waiting"><div><span class="waiting-icon" aria-hidden="true">🥚</span>Read the dino clue first.<br>The question will hatch when you’re ready!</div></div><div id="quizBody" hidden><div class="question-row"><h3 class="question" id="questionText"></h3><button class="speak-btn" id="questionSpeakBtn" type="button" aria-label="Hear the question again">🔊</button></div><div class="answers" id="answers"></div><div class="feedback" id="feedback" role="status">Choose the answer you think is right.</div><button class="next-btn" id="nextBtn" type="button" disabled>Next egg →</button></div></aside>
      </div>
      <div class="batch-end" id="batchEnd"><div class="trophy" aria-hidden="true">🏅</div><h3 id="finishTitle">Egg hunt complete!</h3><p id="finishText"></p><button class="more-btn" id="moreBtn" type="button">More Dino Eggs! 🥚</button></div>
    </section>

    <section class="badge-shelf" aria-labelledby="badgesTitle"><h2 id="badgesTitle">Dino badge shelf</h2><div class="badges" id="badges"></div></section>
    <p class="parent-note">Grown-ups: Easy uses 0–20, Medium 0–50, and Hard 0–99. Stars and badges last only while this page stays open.</p>
  </main>
  <div class="burst" id="burst" aria-hidden="true"></div>`;

const state = session.state;
const $ = (selector) => document.querySelector(selector);
const worldMap = $('#worldMap');
const game = $('#game');
const answers = $('#answers');
const feedback = $('#feedback');
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const dinoImage = (world, decorative = true) => `<img class="dino-art" src="${world.image}" ${decorative ? 'alt=""' : `alt="Friendly ${world.dinoName}"`}>`;

function renderWorlds() {
  worldMap.innerHTML = worlds.map((world, index) => `<button class="world" type="button" data-world="${index}" style="--c:${world.color}" aria-label="Open ${world.name}"><div class="world-top"><span class="world-dino" style="animation-delay:${index * 0.12}s">${dinoImage(world)}</span><span class="world-num">${index + 1}</span></div><h3>${world.icon} ${world.name}</h3><p>${world.short}</p><div class="world-foot"><span>${world.grades}</span><span class="world-stars">${session.hasBadge(index) ? '★ Badge' : '∞ practice'}</span></div></button>`).join('');
}

function renderBadges() {
  $('#badges').innerHTML = worlds.map((world, index) => `<div class="badge-item ${session.hasBadge(index) ? 'earned' : ''}"><strong>${session.hasBadge(index) ? '🏅' : '🥚'}</strong><span>${world.name.replace(/ (Valley|Volcano|Swamp|Jungle|Mountain|Canyon|Plains|Reef)/, '')}</span></div>`).join('');
}

function openWorld(index) {
  state.world = index;
  session.resetRound();
  const world = worlds[index];
  document.documentElement.style.setProperty('--world', world.color);
  $('#gameDino').innerHTML = dinoImage(world);
  $('#gameTitle').textContent = world.name;
  $('#gameSkills').textContent = `${world.skills} · ${world.roar}`;
  game.classList.add('active');
  $('#playLayout').style.display = 'grid';
  $('#batchEnd').classList.remove('active');
  newProblem();
  game.scrollIntoView({ behavior: 'smooth', block: 'start' });
  playEffect('pop');
}

function newProblem() {
  state.problem = makeProblem(state.world, state.difficulty);
  state.answered = false;
  const current = state.problem;
  $('#storyKicker').textContent = `FIRST, THE DINO CLUE · ${current.skill.toUpperCase()}`;
  $('#storyTitle').textContent = current.title;
  $('#storyText').textContent = current.teach;
  $('#visual').innerHTML = current.visual;
  $('#skillTag').textContent = current.skill;
  $('#questionText').textContent = current.question;
  answers.innerHTML = current.options.map((answer, index) => `<div class="answer-item"><button class="answer" type="button" data-answer="${answer}">${answer}</button><button class="speak-btn" type="button" data-speak-answer="${index}" aria-label="Hear answer ${answer}">🔊</button></div>`).join('');
  feedback.className = 'feedback';
  feedback.textContent = 'Choose the answer you think is right.';
  $('#nextBtn').disabled = true;
  $('#quizWaiting').hidden = false;
  $('#quizBody').hidden = true;
  $('#readyBtn').disabled = false;
  $('#readyBtn').textContent = 'I see it — ask me! →';
  updateProgress();
  restartStoryAnimation();
  if (state.readAloud) setTimeout(speakStory, 180);
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
  if (state.readAloud) setTimeout(speakQuestionAndAnswers, 220);
  if (innerWidth < 900) $('#quizBody').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function answerQuestion(button) {
  if (state.answered) return;
  const correct = button.dataset.answer === state.problem.correct;
  if (correct) {
    state.answered = true;
    button.classList.add('correct');
    answers.querySelectorAll('button').forEach((answerButton) => { answerButton.disabled = true; });
    feedback.className = 'feedback good';
    feedback.textContent = `Roar-some! ${state.problem.correct} is right. You earned a star!`;
    session.awardStar();
    $('#nextBtn').disabled = false;
    $('#nextBtn').textContent = state.round === 3 ? 'See my badge →' : 'Next dino egg →';
    playWorldRoar(state.world);
    playCelebration(state.world);
    celebrate();
    worldEffect();
    updateProgress();
    if (state.readAloud) setTimeout(() => speak(`Correct! ${state.problem.question} The answer is ${state.problem.correct}!`), 650);
  } else {
    button.classList.add('wrong');
    feedback.className = 'feedback try';
    feedback.textContent = 'Good thinking. Use the clue and try a different answer.';
    playEffect('wrong');
    if (state.readAloud) setTimeout(() => speak('Good thinking. Use the clue and try a different answer.'), 180);
    setTimeout(() => button.classList.remove('wrong'), 520);
  }
}

function next() {
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
  if (!state.problem) return;
  speak(`${worlds[state.world].name}. ${state.problem.title} ${state.problem.teach}`);
}

function speakQuestionAndAnswers() {
  if (!state.problem) return;
  speak(`${state.problem.question} The answer choices are: ${state.problem.options.join('. Or, ')}.`);
}

function setReadAloud(on) {
  state.readAloud = on;
  const button = $('#readToggle');
  button.setAttribute('aria-pressed', String(on));
  button.setAttribute('aria-label', on ? 'Turn read aloud off' : 'Turn read aloud on');
  button.querySelector('span:last-child').textContent = on ? 'Read Aloud on' : 'Read Aloud';
  if (!speechSupported) { $('#voiceUnavailable').hidden = false; button.disabled = true; return; }
  if (!on) { stopSpeaking(); return; }
  if (game.classList.contains('active')) $('#quizBody').hidden ? speakStory() : speakQuestionAndAnswers();
  else speak('Read aloud is on. Choose a dino world to begin!');
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
  const button = event.target.closest('[data-world]');
  if (button) openWorld(Number(button.dataset.world));
});

document.addEventListener('click', (event) => {
  const speaker = event.target.closest('[data-speak-answer]');
  if (speaker) { speak(`Answer ${Number(speaker.dataset.speakAnswer) + 1}: ${state.problem.options[Number(speaker.dataset.speakAnswer)]}`); return; }
  const answer = event.target.closest('.answer');
  if (answer) { answerQuestion(answer); return; }
  const dino = event.target.closest('[data-sound]');
  if (dino) tapDino(dino);
});

document.querySelectorAll('[data-difficulty]').forEach((button) => button.addEventListener('click', () => {
  state.difficulty = button.dataset.difficulty;
  document.querySelectorAll('[data-difficulty]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
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
$('#questionSpeakBtn').addEventListener('click', speakQuestionAndAnswers);
$('#readToggle').addEventListener('click', () => setReadAloud(!state.readAloud));
$('#nextBtn').addEventListener('click', next);
$('#moreBtn').addEventListener('click', more);
$('#backBtn').addEventListener('click', () => { $('#worlds').scrollIntoView({ behavior: 'smooth', block: 'start' }); playEffect('pop'); });
$('#exploreBtn').addEventListener('click', () => $('#worlds').scrollIntoView({ behavior: 'smooth', block: 'start' }));
$('#surpriseBtn').addEventListener('click', () => openWorld(rand(0, 7)));
$('#soundToggle').addEventListener('click', (event) => {
  state.sound = !state.sound;
  const button = event.currentTarget;
  button.setAttribute('aria-pressed', String(state.sound));
  button.setAttribute('aria-label', state.sound ? 'Turn sounds off' : 'Turn sounds on');
  button.querySelector('.tool-icon').textContent = state.sound ? '🔊' : '🔇';
  button.querySelector('span:last-child').textContent = state.sound ? 'Sounds on' : 'Sounds off';
  setSound(state.sound);
});
$('#jungleToggle').addEventListener('click', () => {
  state.jungle = !state.jungle;
  const button = $('#jungleToggle');
  button.setAttribute('aria-pressed', String(state.jungle));
  button.setAttribute('aria-label', state.jungle ? 'Turn dino beats off' : 'Turn dino beats on');
  button.querySelector('span:last-child').textContent = state.jungle ? 'Dino beats on' : 'Dino beats off';
  setBeats(state.jungle);
});

if (!setupVoices()) {
  $('#readToggle').disabled = true;
  $('#voiceUnavailable').hidden = false;
}
renderWorlds();
renderBadges();
