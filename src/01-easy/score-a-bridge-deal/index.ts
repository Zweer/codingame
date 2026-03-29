// Required for CodinGame environment
declare function readline(): string;
declare function print(message: any): void; // Equivalent to console.log

/**
 * Calculates the score for a Bridge deal.
 * @param vulnerability 'V' for vulnerable, 'NV' for non-vulnerable.
 * @param contractStr The contract string (e.g., "4S", "3NTX", "Pass").
 * @param tricksWon The number of tricks won (0-13).
 * @returns The score achieved by the declaring side (positive or negative).
 */
function calculateScore(vulnerability: string, contractStr: string, tricksWon: number): number {
    let score = 0;
    const isVulnerable = vulnerability === 'V';

    // A "Pass" contract always scores 0 points.
    if (contractStr === 'Pass') {
        return 0;
    }

    let contractLevel: number;
    let contractSuit: string;
    let isDoubled = false;
    let isRedoubled = false;

    // Parse contract string to extract level, suit, and doubling status.
    // Check for redoubled ('XX') first, then doubled ('X'), as 'XX' includes 'X'.
    if (contractStr.endsWith('XX')) {
        isRedoubled = true;
        contractStr = contractStr.slice(0, -2); // Remove 'XX'
    } else if (contractStr.endsWith('X')) {
        isDoubled = true;
        contractStr = contractStr.slice(0, -1); // Remove 'X'
    }

    contractLevel = parseInt(contractStr[0]); // First char is the level
    contractSuit = contractStr.slice(1);     // Remaining chars are the suit

    const tricksRequiredToMakeContract = contractLevel + 6;
    const contractMade = tricksWon >= tricksRequiredToMakeContract;

    if (contractMade) {
        // --- Contract Was Made (Won) ---

        let baseContractTrickPoints = 0;
        let normalTrickValueForOvertricks = 0; // This value is also used for calculating points for overtricks in undoubled contracts.

        if (contractSuit === 'C' || contractSuit === 'D') {
            // Minor suits (Clubs, Diamonds)
            normalTrickValueForOvertricks = 20;
            baseContractTrickPoints = contractLevel * normalTrickValueForOvertricks;
        } else if (contractSuit === 'H' || contractSuit === 'S') {
            // Major suits (Hearts, Spades)
            normalTrickValueForOvertricks = 30;
            baseContractTrickPoints = contractLevel * normalTrickValueForOvertricks;
        } else if (contractSuit === 'NT') {
            // No Trump
            normalTrickValueForOvertricks = 30; // NT overtricks are 30 points each
            baseContractTrickPoints = 40 + (contractLevel - 1) * normalTrickValueForOvertricks; // First NT trick is 40, subsequent are 30
        }

        // Apply doubling/redoubling multipliers to the base points for contracted tricks
        if (isRedoubled) {
            baseContractTrickPoints *= 4;
        } else if (isDoubled) {
            baseContractTrickPoints *= 2;
        }
        score += baseContractTrickPoints;

        // Game Bonus or Part-Score Bonus
        if (baseContractTrickPoints >= 100) {
            score += isVulnerable ? 500 : 300; // Game bonus
        } else {
            score += 50; // Part-score bonus for succeeding
        }

        // Slam Bonuses
        if (contractLevel === 6) { // Small Slam (contracting for 12 tricks)
            score += isVulnerable ? 750 : 500;
        } else if (contractLevel === 7) { // Grand Slam (contracting for all 13 tricks)
            score += isVulnerable ? 1500 : 1000;
        }

        // Making Bonus for Doubled/Redoubled contracts
        if (isRedoubled) {
            score += 100;
        } else if (isDoubled) {
            score += 50;
        }

        // Overtricks (tricks won beyond the contract level)
        const overtricks = tricksWon - tricksRequiredToMakeContract;
        if (overtricks > 0) {
            if (isRedoubled) {
                score += overtricks * (isVulnerable ? 400 : 200); // Redoubled values are double doubled values
            } else if (isDoubled) {
                score += overtricks * (isVulnerable ? 200 : 100);
            } else { // Normal contract (not doubled/redoubled)
                score += overtricks * normalTrickValueForOvertricks;
            }
        }

    } else {
        // --- Contract Was Not Made (Lost) ---
        const undertricks = tricksRequiredToMakeContract - tricksWon;

        // Calculate penalty based on doubling/redoubling and vulnerability
        if (isRedoubled) {
            let penalty = 0;
            if (!isVulnerable) {
                // Non-Vulnerable Redoubled: 200 (1st), 400 (2nd, 3rd), 600 (4th+)
                penalty += Math.min(1, undertricks) * 200; // 1st undertrick
                penalty += Math.min(2, Math.max(0, undertricks - 1)) * 400; // 2nd and 3rd undertrick
                penalty += Math.max(0, undertricks - 3) * 600; // 4th undertrick and beyond
            } else {
                // Vulnerable Redoubled: 400 (1st), 600 (2nd+)
                penalty += Math.min(1, undertricks) * 400; // 1st undertrick
                penalty += Math.max(0, undertricks - 1) * 600; // 2nd undertrick and beyond
            }
            score -= penalty;
        } else if (isDoubled) {
            let penalty = 0;
            if (!isVulnerable) {
                // Non-Vulnerable Doubled: 100 (1st), 200 (2nd, 3rd), 300 (4th+)
                penalty += Math.min(1, undertricks) * 100; // 1st undertrick
                penalty += Math.min(2, Math.max(0, undertricks - 1)) * 200; // 2nd and 3rd undertrick
                penalty += Math.max(0, undertricks - 3) * 300; // 4th undertrick and beyond
            } else {
                // Vulnerable Doubled: 200 (1st), 300 (2nd+)
                penalty += Math.min(1, undertricks) * 200; // 1st undertrick
                penalty += Math.max(0, undertricks - 1) * 300; // 2nd undertrick and beyond
            }
            score -= penalty;
        } else { // Normal contract (not doubled/redoubled)
            score -= undertricks * (isVulnerable ? 100 : 50);
        }
    }

    return score;
}

// Main program loop for CodinGame environment
const nbTests: number = parseInt(readline());

for (let i = 0; i < nbTests; i++) {
    const line: string = readline();
    const parts = line.split(' ');
    const vulnerability = parts[0];
    const contractString = parts[1]; // e.g., "4S", "3NTX", "Pass"
    let tricksWon = 0;

    // If it's not a "Pass" contract, the tricks won will be the third part of the input line.
    if (contractString !== 'Pass') {
        tricksWon = parseInt(parts[2]);
    }

    const resultScore = calculateScore(vulnerability, contractString, tricksWon);
    print(resultScore); // Output the calculated score for the current test case
}