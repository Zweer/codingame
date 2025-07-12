/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/


// game loop
while (true) {
    var highest = {
        index: 0,
        height: 0
    };

    for (var i = 0; i < 8; i++) {
        var mountainH = parseInt(readline()); // represents the height of one mountain, from 9 to 0.

        if (mountainH > highest.height) {
            highest = {
                index: i,
                height: mountainH
            };
        }
    }

    // Write an action using print()
    // To debug: printErr('Debug messages...');

    print(highest.index); // The number of the mountain to fire on.
}
