// For CodinGame, `readline()` is globally available.
// In a local setup, you might need to mock it or read from stdin.
// declare function readline(): string;
// declare function print(message: any): void; // CodinGame uses console.log directly now.

// Read input: The target scientist whose Erdős number is requested.
const targetScientist: string = readline();

// Read input: The number of publications.
const N: number = parseInt(readline());

// Read input: N lines of publication titles.
const titles: string[] = [];
for (let i = 0; i < N; i++) {
    titles.push(readline());
}

// Read input: N lines of authors for the corresponding publications, separated by spaces.
const authorStrings: string[] = [];
for (let i = 0; i < N; i++) {
    authorStrings.push(readline());
}

// --- Graph Construction ---
// `collaborations`: An adjacency list representing the graph.
// Maps a scientist's name to a Set of their direct collaborators.
const collaborations: Map<string, Set<string>> = new Map();

// `connectingPapers`: Stores the specific paper title for a direct collaboration.
// This map allows us to quickly find the paper that connects two given scientists.
// Maps Scientist1 -> (Scientist2 -> PaperTitle)
const connectingPapers: Map<string, Map<string, string>> = new Map();

// Iterate through each publication to build the graph and store connecting paper details.
for (let i = 0; i < N; i++) {
    const title = titles[i];
    const authors = authorStrings[i].split(' ');

    for (let j = 0; j < authors.length; j++) {
        const author1 = authors[j];
        // Ensure that Map entries for author1 exist in collaborations and connectingPapers.
        if (!collaborations.has(author1)) {
            collaborations.set(author1, new Set());
            connectingPapers.set(author1, new Map());
        }

        for (let k = j + 1; k < authors.length; k++) { // Iterate through unique pairs (author1, author2)
            const author2 = authors[k];
            // Ensure that Map entries for author2 exist.
            if (!collaborations.has(author2)) {
                collaborations.set(author2, new Set());
                connectingPapers.set(author2, new Map());
            }

            // Add mutual collaborations. This creates an undirected edge between author1 and author2.
            collaborations.get(author1)!.add(author2);
            collaborations.get(author2)!.add(author1);

            // Store the paper title that connects them.
            // If multiple papers connect them, any one is sufficient for the shortest path reconstruction.
            connectingPapers.get(author1)!.set(author2, title);
            connectingPapers.get(author2)!.set(author1, title);
        }
    }
}

// --- BFS Initialization ---
const erdosName = "Erdős"; // The exact name of Paul Erdős.
const distances: Map<string, number> = new Map(); // Stores the calculated Erdős number for each scientist.
// `pathInfo`: Stores information to reconstruct the shortest path.
// For each `currentScientist` (key), it stores the `prevScientist` in the path and the `paperTitle` that connected them.
const pathInfo: Map<string, { prevScientist: string, paperTitle: string }> = new Map();
const queue: string[] = []; // The BFS queue, storing scientists to visit.
const visited: Set<string> = new Set(); // To keep track of scientists already visited during BFS.

// Handle the special case where the target scientist is Erdős himself.
if (targetScientist === erdosName) {
    console.log(0); // Erdős's number is 0.
} else {
    // Start the BFS from Paul Erdős. His Erdős number is 0.
    if (collaborations.has(erdosName)) { // Check if Erdős is present in the graph (guaranteed by problem constraints).
        distances.set(erdosName, 0);
        queue.push(erdosName);
        visited.add(erdosName);
    }
    // If Erdős were not in the graph (unlikely given constraints), no one could have a finite Erdős number.

    let foundTarget = false; // Flag to indicate if the target scientist was found.

    // Main BFS loop. Continues as long as there are scientists in the queue to process.
    while (queue.length > 0) {
        const currentScientist = queue.shift()!; // Dequeue the current scientist.
        const currentDistance = distances.get(currentScientist)!; // Get their current Erdős number.

        // If the current scientist is the target scientist, we have found the shortest path.
        if (currentScientist === targetScientist) {
            foundTarget = true;
            break; // Exit the BFS loop early as the shortest path is found.
        }

        const currentCollaborators = collaborations.get(currentScientist);
        if (currentCollaborators) { // Ensure the current scientist has collaborators.
            // Explore all direct collaborators of the current scientist.
            for (const collaborator of currentCollaborators) {
                if (!visited.has(collaborator)) { // If the collaborator has not been visited yet.
                    visited.add(collaborator); // Mark them as visited.
                    distances.set(collaborator, currentDistance + 1); // Set their Erdős number.

                    // Store path information for reconstruction.
                    // This records how `collaborator` was reached (from `currentScientist` via `paperTitle`).
                    const paperTitle = connectingPapers.get(currentScientist)!.get(collaborator)!;
                    pathInfo.set(collaborator, { prevScientist: currentScientist, paperTitle: paperTitle });

                    queue.push(collaborator); // Enqueue the collaborator for further exploration.
                }
            }
        }
    }

    // --- Output Results ---
    // If the target scientist was not found (i.e., no finite Erdős number).
    if (!foundTarget || !distances.has(targetScientist)) {
        console.log("infinite");
    } else {
        const erdosNumber = distances.get(targetScientist)!;
        console.log(erdosNumber); // Output the Erdős number.

        // Reconstruct and output the path of paper titles.
        const pathTitles: string[] = [];
        let current = targetScientist;
        // Trace back from the target scientist to Erdős using the `pathInfo` map.
        while (current !== erdosName) {
            const info = pathInfo.get(current);
            if (!info) {
                // This case should not be reached if `foundTarget` is true, indicating a logical error.
                break;
            }
            // Add the paper title that connected `current` to `info.prevScientist`.
            pathTitles.push(info.paperTitle);
            // Move to the previous scientist in the path.
            current = info.prevScientist;
        }

        // The `pathTitles` array is built in the correct order for printing
        // (from the target scientist's first connecting paper to the last paper connected to Erdős).
        // Example: Einstein <- Straus (Paper B), Straus <- Erdős (Paper A)
        // pathTitles will be [Paper B, Paper A].

        for (const title of pathTitles) {
            console.log(title); // Output each paper title in the path.
        }
    }
}