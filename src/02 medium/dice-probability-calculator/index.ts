/**
 * Represents the types of tokens identified by the Tokenizer.
 */
enum TokenType {
    NUMBER,
    DICE,
    PLUS,
    MINUS,
    MULTIPLY,
    GREATER_THAN,
    LPAREN,
    RPAREN,
    EOF, // End Of File/Input
}

/**
 * Represents a single token produced by the Tokenizer.
 */
interface Token {
    type: TokenType;
    value?: string; // Stores the string value for NUMBER and DICE tokens
}

/**
 * The Tokenizer class breaks the input string into a stream of meaningful tokens.
 */
class Tokenizer {
    private input: string;
    private pos: number = 0; // Current position in the input string

    constructor(input: string) {
        this.input = input;
    }

    /**
     * Checks if a character is a digit.
     */
    private isDigit(char: string | undefined): boolean {
        return char !== undefined && char >= '0' && char <= '9';
    }

    /**
     * Peeks at the next character without advancing the position.
     */
    private peek(): string | undefined {
        return this.input[this.pos];
    }

    /**
     * Advances the position and returns the character at the original position.
     */
    private advance(): string {
        return this.input[this.pos++];
    }

    /**
     * Returns the next token from the input string.
     */
    public nextToken(): Token {
        if (this.pos >= this.input.length) {
            return { type: TokenType.EOF }; // No more input
        }

        const char = this.peek();

        // Handle integer literals (e.g., "123")
        if (this.isDigit(char)) {
            let numStr = '';
            while (this.pos < this.input.length && this.isDigit(this.peek())) {
                numStr += this.advance();
            }
            return { type: TokenType.NUMBER, value: numStr };
        }

        // Handle dice notation (e.g., "d6")
        if (char === 'd') {
            this.advance(); // Consume 'd'
            let numStr = '';
            // The number after 'd' must be a strict positive number
            while (this.pos < this.input.length && this.isDigit(this.peek())) {
                numStr += this.advance();
            }
            return { type: TokenType.DICE, value: numStr };
        }

        // Handle single-character operators and parentheses
        this.advance(); // Consume the current character
        switch (char) {
            case '+': return { type: TokenType.PLUS };
            case '-': return { type: TokenType.MINUS };
            case '*': return { type: TokenType.MULTIPLY };
            case '>': return { type: TokenType.GREATER_THAN };
            case '(': return { type: TokenType.LPAREN };
            case ')': return { type: TokenType.RPAREN };
            default:
                // According to problem constraints, input is always valid, so this case indicates an unexpected character.
                throw new Error(`Unexpected character: ${char}`);
        }
    }
}

/**
 * Type alias for a probability distribution.
 * A Map where keys are possible outcomes (numbers) and values are their probabilities (numbers from 0 to 1).
 */
type Distribution = Map<number, number>;

/**
 * The Parser class takes a token stream from the Tokenizer and evaluates the expression,
 * returning the final probability distribution. It uses a recursive descent approach.
 */
class Parser {
    private tokenizer: Tokenizer;
    private currentToken: Token; // The token currently being processed by the parser

    constructor(input: string) {
        this.tokenizer = new Tokenizer(input);
        // Initialize currentToken by getting the first token
        this.currentToken = this.tokenizer.nextToken();
    }

    /**
     * Consumes the current token if its type matches the expected type,
     * and advances to the next token. Throws an error if types don't match.
     */
    private eat(tokenType: TokenType): void {
        if (this.currentToken.type === tokenType) {
            this.currentToken = this.tokenizer.nextToken();
        } else {
            // This case should ideally not be hit given problem constraints (valid expressions)
            throw new Error(`Syntax Error: Expected ${TokenType[tokenType]}, but got ${TokenType[this.currentToken.type]}`);
        }
    }

    /**
     * Combines two probability distributions based on a given binary operator.
     * For each possible pair of outcomes from dist1 and dist2, it calculates the
     * new outcome and its combined probability (product of individual probabilities).
     * Probabilities for identical outcomes are summed up.
     */
    private combineDistributions(
        dist1: Distribution,
        dist2: Distribution,
        operator: (a: number, b: number) => number
    ): Distribution {
        const resultDist = new Map<number, number>();
        for (const [val1, prob1] of dist1.entries()) {
            for (const [val2, prob2] of dist2.entries()) {
                const newOutcome = operator(val1, val2);
                const newProb = prob1 * prob2; // Probabilities multiply for independent events
                resultDist.set(newOutcome, (resultDist.get(newOutcome) || 0) + newProb);
            }
        }
        return resultDist;
    }

