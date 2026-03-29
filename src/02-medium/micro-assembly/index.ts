/**
 * Reads a line from standard input. In CodinGame, this is typically provided globally.
 * For local testing, you might need to mock this or use `import * as readline from 'readline';`
 * and then `readline.createInterface().on('line', ...)`.
 * Assuming `readline()` is available as per CodinGame environment.
 */
declare function readline(): string;

/**
 * Prints a line to standard output.
 * Assuming `console.log()` is available.
 */
declare function print(message?: any, ...optionalParams: any[]): void;


// --- Type Definitions ---

// Valid register names
type RegisterName = 'a' | 'b' | 'c' | 'd';

// Represents an operand which can be a register name (string) or an immediate integer value (number)
type OperandValue = RegisterName | number;

// Represents the current state of the registers
type Registers = { a: number; b: number; c: number; d: number; };

// Base interface for all instructions
interface InstructionBase {
    type: string; // e.g., 'MOV', 'ADD', 'SUB', 'JNE'
}

// MOV instruction: MOV DEST SRC|IMM
interface MovInstruction extends InstructionBase {
    type: 'MOV';
    dest: RegisterName;
    src: OperandValue;
}

// ADD/SUB instruction: (ADD|SUB) DEST SRC|IMM SRC|IMM
interface ArithInstruction extends InstructionBase {
    type: 'ADD' | 'SUB';
    dest: RegisterName;
    src1: OperandValue;
    src2: OperandValue;
}

// JNE instruction: JNE IMM SRC SRC|IMM
interface JneInstruction extends InstructionBase {
    type: 'JNE';
    jumpTarget: number; // The line number to jump to (IMM)
    src1: RegisterName; // The first value to compare (always a register)
    src2: OperandValue; // The second value to compare (can be register or immediate)
}

// Union type for all possible instruction types
type Instruction = MovInstruction | ArithInstruction | JneInstruction;


// --- Global State ---

// Initialize registers. Their values will be overwritten by input.
const registers: Registers = { a: 0, b: 0, c: 0, d: 0 };

// Array to store parsed instructions
const instructions: Instruction[] = [];


// --- Helper Functions ---

/**
 * Converts a string token into an OperandValue (either a RegisterName or a number).
 */
function parseTokenAsOperandValue(token: string): OperandValue {
    // Check if the token is a valid register name
    if (['a', 'b', 'c', 'd'].includes(token)) {
        return token as RegisterName;
    }
    // Otherwise, it must be an immediate integer value
    return parseInt(token, 10);
}

/**
 * Resolves an OperandValue to its actual numeric value.
 * If it's a register name, returns the register's current value.
 * If it's a number, returns the number itself.
 */
function getOperandValue(operand: OperandValue): number {
    if (typeof operand === 'string') {
        // It's a register name, return its value
        return registers[operand];
    }
    // It's an immediate number
    return operand;
}


// --- Input Processing ---

// 1. Read initial register values
const initialRegsLine = readline().split(' ');
registers.a = parseInt(initialRegsLine[0], 10);
registers.b = parseInt(initialRegsLine[1], 10);
registers.c = parseInt(initialRegsLine[2], 10);
registers.d = parseInt(initialRegsLine[3], 10);

// 2. Read the number of instructions
const n = parseInt(readline(), 10);

// 3. Read and parse each instruction line
for (let i = 0; i < n; i++) {
    const line = readline();
    const tokens = line.split(' ');
    const opcode = tokens[0];

    switch (opcode) {
        case 'MOV':
            instructions.push({
                type: 'MOV',
                dest: tokens[1] as RegisterName,
                src: parseTokenAsOperandValue(tokens[2])
            });
            break;
        case 'ADD':
        case 'SUB':
            instructions.push({
                type: opcode, // 'ADD' or 'SUB'
                dest: tokens[1] as RegisterName,
                src1: parseTokenAsOperandValue(tokens[2]),
                src2: parseTokenAsOperandValue(tokens[3])
            });
            break;
        case 'JNE':
            instructions.push({
                type: 'JNE',
                jumpTarget: parseInt(tokens[1], 10),
                src1: tokens[2] as RegisterName, // JNE's second operand is always a register
                src2: parseTokenAsOperandValue(tokens[3])
            });
            break;
        // No default case needed as problem states "Only valid input is given"
    }
}


// --- Interpreter Execution ---

let instructionPointer = 0; // Starts at line 0

while (instructionPointer < instructions.length) {
    const currentInstruction = instructions[instructionPointer];

    switch (currentInstruction.type) {
        case 'MOV':
            // registers[DEST] = SRC|IMM
            registers[currentInstruction.dest] = getOperandValue(currentInstruction.src);
            instructionPointer++;
            break;
        case 'ADD':
            // registers[DEST] = SRC|IMM_1 + SRC|IMM_2
            registers[currentInstruction.dest] = getOperandValue(currentInstruction.src1) + getOperandValue(currentInstruction.src2);
            instructionPointer++;
            break;
        case 'SUB':
            // registers[DEST] = SRC|IMM_1 - SRC|IMM_2
            registers[currentInstruction.dest] = getOperandValue(currentInstruction.src1) - getOperandValue(currentInstruction.src2);
            instructionPointer++;
            break;
        case 'JNE':
            // Jumps to IMM if SRC != SRC|IMM
            const val1 = getOperandValue(currentInstruction.src1);
            const val2 = getOperandValue(currentInstruction.src2);
            if (val1 !== val2) {
                instructionPointer = currentInstruction.jumpTarget;
            } else {
                instructionPointer++; // Condition not met, proceed to next instruction
            }
            break;
    }
}


// --- Output Results ---

// Print the final values of registers a, b, c, d separated by spaces
console.log(`${registers.a} ${registers.b} ${registers.c} ${registers.d}`);