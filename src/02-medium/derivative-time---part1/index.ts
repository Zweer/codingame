// Add `readline` for CodinGame environment
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Define AST Node types
enum NodeType {
    Number,
    Variable,
    Add,
    Multiply,
    Power
}

interface ASTNode {
    type: NodeType;
}

class NumberNode implements ASTNode {
    type: NodeType = NodeType.Number;
    constructor(public value: number) {}
}

class VariableNode implements ASTNode {
    type: NodeType = NodeType.Variable;
    constructor(public name: string) {}
}

// Base class for binary operations
abstract class BinaryOpNode implements ASTNode {
    constructor(public type: NodeType, public left: ASTNode, public right: ASTNode) {}
}

class AddNode extends BinaryOpNode {
    type: NodeType = NodeType.Add;
    constructor(left: ASTNode, right: ASTNode) {
        super(NodeType.Add, left, right);
    }
}

class MultiplyNode extends BinaryOpNode {
    type: NodeType = NodeType.Multiply;
    constructor(left: ASTNode, right: ASTNode) {
        super(NodeType.Multiply, left, right);
    }
}

class PowerNode extends BinaryOpNode {
    type: NodeType = NodeType.Power;
    constructor(left: ASTNode, right: ASTNode) {
        super(NodeType.Power, left, right);
    }
}

/**
 * Parses a mathematical formula string into an Abstract Syntax Tree (AST).
 * Handles fully parenthesized expressions, numbers, variables, +, *, ^.
 */
function parse(formula: string): ASTNode {
    formula = formula.trim();

    // Base cases: single number or variable
    if (formula.match(/^-?\d+$/)) {
        return new NumberNode(parseInt(formula, 10));
    }
    if (formula.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        return new VariableNode(formula);
    }

    // Must be a parenthesized expression (Expr Op Expr)
    if (!formula.startsWith('(') || !formula.endsWith(')')) {
        // This case should ideally not happen for valid fully parenthesized complex expressions,
        // as single numbers/variables are caught above.
        throw new Error("Invalid formula format: missing outer parentheses for '" + formula + "'");
    }

    // Remove outermost parentheses
    formula = formula.substring(1, formula.length - 1).trim();

    let balance = 0;
    let mainOpIndex = -1;
    let operatorChar: string | null = null;

    // Find the main operator by iterating from right to left at the outermost parenthesis level (balance 0)
    // For fully parenthesized expressions with binary operators, the first operator found
    // at balance 0 from right-to-left is guaranteed to be the main operator.
    for (let i = formula.length - 1; i >= 0; i--) {
        const char = formula[i];
        if (char === ')') {
            balance++;
        } else if (char === '(') {
            balance--;
        } else if (balance === 0) {
            if (char === '+' || char === '*' || char === '^') {
                mainOpIndex = i;
                operatorChar = char;
                break; // Found the main operator
            }
        }
    }

    if (mainOpIndex === -1) {
        throw new Error("Could not find main operator in '" + formula + "'");
    }

    const leftStr = formula.substring(0, mainOpIndex).trim();
    const rightStr = formula.substring(mainOpIndex + 1).trim();

    const leftNode = parse(leftStr);
    const rightNode = parse(rightStr);

    switch (operatorChar) {
        case '+': return new AddNode(leftNode, rightNode);
        case '*': return new MultiplyNode(leftNode, rightNode);
        case '^': return new PowerNode(leftNode, rightNode);
        default: throw new Error("Unknown operator '" + operatorChar + "'"); // Should not happen
    }
}

/**
 * Simplifies an AST by applying constant folding and algebraic identities.
 * This is crucial for keeping the AST size manageable during differentiation.
 */
function simplify(node: ASTNode): ASTNode {
    if (node instanceof NumberNode || node instanceof VariableNode) {
        return node;
    }

    const binaryNode = node as BinaryOpNode;
    // Recursively simplify children first
    const left = simplify(binaryNode.left);
    const right = simplify(binaryNode.right);

    // Apply constant folding if both children are numbers
    if (left instanceof NumberNode && right instanceof NumberNode) {
        switch (node.type) {
            case NodeType.Add: return new NumberNode(left.value + right.value);
            case NodeType.Multiply: return new NumberNode(left.value * right.value);
            case NodeType.Power: return new NumberNode(Math.pow(left.value, right.value));
        }
    }

    // Apply algebraic identities
    switch (node.type) {
        case NodeType.Add:
            if (left instanceof NumberNode && left.value === 0) return right; // 0 + X = X
            if (right instanceof NumberNode && right.value === 0) return left;  // X + 0 = X
            break;
        case NodeType.Multiply:
            if (left instanceof NumberNode) {
                if (left.value === 0) return new NumberNode(0); // 0 * X = 0
                if (left.value === 1) return right;             // 1 * X = X
            }
            if (right instanceof NumberNode) {
                if (right.value === 0) return new NumberNode(0); // X * 0 = 0
                if (right.value === 1) return left;              // X * 1 = X
            }
            break;
        case NodeType.Power:
            if (right instanceof NumberNode) {
                if (right.value === 0) return new NumberNode(1); // X^0 = 1
                if (right.value === 1) return left;              // X^1 = X
            }
            if (left instanceof NumberNode) {
                if (left.value === 0) { // 0^X
                    if (right instanceof NumberNode && right.value > 0) return new NumberNode(0); // 0^Positive = 0
                    // 0^0 is handled by X^0=1. 0^Negative is undefined, assume valid inputs.
                }
                if (left.value === 1) return new NumberNode(1); // 1^X = 1
            }
            break;
    }

    // If no specific simplification applied, return a new node with recursively simplified children.
    // This is important because children might have been simplified even if the parent wasn't.
    switch (node.type) {
        case NodeType.Add: return new AddNode(left, right);
        case NodeType.Multiply: return new MultiplyNode(left, right);
        case NodeType.Power: return new PowerNode(left, right);
    }

    return node; // Should ideally not be reached for BinaryOpNode types
}

