// Define global constants for the map dimensions
const MAP_WIDTH = 16;
const MAP_HEIGHT = 12;

// Enum for different types of entities in the game
enum EntityType {
    EXIT = 0,
    OBSTACLE = 1,
    TREASURE = 2,
    POTION = 3,
    CHARGE_HAMMER = 4,
    CHARGE_SCYTHE = 5,
    CHARGE_BOW = 6,
    BOX = 7,
    SKELETON = 8,
    GARGOYLE = 9,
    ORC = 10,
    VAMPIRE = 11,
}

// Enum for different weapon types
enum WeaponType {
    SWORD = 0,
    HAMMER = 1,
    SCYTHE = 2,
    BOW = 3,
}

// Interface for a point in 2D space
interface Point {
    x: number;
    y: number;
}

// Interface for the hero's current state
interface HeroState {
    x: number;
    y: number;
    health: number;
    score: number;
    chargesHammer: number;
    chargesScythe: number;
    chargesBow: number;
}

// Interface for any visible entity in the game
interface Entity extends Point {
    type: EntityType;
    value: number; // For monster: current health; for item: value (score, healing, etc.)
}

// Interface for monster specific properties
interface MonsterSpec {
    type: EntityType;
    initialHealth: number;
    viewRange: number;
    attackRange: number; // Chebyshev distance (max(abs(dx), abs(dy)))
    damage: number;
}

// Data for all monster types
const MONSTER_SPECS: MonsterSpec[] = [
    { type: EntityType.BOX, initialHealth: 1, viewRange: 0, attackRange: 0, damage: 0 },
    { type: EntityType.SKELETON, initialHealth: 6, viewRange: 1, attackRange: 1, damage: 1 },
    { type: EntityType.GARGOYLE, initialHealth: 14, viewRange: 2, attackRange: 1, damage: 2 },
    { type: EntityType.ORC, initialHealth: 8, viewRange: 2, attackRange: 2, damage: 2 },
    { type: EntityType.VAMPIRE, initialHealth: 10, viewRange: 3, attackRange: 1, damage: 3 },
];

// Helper to get monster specifications by type
function getMonsterSpec(type: EntityType): MonsterSpec | undefined {
    return MONSTER_SPECS.find(spec => spec.type === type);
}

// Data for weapon properties
const WEAPON_DAMAGES = new Map<WeaponType, number>([
    [WeaponType.SWORD, 10],
    [WeaponType.HAMMER, 6],
    [WeaponType.SCYTHE, 7],
    [WeaponType.BOW, 8],
]);

const WEAPON_RANGES = new Map<WeaponType, number>([ // Chebyshev distances
    [WeaponType.SWORD, 1], // Cardinal only
    [WeaponType.HAMMER, 1],
    [WeaponType.SCYTHE, 2], // Queen move pattern
    [WeaponType.BOW, 3],
]);

const WEAPON_CHARGE_COSTS = new Map<WeaponType, number>([
    [WeaponType.SWORD, 0], // Unlimited charges
    [WeaponType.HAMMER, 1],
    [WeaponType.SCYTHE, 1],
    [WeaponType.BOW, 1],
]);

// Interface for a potential attack action
interface AttackOption {
    weapon: WeaponType;
    target: Point; // The cell to target with the weapon
    damage: number; // Expected total damage from this attack (may hit multiple targets)
    monstersHit: Entity[]; // List of monsters hit by this attack
    kills: number; // Number of monsters killed by this attack
    priority: number; // Calculated priority score for this attack
}

// GameMap class to manage the known state of the maze
class GameMap {
    private obstacles: boolean[][]; // Permanent obstacles
    private known: boolean[][]; // Cells that have been seen
    private visibleMonsters: Entity[]; // Monsters visible in current turn
    private visibleItems: Entity[]; // Items visible in current turn
    private heroX: number;
    private heroY: number;

