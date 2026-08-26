import { limits } from './worlds.js';
import { story } from './stories.js';

const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (items) => items[rand(0, items.length - 1)];
const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const row = (items) => `<div class="visual-row">${items.join('')}</div>`;
const token = (value) => `<span class="math-token">${value}</span>`;
const emoji = (value, count = 1) => Array.from({ length: count }, () => `<span class="visual-emoji">${value}</span>`).join('');
const maxForLevel = (level) => [500, 1000, 5000][level - 1];

function optionSet(correct, others, difficulty) {
  const limit = limits[difficulty];
  const numericMatch = String(correct).match(/^(\d+)(\s*(?:¢|cm|in|units|square units))?$/);
  const numeric = Boolean(numericMatch);
  const suffix = numericMatch?.[2] || '';
  const pool = numeric
    ? others.filter((value) => {
      const match = String(value).match(/^(\d+)(\s*(?:¢|cm|in|units|square units))?$/);
      return match && Number(match[1]) >= 0 && Number(match[1]) <= limit;
    })
    : others;
  const values = [String(correct), ...pool.map(String)].filter((value, index, all) => all.indexOf(value) === index);
  while (values.length < 4) {
    const next = numeric ? `${rand(0, limit)}${suffix}` : pick(['Not enough clues', 'Both', 'Neither', 'It stays the same']);
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

// Counting with new lesson types: before/after, missing, asc/desc, bigger/smaller, odd/even/prime
function counting(level, difficulty) {
  const max = maxForLevel(level);
  const type = pick(level === 1 ? ['count', 'beforeAfter', 'missing', 'order', 'compare', 'oddEven', 'skip', 'place'] : ['beforeAfter', 'missing', 'order', 'compare', 'oddEven', 'prime', 'skip', 'place']);
  if (type === 'count') {
    const n = rand(5, Math.min(14, max));
    return problem(story('count', { n }), 'How many claw-casts did Bindi find?', n, numberOptions(n, difficulty), row([emoji('🖐️', n)]), 'Count objects');
  }
  if (type === 'beforeAfter') {
    const n = rand(1, Math.min(max - 1, 30));
    const askBefore = Math.random() < 0.5;
    if (askBefore) {
      return problem(story('before', { n }), `What number comes BEFORE ${n}?`, n - 1, numberOptions(n - 1, difficulty), row([token('?'), token('←'), token(n)]), 'Before numbers');
    }
    return problem(story('after', { n }), `What number comes AFTER ${n}?`, n + 1, numberOptions(n + 1, difficulty), row([token(n), token('→'), token('?')]), 'After numbers');
  }
  if (type === 'missing') {
    const start = rand(0, Math.min(max - 4, 25));
    const missingPos = rand(1, 3);
    const seq = [start, start + 1, start + 2, start + 3, start + 4];
    const answer = seq[missingPos];
    const visual = row(seq.map((v, i) => i === missingPos ? token('?') : token(v)));
    return problem(story('missing', { start }), `Find the missing number: ${seq.map((v,i)=> i===missingPos?'_':v).join(', ')}`, answer, numberOptions(answer, difficulty), visual, 'Missing number');
  }
  if (type === 'order') {
    const nums = shuffle([rand(0, Math.min(max,30)), rand(0, Math.min(max,30)), rand(0, Math.min(max,30))]);
    while (new Set(nums).size < 3) nums[0] = rand(0, Math.min(max,30));
    const asc = [...nums].sort((a,b)=>a-b);
    const askAsc = Math.random() < 0.5;
    if (askAsc) {
      return problem(story('asc', { nums }), 'Arrange smallest to biggest (ascending)', asc.join(', '), optionSet(asc.join(', '), [nums.join(', '), [...nums].sort((a,b)=>b-a).join(', '), asc.slice().reverse().join(', ')], difficulty), row(nums.map(token).concat(token('→ ?'))), 'Ascending order');
    }
    const desc = [...nums].sort((a,b)=>b-a);
    return problem(story('desc', { nums }), 'Arrange biggest to smallest (descending)', desc.join(', '), optionSet(desc.join(', '), [nums.join(', '), asc.join(', '), nums.slice().reverse().join(', ')], difficulty), row(nums.map(token).concat(token('→ ?'))), 'Descending order');
  }
  if (type === 'oddEven') {
    const n = rand(1, Math.min(max, 30));
    return problem(story('parity', { n }), `Is ${n} odd or even?`, n % 2 ? 'Odd' : 'Even', shuffle(['Odd', 'Even', 'Both', 'Neither']), row([token(n), emoji('🐾', Math.min(n, 8))]), 'Odd or even');
  }
  if (type === 'prime') {
    const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47];
    const n = pick(primes.filter(p=>p<=max));
    const composite = rand(4, Math.min(max,30));
    const ask = Math.random()<0.5 ? n : composite;
    const isPrime = primes.includes(ask);
    return problem(story('prime', { n: ask }), `Is ${ask} prime or composite?`, isPrime ? 'Prime' : 'Composite', shuffle(['Prime','Composite','Both','Neither']), row([token(ask)]), 'Prime numbers');
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
  let a = rand(0, Math.min(max,30)), b = rand(0, Math.min(max,30));
  while (b === a) b = rand(0, Math.min(max,30));
  const answer = a > b ? a : b;
  const bigger = a > b;
  return problem(story('compare', { a, b }), bigger ? 'Which is bigger?' : 'Which is smaller?', answer, optionSet(answer, [Math.min(a, b), Math.abs(a - b), Math.min(max, answer + 1)], difficulty), row([token(a), token('or'), token(b)]), 'Bigger smaller');
}

function addition(level, difficulty) {
  const max = maxForLevel(level);
  const a = rand(0, max - 1), b = rand(1, Math.min(30, max - a)), sum = a + b;
  if (sum > max) return addition(level, difficulty);
  if (pick(['story', 'missing', 'equation', 'howto']) === 'missing') {
    return problem(story('addMissing', { a, sum }), `What number makes ${a} + ? = ${sum}?`, b, numberOptions(b, difficulty), row([emoji('🍪', Math.min(a, 8)), token('+ ?'), token('='), token(sum)]), 'Missing addend');
  }
  if (Math.random() < 0.2) {
    return problem({ title: `Dino learns to add: ${a} eggs plus ${b} eggs. Watch them join together!`, teach: `How to add: put ${a} and ${b} together, count all.` }, `How many altogether? ${a} + ${b} = ?`, sum, numberOptions(sum, difficulty, level === 1 ? 1 : 5), row([token(a), token('+'), token(b), emoji('🦖')]), 'How to add');
  }
  return problem(story('add', { a, b }), 'How many dino-cookies are there now?', sum, numberOptions(sum, difficulty, level === 1 ? 1 : 5), row([token(a), token('+'), token(b), emoji('🦖')]), level === 1 ? 'Add within 500' : level === 2 ? 'Add within 1000' : 'Add within 5000');
}

function subtraction(level, difficulty) {
  const max = maxForLevel(level);
  const a = rand(1, Math.min(max, 100)), b = rand(0, a), answer = a - b;
  if (pick(['story', 'missing', 'howto']) === 'missing') {
    const total = a, remain = b, taken = total - remain;
    return problem(story('subtractMissing', { total, remain }), 'How many horn rings rolled away?', taken, numberOptions(taken, difficulty, level === 1 ? 1 : 5), row([token(total), token('− ?'), token('='), token(remain), emoji('📯')]), 'Missing number');
  }
  if (Math.random() < 0.2) {
    return problem({ title: `Dino learns to subtract: ${a} bones, ${b} taken away. Count what remains!`, teach: `How to subtract: start with ${a}, take away ${b}, count left.` }, `${a} - ${b} = ?`, answer, numberOptions(answer, difficulty, level === 1 ? 1 : 5), row([token(a), token('−'), token(b), emoji('🦴')]), 'How to subtract');
  }
  return problem(story('subtract', { a, b }), 'How many bones remain?', answer, numberOptions(answer, difficulty, level === 1 ? 1 : 5), row([token(a), token('−'), token(b), emoji('🦴')]), level === 1 ? 'Subtract within 500' : level === 2 ? 'Subtract within 1000' : 'Subtract within 5000');
}

function patterns(level, difficulty) {
  const max = maxForLevel(level);
  const type = pick(['sequence', 'parity', 'repeat', 'missing', 'prime']);
  if (type === 'parity') {
    const n = rand(2, Math.min(max, 50));
    return problem(story('parity', { n }), `Is ${n} odd or even?`, n % 2 ? 'Odd' : 'Even', shuffle(['Odd', 'Even', 'Both', 'Neither']), row([token(n), emoji('🐾', Math.min(n, 8))]), 'Odd or even');
  }
  if (type === 'prime' && level === 3) {
    const primes = [2,3,5,7,11,13,17,19,23,29,31,37];
    const n = pick(primes);
    return problem(story('prime', { n }), `Is ${n} prime?`, 'Prime', shuffle(['Prime','Composite','Odd','Even']), row([token(n)]), 'Prime numbers');
  }
  if (type === 'repeat') {
    const sequence = pick([['🦴', '🥚'], ['🖐️', '🖐️', '🦷'], ['🐾', '📯', '📯']]);
    return problem(story('repeat'), 'What comes next?', sequence[0], shuffle([sequence[0], '🖐️', '🥚', '🦴', '📯'].filter((value, index, all) => all.indexOf(value) === index).slice(0, 4)), row([...sequence, ...sequence].map(token).concat(token('?'))), 'Repeating pattern');
  }
  if (type === 'missing') {
    const start = rand(0, 20);
    const step = pick([2,3,5]);
    const seq = [start, start+step, start+step*2, start+step*3, start+step*4];
    const missingIdx = rand(1,3);
    const ans = seq[missingIdx];
    return problem(story('sequence', { step }), `Missing: ${seq.map((v,i)=>i===missingIdx?'_':v).join(', ')}`, ans, numberOptions(ans, difficulty, step), row(seq.map((v,i)=> i===missingIdx? token('?'): token(v))), 'Missing number');
  }
  const possible = [2, 3, 4, 5, 6, 7, 9, 10].filter((value) => value * 4 <= Math.min(max,100));
  const step = pick(level === 1 ? possible.filter((value) => [2, 5].includes(value)) : possible);
  const start = step * rand(0, Math.max(0, Math.floor(Math.min(max,100) / step) - 4));
  const answer = start + step * 4;
  return problem(story('sequence', { step }), `Complete: ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, ?`, answer, numberOptions(answer, difficulty, step), row([token(start), token(start + step), token(start + step * 2), token(start + step * 3), token('?')]), 'Number pattern');
}

function measure(level, difficulty) {
  const max = maxForLevel(level);
  const type = pick(['time', 'money', 'length', 'biggerSmaller']);
  if (type === 'biggerSmaller') {
    let a = rand(1, Math.min(max,30)); let b = rand(1, Math.min(max,30));
    while (b===a) b = rand(1, Math.min(max,30));
    return problem(story('compare', { a, b }), a>b ? 'Which is bigger?' : 'Which is smaller?', a>b?a:b, numberOptions(a>b?a:b, difficulty), row([token(a), token('vs'), token(b)]), 'Bigger smaller');
  }
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
  const a = rand(1, Math.min(max,50)), b = rand(1, Math.min(max,50)), unit = pick(['cm', 'in']), answer = Math.abs(a - b);
  return problem(story('length', { a, b, unit }), 'How much longer is the longer track?', `${answer} ${unit}`, optionSet(`${answer} ${unit}`, [`${Math.min(max, a + b)} ${unit}`, `${Math.min(a, b)} ${unit}`, `${Math.max(a, b)} ${unit}`], difficulty), row([token(`${a} ${unit}`), token('↔'), token(`${b} ${unit}`)]), 'Measure length');
}

function shapes(level, difficulty) {
  const max = maxForLevel(level);
  const type = pick(level === 1 ? ['properties', 'fraction', 'order'] : ['fraction', 'area', 'perimeter', 'order']);
  if (type === 'order') {
    const a = rand(1,20), b = rand(1,20), c = rand(1,20);
    const nums = [a,b,c];
    const asc = [...nums].sort((x,y)=>x-y).join(', ');
    return problem(story('order', { nums }), 'Order smallest to biggest', asc, optionSet(asc, [nums.join(', '), [...nums].sort((x,y)=>y-x).join(', '), asc], difficulty), row(nums.map(token)), 'Ascending descending');
  }
  if (type === 'properties') {
    const shape = pick([{ name: 'triangle', symbol: '▲', sides: 3 }, { name: 'square', symbol: '■', sides: 4 }, { name: 'pentagon', symbol: '⬟', sides: 5 }]);
    return problem(story('shape', shape), `How many sides does a ${shape.name} have?`, shape.sides, numberOptions(shape.sides, difficulty), row([`<span class="visual-emoji">${shape.symbol}</span>`, emoji('🪽')]), 'Shape properties');
  }
  if (type === 'fraction') {
    const den = pick(level === 1 ? [2, 4] : [2, 3, 4, 6, 8]), num = rand(1, den - 1);
    return problem(story('fraction', { den, num }), 'What fraction of the biscuit was eaten?', `${num}/${den}`, optionSet(`${num}/${den}`, [`${den}/${num}`, `${den - num}/${den}`, `1/${den}`], difficulty), row([token(`${num} chosen`), token('of'), token(`${den} equal parts`), emoji('🦴')]), 'Fractions');
  }
  let width, height, answer;
  do { width = rand(2, Math.min(9, 20)); height = rand(2, Math.min(9, 20)); answer = type === 'area' ? width * height : 2 * (width + height); } while (answer > Math.min(max,100));
  const area = type === 'area', unit = area ? 'square units' : 'units';
  return problem(story('rectangle', { w: width, h: height, area }), `What is the ${area ? 'area' : 'perimeter'}?`, `${answer} ${unit}`, optionSet(`${answer} ${unit}`, [`${width + height} units`, `${width * height} units`, `${2 * (width + height)} units`], difficulty), row([token(width), token('×'), token(height), emoji('🪺')]), cap(type));
}

function multiplication(level, difficulty) {
  const max = maxForLevel(level), pairs = [];
  for (let a = 2; a <= 10; a++) for (let b = 2; b <= 10; b++) if (a * b <= Math.min(max,100) && (level > 1 || [2, 5, 10].includes(a))) pairs.push([a, b]);
  const [a, b] = pick(pairs.length?pairs:[[2,3]]), type = pick(['array', 'repeat', 'share', 'table']);
  if (type === 'table') {
    const table = pick([2,3,4,5,10]);
    const mult = rand(1,10);
    const ans = table * mult;
    return problem({ title: `Dino table of ${table}s: ${table} × ${mult} — count by ${table}s!`, teach: `Table ${table}: ${table} × ${mult} = ? Skip count by ${table}.` }, `What is ${table} × ${mult}?`, ans, numberOptions(ans, difficulty, table), row([token(`${table} × ${mult}`), token('='), token('?')]), `Table ${table}s`);
  }
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
  const type = pick(level === 1 ? ['logic', 'twostep'] : ['twostep', 'round', 'estimate', 'logic', 'prime']);
  if (type === 'prime') {
    const primes = [2,3,5,7,11,13];
    const n = pick(primes);
    return problem(story('prime', { n }), `Which is prime?`, n, numberOptions(n, difficulty), row([token(n)]), 'Prime numbers');
  }
  if (type === 'round') {
    const n = rand(12, Math.min(max,200)), answer = Math.round(n / 10) * 10;
    return problem(story('round', { n }), `Round ${n} to the nearest 10.`, answer, numberOptions(answer, difficulty, 10), row([token(n), token('≈'), token('?')]), 'Rounding');
  }
  if (type === 'estimate') {
    let a, b, answer;
    do { a = rand(10, Math.min(max,100)); b = rand(10, Math.min(max,100)); answer = Math.round(a / 10) * 10 + Math.round(b / 10) * 10; } while (answer > Math.min(max,200));
    return problem(story('estimate', { a, b }), 'About how many bubbles altogether?', answer, numberOptions(answer, difficulty, 10), row([token(a), token('+'), token(b), token('≈ ?')]), 'Estimation');
  }
  if (type === 'logic') {
    const nums = shuffle(Array.from({ length: Math.min(max,30) + 1 }, (_, index) => index)).slice(0, 3), answer = Math.max(...nums);
    return problem(story('logic', { nums }), 'Which number is greatest?', answer, optionSet(answer, [...nums.filter((n) => n !== answer), Math.abs(nums[0] - nums[1])], difficulty), row([...nums.map(token), emoji('🦖')]), 'Logic & comparison');
  }
  const start = rand(0, Math.min(max,50)), add = rand(1, 20), take = rand(0, start + add), answer = start + add - take;
  return problem(story('twoStep', { start, add, take }), 'How many shells remain?', answer, numberOptions(answer, difficulty, level === 1 ? 1 : 5), row([token(start), token('+'), token(add), token('−'), token(take)]), 'Two-step reasoning');
}

const kindergartenChallenges = [
  () => {
    const n = rand(1, 10);
    return problem({ title: `Bindi finds ${n} tiny dinos marching in one wiggly line. She points to each friend so nobody gets counted twice!`, teach: `Touch each dino once as you count from 1 to ${n}.` }, 'How many dinos are marching?', n, numberOptions(n, 'kindergarten'), row([emoji('🦕', n)]), n <= 10 ? 'Count dinos to 10' : 'Count to 30');
  },
  () => {
    const n = rand(0, 30);
    return problem({ title: `Pico spots the number ${n} painted on a giant egg.`, teach: 'Look closely at the numeral and say its name.' }, `Which number is this: ${n}?`, n, numberOptions(n, 'kindergarten'), row([`<span class="trace-number">${n}</span>`]), 'Number recognition 0–30');
  },
  () => {
    const n = rand(1, 10);
    return problem({ title: `${n} baby dinos each need one cozy nest.`, teach: 'Match one object to one count.' }, 'Which number matches the dinos?', n, numberOptions(n, 'kindergarten'), row([emoji('🦖', n), token('→'), token('?')]), 'One-to-one matching');
  },
  () => {
    const n = rand(0, 30);
    return problem({ title: `Rory traces a giant ${n} in the sand.`, teach: `Use your finger to trace ${n}.` }, `Which number did Rory write?`, n, numberOptions(n, 'kindergarten'), `<div class="trace-card"><span>${n}</span><small>trace with your finger</small></div>`, 'Write numbers 0–30');
  },
  () => {
    const a = rand(1, 8), b = rand(1, 8);
    const correct = a === b ? 'Equal' : a > b ? 'Left group' : 'Right group';
    return problem({ title: `Two dino teams gather eggs for breakfast.`, teach: 'Count both groups. Decide which has more, or if they are equal.' }, 'Which group has more eggs?', correct, shuffle(['Left group', 'Right group', 'Equal', 'Not sure']), `<div class="compare-groups"><div>${emoji('🥚', a)}<b>Left</b></div><span>vs</span><div>${emoji('🥚', b)}<b>Right</b></div></div>`, 'Bigger smaller');
  },
  () => {
    const a = rand(0, 4), b = rand(0, 5 - a), total = a + b;
    return problem({ title: `Tina rolls ${a} speckled eggs beside ${b} blue eggs.`, teach: 'Addition joins groups. Count all the eggs together.' }, `How many eggs are there altogether?`, total, numberOptions(total, 'kindergarten'), row([emoji('🥚', a), token('+'), emoji('🥚', b)]), 'How to add');
  },
  () => {
    const a = rand(1, 5), b = rand(0, a), left = a - b;
    return problem({ title: `${a} dinos splash by the pond. ${b} stomp away.`, teach: 'Subtraction tells how many remain after some leave.' }, 'How many dinos stay by the pond?', left, numberOptions(left, 'kindergarten'), row([token(a), token('−'), token(b), emoji('🐾')]), 'How to subtract');
  },
  () => {
    const whole = rand(2, 10), part = rand(0, whole), missing = whole - part;
    return problem({ title: `Annie breaks a group of ${whole} bones into two piles.`, teach: 'A whole can be split into two parts.' }, `${whole} = ${part} + ?`, missing, numberOptions(missing, 'kindergarten'), row([token(whole), token('='), token(part), token('+'), token('?')]), 'Missing number');
  },
  () => {
    const a = rand(0, 10), missing = 10 - a;
    return problem({ title: `Milo needs 10 dino friends for a parade. ${a} friends have arrived!`, teach: 'Think of the partner number that joins to make 10.' }, `${a} and what number make 10?`, missing, numberOptions(missing, 'kindergarten'), row([emoji('🦕', Math.min(a, 10)), token('+ ? = 10')]), 'Make 10');
  },
  () => {
    const n = rand(1, 30);
    const before = n-1;
    return problem({ title: `${n} dinos line up. Which number comes BEFORE ${n}?`, teach: `Before ${n} is ${before}.` }, `What comes before ${n}?`, before, numberOptions(before, 'kindergarten'), row([token('?'), token('←'), token(n)]), 'Before numbers');
  },
  () => {
    const n = rand(0, 29);
    return problem({ title: `${n} dinos line up. What comes AFTER ${n}?`, teach: `After ${n} is ${n+1}.` }, `What comes after ${n}?`, n+1, numberOptions(n+1, 'kindergarten'), row([token(n), token('→'), token('?')]), 'After numbers');
  },
  () => {
    const a = rand(1,10), b = rand(1,10), c = rand(1,10);
    const nums = [a,b,c];
    const asc = [...nums].sort((x,y)=>x-y).join(', ');
    return problem({ title: `Dinos want to line up smallest to biggest!`, teach: 'Ascending means smallest to biggest.' }, `Put in ascending order: ${nums.join(', ')}`, asc, optionSet(asc, [nums.join(', '), [...nums].sort((x,y)=>y-x).join(', ')], 'kindergarten'), row(nums.map(token)), 'Ascending order');
  },
  () => {
    const a = rand(1,10), b = rand(1,10), c = rand(1,10);
    const nums = [a,b,c];
    const desc = [...nums].sort((x,y)=>y-x).join(', ');
    return problem({ title: `Dinos want to line up biggest to smallest!`, teach: 'Descending means biggest to smallest.' }, `Put in descending order: ${nums.join(', ')}`, desc, optionSet(desc, [nums.join(', '), [...nums].sort((x,y)=>x-y).join(', ')], 'kindergarten'), row(nums.map(token)), 'Descending order');
  },
  () => {
    const n = rand(1,10);
    return problem({ title: `Is ${n} odd or even? Pair them up!`, teach: 'Even makes pairs, odd has one left.' }, `Odd or even: ${n}?`, n%2?'Odd':'Even', shuffle(['Odd','Even','Both','Neither']), row([emoji('🥚', n)]), 'Odd even');
  },
  () => {
    const n = rand(2,8);
    return problem({ title: `Is ${n} bigger or smaller than ${n+1}?`, teach: 'Compare numbers to find bigger smaller.' }, `Which is bigger: ${n} or ${n+1}?`, n+1, numberOptions(n+1, 'kindergarten'), row([token(n), token('vs'), token(n+1)]), 'Bigger smaller 2');
  },
  () => {
    const table = 2, mult = rand(1,5), ans = table*mult;
    return problem({ title: `Table of 2s: ${table} × ${mult} eggs`, teach: `Table 2: count by 2s.` }, `${table} × ${mult} = ?`, ans, numberOptions(ans, 'kindergarten'), row([token(`${table}×${mult}`)]), 'Table 2s');
  },
  () => {
    const start = rand(0,5), missing = start+1;
    return problem({ title: `Count: ${start}, _, ${start+2}`, teach: 'Find missing number in sequence.' }, `Missing: ${start}, ?, ${start+2}`, missing, numberOptions(missing, 'kindergarten'), row([token(start), token('?'), token(start+2)]), 'Missing in sequence');
  },
  () => {
    const shapes = [{ name: 'Circle', symbol: '●', sides: 0 }, { name: 'Square', symbol: '■', sides: 4 }, { name: 'Triangle', symbol: '▲', sides: 3 }];
    const shape = pick(shapes);
    return problem({ title: `Perry sees a ${shape.name.toLowerCase()} footprint!`, teach: `${shape.name}s have ${shape.sides||'curved'} sides.` }, 'What shape?', shape.name, optionSet(shape.name, shapes.filter(s=>s.name!==shape.name).map(s=>s.name), 'kindergarten'), row([`<span class="shape-mark">${shape.symbol}</span>`]), '2D shapes');
  },
  () => {
    const n = rand(0,10);
    const cells = Array.from({ length: 10 }, (_, i) => `<span class="ten-cell">${i < n ? '🥚' : ''}</span>`).join('');
    return problem({ title: `Ten-frame with ${n} eggs`, teach: 'Ten-frame helps see number quickly.' }, 'How many eggs?', n, numberOptions(n, 'kindergarten'), `<div class="ten-frame">${cells}</div>`, 'Ten-frames');
  },
  () => {
    const start = rand(0,5), add = rand(1,5), total = start+add;
    return problem({ title: `Milo finds ${start} shells, then ${add} more!`, teach: 'Join groups to add.' }, 'How many now?', total, numberOptions(total, 'kindergarten'), row([token(start), token('+'), token(add)]), 'Story problems');
  }
];

export const KINDERGARTEN_CHALLENGE_COUNT = kindergartenChallenges.length;

let kindergartenDeck = [];
function kindergarten() {
  if (!kindergartenDeck.length) kindergartenDeck = shuffle(kindergartenChallenges.map((_, index) => index));
  return kindergartenChallenges[kindergartenDeck.pop()]();
}

const generators = [counting, addition, subtraction, patterns, measure, shapes, multiplication, reasoning];
export function makeProblem(worldIndex, difficulty) {
  if (difficulty === 'kindergarten') return kindergarten();
  const level = { easy: 1, medium: 2, hard: 3 }[difficulty];
  return generators[worldIndex](level, difficulty);
}

export function isCorrectAnswer(problemToCheck, answer) {
  return String(answer) === String(problemToCheck.correct);
}
