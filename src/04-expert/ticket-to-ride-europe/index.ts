// Standard input reading setup for CodinGame
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputLines: string[] = [];
rl.on('line', (line: string) => {
    inputLines.push(line);
});

rl.on('close', () => {
    solvePuzzle();
});

// Global variables to be used by various functions throughout the solution
type CardColor = 'Red' | 'Yellow' | 'Green' | 'Blue' | 'White' | 'Black' | 'Orange' | 'Pink' | 'Gray' | 'Engine';

interface Route {
    id: number; // Unique identifier for the route, useful for Set tracking
    length: number;
    requiredEngines: number; // For ferry routes
    color: CardColor;
    city1: string;
    city2: string;
    points: number; // Precalculated points based on length
}

interface Ticket {
    points: number;
    city1: string;
    city2: string;
}

let allRoutes: Route[];
let allTickets: Ticket[];
let cityNameToId: Map<string, number>; // Maps city names to unique integer IDs
let nextCityId: number; // Counter for assigning new city IDs
let maxScore: number; // Stores the maximum score found across all permutations

// Points awarded for routes of different lengths
const routeLengthToPoints: { [key: number]: number } = {
    1: 1,
    2: 2,
    3: 4,
    4: 7,
    6: 15,
};

// Mapping of card color names to their index in the card counts array
const cardColorMap: { [key: string]: number } = {
    'Red': 0, 'Yellow': 1, 'Green': 2, 'Blue': 3,
    'White': 4, 'Black': 5, 'Orange': 6, 'Pink': 7,
    'Engine': 8 // Engine is the last index
};

// Array of specific card color names (excluding Engine) for iterating over Gray routes
const specificCardColorNames: CardColor[] = [
    'Red', 'Yellow', 'Green', 'Blue', 'White', 'Black', 'Orange', 'Pink'
];

/**
 * Gets the unique integer ID for a given city name. If the city name is new, it assigns a new ID.
 * @param cityName The name of the city.
 * @returns The integer ID for the city.
 */
function getCityId(cityName: string): number {
    if (!cityNameToId.has(cityName)) {
        cityNameToId.set(cityName, nextCityId++);
    }
    return cityNameToId.get(cityName)!;
}

/**
 * Creates a shallow copy of the card counts array.
 * @param counts The original array of card counts.
 * @returns A new array with the same card counts.
 */
function copyCardCounts(counts: number[]): number[] {
    return [...counts];
}

/**
 * Determines if a route can be afforded with the current cards and returns the specific cards to spend.
 * This function accounts for colored routes, gray routes, and ferries (required engines).
 * @param route The route to check.
 * @param currentCardCounts An array representing the current number of cards of each type.
 * @returns An array of card counts to spend if the route is affordable, otherwise null.
 */
function getCardsToSpend(route: Route, currentCardCounts: number[]): number[] | null {
    const cardsNeeded = route.length;
    const enginesRequired = route.requiredEngines;

    // 1. Check if enough Engines are available for the 'requiredEngines' part of a ferry
    if (currentCardCounts[cardColorMap['Engine']] < enginesRequired) {
        return null; // Not enough engines even for the fixed requirement
    }

    // Initialize the array to store cards that would be spent for this route
    const cardsToSpend = new Array(9).fill(0);
    cardsToSpend[cardColorMap['Engine']] = enginesRequired; // Allocate required engines first

    // Calculate how many more cards are needed *after* allocating required engines
    const remainingCardsToCover = cardsNeeded - enginesRequired;

    // Calculate how many engines are left that can be used as flexible wilds
    const flexibleEnginesAvailable = currentCardCounts[cardColorMap['Engine']] - enginesRequired;

    /**
     * Helper to check if `remainingCardsToCover` can be fulfilled by `specificColorCardsAvailable`
     * and `flexibleEnginesAvailable`. If so, it populates the `cardsToSpend` array for this color.
     * @param colorIndex The index of the specific color to try.
     * @returns True if the cards can be covered, false otherwise.
     */
    const canCoverWithColor = (colorIndex: number): boolean => {
        const specificColorCardsAvailable = currentCardCounts[colorIndex];
        
        // Try to use as many specific color cards as possible first
        const specificCardsToUse = Math.min(remainingCardsToCover, specificColorCardsAvailable);
        
        // The remaining cards must be covered by flexible engines
        const flexibleEnginesToUse = remainingCardsToCover - specificCardsToUse;

        if (flexibleEnginesToUse <= flexibleEnginesAvailable) {
            // It's possible! Update the temporary cardsToSpend array for this specific color choice
            cardsToSpend[colorIndex] += specificCardsToUse;
            cardsToSpend[cardColorMap['Engine']] += flexibleEnginesToUse;
            return true;
        }
        return false;
    };

    if (route.color !== 'Gray') {
        // For a colored route, only try with its specific color
        const colorIndex = cardColorMap[route.color];
        if (canCoverWithColor(colorIndex)) {
            return cardsToSpend;
        }
    } else { // For a Gray route, try all 8 specific colors
        for (let i = 0; i < specificCardColorNames.length; i++) {
            // Reset cardsToSpend for the specific color part for each trial
            cardsToSpend.fill(0); // Clear previous attempts' specific color and flexible engine usage
            cardsToSpend[cardColorMap['Engine']] = enginesRequired; // Re-allocate required engines

            if (canCoverWithColor(cardColorMap[specificCardColorNames[i]])) {
                return cardsToSpend; // Found a valid way, return it immediately (any valid way is fine)
            }
        }
    }

    return null; // Cannot afford this route with any valid combination
}

/**
 * Calculates the total score contribution from completed/uncompleted tickets based on built routes.
 * @param builtRoutesSet A set of IDs of routes that have been successfully built.
 * @returns The score contribution from tickets.
 */