    /**
     * Parses the most basic components of an expression:
     * - Number literals (e.g., '5')
     * - Dice rolls (e.g., 'd6')
     * - Parenthesized sub-expressions (e.g., '(3+d4)')
     * This is the lowest level in the operator precedence hierarchy.
     */
    private parsePrimary(): Distribution {
        const token = this.currentToken;

        if (token.type === TokenType.NUMBER) {
            this.eat(TokenType.NUMBER);
            const value = parseInt(token.value!);
            // A fixed number has 100% probability of being itself
            return new Map([[value, 1.0]]);
        } else if (token.type === TokenType.DICE) {
            this.eat(TokenType.DICE);
            const sides = parseInt(token.value!);
            const dist = new Map<number, number>();
            const probPerSide = 1.0 / sides;
            // Each side of the die has an equal probability
            for (let i = 1; i <= sides; i++) {
                dist.set(i, probPerSide);
            }
            return dist;
        } else if (token.type === TokenType.LPAREN) {
            this.eat(TokenType.LPAREN); // Consume '('
            const dist = this.parseExpression(); // Recursively parse the expression inside
            this.eat(TokenType.RPAREN); // Consume ')'
            return dist;
        } else {
            throw new Error(`Syntax Error: Unexpected token at primary: ${TokenType[token.type]}`);
        }
    }

    /**
     * Parses expressions involving multiplication.
     * This has higher precedence than addition/subtraction and comparison.
     */
    private parseFactor(): Distribution {
        let result = this.parsePrimary(); // Start by parsing a primary expression

        // Continue multiplying as long as '*' operator is encountered
        while (this.currentToken.type === TokenType.MULTIPLY) {
            this.eat(TokenType.MULTIPLY);
            const right = this.parsePrimary(); // Get the right-hand operand (another primary expression)
            result = this.combineDistributions(result, right, (a, b) => a * b);
        }
        return result;
    }

    /**
     * Parses expressions involving addition and subtraction.
     * This has higher precedence than comparison.
     */
    private parseTerm(): Distribution {
        let result = this.parseFactor(); // Start by parsing a factor

        // Continue adding or subtracting as long as '+' or '-' operators are encountered
        while (this.currentToken.type === TokenType.PLUS || this.currentToken.type === TokenType.MINUS) {
            const operatorToken = this.currentToken;
            if (operatorToken.type === TokenType.PLUS) {
                this.eat(TokenType.PLUS);
                const right = this.parseFactor(); // Get the right-hand operand (a factor)
                result = this.combineDistributions(result, right, (a, b) => a + b);
            } else if (operatorToken.type === TokenType.MINUS) {
                this.eat(TokenType.MINUS);
                const right = this.parseFactor(); // Get the right-hand operand (a factor)
                result = this.combineDistributions(result, right, (a, b) => a - b);
            }
        }
        return result;
    }

    /**
     * Parses expressions involving the greater-than comparison.
     * This is the lowest precedence operator.
     */
    private parseExpression(): Distribution {
        let result = this.parseTerm(); // Start by parsing a term

        // Continue comparing as long as '>' operator is encountered
        while (this.currentToken.type === TokenType.GREATER_THAN) {
            this.eat(TokenType.GREATER_THAN);
            const right = this.parseTerm(); // Get the right-hand operand (a term)

            // Special handling for the '>' comparison: outcomes are always 0 or 1
            const comparisonResultDist = new Map<number, number>();
            for (const [val1, prob1] of result.entries()) {
                for (const [val2, prob2] of right.entries()) {
                    // Outcome is 1 if true, 0 if false
                    const outcome = val1 > val2 ? 1 : 0;
                    const prob = prob1 * prob2; // Probability of this specific (val1, val2) pair
                    comparisonResultDist.set(outcome, (comparisonResultDist.get(outcome) || 0) + prob);
                }
            }
            result = comparisonResultDist; // The result of a comparison is a new distribution of 0s and 1s
        }
        return result;
    }

    /**
     * The main entry point for parsing the entire expression.
     * Ensures that the entire input string is consumed after parsing.
     */
    public parse(): Distribution {
        const result = this.parseExpression();
        this.eat(TokenType.EOF); // Ensure no unparsed tokens remain
        return result;
    }
}

// Read the input expression from standard input
// In CodinGame environments, `readline()` is typically a global function.
const expression: string = readline();

// Create a parser instance and parse the expression to get the final probability distribution
const parser = new Parser(expression);
const finalDistribution = parser.parse();

// Sort outcomes in ascending order for consistent output
const sortedOutcomes = Array.from(finalDistribution.entries())
    .sort(([outcomeA], [outcomeB]) => outcomeA - outcomeB);

/**
 * Helper function to round a number to two decimal places and format it as a string.
 * Uses Math.round for standard rounding (half up).
 */
function roundToTwoDecimalPlaces(num: number): string {
    // Multiply by 100, round to nearest integer, then divide by 100 to get two decimal places
    // .toFixed(2) ensures two decimal places are always displayed (e.g., 25.0 -> "25.00")
    return (Math.round(num * 100) / 100).toFixed(2);
}

// Print the sorted outcomes and their formatted probabilities
for (const [outcome, prob] of sortedOutcomes) {
    // Probabilities are usually displayed as percentages in this context
    console.log(`${outcome} ${roundToTwoDecimalPlaces(prob * 100)}`);
}