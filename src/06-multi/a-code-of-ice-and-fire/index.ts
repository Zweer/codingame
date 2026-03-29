// Define constants
const MAP_SIZE = 12;
const HQ_TRAINING_COST = 10; // For level 1 units

// Helper types
enum Owner {
    ME = 0,
    OPPONENT = 1,
    NEUTRAL = -1,
    VOID = -2
}

enum BuildingType {
    HQ = 0,
    MINE = 1, // Not used in Wood 4
    TOWER = 2 // Not used in Wood 4
}

interface Point {
    x: number;
    y: number;
}

interface Cell extends Point {
    type: string; // '#', '.', 'O', 'X', 'o', 'x'
    owner: Owner;
    active: boolean; // Relevant only for owned cells
}

interface Building extends Point {
    owner: Owner;
    type: BuildingType;
}

interface Unit extends Point {
    id: number;
    owner: Owner;
    level: number;
}

// Global game state (updated each turn)
let myGold: number;
let myIncome: number;
let opponentGold: number;
let opponentIncome: number;
let board: Cell[][];
let buildings: Building[];
let units: Unit[];
let myUnits: Unit[];
let opponentUnits: Unit[];
let myHQ: Building;
let opponentHQ: Building;

// Read input functions (from CG environment)
declare function readline(): string;
declare function print(...args: any[]): void;

// --- Helper Functions ---

function isValid(x: number, y: number): boolean {
    return x >= 0 && x < MAP_SIZE && y >= 0 && y < MAP_SIZE;
}

function getNeighbors(x: number, y: number): Point[] {
    const neighbors: Point[] = [];
    if (isValid(x - 1, y)) neighbors.push({ x: x - 1, y: y });
    if (isValid(x + 1, y)) neighbors.push({ x: x + 1, y: y });
    if (isValid(x, y - 1)) neighbors.push({ x: x, y: y - 1 });
    if (isValid(x, y + 1)) neighbors.push({ x: x, y: y + 1 });
    return neighbors;
}

