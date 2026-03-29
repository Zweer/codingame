// Required for CodinGame environment
declare function readline(): string;
declare function print(message: string): void;
declare const console: { log(message: any): void };

// Define global types and enums
enum ComponentType { LED, INPUT, NOT, AND, OR, XOR, NAND, NOR, XNOR, SWITCH }
enum SwitchDirection { LEFT = 0, RIGHT = 1 } // Using numbers for state

// Basic interface for a grid coordinate
interface Pin {
    r: number;
    c: number;
}
// String representation of a pin coordinate for map keys
type PinCoord = `${number},${number}`;

// Information stored for each pin coordinate in `pinCoordToPinInfo`
interface PinInfo {
    compId: string;
    pinType: 'input' | 'output' | 'leftOutput' | 'rightOutput';
    pinIndex?: number; // For multi-input components (0 for first, 1 for second)
}

// Base component interface
interface BaseComponent {
    id: string;
    type: ComponentType;
    char: string; // The character inside [] e.g. '&', '|', '@'
    row: number; // Row of the char inside []
    col: number; // Col of the char inside []
}

// Specific component interfaces extending BaseComponent
interface InputComponent extends BaseComponent {
    type: ComponentType.INPUT;
    initialValue: number;
}
interface SwitchComponent extends BaseComponent {
    type: ComponentType.SWITCH;
    initialDirection: SwitchDirection;
}
interface LEDComponent extends BaseComponent {
    type: ComponentType.LED;
}
interface GateComponent extends BaseComponent {
    type: ComponentType.NOT | ComponentType.AND | ComponentType.OR | ComponentType.XOR | ComponentType.NAND | ComponentType.NOR | ComponentType.XNOR;
}

// Union type for any circuit component
type Component = InputComponent | SwitchComponent | LEDComponent | GateComponent;

// Global maps for circuit structure and state during BFS
const allComponents = new Map<string, Component>();
const pinCoordToPinInfo = new Map<PinCoord, PinInfo>(); // Maps "r,c" to {compId, type, pinIndex?}
// Maps targetCompId to an array of its input sources. Order matters for 2-input gates.
const componentInputLinks = new Map<string, { sourceId: string, sourcePinType: 'OUTPUT' | 'LEFT_OUTPUT' | 'RIGHT_OUTPUT' }[]>();
// Memoization cache for circuit evaluation
const circuitValues = new Map<string, boolean>();

/**
 * Parses the input grid to identify all components and assign them unique IDs.
 * Components are identified and named in top-left to bottom-right order.
 */
function parseGrid(height: number, width: number, lines: string[]): {
    grid: string[][];
    components: Component[];
    inputs: InputComponent[];
    switches: SwitchComponent[];
    led: LEDComponent;
} {
    const grid: string[][] = lines.map(line => line.split(''));
    const components: Component[] = [];
    const inputs: InputComponent[] = [];
    const switches: SwitchComponent[] = [];
    let led: LEDComponent | undefined;

    let inputIdx = 1;
    let switchIdx = 1;
    let gateIdx = 1;

    // Iterate through the grid to find components
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            if (grid[r][c] === '[') {
                const char = grid[r][c + 1]; // Character inside brackets
                let component: Component | undefined;
                let type: ComponentType;

                // The `col` property for components will be the column of the character itself (e.g., '@', '&'),
                // not the opening bracket '['.
                const charCol = c + 1;

                switch (char) {
                    case '@':
                        type = ComponentType.LED;
                        component = { id: 'LED_0', type, char, row: r, col: charCol };
                        led = component as LEDComponent;
                        break;
                    case '0':
                    case '1':
                        type = ComponentType.INPUT;
                        component = { id: `I${inputIdx++}`, type, char, row: r, col: charCol, initialValue: parseInt(char) };
                        inputs.push(component as InputComponent);
                        break;
                    case '<':
                    case '>':
                        type = ComponentType.SWITCH;
                        component = { id: `K${switchIdx++}`, type, char, row: r, col: charCol, initialDirection: char === '<' ? SwitchDirection.LEFT : SwitchDirection.RIGHT };
                        switches.push(component as SwitchComponent);
                        break;
                    case '~':
                    case '&':
                    case '|':
                    case '+':
                    case '^':
                    case '-':
                    case '=':
                        type = {
                            '~': ComponentType.NOT,
                            '&': ComponentType.AND,
                            '|': ComponentType.OR,
                            '+': ComponentType.XOR,
                            '^': ComponentType.NAND,
                            '-': ComponentType.NOR,
                            '=': ComponentType.XNOR,
                        }[char]!;
                        component = { id: `G${gateIdx++}`, type, char, row: r, col: charCol };
                        break;
                    default:
                        continue; // Not a recognized component char
                }
                components.push(component);
            }
        }
    }

    if (!led) throw new Error("LED not found in circuit!");
    return { grid, components, inputs, switches, led };
}

