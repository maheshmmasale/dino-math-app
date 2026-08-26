// Story copy lives apart from the generators so narrative and curriculum can evolve independently.
export const phonicsStories = {
  kindergarten: { title: 'The first sound-saurus parade', text: 'At Phonics Lagoon, little letter dinos discover that every letter has a sound. When C, A, and T hold hands, their sounds slide together and wake a sleepy cat!' },
  grade1: { title: 'The digraph twins find one voice', text: 'S and H stomp in from different caves. When they hold hands, they share one quiet shhh sound and guide a ship safely across the lagoon.' },
  grade2: { title: 'Two vowels on the long trail', text: 'A and I travel side by side through the rain. Their vowel team makes a strong new sound, and the Alpha Dinos cheer as the word train rolls into view.' },
  grade3: { title: 'The word-part expedition', text: 'Rex finds re at the start of play and learns that replay means play again. Useful prefixes and suffixes help the herd unlock bigger words.' },
  grade4: { title: 'The ancient root cave', text: 'Deep in Root Cave, the dinos find port, a word part meaning carry. It helps them decode transport, portable, and export without guessing.' },
  grade5: { title: 'The fluent fossil reader', text: 'Maya the Mosasaurus reads a challenging sentence in meaningful phrases. She checks each complex word, then rereads smoothly so the whole idea shines.' }
};

export function phonicsStory(level) {
  return phonicsStories[level] || phonicsStories.kindergarten;
}