function manhattanDistance(p1: Point, p2: Point): number {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

// --- Game Loop ---

// Initialisation input (not used for Wood 4 beyond reading it)
const numberMineSpots: number = parseInt(readline()); // Mines are not used in Wood 4
for (let i = 0; i < numberMineSpots; i++) {
    const inputs: string[] = readline().split(' ');
    const x: number = parseInt(inputs[0]);
    const y: number = parseInt(inputs[1]);
}

// Game loop
while (true) {
    myGold = parseInt(readline());
    myIncome = parseInt(readline());
    opponentGold = parseInt(readline());
    opponentIncome = parseInt(readline());

    board = Array(MAP_SIZE).fill(0).map(() => Array(MAP_SIZE).fill(null));
    for (let y = 0; y < MAP_SIZE; y++) {
        const row: string = readline();
        for (let x = 0; x < MAP_SIZE; x++) {
            const typeChar = row[x];
            let owner: Owner = Owner.NEUTRAL;
            let active = false;

            switch (typeChar) {
                case '#': owner = Owner.VOID; active = false; break;
                case '.': owner = Owner.NEUTRAL; active = false; break;
                case 'O': owner = Owner.ME; active = true; break;
                case 'X': owner = Owner.OPPONENT; active = true; break;
                case 'o': owner = Owner.ME; active = false; break;
                case 'x': owner = Owner.OPPONENT; active = false; break;
            }
            board[y][x] = { x, y, type: typeChar, owner, active };
        }
    }

    buildings = [];
    myUnits = [];
    opponentUnits = [];
    myHQ = null as any; // Will be assigned
    opponentHQ = null as any; // Will be assigned

    const buildingCount: number = parseInt(readline());
    for (let i = 0; i < buildingCount; i++) {
        const inputs: string[] = readline().split(' ');
        const owner: Owner = parseInt(inputs[0]);
        const type: BuildingType = parseInt(inputs[1]);
        const x: number = parseInt(inputs[2]);
        const y: number = parseInt(inputs[3]);
        const building: Building = { x, y, owner, type };
        buildings.push(building);
        if (type === BuildingType.HQ) {
            if (owner === Owner.ME) myHQ = building;
            else opponentHQ = building;
        }
    }

    units = [];
    const unitCount: number = parseInt(readline());
    for (let i = 0; i < unitCount; i++) {
        const inputs: string[] = readline().split(' ');
        const owner: Owner = parseInt(inputs[0]);
        const id: number = parseInt(inputs[1]);
        const level: number = parseInt(inputs[2]);
        const x: number = parseInt(inputs[3]);
        const y: number = parseInt(inputs[4]);
        const unit: Unit = { x, y, owner, id, level };
        units.push(unit);
        if (owner === Owner.ME) myUnits.push(unit);
        else opponentUnits.push(unit);
    }

    const actions: string[] = [];
    const occupiedCells = new Set<string>(); // Keep track of cells that will be occupied after moves/trains in this turn

    // Add existing buildings to occupied cells to prevent moves/trains on them
    buildings.forEach(b => occupiedCells.add(`${b.x},${b.y}`));
    // Add existing friendly units' current positions to occupiedCells.
    // Their positions become free *after* their move is planned.
    myUnits.forEach(u => occupiedCells.add(`${u.x},${u.y}`));


    // --- Unit Movement Logic ---
    // Sort my units by ID (stable order for deterministic behavior)
    myUnits.sort((a, b) => a.id - b.id);

    for (const unit of myUnits) {
        let targetX = opponentHQ.x;
        let targetY = opponentHQ.y;
        
        // Priority 1: Attack enemy HQ if adjacent
        if (manhattanDistance(unit, opponentHQ) === 1) {
            targetX = opponentHQ.x;
            targetY = opponentHQ.y;
        } else {
            // Priority 2: Attack closest adjacent enemy unit
            let closestEnemyUnit: Unit | null = null;
            let minDistToEnemyUnit = Infinity;
            for (const enemyUnit of opponentUnits) {
                const dist = manhattanDistance(unit, enemyUnit);
                if (dist === 1 && dist < minDistToEnemyUnit) {
                    closestEnemyUnit = enemyUnit;
                    minDistToEnemyUnit = dist;
                }
            }
            if (closestEnemyUnit) {
                targetX = closestEnemyUnit.x;
                targetY = closestEnemyUnit.y;
            } else {
                // Priority 3: No immediate adjacent attack target.
                // Default target remains opponentHQ. The game engine moves unit 1 step closer.
            }
        }
        
        const destinationKey = `${targetX},${targetY}`;
        const targetCellBoard = board[targetY][targetX];

        // Validation for the target:
        // 1. Cannot move to void cell.
        if (targetCellBoard.type === '#') {
            continue; 
        }
        // 2. Cannot move to a cell already occupied by a friendly building.
        const isTargetFriendlyBuilding = buildings.some(b => b.owner === Owner.ME && b.x === targetX && b.y === targetY);
        if (isTargetFriendlyBuilding) {
            continue;
        }
        // 3. Cannot move to a cell that is already planned to be occupied by another friendly unit's move OR
        //    is currently occupied by a friendly unit that *has not yet moved* to a different spot.
        //    However, if the target is an enemy unit/HQ or a neutral cell, it's considered an attack/capture,
        //    and the existing unit is replaced/defeated.
        if (occupiedCells.has(destinationKey) && targetCellBoard.owner === Owner.ME) {
            // If the destination is occupied by a friendly element (either current unit or another planned unit/building)
            // AND it's a friendly owned cell (not an enemy/neutral cell that would imply attack/capture), then skip this move.
            continue;
        }
        
        // At this point, the target (targetX, targetY) is valid for the unit to move to.
        actions.push(`MOVE ${unit.id} ${targetX} ${targetY}`);
        
        // Update occupiedCells:
        // The unit's original position is now free.
        occupiedCells.delete(`${unit.x},${unit.y}`);
        // The unit's new (intended) position is now occupied.
        occupiedCells.add(destinationKey);
    }


    // --- Unit Training Logic ---
    const myActiveCells: Point[] = [];
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const cell = board[y][x];
            if (cell.owner === Owner.ME && cell.active) {
                myActiveCells.push({ x, y });
            }
        }
    }

    const potentialTrainCells = new Set<string>(); // Use a set to avoid duplicates

    for (const cellPos of myActiveCells) {
        // Can train on the active cell itself
        potentialTrainCells.add(`${cellPos.x},${cellPos.y}`);
        // Can train on its direct neighbors (territory or neighborhood)
        for (const neighbor of getNeighbors(cellPos.x, cellPos.y)) {
            potentialTrainCells.add(`${neighbor.x},${neighbor.y}`);
        }
    }

    const filteredTrainSpots: Point[] = [];
    for (const key of potentialTrainCells) {
        const [x, y] = key.split(',').map(Number);
        const cell = board[y][x];

        // Cannot train on void, active enemy territory, or a spot already occupied by a building/unit this turn
        if (cell.type === '#' || (cell.owner === Owner.OPPONENT && cell.active) || occupiedCells.has(key)) {
            continue;
        }
        filteredTrainSpots.push({ x, y });
    }

    // Sort training spots by priority:
    // 1. Neutral cells: best for expansion
    // 2. Opponent inactive cells: good for reclaiming/expanding
    // 3. My own active cells: good for defending/massing
    // Within each category, prioritize those closer to opponent HQ.
    filteredTrainSpots.sort((a, b) => {
        const cellA = board[a.y][a.x];
        const cellB = board[b.y][b.x];

        // Priority 1: Neutral cells
        const isNeutralA = cellA.owner === Owner.NEUTRAL;
        const isNeutralB = cellB.owner === Owner.NEUTRAL;
        if (isNeutralA && !isNeutralB) return -1;
        if (!isNeutralA && isNeutralB) return 1;

        // Priority 2: Opponent inactive cells
        const isOpponentInactiveA = cellA.owner === Owner.OPPONENT && !cellA.active;
        const isOpponentInactiveB = cellB.owner === Owner.OPPONENT && !cellB.active;
        if (isOpponentInactiveA && !isOpponentInactiveB) return -1;
        if (!isOpponentInactiveA && isOpponentInactiveB) return 1;

        // Priority 3: My active cells (can be used to mass units or reinforce)
        const isMyActiveA = cellA.owner === Owner.ME && cellA.active;
        const isMyActiveB = cellB.owner === Owner.ME && cellB.active;
        if (isMyActiveA && !isMyActiveB) return -1; 
        if (!isMyActiveA && isMyActiveB) return 1;

        // Finally, closer to opponent HQ (general direction of advance)
        return manhattanDistance(a, opponentHQ) - manhattanDistance(b, opponentHQ);
    });

    // Train units until gold runs out or no more valid spots
    while (myGold >= HQ_TRAINING_COST) {
        let trainedThisTurn = false;
        for (let i = 0; i < filteredTrainSpots.length; i++) {
            const spot = filteredTrainSpots[i];
            const spotKey = `${spot.x},${spot.y}`;

            if (!occupiedCells.has(spotKey)) {
                actions.push(`TRAIN 1 ${spot.x} ${spot.y}`);
                myGold -= HQ_TRAINING_COST;
                occupiedCells.add(spotKey); // Mark as occupied by the new unit
                trainedThisTurn = true;
                filteredTrainSpots.splice(i, 1); // Remove this spot from consideration for current turn
                break; // Trained one unit, now re-evaluate from the best remaining spot
            }
        }
        if (!trainedThisTurn) { // No more spots available or all remaining spots are occupied
            break;
        }
    }

    if (actions.length === 0) {
        print('WAIT');
    } else {
        print(actions.join(';'));
    }
}