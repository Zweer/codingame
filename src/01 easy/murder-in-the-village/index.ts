// Global readline and print functions for CodinGame environment
declare function readline(): string;
declare function print(message: string): void;

/**
 * Represents a parsed statement from a suspect.
 */
class SuspectStatement {
    name: string;
    location: string;
    companions: Set<string> | 'alone';

    constructor(name: string, location: string, companions: Set<string> | 'alone') {
        this.name = name;
        this.location = location;
        this.companions = companions;
    }
}

/**
 * Parses a single statement line into a SuspectStatement object.
 * @param line The input string, e.g., "Paul: I was in the school with Benjamin." or "Bill: I was in the church, alone."
 * @returns A SuspectStatement object.
 * @throws Error if the statement format is invalid.
 */
function parseStatement(line: string): SuspectStatement {
    const parts = line.split(': I was in the ');
    const name = parts[0];
    const rest = parts[1]; // e.g., "school with Benjamin." or "church, alone."

    // Regex to extract location and companions part
    // Group 1: location (e.g., "school", "church") - captures one or more letters/spaces
    // Group 2: companions string (e.g., "Benjamin", "Raul and Benjamin"), or undefined if "alone"
    // It matches " with [companions]" OR ", alone" at the end of the line, followed by a period.
    const locationMatch = rest.match(/^([a-zA-Z ]+)(?: with (.+)|, alone)\.$/); 
    
    if (!locationMatch) {
        throw new Error("Invalid statement format encountered: " + line);
    }

    const location = locationMatch[1].trim();
    const companionsPart = locationMatch[2]; // Will be `undefined` if the second alternative (", alone") matched

    let companions: Set<string> | 'alone';

    if (companionsPart !== undefined) {
        // If companionsPart exists, parse the names separated by " and "
        companions = new Set(companionsPart.split(' and ').map(s => s.trim()));
    } else {
        // If companionsPart is undefined, it means "alone" was matched
        companions = 'alone';
    }

    return new SuspectStatement(name, location, companions);
}

/**
 * Solves the "Murder in the village!" puzzle.
 */
function solve() {
    const N: number = parseInt(readline()); // Number of suspects
    const statements: Map<string, SuspectStatement> = new Map(); // Stores statements by suspect name
    const allNames: string[] = []; // List of all suspect names

    // Read and parse all N statements
    for (let i = 0; i < N; i++) {
        const line = readline();
        const statement = parseStatement(line);
        statements.set(statement.name, statement);
        allNames.push(statement.name);
    }

    let foundKiller: string | null = null;

    // Iterate through each suspect, assuming they are the killer
    for (const killerCandidate of allNames) {
        let isKillerCandidateValid = true; // Flag to track consistency for the current killerCandidate

        const killerStatement = statements.get(killerCandidate)!; // Get the assumed killer's statement

        // Rule K_LIE_ALONE: The killer cannot claim to be alone.
        // "If the killer claims to be alone, the claim can be proven to be false."
        // This implies that if our assumed killer claimed "alone", they are invalid.
        if (killerStatement.companions === 'alone') {
            isKillerCandidateValid = false;
            continue; // This killerCandidate is invalid, move to the next one
        }

        // Check consistency for all other people (who are presumed to be innocent villagers)
        for (const personName of allNames) {
            // Skip the assumed killer; their statement is a lie by definition
            if (personName === killerCandidate) {
                continue;
            }

            const villagerStatement = statements.get(personName)!; // This villager's statement MUST be true

            // Rule V_NO_K_COMPANION: Villagers (non-killers) haven't seen the killer.
            // If a villager claims to have been with the assumed killer, it's a direct contradiction.
            if (villagerStatement.companions !== 'alone' && villagerStatement.companions.has(killerCandidate)) {
                isKillerCandidateValid = false;
                break; // Contradiction found, this killerCandidate is invalid
            }

            // Rule V_MUTUAL_ALIBI: Check consistency of a villager's statement with other villagers' statements.
            if (villagerStatement.companions === 'alone') {
                // If a villager claims to be alone, no other villager should claim to be with them.
                for (const otherPersonName of allNames) {
                    // Skip the current villager (personName) and the assumed killer
                    if (otherPersonName === personName || otherPersonName === killerCandidate) {
                        continue;
                    }
                    const otherPersonStatement = statements.get(otherPersonName)!;
                    // If 'otherPerson' truthfully claimed to be with 'personName', but 'personName' truthfully claimed 'alone', it's a contradiction.
                    if (otherPersonStatement.companions !== 'alone' && otherPersonStatement.companions.has(personName)) {
                        isKillerCandidateValid = false;
                        break;
                    }
                }
            } else { // This villager claims to be with specific companions
                for (const companionName of Array.from(villagerStatement.companions)) {
                    // If the companion is the assumed killer, this was already handled by Rule V_NO_K_COMPANION.
                    if (companionName === killerCandidate) {
                        continue; 
                    }

                    // If the companion is another villager, their statements must be consistent.
                    // The puzzle implies all mentioned names are among the N suspects.
                    if (statements.has(companionName)) { 
                        const companionStatement = statements.get(companionName)!;

                        // Check 1: Locations must match. If A says "at X with B" and B says "at Y with A", and X != Y, it's a lie.
                        if (companionStatement.location !== villagerStatement.location) {
                            isKillerCandidateValid = false;
                            break;
                        }

                        // Check 2: Companionship must be reciprocal.
                        // If A says "with B", then B must also say "with A" (and not "alone").
                        if (companionStatement.companions === 'alone' || !companionStatement.companions.has(personName)) {
                            isKillerCandidateValid = false;
                            break;
                        }
                    }
                }
            }

            // If any contradiction was found while checking this villager, break from the outer villager loop.
            if (!isKillerCandidateValid) {
                break;
            }
        }

        // If no contradictions were found for this killerCandidate, then they are the killer.
        if (isKillerCandidateValid) {
            foundKiller = killerCandidate;
            break; // Since the problem guarantees only one solution, we can stop here.
        }
    }

    // Output the final result
    if (foundKiller) {
        print(`${foundKiller} did it!`);
    } else {
        // If no suspect could be consistently identified as the killer, then it must be the detective.
        print(`It was me!`);
    }
}

// Call the solve function to run the puzzle logic
solve();