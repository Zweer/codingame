/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var L = parseInt(readline());
var H = parseInt(readline());
var T = readline().toUpperCase();
// printErr(T);
var ROWS = [];
var i;
var j;

for (i = 0; i < H; ++i) {
    ROWS[i] = readline();
    // printErr(ROWS[i]);
}

var lettersNum = ROWS[0].length / L;
var letters = [];
for (i = 0; i < lettersNum; ++i) {
    letters[i] = [];

    for (j = 0; j < H; ++j) {
        letters[i][j] = ROWS[j].substring(i * L, (i + 1) * L);
    }
}

var word = [];
for (i = 0; i < T.length; ++i) {
    var intChar = T[i].charCodeAt(0) - 65;

    if (letters[intChar] === undefined) {
        word[i] = letters[letters.length - 1];
        continue;
    }

    word[i] = letters[intChar];
}

for (i = 0; i < H; ++i) {
    var line = '';
    for (j = 0; j < T.length; ++j) {
        line += word[j][i];
    }

    print(line);
}

// Write an action using print()
// To debug: printErr('Debug messages...');

// print('answer');