    constructor() {
        this.obstacles = Array(MAP_HEIGHT).fill(0).map(() => Array(MAP_WIDTH).fill(false));
        this.known = Array(MAP_HEIGHT).fill(0).map(() => Array(MAP_WIDTH).fill(false));
        this.visibleMonsters = [];
        this.visibleItems = [];
        this.heroX = -1;
        this.heroY = -1;
    }

    // Updates the map with current hero state and visible entities
    update(heroState: HeroState, entities: Entity[]) {
        this.heroX = heroState.x;
        this.heroY = heroState.y;

        // Clear transient entities from previous turn
        this.visibleMonsters = [];
        this.visibleItems = [];

        // Mark all cells within hero's view range (3) as known
        for (let y = Math.max(0, heroState.y - 3); y <= Math.min(MAP_HEIGHT - 1, heroState.y + 3); y++) {
            for (let x = Math.max(0, heroState.x - 3); x <= Math.min(MAP_WIDTH - 1, heroState.x + 3); x++) {
                this.known[y][x] = true;
            }
        }

        // Process visible entities
        for (const entity of entities) {
            if (entity.type === EntityType.OBSTSACTION_CLEARED_BY_ATTACKLE) {
                this.obstacles[entity.y][entity.x] = true;
            } else if (entity.type >= EntityType.BOX && entity.type <= EntityType.VAMPIRE) {
                this.visibleMonsters.push(entity);
            } else {
                this.visibleItems.push(entity);
            }
        }
    }

    // Checks if a cell is walkable for general movement (not for attacking)
    isCellWalkable(x: number, y: number): boolean {
        if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;
        if (this.obstacles[y][x]) return false;
        // Treat monster cells as non-walkable for pathfinding to avoid accidental sword attacks.
        // Explicit ATTACK commands will be used for combat.
        if (this.visibleMonsters.some(m => m.x === x && m.y === y)) return false;
        return true;
    }

    getVisibleMonsters(): Entity[] {
        return this.visibleMonsters;
    }

    getVisibleItems(): Entity[] {
        return this.visibleItems;
    }

    // BFS to find the closest reachable target of specified types
    findClosestTarget(
        startX: number,
        startY: number,
        targetTypes: EntityType[] // e.g., [EntityType.EXIT, EntityType.POTION]
    ): { target: Point, distance: number, type: EntityType, entityValue?: number } | null {

        const queue: { x: number, y: number, dist: number }[] = [];
        const visited = new Set<string>(); // "x,y" string for visited cells

        queue.push({ x: startX, y: startY, dist: 0 });
        visited.add(`${startX},${startY}`);

        const dx = [0, 0, 1, -1]; // Cardinal directions
        const dy = [1, -1, 0, 0];

        let bestTarget: { target: Point, distance: number, type: EntityType, entityValue?: number } | null = null;

        while (queue.length > 0) {
            const { x, y, dist } = queue.shift()!;

            // Check if current cell contains a target entity
            const entityOnCell = this.visibleItems.find(item => item.x === x && item.y === y);
            if (entityOnCell && targetTypes.includes(entityOnCell.type)) {
                // If a target is found, return it as BFS guarantees the shortest path
                return { target: { x, y }, distance: dist, type: entityOnCell.type, entityValue: entityOnCell.value };
            }

            if (dist >= 50) { // Limit search depth to prevent excessive computation
                continue;
            }

            // Explore neighbors
            for (let i = 0; i < 4; i++) {
                const nx = x + dx[i];
                const ny = y + dy[i];
                const neighborKey = `${nx},${ny}`;

                if (this.isCellWalkable(nx, ny) && !visited.has(neighborKey)) {
                    visited.add(neighborKey);
                    queue.push({ x: nx, y: ny, dist: dist + 1 });
                }
            }
        }
        return null; // No path found to any of the target types
    }

