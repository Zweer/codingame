// Add `readline` and `print` definitions for CodinGame environment
declare function readline(): string;
declare function print(message: string): void;
declare function console.error(message: any): void; // For debugging

// Define Card interface
interface Card {
    cardNumber: number;
    instanceId: number;
    location: number; // 0: hand, 1: my board, -1: opponent board
    cardType: number; // Always 0 for creature in Wood 4
    cost: number;
    attack: number;
    defense: number;
    abilities: string; // Ignored in Wood 4
    myHealthChange: number; // Ignored in Wood 4
    opponentHealthChange: number; // Ignored in Wood 4
    cardDraw: number; // Ignored in Wood 4
}

// Player and Opponent stats
let playerHealth: number;
let playerMana: number;
let playerDeck: number;
// let playerRune: number; // Not used in Wood 4
// let playerDraw: number; // Not used in Wood 4

let opponentHealth: number;
let opponentMana: number;
let opponentDeck: number;
let opponentHand: number;
let opponentActions: number;

let cards: Card[]; // All cards read in a turn for the current game turn

// Game Phase: Track turn number
let turnNumber = 0;
const DRAFT_TURNS = 30; // Draft phase lasts for 30 turns

/**
 * Reads the game input for the current turn.
 * Updates global variables with player/opponent stats and card information.
 */
function readGameInput(): void {
    const playerStats = readline().split(' ').map(Number);
    playerHealth = playerStats[0];
    playerMana = playerStats[1];
    playerDeck = playerStats[2];
    // playerStats[3] is playerRune, playerStats[4] is playerDraw - ignored in Wood 4

    const opponentStats = readline().split(' ').map(Number);
    opponentHealth = opponentStats[0];
    opponentMana = opponentStats[1];
    opponentDeck = opponentStats[2];
    // opponentStats[3] is opponentRune, opponentStats[4] is opponentDraw - ignored in Wood 4

    const opponentInfo = readline().split(' ').map(Number);
    opponentHand = opponentInfo[0];
    opponentActions = opponentInfo[1];

    for (let i = 0; i < opponentActions; i++) {
        readline(); // Read opponent actions string, but ignore for Wood 4
    }

    const cardCount = parseInt(readline());
    cards = [];
    for (let i = 0; i < cardCount; i++) {
        const inputs = readline().split(' ');
        cards.push({
            cardNumber: parseInt(inputs[0]),
            instanceId: parseInt(inputs[1]),
            location: parseInt(inputs[2]),
            cardType: parseInt(inputs[3]), // Always 0 for creature in Wood 4
            cost: parseInt(inputs[4]),
            attack: parseInt(inputs[5]),
            defense: parseInt(inputs[6]),
            abilities: inputs[7], // Ignored
            myHealthChange: parseInt(inputs[8]), // Ignored
            opponentHealthChange: parseInt(inputs[9]), // Ignored
            cardDraw: parseInt(inputs[10]), // Ignored
        });
    }
}

/**
 * Determines the action for the Draft Phase.
 * Strategy: Pick the card with the highest (attack + defense) sum.
 * Tie-breakers: lower cost, then higher attack.
 * @returns The PICK command string.
 */
function solveDraft(): string {
    let bestCardIndex = 0;
    let bestScore = -1; // attack + defense
    let bestCost = Infinity;
    let bestAttack = -1;

    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const score = card.attack + card.defense;

        if (score > bestScore) {
            // Found a strictly better card
            bestScore = score;
            bestCost = card.cost;
            bestAttack = card.attack;
            bestCardIndex = i;
        } else if (score === bestScore) {
            // Same score, apply tie-breakers
            if (card.cost < bestCost) {
                // Better (lower) cost
                bestCost = card.cost;
                bestAttack = card.attack;
                bestCardIndex = i;
            } else if (card.cost === bestCost) {
                // Same score and cost, prefer higher attack
                if (card.attack > bestAttack) {
                    bestAttack = card.attack;
                    bestCardIndex = i;
                }
            }
        }
    }
    return `PICK ${bestCardIndex}`;
}

