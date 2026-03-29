// In CodinGame, readline is provided globally. This declaration helps TypeScript.
declare function readline(): string;

/**
 * Represents a parsed sentence.
 * For a sentence "S > P1 > ... > Pk = V":
 * - speaker: S
 * - chain: [P1, ..., P(k-1)]
 * - subject: Pk
 * - value: V ('T' or 'L')
 */
interface Sentence {
  speaker: number;
  chain: number[];
  subject: number;
  value: 'T' | 'L';
}

/**
 * Parses a sentence string into a Sentence object.
 * @param s The raw sentence string, e.g., "2>3>0=T".
 * @returns A structured Sentence object.
 */
function parseSentence(s: string): Sentence {
  const [peoplePart, valuePart] = s.split('=');
  const people = peoplePart.split('>').map(Number);

  const speaker = people[0];
  const subject = people[people.length - 1];
  // The chain consists of the people between the speaker and the subject.
  const chain = people.slice(1, -1);
  const value = valuePart as 'T' | 'L';

  return { speaker, chain, subject, value };
}

/**
 * Generates all combinations of k elements from a given source array.
 * @param source The array to choose elements from.
 * @param k The number of elements to choose.
 * @returns An array of arrays, where each inner array is a combination.
 */
function combinations<T>(source: T[], k: number): T[][] {
  if (k < 0 || k > source.length) {
    return [];
  }
  if (k === 0) {
    return [[]];
  }
  if (source.length === 0) {
    return [];
  }

  const [first, ...rest] = source;

  const combsWithFirst = combinations(rest, k - 1).map(comb => [first, ...comb]);
  const combsWithoutFirst = combinations(rest, k);

  return [...combsWithFirst, ...combsWithoutFirst];
}

/**
 * Checks if a single sentence is consistent with a given set of liars.
 * @param sentence The sentence to check.
 * @param liarSet The current hypothesis for the set of liars.
 * @returns True if the sentence is consistent, false otherwise.
 */
function checkSentenceConsistency(sentence: Sentence, liarSet: Set<number>): boolean {
  const isTruthteller = (person: number): boolean => !liarSet.has(person);

  // 1. Evaluate the truth of the core claim about the subject.
  // The claim is "the subject is a truthteller" if value is 'T'.
  // The actual status is isTruthteller(subject).
  // The claim is true if these two match.
  let effectiveTruth = (isTruthteller(sentence.subject) === (sentence.value === 'T'));

  // 2. Propagate this truth back through the chain of reporters.
  // We iterate in reverse, from the person closest to the subject.
  for (let i = sentence.chain.length - 1; i >= 0; i--) {
    const personInChain = sentence.chain[i];
    // A truthteller passes the truth value as is. A liar inverts it.
    // This is equivalent to checking if their nature matches the statement's truth.
    effectiveTruth = (isTruthteller(personInChain) === effectiveTruth);
  }

  // 3. Finally, check if the speaker's statement is consistent with their nature.
  // A truthteller must report a true statement. A liar must report a false one.
  return isTruthteller(sentence.speaker) === effectiveTruth;
}

// --- Main script logic ---

// 1. Read inputs
const N: number = Number.parseInt(readline());
const L: number = Number.parseInt(readline());
const sentences: Sentence[] = [];
for (let i = 0; i < N; i++) {
  const line = readline();
  sentences.push(parseSentence(line));
}

// 2. Generate all possible sets of liars
const people = Array.from({ length: N }, (_, i) => i);
const liarCombinations = combinations(people, L);

// 3. Find the one valid combination by testing each one
for (const potentialLiars of liarCombinations) {
  const liarSet = new Set(potentialLiars);

  let allSentencesConsistent = true;
  for (const sentence of sentences) {
    if (!checkSentenceConsistency(sentence, liarSet)) {
      allSentencesConsistent = false;
      break;
    }
  }

  if (allSentencesConsistent) {
    // We found the solution. The problem guarantees a unique one.
    const sortedLiars = potentialLiars.sort((a, b) => a - b);
    console.log(sortedLiars.join(' '));
    // Exit since the solution is unique.
    break;
  }
}
