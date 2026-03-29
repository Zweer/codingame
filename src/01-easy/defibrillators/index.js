/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 */

Math.radians = function (degrees) {
  return degrees * Math.PI / 180;
};

const LON = readline().replace(',', '.');
const LAT = readline().replace(',', '.');
const me = {
  lon: Math.radians(LON),
  lat: Math.radians(LAT),
};

printErr(LON);
printErr(LAT);

const defibrillators = [];
const N = Number.parseInt(readline());
for (var i = 0; i < N; i++) {
  const input = readline();
  const DEFIB = input.split(';');

  printErr(input);

  defibrillators.push({
    id: DEFIB[0],
    name: DEFIB[1],
    address: DEFIB[2],
    phone: DEFIB[3],
    lon: Math.radians(DEFIB[4].replace(',', '.')),
    lat: Math.radians(DEFIB[5].replace(',', '.')),
  });
}

let min;
let curr;
let x;
let y;

for (var i = 0, tot = defibrillators.length; i < tot; ++i) {
  curr = defibrillators[i];

  x = (curr.lon - me.lon) * Math.cos((me.lat + curr.lat) / 2);
  y = (curr.lat - me.lat);
  curr.dist = Math.sqrt(x ** 2 + y ** 2) * 6371;

  if (min === undefined || min.dist > curr.dist) {
    min = curr;
  }
}

// Write an action using print()
// To debug: printErr('Debug messages...');

print(min.name);