/**
 * Determines the actions for the Battle Phase.
 * Strategy: Summon creatures efficiently, then attack opponent's creatures (prioritizing threats)
 * before attacking the opponent directly.
 * @returns A string of actions separated by semicolons, or "PASS".
 */
function solveBattle(): string {
    const actions: string[] = [];
    let currentMana = playerMana;

    const myHandCards = cards.filter(card => card.location === 0);
    const myBoardCreatures = cards.filter(card => card.location === 1);
    const opponentBoardCreatures = cards.filter(card => card.location === -1);

    // Create mutable copies for simulation within this turn's actions
    // opponent cards need `currentDefense` to track damage within the turn
    const tempOpponentBoard: (Card & { currentDefense: number })[] = opponentBoardCreatures.map(c => ({ ...c, currentDefense: c.defense }));
    let tempOpponentHealth = opponentHealth;

    // --- Phase 1: Summoning Creatures ---
    // Sort cards in hand: prioritize cheaper creatures first, then stronger ones (higher attack)
    const summonableCards = [...myHandCards].sort((a, b) => {
        if (a.cost !== b.cost) {
            return a.cost - b.cost; // Ascending cost
        }
        return b.attack - a.attack; // Descending attack
    });

    for (const card of summonableCards) {
        // Check current board size: original creatures + creatures already decided to be summoned this turn
        const currentBoardSize = myBoardCreatures.length + actions.filter(a => a.startsWith("SUMMON")).length;
        if (currentMana >= card.cost && currentBoardSize < 6) {
            actions.push(`SUMMON ${card.instanceId}`);
            currentMana -= card.cost;
        }
    }

    // --- Phase 2: Attacking ---
    // Only creatures that were on board at the start of the turn can attack.
    const availableAttackers = [...myBoardCreatures];

    // Sort attackers: use strongest creatures first
    availableAttackers.sort((a, b) => b.attack - a.attack);

    for (const attacker of availableAttackers) {
        if (tempOpponentHealth <= 0) {
            // Opponent is already defeated or will be by previous attacks
            break;
        }

        let targetInstanceId = -1; // Default target: opponent's face

        if (tempOpponentBoard.length > 0) {
            let chosenTarget: (Card & { currentDefense: number }) | null = null;

            // Strategy: Prioritize killing creatures that the attacker can one-shot.
            // Among one-shot targets, pick the one with the highest original attack (most dangerous threat).
            const oneShotTargets = tempOpponentBoard.filter(t => attacker.attack >= t.currentDefense!);

            if (oneShotTargets.length > 0) {
                chosenTarget = oneShotTargets.reduce((prev, current) => (prev.attack > current.attack ? prev : current));
            } else {
                // If no one-shot possible, attack the opponent's strongest creature (highest attack).
                // This helps to reduce their overall damage output.
                chosenTarget = tempOpponentBoard.reduce((prev, current) => (prev.attack > current.attack ? prev : current));
            }
            
            if (chosenTarget) {
                targetInstanceId = chosenTarget.instanceId;
                chosenTarget.currentDefense! -= attacker.attack; // Simulate damage to opponent creature

                // Remove the creature from the simulated board if it died
                if (chosenTarget.currentDefense! <= 0) {
                    const targetIndex = tempOpponentBoard.indexOf(chosenTarget);
                    if (targetIndex > -1) {
                        tempOpponentBoard.splice(targetIndex, 1);
                    }
                }
            }
        }

        // Add the attack action
        actions.push(`ATTACK ${attacker.instanceId} ${targetInstanceId}`);
        
        // Simulate damage to opponent's face if attacking face
        if (targetInstanceId === -1) {
            tempOpponentHealth -= attacker.attack;
        }
    }

    // If no actions were generated, default to PASS
    if (actions.length === 0) {
        return "PASS";
    }

    return actions.join(';');
}

// --- Main Game Loop ---
while (true) {
    turnNumber++; // Increment turn number at the start of each turn

    readGameInput(); // Read all input for the current turn

    if (turnNumber <= DRAFT_TURNS) {
        print(solveDraft());
    } else {
        print(solveBattle());
    }
}