/**
 * Traces wires in the grid to build the connection graph between components.
 * Populates `allComponents` and `componentInputLinks` global maps.
 */
function traceWires(grid: string[][], height: number, width: number, parsedComponents: Component[]) {
    // Populate allComponents map for easy lookup by ID
    parsedComponents.forEach(comp => allComponents.set(comp.id, comp));

    // First, identify all pin coordinates for all components and map them to their info
    for (const comp of parsedComponents) {
        let inputPins: Pin[] = [];
        let outputPins: Pin[] = [];
        let leftOutputPin: Pin | undefined;
        let rightOutputPin: Pin | undefined;

        // Pin coordinates are relative to the component's central character (comp.row, comp.col)
        switch (comp.type) {
            case ComponentType.LED:
                // LED's input pin(s) are typically below it. Assuming (R+1, C) for the '@' at (R,C).
                inputPins.push({ r: comp.row + 1, c: comp.col });
                break;
            case ComponentType.INPUT:
                // Input component's output pin is above it
                outputPins.push({ r: comp.row - 1, c: comp.col });
                break;
            case ComponentType.NOT:
                // NOT gate: input below, output above
                inputPins.push({ r: comp.row + 1, c: comp.col });
                outputPins.push({ r: comp.row - 1, c: comp.col });
                break;
            case ComponentType.AND:
            case ComponentType.OR:
            case ComponentType.XOR:
            case ComponentType.NAND:
            case ComponentType.NOR:
            case ComponentType.XNOR:
                // 2-input gates: inputs below-left and below-right, output above
                inputPins.push({ r: comp.row + 1, c: comp.col - 1 }); // Input 1
                inputPins.push({ r: comp.row + 1, c: comp.col + 1 }); // Input 2
                outputPins.push({ r: comp.row - 1, c: comp.col });
                break;
            case ComponentType.SWITCH:
                // Switch: input below, two outputs above-left and above-right
                inputPins.push({ r: comp.row + 1, c: comp.col }); // The single input for the switch
                leftOutputPin = { r: comp.row - 1, c: comp.col - 1 };
                rightOutputPin = { r: comp.row - 1, c: comp.col + 1 };
                break;
        }

        // Store pin info in `pinCoordToPinInfo` map for quick lookup during wire tracing
        inputPins.forEach((p, idx) => pinCoordToPinInfo.set(`${p.r},${p.c}`, { compId: comp.id, pinType: 'input', pinIndex: idx }));
        outputPins.forEach(p => pinCoordToPinInfo.set(`${p.r},${p.c}`, { compId: comp.id, pinType: 'output' }));
        if (leftOutputPin) pinCoordToPinInfo.set(`${leftOutputPin.r},${leftOutputPin.c}`, { compId: comp.id, pinType: 'leftOutput' });
        if (rightOutputPin) pinCoordToPinInfo.set(`${rightOutputPin.r},${rightOutputPin.c}`, { compId: comp.id, pinType: 'rightOutput' });
    }

    // Now, trace wires from each output pin to connected input pins
    for (const comp of parsedComponents) {
        let currentSourcePins: { coord: Pin, id: string, type: 'OUTPUT' | 'LEFT_OUTPUT' | 'RIGHT_OUTPUT' }[] = [];

        // Determine the starting points for wire tracing (output pins)
        if (comp.type === ComponentType.INPUT || comp.type === ComponentType.NOT || (comp.type >= ComponentType.AND && comp.type <= ComponentType.XNOR)) {
            // These components have a single output pin (at comp.row - 1, comp.col)
            const outputPinCoord = { r: comp.row - 1, c: comp.col };
            // Ensure there's actually a wire character at the output pin location
            if (grid[outputPinCoord.r]?.[outputPinCoord.c] === '|' || grid[outputPinCoord.r]?.[outputPinCoord.c] === '+' || grid[outputPinCoord.r]?.[outputPinCoord.c] === '-') {
                currentSourcePins.push({ coord: outputPinCoord, id: comp.id, type: 'OUTPUT' });
            }
        } else if (comp.type === ComponentType.SWITCH) {
            // Switches have two output pins
            const leftOutputPinCoord = { r: comp.row - 1, c: comp.col - 1 };
            const rightOutputPinCoord = { r: comp.row - 1, c: comp.col + 1 };
            if (grid[leftOutputPinCoord.r]?.[leftOutputPinCoord.c] === '|' || grid[leftOutputPinCoord.r]?.[leftOutputPinCoord.c] === '+' || grid[leftOutputPinCoord.r]?.[leftOutputPinCoord.c] === '-') {
                currentSourcePins.push({ coord: leftOutputPinCoord, id: comp.id, type: 'LEFT_OUTPUT' });
            }
            if (grid[rightOutputPinCoord.r]?.[rightOutputPinCoord.c] === '|' || grid[rightOutputPinCoord.r]?.[rightOutputPinCoord.c] === '+' || grid[rightOutputPinCoord.r]?.[rightOutputPinCoord.c] === '-') {
                currentSourcePins.push({ coord: rightOutputPinCoord, id: comp.id, type: 'RIGHT_OUTPUT' });
            }
        }

        // Perform BFS/DFS from each output pin to trace wires
        for (const source of currentSourcePins) {
            const queue: Pin[] = [source.coord];
            const visited = new Set<PinCoord>();
            visited.add(`${source.coord.r},${source.coord.c}`);

            while (queue.length > 0) {
                const { r: currR, c: currC } = queue.shift()!;
                const currChar = grid[currR]?.[currC];

                // Check if the current position is an input pin for any component
                const pinInfo = pinCoordToPinInfo.get(`${currR},${currC}`);
                if (pinInfo && pinInfo.pinType === 'input') {
                    const targetCompId = pinInfo.compId;
                    // Ensure the target component is not the source component itself (e.g., self-loop)
                    if (allComponents.has(targetCompId) && targetCompId !== comp.id) {
                        if (!componentInputLinks.has(targetCompId)) {
                            // Initialize input links for the target component.
                            // Use `null`s for multi-input gates to preserve `pinIndex` order.
                            const targetComp = allComponents.get(targetCompId)!;
                            let initialSize = 0;
                            if (targetComp.type === ComponentType.LED || targetComp.type === ComponentType.NOT || targetComp.type === ComponentType.SWITCH) {
                                initialSize = 1; 
                            } else if (targetComp.type >= ComponentType.AND && targetComp.type <= ComponentType.XNOR) {
                                initialSize = 2; // All 2-input gates
                            }
                            componentInputLinks.set(targetCompId, new Array(initialSize).fill(null));
                        }
                        const links = componentInputLinks.get(targetCompId)!;
                        
                        if (pinInfo.pinIndex !== undefined) {
                            // For components where input order matters (2-input gates, LED if it has explicit indices)
                            links[pinInfo.pinIndex] = { sourceId: source.id, sourcePinType: source.type };
                        } else {
                            // For single-input components (like NOT gate's input, or switch's input)
                            // or if LED input pinIndex isn't strictly defined / it's multiple wires to same virtual pin
                            // Avoid adding duplicate links to the same input if multiple paths exist
                            const existingLink = links.find(l => l && l.sourceId === source.id && l.sourcePinType === source.type);
                            if (!existingLink) {
                                links.push({ sourceId: source.id, sourcePinType: source.type });
                            }
                        }
                    }
                    // Crucial: Do not continue tracing past an input pin, as it's an endpoint for this wire's segment.
                    continue; 
                }

                // Explore neighbors: Up, Down, Left, Right
                const neighbors: Pin[] = [];
                // Wires flow through '|' (vertical) and '-' (horizontal) and '+' (junctions)
                if (currChar === '|' || currChar === '+') {
                    neighbors.push({ r: currR - 1, c: currC }); // Up
                    neighbors.push({ r: currR + 1, c: currC }); // Down
                }
                if (currChar === '-' || currChar === '+') {
                    neighbors.push({ r: currR, c: currC - 1 }); // Left
                    neighbors.push({ r: currR, c: currC + 1 }); // Right
                }

                for (const neighbor of neighbors) {
                    const { r: nR, c: nC } = neighbor;
                    const nCoord = `${nR},${nC}`;

                    // Check bounds and if already visited
                    if (nR >= 0 && nR < height && nC >= 0 && nC < width && !visited.has(nCoord)) {
                        const neighborChar = grid[nR][nC];
                        // If neighbor is a wire character or an unvisited input pin (which is where wires connect)
                        if (neighborChar === '|' || neighborChar === '-' || neighborChar === '+' || (pinCoordToPinInfo.has(nCoord) && pinCoordToPinInfo.get(nCoord)!.pinType === 'input')) {
                             visited.add(nCoord);
                             queue.push(neighbor);
                        }
                    }
                }
            }
        }
    }
}

