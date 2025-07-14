/**
 * Global readline() function for CodinGame input.
 * Assumed to be available in the execution environment.
 */
declare function readline(): string;

/**
 * Global console.log() function for CodinGame output.
 * Assumed to be available in the execution environment.
 */
declare function console.log(message: string): void;

// --- Common Types ---

interface Point {
    x: number;
    y: number;
}

interface Site extends Point {
    id: number;
    radius: number;
}

enum StructureType {
    NONE = -1,
    BARRACKS = 2,
}

enum Owner {
    NONE = -1,
    ME = 0,
    ENEMY = 1,
}

enum CreepType {
    KNIGHT = 0,
    ARCHER = 1,
}

interface SiteState {
    id: number;
    structureType: StructureType;
    owner: Owner;
    param1: number; // For barracks: turns left to train (0 if ready). For others: -1.
    param2: CreepType | -1; // For barracks: creep type (0 KNIGHT, 1 ARCHER). For others: -1.
}

interface Unit extends Point {
    owner: Owner;
    unitType: CreepType | -1; // -1 for Queen, 0 for KNIGHT, 1 for ARCHER
    health: number;
}

// --- Global Variables (updated each turn or initialized once) ---

let myQueen: Unit;
let enemyQueen: Unit;
let myGold: number;
let touchedSiteId: number;

let numSites: number;
const sites: Site[] = []; // Stores static site information (id, x, y, radius)

// --- Constants ---
const KNIGHT_COST = 80;
const TARGET_KNIGHT_BARRACKS = 2; // Aim to build 2 Knight barracks

// --- Helper Functions ---

/**
 * Calculates the Euclidean distance between two points.
 */
function distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Finds the best (closest) site for the Queen to move to for building.
 * Prioritizes empty sites, then my own ARCHER barracks (to convert to KNIGHT).
 */
function findTargetSiteForBuilding(
    queen: Unit,
    allSites: Site[],
    allSiteStates: SiteState[]
): Site | undefined {
    let bestEmptySite: Site | undefined = undefined;
    let minDistanceEmpty = Infinity;

    let bestArcherBarracksToReplace: Site | undefined = undefined;
    let minDistanceArcherBarracks = Infinity;

    for (const site of allSites) {
        const siteState = allSiteStates.find(ss => ss.id === site.id);
        if (!siteState) continue; // Should not happen with valid input

        const dist = distance(queen, site);

        // Prioritize empty sites
        if (siteState.owner === Owner.NONE) {
            if (dist < minDistanceEmpty) {
                minDistanceEmpty = dist;
                bestEmptySite = site;
            }
        }
        // Then, consider my ARCHER barracks that are not currently training
        else if (
            siteState.owner === Owner.ME &&
            siteState.structureType === StructureType.BARRACKS &&
            siteState.param2 === CreepType.ARCHER &&
            siteState.param1 === 0 // Can only replace if not training
        ) {
            if (dist < minDistanceArcherBarracks) {
                minDistanceArcherBarracks = dist;
                bestArcherBarracksToReplace = site;
            }
        }
    }

    // Return the best found site based on priority
    if (bestEmptySite) {
        return bestEmptySite;
    } else {
        return bestArcherBarracksToReplace;
    }
}

/**
 * Determines a safe corner location for the Queen to move to.
 * This function assumes the map is 1920x1000 and Queens start on opposite X sides.
 */
function getDefensiveQueenMove(queen: Unit): string {
    // Determine player's side based on Queen's initial X coordinate
    // Map width is 1920. If my Queen starts X < 960 (halfway), I'm on the left.
    const playerIsOnLeft = queen.x < 1920 / 2;
    const targetX = playerIsOnLeft ? 0 : 1920; // Move to the extreme left or right edge
    const targetY = 0; // Move to the top corner on that side

    return `MOVE ${targetX} ${targetY}`;
}

// --- Initialization Input Reading ---
numSites = parseInt(readline());
for (let i = 0; i < numSites; i++) {
    const inputs = readline().split(' ');
    const siteId = parseInt(inputs[0]);
    const x = parseInt(inputs[1]);
    const y = parseInt(inputs[2]);
    const radius = parseInt(inputs[3]);
    sites.push({ id: siteId, x, y, radius });
}

