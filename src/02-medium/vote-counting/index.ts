/**
 * Reads a line from standard input.
 * In the CodinGame environment, this function is typically provided globally.
 */
declare function readline(): string;

function solve() {
    const N: number = parseInt(readline()); // Number of voters
    const M: number = parseInt(readline()); // Number of votes

    // Map to store voter limits: voterName -> maxAllowedVotes
    const voterLimits = new Map<string, number>();

    // Array to store all votes cast in the order they appear
    const allVotesCast: { voterName: string, voteValue: string }[] = [];

    // --- Phase 1: Read initial voter limits ---
    for (let i = 0; i < N; i++) {
        const line = readline().split(' ');
        const personName = line[0];
        const nbVote = parseInt(line[1]);
        voterLimits.set(personName, nbVote);
    }

    // --- Phase 2: Read all votes and store them ---
    // We store them first to allow multiple passes for validation
    for (let i = 0; i < M; i++) {
        const line = readline().split(' ');
        const voterName = line[0];
        const voteValue = line[1];
        allVotesCast.push({ voterName, voteValue });
    }

    // --- Phase 3: Determine which voters are invalid ---
    // This set will contain names of voters whose ALL votes are invalid.
    // This happens if they are unknown or exceed their allowed vote count at any point.
    const invalidVoters = new Set<string>();
    
    // A temporary map to track the current count of votes cast by each voter
    // during this validation phase.
    const voterActualCounts = new Map<string, number>();

    for (const vote of allVotesCast) {
        const { voterName } = vote;

        // Rule: The person that voted is not in the list of voters.
        // If the voter is unknown, add them to the invalidVoters set.
        if (!voterLimits.has(voterName)) {
            invalidVoters.add(voterName);
            continue; // This voter is immediately invalid; no need for further checks on them
        }

        // If the voter is already marked as invalid (e.g., due to exceeding limit earlier),
        // we don't need to process their subsequent votes for the purpose of marking them invalid again.
        if (invalidVoters.has(voterName)) {
            continue;
        }

        // Rule: the voter voted more than he is allowed to (all his votes are invalid).
        // Increment the count of votes cast by this voter.
        const currentCount = (voterActualCounts.get(voterName) || 0) + 1;
        voterActualCounts.set(voterName, currentCount);

        const allowedVotes = voterLimits.get(voterName)!; // '!' because we've checked .has(voterName)

        // If the voter has cast more votes than allowed, mark them as invalid.
        if (currentCount > allowedVotes) {
            invalidVoters.add(voterName);
        }
    }

    // --- Phase 4: Count valid "Yes" and "No" votes ---
    let yesCount = 0;
    let noCount = 0;

    for (const vote of allVotesCast) {
        const { voterName, voteValue } = vote;

        // If the voter is in the invalidVoters set, skip this vote (and all their other votes).
        if (invalidVoters.has(voterName)) {
            continue;
        }

        // Rule: One vote is invalid if it is neither Yes, nor No.
        // We only count votes that are strictly "Yes" or "No".
        if (voteValue === "Yes") {
            yesCount++;
        } else if (voteValue === "No") {
            noCount++;
        }
        // If voteValue is anything else (e.g., "MAYBE"), it is not a "Yes" or "No"
        // valid vote, so it's simply skipped and does not affect the counts.
    }

    // Output the final counts
    console.log(`${yesCount} ${noCount}`);
}

// Call the solve function to run the puzzle logic
solve();