// Helper function for distance calculation
function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Interfaces for game entities
interface Coordinate {
    x: number;
    y: number;
}

enum UnitType {
    UNIT = "UNIT",
    TOWER = "TOWER",
    HERO = "HERO",
    GROOT = "GROOT"
}

enum HeroType {
    DEADPOOL = "DEADPOOL",
    DOCTOR_STRANGE = "DOCTOR_STRANGE",
    HULK = "HULK",
    IRONMAN = "IRONMAN",
    VALKYRIE = "VALKYRIE"
}

interface GameEntity extends Coordinate {
    unitId: number;
    team: number;
    unitType: UnitType;
    attackRange: number;
    health: number;
    maxHealth: number;
    shield: number;
    attackDamage: number;
    movementSpeed: number;
    stunDuration: number;
    goldValue: number;
}

interface HeroEntity extends GameEntity {
    countDown1: number;
    countDown2: number;
    countDown3: number;
    mana: number;
    maxMana: number;
    manaRegeneration: number;
    heroType: HeroType;
    isVisible: number; // 0 or 1
    itemsOwned: number;
}

// Global variables for game state
let myTeam: number;

// Arrays to store entities for the current turn
let myHeroes: HeroEntity[] = [];
let opponentHeroes: HeroEntity[] = [];
let myTowers: GameEntity[] = [];
let opponentTowers: GameEntity[] = [];
let units: GameEntity[] = []; // Minions / Creeps
let neutralUnits: GameEntity[] = []; // Groot (Neutral units)

// --- Initialization Phase ---

// Read my team number
myTeam = parseInt(readline());

// Read bush and spawn point data (ignored for Wood 4 league logic, but lines must be consumed)
const bushAndSpawnPointCount: number = parseInt(readline());
for (let i = 0; i < bushAndSpawnPointCount; i++) {
    readline(); // Consume line
}

// Read item data (ignored for Wood 4 league logic, but lines must be consumed)
const itemCount: number = parseInt(readline());
for (let i = 0; i < itemCount; i++) {
    readline(); // Consume line
}

// --- Game Loop ---
while (true) {
    // Read turn-specific input
    const myGold: number = parseInt(readline());
    const oppGold: number = parseInt(readline());
    const roundType: number = parseInt(readline()); // -1 for hero picking phase, positive for game phase
    const entityCount: number = parseInt(readline());

    // Clear entity lists from the previous turn
    myHeroes = [];
    opponentHeroes = [];
    myTowers = [];
    opponentTowers = [];
    units = [];
    neutralUnits = [];

    // Parse all entities on the map
    for (let i = 0; i < entityCount; i++) {
        const inputs: string[] = readline().split(' ');
        const unitId: number = parseInt(inputs[0]);
        const team: number = parseInt(inputs[1]);
        const unitType: UnitType = inputs[2] as UnitType;
        const x: number = parseInt(inputs[3]);
        const y: number = parseInt(inputs[4]);
        const attackRange: number = parseInt(inputs[5]);
        const health: number = parseInt(inputs[6]);
        const maxHealth: number = parseInt(inputs[7]);
        const shield: number = parseInt(inputs[8]);
        const attackDamage: number = parseInt(inputs[9]);
        const movementSpeed: number = parseInt(inputs[10]);
        const stunDuration: number = parseInt(inputs[11]);
        const goldValue: number = parseInt(inputs[12]);

        const baseEntity: GameEntity = {
            unitId, team, unitType, x, y, attackRange, health, maxHealth,
            shield, attackDamage, movementSpeed, stunDuration, goldValue
        };

        if (unitType === UnitType.HERO) {
            const countDown1: number = parseInt(inputs[13]);
            const countDown2: number = parseInt(inputs[14]);
            const countDown3: number = parseInt(inputs[15]);
            const mana: number = parseInt(inputs[16]);
            const maxMana: number = parseInt(inputs[17]);
            const manaRegeneration: number = parseInt(inputs[18]);
            const heroType: HeroType = inputs[19] as HeroType;
            const isVisible: number = parseInt(inputs[20]);
            const itemsOwned: number = parseInt(inputs[21]);

            const heroEntity: HeroEntity = {
                ...baseEntity,
                countDown1, countDown2, countDown3, mana, maxMana,
                manaRegeneration, heroType, isVisible, itemsOwned
            };

            if (team === myTeam) {
                myHeroes.push(heroEntity);
            } else {
                opponentHeroes.push(heroEntity);
            }
        } else if (unitType === UnitType.TOWER) {
            if (team === myTeam) {
                myTowers.push(baseEntity);
            } else {
                opponentTowers.push(baseEntity);
            }
        } else if (unitType === UnitType.UNIT) {
            units.push(baseEntity);
        } else if (unitType === UnitType.GROOT) {
            neutralUnits.push(baseEntity);
        }
    }

    // --- Decision Logic ---
    if (roundType < 0) {
        // Hero picking phase
        // For Wood 4, choose a consistent, generally safe hero. IRONMAN is a good ranged choice.
        console.log(HeroType.IRONMAN);
    } else {
        // Game phase
        // In Wood 4, we only control one hero.
        const myHero = myHeroes[0];

        if (!myHero) {
            // This case should ideally not happen if the game is still active and hero is alive.
            // If it does, default to WAIT to prevent errors.
            console.log("WAIT; No hero found for command.");
            continue;
        }

        let commandIssued = false;

        // 1. Try to attack the most immediate threat: the enemy hero.
        // Filter for visible opponent heroes. For simplicity, just pick the first one found.
        const visibleOpponentHeroes = opponentHeroes.filter(h => h.isVisible === 1);
        const targetHero: HeroEntity | undefined = visibleOpponentHeroes.length > 0 ? visibleOpponentHeroes[0] : undefined;

        if (targetHero) {
            // Use MOVE_ATTACK to ensure hero moves towards the target and attacks.
            // Using targetHero.x, targetHero.y as the move coordinates instructs the hero to path towards them.
            console.log(`MOVE_ATTACK ${targetHero.x} ${targetHero.y} ${targetHero.unitId}; Attacking enemy hero`);
            commandIssued = true;
        } else if (opponentTowers.length > 0) {
            // 2. If no visible enemy hero, try to attack the enemy tower.
            // Assuming there's only one opponent tower.
            const targetTower = opponentTowers[0];
            // Use MOVE_ATTACK to ensure hero moves towards the tower and attacks.
            console.log(`MOVE_ATTACK ${targetTower.x} ${targetTower.y} ${targetTower.unitId}; Attacking enemy tower`);
            commandIssued = true;
        }

        // 3. If no immediate targets (hero or tower) are found, move towards the enemy base.
        if (!commandIssued) {
            let targetX: number;
            const targetY: number = 375; // Center Y of the map, typically where towers are located

            if (myTeam === 0) {
                // My team is on the left side, push towards the right (enemy tower at X=1920)
                // Aim for a point near the enemy tower for a good attack position.
                targetX = 1800; 
            } else {
                // My team is on the right side, push towards the left (enemy tower at X=0)
                // Aim for a point near the enemy tower for a good attack position.
                targetX = 120; 
            }
            console.log(`MOVE ${targetX} ${targetY}; Moving to enemy base`);
        }
    }
}