/**
 * Represents the current configuration of inputs and switches in the circuit.
 */
interface CurrentConfig {
    inputs: Map<string, number>; // Maps input ID (e.g., "I1") to its value (0 or 1)
    switches: Map<string, SwitchDirection>; // Maps switch ID (e.g., "K1") to its direction (LEFT or RIGHT)
}

/**
 * Recursively evaluates a component's output value (boolean).
 * Uses memoization (`circuitValues`) to avoid recomputing values for already evaluated components.
 */
function evaluateComponent(compId: string, config: CurrentConfig): boolean {
    if (circuitValues.has(compId)) {
        return circuitValues.get(compId)!;
    }

    const component = allComponents.get(compId)!;
    let result: boolean;

    switch (component.type) {
        case ComponentType.INPUT:
            result = config.inputs.get(compId) === 1;
            break;
        case ComponentType.NOT:
            const notInput = componentInputLinks.get(compId)![0];
            result = !getPinValue(notInput.sourceId, notInput.sourcePinType, config);
            break;
        case ComponentType.AND:
            const andInputs = componentInputLinks.get(compId)!;
            result = getPinValue(andInputs[0].sourceId, andInputs[0].sourcePinType, config) &&
                     getPinValue(andInputs[1].sourceId, andInputs[1].sourcePinType, config);
            break;
        case ComponentType.OR:
            const orInputs = componentInputLinks.get(compId)!;
            result = getPinValue(orInputs[0].sourceId, orInputs[0].sourcePinType, config) ||
                     getPinValue(orInputs[1].sourceId, orInputs[1].sourcePinType, config);
            break;
        case ComponentType.XOR:
            const xorInputs = componentInputLinks.get(compId)!;
            result = getPinValue(xorInputs[0].sourceId, xorInputs[0].sourcePinType, config) !==
                     getPinValue(xorInputs[1].sourceId, xorInputs[1].sourcePinType, config);
            break;
        case ComponentType.NAND:
            const nandInputs = componentInputLinks.get(compId)!;
            result = !(getPinValue(nandInputs[0].sourceId, nandInputs[0].sourcePinType, config) &&
                       getPinValue(nandInputs[1].sourceId, nandInputs[1].sourcePinType, config));
            break;
        case ComponentType.NOR:
            const norInputs = componentInputLinks.get(compId)!;
            result = !(getPinValue(norInputs[0].sourceId, norInputs[0].sourcePinType, config) ||
                       getPinValue(norInputs[1].sourceId, norInputs[1].sourcePinType, config));
            break;
        case ComponentType.XNOR:
            const xnorInputs = componentInputLinks.get(compId)!;
            result = getPinValue(xnorInputs[0].sourceId, xnorInputs[0].sourcePinType, config) ===
                     getPinValue(xnorInputs[1].sourceId, xnorInputs[1].sourcePinType, config);
            break;
        case ComponentType.SWITCH:
            // This case should ideally not be reached directly, as switch outputs are handled by getPinValue.
            throw new Error(`Cannot evaluate SWITCH component (${compId}) directly for output value without specifying which output pin.`);
        case ComponentType.LED:
            // LED does not produce an output value itself.
            throw new Error(`LED component (${compId}) does not produce an output value.`);
    }
    circuitValues.set(compId, result); // Memoize the computed value
    return result;
}

