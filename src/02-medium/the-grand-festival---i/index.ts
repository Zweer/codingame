// Standard input reading for CodinGame
const N: number = parseInt(readline());
const R: number = parseInt(readline());

const prizes: number[] = [];
for (let i = 0; i < N; i++) {
    prizes.push(parseInt(readline()));
}

// prev_dp_play[k] stores the maximum prize money obtained when considering tournaments
// up to the previous day (i-1), where day (i-1) was played and it was the (k+1)-th
// consecutive day in a streak.
// (k ranges from 0 to R-1, so k=0 means 1st consecutive day, k=R-1 means R-th consecutive day).
let prev_dp_play: number[] = new Array(R).fill(Number.NEGATIVE_INFINITY);

// current_dp_play[k] serves the same purpose but for the current day (i).
let current_dp_play: number[] = new Array(R).fill(Number.NEGATIVE_INFINITY);

// prev_dp_rest stores the maximum prize money obtained when considering
// tournaments up to the previous day (i-1), where day (i-1) was rested.
let prev_dp_rest: number = 0; // Initial state: before any tournaments, 0 money.

// --- Base Case: Day 0 (first tournament, index 0) ---
// If we play on Day 0, it is the 1st consecutive day (k=0).
prev_dp_play[0] = prizes[0];

// --- DP Iteration from Day 1 (index 1) to Day N-1 ---
for (let i = 1; i < N; i++) {
    // 1. Calculate current_dp_rest for day 'i':
    // If we rest on day 'i', the maximum money could come from two scenarios:
    //    a. We also rested on day 'i-1'. (represented by prev_dp_rest)
    //    b. We played on day 'i-1' (in any streak length from 1 to R) and decided/had to rest on day 'i'.
    //       This is the maximum value from all prev_dp_play states.
    // We take the maximum of these possibilities.
    current_dp_rest = Math.max(prev_dp_rest, ...prev_dp_play);

    // Reset current_dp_play for the new day's calculations.
    // It must be filled with NEGATIVE_INFINITY because some states might not be reachable for the current day.
    current_dp_play.fill(Number.NEGATIVE_INFINITY); 

    // 2. Calculate current_dp_play for day 'i' (if we choose to play on day 'i'):

    // Case k=0: Day 'i' is the 1st consecutive day in a new streak.
    // This implies we must have rested on day 'i-1'.
    current_dp_play[0] = prizes[i] + prev_dp_rest;

    // Cases k=1 to R-1: Day 'i' is the (k+1)-th consecutive day in a streak.
    // This implies we must have played on day 'i-1' as the k-th consecutive day.
    for (let k = 1; k < R; k++) {
        // Only proceed if prev_dp_play[k-1] (the state representing (k)-th consecutive day played ending i-1)
        // was a reachable/valid state (not -Infinity).
        if (prev_dp_play[k-1] !== Number.NEGATIVE_INFINITY) {
            current_dp_play[k] = prizes[i] + prev_dp_play[k-1];
        }
        // If prev_dp_play[k-1] was -Infinity, current_dp_play[k] remains -Infinity,
        // meaning this specific streak length is impossible to achieve ending on day 'i'.
    }

    // --- Prepare for the next iteration ---
    prev_dp_rest = current_dp_rest;
    // Copy current_dp_play to prev_dp_play for the next day's calculations.
    // Using the spread operator [...] creates a new array (deep copy for primitive types).
    prev_dp_play = [...current_dp_play];
}

// --- Final Result ---
// The maximum prize money is the maximum of all possible states on the last day (N-1):
// 1. Having rested on the last day (represented by prev_dp_rest after the loop finishes).
// 2. Having played 'k' consecutive days ending on the last day (represented by values in prev_dp_play).
let max_money: number = Math.max(prev_dp_rest, ...prev_dp_play);

console.log(max_money);