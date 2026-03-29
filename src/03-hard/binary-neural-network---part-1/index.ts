// LCG Generator for weight initialization
class LCGGenerator {
    private currentSeed: bigint;
    private readonly A = 1103515245n; // Using BigInt literal
    private readonly C = 12345n;
    private readonly M = 0x80000000n; // 2^31 as BigInt
    private readonly NORM_DIVISOR = 0x7fffffff; // 2^31 - 1, as number for division

    constructor(seed: number) {
        this.currentSeed = BigInt(seed);
    }

    // Generates the next random number normalized to [0, 1]
    next(): number {
        this.currentSeed = (this.A * this.currentSeed + this.C) % this.M;
        // Convert the BigInt result back to a number for normalization.
        // The value `currentSeed` will be less than `M` (2^31), which fits safely into a JS Number (double-precision float).
        return Number(this.currentSeed) / this.NORM_DIVISOR;
    }
}

// Represents a single node in the neural network
interface Node {
    id: string; // Unique identifier for the node (e.g., "I1", "H1:1", "O1")
    output: number; // Output value after activation (o)
    unnormalized_output: number; // Sum of weighted inputs before activation (o')
    delta: number; // Error term for backpropagation (δ)
}

// Main Neural Network class
class NeuralNetwork {
    private inputsCount: number;
    private outputsCount: number;
    private hiddenLayerCounts: number[]; // Array containing number of nodes in each hidden layer
    private totalLayers: number; // Total number of layers including input and output

    // nodes[layerIdx][nodeIdx] stores Node objects
    private nodes: Node[][];
    // Special bias node, always outputs 1
    private biasNode: Node;

    // Weights stored as a map from "sourceId_targetId" string to weight value
    private weights: Map<string, number>;

    private LCG: LCGGenerator; // Instance of the LCG for weight initialization

    private readonly LEARNING_RATE = 0.5; // Constant learning rate (η)

    constructor(inputs: number, outputs: number, hiddenLayerCounts: number[]) {
        this.inputsCount = inputs;
        this.outputsCount = outputs;
        this.hiddenLayerCounts = hiddenLayerCounts;
        // Calculate total layers: 1 (input) + numHiddenLayers + 1 (output)
        this.totalLayers = 1 + this.hiddenLayerCounts.length + 1;

        this.nodes = [];
        this.weights = new Map();
        this.LCG = new LCGGenerator(1103527590); // Initialize LCG with the specified seed

        // Initialize the bias node
        this.biasNode = { id: "THETA", output: 1, unnormalized_output: 1, delta: 0 };

        // Set up the network structure (nodes) and initialize all weights
        this.initializeNetworkStructure();
        this.initializeWeights();
    }

    // Creates the Node objects for all layers (input, hidden, output)
    private initializeNetworkStructure() {
        // Layer 0: Input Nodes
        const inputNodes: Node[] = [];
        for (let i = 0; i < this.inputsCount; i++) {
            inputNodes.push({ id: `I${i + 1}`, output: 0, unnormalized_output: 0, delta: 0 });
        }
        this.nodes.push(inputNodes);

        // Hidden Layers (if any)
        for (let h = 0; h < this.hiddenLayerCounts.length; h++) {
            const hiddenNodes: Node[] = [];
            const numNodesInLayer = this.hiddenLayerCounts[h];
            // Layer index for hidden layers starts from 1
            for (let i = 0; i < numNodesInLayer; i++) {
                hiddenNodes.push({ id: `H${h + 1}:${i + 1}`, output: 0, unnormalized_output: 0, delta: 0 });
            }
            this.nodes.push(hiddenNodes);
        }

        // Last Layer: Output Nodes
        const outputNodes: Node[] = [];
        for (let i = 0; i < this.outputsCount; i++) {
            outputNodes.push({ id: `O${i + 1}`, output: 0, unnormalized_output: 0, delta: 0 });
        }
        this.nodes.push(outputNodes);
    }

