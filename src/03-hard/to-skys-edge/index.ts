// Standard CodinGame input/output for TypeScript
declare function readline(): string;
declare function print(message: any): void;

function solve() {
    const Y_years: number = parseInt(readline()); // Number of years of travel
    const C_capacity: number = parseInt(readline()); // Maximum capacity of the ship
    const N_initialGroups: number = parseInt(readline()); // Number of different ages in the starting group

    // Store initial population distribution. A Map is used to handle sparse initial ages efficiently.
    const initialAges = new Map<number, number>();
    for (let i = 0; i < N_initialGroups; i++) {
        const inputs = readline().split(' ');
        const age: number = parseInt(inputs[0]);
        const count: number = parseInt(inputs[1]);
        initialAges.set(age, count);
    }

    /**
     * Simulates the expedition for a given life expectancy.
     * @param lifeExpectancy The universal life expectancy for all crew members.
     * @returns True if the expedition is successful (meets population goal and avoids overcrowding), false otherwise.
     */
    function simulate(lifeExpectancy: number): boolean {
        // The population is tracked as an array where the index represents age.
        // `population[age]` stores the number of people at that specific `age`.
        // The array size is `lifeExpectancy + 1` to accommodate ages from 0 up to `lifeExpectancy`.
        const population = new Array<number>(lifeExpectancy + 1).fill(0);
        let currentTotalPopulation = 0;

        // Initialize the population based on the starting group.
        // Individuals initially older than the specified `lifeExpectancy` are considered to have died immediately.
        for (const [age, count] of initialAges.entries()) {
            if (age <= lifeExpectancy) { // Only include individuals within the current life expectancy
                population[age] = count;
                currentTotalPopulation += count;
            }
        }

        // Check for immediate failure: if the initial population already exceeds ship capacity.
        if (currentTotalPopulation > C_capacity) {
            return false; // Civil war due to initial overcrowding
        }

        const fertilityMinAge = 20;
        // The maximum age for a person to be fertile is half the life expectancy, rounded down.
        const fertilityMaxAge = Math.floor(lifeExpectancy / 2);

        // Simulate the journey year by year
        for (let year = 0; year < Y_years; year++) {
            // `nextPopulation` will temporarily hold the population state for the upcoming year.
            const nextPopulation = new Array<number>(lifeExpectancy + 1).fill(0);
            let nextTotalPopulation = 0;

            // Step 1: Every crew member gets older by one year.
            // Step 2: Every crew member exceeding the life expectancy will die.
            // These two steps are combined: ages from `0` to `lifeExpectancy - 1` shift to `1` to `lifeExpectancy`.
            // Individuals at `lifeExpectancy` (the maximum allowed age) are not carried over, effectively dying.
            for (let age = 0; age < lifeExpectancy; age++) {
                nextPopulation[age + 1] = population[age];
            }

            // Step 3: Births
            let fertileCount = 0;
            // Iterate through ages that fall within the fertility range [20, floor(lifeExpectancy / 2)].
            // If `fertilityMaxAge < fertilityMinAge` (e.g., `lifeExpectancy < 40`), this loop correctly won't run,
            // resulting in `fertileCount = 0` and no new births.
            for (let age = fertilityMinAge; age <= fertilityMaxAge; age++) {
                // `age` will always be a valid index for `population` here (0 to lifeExpectancy).
                fertileCount += population[age];
            }
            const babies = Math.floor(fertileCount / 10);
            nextPopulation[0] = babies; // Babies are born as 0-year-olds.

            // Calculate the total population for the `nextPopulation` state.
            for (let age = 0; age <= lifeExpectancy; age++) {
                nextTotalPopulation += nextPopulation[age];
            }

            // Check for civil war (overcrowding) after all demographic changes for the current year are applied.
            if (nextTotalPopulation > C_capacity) {
                return false; // Ship destroyed due to overpopulation
            }

            // Update the main `population` array and `currentTotalPopulation` for the next year's simulation.
            // Copying elements is generally efficient for this array size.
            for (let age = 0; age <= lifeExpectancy; age++) {
                population[age] = nextPopulation[age];
            }
            currentTotalPopulation = nextTotalPopulation;

            // Optimization: If the population drops to zero at any point before the end of the journey,
            // it's impossible to recover and reach the 200 settlers goal.
            if (currentTotalPopulation === 0 && year < Y_years - 1) {
                return false;
            }
        }

        // After `Y_years` of travel, check if the final population meets the success criteria (at least 200 people).
        return currentTotalPopulation >= 200;
    }

    let minValidLE = -1; // To store the minimum valid life expectancy found
    let maxValidLE = -1; // To store the maximum valid life expectancy found

    // Iterate through a range of possible life expectancies.
    // The upper bound is chosen to balance covering potential solutions and performance.
    // Based on typical CodinGame constraints and problem types, values around 100-120 are common.
    // 120 gives a total operations estimate that might pass within typical time limits.
    const LIFE_EXPECTANCY_SEARCH_MAX = 120; 

    for (let le = 1; le <= LIFE_EXPECTANCY_SEARCH_MAX; le++) {
        if (simulate(le)) {
            if (minValidLE === -1) {
                minValidLE = le; // Found the first valid life expectancy
            }
            maxValidLE = le; // Always update max, as we're iterating incrementally
        }
    }

    // Output the minimum and maximum life expectancies found, space-separated.
    print(`${minValidLE} ${maxValidLE}`);
}

solve(); // Execute the main solver function