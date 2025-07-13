/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 */

const N = Number.parseInt(readline());
const horses = [];
for (var i = 0; i < N; i++) {
  const pi = Number.parseInt(readline());
  horses.push(pi);
}

printErr(horses);
horses.sort((a, b) => {
  return a - b;
});

printErr(N);
printErr(horses);

let diff = 0;
let min = Infinity;
for (i = 0; i < N - 1; ++i) {
  diff = Math.abs(horses[i] - horses[i + 1]);

  if (diff < min) {
    min = diff;
  }
}

// Write an action using print()
// To debug: printErr('Debug messages...');

print(min);
