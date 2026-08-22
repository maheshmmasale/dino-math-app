import { limits } from './worlds.js';
import { story } from './stories.js';

const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (items) => items[rand(0, items.length - 1)];
const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const row = (items) => `<div class="visual-row">${items.join('')}</div>`;
const token = (value) => `<span class="math-token">${value}</span>`;
const emoji = (value, count = 1) => Array.from({ length: count }, () => `<span class="visual-emoji">${value}</span>`).join('');
const maxForLevel = (level) => [20, 50, 99][level - 1];

function optionSet(correct, others, difficulty) {
  const limit = limits[difficulty];
  const number = Number(correct);
  const numeric = Number.isFinite(number);
  let pool = numeric ? others.filter((value) => Number(value) >= 0 && Number(value) <= limit) : others;
  const values = [String(correct), ...pool.map(String)].filter((value, index, all) => all.indexOf(value) === index);
  while (values.length < 4) {
    const next = numeric ? rand(0, limit) : pick(['Not enough clues', 'Both', 'Neither', 'It stays the same']);
    if (!values.includes(String(next))) values.push(String(next));
  }
  return shuffle(values.slice(0, 4));
}

function numberOptions(number, difficulty, step = 1) {
  const limit = limits[difficulty];
  return optionSet(number, [number - step, number + step, number + step * 2].filter((value) => value >= 0 && value <= limit), difficulty);
}

function problem(narrative, question, correct, options, visual, skill) {
  return { ...narrative, question, correct: String(correct), options: options.map(String), visual, skill };
}

function counting(level, difficulty) {
  const max = maxForLevel(level);
  const type = pick(level === 1 ? ['count', 'skip', 'place', 'compare'] : ['skip', 'place', 'compare']);
  if (type === 'count') {
    const n = rand(5, Math.min(14, max));
    return problem(story('count', { n }), 'How many claw-casts did Bindi find?', n, numberOptions(n, difficulty), row([emoji('🖐️', n)]), 'Count objects');
  }
  if (type === 'skip') {
    const choices = [2, 3, 4, 5, 6, 10].filter((value) => value * 3 <= max);
    const step = pick(level === 1 ? choices.filter((value) => [2, 5].includes(value)) : choices);
    const start = step * rand(0, Math.max(0, Math.floor(max / step) - 3));
    const answer = start + step * 3;
    return problem(story('skip', { step, start, a: start + step, b: start + step * 2 }), 'What number comes next?', answer, numberOptions(answer, difficulty, step), row([token(start), token(start + step), token(start + step * 2), token('?')]), `Count by ${step}s`);
  }
  if (type === 'place') {
    const n = rand(10, max);
    const answer = Math.floor(n / 10) % 10;
    return problem(story('place', { n }), `Which digit is in the tens place of ${n}?`, answer, optionSet(answer, [n % 10, Math.max(0, answer - 1), Math.min(9, answer + 1)], difficulty), row([token(n), emoji('🥚')]), 'Place value');
  }
  let a = rand(0, max), b = rand(0, max);
  while (b === a) b = rand(0, max);
  const answer = Math.max(a, b);
  return problem(story('compare', { a, b }), 'Which number is greater?', answer, optionSet(answer, [Math.min(a, b), Math.abs(a - b), Math.min(max, answer + 1)], difficulty), row([token(a), token('or'), token(b)]), 'Compare numbers');
}

function addition(level, difficulty) {
  const max = maxForLevel(level);
  const a = rand(0, max - 1), b = rand(1, max - a), sum = a + b;
  if (pick(['story', 'missing', 'equation']) === 'missing') {
    return problem(story('addMissing', { a, sum }), `What number makes ${a} + ? = ${sum}?`, b, numberOptions(b, difficulty), row([emoji('🍪', Math.min(a, 8)), token('+ ?'), token('='), token(sum)]), 'Missing addend');
  }
  return problem(story('add', { a, b }), 'How many dino-cookies are there now?', sum, numberOptions(sum, difficulty, level === 1 ? 1 : 5), row([token(a), token('+'), token(b), emoji('🦖')]), level === 1 ? 'Add within 20' : level === 2 ? 'Add within 50' : 'Add within 99');
}

function subtraction(level, difficulty) {
  const max = maxForLevel(level);
  const a = rand(1, max), b = rand(0, a), answer = a - b;
  if (pick(['story', 'missing']) === 'missing') {
    const total = a, remain = b, taken = total - remain;
    return problem(story('subtractMissing', { total, remain }), 'How many horn rings rolled away?', taken, numberOptions(taken, difficulty, level === 1 ? 1 : 5), row([token(total), token('− ?'), token('='), token(remain), emoji('📯')]), 'Missing number');
  }
  return problem(story('subtract', { a, b }), 'How many bones remain?', answer, numberOptions(answer, difficulty, level === 1 ? 1 : 5), row([token(a), token('−'), token(b), emoji('🦴')]), level === 1 ? 'Subtract within 20' : level === 2 ? 'Subtract within 50' : 'Subtract within 99');
}

