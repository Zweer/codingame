// Standard input/output for CodinGame
declare function readline(): string;
declare function print(message: string): void;

// Simple classes to hold entity data
class Enemy {
    constructor(
        public id: number,
        public x: number,
        public y: number,
        public hp: number
    ) {}
}

class Tower {
    constructor(
        public x: number,
        public y: number
    ) {}
}

function solve() {
    // Read map dimensions
    const inputs = readline().split(' ');
    const W = parseInt(inputs[0]);
    const H = parseInt(inputs[1]);

    // Initialize lists for towers and enemies
    let towers: Tower[] = [];
    let enemies: Enemy[] = [];
    let nextEnemyId = 0; // Used to assign unique IDs to enemies

    // Parse the initial map state
    for (let y = 0; y < H; y++) {
        const row = readline();
        for (let x = 0; x < W; x++) {
            const char = row[x];
            if (char === 'T') {
                towers.push(new Tower(x, y));
            } else if (char !== '.') { // It's an enemy (digit '0'-'9')
                enemies.push(new Enemy(nextEnemyId++, x, y, parseInt(char)));
            }
        }
    }

    let round = 0; // Start round count from 0, increment before each simulation

    // Pre-calculate tower positions in a 2D grid for efficient lookup during enemy movement
    const towerGrid: boolean[][] = Array.from({ length: H }, () => Array(W).fill(false));
    for (const tower of towers) {
        towerGrid[tower.y][tower.x] = true;
    }

    // Main game loop
    while (true) {
        round++; // Increment round number for the current turn

        // Phase 1: Tower Targeting
        // Map to store how many towers target each enemy (by enemy ID)
        const targetCounts = new Map<number, number>();

        for (const tower of towers) {
            const potentialTargets: { enemy: Enemy, dist: number }[] = [];

            // Find all enemies within the 5x5 targeting square of the current tower
            for (const enemy of enemies) {
                const dx = Math.abs(enemy.x - tower.x);
                const dy = Math.abs(enemy.y - tower.y);

                // A 5x5 square centered on (tx,ty) covers cells from (tx-2,ty-2) to (tx+2,ty+2)
                if (dx <= 2 && dy <= 2) {
                    const manhattanDist = dx + dy;
                    potentialTargets.push({ enemy, dist: manhattanDist });
                }
            }

            if (potentialTargets.length > 0) {
                // Sort potential targets based on prioritization criteria
                potentialTargets.sort((a, b) => {
                    // 1. Furthest NORTH (smallest Y-coordinate)
                    if (a.enemy.y !== b.enemy.y) {
                        return a.enemy.y - b.enemy.y; // Smaller Y comes first
                    }
                    // 2. Closest to the tower (Manhattan distance)
                    if (a.dist !== b.dist) {
                        return a.dist - b.dist; // Smaller distance comes first
                    }
                    // 3. Furthest EAST (largest X-coordinate)
                    return b.enemy.x - a.enemy.x; // Larger X comes first (descending order)
                });

                // The first enemy in the sorted list is the chosen target
                const chosenTarget = potentialTargets[0].enemy;
                targetCounts.set(chosenTarget.id, (targetCounts.get(chosenTarget.id) || 0) + 1);
            }
        }

        // Phase 2: Combat
        const remainingEnemies: Enemy[] = [];
        for (const enemy of enemies) {
            const damage = targetCounts.get(enemy.id) || 0;
            enemy.hp -= damage; // Reduce HP by damage received

            if (enemy.hp > 0) {
                // Keep enemy if HP is still positive
                remainingEnemies.push(enemy);
            }
            // If HP <= 0, enemy is destroyed and not added to remainingEnemies
        }
        enemies = remainingEnemies; // Update the list of active enemies

        // Check for WIN condition
        if (enemies.length === 0) {
            print(`WIN ${round}`);
            break; // Game ends
        }

        // Phase 3: Enemy Movement
        const enemiesAfterMovement: Enemy[] = [];
        let playerLost = false;

        for (const enemy of enemies) {
            enemy.y--; // Move NORTH one cell (decrease Y-coordinate)

            // Check for LOSE condition (enemy moves off the top of the map)
            if (enemy.y < 0) {
                playerLost = true;
                break; // Game ends, player loses
            }

            // Check if the enemy moved into a tower's cell
            // No need to check x bounds here as enemy.x doesn't change and is within W
            if (towerGrid[enemy.y][enemy.x]) {
                // Enemy is destroyed by moving into a tower, do not add to next round's list
            } else {
                // Enemy survives movement and collision check, add to next round's list
                enemiesAfterMovement.push(enemy);
            }
        }
        enemies = enemiesAfterMovement; // Update the list of active enemies after movement

        // Check for LOSE condition (from enemy moving off map)
        if (playerLost) {
            print(`LOSE ${round}`);
            break; // Game ends
        }
    }
}

// Call the solve function to start the game simulation
solve();