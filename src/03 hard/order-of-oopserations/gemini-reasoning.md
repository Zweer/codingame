The problem asks us to evaluate an arithmetic expression using a custom order of operations and left-associativity. The key challenge is parsing the expression, especially identifying unary minus, and then applying the operations strictly by their defined precedence.

Here's the custom order of operations from highest to lowest priority:
1.  **- (Unary)**: Negation
2.  **+**: Addition
3.  **/**: Division
4.  **-**: Subtraction (Binary)
5.  **\***: Multiplication

The constraints are:
*   Expression contains only decimal digits and operators.
*   No whitespace or parentheses.
*   Operations are left-associative.
*   Expression length between 1 and 200 characters.

We can solve this problem in two main steps:

1.  **Tokenization**: Convert the input string into a list of meaningful tokens (numbers and operators). Special care is needed to distinguish unary minus from binary minus. A unary minus occurs at the beginning of the expression or immediately after another operator (e.g., `6+-3` where the `-` before `3` is unary). We'll use a special internal token, e.g., `_UNARY_MINUS_`, to represent unary negation during tokenization.

2.  **Multi-Pass Evaluation**: Iterate through the token list multiple times, one pass for each level of operator precedence, from highest to lowest. In each pass, we apply all operations of the current precedence level, effectively reducing the token list. Left-associativity is naturally handled by processing operations from left to right within each pass and accumulating results.

Let's walk through the process with an example: `6+-3*5`

**Step 1: Tokenization**

We'll parse the string character by character:
*   Read `6`: It's a digit. Parse the number `6`. Tokens: `[6]`
*   Read `+`: It's an operator. Tokens: `[6, '+']`
*   Read `-`: It's an operator. Since the previous token (`+`) was an operator, this `-` is unary. Tokens: `[6, '+', '_UNARY_MINUS_']`
*   Read `3`: It's a digit. Parse the number `3`. Tokens: `[6, '+', '_UNARY_MINUS_', 3]`
*   Read `*`: It's an operator. Tokens: `[6, '+', '_UNARY_MINUS_', 3, '*']`
*   Read `5`: It's a digit. Parse the number `5`. Tokens: `[6, '+', '_UNARY_MINUS_', 3, '*', 5]`

The token list becomes `[6, '+', '_UNARY_MINUS_', 3, '*', 5]`.

**Step 2: Multi-Pass Evaluation**

We'll define the operator precedence levels and process them sequentially:

*   **Pass 1: Unary `-` (Priority 5)**
    *   Iterate through `[6, '+', '_UNARY_MINUS_', 3, '*', 5]`.
    *   When `_UNARY_MINUS_` is found, apply it to the next token (operand).
    *   `_UNARY_MINUS_` applied to `3` results in `-3`.
    *   The list transforms to: `[6, '+', -3, '*', 5]`

*   **Pass 2: `+` (Addition, Priority 4)**
    *   Iterate through `[6, '+', -3, '*', 5]`.
    *   When `+` is found, take the last number processed (`6`), the `+` operator, and the next number (`-3`).
    *   `6 + (-3)` results in `3`.
    *   The list transforms to: `[3, '*', 5]`

*   **Pass 3: `/` (Division, Priority 3)**
    *   No `/` in `[3, '*', 5]`. The list remains `[3, '*', 5]`.

*   **Pass 4: `-` (Subtraction, Priority 2)**
    *   No binary `-` in `[3, '*', 5]`. The list remains `[3, '*', 5]`.

*   **Pass 5: `*` (Multiplication, Priority 1)**
    *   Iterate through `[3, '*', 5]`.
    *   When `*` is found, take the last number processed (`3`), the `*` operator, and the next number (`5`).
    *   `3 * 5` results in `15`.
    *   The list transforms to: `[15]`

After all passes, the list `currentTokens` contains a single number, which is the final result: `15`.

This multi-pass approach naturally handles left-associativity because, for each operator priority, we process the operations from left to right. The result of an operation becomes an operand for the next one in the same pass if it's left-associative.