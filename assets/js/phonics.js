export const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

export const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

export const PHONEMES = {
  a: { mark: '/ă/', speak: 'ah, as in apple' }, b: { mark: '/b/', speak: 'b, b, as in bat' },
  c: { mark: '/k/', speak: 'k, k, as in cat' }, d: { mark: '/d/', speak: 'd, d, as in dog' },
  e: { mark: '/ĕ/', speak: 'eh, as in egg' }, f: { mark: '/f/', speak: 'fff, as in fish' },
  g: { mark: '/g/', speak: 'g, g, as in gum' }, h: { mark: '/h/', speak: 'hhh, as in hat' },
  i: { mark: '/ĭ/', speak: 'ih, as in igloo' }, j: { mark: '/j/', speak: 'j, j, as in jam' },
  k: { mark: '/k/', speak: 'k, k, as in kite' }, l: { mark: '/l/', speak: 'lll, as in log' },
  m: { mark: '/m/', speak: 'mmm, as in moon' }, n: { mark: '/n/', speak: 'nnn, as in nest' },
  o: { mark: '/ŏ/', speak: 'aw, as in octopus' }, p: { mark: '/p/', speak: 'p, p, as in pop' },
  q: { mark: '/kw/', speak: 'kw, as in queen' }, r: { mark: '/r/', speak: 'rrr, as in red' },
  s: { mark: '/s/', speak: 'sss, as in sun' }, t: { mark: '/t/', speak: 't, t, as in top' },
  u: { mark: '/ŭ/', speak: 'uh, as in umbrella' }, v: { mark: '/v/', speak: 'vvv, as in van' },
  w: { mark: '/w/', speak: 'w, w, as in web' }, x: { mark: '/ks/', speak: 'ks, as in fox' },
  y: { mark: '/y/', speak: 'y, y, as in yes' }, z: { mark: '/z/', speak: 'zzz, as in zip' }
};

export const PHONICS_LEVELS = {
  kindergarten: {
    label: 'Kindergarten', short: 'K',
    skills: ['Letter names A–Z', 'Uppercase & lowercase', 'Letter sounds', 'Rhyming', 'Initial sounds', 'CVC -at & -an', '2–3 letter blending'],
    patterns: ['letters', 'sounds', '-at', '-an']
  },
  grade1: {
    label: 'Grade 1', short: '1',
    skills: ['Short vowels', 'Word families', 'Consonant blends bl/cr/st', 'Digraphs sh/ch/th', 'CVCe introduction'],
    patterns: ['short vowels', 'bl/cr/st', 'sh/ch/th', 'CVCe']
  },
  grade2: {
    label: 'Grade 2', short: '2',
    skills: ['Long vowels', 'Vowel teams ai/ee/oa', 'R-controlled ar/or', 'Diphthongs oi/ou', '2-syllable blending'],
    patterns: ['ai/ee/oa', 'ar/or', 'oi/ou', '2 syllables']
  },
  grade3: {
    label: 'Grade 3', short: '3',
    skills: ['Multisyllabic decoding', 'Prefixes re-/un-', 'Suffixes -ing/-ed', 'Vowel + e', 'Soft c/g'],
    patterns: ['re-/un-', '-ing/-ed', 'vowel + e', 'soft c/g']
  },
  grade4: {
    label: 'Grade 4', short: '4',
    skills: ['Advanced morphology', 'Greek & Latin roots', '-tion/-sion spelling', '3–4 syllable decoding'],
    patterns: ['morphology', 'roots', '-tion/-sion', '3–4 syllables']
  },
  grade5: {
    label: 'Grade 5', short: '5',
    skills: ['Complex phonics in context', 'Fluency', 'Words in sentences', 'Meaning from decoded words'],
    patterns: ['context', 'fluency', 'sentences', 'meaning']
  }
};

