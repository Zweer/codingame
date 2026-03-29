// Standard input/output functions provided by CodinGame
declare function readline(): string;
declare function print(message: string): void;
declare function printErr(message: string): void; // For debugging

// Define constants for cell types
enum TileType {
    EMPTY = ".",
    WALL = "#",
    MINE = "M",
    TAVERN = "T",
    SPAWN_0 = "0",
    SPAWN_1 = "1",
    SPAWN_2 = "2",
    SPAWN_3 = "3",
}

interface Point {
    x: number;
    y: number;
}

interface BoardCell extends Point {
    type: TileType;
}

interface Hero extends Point {
    id: number;
    life: number;
    gold: number;
    mineCount: number;
    spawnPos: Point; // Initial spawn position
}

interface Mine extends Point {
    id: number; // Owner ID: -1 for neutral, 0-3 for hero ID
}

// Global game state variables (initial setup)
let boardSize: number;
const initialBoard: BoardCell[][] = []; // Stores static map features (walls, taverns, initial mines, spawn points)
let myHeroId: number;
const heroSpawnPoints: Point[] = new Array(4); // Indexed by hero ID (0-3)
const taverns: Point[] = [];
const initialMines: Point[] = []; // Initial positions of mines

// Helper to calculate Manhattan distance
function manhattanDistance(p1: Point, p2: Point): number {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

// Function to find closest target of a certain type
function findClosestTarget<T extends { x: number; y: number }>(
    myHeroPos: Point,
    targets: T[]
): T | null {
    if (targets.length === 0) {
        return null;
    }

    let closestTarget: T | null = null;
    let minDistance = Infinity;

    for (const target of targets) {
        const dist = manhattanDistance(myHeroPos, target);
        if (dist < minDistance) {
            minDistance = dist;
            closestTarget = target;
        }
    }
    return closestTarget;
}

// --- Initial Input Parsing ---
const sizeLine = readline();
boardSize = parseInt(sizeLine);

for (let y = 0; y < boardSize; y++) {
    const row = readline();
    initialBoard[y] = [];
    for (let x = 0; x < boardSize; x++) {
        const char = row[x];
        const cell: BoardCell = { x, y, type: char as TileType };
        initialBoard[y][x] = cell;

        if (char === TileType.TAVERN) {
            taverns.push({ x, y });
        } else if (char === TileType.MINE) {
            initialMines.push({ x, y });
        } else if (char >= '0' && char <= '3') {
            const heroId = parseInt(char);
            heroSpawnPoints[heroId] = { x, y };
        }
    }
}
myHeroId = parseInt(readline());
printErr(`My Hero ID: ${myHeroId}`);
// printErr("EXPERT_INPUT"); // Uncomment this line to enable expert input for debugging

// --- Game Loop ---
while (true) {
    const heroes: Hero[] = [];
    const mines: Mine[] = []; // These are dynamic, updated each turn

    let myHero: Hero | null = null;

    const entityCount = parseInt(readline());
    for (let i = 0; i < entityCount; i++) {
        const inputs = readline().split(' ');
        const type = inputs[0];
        const id = parseInt(inputs[1]);
        const x = parseInt(inputs[2]);
        const y = parseInt(inputs[3]);
        const life = parseInt(inputs[4]);
        const gold = parseInt(inputs[5]);

        if (type === "HERO") {
            // Ensure spawnPos is correctly set from pre-parsed data
            const hero: Hero = { id, x, y, life, gold, mineCount: 0, spawnPos: heroSpawnPoints[id] };
            heroes.push(hero);
            if (id === myHeroId) {
                myHero = hero;
            }
        } else if (type === "MINE") {
            mines.push({ x, y, id }); // id here is owner ID (-1 for neutral)
        }
    }

    // Update mine counts for heroes
    for (const hero of heroes) {
        hero.mineCount = mines.filter(m => m.id === hero.id).length;
    }

    // --- Bot Decision Logic ---
    let nextMove: string = "WAIT"; // Default action
    let targetReason: string = "No clear target"; // For debugging

    if (!myHero) {
        // This case should ideally not happen in a valid game, but for safety
        print("WAIT");
        continue;
    }

    // Filter mines by ownership
    const neutralMines = mines.filter(m => m.id === -1);
    const enemyMines = mines.filter(m => m.id !== -1 && m.id !== myHeroId);

    let targetPoint: Point | null = null;

    // Priority 1: Urgent Healing (if very low HP and can afford it)
    // A hit from a mine goblin or an enemy hero costs 20 HP.
    // If HP <= 20, one hit could kill. Better to heal ASAP if possible.
    if (myHero.life <= 20 && myHero.gold >= 2) {
        const closestTavern = findClosestTarget(myHero, taverns);
        if (closestTavern) {
            targetPoint = closestTavern;
            targetReason = "Urgent Healing (HP <= 20)";
        }
    }

    // Priority 2: Healing if low HP and can afford it
    // Check if current position is a tavern and if already at max HP.
    // If at tavern and full HP, don't try to heal more.
    const atTavern = taverns.some(t => t.x === myHero.x && t.y === myHero.y);
    if (!targetPoint && myHero.life <= 50 && myHero.gold >= 2) {
        if (atTavern && myHero.life === 100) {
            // Already at tavern and full HP, move to next priority.
            printErr("At tavern and full HP, seeking other target.");
        } else {
            const closestTavern = findClosestTarget(myHero, taverns);
            if (closestTavern) {
                targetPoint = closestTavern;
                targetReason = "Healing (HP <= 50)";
            }
        }
    }

    // Priority 3: Capture Neutral Mines
    if (!targetPoint && neutralMines.length > 0) {
        const closestNeutralMine = findClosestTarget(myHero, neutralMines);
        if (closestNeutralMine) {
            targetPoint = closestNeutralMine;
            targetReason = "Capturing Neutral Mine";
        }
    }

    // Priority 4: Attack / Capture Enemy Mines
    // A simple approach: find the closest enemy mine.
    // More advanced: prioritize mines of low-HP enemies or enemies with many mines.
    if (!targetPoint && enemyMines.length > 0) {
        const closestEnemyMine = findClosestTarget(myHero, enemyMines);
        if (closestEnemyMine) {
            targetPoint = closestEnemyMine;
            targetReason = "Capturing Enemy Mine";
        }
    }
    
    // Priority 5: Attack adjacent weak/rich heroes
    // Identify heroes that are one step away AND are low on HP or have many mines.
    // Attacking doesn't cost HP for the attacker, but if the enemy dies, we get their mines.
    // This is a simple opportunistic attack.
    if (!targetPoint) {
        for (const opponent of heroes) {
            if (opponent.id === myHeroId) continue; // Don't target self

            const dist = manhattanDistance(myHero, opponent);
            // Check if adjacent (distance 1)
            if (dist === 1) {
                // If opponent is very low HP or has significantly more mines, attack!
                // Arbitrary threshold: if opponent has <= 40 HP (two hits from full),
                // or has more than 2 mines than us.
                if (opponent.life <= 40 || opponent.mineCount > myHero.mineCount + 2) {
                    targetPoint = opponent;
                    targetReason = `Attacking weak/rich opponent ${opponent.id}`;
                    break;
                }
            }
        }
    }

    // Fallback: If no specific target, WAIT
    if (targetPoint) {
        nextMove = `MOVE ${targetPoint.x} ${targetPoint.y}`;
    } else {
        nextMove = "WAIT"; // If nothing else to do, just wait.
        targetReason = "Waiting (no active goal or current goals satisfied)";
    }

    printErr(`Hero ${myHeroId} at (${myHero.x},${myHero.y}) - HP: ${myHero.life}, Gold: ${myHero.gold}, Mines: ${myHero.mineCount}`);
    printErr(`Decision: ${nextMove} (Reason: ${targetReason})`);

    print(nextMove);
}