function calculateFinalScore(builtRoutesSet: Set<number>): number {
    let ticketScore = 0;
    const numCities = nextCityId; // Total unique cities identified
    // Adjacency matrix to represent city connections
    const adjMatrix: boolean[][] = Array(numCities).fill(null).map(() => Array(numCities).fill(false));

    // Populate the adjacency matrix with the built routes
    for (const routeId of builtRoutesSet) {
        const route = allRoutes[routeId];
        const city1Id = getCityId(route.city1);
        const city2Id = getCityId(route.city2);
        adjMatrix[city1Id][city2Id] = true;
        adjMatrix[city2Id][city1Id] = true; // Routes are bidirectional
    }

    // Check each ticket's completion status using BFS for connectivity
    for (const ticket of allTickets) {
        const startCityId = getCityId(ticket.city1);
        const endCityId = getCityId(ticket.city2);

        if (startCityId === endCityId) {
             // Cities are trivially connected if they are the same
             ticketScore += ticket.points;
             continue;
        }

        const visited = new Array(numCities).fill(false);
        const queue: number[] = [startCityId];
        visited[startCityId] = true;
        let connected = false;

        while (queue.length > 0) {
            const currentCity = queue.shift()!;
            if (currentCity === endCityId) {
                connected = true; // Path found
                break;
            }
            // Explore neighbors
            for (let neighbor = 0; neighbor < numCities; neighbor++) {
                if (adjMatrix[currentCity][neighbor] && !visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.push(neighbor);
                }
            }
        }

        if (connected) {
            ticketScore += ticket.points;
        } else {
            ticketScore -= ticket.points;
        }
    }
    return ticketScore;
}

/**
 * Main backtracking function to explore all possible combinations of routes to maximize score.
 * @param routeIndex The index of the current route being considered.
 * @param currentTrainCars Remaining train cars.
 * @param currentCardCounts Array of remaining card counts.
 * @param builtRoutesSet Set of IDs of routes built so far.
 * @param currentRouteScore Total points accumulated from routes built so far.
 */
function solve(routeIndex: number, currentTrainCars: number, currentCardCounts: number[], builtRoutesSet: Set<number>, currentRouteScore: number) {
    // Base case: All routes have been considered
    if (routeIndex === allRoutes.length) {
        // Calculate the total score including tickets and update maxScore
        const finalScore = currentRouteScore + calculateFinalScore(builtRoutesSet);
        maxScore = Math.max(maxScore, finalScore);
        return;
    }

    const route = allRoutes[routeIndex];

    // Option 1: Don't build this route
    // Recursively call for the next route without changing resources or built routes
    solve(routeIndex + 1, currentTrainCars, currentCardCounts, builtRoutesSet, currentRouteScore);

    // Option 2: Try to build this route
    // First, check if enough train cars are available
    if (currentTrainCars >= route.length) {
        // Then, check if cards are sufficient and get the cards to spend
        const cardsToSpend = getCardsToSpend(route, currentCardCounts);
        if (cardsToSpend) {
            // If affordable, proceed with building the route:
            // Create new copies of resources to avoid modifying parent states
            const newCardCounts = copyCardCounts(currentCardCounts);
            for (let i = 0; i < newCardCounts.length; i++) {
                newCardCounts[i] -= cardsToSpend[i];
            }
            const newBuiltRoutesSet = new Set(builtRoutesSet).add(route.id); // Add current route to the new set

            // Recursively call for the next route with updated resources and score
            solve(routeIndex + 1, currentTrainCars - route.length, newCardCounts, newBuiltRoutesSet, currentRouteScore + route.points);
        }
    }
}

/**
 * Main function to parse input, set up initial state, and start the solving process.
 */
function solvePuzzle() {
    let lineIndex = 0;

    // Parse initial game state
    const [initialTrainCars, numTickets, numRoutes] = inputLines[lineIndex++].split(' ').map(Number);
    const initialCardCounts: number[] = inputLines[lineIndex++].split(' ').map(Number);

    // Parse ticket information
    allTickets = [];
    for (let i = 0; i < numTickets; i++) {
        const [pointsStr, city1, city2] = inputLines[lineIndex++].split(' ');
        allTickets.push({ points: Number(pointsStr), city1, city2 });
    }

    // Parse route information
    allRoutes = [];
    for (let i = 0; i < numRoutes; i++) {
        const [lengthStr, requiredEnginesStr, colorStr, city1, city2] = inputLines[lineIndex++].split(' ');
        const length = Number(lengthStr);
        const requiredEngines = Number(requiredEnginesStr);
        const color = colorStr as CardColor;
        allRoutes.push({
            id: i, // Assign a unique ID for each route
            length,
            requiredEngines,
            color,
            city1,
            city2,
            points: routeLengthToPoints[length], // Precalculate points
        });
    }

    // Initialize city mapping and max score for the entire search
    cityNameToId = new Map<string, number>();
    nextCityId = 0;
    maxScore = -Infinity; // Start with negative infinity to ensure any valid score is captured

    // Pre-populate city IDs for all cities appearing in routes and tickets.
    // This ensures that `nextCityId` (representing the total number of unique cities) is accurate
    // before any graph operations (like `calculateFinalScore`) occur.
    for (const route of allRoutes) {
        getCityId(route.city1);
        getCityId(route.city2);
    }
    for (const ticket of allTickets) {
        getCityId(ticket.city1);
        getCityId(ticket.city2);
    }

    // Start the backtracking search from the first route (index 0)
    // with initial resources and an empty set of built routes.
    solve(0, initialTrainCars, initialCardCounts, new Set<number>(), 0);

    // Output the maximum score found
    console.log(maxScore);
}