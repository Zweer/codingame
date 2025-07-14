To solve the "To Sky's Edge" puzzle, we need to find a range of life expectancies that allow a starship expedition to succeed. Success is defined by two conditions:
1.  The population on the ship must be at least 200 after `Y` years of travel.
2.  The population must never exceed the ship's maximum capacity `C` at any point during the journey.

The simulation of the population changes yearly, following these rules in order:
1.  **Aging:** All crew members get one year older.
2.  **Death:** Any crew member whose age exceeds the set `lifeExpectancy` dies.
3.  **Birth:** For every 10 fertile crew members, one new 0-year-old baby is born. Fertile members are those whose age is between 20 (inclusive) and `floor(lifeExpectancy / 2)` (inclusive).

**Strategy:**

1.  **Search Space for Life Expectancy:** Since the relationship between `lifeExpectancy` and population dynamics is not strictly monotonic (e.g., too low `LE` leads to extinction, a moderate `LE` leads to success, and too high `LE` might lead to overcrowding), a simple binary search isn't applicable. Instead, we perform a linear scan for `lifeExpectancy` values.
    *   The minimum `lifeExpectancy` for births to occur is 40 (because `floor(40/2) = 20`, making the fertility range `[20, 20]`). If `LE < 40`, `floor(LE/2)` will be less than 20, resulting in no fertile individuals and eventual extinction. So, we can start our search from `LE = 1` for robustness, or `LE = 40` for slight optimization.
    *   The maximum `lifeExpectancy` to search for is crucial for performance. Given `Y` can be up to 30000, a large `lifeExpectancy` (e.g., 200-300) would make the simulation too slow. Through complexity analysis (see below), a maximum `lifeExpectancy` of around 100-120 seems feasible within typical time limits.

2.  **Simulation Function (`simulate`):** We'll create a function that takes `lifeExpectancy` as an argument and simulates the `Y` years of travel.
    *   **Population Representation:** An array `population[age]` is suitable, where `population[age]` stores the count of people at that specific age. The array size will be `lifeExpectancy + 1` (for ages 0 to `lifeExpectancy`).
    *   **Initialization:** The `population` array is initialized with the given starting `AGE` and `NUMBER` pairs. Any initial individuals older than the `lifeExpectancy` are immediately excluded (dead).
    *   **Yearly Simulation Loop:**
        *   **Capacity Check:** Before applying any changes for the year, check if the current `totalPopulation` exceeds `C`. If so, return `false`.
        *   **Aging and Death:** A new temporary `nextPopulation` array is created. People from `population[age]` move to `nextPopulation[age + 1]`. People at `population[lifeExpectancy]` implicitly die as they are not carried over.
        *   **Births:** Calculate the number of fertile people in the *current* population (ages 20 to `floor(lifeExpectancy / 2)`). For every 10 fertile people, one baby is added to `nextPopulation[0]`.
        *   **Update:** The `nextPopulation` array becomes the `population` for the next year. `totalPopulation` is recalculated.
        *   **Early Exit:** If `totalPopulation` drops to 0 at any point (before `Y` years are complete), it's impossible to reach 200, so we can return `false` early.
    *   **Final Check:** After `Y` years, if `totalPopulation >= 200` and no civil war occurred, return `true`.

**Complexity Analysis:**

*   The `simulate` function performs a loop for `Y` years. Inside the loop, operations like aging, births, and population summing iterate up to `lifeExpectancy` times. So, `simulate` is approximately `O(Y * lifeExpectancy)`.
*   The main loop iterates `LIFE_EXPECTANCY_SEARCH_MAX` times.
*   Total complexity: `O(LIFE_EXPECTANCY_SEARCH_MAX * Y * LIFE_EXPECTANCY_SEARCH_MAX)` = `O(Y * (LIFE_EXPECTANCY_SEARCH_MAX)^2)`.
*   With `Y_max = 30000` and `LIFE_EXPECTANCY_SEARCH_MAX = 120`:
    `30000 * 120^2 = 30000 * 14400 = 432,000,000` operations. This is a large number but often acceptable in CodinGame for languages like TypeScript within a few seconds (e.g., 1-2 seconds).

The problem guarantees that at least one valid life expectancy exists, so we don't need to worry about `minValidLE` remaining `-1`.