    // Initializes all network weights using the LCG in the specified order
    private initializeWeights() {
        // Iterate through target layers from left to right (from the first layer that receives inputs, i.e., first hidden or output)
        // Layer 0 is input, so start from layer 1
        for (let currentLayerIdx = 1; currentLayerIdx < this.totalLayers; currentLayerIdx++) {
            const currentLayerNodes = this.nodes[currentLayerIdx];
            const previousLayerNodes = this.nodes[currentLayerIdx - 1];

            // For each node in the current (target) layer (top to bottom)
            for (const targetNode of currentLayerNodes) {
                // For each node in the previous (source) layer (top to bottom)
                for (const sourceNode of previousLayerNodes) {
                    const weight = this.LCG.next();
                    this.weights.set(`${sourceNode.id}_${targetNode.id}`, weight);
                }
                // Add the bias weight for the current target node
                const biasWeight = this.LCG.next();
                this.weights.set(`${this.biasNode.id}_${targetNode.id}`, biasWeight);
            }
        }
    }

    // Sigmoid activation function
    private sigmoid(x: number): number {
        return 1 / (1 + Math.exp(-x));
    }

    // Performs a forward pass through the network with given inputs
    public forwardPass(inputs: number[]) {
        // Set outputs of input nodes
        for (let i = 0; i < this.inputsCount; i++) {
            this.nodes[0][i].output = inputs[i];
        }

        // Propagate outputs through hidden and output layers
        // Start from layer 1 (first hidden layer or output layer if no hidden layers)
        for (let layerIdx = 1; layerIdx < this.totalLayers; layerIdx++) {
            const currentLayerNodes = this.nodes[layerIdx];
            const previousLayerNodes = this.nodes[layerIdx - 1];

            for (const targetNode of currentLayerNodes) {
                let unnormalized_output = 0; // o'[k]

                // Sum of (source_node_output * weight_from_source_to_target)
                for (const sourceNode of previousLayerNodes) {
                    const weight = this.weights.get(`${sourceNode.id}_${targetNode.id}`);
                    if (weight === undefined) {
                        // This should ideally not happen if weights are initialized correctly
                        throw new Error(`Weight not found for ${sourceNode.id}_${targetNode.id}`);
                    }
                    unnormalized_output += sourceNode.output * weight;
                }

                // Add bias term (bias_node_output * bias_weight)
                const biasWeight = this.weights.get(`${this.biasNode.id}_${targetNode.id}`);
                if (biasWeight === undefined) {
                    throw new Error(`Bias weight not found for ${this.biasNode.id}_${targetNode.id}`);
                }
                unnormalized_output += this.biasNode.output * biasWeight; // biasNode.output is always 1

                targetNode.unnormalized_output = unnormalized_output;
                targetNode.output = this.sigmoid(unnormalized_output);
            }
        }
    }

