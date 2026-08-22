export const confettiColors = ['#f47e60', '#ffd65a', '#58bed0', '#79c966', '#8d74c9'];

export function effectForWorld(worldIndex, dinoEmoji) {
  if (worldIndex === 1) return { className: 'erupt', symbol: '🌋' };
  if (worldIndex === 2 || worldIndex === 7) return { className: 'splash', symbol: '💦' };
  return { className: 'roar', symbol: dinoEmoji };
}
