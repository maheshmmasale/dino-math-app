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

const kindergartenChallenges = [
  () => {
    const n = rand(1, 20);
    return problem({ title: `Bindi finds ${n} tiny dinos marching in one wiggly line. She points to each friend so nobody gets counted twice!`, teach: `Touch each dino once as you count from 1 to ${n}.` }, 'How many dinos are marching?', n, numberOptions(n, 'kindergarten'), row([emoji('🦕', n)]), n <= 10 ? 'Count dinos to 10' : 'Count to 20');
  },
  () => {
    const n = rand(0, 20);
    return problem({ title: `Pico spots the number ${n} painted on a giant egg. The paint is still tickly, so the egg keeps wobbling!`, teach: 'Look closely at the numeral and say its name.' }, `Which number is this: ${n}?`, n, numberOptions(n, 'kindergarten'), row([`<span class="trace-number">${n}</span>`]), 'Number recognition 0–20');
  },
  () => {
    const n = rand(1, 10);
    return problem({ title: `${n} baby dinos each need one cozy nest. Bindi checks every dino has exactly one place to curl up.`, teach: 'Match one object to one count. The last number tells how many.' }, 'Which number matches the dinos?', n, numberOptions(n, 'kindergarten'), row([emoji('🦖', n), token('→'), token('?')]), 'One-to-one matching');
  },
  () => {
    const n = rand(0, 20);
    return problem({ title: `Rory traces a giant ${n} in the sand with one careful claw. Slowly around, down, or across—the number takes shape!`, teach: `Use your finger to trace ${n} in the air, then find the matching numeral.` }, `Which number did Rory write?`, n, numberOptions(n, 'kindergarten'), `<div class="trace-card"><span>${n}</span><small>trace with your finger</small></div>`, 'Write numbers 0–20');
  },
  () => {
    const a = rand(1, 8), b = rand(1, 8);
    const correct = a === b ? 'Equal' : a > b ? 'Left group' : 'Right group';
    return problem({ title: `Two dino teams gather eggs for breakfast. The teams compare without grabbing—very polite dinosaurs!`, teach: 'Count both groups. Decide which has more, or if they are equal.' }, 'Which group has more eggs?', correct, shuffle(['Left group', 'Right group', 'Equal', 'Not sure']), `<div class="compare-groups"><div>${emoji('🥚', a)}<b>Left</b></div><span>vs</span><div>${emoji('🥚', b)}<b>Right</b></div></div>`, 'More, less, or equal');
  },
  () => {
    const a = rand(0, 4), b = rand(0, 5 - a), total = a + b;
    return problem({ title: `Tina rolls ${a} speckled eggs beside ${b} blue eggs. Her tiny arms celebrate when the two groups meet!`, teach: 'Addition joins groups. Count all the eggs together.' }, `How many eggs are there altogether?`, total, numberOptions(total, 'kindergarten'), row([emoji('🥚', a), token('+'), emoji('🥚', b)]), 'Addition within 5');
  },
  () => {
    const a = rand(1, 5), b = rand(0, a), left = a - b;
    return problem({ title: `${a} dinos splash by the pond. ${b} stomp away to find a snack, leaving little ripples behind.`, teach: 'Subtraction tells how many remain after some leave.' }, 'How many dinos stay by the pond?', left, numberOptions(left, 'kindergarten'), row([token(a), token('−'), token(b), emoji('🐾')]), 'Subtraction within 5');
  },
  () => {
    const whole = rand(2, 10), part = rand(0, whole), missing = whole - part;
    return problem({ title: `Annie breaks a group of ${whole} bones into two picnic piles. One pile has ${part}; the other pile is hiding under her tail!`, teach: 'A whole can be split into two parts. Both parts still make the whole.' }, `${whole} = ${part} + ?`, missing, numberOptions(missing, 'kindergarten'), row([token(whole), token('='), token(part), token('+'), token('?')]), 'Decompose numbers to 10');
  },
  () => {
    const a = rand(0, 10), missing = 10 - a;
    return problem({ title: `Milo needs 10 dino friends for a bubble parade. ${a} friends have arrived, and the rest are swimming over!`, teach: 'Think of the partner number that joins the first part to make 10.' }, `${a} and what number make 10?`, missing, numberOptions(missing, 'kindergarten'), row([emoji('🦕', Math.min(a, 10)), token('+ ? = 10')]), 'Make 10');
  },
  () => {
    const shapes = [
      { name: 'Circle', symbol: '●', sides: 0 }, { name: 'Square', symbol: '■', sides: 4 }, { name: 'Triangle', symbol: '▲', sides: 3 }, { name: 'Rectangle', symbol: '▬', sides: 4 }, { name: 'Hexagon', symbol: '⬢', sides: 6 }
    ];
    const shape = pick(shapes);
    return problem({ title: `Perry sees a ${shape.name.toLowerCase()}-shaped footprint stamped beside the canyon. He circles it in the sky with his wings!`, teach: `${shape.name}s have ${shape.sides === 0 ? 'one curved edge and no straight sides' : `${shape.sides} straight sides`}.` }, 'What shape is the footprint?', shape.name, optionSet(shape.name, shapes.filter((item) => item.name !== shape.name).map((item) => item.name), 'kindergarten'), row([`<span class="shape-mark">${shape.symbol}</span>`]), '2D shapes');
  },
  () => {
    const sets = [
      { rule: 'red', group: ['🔴', '🔴', '🔴'], answer: '🔴', choices: ['🔴', '🔵', '🟡', '🟢'] },
      { rule: 'big', group: ['BIG', 'BIG', 'BIG'], answer: 'BIG', choices: ['BIG', 'small', 'tiny', 'short'] },
      { rule: 'dinosaur', group: ['🦕', '🦖', '🦕'], answer: '🦖', choices: ['🦖', '🥚', '🦴', '🐾'] }
    ];
    const set = pick(sets);
    return problem({ title: `Trixie sorts the discovery table by ${set.rule}. She taps each item with one horn before placing it in the matching group.`, teach: `Look for the shared ${set.rule} feature.` }, `Which item belongs with this ${set.rule} group?`, set.answer, shuffle(set.choices), row(set.group.map(token)), 'Sort by color, size, or type');
  },
  () => {
    const patterns = [['🟠', '🔵'], ['🦕', '🥚'], ['🐾', '🦴']];
    const pair = pick(patterns);
    return problem({ title: `Rory makes an AB trail: ${pair[0]}, ${pair[1]}, then the same pair again. His dancing feet are ready for the next spot!`, teach: 'An AB pattern repeats two different parts in the same order.' }, 'What comes next?', pair[0], shuffle([pair[0], pair[1], '🦖', '⭐']), row([token(pair[0]), token(pair[1]), token(pair[0]), token(pair[1]), token('?')]), 'AB patterns');
  },
  () => {
    const type = pick(['longer', 'taller', 'heavier']);
    const prompts = {
      longer: { story: 'Stella compares two tail tracks in the sand.', question: 'Which track is longer?', visual: '<div class="measure-bars"><i style="--size:45%"></i><i style="--size:85%"></i></div>', answer: 'Bottom track', options: ['Top track', 'Bottom track', 'Same length', 'Cannot tell'] },
      taller: { story: 'Stella stands beside two bone towers.', question: 'Which tower is taller?', visual: '<div class="height-bars"><i style="--size:55%"></i><i style="--size:92%"></i></div>', answer: 'Right tower', options: ['Left tower', 'Right tower', 'Same height', 'Cannot tell'] },
      heavier: { story: 'Stella puts a feather and a giant fossil on the balance.', question: 'Which object is heavier?', visual: row([token('feather'), token('or'), token('fossil')]), answer: 'Fossil', options: ['Feather', 'Fossil', 'Same weight', 'Cannot tell'] }
    };
    const item = prompts[type];
    return problem({ title: `${item.story} Her back plates wiggle while she looks carefully!`, teach: `Compare both objects to find which is ${type}.` }, item.question, item.answer, shuffle(item.options), item.visual, 'Measure and compare');
  },
  () => {
    const positions = [
      { word: 'above', visual: '<div class="position-scene"><span>🦖</span><b>🦴</b></div>' },
      { word: 'below', visual: '<div class="position-scene reverse"><span>🦖</span><b>🦴</b></div>' },
      { word: 'in front', visual: '<div class="position-scene depth"><span>🦖</span><b>🥚</b></div>' },
      { word: 'behind', visual: '<div class="position-scene depth behind"><span>🦖</span><b>🥚</b></div>' }
    ];
    const item = pick(positions);
    return problem({ title: `A playful dino hides ${item.word} the bone marker. Pico flaps once and spots the clever hiding place!`, teach: 'Position words tell where one object is compared with another.' }, 'Where is the dino compared with the bone or egg?', item.word, shuffle(['above', 'below', 'in front', 'behind']), item.visual, 'Position words');
  },
  () => {
    const shapes = [
      { name: 'Sphere', action: 'roll', symbol: '⚽' }, { name: 'Cube', action: 'stack', symbol: '🎲' }, { name: 'Cylinder', action: 'roll and stack', symbol: '🥫' }, { name: 'Cone', action: 'roll in a circle', symbol: '🔺' }
    ];
    const shape = pick(shapes);
    return problem({ title: `Annie tests a ${shape.name.toLowerCase()} dino toy on the play table. She nudges it gently with her club tail.`, teach: `A ${shape.name.toLowerCase()} can ${shape.action}.` }, 'Which 3D shape is shown?', shape.name, shuffle([shape.name, ...shapes.filter((item) => item.name !== shape.name).map((item) => item.name)]).slice(0, 4), row([`<span class="shape-mark">${shape.symbol}</span>`]), '3D shapes: roll, stack, slide');
  },
  () => {
    const stop = rand(2, 10), answer = stop * 2;
    const seq = Array.from({ length: stop }, (_, index) => (index + 1) * 2);
    const otherEvens = shuffle(Array.from({ length: 10 }, (_, index) => (index + 1) * 2).filter((value) => value !== answer)).slice(0, 3);
    return problem({ title: `Bindi makes one giant stomp for every pair of eggs. The ground goes boom, boom, boom—but the eggs stay safe!`, teach: 'Count by twos: each stomp adds 2.' }, `What number comes after ${answer - 2}?`, answer, shuffle([answer, ...otherEvens]), row(seq.slice(Math.max(0, seq.length - 5)).map(token).concat(token('?'))), 'Count by twos to 20');
  },
  () => {
    const middle = rand(1, 19);
    return problem({ title: `Three numbered eggs need to line up from smallest to greatest. Rory nudges them into order with his nose.`, teach: 'Numbers grow by one as you count forward.' }, `Which number belongs between ${middle - 1} and ${middle + 1}?`, middle, numberOptions(middle, 'kindergarten'), row([token(middle - 1), token('?'), token(middle + 1)]), 'Number order 0–20');
  },
  () => {
    const n = rand(1, 10), answer = n % 2 ? 'Odd' : 'Even';
    return problem({ title: `Trixie puts ${n} eggs into pairs. Every egg wants a partner, but sometimes one egg is left with a silly hat!`, teach: 'Even groups pair up equally. Odd groups have one left over.' }, `Is ${n} odd or even?`, answer, shuffle(['Odd', 'Even', 'Both', 'Neither']), row([emoji('🥚', n)]), 'Equal groups and odd/even');
  },
  () => {
    const start = rand(0, 5), add = rand(1, 10 - start), total = start + add;
    return problem({ title: `Milo finds ${start} shells near the reef, then ${add} more tumble from a splashy wave. He counts before they can float away!`, teach: 'Listen for what happens in the story, then join the two groups.' }, 'How many shells does Milo have now?', total, numberOptions(total, 'kindergarten'), row([token(start), token('+'), token(add)]), 'Story problems within 10');
  },
  () => {
    const n = rand(0, 10);
    const cells = Array.from({ length: 10 }, (_, index) => `<span class="ten-cell">${index < n ? '🥚' : ''}</span>`).join('');
    return problem({ title: `Perry fills a ten-frame with ${n} dino eggs, starting at the top left and moving across each row.`, teach: 'A ten-frame has two rows of five. Filled spaces help you see the number quickly.' }, 'How many eggs are in the ten-frame?', n, numberOptions(n, 'kindergarten'), `<div class="ten-frame">${cells}</div>`, 'Ten-frames with dino eggs');
  },
  () => problem(
    { title: 'Say Coins', teach: 'Tap the microphone and say a number from 1 to 10. You can also tap each coin. Flip every coin to wake the friendly dino!' },
    'Say all 10 numbers!',
    10,
    Array.from({ length: 10 }, (_, index) => index + 1),
    '<div class="coin-game"><div class="coin-status"><button class="mic-btn" id="coinMicBtn" type="button" aria-pressed="false">🎙️ Tap to speak</button><span id="coinStatus">Say a number 1-10!</span><small class="coin-privacy" id="coinPrivacy" hidden>Voice goes to browser\'s speech service only when you tap mic</small></div><div class="coin-grid" id="coinGrid"></div><div class="coin-progress" id="coinProgress"></div><p class="coin-fallback">No microphone? Tap each numbered coin to flip it.</p></div>',
    'Say Coins'
  )
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