    // BFS to find the closest unknown cell to explore
    findClosestUnknownCell(startX: number, startY: number): { target: Point, distance: number } | null {
        const queue: { x: number, y: number, dist: number }[] = [];
        const visited = new Set<string>();

        queue.push({ x: startX, y: startY, dist: 0 });
        visited.add(`${startX},${startY}`);

        const dx = [0, 0, 1, -1];
        const dy = [1, -1, 0, 0];

        while (queue.length > 0) {
            const { x, y, dist } = queue.shift()!;

            // If we found an unknown cell adjacent to the current path, return it as target
            // This ensures we pathfind towards the edge of the known map
            for (let i = 0; i < 4; i++) {
                const nx = x + dx[i];
                const ny = y + dy[i];

                if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT && !this.known[ny][nx]) {
                    // Found an unknown cell reachable from current path
                    // Target the unknown cell itself, game's pathfinding will handle getting there
                    return { target: { x: nx, y: ny }, distance: dist + 1 };
                }
            }
            
            if (dist >= 50) { // Limit search depth
                continue;
            }

            // Continue BFS to find reachable known cells to explore further from
            for (let i = 0; i < 4; i++) {
                const nx = x + dx[i];
                const ny = y + dy[i];
                const neighborKey = `${nx},${ny}`;

                if (this.isCellWalkable(nx, ny) && !visited.has(neighborKey)) {
                    visited.add(neighborKey);
                    queue.push({ x: nx, y: ny, dist: dist + 1 });
                }
            }
        }
        return null; // No unknown cells found (map fully explored or inaccessible)
    }
}