/**
 * Gets the boolean value flowing from a specific source pin, handling switch logic.
 */
function getPinValue(sourceId: string, sourcePinType: 'OUTPUT' | 'LEFT_OUTPUT' | 'RIGHT_OUTPUT', config: CurrentConfig): boolean {
    // If the source is a switch's specific output (e.g., "K1_LEFT" or "K1_RIGHT")
    if (sourceId.startsWith('K') && (sourceId.endsWith('_LEFT') || sourceId.endsWith('_RIGHT'))) {
        const switchId = sourceId.split('_')[0]; // Extract "K1" from "K1_LEFT"
        // Switches have one input, so we evaluate that input
        const switchInputSource = componentInputLinks.get(switchId)![0];
        const inputValue = getPinValue(switchInputSource.sourceId, switchInputSource.sourcePinType, config);

        // Check if current configuration allows current to flow through this specific output
        if (config.switches.get(switchId) === SwitchDirection.LEFT && sourcePinType === 'LEFT_OUTPUT') {
            return inputValue;
        } else if (config.switches.get(switchId) === SwitchDirection.RIGHT && sourcePinType === 'RIGHT_OUTPUT') {
            return inputValue;
        } else {
            return false; // Current is not flowing through this output branch
        }
    } else {
        // Source is a regular component (Input or Gate), evaluate its output directly
        return evaluateComponent(sourceId, config);
    }
}

