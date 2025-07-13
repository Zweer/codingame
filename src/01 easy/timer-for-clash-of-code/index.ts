/**
 * Helper function to convert a time string "m:ss" to total seconds.
 * @param timeStr The time string in "m:ss" format.
 * @returns The total number of seconds.
 */
function timeToSeconds(timeStr: string): number {
    const parts = timeStr.split(':');
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
}

/**
 * Helper function to convert total seconds back to a time string "m:ss".
 * Seconds will be formatted with a leading zero if less than 10.
 * @param totalSeconds The total number of seconds.
 * @returns The time string in "m:ss" format.
 */
function secondsToTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    // Pad seconds with a leading zero if it's a single digit
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Read the number of player join events from input
const n: number = parseInt(readline(), 10);

// If no players join (n=0), the game does not start.
if (n === 0) {
    console.log("NO GAME");
} else {
    // Array to store the time on the timer (in seconds) when each player joins.
    // The input timestamps are already in the format of the timer value (e.g., 4:47 means the timer shows 4:47).
    const joinEventTimesOnTimerSeconds: number[] = [];
    for (let i = 0; i < n; i++) {
        joinEventTimesOnTimerSeconds.push(timeToSeconds(readline()));
    }

    // Initialize variables:
    // numPlayersTotal: Tracks the total number of players in the room. Starts at 1 (the host).
    let numPlayersTotal: number = 1; 
    
    // finalStartTimerValueSeconds: The time on the timer (in seconds) at which the game is currently set to start.
    // Initially, it's 0:00 (0 seconds), meaning the game starts when the timer reaches zero.
    let finalStartTimerValueSeconds: number = 0; 

    // k_player_join_count: This variable represents 'p' in the formula 256 / (2^(p - 1)).
    // It is 1 for the 1st player joining from the input (2nd player overall), 2 for the 2nd, and so on.
    let k_player_join_count: number = 0; 

    // Process each player join event
    for (const joinTimeOnTimerSeconds of joinEventTimesOnTimerSeconds) {
        k_player_join_count++; // Increment for the current joining player (1st, 2nd, 3rd, etc. player from input)
        numPlayersTotal++;    // Increment total players in the room

        // 't' in the formula is the current time in seconds displayed on the timer when the player joins.
        const t: number = joinTimeOnTimerSeconds;

        // Calculate the adjustment based on the formula: 256 / (2^(p - 1))
        // Here, 'p' corresponds to k_player_join_count.
        // For k_player_join_count = 1 (1st player joining), adjustment = 256 / (2^0) = 256
        // For k_player_join_count = 2 (2nd player joining), adjustment = 256 / (2^1) = 128
        // And so on...
        const adjustment: number = 256 / (2 ** (k_player_join_count - 1));

        // Calculate the new target time on the timer
        let newTargetTime: number = t - adjustment;

        // Rule: If the result is under 0:00, set it to 0:00.
        finalStartTimerValueSeconds = Math.max(0, newTargetTime);
        
        // The problem implies that if the room becomes full (8 players total),
        // the game starts. Since n <= 7, the max k_player_join_count is 7,
        // which makes numPlayersTotal 8. The calculated finalStartTimerValueSeconds
        // at this point correctly represents the start time under this condition.
    }

    // Output the final game start time in m:ss format
    console.log(secondsToTime(finalStartTimerValueSeconds));
}