export function story(kind, data = {}) {
  const stories = {
    count: [`Bindi the Brontosaurus found ${data.n} shiny claw-casts and balanced them on her head. She sneezed, they rattled, and she counted them again with a giggle!`, 'Counting each object once tells how many are in the set. Point to every claw as you count.'],
    before: [`Tiko the Triceratops lines up ${data.n} friends. Which number stands right BEFORE ${data.n}?`, `Before ${data.n} is ${data.n - 1}. Count backward one step.`],
    after: [`Tiko's parade marches to ${data.n}. Who comes right AFTER?`, `After ${data.n} is ${data.n + 1}. Count forward one step.`],
    missing: [`Some number eggs rolled away from ${data.start}'s line! Find the missing number.`, 'Look at the sequence, find the hole, fill it with the right number.'],
    asc: [`Dinos want to line up smallest to biggest. Help them ascend!`, 'Ascending order means smallest to biggest, like climbing up.'],
    desc: [`Biggest dinos first! Order them descending.`, 'Descending order means biggest to smallest, like sliding down.'],
    prime: [`Is ${data.n} prime? Prime dinos cannot be split into equal groups!`, 'Prime numbers have only two factors: 1 and itself.'],
    order: [`Order these dino numbers from smallest to biggest!`, 'Compare numbers to order them ascending.'],
    skip: [`Bongo the Bronto tiptoes in jumps of ${data.step}: ${data.start}, ${data.a}, ${data.b}… His enormous tail keeps the beat, but his tiny hat keeps falling off!`, `The same amount is added at every stomp. Add ${data.step} one more time.`],
    place: [`Pico painted ${data.n} on a giant egg using one careful claw. Then he sat on the paint and wore the number on his tail!`, "A digit's position tells its value. Find the digit in the tens place."],
    compare: [`Two long-necks compare horn piles: one has ${data.a} and the other has ${data.b}. They stretch so high to peek that their noses bump—bonk!`, 'Compare the greatest place value first. The first different digit decides which number is greater.'],
    addMissing: [`Tina the T-Rex wants ${data.sum} dino-cookies, but her tiny arms can hold only the ${data.a} she found first. She stomps in a flour cloud while a friend brings the missing batch!`, `The missing addend is the part still needed: ${data.sum} − ${data.a}.`],
    add: [`Tina the T-Rex baked ${data.a} dino-cookies, then Rex rolled in ${data.b} more on a wobbly bone tray. Her tiny arms drop one tray—but the cookies land in a perfect pile!`, `Addition joins two groups. Combine ${data.a} and ${data.b} to find the whole.`],
    subtractMissing: [`Trixie the Triceratops stacked ${data.total} horn rings for a parade. A tail-swish sent some rolling away, leaving ${data.remain} while Trixie trumpeted, “Whoops-a-saurus!”`, 'A missing part is found by subtracting the part left from the whole.'],
    subtract: [`Trixie balanced ${data.a} smooth bones on her three horns. A hiccup launched ${data.b} into the swamp, and even the frogs looked surprised!`, 'Subtraction finds what remains after a part is taken away.'],
    parity: [`Rory the Raptor pairs ${data.n} claw marks two at a time for a secret dance. If one mark is left alone, Rory gives it a tiny top hat!`, 'Even numbers make pairs with none left over. Odd numbers leave one alone.'],
    repeat: ['Rory decorates the path with a secret repeating code and challenges the herd to copy it. He chirps so fast that his own feet start dancing!', 'A repeating pattern starts over after its complete unit.'],
    sequence: [`Four raptors hop across number stones, adding ${data.step} on every landing. The fifth raptor tries to moonwalk and needs your number clue!`, 'Find the rule, then use it one more time.'],
    time: [`Stella the Stegosaurus promised to ring the bone-bell at ${data.label}. She is wearing the clock like a necklace because she forgot where clocks go!`, 'The short hand tells the hour. The long hand counts minutes by fives.'],
    money: [`Stella brings ${data.q} ${data.coinA}¢ fossil token${data.q === 1 ? '' : 's'} and ${data.d} ${data.coinB}¢ token${data.d === 1 ? '' : 's'} to the bone shop. Her back plates jingle so loudly that the shopkeeper starts dancing!`, 'Multiply each token count by its value, then add the amounts.'],
    length: [`Stella measures two fossil footprints: ${data.a} ${data.unit} and ${data.b} ${data.unit}. Her tail keeps covering the ruler, so she politely asks it to scoot!`, 'Compare lengths only when they use the same unit.'],
    shape: [`Perry the Pterodactyl discovers a ${data.name}-shaped canyon door and tries to wear it as a hat. It only fits after he counts every side!`, 'Count the straight sides all the way around the shape.'],
    fraction: [`Perry snaps a crunchy bone-biscuit into ${data.den} equal pieces and gobbles ${data.num}. He saves the rest, although his beak keeps pointing toward it!`, 'A fraction names equal parts: the top number counts chosen parts; the bottom counts all equal parts.'],
    rectangle: [`Perry builds a rectangular landing nest ${data.w} units long and ${data.h} units wide. He lands sideways, spins twice, and declares the math runway perfect!`, data.area ? 'Area counts square units inside: length × width.' : 'Perimeter measures the edge: add every side.'],
    share: [`Annie the Ankylosaurus rolls ${data.total} bone treats toward ${data.a} baby dinos. Her club tail is an excellent scoop but a terrible spoon!`, 'Division makes equal groups. Ask how many go in each group.'],
    multiply: [`Annie stacks ${data.a} armor-plated trays with ${data.b} eggs on each one. One tail thump makes every egg bounce—without cracking a single shell!`, `Equal groups can be added repeatedly or written as multiplication: ${data.a} × ${data.b}.`],
    round: [`Milo the Mosasaurus counted ${data.n} bubbles, but his notebook turned soggy soup. He wants a nearby friendly number before the next wave arrives!`, 'To round to the nearest 10, compare the ones digit with 5.'],
    estimate: [`Milo spots ${data.a} bubbles on one side and ${data.b} on the other. He needs a speedy estimate before they pop on his nose!`, 'Round each number to the nearest ten, then add the rounded numbers.'],
    logic: [`Milo's three splashy friends wear shell numbers ${(data.nums || []).join(', ')}. The greatest number gets to wear the ridiculous seaweed crown—just for today!`, 'Greater numbers sit farther to the right on a number line.'],
    twoStep: [`Milo collects ${data.start} shells, splashes up ${data.add} more, then trades ${data.take} for a shiny horn cap. He puts it on backward and calls it reef fashion!`, 'Solve in story order: first add, then subtract. Keep the result from step one.']
  };
  const entry = stories[kind] || stories.count;
  const [title, teach] = entry;
  return { title, teach };
}
