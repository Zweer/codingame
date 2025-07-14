/**
 * Reads a line from standard input.
 * This function is typically provided by the CodinGame environment.
 * @returns {string} The line read.
 */
declare function readline(): string;

/**
 * Interface to store information for each tribute.
 */
interface TributeInfo {
    name: string;
    killed: Set<string>; // Names of tributes killed by this tribute
    killer: string | null; // Name of the tribute who killed this tribute, or "Winner" if they survived, or null initially
}

// Map to store all tributes' information, with their name as the key for quick lookup.
const tributes = new Map<string, TributeInfo>();

// --- Input Phase ---

// Read N, the number of tributes
const N: number = parseInt(readline());

// Read N tribute names and initialize their info in the map
for (let i = 0; i < N; i++) {
    const name: string = readline();
    tributes.set(name, {
        name: name,
        killed: new Set<string>(), // Initially, no one has been killed by this tribute
        killer: null,              // Initially, this tribute has not been killed
    });
}

// Read T, the number of turns (kill events)
const T: number = parseInt(readline());

// Process T turns of kill information
for (let i = 0; i < T; i++) {
    const line: string = readline();
    // Example line format: "TributeName killed VictimName1, VictimName2, ..."

    // Split the line into killer and victims parts
    const parts = line.split(' killed ');
    const killerName = parts[0];
    const victimNamesString = parts[1];
    
    // Split the victims string into individual victim names
    const victimNames = victimNamesString.split(', ');

    // Retrieve the killer's tribute info
    const killerTribute = tributes.get(killerName);

    if (killerTribute) { // Ensure the killer exists (should always be true based on problem constraints)
        victimNames.forEach(victimName => {
            // Add the victim to the killer's 'killed' set
            killerTribute.killed.add(victimName); 
            
            // Retrieve the victim's tribute info
            const victimTribute = tributes.get(victimName);
            if (victimTribute) { // Ensure the victim exists (should always be true)
                // Set the victim's killer to the current killer's name
                victimTribute.killer = killerName; 
            }
        });
    }
}

// --- Post-Processing Phase ---

// Determine the winner (the tribute who was never killed)
for (const [name, info] of tributes) {
    if (info.killer === null) {
        info.killer = "Winner"; // This tribute is the winner
        // As per constraints, there's only one tribute left alive, so we can stop after finding the first one.
        break; 
    }
}

// --- Output Phase ---

// Get all tribute names and sort them alphabetically for the final output order
const sortedTributeNames = Array.from(tributes.keys()).sort();

// Print information for each tribute in alphabetical order
for (let i = 0; i < sortedTributeNames.length; i++) {
    const name = sortedTributeNames[i];
    const info = tributes.get(name)!; // We know this tribute exists in the map

    console.log(`Name: ${info.name}`);

    // Sort the list of victims killed by this tribute alphabetically
    const sortedKilledVictims = Array.from(info.killed).sort();
    if (sortedKilledVictims.length === 0) {
        console.log(`Killed: None`); // If no one was killed
    } else {
        console.log(`Killed: ${sortedKilledVictims.join(', ')}`); // List killed victims
    }

    console.log(`Killer: ${info.killer}`); // Print who killed them (or "Winner")

    // Add a blank line separator between tribute blocks, but not after the last tribute
    if (i < sortedTributeNames.length - 1) {
        console.log('');
    }
}