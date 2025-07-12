/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var N = parseInt(readline()); // Number of elements which make up the association table.
var Q = parseInt(readline()); // Number Q of file names to be analyzed.
var mimes = {};

for (var i = 0; i < N; i++) {
    var inputs = readline().replace(/\n/g, '').replace(/\r/g, '').split(' ');
    var EXT = inputs[0].toUpperCase(); // file extension
    var MT = inputs[1]; // MIME type.

    printErr(inputs);

    mimes[EXT] = MT;
}

printErr('-------------------------');

for (var i = 0; i < Q; i++) {
    var FNAME = readline().replace(/\n/g, '').replace(/\r/g, ''); // One file name per line.

    printErr(FNAME);

    var extIndex = FNAME.lastIndexOf('.') + 1;
    var ext = FNAME.substring(extIndex).toUpperCase();

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
