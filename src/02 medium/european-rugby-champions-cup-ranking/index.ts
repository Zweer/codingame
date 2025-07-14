/**
 * Represents the detailed statistics for a rugby team.
 */
interface TeamStats {
    name: string;
    poolName: string;
    rankingPoints: number;
    gamePointsScored: number;
    gamePointsConceded: number;
    positionInPool?: 'Leader' | 'Runner-Up' | 'Third' | 'Last';
    totalGameDiff: number; // Derived for convenience
}

/**
 * Represents the result of a single rugby game.
 */
interface GameResult {
    teamA: string;
    scoreA: number;
    triesA: number;
    teamB: string;
    scoreB: number;
    triesB: number;
}

// Global maps and arrays to store game and team data
const teamsMap = new Map<string, TeamStats>();
const allGames: GameResult[] = [];
const pools = new Map<string, string[]>(); // Map pool name to team names in that pool

/**
 * Helper function to calculate ranking points and game point difference for a team
 * based on a specific subset of games and a specific set of opponent names.
 * This is used for head-to-head tie-breaking.
 * @param teamName The name of the team whose stats are being calculated.
 * @param opponentNames The names of the opponents to consider in the games.
 * @param games The list of games to consider for calculations.
 * @returns An object containing calculated ranking points (rp) and game point difference (gpd).
 */
function calculateSubgroupStats(teamName: string, opponentNames: string[], games: GameResult[]): { rp: number, gpd: number } {
    let rp = 0;
    let gps = 0;
    let gpc = 0;

    for (const game of games) {
        let myScore = -1, myTries = -1, oppScore = -1, oppTries = -1;
        let playedThisGame = false;

        // Check if the game involves teamName playing against one of the opponentNames
        if (game.teamA === teamName && opponentNames.includes(game.teamB)) {
            myScore = game.scoreA; myTries = game.triesA;
            oppScore = game.scoreB; oppTries = game.triesB;
            playedThisGame = true;
        } else if (game.teamB === teamName && opponentNames.includes(game.teamA)) {
            myScore = game.scoreB; myTries = game.triesB;
            oppScore = game.scoreA; oppTries = game.triesA;
            playedThisGame = true;
        }

        if (playedThisGame) {
            gps += myScore;
            gpc += oppScore;

            // Win/Draw/Loss points
            if (myScore > oppScore) rp += 4;
            else if (myScore === oppScore) rp += 2;

            // Tries bonus
            if (myTries >= 4) rp += 1;

            // Losing bonus (lost by a maximum of 7 game-points)
            if (myScore < oppScore && (oppScore - myScore) <= 7) rp += 1;
        }
    }
    return { rp, gpd: gps - gpc };
}

/**
 * Sorts teams within a pool, applying all intra-pool tie-breaker rules.
 * @param teams The array of TeamStats objects for a specific pool.
 * @param poolGames The array of GameResult objects specific to this pool.
 * @returns A new array of TeamStats, sorted according to intra-pool rules.
 */
function sortTeamsWithTieBreakers(teams: TeamStats[], poolGames: GameResult[]): TeamStats[] {
    const sortedTeams = [...teams];

    // Step 1: Initial sort by total ranking points and total game difference
    sortedTeams.sort((a, b) => {
        if (a.rankingPoints !== b.rankingPoints) {
            return b.rankingPoints - a.rankingPoints; // Descending
        }
        // totalGameDiff is already calculated and stored on TeamStats
        return b.totalGameDiff - a.totalGameDiff; // Descending
    });

    // Step 2: Iterate and re-sort tied groups using head-to-head criteria
    // This loop finds contiguous groups that are tied by the first two criteria.
    let i = 0;
    while (i < sortedTeams.length) {
        let j = i;
        // Find the end of the current tied group
        while (j < sortedTeams.length - 1 &&
               sortedTeams[j].rankingPoints === sortedTeams[j+1].rankingPoints &&
               sortedTeams[j].totalGameDiff === sortedTeams[j+1].totalGameDiff) {
            j++;
        }

        if (j > i) { // Found a tied group of more than one team (j is the last index of the tied group)
            const tiedGroup = sortedTeams.slice(i, j + 1);
            const tiedTeamNames = tiedGroup.map(t => t.name);

            // Calculate head-to-head stats for each team in the tied group
            const h2hStats = tiedGroup.map(team => {
                // Opponents for this team are all other teams within the tied group
                const otherTiedTeamNames = tiedTeamNames.filter(name => name !== team.name);
                const stats = calculateSubgroupStats(team.name, otherTiedTeamNames, poolGames);
                return { team, h2hRp: stats.rp, h2hGpd: stats.gpd };
            });

            // Sort the tied group based on their head-to-head stats
            h2hStats.sort((a, b) => {
                if (a.h2hRp !== b.h2hRp) {
                    return b.h2hRp - a.h2hRp; // Descending
                }
                return b.h2hGpd - a.h2hGpd; // Descending
            });

            // Place the re-sorted teams back into the main sortedTeams array
            for (let k = 0; k < tiedGroup.length; k++) {
                sortedTeams[i + k] = h2hStats[k].team;
            }
        }
        i = j + 1; // Move to the next potential group
    }
    return sortedTeams;
}


// --- Main Logic ---

// Read pool definitions (5 lines)
const poolLines: string[] = [];
for (let i = 0; i < 5; i++) {
    poolLines.push(readline());
}

