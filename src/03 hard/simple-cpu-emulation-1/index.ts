// Read the program string from standard input
const program: string = readline();

// CPU state: Three 8-bit registers, initialized to zero.
// We use regular TypeScript numbers, but will ensure 8-bit behavior.
const registers: number[] = [0, 0, 0]; 

// Program Counter, points to the start of the current 4-character opcode
let pc: number = 0; 

/**
 * Ensures a number stays within the 8-bit unsigned range (0-255).
 * This is done by a bitwise AND with 0xFF (binary 11111111).
 * @param value The number to clamp.
 * @returns The 8-bit clamped number.
 */
function clamp8Bit(value: number): number {
    return value & 0xFF;
}

// Main emulation loop
while (true) {
    // Extract the current 4-character hexadecimal opcode string from the program
    const opcodeStr: string = program.substring(pc, pc + 4);

    // Parse the first hex digit to determine the instruction type (opcode category)
    const instructionType: number = parseInt(opcodeStr[0], 16);

    // Variables to hold parsed instruction arguments (reused for efficiency)
    let k: number;      // Register index (e.g., for LD k, nn)
    let nn: number;     // 8-bit immediate value
    let x: number;      // Destination/source register index
    let y: number;      // Source register index

    let temp: number;   // Temporary variable for calculations (e.g., ADD overflow)
    let shouldSkipNextInstruction: boolean = false; // Flag for SE/SNE instructions

    // Decode and execute the instruction based on its type
    switch (instructionType) {
        case 0:
            // 0000 - EXIT: Stop execution and print results
            if (opcodeStr === "0000") {
                console.log(`${registers[0]} ${registers[1]} ${registers[2]}`);
                // Break out of the switch, then the 'if' condition below will break the while loop.
                break; 
            }
            // Fallthrough or error for invalid '0xxx' opcodes (not specified in puzzle)
            console.error(`Invalid opcode: ${opcodeStr} at PC ${pc}. Expected 0000 for type 0. Exiting.`);
            process.exit(1);
            
        case 1:
            // 1knn - LD k, nn: Load value nn into register k
            k = parseInt(opcodeStr[1], 16);           // k is the second hex digit
            nn = parseInt(opcodeStr.substring(2, 4), 16); // nn is the last two hex digits
            registers[k] = clamp8Bit(nn);
            break;

        case 2:
            // 20xy - ADD x, y: Add register y to register x, store in x. Set register 2 for carry.
            x = parseInt(opcodeStr[2], 16); // x is the third hex digit
            y = parseInt(opcodeStr[3], 16); // y is the fourth hex digit
            temp = registers[x] + registers[y]; // Perform addition
            registers[x] = clamp8Bit(temp);    // Store lowest 8-bits in register x
            registers[2] = (temp > 255) ? 1 : 0; // Set register 2 (carry flag) based on overflow
            break;

        case 3:
            // 30xy - SUB x, y: Subtract register y from register x, store in x. Set register 2 for borrow.
            x = parseInt(opcodeStr[2], 16);
            y = parseInt(opcodeStr[3], 16);
            registers[2] = (registers[x] < registers[y]) ? 1 : 0; // Set register 2 (borrow flag)
            registers[x] = clamp8Bit(registers[x] - registers[y]); // Store result (handles wrap-around for negative results, e.g., 0-1=255)
            break;

        case 4:
            // 40xy - OR x, y: Bitwise OR on register x and y, store in x.
            x = parseInt(opcodeStr[2], 16);
            y = parseInt(opcodeStr[3], 16);
            registers[x] = clamp8Bit(registers[x] | registers[y]);
            break;

        case 5:
            // 50xy - AND x, y: Bitwise AND on register x and y, store in x.
            x = parseInt(opcodeStr[2], 16);
            y = parseInt(opcodeStr[3], 16);
            registers[x] = clamp8Bit(registers[x] & registers[y]);
            break;

        case 6:
            // 60xy - XOR x, y: Bitwise XOR on register x and y, store in x.
            x = parseInt(opcodeStr[2], 16);
            y = parseInt(opcodeStr[3], 16);
            registers[x] = clamp8Bit(registers[x] ^ registers[y]);
            break;

        case 7:
            // 7knn - SE k, nn: Skip next instruction if value of register k equals nn.
            k = parseInt(opcodeStr[1], 16);
            nn = parseInt(opcodeStr.substring(2, 4), 16);
            if (registers[k] === nn) {
                shouldSkipNextInstruction = true;
            }
            break;

        case 8:
            // 8knn - SNE k, nn: Skip next instruction if value of register k is not equal to nn.
            k = parseInt(opcodeStr[1], 16);
            nn = parseInt(opcodeStr.substring(2, 4), 16);
            if (registers[k] !== nn) {
                shouldSkipNextInstruction = true;
            }
            break;

        case 9:
            // 90xy - SE x, y: Skip next instruction if value of register x equals value of register y.
            x = parseInt(opcodeStr[2], 16);
            y = parseInt(opcodeStr[3], 16);
            if (registers[x] === registers[y]) {
                shouldSkipNextInstruction = true;
            }
            break;

        case 10: // 'A' in hexadecimal is 10
            // A0xy - SNE x, y: Skip next instruction if value of register x is not equal to value of register y.
            x = parseInt(opcodeStr[2], 16);
            y = parseInt(opcodeStr[3], 16);
            if (registers[x] !== registers[y]) {
                shouldSkipNextInstruction = true;
            }
            break;

        default:
            // Handle any unrecognized instruction types (e.g., opcodes starting with B-F).
            // Per puzzle constraints, this case should ideally not be reached for valid inputs.
            console.error(`Unrecognized instruction type: ${instructionType} (from ${opcodeStr}) at PC ${pc}. Exiting.`);
            process.exit(1);
    }

    // Always advance the Program Counter by 4 characters (one instruction length).
    pc += 4;

    // If a skip condition was met, advance PC by an additional 4 to skip the next instruction.
    if (shouldSkipNextInstruction) {
        pc += 4;
    }
    
    // Check if the last executed instruction was the EXIT opcode.
    // The 'break' inside case 0 only exits the switch; this condition
    // is necessary to break out of the main 'while' loop.
    if (instructionType === 0 && opcodeStr === "0000") {
        break; // Exit the main emulation loop
    }
}