function patterns(level, difficulty) {
  const max = maxForLevel(level);
  const type = pick(['sequence', 'parity', 'repeat']);
  if (type === 'parity') {
    const n = rand(2, max);
    return problem(story('parity', { n }), `Is ${n} odd or even?`, n % 2 ? 'Odd' : 'Even', shuffle(['Odd', 'Even', 'Both', 'Neither']), row([token(n), emoji('🐾', Math.min(n, 8))]), 'Odd or even');
  }
  if (type === 'repeat') {
    const sequence = pick([['🦴', '🥚'], ['🖐️', '🖐️', '🦷'], ['🐾', '📯', '📯']]);
    return problem(story('repeat'), 'What comes next?', sequence[0], shuffle([sequence[0], '🖐️', '🥚', '🦴', '📯'].filter((value, index, all) => all.indexOf(value) === index).slice(0, 4)), row([...sequence, ...sequence].map(token).concat(token('?'))), 'Repeating pattern');
  }
  const possible = [2, 3, 4, 5, 6, 7, 9, 10].filter((value) => value * 4 <= max);
  const step = pick(level === 1 ? possible.filter((value) => [2, 5].includes(value)) : possible);
  const start = step * rand(0, Math.max(0, Math.floor(max / step) - 4));
  const answer = start + step * 4;
  return problem(story('sequence', { step }), `Complete: ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, ?`, answer, numberOptions(answer, difficulty, step), row([token(start), token(start + step), token(start + step * 2), token(start + step * 3), token('?')]), 'Number pattern');
}

