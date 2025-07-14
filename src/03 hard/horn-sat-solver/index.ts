declare function readline(): string;
declare function print(message: string): void;

class HornSatSolver {
    private V_count: number;
    private C_count: number;
    private clauses: number[][]; // Stores original literals for each clause
    private posClauses: Set<number>[]; // posClauses[var_id] = Set of clause indices where var_id appears positively
    private negClauses: Set<number>[]; // negClauses[var_id] = Set of clause indices where var_id appears negatively

    private assignments: Map<number, boolean>; // var_id -> true/false. Stores current variable assignments.
    private propagationQueue: number[]; // Queue of var_ids whose assignment just changed

    private activeLiterals: Set<number>[]; // activeLiterals[clause_idx] = Set of literals not yet falsified and not satisfying
    private isSatisfied: boolean[]; // isSatisfied[clause_idx] = true if clause is satisfied

    constructor() {
        // Read header: p cnf V C
        const header = readline().split(' ');
        this.V_count = parseInt(header[2]);
        this.C_count = parseInt(header[3]);

        this.clauses = [];
        // Initialize adjacency lists for clauses containing positive/negative literals
        this.posClauses = Array(this.V_count + 1).fill(null).map(() => new Set());
        this.negClauses = Array(this.V_count + 1).fill(null).map(() => new Set());

        this.assignments = new Map();
        this.propagationQueue = [];

        // Initialize structures for tracking clause state
        this.activeLiterals = Array(this.C_count).fill(null).map(() => new Set());
        this.isSatisfied = Array(this.C_count).fill(false);

        // Read clauses and populate data structures
        for (let i = 0; i < this.C_count; i++) {
            const line = readline().split(' ').map(Number);
            const currentClauseLiterals: number[] = line.slice(0, line.length - 1); // Remove the trailing 0

            this.clauses.push(currentClauseLiterals); // Store the original clause literals
            
            for (const literal of currentClauseLiterals) {
                const var_id = Math.abs(literal);
                this.activeLiterals[i].add(literal); // Initially, all literals are active

                if (literal > 0) {
                    this.posClauses[var_id].add(i);
                } else {
                    this.negClauses[var_id].add(i);
                }
            }
        }
    }

    /**
     * Attempts to assign a variable based on a unit literal.
     * @param literal The unit literal (e.g., 3 for var 3 true, -3 for var 3 false).
     * @returns true if assignment is successful or already consistent, false if conflict occurs.
     */
    private propagateLiteral(literal: number): boolean {
        const var_id = Math.abs(literal);
        const targetValue = literal > 0; // true if positive literal, false if negative

        if (this.assignments.has(var_id)) {
            // Variable already assigned
            if (this.assignments.get(var_id) !== targetValue) {
                // Conflict: variable already assigned the opposite value
                return false; 
            }
            // Variable already assigned correctly, no new propagation needed
            return true;
        }

        // Assign the variable and add it to the propagation queue
        this.assignments.set(var_id, targetValue);
        this.propagationQueue.push(var_id);
        return true;
    }

    public solve(): void {
        // Step 1: Handle initially empty clauses (always unsatisfiable)
        for (let i = 0; i < this.C_count; i++) {
            if (this.activeLiterals[i].size === 0 && !this.isSatisfied[i]) {
                print('s UNSATISFIABLE');
                return;
            }
        }

        // Step 2: Identify initial unit clauses and propagate them
        for (let i = 0; i < this.C_count; i++) {
            // A clause is a unit clause if it's not yet satisfied and has only one active literal
            if (this.activeLiterals[i].size === 1 && !this.isSatisfied[i]) {
                const unitLiteral = this.activeLiterals[i].values().next().value;
                if (!this.propagateLiteral(unitLiteral)) {
                    print('s UNSATISFIABLE');
                    return;
                }
            }
        }

        // Step 3: Main propagation loop
        while (this.propagationQueue.length > 0) {
            const currentVarId = this.propagationQueue.shift()!; // Dequeue the variable whose assignment changed
            const currentValue = this.assignments.get(currentVarId)!;

            const literalPositiveForm = currentVarId; // Represents +currentVarId
            const literalNegativeForm = -currentVarId; // Represents -currentVarId

            // Process clauses containing the positive form of the current variable (+currentVarId)
            for (const clauseIdx of this.posClauses[currentVarId]) {
                if (this.isSatisfied[clauseIdx]) continue; // Skip if clause is already satisfied

                if (currentValue === true) {
                    // If currentVarId is true, then +currentVarId satisfies this clause
                    this.isSatisfied[clauseIdx] = true;
                } else { // currentValue === false
                    // If currentVarId is false, then +currentVarId is falsified
                    this.activeLiterals[clauseIdx].delete(literalPositiveForm);
                    
                    if (this.activeLiterals[clauseIdx].size === 0) {
                        // All literals in this clause are falsified and it's not satisfied -> UNSAT
                        print('s UNSATISFIABLE');
                        return;
                    }
                    if (this.activeLiterals[clauseIdx].size === 1) {
                        // This clause has become a new unit clause
                        const unitLiteral = this.activeLiterals[clauseIdx].values().next().value;
                        if (!this.propagateLiteral(unitLiteral)) {
                            print('s UNSATISFIABLE');
                            return;
                        }
                    }
                }
            }

            // Process clauses containing the negative form of the current variable (-currentVarId)
            for (const clauseIdx of this.negClauses[currentVarId]) {
                if (this.isSatisfied[clauseIdx]) continue; // Skip if clause is already satisfied

                if (currentValue === false) {
                    // If currentVarId is false, then -currentVarId satisfies this clause
                    this.isSatisfied[clauseIdx] = true;
                } else { // currentValue === true
                    // If currentVarId is true, then -currentVarId is falsified
                    this.activeLiterals[clauseIdx].delete(literalNegativeForm);
                    
                    if (this.activeLiterals[clauseIdx].size === 0) {
                        // All literals in this clause are falsified and it's not satisfied -> UNSAT
                        print('s UNSATISFIABLE');
                        return;
                    }
                    if (this.activeLiterals[clauseIdx].size === 1) {
                        // This clause has become a new unit clause
                        const unitLiteral = this.activeLiterals[clauseIdx].values().next().value;
                        if (!this.propagateLiteral(unitLiteral)) {
                            print('s UNSATISFIABLE');
                            return;
                        }
                    }
                }
            }
        }

        // Step 4: If loop finishes, formula is satisfiable. Construct the minimal model.
        print('s SATISFIABLE');
        let model = 'v';
        for (let i = 1; i <= this.V_count; i++) {
            // For the minimal model, variables not forced to true are false.
            if (this.assignments.has(i) && this.assignments.get(i) === true) {
                model += ` ${i}`;
            } else {
                model += ` -${i}`; 
            }
        }
        model += ' 0';
        print(model);
    }
}

const solver = new HornSatSolver();
solver.solve();