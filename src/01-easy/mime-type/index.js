/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 */

const N = Number.parseInt(readline()); // Number of elements which make up the association table.
const Q = Number.parseInt(readline()); // Number Q of file names to be analyzed.
const mimes = {};

for (var i = 0; i < N; i++) {
  const inputs = readline().replace(/\n/g, '').replace(/\r/g, '').split(' ');
  const EXT = inputs[0].toUpperCase(); // file extension
  const MT = inputs[1]; // MIME type.

  printErr(inputs);

  mimes[EXT] = MT;
}

printErr('-------------------------');

for (var i = 0; i < Q; i++) {
  const FNAME = readline().replace(/\n/g, '').replace(/\r/g, ''); // One file name per line.

  printErr(FNAME);

  const extIndex = FNAME.lastIndexOf('.') + 1;
  const ext = FNAME.substring(extIndex).toUpperCase();

  if (extIndex === 0) {
    print('UNKNOWN');
    continue;
  }

  printErr(extIndex);

  if (mimes[ext] !== undefined) {
    print(mimes[ext]);
  } else {
    print('UNKNOWN');
  }

  printErr('---------------');
}

// Write an action using print()
// To debug: printErr('Debug messages...');

// For each of the Q filenames, display on a line the corresponding MIME type. If there is no corresponding type, then display UNKNOWN.
// print('UNKNOWN');
