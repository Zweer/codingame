/**
 * Reads a line from standard input. In CodinGame, this is provided globally.
 * For local testing, this needs to be mocked.
 */
declare function readline(): string;

/**
 * Prints a string to standard output, followed by a newline. In CodinGame, this is provided globally.
 * For local testing, this needs to be mocked.
 */
declare function print(s: any): void;

// Player interface to store relevant information for each friend
interface Player {
    name: string;
    rawWords: string[]; // Words as written by player (may contain duplicates)
    scoringWords: { word: string, score: number }[]; // Words that actually score points
    totalScore: number;
}

// Type aliases for board and visited array
type Board = string[][];
type Visited = boolean[][];

/**
 * Calculates the score for a given word based on Boggle rules.
 * @param word The word string.
 * @returns The score for the word.
 */
function calculateWordScore(word: string): number {
    const len = word.length;
    if (len >= 3 && len <= 4) return 1;
    if (len === 5) return 2;
    if (len === 6) return 3;
    if (len === 7) return 5;
    if (len >= 8) return 11;
    return 0; // Words are guaranteed to be >= 3 letters long by constraints
}

/**
 * Checks if a word can be formed on the Boggle board by connecting adjacent letters.
 * A letter on the board can be used only once per word.
 * @param word The word to check.
 * @param board The 4x4 Boggle board.
 * @returns True if the word can be formed, false otherwise.
 */
function isValidWordOnBoard(word: string, board: Board): boolean {
    const rows = board.length;
    const cols = board[0].length;

    // Directions for 8 adjacent cells (including diagonals)
    const dr = [-1, -1, -1, 0, 0, 1, 1, 1];
    const dc = [-1, 0, 1, -1, 1, -1, 0, 1];

    /**
     * Depth-First Search (DFS) to find the word on the board.
     * @param index Current letter index in the word being searched.
     * @param r Current row.
     * @param c Current column.
     * @param visited 2D array to track visited cells for the current path,
     *                preventing reuse of letters within the same word.
     * @returns True if the rest of the word can be formed from (r, c), false otherwise.
     */
    function dfs(index: number, r: number, c: number, visited: Visited): boolean {
        // Base case: If we've found all letters of the word
        if (index === word.length) {
            return true;
        }

        // Check bounds, if cell is already visited for this path, or if letter doesn't match
        if (r < 0 || r >= rows || c < 0 || c >= cols || visited[r][c] || board[r][c] !== word[index]) {
            return false;
        }

        visited[r][c] = true; // Mark current cell as visited for this path

        // Explore neighbors
        for (let i = 0; i < 8; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            if (dfs(index + 1, nr, nc, visited)) {
                return true; // Found the rest of the word
            }
        }

        visited[r][c] = false; // Backtrack: unmark current cell as visited for this path
        return false;
    }

    // Try starting DFS from every cell on the board
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === word[0]) {
                // A fresh visited array is needed for each independent starting path
                const initialVisited: Visited = Array.from({ length: rows }, () => Array(cols).fill(false));
                if (dfs(0, r, c, initialVisited)) {
                    return true;
                }
            }
        }
    }

    return false;
}

// --- Main Logic ---

// 1. Read Boggle Board (4x4)
const boggleBoard: Board = [];
for (let i = 0; i < 4; i++) {
    boggleBoard.push(readline().split(' '));
}

// 2. Read Number of Friends
const numOfFriends: number = parseInt(readline());

// 3. Read Friends' Notepads and Initialize Player objects
const players: Player[] = [];
for (let i = 0; i < numOfFriends; i++) {
    const line = readline();
    const parts = line.split('writes: ');
    const name = parts[0].trim();
    // Split words, filtering out any empty strings that might result from multiple spaces or trailing spaces
    const rawWords = parts[1].trim().split(' ').filter(w => w.length > 0);
    players.push({
        name,
        rawWords,
        scoringWords: [], // Will be populated later
        totalScore: 0,   // Will be calculated later
    });
}

// 4. Determine All Valid-on-Board Words and Which Players Submitted Them
// Map: word -> Set of player names who submitted this word (and it's valid on board)
const wordToSubmittingPlayers = new Map<string, Set<string>>();

for (const player of players) {
    // Use a Set to handle a player's own repeated words at this stage (only count unique submissions for commonality check)
    const playerSubmittedUniqueWords = new Set<string>(player.rawWords);

    for (const word of playerSubmittedUniqueWords) {
        if (isValidWordOnBoard(word, boggleBoard)) {
            if (!wordToSubmittingPlayers.has(word)) {
                wordToSubmittingPlayers.set(word, new Set<string>());
            }
            wordToSubmittingPlayers.get(word)!.add(player.name);
        }
    }
}

// 5. Identify "Common Words" (words submitted by more than one player AND valid on board)
const commonWords = new Set<string>();
for (const [word, submittingPlayersSet] of wordToSubmittingPlayers.entries()) {
    if (submittingPlayersSet.size > 1) {
        commonWords.add(word);
    }
}

// 6. Calculate Player Scores and Populate Scoring Words
for (const player of players) {
    // Use a Set to track words already processed for scoring for THIS player
    // This handles the rule: "If a player writes down a word more than once, all the repeated instances are ignored."
    const playerWordsAlreadyProcessedForScoring = new Set<string>();

    // Iterate through the player's raw words to maintain the original input order for output
    for (const word of player.rawWords) {
        if (playerWordsAlreadyProcessedForScoring.has(word)) {
            continue; // This word has already been considered for scoring for this player
        }
        playerWordsAlreadyProcessedForScoring.add(word); // Mark as processed for this player

        // Check if the word is valid on the board AND not a common word
        const isBoardValid = isValidWordOnBoard(word, boggleBoard);
        const isCommon = commonWords.has(word);

        if (isBoardValid && !isCommon) {
            const score = calculateWordScore(word);
            player.scoringWords.push({ word, score });
            player.totalScore += score;
        }
    }
}

// 7. Find the Winner
let winner: Player = players[0]; // Constraint: numOfFriends >= 2, so players array is not empty
for (let i = 1; i < players.length; i++) {
    if (players[i].totalScore > winner.totalScore) {
        winner = players[i];
    }
}

// 8. Generate Output
print(`${winner.name} is the winner!`);
print('');
print('===Each Player\'s Score===');
for (const player of players) {
    print(`${player.name} ${player.totalScore}`);
}
print('');
print('===Each Scoring Player\'s Scoring Words===');
for (const player of players) {
    // Only print a player's section if they scored any points
    if (player.scoringWords.length > 0) {
        print(player.name);
        for (const scoringWord of player.scoringWords) {
            print(`${scoringWord.score} ${scoringWord.word}`);
        }
    }
}