/**
 * Checks if the LED is lit for a given circuit configuration.
 * Clears memoization cache before evaluation.
 */
function isLedLit(config: CurrentConfig, ledComp: LEDComponent): boolean {
    circuitValues.clear(); // Clear memoization cache for each new configuration
    const ledInputs = componentInputLinks.get(ledComp.id);

    // If LED has no inputs or some inputs are not connected (null in links array), it cannot be lit
    if (!ledInputs || ledInputs.length === 0 || ledInputs.includes(null)) {
        return false;
    }

    // LED is lit if and only if ALL its connected inputs are powered (true)
    for (const input of ledInputs) {
        if (!input || !getPinValue(input.sourceId, input.sourcePinType, config)) {
            return false; // Any unpowered input means LED is not lit
        }
    }
    return true; // All inputs are powered
}

// BFS state interface
interface BFSState {
    config: CurrentConfig;
    steps: string[]; // List of actions taken (e.g., "I1", "K2")
    depth: number; // Number of steps taken
}

/**
 * Serializes a circuit configuration into a string for use in a `Set` for visited states.
 * Ensures consistent order for sorting input and switch IDs.
 */
function serializeConfig(config: CurrentConfig): string {
    const inputStates = Array.from(config.inputs.entries())
        .sort((a, b) => a[0].localeCompare(b[0])) // Sort by ID for consistent serialization
        .map(([_, val]) => val)
        .join('');
    const switchStates = Array.from(config.switches.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([_, dir]) => dir === SwitchDirection.LEFT ? 'L' : 'R')
        .join('');
    return `${inputStates}-${switchStates}`;
}

/**
 * Creates a deep copy of a circuit configuration to avoid modifying states in the queue.
 */
function deepCopyConfig(config: CurrentConfig): CurrentConfig {
    return {
        inputs: new Map(config.inputs),
        switches: new Map(config.switches),
    };
}

/**
 * Main function to solve the Xorandor puzzle.
 * Reads input, parses the circuit, performs BFS, and outputs the minimum steps.
 */
