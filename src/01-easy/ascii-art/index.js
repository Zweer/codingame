/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 */

const L = Number.parseInt(readline());
const H = Number.parseInt(readline());
const T = readline().toUpperCase();
// printErr(T);
const ROWS = [];
let i;
let j;

for (i = 0; i < H; ++i) {
  ROWS[i] = readline();
  // printErr(ROWS[i]);
}

const lettersNum = ROWS[0].length / L;
const letters = [];
for (i = 0; i < lettersNum; ++i) {
  letters[i] = [];

  for (j = 0; j < H; ++j) {
    letters[i][j] = ROWS[j].substring(i * L, (i + 1) * L);
  }
}

const word = [];
for (i = 0; i < T.length; ++i) {
  const intChar = T[i].charCodeAt(0) - 65;

  if (letters[intChar] === undefined) {
    word[i] = letters[letters.length - 1];
    continue;
  }

  word[i] = letters[intChar];
}

for (i = 0; i < H; ++i) {
  let line = '';
  for (j = 0; j < T.length; ++j) {
    line += word[j][i];
  }

  print(line);
}

// Write an action using print()
// To debug: printErr('Debug messages...');

// print('answer');
