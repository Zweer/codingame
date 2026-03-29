/**
 * Auto-generated code below aims at helping you parse the standard input
 * according to the problem statement.
 **/

const Level: number = parseInt(readline());
const Xp: number = parseInt(readline());
const N: number = parseInt(readline());

// Function to calculate the XP needed to go from the given level to the next level.
function calculateXpToNextLevel(level: number): number {
    // The formula is (CurrentLevel * Sqrt(CurrentLevel) * 10), rounded down.
    return Math.floor(level * Math.sqrt(level) * 10);
}

// Initialize current stats
let currentLevel: number = Level;
// xpRemainingForNextLevel is the XP needed to level up from currentLevel to currentLevel + 1.
let xpRemainingForNextLevel: number = Xp; 
// Calculate total XP earned from N accepted puzzles. Each puzzle gives 300 XP.
let totalXpEarned: number = N * 300;

// Simulate the XP gain and leveling up process
while (totalXpEarned > 0) {
    if (totalXpEarned >= xpRemainingForNextLevel) {
        // If earned XP is enough or more than what's needed for the next level:
        // Deduct the XP required for this level-up from the total earned XP.
        totalXpEarned -= xpRemainingForNextLevel;
        // Level up!
        currentLevel++;
        // Calculate the new XP requirement for the *new* current level to reach the level after it.
        xpRemainingForNextLevel = calculateXpToNextLevel(currentLevel);
    } else {
        // If earned XP is not enough for the next level:
        // Deduct all remaining earned XP from the XP needed for the next level.
        xpRemainingForNextLevel -= totalXpEarned;
        // All earned XP has been consumed, so stop the simulation.
        totalXpEarned = 0; 
    }
}

// Output the final level and the remaining XP needed for the next level.
console.log(currentLevel);
console.log(xpRemainingForNextLevel);