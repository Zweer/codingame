// Standard input/output for CodinGame
declare function readline(): string;
declare function print(message: any): void;

// Interface to represent a player
interface Player {
    x: number;
    y: number;
    team: 'A' | 'B';
    isActive: boolean;
}

// Interface to represent the ball
interface Ball {
    x: number;
    y: number;
    releasingTeam: 'A' | 'B';
}

const WIDTH = 51;
const HEIGHT = 15;
const HALF_WAY_LINE_X = Math.floor(WIDTH / 2); // 25

let players: Player[] = [];
let ball: Ball | null = null;

// Parse the input screenshot line by line
for (let y = 0; y < HEIGHT; y++) {
    const line = readline();
    for (let x = 0; x < WIDTH; x++) {
        const char = line[x];
        if (char === 'a') {
            players.push({ x, y, team: 'A', isActive: false });
        } else if (char === 'b') {
            players.push({ x, y, team: 'B', isActive: false });
        } else if (char === 'A') {
            players.push({ x, y, team: 'A', isActive: true });
        } else if (char === 'B') {
            players.push({ x, y, team: 'B', isActive: true });
        } else if (char === 'o') {
            ball = { x, y, releasingTeam: 'A' };
        } else if (char === 'O') {
            ball = { x, y, releasingTeam: 'B' };
        }
    }
}

// Ensure ball is found (should always be based on puzzle constraints)
if (!ball) {
    print("Error: Ball not found in screenshot!");
    print("VAR: ONSIDE!"); // Default to ONSIDE in error case
    // In a real environment, you might throw an error or exit.
    throw new Error("Ball not found");
}

const attackingTeam = ball.releasingTeam;
const opponentTeam = attackingTeam === 'A' ? 'B' : 'A';

// Rule 1: No offside position if the play is a throw-in.
const isThrowIn = (ball.y === 0 || ball.y === HEIGHT - 1);

// Rule 2: Calculate the Second Last Opponent (SLO) position.
// This is the X-coordinate of the second-to-last defender from the attacking team's perspective.
let secondLastOpponentX: number;
const opponentPlayers = players.filter(p => p.team === opponentTeam);

if (attackingTeam === 'A') { 
    // TEAM_A attacks right to left. Opponent is TEAM_B. TEAM_B's goal line is X=0.
    // The second last opponent for TEAM_B defending their goal is the player with the 2nd lowest X coordinate.
    opponentPlayers.sort((p1, p2) => p1.x - p2.x); // Sort by X ascending
    if (opponentPlayers.length === 0) {
        secondLastOpponentX = -1; // No opponents, effectively makes offside impossible via this rule.
    } else if (opponentPlayers.length === 1) {
        secondLastOpponentX = 0; // If only 1 opponent, the goal line (X=0) acts as the "second last".
    } else {
        secondLastOpponentX = opponentPlayers[1].x; // The second player in the sorted list.
    }
} else { 
    // TEAM_B attacks left to right. Opponent is TEAM_A. TEAM_A's goal line is X=50.
    // The second last opponent for TEAM_A defending their goal is the player with the 2nd highest X coordinate.
    opponentPlayers.sort((p1, p2) => p2.x - p1.x); // Sort by X descending
    if (opponentPlayers.length === 0) {
        secondLastOpponentX = WIDTH; // No opponents, effectively makes offside impossible via this rule.
    } else if (opponentPlayers.length === 1) {
        secondLastOpponentX = WIDTH - 1; // If only 1 opponent, the goal line (X=50) acts as the "second last".
    } else {
        secondLastOpponentX = opponentPlayers[1].x; // The second player in the sorted list.
    }
}

// 3. Identify players in offside position and check for offside offence.
let playersInOffsidePositionCount = 0;
let offsideOffenceCommitted = false;

for (const player of players) {
    if (player.team !== attackingTeam) {
        continue; // Only check players of the attacking team.
    }

    // Rule: Offside applies only to players in the opponent's half of the pitch.
    let isInOpponentHalf = false;
    if (attackingTeam === 'A') { // TEAM_A attacks right to left. Opponent's half is 0 <= X <= 25.
        isInOpponentHalf = player.x <= HALF_WAY_LINE_X;
    } else { // TEAM_B attacks left to right. Opponent's half is 26 <= X <= 50.
        isInOpponentHalf = player.x > HALF_WAY_LINE_X;
    }
    if (!isInOpponentHalf) {
        continue; // Player is in their own half, cannot be offside.
    }

    // Rule: Player must be nearer to the opponent's goal line than the ball.
    let nearerThanBall = false;
    if (attackingTeam === 'A') { // Goal at X=0, smaller X is nearer.
        nearerThanBall = player.x < ball.x;
    } else { // Goal at X=50, larger X is nearer.
        nearerThanBall = player.x > ball.x;
    }

    // Rule: Player must be nearer to the opponent's goal line than the second last opponent.
    let nearerThanSLO = false;
    if (attackingTeam === 'A') { // Goal at X=0, smaller X is nearer.
        nearerThanSLO = player.x < secondLastOpponentX;
    } else { // Goal at X=50, larger X is nearer.
        nearerThanSLO = player.x > secondLastOpponentX;
    }

    // A player is in an offside position if they are nearer to the opponent's goal line
    // than BOTH the ball AND the second last opponent.
    if (nearerThanBall && nearerThanSLO) {
        playersInOffsidePositionCount++;
        // Being in an offside position is not an offence in itself.
        // It becomes an offence if the player is actively involved.
        if (player.isActive) {
            offsideOffenceCommitted = true;
        }
    }
}

// Output results
if (playersInOffsidePositionCount === 0) {
    print("No player in an offside position.");
} else {
    print(`${playersInOffsidePositionCount} player(s) in an offside position.`);
}

// VAR decision: OFFSIDE if offence committed AND not a throw-in. Otherwise ONSIDE.
if (offsideOffenceCommitted && !isThrowIn) {
    print("VAR: OFFSIDE!");
} else {
    print("VAR: ONSIDE!");
}