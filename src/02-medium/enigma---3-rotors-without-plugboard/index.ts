// Utility functions for char-int conversion
function charToInt(char: string): number {
    return char.charCodeAt(0) - 'A'.charCodeAt(0);
}

function intToChar(int: number): string {
    return String.fromCharCode('A'.charCodeAt(0) + int);
}

// Interface for Rotor configuration
interface RotorConfig {
    initialWiring: number[];    // Maps input index to output index (0-25)
    inverseWiring: number[];    // Maps output index to input index (0-25)
    triggerPosition: number;    // The notch position (0-25)
}

// The Enigma Machine class
class EnigmaMachine {
    rotors: {
        config: RotorConfig;
        currentPosition: number; // Current 'A' position (0-25)
    }[];
    reflector: number[]; // Maps input index to output index (0-25)

    constructor(rotorConfigs: RotorConfig[], reflectorConfig: number[], startPositions: number[]) {
        this.rotors = rotorConfigs.map((config, i) => ({
            config,
            currentPosition: startPositions[i]
        }));
        this.reflector = reflectorConfig;
    }

    // Pass signal through a rotor in the forward direction (from entry to reflector)
    // charIndex is the letter's numerical value (0-25) entering this rotor from the left
    private passThroughRotorForward(charIndex: number, rotorIndex: number): number {
        const rotor = this.rotors[rotorIndex];
        
        // 1. Adjust input by rotor's current position to find the internal entry point
        // Example: If rotor is at 'B' (pos 1), 'A' (0) input enters at internal contact 1
        const entryPoint = (charIndex + rotor.currentPosition) % 26;
        
        // 2. Map through the rotor's internal, fixed wiring
        const wiredOutput = rotor.config.initialWiring[entryPoint];
        
        // 3. Adjust output back by rotor's current position to align with fixed alphabet
        // Example: If rotor is at 'B' (pos 1), internal output 1 corresponds to 'A' on the outer ring
        const finalOutput = (wiredOutput - rotor.currentPosition + 26) % 26; // +26 to handle negative results of %
        
        return finalOutput;
    }

    // Pass signal through a rotor in the reverse direction (from reflector back to entry)
    // charIndex is the letter's numerical value (0-25) entering this rotor from the right (reflector side)
    private passThroughRotorReverse(charIndex: number, rotorIndex: number): number {
        const rotor = this.rotors[rotorIndex];

        // 1. Adjust input from the reflector side by rotor's current position to find the internal 'output' point
        // This is effectively the 'wiredOutput' from the forward pass, but in reverse
        const internalReflectedOutput = (charIndex + rotor.currentPosition) % 26;

        // 2. Map through the rotor's inverse wiring to find the internal 'input' point that produced this output
        const internalWiredInput = rotor.config.inverseWiring[internalReflectedOutput];
        
        // 3. Adjust this internal input back to align with the fixed alphabet on the entry side
        const finalOutput = (internalWiredInput - rotor.currentPosition + 26) % 26; // +26 to handle negative results of %

        return finalOutput;
    }

    // Rotates rotors according to Enigma stepping rules for each key press
    private rotateRotors() {
        // Capture current positions BEFORE any rotations happen for notch checks
        const r1_pos_before = this.rotors[0].currentPosition;
        const r2_pos_before = this.rotors[1].currentPosition;

        // Check notch conditions:
        // 1. Does Rotor 2's position trigger Rotor 3 (and itself again)?
        const r2_will_step_r3_and_itself = (r2_pos_before === this.rotors[1].config.triggerPosition);
        // 2. Does Rotor 1's position trigger Rotor 2?
        const r1_will_step_r2 = (r1_pos_before === this.rotors[0].config.triggerPosition);

        // Apply rotations in order:
        // Rotor 1 always steps
        this.rotors[0].currentPosition = (this.rotors[0].currentPosition + 1) % 26;

        // Rotor 2 steps if Rotor 1 was at its notch
        if (r1_will_step_r2) {
            this.rotors[1].currentPosition = (this.rotors[1].currentPosition + 1) % 26;
        }

        // Rotor 3 steps AND Rotor 2 steps again (double stepping) if Rotor 2 was at its notch
        if (r2_will_step_r3_and_itself) {
            this.rotors[1].currentPosition = (this.rotors[1].currentPosition + 1) % 26; // R2 steps again
            this.rotors[2].currentPosition = (this.rotors[2].currentPosition + 1) % 26; // R3 steps
        }
    }