// Helper function to check if two points are cardinally adjacent
function isCardinalAdjacent(p1: Point, p2: Point): boolean {
    const dx = Math.abs(p1.x - p2.x);
    const dy = Math.abs(p1.y - p2.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

// Helper function to determine cells affected by a weapon attack
function getAffectedCells(weapon: WeaponType, heroX: number, heroY: number, targetX: number, targetY: number): Point[] {
    const affected: Point[] = [];
    const dx = targetX - heroX;
    const dy = targetY - heroY;
    const dist = Math.max(Math.abs(dx), Math.abs(dy)); // Chebyshev distance

    if (dist === 0 && weapon !== WeaponType.SWORD) return []; // Cannot attack self with ranged weapons
    if (dist > (WEAPON_RANGES.get(weapon) || 0)) return []; // Out of range

    switch (weapon) {
        case WeaponType.SWORD:
            // Sword only hits cardinal adjacent cells
            if (isCardinalAdjacent({ x: heroX, y: heroY }, { x: targetX, y: targetY })) {
                affected.push({ x: targetX, y: targetY });
            }
            break;
        case WeaponType.HAMMER:
            // Hammer: hits target and 2 additional cells based on target direction
            if (dist <= 1 && dist > 0) { // Target must be in range 1, but not self
                affected.push({ x: targetX, y: targetY }); // Always hits target
                if (Math.abs(dx) === 1 && Math.abs(dy) === 1) { // Diagonal target
                    // Hits closest neighbours in the two adjacent cardinal directions from the hero
                    affected.push({ x: heroX + dx, y: heroY });
                    affected.push({ x: heroX, y: heroY + dy });
                } else if ((Math.abs(dx) === 1 && dy === 0) || (dx === 0 && Math.abs(dy) === 1)) { // Cardinal target
                    // Hits closest neighbouring cells in the two diagonal adjacent directions
                    if (dx !== 0) { // Horizontal target (e.g., (Hx+1, Hy))
                        affected.push({ x: targetX, y: targetY + 1 });
                        affected.push({ x: targetX, y: targetY - 1 });
                    } else { // Vertical target (e.g., (Hx, Hy+1))
                        affected.push({ x: targetX + 1, y: targetY });
                        affected.push({ x: targetX - 1, y: targetY });
                    }
                }
            }
            break;
        case WeaponType.SCYTHE:
            // Scythe: hits two cells on a queen move pattern line, limited to distance 2
            if (dist > 0 && dist <= 2 && (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy))) {
                affected.push({ x: targetX, y: targetY }); // The target cell
                if (dist === 1) { // Target is one step away, hit the cell two steps away in same direction
                    affected.push({ x: heroX + 2 * dx, y: heroY + 2 * dy });
                } else if (dist === 2) { // Target is two steps away, hit the cell one step away in same direction
                    // dx/2 and dy/2 are integers because dx and dy are 0, +/-1, +/-2 and must be in queen pattern
                    affected.push({ x: heroX + dx / 2, y: heroY + dy / 2 });
                }
            }
            break;
        case WeaponType.BOW:
            // Bow hits a single target cell
            if (dist <= 3) {
                affected.push({ x: targetX, y: targetY });
            }
            break;
    }
    // Filter out cells outside map boundaries
    return affected.filter(p => p.x >= 0 && p.x < MAP_WIDTH && p.y >= 0 && p.y < MAP_HEIGHT);
}


// Main decision-making function for the hero's turn
function decideAction(hero: HeroState, map: GameMap): string {

    // 1. Immediate Danger Assessment and Attack Priority
    const threateningMonsters = map.getVisibleMonsters().filter(m => {
        const dist = Math.max(Math.abs(hero.x - m.x), Math.abs(hero.y - m.y));
        const monsterDef = getMonsterSpec(m.type);
        return monsterDef && dist <= monsterDef.attackRange;
    });

    let totalIncomingDamage = 0;
    threateningMonsters.forEach(m => {
        totalIncomingDamage += getMonsterSpec(m.type)!.damage;
    });

    const attackOptions: AttackOption[] = [];

    // Generate all possible attack options against visible monsters
    for (const m of map.getVisibleMonsters()) {
        const currentMonsterHealth = m.value;

        // Consider each weapon
        const weaponsToConsider = [WeaponType.SWORD, WeaponType.BOW, WeaponType.SCYTHE, WeaponType.HAMMER];
        for (const weaponType of weaponsToConsider) {
            const weaponDamage = WEAPON_DAMAGES.get(weaponType)!;
            const weaponChargeCost = WEAPON_CHARGE_COSTS.get(weaponType)!;

            // Check if hero has charges (except for Sword)
            if (weaponType === WeaponType.HAMMER && hero.chargesHammer <= 0) continue;
            if (weaponType === WeaponType.SCYTHE && hero.chargesScythe <= 0) continue;
            if (weaponType === WeaponType.BOW && hero.chargesBow <= 0) continue;

            const affectedCells = getAffectedCells(weaponType, hero.x, hero.y, m.x, m.y);
            
            if (affectedCells.length === 0) continue; // Weapon cannot hit target from this position

            let totalDamageDealt = 0;
            let killsCount = 0;
            const monstersHitByThisAttack: Entity[] = [];

            for (const cell of affectedCells) {
                const hitMonster = map.getVisibleMonsters().find(vm => vm.x === cell.x && vm.y === cell.y);
                if (hitMonster) {
                    totalDamageDealt += weaponDamage; // Cumulative damage from this attack
                    monstersHitByThisAttack.push(hitMonster);
                    if (hitMonster.value <= weaponDamage) {
                        killsCount++;
                    }
                }
            }

            if (monstersHitByThisAttack.length > 0) { // Only add if it actually hits at least one monster
                let priority = 0;
                const isThreateningTarget = threateningMonsters.includes(m); // Check if the monster (m) that triggered this option is threatening

                if (killsCount > 0) {
                    if (isThreateningTarget) priority += 1000; // High priority for killing immediate threats
                    priority += killsCount * 500; // Bonus for killing multiple monsters
                    if (weaponType === WeaponType.SWORD) priority += 100; // Sword is free
                } else if (totalDamageDealt > 0) {
                    if (isThreateningTarget) priority += 100; // Damage threatening monster
                    priority += totalDamageDealt; // Bonus for damage
                }

                // Small penalty for charges, but prefer efficient kills
                if (weaponType !== WeaponType.SWORD) {
                    priority -= weaponChargeCost * 10;
                }

                attackOptions.push({
                    weapon: weaponType,
                    target: { x: m.x, y: m.y }, // Target is the monster's cell
                    damage: totalDamageDealt,
                    monstersHit: monstersHitByThisAttack,
                    kills: killsCount,
                    priority: priority
                });
            }
        }
    }

    attackOptions.sort((a, b) => b.priority - a.priority); // Sort by priority, highest first

    // Determine if hero is in critical health
    const isCriticalHealth = hero.health - totalIncomingDamage <= 0 || hero.health < 5;

    if (attackOptions.length > 0) {
        const bestAttack = attackOptions[0];
        
        let healthAfterMonstersNotKilled = hero.health;
        // Calculate health if hero takes only damage from monsters that are NOT killed by this attack
        const monstersStillAliveToAttack = threateningMonsters.filter(tm => {
            const monsterHit = bestAttack.monstersHit.find(hm => hm.x === tm.x && hm.y === tm.y);
            // If monster was hit and its health (tm.value) is <= damage dealt, it's killed.
            // Check its specific remaining health, not just if it was *hit*
            if (monsterHit && tm.value <= WEAPON_DAMAGES.get(bestAttack.weapon)!) {
                 return false; // This monster is killed by the attack
            }
            return true; // Monster survives and attacks
        });

        monstersStillAliveToAttack.forEach(m => {
            healthAfterMonstersNotKilled -= getMonsterSpec(m.type)!.damage;
        });

        // Take the attack if it prevents hero's death OR if hero is not in critical danger initially
        if ((isCriticalHealth && healthAfterMonstersNotKilled > 0) || !isCriticalHealth) {
            console.error(`DEBUG: Attacking: ${WeaponType[bestAttack.weapon]} ${bestAttack.target.x} ${bestAttack.target.y} (Prio: ${bestAttack.priority})`);
            return `ATTACK ${bestAttack.weapon} ${bestAttack.target.x} ${bestAttack.target.y} BEST_ATTACK`;
        }
    }

    // 2. Prioritize Potions if critical health and no life-saving attack found
    if (isCriticalHealth) {
        const potion = map.getVisibleItems().find(item => item.type === EntityType.POTION);
        if (potion) {
            const pathInfo = map.findClosestTarget(hero.x, hero.y, [EntityType.POTION]);
            if (pathInfo && pathInfo.distance > 0) { // If potion is reachable and not on current spot
                console.error("DEBUG: Moving to Potion due to low health");
                return `MOVE ${potion.x} ${potion.y} HEAL_CRITICAL`;
            } else if (pathInfo && pathInfo.distance === 0) { // If hero is already on a potion
                // This shouldn't happen, as the potion effect would already be applied
                // but if it somehow does, moving to self to pick it up is effectively a wait
                console.error("DEBUG: Already on Potion, waiting (should have picked up)");
                return `MOVE ${hero.x} ${hero.y} WAIT_ON_POTION`;
            }
        }
    }


    // 3. Prioritize Exit
    const exit = map.getVisibleItems().find(item => item.type === EntityType.EXIT);
    if (exit) {
        const pathInfo = map.findClosestTarget(hero.x, hero.y, [EntityType.EXIT]);
        if (pathInfo && pathInfo.distance > 0) { // If exit is reachable and not on current spot
            console.error("DEBUG: Moving to Exit");
            return `MOVE ${exit.x} ${exit.y} EXIT`;
        } else if (pathInfo && pathInfo.distance === 0) { // Hero is on the exit
            console.error("DEBUG: Already on Exit, waiting (should win)");
            return `MOVE ${hero.x} ${hero.y} WAIT_ON_EXIT`;
        }
    }

    // 4. Prioritize Potions if not full health (even if not critical)
    if (hero.health < 20) {
        const potion = map.getVisibleItems().find(item => item.type === EntityType.POTION);
        if (potion) {
            const pathInfo = map.findClosestTarget(hero.x, hero.y, [EntityType.POTION]);
            if (pathInfo && pathInfo.distance > 0) {
                console.error("DEBUG: Moving to Potion");
                return `MOVE ${potion.x} ${potion.y} POTION`;
            }
        }
    }

    // 5. Prioritize Charge Chests if charges are low
    const chargeChests = map.getVisibleItems().filter(item =>
        item.type === EntityType.CHARGE_HAMMER ||
        item.type === EntityType.CHARGE_SCYTHE ||
        item.type === EntityType.CHARGE_BOW
    );
    for (const chest of chargeChests) {
        let needsCharge = false;
        if (chest.type === EntityType.CHARGE_HAMMER && hero.chargesHammer < 5) needsCharge = true;
        if (chest.type === EntityType.CHARGE_SCYTHE && hero.chargesScythe < 5) needsCharge = true;
        if (chest.type === EntityType.BOW && hero.chargesBow < 5) needsCharge = true; // Use BOW, not EntityType.CHARGE_BOW here

        if (needsCharge) {
            const pathInfo = map.findClosestTarget(hero.x, hero.y, [chest.type]);
            if (pathInfo && pathInfo.distance > 0) {
                console.error("DEBUG: Moving to Charge Chest");
                return `MOVE ${chest.x} ${chest.y} CHARGE`;
            }
        }
    }

    // 6. Attack non-threatening monsters (for score/clearing path)
    // Re-evaluate best attack options, potentially including ones that weren't "life-saving"
    if (attackOptions.length > 0) {
        const bestAttack = attackOptions[0];
        console.error(`DEBUG: Attacking non-threatening monster: ${WeaponType[bestAttack.weapon]} ${bestAttack.target.x} ${bestAttack.target.y} (Prio: ${bestAttack.priority})`);
        return `ATTACK ${bestAttack.weapon} ${bestAttack.target.x} ${bestAttack.target.y} NON_THREATENING_ATTACK`;
    }

    // 7. Prioritize Treasure
    const treasure = map.getVisibleItems().find(item => item.type === EntityType.TREASURE);
    if (treasure) {
        const pathInfo = map.findClosestTarget(hero.x, hero.y, [EntityType.TREASURE]);
        if (pathInfo && pathInfo.distance > 0) {
            console.error("DEBUG: Moving to Treasure");
            return `MOVE ${treasure.x} ${treasure.y} TREASURE`;
        }
    }

    // 8. Explore: Move towards an unvisited, passable cell.
    const unknownTarget = map.findClosestUnknownCell(hero.x, hero.y);
    if (unknownTarget) {
        console.error(`DEBUG: Exploring towards unknown cell: ${unknownTarget.target.x}, ${unknownTarget.target.y}`);
        return `MOVE ${unknownTarget.target.x} ${unknownTarget.target.y} EXPLORE_UNKNOWN`;
    }

    // 9. If no action found, wait.
    console.error("DEBUG: No action found, waiting.");
    return `MOVE ${hero.x} ${hero.y} WAIT`;
}

// Global instance of the game map
let gameMap: GameMap = new GameMap();

// Game loop
while (true) {
    // Read hero state
    const inputs1 = readline().split(' ').map(Number);
    const heroX = inputs1[0];
    const heroY = inputs1[1];
    const heroHealth = inputs1[2];
    const heroScore = inputs1[3];
    const chargesHammer = inputs1[4];
    const chargesScythe = inputs1[5];
    const chargesBow = inputs1[6];

    const heroState: HeroState = {
        x: heroX, y: heroY, health: heroHealth, score: heroScore,
        chargesHammer, chargesScythe, chargesBow
    };

    // Read visible entities
    const visibleEntitiesCount = parseInt(readline());
    const visibleEntities: Entity[] = [];
    for (let i = 0; i < visibleEntitiesCount; i++) {
        const inputs2 = readline().split(' ').map(Number);
        visibleEntities.push({
            x: inputs2[0],
            y: inputs2[1],
            type: inputs2[2] as EntityType,
            value: inputs2[3]
        });
    }

    // Update game map with current turn's information
    gameMap.update(heroState, visibleEntities);

    // Decide and print the hero's action
    const action = decideAction(heroState, gameMap);
    console.log(action);
}