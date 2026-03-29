### Reasoning

The core of this puzzle is to determine which of the `N` people are the `L` liars. Since the number of people `N` is small (up to 10), we can solve this problem by systematically checking every possible scenario. The overall strategy is a brute-force search over all possible sets of liars.

1.  **Identify the Search Space**: The problem asks us to find a specific group of `L` liars among `N` people. This is a classic combinatorics problem: "choose `L` items from a set of `N`". We can generate all possible combinations of `L` people who could be the liars. Since `N` is at most 10 and `L` is at most 9, the number of combinations is small (at most C(10, 5) = 252), making this approach computationally feasible.

2.  **Model the Logic of Lying**: The central game mechanic is how statements are affected by liars.
    *   A **truthteller** makes statements that are factually correct.
    *   A **liar** makes statements that are factually incorrect; they invert the truth.

    Let's analyze a sentence like `S > P1 > P2 > ... > Pk = V`. This translates to: "Speaker `S` says that `P1` says that ... `Pk` is `V`". `V` is either `T` (Truth) or `L` (Lying).

    To check if this sentence is consistent with a given set of liars, we can work backward from the innermost claim:
    a. **The Core Claim**: The statement is ultimately about person `Pk`. The claim is that `Pk`'s nature is `V`. The actual truth of this claim depends on whether `Pk` is in our assumed set of liars. Let's say `is_truthteller(p)` is `true` if person `p` is a truthteller. The truth value of the claim `Pk=V` is `is_truthteller(Pk) === (V === 'T')`.

    b. **Propagating Up the Chain**: Now, consider the person `P(k-1)` who reports on this claim. The information they pass up the chain depends on their own nature. If `P(k-1)` is a truthteller, they report the truth value as is. If they are a liar, they report the opposite. This can be modeled as: `new_truth_value = is_truthteller(P(k-1)) === old_truth_value`. We repeat this process for everyone in the chain (`P(k-2)`, `P(k-3)`, ..., `P1`), each time updating the "effective truth value" of the statement being passed along.

    c. **The Speaker's Verdict**: After propagating through the entire chain, we get a final truth value for the statement `P1 > ... > Pk = V`. The speaker `S` asserts this final truth value. For the world to be consistent, if `S` is a truthteller, this final value must be `true`. If `S` is a liar, it must be `false`. So, the consistency check is: `is_truthteller(S) === final_truth_value`.

3.  **Algorithm**:
    a. Parse the input: `N`, `L`, and all `N` sentences. Each sentence is parsed into its components: speaker, subject, the chain of intermediaries, and the final claim (`T` or `L`).
    b. Generate all combinations of `L` people from the set of `N` people (`0` to `N-1`).
    c. Iterate through each combination (a potential set of liars).
    d. For each potential set, assume it's the correct one. Create a `Set` for efficient lookups.
    e. Verify this assumption by checking if *all* `N` input sentences are consistent with this set of liars using the logic described above.
    f. If a sentence is found to be inconsistent, this set of liars is incorrect. We discard it and move to the next combination.
    g. If all sentences are consistent, we have found the solution. Since the problem guarantees a unique solution, we can stop, sort the liars' IDs in ascending order, and print them.

This method guarantees finding the correct set of liars by exhaustively checking all possibilities against the given rules.

### Code