function solve() {
    const [heightStr, widthStr] = readline().split(' ');
    const height = parseInt(heightStr);
    const width = parseInt(widthStr);
    const lines: string[] = [];
    for (let i = 0; i < height; i++) {
        lines.push(readline());
    }

    // Parse grid, identify components, and get sorted lists of input/switch components
    const { grid, components, inputs: allInputComps, switches: allSwitchComps, led } = parseGrid(height, width, lines);
    
    // Sort input and switch IDs numerically (I1, I2, ..., I10; K1, K2, ..., K10)
    const allInputIds = allInputComps.map(i => i.id).sort((a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1)));
    const allSwitchIds = allSwitchComps.map(k => k.id).sort((a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1)));

    // Trace wires and build the connection graph, populating global maps
    traceWires(grid, height, width, components); 

    // Define the initial state of inputs and switches as parsed from the grid
    const initialConfig: CurrentConfig = {
        inputs: new Map<string, number>(allInputComps.map(i => [i.id, i.initialValue])),
        switches: new Map<string, SwitchDirection>(allSwitchComps.map(k => [k.id, k.initialDirection])),
    };

    // Initialize BFS queue and visited set
    const queue: BFSState[] = [{ config: initialConfig, steps: [], depth: 0 }];
    const visited = new Set<string>();
    visited.add(serializeConfig(initialConfig));

    let minSteps = Infinity;
    let solutions: string[][] = []; // Stores all solutions found at `minSteps`

    // Start BFS
    while (queue.length > 0) {
        const { config, steps, depth } = queue.shift()!;

        // Pruning: if current depth already exceeds minSteps, skip this path
        if (depth > minSteps) continue;

        // Check if the LED is lit for the current configuration
        if (isLedLit(config, led)) {
            if (depth < minSteps) {
                minSteps = depth;
                solutions = [steps]; // Found a new minimum depth, reset solutions
            } else if (depth === minSteps) {
                solutions.push(steps); // Found another solution at the same minimum depth
            }
            // Continue BFS: It's important to keep exploring at the current depth
            // to find all minimum-step solutions for tie-breaking.
            // Don't explore children from a goal state, as path would be longer.
            continue; 
        }

        // Generate next states by toggling one input or one switch
        // Iterate through inputs/switches in sorted order to help with implicit tie-breaking during exploration (though final sort is still needed)
        
        // Toggle inputs
        for (const inputId of allInputIds) {
            const newConfig = deepCopyConfig(config);
            newConfig.inputs.set(inputId, 1 - newConfig.inputs.get(inputId)!); // Toggle 0 <-> 1
            const serialized = serializeConfig(newConfig);
            if (!visited.has(serialized)) {
                visited.add(serialized);
                queue.push({
                    config: newConfig,
                    steps: [...steps, inputId], // Add the toggled input's ID to steps
                    depth: depth + 1
                });
            }
        }

        // Toggle switches
        for (const switchId of allSwitchIds) {
            const newConfig = deepCopyConfig(config);
            newConfig.switches.set(switchId, newConfig.switches.get(switchId) === SwitchDirection.LEFT ? SwitchDirection.RIGHT : SwitchDirection.LEFT);
            const serialized = serializeConfig(newConfig);
            if (!visited.has(serialized)) {
                visited.add(serialized);
                queue.push({
                    config: newConfig,
                    steps: [...steps, switchId], // Add the toggled switch's ID to steps
                    depth: depth + 1
                });
            }
        }
    }

    // After BFS, sort all found minimum-step solutions for tie-breaking.
    // The problem asks for "top-left bottom-right order", which for the steps list
    // is interpreted as lexicographical comparison of the step names.
    solutions.sort((a, b) => {
        const minLen = Math.min(a.length, b.length);
        for (let i = 0; i < minLen; i++) {
            // Lexicographical comparison of individual step names (e.g., "I1" < "I3")
            if (a[i] < b[i]) return -1;
            if (a[i] > b[i]) return 1;
        }
        // If one path is a prefix of another, the shorter one comes first
        return a.length - b.length;
    });

    // Output the first (lexicographically smallest) solution
    if (solutions.length > 0) {
        for (const step of solutions[0]) {
            console.log(step);
        }
    } else {
        // This case should ideally not be reached if a solution is always guaranteed.
        // For robustness, could print an error message or specific output if required.
    }
}

// Call the main solve function to start execution in CodinGame environment
solve();