// --- Game Loop ---
while (true) {
    // --- Read Turn Input ---
    const inputs1 = readline().split(' ');
    myGold = parseInt(inputs1[0]);
    touchedSiteId = parseInt(inputs1[1]);

    const siteStates: SiteState[] = [];
    for (let i = 0; i < numSites; i++) {
        const inputs2 = readline().split(' ');
        const siteId = parseInt(inputs2[0]);
        // ignore1 (inputs2[1]) and ignore2 (inputs2[2]) are reserved for future leagues.
        const structureType = parseInt(inputs2[3]) as StructureType;
        const owner = parseInt(inputs2[4]) as Owner;
        const param1 = parseInt(inputs2[5]);
        const param2 = parseInt(inputs2[6]) as CreepType | -1;
        siteStates.push({ id: siteId, structureType, owner, param1, param2 });
    }

    const numUnits = parseInt(readline());
    for (let i = 0; i < numUnits; i++) {
        const inputs3 = readline().split(' ');
        const x = parseInt(inputs3[0]);
        const y = parseInt(inputs3[1]);
        const owner = parseInt(inputs3[2]) as Owner;
        const unitType = parseInt(inputs3[3]) as CreepType | -1;
        const health = parseInt(inputs3[4]);

        if (unitType === -1) { // This unit is a Queen
            if (owner === Owner.ME) {
                myQueen = { x, y, owner, unitType, health };
            } else {
                enemyQueen = { x, y, owner, unitType, health };
            }
        }
        // Other units (KNIGHTs, ARCHERs) are read but not used in this basic Wood 4 strategy.
    }

    // --- Game Logic ---
    let queenAction = '';
    const sitesToTrain: number[] = [];

    // 1. Determine Queen's Action (MOVE/BUILD/WAIT)
    const friendlyKnightBarracks: SiteState[] = siteStates.filter(ss =>
        ss.owner === Owner.ME &&
        ss.structureType === StructureType.BARRACKS &&
        ss.param2 === CreepType.KNIGHT
    );

    let builtThisTurn = false;

    if (friendlyKnightBarracks.length < TARGET_KNIGHT_BARRACKS) {
        // We need to build more Knight Barracks or convert existing Archer barracks.
        if (touchedSiteId !== -1) {
            const touchedSiteState = siteStates.find(ss => ss.id === touchedSiteId);
            if (touchedSiteState) {
                // Conditions for building:
                // 1. Site is empty (`Owner.NONE`).
                // 2. It's my site and not a barracks, or it's my ARCHER barracks.
                // 3. The site is not currently training (`param1 === 0`).
                const canBuild = touchedSiteState.param1 === 0 && (
                    touchedSiteState.owner === Owner.NONE || // Empty site
                    (touchedSiteState.owner === Owner.ME && touchedSiteState.structureType !== StructureType.BARRACKS) || // My non-barracks structure
                    (touchedSiteState.owner === Owner.ME && touchedSiteState.structureType === StructureType.BARRACKS && touchedSiteState.param2 === CreepType.ARCHER) // My ARCHER barracks
                );

                if (canBuild) {
                    queenAction = `BUILD ${touchedSiteId} BARRACKS-KNIGHT`;
                    builtThisTurn = true;
                }
            }
        }
        
        if (!builtThisTurn) { // If Queen didn't build or can't build on touched site, move to a target site.
            const targetSite = findTargetSiteForBuilding(myQueen, sites, siteStates);
            if (targetSite) {
                queenAction = `MOVE ${targetSite.x} ${targetSite.y}`;
            } else {
                // Fallback: If no suitable site found to build, move defensively.
                queenAction = getDefensiveQueenMove(myQueen);
            }
        }
    } else {
        // Enough Knight barracks are built. Move Queen to a safe location.
        queenAction = getDefensiveQueenMove(myQueen);
    }

    // 2. Determine Training Action
    let currentGold = myGold; // Use the gold amount for the current turn

    // Find all my KNIGHT barracks that are ready to train
    const trainableKnightBarracksIds: number[] = [];
    for (const ss of siteStates) {
        if (ss.owner === Owner.ME &&
            ss.structureType === StructureType.BARRACKS &&
            ss.param1 === 0 && // Ready to train (turns left is 0)
            ss.param2 === CreepType.KNIGHT // Must be a KNIGHT barracks
        ) {
            trainableKnightBarracksIds.push(ss.id);
        }
    }
    
    // Iterate through ready barracks and train if affordable
    for (const siteId of trainableKnightBarracksIds) {
        if (currentGold >= KNIGHT_COST) {
            sitesToTrain.push(siteId);
            currentGold -= KNIGHT_COST; // Deduct gold for this training to reflect affordability for next barracks
        } else {
            break; // Can't afford more training
        }
    }

    const trainingOutput = sitesToTrain.length > 0 ? `TRAIN ${sitesToTrain.join(' ')}` : `TRAIN`;

    // --- Output Commands ---
    console.log(queenAction);
    console.log(trainingOutput);
}