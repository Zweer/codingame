The problem asks us to calculate the value of a partial derivative of a given mathematical formula, evaluated at specific variable values. The formula uses addition (`+`), multiplication (`*`), and exponentiation (`^`) operators. Expressions are fully parenthesized, and variables can be multi-character alphanumeric identifiers (starting with a letter or underscore). Negative powers are allowed (e.g., `x^-1`). The derivative can be taken with respect to 1 to 3 variables, sequentially.

To solve this, we can follow these steps:

1.  **Parse the Formula into an Abstract Syntax Tree (AST):**
    *   An AST is a tree representation of the mathematical expression. Each node represents an operation, a variable, or a number.
    *   Since expressions are fully parenthesized (e.g., `(A op B)`), parsing can be done recursively.
    *   The `parse` function handles three cases:
        *   If the formula is a simple number (e.g., "5", "-1"), it creates a `NumberNode`.
        *   If the formula is a simple variable (e.g., "x", "my_var"), it creates a `VariableNode`.
        *   Otherwise, it must be a parenthesized binary operation `(LEFT_EXPR OP RIGHT_EXPR)`. It removes the outermost parentheses, finds the main operator (`+`, `*`, or `^`) at the outermost level (balance of parentheses is 0), and recursively parses the left and right sub-expressions.

2.  **Represent the AST:**
    *   We define `ASTNode` as a base interface.
    *   `NumberNode` stores an integer value.
    *   `VariableNode` stores the variable name.
    *   `AddNode`, `MultiplyNode`, and `PowerNode` inherit from `BinaryOpNode` and store references to their left and right child AST nodes.

3.  **Perform Symbolic Differentiation:**
    *   The `derive` function takes an `ASTNode` and a variable name (`varName`) and returns a new `ASTNode` representing its partial derivative with respect to `varName`.
    *   It applies the standard differentiation rules:
        *   **Constant:** `d/dx(C) = 0`. If a `NumberNode` or a `VariableNode` whose name does not match `varName`, its derivative is `NumberNode(0)`.
        *   **Variable:** `d/dx(x) = 1`. If a `VariableNode` whose name matches `varName`, its derivative is `NumberNode(1)`.
        *   **Sum Rule:** `d/dx(u + v) = d/dx(u) + d/dx(v)`. For `AddNode`, it recursively derives left and right children and creates a new `AddNode`.
        *   **Product Rule:** `d/dx(u * v) = d/dx(u) * v + u * d/dx(v)`. For `MultiplyNode`, it recursively derives `u` and `v`, then constructs the product rule expression using `AddNode` and `MultiplyNode` instances.
        *   **Power Rule (with Chain Rule):** `d/dx(f(x)^a) = a * f(x)^(a-1) * f'(x)`. For `PowerNode`:
            *   The problem statement guarantees that if the base contains `varName`, the exponent `a` will be a constant (`NumberNode`).
            *   If `a` is 0, the derivative is 0 (since `f(x)^0 = 1`).
            *   Otherwise, it recursively derives the base `f'(x)`. If `f'(x)` is 0 (meaning the base does not depend on `varName`), the whole derivative is 0.
            *   Otherwise, it constructs the expression `a * f(x)^(a-1) * f'(x)`.

4.  **Simplify the AST:**
    *   Differentiation can lead to very large and complex expressions (e.g., `0*x + 5*1`). To keep the AST manageable and evaluation efficient, a `simplify` function is used.
    *   This function recursively simplifies child nodes first.
    *   It then applies **constant folding** (e.g., `2+3` becomes `5`, `5*2` becomes `10`) and **algebraic identities** (e.g., `0+x` becomes `x`, `1*x` becomes `x`, `0*x` becomes `0`, `x^0` becomes `1`).
    *   The `derive` function calls `simplify` on its result after each differentiation step. This ensures that intermediate ASTs are optimized.

5.  **Evaluate the Final AST:**
    *   The `evaluate` function takes an `ASTNode` and a map of variable values (e.g., `x=2, y=6`).
    *   It recursively traverses the AST:
        *   `NumberNode`: returns its value.
        *   `VariableNode`: returns its value looked up in the provided map.
        *   `AddNode`, `MultiplyNode`, `PowerNode`: recursively evaluates children and applies the corresponding operation.

6.  **Main Program Flow:**
    *   Read the input `formula`, `derivative_vars`, and `eval_values`.
    *   Parse the initial `formula` into `currentAST`.
    *   Iterate through `derivative_vars` (e.g., `y`, then `x` for `dy dx`): in each iteration, update `currentAST` by calling `derive(currentAST, dVar)`.
    *   Finally, evaluate the `currentAST` with the `eval_values` map and print the result.

This modular approach ensures each part of the problem is handled logically and efficiently.