    // Performs backpropagation to calculate and apply weight changes
    public backpropagation(expectedOutputs: number[]) {
        const deltaWeights: Map<string, number> = new Map(); // Temporarily store calculated delta_w's

        // 1. Calculate deltas (δ) for output nodes
        const outputLayerIdx = this.totalLayers - 1;
        const outputNodes = this.nodes[outputLayerIdx];
        for (let i = 0; i < this.outputsCount; i++) {
            const outputNode = outputNodes[i];
            const tk = expectedOutputs[i]; // Expected output for this node
            // δ[k] = o[k]*(1 - o[k])*(o[k] - tk)
            outputNode.delta = outputNode.output * (1 - outputNode.output) * (outputNode.output - tk);
        }

        // 2. Calculate deltas (δ) for hidden nodes (working from right to left)
        // Iterate through hidden layers from the last hidden layer down to the first hidden layer
        // Last hidden layer is at totalLayers - 2 (since output is totalLayers - 1)
        // First hidden layer is at index 1
        for (let layerIdx = this.totalLayers - 2; layerIdx >= 1; layerIdx--) {
            const currentLayerNodes = this.nodes[layerIdx]; // The current hidden layer (j)
            const nextLayerNodes = this.nodes[layerIdx + 1]; // The layer to its right (k)

            for (const currentNode of currentLayerNodes) { // For each node j in the current hidden layer
                let sum_delta_k_w_j_k = 0;
                // Sum (δ[k] * w[j, k]) for all nodes k in the next layer to the right
                for (const nextNode of nextLayerNodes) {
                    const weight = this.weights.get(`${currentNode.id}_${nextNode.id}`);
                    if (weight === undefined) {
                        throw new Error(`Weight not found for ${currentNode.id}_${nextNode.id}`);
                    }
                    sum_delta_k_w_j_k += nextNode.delta * weight;
                }
                // δ[j] = o[j]*(1 - o[j]) * (sum_delta_k_w_j_k)
                currentNode.delta = currentNode.output * (1 - currentNode.output) * sum_delta_k_w_j_k;
            }
        }

        // 3. Calculate ∆w's for all links and store them temporarily
        // Iterate through target layers from left to right (from first hidden or output)
        for (let currentLayerIdx = 1; currentLayerIdx < this.totalLayers; currentLayerIdx++) {
            const currentLayerNodes = this.nodes[currentLayerIdx]; // Target nodes (k)
            const previousLayerNodes = this.nodes[currentLayerIdx - 1]; // Source nodes (j)

            for (const targetNode of currentLayerNodes) {
                // Weights from previous layer nodes (j to k)
                for (const sourceNode of previousLayerNodes) {
                    // ∆w = -η * δ[k] * o[j]
                    const dw = -this.LEARNING_RATE * targetNode.delta * sourceNode.output;
                    deltaWeights.set(`${sourceNode.id}_${targetNode.id}`, dw);
                }
                // Bias weights (θ to k)
                // ∆w = -η * δ[k] (since o[θ] is 1)
                const dw_bias = -this.LEARNING_RATE * targetNode.delta;
                deltaWeights.set(`${this.biasNode.id}_${targetNode.id}`, dw_bias);
            }
        }

        // 4. Apply the calculated ∆w's to update all link weights
        for (const [key, dw] of deltaWeights.entries()) {
            const currentWeight = this.weights.get(key);
            if (currentWeight === undefined) {
                throw new Error(`Weight not found for ${key} during update.`);
            }
            this.weights.set(key, currentWeight + dw);
        }
    }

    // Trains the network using the provided training data
    public train(trainingData: { inputs: number[], outputs: number[] }[], trainingIterations: number) {
        for (let iter = 0; iter < trainingIterations; iter++) {
            for (const data of trainingData) {
                this.forwardPass(data.inputs);
                this.backpropagation(data.outputs);
            }
        }
    }

    // Makes a prediction for a given input, returning rounded binary outputs
    public predict(inputs: number[]): number[] {
        this.forwardPass(inputs);
        const outputNodes = this.nodes[this.totalLayers - 1];
        // Round outputs to nearest integer (0 or 1)
        return outputNodes.map(node => Math.round(node.output));
    }
}

// --- Main program execution ---
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputLines: string[] = [];
rl.on('line', (line: string) => {
    inputLines.push(line);
});

rl.on('close', () => {
    try {
        main(inputLines);
    } catch (error) {
        console.error("An error occurred:", error);
    }
});

function main(inputLines: string[]) {
    let lineIdx = 0;

    // Parse first line: inputs, outputs, hiddenLayers, testInputs, trainingExamples, trainingIterations
    const [inputsCount, outputsCount, hiddenLayersCount, testInputsCount, trainingExamplesCount, trainingIterations] = inputLines[lineIdx++].split(' ').map(Number);
    
    // Parse second line: nodes in each hidden layer
    const hiddenLayerNodeCounts = hiddenLayersCount > 0 ? inputLines[lineIdx++].split(' ').map(Number) : [];

    // Parse test inputs
    const testInputs: number[][] = [];
    for (let i = 0; i < testInputsCount; i++) {
        testInputs.push(inputLines[lineIdx++].split('').map(Number));
    }

    // Parse training data
    const trainingData: { inputs: number[], outputs: number[] }[] = [];
    for (let i = 0; i < trainingExamplesCount; i++) {
        const [inputStr, outputStr] = inputLines[lineIdx++].split(' ');
        trainingData.push({
            inputs: inputStr.split('').map(Number),
            outputs: outputStr.split('').map(Number)
        });
    }

    // Initialize the neural network
    const network = new NeuralNetwork(inputsCount, outputsCount, hiddenLayerNodeCounts);

    // Train the network
    network.train(trainingData, trainingIterations);

    // Make predictions for test inputs and print results
    for (const input of testInputs) {
        const result = network.predict(input);
        console.log(result.join('')); // Join the binary digits back into a string
    }
}