export const WORD_BANK = {
  kindergarten: [
    { word: 'cat', family: '-at', clue: 'a pet that purrs' }, { word: 'bat', family: '-at', clue: 'it flies at night' },
    { word: 'hat', family: '-at', clue: 'you wear it on your head' }, { word: 'can', family: '-an', clue: 'a metal container' },
    { word: 'fan', family: '-an', clue: 'it blows cool air' }, { word: 'map', family: '-ap', clue: 'it shows where to go' }
  ],
  grade1: [
    { word: 'ship', family: 'sh', clue: 'a boat' }, { word: 'chat', family: 'ch', clue: 'a friendly talk' },
    { word: 'thin', family: 'th', clue: 'not thick' }, { word: 'stop', family: 'st', clue: 'do not move' },
    { word: 'crab', family: 'cr', clue: 'an animal with claws' }, { word: 'plane', family: 'CVCe', clue: 'it flies in the sky' }
  ],
  grade2: [
    { word: 'train', family: 'ai', clue: 'it rolls on tracks' }, { word: 'green', family: 'ee', clue: 'a color' },
    { word: 'boat', family: 'oa', clue: 'it floats on water' }, { word: 'storm', family: 'or', clue: 'wind, rain, and thunder' },
    { word: 'coin', family: 'oi', clue: 'round money' }, { word: 'sunset', family: '2 syllables', clue: 'the sun going down' }
  ],
  grade3: [
    { word: 'replay', family: 're-', clue: 'play again' }, { word: 'unfair', family: 'un-', clue: 'not fair' },
    { word: 'jumping', family: '-ing', clue: 'leaping right now' }, { word: 'raced', family: '-ed', clue: 'moved fast in the past' },
    { word: 'giant', family: 'soft g', clue: 'very big' }, { word: 'sunshine', family: '2 syllables', clue: 'bright light from the sun' }
  ],
  grade4: [
    { word: 'action', family: '-tion', clue: 'something being done' }, { word: 'vision', family: '-sion', clue: 'the ability to see' },
    { word: 'transport', family: 'port', clue: 'carry from one place to another' }, { word: 'inspect', family: 'spect', clue: 'look at closely' },
    { word: 'telephone', family: 'tele', clue: 'a device for talking far away' }, { word: 'prediction', family: '-tion', clue: 'a thoughtful guess about what comes next' }
  ],
  grade5: [
    { word: 'extraordinary', family: 'context', clue: 'very unusual or remarkable' }, { word: 'photosynthesis', family: 'Greek roots', clue: 'how plants use light to make food' },
    { word: 'independence', family: 'context', clue: 'freedom to act on your own' }, { word: 'communication', family: '-tion', clue: 'sharing information' },
    { word: 'responsibility', family: 'fluency', clue: 'a duty you can be trusted to handle' }, { word: 'investigation', family: '-tion', clue: 'a careful search for facts' }
  ]
};

const DIGRAPHS = ['tion', 'sion', 'tch', 'dge', 'igh', 'sh', 'ch', 'th', 'ph', 'wh', 'ck', 'ng', 'ai', 'ee', 'oa', 'oi', 'ou', 'ar', 'or', 'er', 'ir', 'ur'];

export function normalizeLetters(letters) {
  return (Array.isArray(letters) ? letters.join('') : String(letters)).toLowerCase().replace(/[^a-z]/g, '');
}

export function blendLetters(letters) {
  return normalizeLetters(letters);
}

export function segmentWord(word) {
  const clean = normalizeLetters(word);
  const chunks = [];
  for (let i = 0; i < clean.length;) {
    const match = DIGRAPHS.find((part) => clean.startsWith(part, i));
    chunks.push(match || clean[i]);
    i += (match || clean[i]).length;
  }
  return chunks;
}

export function isCVC(word) {
  const clean = normalizeLetters(word);
  return clean.length === 3 && !VOWELS.has(clean[0]) && VOWELS.has(clean[1]) && !VOWELS.has(clean[2]);
}

export function generateCVC(family = '-at') {
  const ending = family.replace('-', '');
  const starts = ending === 'an' ? ['c', 'f', 'm', 'p', 'r', 't'] : ['b', 'c', 'h', 'm', 'p', 'r', 's'];
  return `${starts[Math.floor(Math.random() * starts.length)]}${ending}`;
}

export function wordsForLevel(level) {
  return WORD_BANK[level] || WORD_BANK.kindergarten;
}

export function randomWord(level, previous = '') {
  const words = wordsForLevel(level).filter((item) => item.word !== previous);
  return words[Math.floor(Math.random() * words.length)] || wordsForLevel(level)[0];
}

export function soundPopChoices(targetLetter) {
  const target = normalizeLetters(targetLetter)[0] || 'b';
  const distractors = LETTERS.filter((letter) => letter !== target).sort(() => Math.random() - 0.5).slice(0, 3);
  return [target, ...distractors].sort(() => Math.random() - 0.5);
}

export function changeInitialSound(word, nextInitial) {
  const clean = normalizeLetters(word);
  return `${normalizeLetters(nextInitial)[0] || ''}${clean.slice(1)}`;
}