    // Encipher a single character
    public encipherChar(char: string): string {
        // Step 1: Rotate rotors before encoding
        this.rotateRotors();

        let currentVal = charToInt(char);

        // Step 2: Pass through rotors (forward: R1 -> R2 -> R3)
        currentVal = this.passThroughRotorForward(currentVal, 0); // Rotor 1
        currentVal = this.passThroughRotorForward(currentVal, 1); // Rotor 2
        currentVal = this.passThroughRotorForward(currentVal, 2); // Rotor 3

        // Step 3: Pass through reflector
        currentVal = this.reflector[currentVal];

        // Step 4: Pass through rotors (reverse: R3 -> R2 -> R1)
        currentVal = this.passThroughRotorReverse(currentVal, 2); // Rotor 3
        currentVal = this.passThroughRotorReverse(currentVal, 1); // Rotor 2
        currentVal = this.passThroughRotorReverse(currentVal, 0); // Rotor 1

        return intToChar(currentVal);
    }

    // Encipher a full message
    public encipherMessage(message: string): string {
        let result = '';
        for (const char of message) {
            result += this.encipherChar(char);
        }
        return result;
    }
}

// --- Main execution block ---

// This declaration is for the CodinGame environment, allowing access to its input function.
declare function readline(): string;

// Helper function to parse wire strings into wiring arrays
function parseWiresInput(wireString: string): { wiring: number[]; inverseWiring: number[] } {
    const wiring = new Array<number>(26);
    const inverseWiring = new Array<number>(26);
    const pairs = wireString.split(' ');
    for (const pair of pairs) {
        const [fromChar, toChar] = pair.split('-');
        const fromIdx = charToInt(fromChar);
        const toIdx = charToInt(toChar);
        wiring[fromIdx] = toIdx;
        inverseWiring[toIdx] = fromIdx; // Store inverse mapping for reverse pass
    }
    return { wiring, inverseWiring };
}

// Read rotor 1 configuration
const r1WiresStr = readline();
const r1TriggerChar = readline();
const { wiring: r1Wiring, inverseWiring: r1InvWiring } = parseWiresInput(r1WiresStr);
const r1Config: RotorConfig = {
    initialWiring: r1Wiring,
    inverseWiring: r1InvWiring,
    triggerPosition: charToInt(r1TriggerChar)
};

// Read rotor 2 configuration
const r2WiresStr = readline();
const r2TriggerChar = readline();
const { wiring: r2Wiring, inverseWiring: r2InvWiring } = parseWiresInput(r2WiresStr);
const r2Config: RotorConfig = {
    initialWiring: r2Wiring,
    inverseWiring: r2InvWiring,
    triggerPosition: charToInt(r2TriggerChar)
};

// Read rotor 3 configuration
const r3WiresStr = readline();
const r3TriggerChar = readline();
const { wiring: r3Wiring, inverseWiring: r3InvWiring } = parseWiresInput(r3WiresStr);
const r3Config: RotorConfig = {
    initialWiring: r3Wiring,
    inverseWiring: r3InvWiring,
    triggerPosition: charToInt(r3TriggerChar)
};

// Read reflector configuration
const reflectorWiresStr = readline();
// For the reflector, only the 'wiring' is needed, as it's reciprocal and doesn't rotate.
const { wiring: reflectorWiring } = parseWiresInput(reflectorWiresStr);

// Read starting positions for each rotor
const startPositionsChars = readline().split(' ');
const startPositions = startPositionsChars.map(charToInt);

// Read the message to be enciphered
const message = readline();

// Initialize the Enigma machine with parsed configurations
const enigma = new EnigmaMachine(
    [r1Config, r2Config, r3Config], // Array of rotor configurations
    reflectorWiring,                // Reflector wiring
    startPositions                  // Initial positions of rotors
);

// Encipher the message and print the result to stdout
console.log(enigma.encipherMessage(message));