function measure(level, difficulty) {
  const max = maxForLevel(level);
  const type = pick(['time', 'money', 'length']);
  if (type === 'time') {
    const hour = rand(1, 11), minutes = pick(level === 1 ? [0, 30] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
    const label = `${hour}:${String(minutes).padStart(2, '0')}`;
    const options = shuffle([label, `${(hour % 12) + 1}:${String(minutes).padStart(2, '0')}`, `${hour}:${String((minutes + 30) % 60).padStart(2, '0')}`, `${minutes || 12}:${String(hour * 5 % 60).padStart(2, '0')}`]);
    return problem(story('time', { label }), 'What time does the clock show?', label, options, `<div class="clock" style="--hour:${hour * 30 + minutes / 2}deg;--minute:${minutes * 6}deg"><span class="hand hour"></span><span class="hand minute"></span><span class="clock-dot"></span></div>`, 'Tell time');
  }
  if (type === 'money') {
    const coinA = level === 1 ? 5 : 25, coinB = level === 1 ? 1 : 10;
    const q = rand(1, Math.max(1, Math.floor(max / coinA))), room = Math.max(0, max - q * coinA), d = rand(0, Math.floor(room / coinB)), answer = q * coinA + d * coinB;
    return problem(story('money', { q, coinA, d, coinB }), 'How much money is that?', `${answer}¢`, optionSet(`${answer}¢`, [`${Math.min(max, answer + coinB)}¢`, `${Math.max(0, answer - coinB)}¢`, `${q + d}¢`], difficulty), row([token(`${q} × ${coinA}¢`), token('+'), token(`${d} × ${coinB}¢`)]), 'Count money');
  }
  const a = rand(1, max), b = rand(1, max), unit = pick(['cm', 'in']), answer = Math.abs(a - b);
  return problem(story('length', { a, b, unit }), 'How much longer is the longer track?', `${answer} ${unit}`, optionSet(`${answer} ${unit}`, [`${Math.min(max, a + b)} ${unit}`, `${Math.min(a, b)} ${unit}`, `${Math.max(a, b)} ${unit}`], difficulty), row([token(`${a} ${unit}`), token('↔'), token(`${b} ${unit}`)]), 'Measure length');
}

function shapes(level, difficulty) {
  const max = maxForLevel(level);
  const type = pick(level === 1 ? ['properties', 'fraction'] : ['fraction', 'area', 'perimeter']);
  if (type === 'properties') {
    const shape = pick([{ name: 'triangle', symbol: '▲', sides: 3 }, { name: 'square', symbol: '■', sides: 4 }, { name: 'pentagon', symbol: '⬟', sides: 5 }]);
    return problem(story('shape', shape), `How many sides does a ${shape.name} have?`, shape.sides, numberOptions(shape.sides, difficulty), row([`<span class="visual-emoji">${shape.symbol}</span>`, emoji('🪽')]), 'Shape properties');
  }
  if (type === 'fraction') {
    const den = pick(level === 1 ? [2, 4] : [2, 3, 4, 6, 8]), num = rand(1, den - 1);
    return problem(story('fraction', { den, num }), 'What fraction of the biscuit was eaten?', `${num}/${den}`, optionSet(`${num}/${den}`, [`${den}/${num}`, `${den - num}/${den}`, `1/${den}`], difficulty), row([token(`${num} chosen`), token('of'), token(`${den} equal parts`), emoji('🦴')]), 'Fractions');
  }
  let width, height, answer;
  do { width = rand(2, Math.min(9, max)); height = rand(2, Math.min(9, max)); answer = type === 'area' ? width * height : 2 * (width + height); } while (answer > max);
  const area = type === 'area', unit = area ? 'square units' : 'units';
  return problem(story('rectangle', { w: width, h: height, area }), `What is the ${area ? 'area' : 'perimeter'}?`, `${answer} ${unit}`, optionSet(`${answer} ${unit}`, [`${width + height} units`, `${width * height} units`, `${2 * (width + height)} units`], difficulty), row([token(width), token('×'), token(height), emoji('🪺')]), cap(type));
}

function multiplication(level, difficulty) {
  const max = maxForLevel(level), pairs = [];
  for (let a = 2; a <= 10; a++) for (let b = 2; b <= 10; b++) if (a * b <= max && a * b < 100 && (level > 1 || [2, 5, 10].includes(a))) pairs.push([a, b]);
  const [a, b] = pick(pairs), type = pick(['array', 'repeat', 'share']);
  if (type === 'share') {
    const total = a * b;
    return problem(story('share', { total, a }), 'How many treats does each baby get?', b, numberOptions(b, difficulty), row([token(total), token('÷'), token(a), emoji('🦴')]), 'Division as sharing');
  }
  const answer = a * b;
  const eggs = Array.from({ length: Math.min(answer, 40) }, (_, index) => `<span style="animation-delay:${index * 0.025}s">🥚</span>`).join('');
  return problem(story('multiply', { a, b }), 'How many eggs are there altogether?', answer, numberOptions(answer, difficulty, a), `<div class="array" style="--cols:${Math.min(a, 5)}">${eggs}</div>`, 'Arrays & multiplication');
}

function reasoning(level, difficulty) {
  const max = maxForLevel(level);
  const type = pick(level === 1 ? ['logic', 'twostep'] : ['twostep', 'round', 'estimate', 'logic']);
  if (type === 'round') {
    const n = rand(12, max === 99 ? 94 : max - 1), answer = Math.round(n / 10) * 10;
    return problem(story('round', { n }), `Round ${n} to the nearest 10.`, answer, numberOptions(answer, difficulty, 10), row([token(n), token('≈'), token('?')]), 'Rounding');
  }
  if (type === 'estimate') {
    let a, b, answer;
    do { a = rand(10, max - 10); b = rand(10, max - 10); answer = Math.round(a / 10) * 10 + Math.round(b / 10) * 10; } while (answer > max);
    return problem(story('estimate', { a, b }), 'About how many bubbles altogether?', answer, numberOptions(answer, difficulty, 10), row([token(a), token('+'), token(b), token('≈ ?')]), 'Estimation');
  }
  if (type === 'logic') {
    const nums = shuffle(Array.from({ length: max + 1 }, (_, index) => index)).slice(0, 3), answer = Math.max(...nums);
    return problem(story('logic', { nums }), 'Which number is greatest?', answer, optionSet(answer, [...nums.filter((n) => n !== answer), Math.abs(nums[0] - nums[1])], difficulty), row([...nums.map(token), emoji('🦖')]), 'Logic & comparison');
  }
  const start = rand(0, max - 2), add = rand(1, max - start), take = rand(0, start + add), answer = start + add - take;
  return problem(story('twoStep', { start, add, take }), 'How many shells remain?', answer, numberOptions(answer, difficulty, level === 1 ? 1 : 5), row([token(start), token('+'), token(add), token('−'), token(take)]), 'Two-step reasoning');
}

const generators = [counting, addition, subtraction, patterns, measure, shapes, multiplication, reasoning];
export function makeProblem(worldIndex, difficulty) {
  const level = { easy: 1, medium: 2, hard: 3 }[difficulty];
  return generators[worldIndex](level, difficulty);
}
