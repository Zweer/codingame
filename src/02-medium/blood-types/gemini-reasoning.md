The problem asks us to calculate possible blood types for an unknown individual (parent or child) given the other two. Blood types consist of an ABO group (A, B, AB, O) and an Rh factor (+ or -), both inherited independently.

### 1. Understanding Inheritance Rules

**ABO Group:**
*   Each person has two ABO genes.
*   Mapping from gene pairs to blood types:
    *   `AA` or `AO` => `A` blood type
    *   `BB` or `BO` => `B` blood type
    *   `OO` => `O` blood type
    *   `AB` => `AB` blood type
*   Each parent contributes one of their two genes to the child.

**Rh Factor:**
*   Each person has two Rh genes.
*   Mapping from gene pairs to Rh factor:
    *   `++` or `+-` => `Rh+`
    *   `--` => `Rh-`
*   Each parent contributes one of their two genes to the child.

The key observation is that ABO and Rh inheritance are completely independent. We can solve for each part separately and then combine the results.

### 2. Data Structures and Helper Functions

To represent genes and their relationships:
*   **Gene Pair Normalization**: Gene pairs like `AO` and `OA` are equivalent. We normalize them by sorting alphabetically (e.g., `OA` becomes `AO`) to ensure consistent lookup keys.
*   **Mappings**:
    *   `BloodType -> PossibleGenePairs`: For a given blood type (e.g., 'A'), what are its possible underlying gene pairs (`AA`, `AO`)?
    *   `GenePair -> BloodType`: For a given gene pair (e.g., `AO`), what blood type does it result in (`A`)?
*   **`parseBloodType(str)`**: Splits a full blood type string (e.g., "A+", "AB-") into its ABO and Rh components.
*   **`formatBloodType(abo, rh)`**: Combines ABO and Rh components into a full blood type string.
*   **`getPossibleGenePairsForBloodType(bloodType, isRh)`**: Returns the array of possible gene pairs for a given `bloodType`. If `bloodType` is `?`, it returns *all* possible gene pairs for that system (ABO or Rh).
*   **`getBloodTypeFromGenePair(genePair, isRh)`**: Returns the blood type corresponding to a given normalized gene pair.

### 3. Core Inheritance Logic

We need two main functions for gene-level calculations:

**a) `getChildGenePairs(parent1GenePossibilities, parent2GenePossibilities)`:**
*   **Purpose**: Given all possible gene pairs for two parents, calculate all possible gene pairs for their child.
*   **Logic**: Iterate through each possible gene pair of `parent1` and each possible gene pair of `parent2`. For each combination, consider the two genes from `parent1` and the two genes from `parent2`. The child can inherit any one gene from `parent1` and any one gene from `parent2`. This results in 4 potential gene combinations for the child from each pair of parent genotypes. Collect all unique normalized child gene pairs into a `Set`.

**b) `getParentGenePairs(knownParentGenePossibilities, childGenePossibilities, isRh)`:**
*   **Purpose**: Given all possible gene pairs for a known parent and the child, calculate all possible gene pairs for the unknown parent.
*   **Logic**: This is an inverse problem. We iterate through *all* possible gene pairs for the unknown parent (e.g., `AA`, `AO`, `BB`, `BO`, `OO`, `AB` for ABO). For each `candidateParentGenePair`:
    1.  Assume this `candidateParentGenePair` is the genotype of the unknown parent.
    2.  Use `getChildGenePairs` to calculate all possible child gene pairs that would result from the `knownParent` and this `candidateParent`.
    3.  Check if *any* of these `generatedChildGenePairs` is present in the `childGenePossibilities` (the actual child's possible genotypes).
    4.  If there's at least one match, then the `candidateParentGenePair` is a valid possibility for the unknown parent.
*   Collect all valid `candidateParentGenePair` into a `Set`.

### 4. Combining and Outputting Results

1.  **Parse Input**: Read the three blood type strings. Identify which one is `?`.
2.  **Separate ABO and Rh**: For each known blood type string, parse it into its ABO and Rh parts. For the unknown blood type, use `'?'` for both its ABO and Rh parts.
3.  **Calculate ABO Possibilities**:
    *   If the child is unknown: Call `getChildGenePairs` with the parent's ABO gene possibilities. Convert the resulting child gene pairs to ABO blood types.
    *   If a parent is unknown: Call `getParentGenePairs` with the known parent's ABO gene possibilities and the child's ABO gene possibilities. Convert the resulting unknown parent gene pairs to ABO blood types.
4.  **Calculate Rh Possibilities**: Repeat step 3 for Rh factors.
5.  **Combine Results**: Take the Cartesian product of the possible ABO types and possible Rh types. For example, if ABO can be `A, O` and Rh can be `+, -`, the combinations are `A+, A-, O+, O-`.
6.  **Format Output**:
    *   Collect all combined blood types into an array.
    *   Sort the array in ASCII order.
    *   If the array is empty, print "impossible".
    *   Otherwise, print the sorted blood types, space-separated.

This comprehensive approach handles all cases, including the "impossible" scenario, and ensures correct sorting as per the problem's requirements.