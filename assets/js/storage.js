// Session-only progress. It intentionally resets on reload because this static app has no durable backend.
const progress = {
  world: 0,
  difficulty: 'easy',
  round: 0,
  stars: 0,
  roundCorrect: 0,
  badges: new Set(),
  problem: null,
  answered: false,
  sound: true,
  jungle: false,
  readAloud: false
};

export const session = {
  get state() { return progress; },
  resetRound() { progress.round = 0; progress.roundCorrect = 0; progress.answered = false; },
  awardStar() { progress.stars += 1; progress.roundCorrect += 1; },
  awardBadge(worldIndex) { progress.badges.add(worldIndex); },
  hasBadge(worldIndex) { return progress.badges.has(worldIndex); }
};
