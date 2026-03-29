// Standard CodinGame input/output functions (declared by the platform)
declare function readline(): string;
declare function print(text: string): void;

/**
 * Calculates the points awarded for a dart throw at (x, y) on a target of given size.
 * The target consists of a square, an inscribed circle, and an inscribed diamond.
 *
 * @param x The X-coordinate of the dart throw.
 * @param y The Y-coordinate of the dart throw.
 * @param size The side length of the outermost square.
 * @returns The points awarded (15 for diamond, 10 for circle, 5 for square, 0 otherwise).
 */
function calculatePoints(x: number, y: number, size: number): number {
    const halfSize = size / 2; // This is also the radius of the circle and the "radius" of the diamond.

    // Darts landing on the edge are considered within the shape.
    // Check from the innermost shape outwards to ensure correct scoring priority.

    // Diamond: abs(x) + abs(y) <= halfSize
    if (Math.abs(x) + Math.abs(y) <= halfSize) {
        return 15;
    }

    // Circle: x^2 + y^2 <= radius^2
    // radius is halfSize, so radius^2 is halfSize * halfSize
    if (x * x + y * y <= halfSize * halfSize) {
        return 10;
    }

    // Square: -halfSize <= x <= halfSize AND -halfSize <= y <= halfSize
    // Which simplifies to: abs(x) <= halfSize AND abs(y) <= halfSize
    if (Math.abs(x) <= halfSize && Math.abs(y) <= halfSize) {
        return 5;
    }

    // Outside all shapes
    return 0;
}

// Main function to solve the puzzle
function solveDarts(): void {
    const SIZE = parseInt(readline());
    const N = parseInt(readline());

    // Map to store player data: name -> { score: number, order: number }
    // The 'order' property helps in tie-breaking, maintaining the original input order.
    const players = new Map<string, { score: number, order: number }>();

    for (let i = 0; i < N; i++) {
        const name = readline();
        players.set(name, { score: 0, order: i });
    }

    const T = parseInt(readline());

    for (let i = 0; i < T; i++) {
        const lineParts = readline().split(' ');
        const name = lineParts[0];
        const x = parseInt(lineParts[1]);
        const y = parseInt(lineParts[2]);

        const points = calculatePoints(x, y, SIZE);

        // Update the player's score
        const playerData = players.get(name);
        if (playerData) {
            playerData.score += points;
            // No need to set back to map if playerData is an object reference,
            // but explicitly doing so ensures clarity/safety if Map behavior were different.
            players.set(name, playerData); 
        }
    }

    // Convert the map values to an array for sorting.
    const sortedPlayers = Array.from(players.entries()).map(([name, data]) => ({
        name: name,
        score: data.score,
        order: data.order
    }));

    // Sort the players based on scoring rules:
    // 1. Descending by score (higher score first).
    // 2. Ascending by original input order for ties (earlier in list first).
    sortedPlayers.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score; // Sort by score descending
        }
        return a.order - b.order; // Sort by original order ascending for ties
    });

    // Print the results
    for (const player of sortedPlayers) {
        print(`${player.name} ${player.score}`);
    }
}

// Execute the main function
solveDarts();