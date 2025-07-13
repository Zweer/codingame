/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 */

const n = Number.parseInt(readline()); // the number of temperatures to analyse
let temps = readline(); // the n temperatures expressed as integers ranging from -273 to 5526

if (n === 0) {
  print(0);
} else {
  printErr(temps);

  temps = temps.split(' ');

  let closest = Infinity;
  for (let i = 0, tot = temps.length; i < tot; ++i) {
    const temp = temps[i];

    if (temp * temp < closest * closest) {
      closest = temp;
    }

    if (temp * temp === closest * closest && temp > 0) {
      closest = temp;
    }
  }

  // Write an action using print()
  // To debug: printErr('Debug messages...');

  print(closest == Infinity ? 0 : closest);
}
