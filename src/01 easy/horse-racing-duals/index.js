/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var N = parseInt(readline());
var horses = []
for (var i = 0; i < N; i++) {
    var pi = parseInt(readline());
    horses.push(pi);
}

printErr(horses);
horses.sort(function (a, b) {
    return a - b;
});

printErr(N);
printErr(horses);

var diff = 0;
var min = Infinity;
for (i = 0; i < N - 1; ++i) {
    diff = Math.abs(horses[i] - horses[i + 1]);

    if (diff < min) {
        min = diff;
    }
}

// Write an action using print()
// To debug: printErr('Debug messages...');

print(min);
