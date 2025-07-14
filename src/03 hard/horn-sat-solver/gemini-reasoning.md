The Horn-SAT problem involves determining the satisfiability of a Horn formula and, if satisfiable, finding its minimal model. A Horn formula is a conjunction of Horn clauses, where each Horn clause is a disjunction of literals with at most one positive literal.

The described algorithm relies on **unit propagation**:

1.  **Initialization**:
    *   All variables are initially considered unassigned. For the minimal model, any variable not forced to `true` will be `false`.
    *   For each clause, we track its "active literals" – those that are not yet falsified by an assignment and do not yet satisfy the clause.
    *   We also track if a clause has become satisfied.
    *   An adjacency list-like structure (`posClauses`, `negClauses`) helps efficiently find clauses containing a specific variable as a positive or negative literal.

2.  **Unit Propagation Loop**:
    *   A `propagationQueue` holds variables whose assignments have just changed and need to be propagated.
    *   **Finding Unit Clauses**: A clause becomes a unit clause if, after some assignments, only one of its literals remains "active" (unassigned and not falsified).
    *   **Propagating Assignments**:
        *   When a variable `X` is assigned a value (e.g., `true`):
            *   **Conflict Check**: If `X` was already assigned the opposite value, the formula is **UNSATISFIABLE**.
            *   **Update Assignment**: Set `X` to the new value and add `X` to the `propagationQueue`.
            *   **Process Clauses**:
                *   For any clause `C_j` containing `+X`: If `X` is set to `true`, `C_j` is **satisfied**. Mark it as satisfied.
                *   For any clause `C_j` containing `-X`: If `X` is set to `true`, then `-X` is **falsified**. Remove `-X` from `C_j`'s active literals.
                *   Similarly, if `X` is set to `false`:
                    *   For any clause `C_j` containing `-X`: If `X` is set to `false`, `C_j` is **satisfied**. Mark it.
                    *   For any clause `C_j` containing `+X`: If `X` is set to `false`, then `+X` is **falsified**. Remove `+X` from `C_j`'s active literals.
            *   **New Unit/Empty Clause Check**: After removing a falsified literal from `C_j`:
                *   If `C_j` (and not yet satisfied) now has **zero** active literals, it has become an empty clause, implying **UNSATISFIABLE**.
                *   If `C_j` (and not yet satisfied) now has **one** active literal, it has become a new unit clause. This single literal *must* be satisfied, so its variable is immediately propagated.

3.  **Termination**:
    *   If a conflict (variable assigned true and false, or an empty clause generated) occurs, the formula is **UNSATISFIABLE**.
    *   If the `propagationQueue` becomes empty and no conflicts occurred, the formula is **SATISFIABLE**. The current variable assignments (where forced variables are `true` and all others are implicitly `false`) form the minimal model.

**Data Structures Used:**

*   `V_count`, `C_count`: Number of variables and clauses.
*   `clauses: number[][]`: Stores the original literals for each clause.
*   `posClauses: Set<number>[]`: `posClauses[var_id]` stores indices of clauses where `var_id` appears as a positive literal.
*   `negClauses: Set<number>[]`: `negClauses[var_id]` stores indices of clauses where `var_id` appears as a negative literal.
*   `assignments: Map<number, boolean>`: Stores `var_id -> true/false` for assigned variables.
*   `propagationQueue: number[]`: A queue of variable IDs that need to be processed for propagation.
*   `activeLiterals: Set<number>[]`: `activeLiterals[clause_idx]` stores the set of literals in that clause that are still "active" (not falsified by assignments and the clause is not yet satisfied).
*   `isSatisfied: boolean[]`: `isSatisfied[clause_idx]` is `true` if the clause has been satisfied.

**Complexity**:
*   Parsing: `O(C * avg_clause_length)`.
*   Unit Propagation: Each variable is propagated at most once. For each variable, we iterate through clauses it appears in. Total work across all propagations is proportional to the total number of literal occurrences in the formula. This is `O(C * V_max_clause_length)`, where `V_max_clause_length` is at most `V`. So, `O(C * V)` in the worst case. `Set` operations are average `O(1)`. `Array.shift()` on a standard JS array is `O(N)`, but with `V=150`, it's not a bottleneck.

The provided constraints (`V < 150`, `C < 500`) are small enough for this approach to run efficiently.