/**
 * Symbolically differentiates an AST with respect to a given variable.
 * Applies differentiation rules and then simplifies the resulting AST.
 */
function derive(node: ASTNode, varName: string): ASTNode {
    let result: ASTNode;

    if (node instanceof NumberNode) {
        result = new NumberNode(0);
    } else if (node instanceof VariableNode) {
        if (node.name === varName) {
            result = new NumberNode(1);
        } else {
            result = new NumberNode(0); // Treat other variables as constants
        }
    } else if (node instanceof AddNode) {
        // (u + v)' = u' + v'
        const dLeft = derive(node.left, varName);
        const dRight = derive(node.right, varName);
        result = new AddNode(dLeft, dRight);
    } else if (node instanceof MultiplyNode) {
        // (u * v)' = u'v + uv'
        const u = node.left;
        const v = node.right;
        const du = derive(u, varName);
        const dv = derive(v, varName);
        result = new AddNode(new MultiplyNode(du, v), new MultiplyNode(u, dv));
    } else if (node instanceof PowerNode) {
        const base = node.left;
        const exponent = node.right;

        // Constraints: the exponent of a PowerNode must be a NumberNode
        // if its base contains the differentiation variable.
        if (!(exponent instanceof NumberNode)) {
            // This case indicates an input that violates the stated constraints:
            // "You can assume that the second argument of ^ is constant, to be simple and avoid "ln" or "e^x"."
            // Example: (x^y) will appear for d/dx but not d/dy.
            throw new Error("Attempted to differentiate a power with a non-constant exponent relative to the derivative variable: " + JSON.stringify(exponent));
        }

        const a = exponent.value;

        // Rule: d/dx(C) = 0 where C is a constant.
        // If a = 0, then base^0 = 1 (a constant), so its derivative is 0.
        if (a === 0) {
            result = new NumberNode(0);
        } else {
            const dBase = derive(base, varName); // d/dx(base)

            // If dBase is 0 (meaning the base does not contain `varName`),
            // then the entire power term is effectively a constant with respect to `varName`.
            // e.g., d/dx(y^2) = 0.
            if (dBase instanceof NumberNode && dBase.value === 0) {
                result = new NumberNode(0);
            } else {
                // Apply chain rule: d/dx(f(x)^a) = a * f(x)^(a-1) * f'(x)
                const newExponent = new NumberNode(a - 1);
                const powerTerm = new PowerNode(base, newExponent);         // f(x)^(a-1)
                const constantTerm = new NumberNode(a);                     // a
                const firstProduct = new MultiplyNode(constantTerm, powerTerm); // a * f(x)^(a-1)
                result = new MultiplyNode(firstProduct, dBase);             // (a * f(x)^(a-1)) * f'(x)
            }
        }
    } else {
        throw new Error("Unknown node type during differentiation: " + node.type); // Should not happen
    }

    return simplify(result); // Always simplify after each differentiation step
}

/**
 * Evaluates an AST node given a map of variable values.
 */
function evaluate(node: ASTNode, values: Map<string, number>): number {
    if (node instanceof NumberNode) {
        return node.value;
    }
    if (node instanceof VariableNode) {
        const val = values.get(node.name);
        if (val === undefined) {
            throw new Error(`Variable '${node.name}' not found in evaluation values.`);
        }
        return val;
    }
    if (node instanceof AddNode) {
        return evaluate(node.left, values) + evaluate(node.right, values);
    }
    if (node instanceof MultiplyNode) {
        return evaluate(node.left, values) * evaluate(node.right, values);
    }
    if (node instanceof PowerNode) {
        const base = evaluate(node.left, values);
        const exponent = evaluate(node.right, values); // exponent will always be a number due to constraints
        return Math.pow(base, exponent);
    }
    throw new Error("Unknown node type during evaluation: " + node.type); // Should not happen
}

// --- Main execution logic for CodinGame environment ---
let lines: string[] = [];
rl.on('line', (line: string) => {
    lines.push(line);
});

rl.on('close', () => {
    const formulaString = lines[0];
    const derivativeVars = lines[1].split(' ');
    const evalValuesStr = lines[2].split(' ');

    const evalValues = new Map<string, number>();
    for (let i = 0; i < evalValuesStr.length; i += 2) {
        const varName = evalValuesStr[i];
        const varValue = parseInt(evalValuesStr[i + 1], 10);
        evalValues.set(varName, varValue);
    }

    let currentAST: ASTNode = parse(formulaString);

    // Perform successive partial derivatives
    for (const dVar of derivativeVars) {
        currentAST = derive(currentAST, dVar);
    }

    // Evaluate the final derivative expression
    const finalResult = evaluate(currentAST, evalValues);

    console.log(finalResult);
});