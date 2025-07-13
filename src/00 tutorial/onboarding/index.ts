/**
 * The while loop represents the game.
 * Each iteration represents a turn in the game
 * where you are given inputs (the two closest enemy and their distance)
 * and output a command to destroy a ship.
 */
while (true) {
    // Read the first enemy's data
    // enemy1: name of enemy 1
    // dist1: distance to enemy 1
    const enemy1Data: string[] = readline().split(' ');
    const enemy1: string = enemy1Data[0];
    const dist1: number = parseInt(enemy1Data[1]);

    // Read the second enemy's data
    // enemy2: name of enemy 2
    // dist2: distance to enemy 2
    const enemy2Data: string[] = readline().split(' ');
    const enemy2: string = enemy2Data[0];
    const dist2: number = parseInt(enemy2Data[1]);

    // Determine which enemy is closer and output its name
    if (dist1 < dist2) {
        // If enemy1 is closer, target enemy1
        console.log(enemy1);
    } else {
        // If enemy2 is closer or at the same distance, target enemy2
        console.log(enemy2);
    }
}