// Read game results (60 lines)
const gameLines: string[] = [];
for (let i = 0; i < 60; i++) {
    gameLines.push(readline());
}

// 1. Initialize Teams and Pools
let poolCounter = 0;
for (const line of poolLines) {
    const poolName = `Pool ${String.fromCharCode(65 + poolCounter)}`; // Generate pool names A, B, C, D, E
    const teamNames = line.split(',');
    pools.set(poolName, teamNames);

    for (const teamName of teamNames) {
        teamsMap.set(teamName.trim(), { // Use .trim() for safety
            name: teamName.trim(),
            poolName: poolName,
            rankingPoints: 0,
            gamePointsScored: 0,
            gamePointsConceded: 0,
            totalGameDiff: 0 // Will be calculated after all games are processed
        });
    }
    poolCounter++;
}

// 2. Process Game Results and Calculate Initial Team Statistics
for (const line of gameLines) {
    const parts = line.split(',');
    const game: GameResult = {
        teamA: parts[0].trim(),
        scoreA: parseInt(parts[1]),
        triesA: parseInt(parts[2]),
        teamB: parts[3].trim(),
        scoreB: parseInt(parts[4]),
        triesB: parseInt(parts[5]),
    };
    allGames.push(game);

    const teamAStats = teamsMap.get(game.teamA)!;
    const teamBStats = teamsMap.get(game.teamB)!;

    // Update game points scored/conceded
    teamAStats.gamePointsScored += game.scoreA;
    teamAStats.gamePointsConceded += game.scoreB;
    teamBStats.gamePointsScored += game.scoreB;
    teamBStats.gamePointsConceded += game.scoreA;

    // Calculate ranking points for this game
    let pointsA = 0;
    let pointsB = 0;

    // Win/Draw/Loss points
    if (game.scoreA > game.scoreB) {
        pointsA += 4;
    } else if (game.scoreB > game.scoreA) {
        pointsB += 4;
    } else { // Draw
        pointsA += 2;
        pointsB += 2;
    }

    // Tries bonus
    if (game.triesA >= 4) pointsA += 1;
    if (game.triesB >= 4) pointsB += 1;

    // Losing bonus
    if (game.scoreA < game.scoreB && (game.scoreB - game.scoreA) <= 7) pointsA += 1;
    if (game.scoreB < game.scoreA && (game.scoreA - game.scoreB) <= 7) pointsB += 1;

    // Accumulate points to total
    teamAStats.rankingPoints += pointsA;
    teamBStats.rankingPoints += pointsB;
}

// Update totalGameDiff for all teams after all games are processed
teamsMap.forEach(team => {
    team.totalGameDiff = team.gamePointsScored - team.gamePointsConceded;
});

// 3. Intra-Pool Ranking
const qualifiedTeams: TeamStats[] = []; // Will store 5 Leaders and 5 Runners-Up

for (const [poolName, teamNamesInPool] of pools.entries()) {
    const currentPoolTeams = teamNamesInPool.map(name => teamsMap.get(name)!);
    
    // Filter games specific to this pool for tie-breaking
    const gamesInPool = allGames.filter(game =>
        teamNamesInPool.includes(game.teamA) && teamNamesInPool.includes(game.teamB)
    );

    const sortedPoolTeams = sortTeamsWithTieBreakers(currentPoolTeams, gamesInPool);

    // Assign pool positions and add Leaders/Runners-Up to qualified list
    sortedPoolTeams[0].positionInPool = 'Leader';
    qualifiedTeams.push(sortedPoolTeams[0]);

    sortedPoolTeams[1].positionInPool = 'Runner-Up';
    qualifiedTeams.push(sortedPoolTeams[1]);

    sortedPoolTeams[2].positionInPool = 'Third'; // Not qualified, but set position
    sortedPoolTeams[3].positionInPool = 'Last';  // Not qualified, but set position
}

// 4. Inter-Pool Ranking
// Filter to get only the 5 leaders and 5 runners-up
const quarterFinalCandidates = qualifiedTeams.filter(team =>
    team.positionInPool === 'Leader' || team.positionInPool === 'Runner-Up'
);

quarterFinalCandidates.sort((a, b) => {
    // 1. Ranking in their pool (Leader first, then Runner-Up)
    const positionOrder = {
        'Leader': 0, 'Runner-Up': 1, 'Third': 2, 'Last': 3
    };
    const posA = positionOrder[a.positionInPool!];
    const posB = positionOrder[b.positionInPool!];
    if (posA !== posB) {
        return posA - posB; // Ascending order (0 comes before 1)
    }

    // 2. Highest number of ranking-points (total from pool stage)
    if (a.rankingPoints !== b.rankingPoints) {
        return b.rankingPoints - a.rankingPoints; // Descending
    }

    // 3. Best aggregate game-points difference (total from pool stage)
    return b.totalGameDiff - a.totalGameDiff; // Descending
});

// The top 8 teams are the ones that qualify for the quarter-finals
const finalEight = quarterFinalCandidates.slice(0, 8);

// 5. Output Quarter-Finals
console.log(`${finalEight[0].name} - ${finalEight[7].name}`);
console.log(`${finalEight[1].name} - ${finalEight[6].name}`);
console.log(`${finalEight[2].name} - ${finalEight[5].name}`);
console.log(`${finalEight[3].name} - ${finalEight[4].name}`);