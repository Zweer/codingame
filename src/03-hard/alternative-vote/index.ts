/**
 * Reads a line from standard input.
 * In a CodinGame environment, `readline()` is typically provided globally.
 */
declare function readline(): string;

function solve() {
    // Read the number of candidates
    const C: number = parseInt(readline());

    // Store candidate names. Candidate IDs are 1-based, so candidateNames[id-1] gives the name.
    const candidateNames: string[] = [];
    for (let i = 0; i < C; i++) {
        candidateNames.push(readline());
    }

    // Read the number of voters
    const V: number = parseInt(readline());

    // Store voter preferences. Each voter's preference is an array of candidate IDs in their ranked order.
    // voterPreferences[voterIndex] is an array like [3, 1, 2].
    const voterPreferences: number[][] = [];
    for (let i = 0; i < V; i++) {
        voterPreferences.push(readline().split(' ').map(Number));
    }

    // Initialize the set of active candidates (all candidates are active initially).
    const activeCandidateIds: Set<number> = new Set();
    for (let i = 1; i <= C; i++) {
        activeCandidateIds.add(i);
    }

    // Array to store the names of candidates as they are eliminated, in order.
    const eliminatedOrder: string[] = [];

    // Main election loop: continues until only one candidate remains.
    while (activeCandidateIds.size > 1) {
        // Initialize vote counts for this round for all active candidates.
        const currentVotes: Map<number, number> = new Map();
        for (const id of activeCandidateIds) {
            currentVotes.set(id, 0);
        }

        // Count votes for each active candidate based on voter preferences.
        for (const preferences of voterPreferences) {
            // Find the first active candidate in this voter's preference list.
            for (const preferredCandidateId of preferences) {
                if (activeCandidateIds.has(preferredCandidateId)) {
                    // This voter casts their vote for this candidate.
                    currentVotes.set(preferredCandidateId, currentVotes.get(preferredCandidateId)! + 1);
                    break; // Move to the next voter.
                }
            }
        }

        // Determine the candidate to eliminate: the one with the fewest votes.
        // In case of a tie, eliminate the one that appeared first in the input list (lowest ID).
        let minVotes = Infinity;
        let candidateToEliminateId: number = -1;

        // Convert the Set of active candidate IDs to an array and sort it.
        // This ensures that when we iterate to find the minimum, if there's a tie
        // in votes, the candidate with the lower ID (earlier in original input)
        // will be chosen for elimination.
        const sortedActiveCandidateIds = Array.from(activeCandidateIds).sort((a, b) => a - b);

        for (const candidateId of sortedActiveCandidateIds) {
            const votes = currentVotes.get(candidateId)!;

            if (votes < minVotes) {
                minVotes = votes;
                candidateToEliminateId = candidateId;
            }
            // No need for an explicit tie-breaking check (e.g., `else if (votes === minVotes && candidateId < candidateToEliminateId)`)
            // because `sortedActiveCandidateIds` already ensures we process lower IDs first.
            // If an earlier ID had the min votes, it would have been picked.
        }

        // Eliminate the identified candidate.
        if (candidateToEliminateId !== -1) {
            activeCandidateIds.delete(candidateToEliminateId);
            eliminatedOrder.push(candidateNames[candidateToEliminateId - 1]);
        }
    }

    // Output the names of eliminated candidates in order.
    for (const name of eliminatedOrder) {
        console.log(name);
    }

    // Output the winner. There should be exactly one candidate left in activeCandidateIds.
    const winnerId: number = activeCandidateIds.values().next().value;
    console.log(`winner:${candidateNames[winnerId - 1]}`);
}

// Call the main function to execute the solution
solve();