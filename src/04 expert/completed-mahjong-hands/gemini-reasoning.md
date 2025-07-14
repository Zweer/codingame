The problem asks us to determine if a given 14-tile Mahjong hand (13 tiles in hand + 1 newly drawn tile) constitutes a winning configuration. There are three types of winning hands to check:

1.  **Standard Hand (4 sets and 1 pair)**: This is the most common winning hand. A "set" can be either a "triplet" (three identical tiles, e.g., `111m`, `555z`) or a "run" (three consecutive number tiles of the same suit, e.g., `123s`, `789p`; runs are only valid for 'm', 'p', 's' suits, not 'z' (honor) tiles). A "pair" is two identical tiles. Tiles cannot be reused.
2.  **Seven Pairs**: The hand consists of 7 distinct pairs. This means all 14 tiles must form pairs, and each of the 7 pairs must be of a different tile type (e.g., `11m 22m 33p 44s 55z 66z 77z` is valid, but `11m 11m 22m ...` is not as it has two `11m` pairs).
3.  **Kokushi Musou (Thirteen Orphans)**: This is a special hand consisting of one of each of the "terminal" (1s and 9s of number suits) and "honor" tiles (1z-7z), with one of these 13 distinct tiles duplicated to form a pair. The 13 required tiles are: `1m, 9m, 1p, 9p, 1s, 9s, 1z, 2z, 3z, 4z, 5z, 6z, 7z`.

The input format groups tile ranks by suit (e.g., `222888m444p2277z`). The honor suit 'z' uses digits '1' through '7' for its seven distinct types, but these are not numeric for the purpose of forming runs.

**Solution Approach:**

The overall strategy is to parse the input into a frequency map of tiles and then check for each winning condition in a specific order (it doesn't strictly matter which order, as only one needs to be true).

1.  **Tile Representation and Parsing**:
    *   We use a `Map<string, number>` to store tile counts (e.g., `"1m" -> 3`).
    *   A helper function `getTileCounts` processes the input string (which includes the 13 initial tiles and the 1 drawn tile) to populate this map. It iterates through the string, accumulating numbers until a suit letter ('m', 'p', 's', 'z') is encountered, then records the tiles. Finally, the drawn tile is added.

2.  **`isKokushiMusou` Check**:
    *   This is the most straightforward to check because it involves a fixed set of 13 tile types.
    *   We iterate through the hand's tile counts. For each tile, we check if it's one of the 13 required orphan tiles. If any non-orphan tile is found, it's not Kokushi Musou.
    *   We count how many of the 13 distinct orphan types are present and track if exactly one pair exists among them.
    *   The hand must total 14 tiles, and exactly 13 distinct orphan types must be present, with one of them appearing as a pair (count of 2), and all other counts being 1.

3.  **`isSevenPairs` Check**:
    *   Also relatively simple: the hand must contain exactly 14 tiles.
    *   We iterate through the tile counts. If any tile type has a count other than 2, it's not a Seven Pairs hand.
    *   If all tile types have a count of 2, we then just need to ensure there are 7 distinct tile types (i.e., 7 pairs).

4.  **`isStandardHand` Check (4 sets and 1 pair)**:
    *   This is the most complex part, typically solved using a recursive backtracking approach.
    *   The main `isStandardHand` function iterates through all possible tile types that could form the single "pair" of the hand. For each candidate pair:
        *   It creates a copy of the hand, removes the two tiles forming the pair, leaving 12 tiles.
        *   It then calls a recursive helper function `canFormSets` to check if the remaining 12 tiles can be grouped into 4 sets.
    *   The `canFormSets(hand, setsNeeded)` helper works as follows:
        *   **Base Cases**:
            *   If `setsNeeded` is 0, it means all required sets have been formed, so return `true`.
            *   If the total number of tiles remaining in `hand` is less than `setsNeeded * 3`, it's impossible to form the required sets, so return `false`.
        *   **Recursive Step**:
            *   It finds the "first" (smallest lexicographically according to a predefined `TILE_ORDER`) tile with a count greater than zero. This ensures a deterministic and efficient search.
            *   **Try Triplet**: If `firstTile` has a count of 3 or more, try forming a triplet. Create a copy of the hand, decrement `firstTile`'s count by 3, and recursively call `canFormSets` with `setsNeeded - 1`. If this returns `true`, propagate `true`.
            *   **Try Run**: If `firstTile` is a number tile (not 'z') and its rank allows forming a run (i.e., rank 1-7), check if `firstTile`, `firstTile+1`, and `firstTile+2` are all present (count >= 1). If so, try forming a run. Create a copy of the hand, decrement all three tiles' counts by 1, and recursively call `canFormSets` with `setsNeeded - 1`. If this returns `true`, propagate `true`.
            *   If neither a triplet nor a run can be formed (or if their recursive calls fail), then this path doesn't lead to a valid hand, so return `false`.

**Important Considerations and Data Structures:**

*   **`TILE_ORDER`**: A global constant array `TILE_ORDER` is defined to list all possible tile types in a fixed, ascending order (e.g., `1m, 2m, ..., 9m, 1p, ..., 9p, 1s, ..., 9s, 1z, ..., 7z`). This is crucial for the `canFormSets` function to consistently pick the "first" available tile, which helps in preventing redundant checks and ensures the backtracking logic is sound.
*   **Copying Maps**: When making recursive calls, it's essential to pass a *copy* of the `hand` map (`copyCounts` helper) to avoid modifying the map for other branches of the recursion.

**Order of Checks**: The order of checking (`isKokushiMusou`, then `isSevenPairs`, then `isStandardHand`) does not affect correctness, as a hand can only be one type of winning hand in this context. If any check returns `true`, we print "TRUE" and exit. If all checks fail, print "FALSE".