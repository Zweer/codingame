// Helper for reading input from CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

/**
 * Represents a single neuron in the neural network.
 * Each neuron has weights for its inputs, a bias, and an activation function.
 */
class Neuron {
    weights: number[]; // Weights for connections from previous layer's neurons/inputs
    bias: number;      // Bias for this neuron
    output: number;    // Output value after activation (used in feedforward and backprop)
    delta: number;     // Error gradient used in backpropagation (how much this neuron's output contributed to overall error)

    /**
     * Initializes a new Neuron.
     * @param numInputs The number of inputs this neuron receives (i.e., number of neurons in the previous layer).
     */
    constructor(numInputs: number) {
        // Initialize weights randomly between -1 and 1 to break symmetry and aid learning
        this.weights = Array.from({ length: numInputs }, () => Math.random() * 2 - 1);
        // Initialize bias randomly between -1 and 1
        this.bias = Math.random() * 2 - 1;
        this.output = 0;
        this.delta = 0;
    }

    /**
     * Sigmoid activation function. Squashes values between 0 and 1.
     * Ideal for binary classification outputs.
     * @param x The raw sum of weighted inputs plus bias.
     * @returns The output of the sigmoid function.
     */
    private sigmoid(x: number): number {
        return 1 / (1 + Math.exp(-x));
    }

    /**
     * Derivative of the sigmoid function. Used in backpropagation to calculate error gradients.
     * Assumes `x` is already the output of the sigmoid function.
     * @param x The output of the sigmoid function (neuron.output).
     * @returns The derivative of the sigmoid function at `x`.
     */
    private sigmoidDerivative(x: number): number {
        return x * (1 - x);
    }

    /**
     * Performs the feedforward calculation for this neuron.
     * It calculates the weighted sum of inputs plus bias, then applies the sigmoid activation.
     * @param inputs An array of numerical inputs from the previous layer or initial network input.
     * @returns The activated output of this neuron.
     */
    activate(inputs: number[]): number {
        let sum = this.bias;
        for (let i = 0; i < inputs.length; i++) {
            sum += inputs[i] * this.weights[i];
        }
        this.output = this.sigmoid(sum);
        return this.output;
    }

    /**
     * Helper to get the sigmoid derivative of this neuron's current output.
     * Used externally by the Layer and NeuralNetwork classes during backpropagation.
     * @returns The derivative of the sigmoid for this neuron's current output.
     */
    getSigmoidDerivative(): number {
        return this.sigmoidDerivative(this.output);
    }
}

/**
 * Represents a single layer of neurons in the neural network.
 */
class Layer {
    neurons: Neuron[]; // Array of neurons in this layer

    /**
     * Initializes a new Layer.
     * @param numNeurons The number of neurons in this layer.
     * @param numInputsPerNeuron The number of inputs each neuron in this layer receives
     *                           (i.e., the number of neurons in the previous layer).
     */
    constructor(numNeurons: number, numInputsPerNeuron: number) {
        this.neurons = Array.from({ length: numNeurons }, () => new Neuron(numInputsPerNeuron));
    }

    /**
     * Performs the feedforward calculation for all neurons in this layer.
     * @param inputs An array of numerical inputs from the previous layer or initial input.
     * @returns An array of outputs from all neurons in this layer.
     */
    feedForward(inputs: number[]): number[] {
        return this.neurons.map(neuron => neuron.activate(inputs));
    }
}

/**
 * Represents the complete feedforward neural network.
 * Handles network construction, feedforward propagation, and backpropagation training.
 */
class NeuralNetwork {
    layers: Layer[];           // Array of layers (hidden and output layers)
    learningRate: number;      // Step size for weight and bias adjustments during training
    private lastInput: number[]; // Stores the last input fed into the network, needed for backpropagation

    /**
     * Initializes a new NeuralNetwork.
     * @param inputNodes The number of input features (neurons in the conceptual input layer).
     * @param hiddenLayers A configuration array, where each number is the node count for a hidden layer.
     *                     e.g., [32] for one hidden layer with 32 nodes.
     * @param outputNodes The number of output neurons.
     * @param learningRate The learning rate for training.
     */
    constructor(inputNodes: number, hiddenLayers: number[], outputNodes: number, learningRate: number) {
        this.learningRate = learningRate;
        this.layers = [];

        // Build hidden layers based on the provided configuration
        let prevLayerNodes = inputNodes;
        for (const numNodes of hiddenLayers) {
            this.layers.push(new Layer(numNodes, prevLayerNodes));
            prevLayerNodes = numNodes; // The current layer's nodes become inputs for the next
        }

        // Build the output layer
        this.layers.push(new Layer(outputNodes, prevLayerNodes));
        this.lastInput = []; // Initialize lastInput
    }

    /**
     * Performs the feedforward pass through the entire network and stores the initial input.
     * This method calculates the network's output for a given input.
     * @param input An array of numerical inputs for the network.
     * @returns An array of predicted outputs from the network.
     */
    feedForwardWithStore(input: number[]): number[] {
        this.lastInput = input; // Store the initial input for use in backpropagation
        let outputs = input;    // The initial inputs become outputs for the "input layer"
        for (const layer of this.layers) {
            outputs = layer.feedForward(outputs); // Pass outputs of current layer as inputs to next
        }
        return outputs;
    }

    /**
     * Trains the neural network using the backpropagation algorithm.
     * Iterates over the training data for a specified number of epochs.
     * @param trainingData An array of objects, each containing an 'input' and 'output' array.
     * @param epochs The total number of training iterations over the entire dataset.
     */
    train(trainingData: { input: number[], output: number[] }[], epochs: number): void {
        for (let epoch = 0; epoch < epochs; epoch++) {
            for (const data of trainingData) {
                // Perform feedforward to get predictions and store the input
                const predictedOutputs = this.feedForwardWithStore(data.input);
                // Perform backpropagation to adjust weights and biases
                this.backpropagate(predictedOutputs, data.output);
            }
        }
    }

    /**
     * Implements the backpropagation algorithm to adjust weights and biases
     * based on the difference between predicted and expected outputs.
     * @param predictedOutputs The outputs generated by the network for the current input.
     * @param expectedOutputs The true target outputs for the current input.
     */
    private backpropagate(predictedOutputs: number[], expectedOutputs: number[]): void {
        // 1. Calculate deltas (error gradients) for the output layer
        const outputLayer = this.layers[this.layers.length - 1];
        for (let i = 0; i < outputLayer.neurons.length; i++) {
            const neuron = outputLayer.neurons[i];
            const error = expectedOutputs[i] - predictedOutputs[i]; // Simple error
            neuron.delta = error * neuron.getSigmoidDerivative();   // Delta is error scaled by derivative of activation
        }

        // 2. Calculate deltas for hidden layers, propagating error backwards
        // Iterate from the second-to-last layer (last hidden layer) down to the first hidden layer
        for (let l = this.layers.length - 2; l >= 0; l--) {
            const currentLayer = this.layers[l];
            const nextLayer = this.layers[l + 1];

            for (let i = 0; i < currentLayer.neurons.length; i++) {
                const neuron = currentLayer.neurons[i];
                let error = 0;
                // Sum the error contributions from all neurons in the next layer that this neuron feeds into
                for (let j = 0; j < nextLayer.neurons.length; j++) {
                    error += nextLayer.neurons[j].delta * nextLayer.neurons[j].weights[i];
                }
                neuron.delta = error * neuron.getSigmoidDerivative(); // Apply derivative of current neuron's activation
            }
        }

        // 3. Update weights and biases for all layers
        // Iterate from the first layer (first hidden layer) to the last layer (output layer)
        for (let l = 0; l < this.layers.length; l++) {
            const currentLayer = this.layers[l];
            // Determine inputs for the current layer:
            // If it's the first hidden layer (l=0), its inputs are the network's initial input (`this.lastInput`).
            // Otherwise, its inputs are the outputs from the previous layer (`this.layers[l - 1].neurons.map(n => n.output)`).
            const previousLayerOutputs = (l === 0) ? this.lastInput : this.layers[l - 1].neurons.map(n => n.output);

            for (const neuron of currentLayer.neurons) {
                // Update each weight
                for (let i = 0; i < neuron.weights.length; i++) {
                    neuron.weights[i] += this.learningRate * neuron.delta * previousLayerOutputs[i];
                }
                // Update bias
                neuron.bias += this.learningRate * neuron.delta;
            }
        }
    }
}

// --- Utility Functions for Data Conversion ---

/**
 * Converts an 8-digit binary string into an array of numbers (0 or 1).
 * Example: "01111010" -> [0, 1, 1, 1, 1, 0, 1, 0]
 * @param binaryString The binary string to convert.
 * @returns An array of numbers representing the binary digits.
 */
function binaryStringToArray(binaryString: string): number[] {
    return binaryString.split('').map(Number);
}

/**
 * Converts an array of numbers (typically neural network outputs between 0 and 1)
 * back to an 8-digit binary string by rounding each number to the nearest integer (0 or 1).
 * Example: [0.01, 0.99, 0.85, ...] -> "011..."
 * @param arr An array of numbers to convert.
 * @returns An 8-digit binary string.
 */
function arrayToBinaryString(arr: number[]): string {
    return arr.map(n => Math.round(n)).join('');
}

// --- Main Program Logic ---

// Read the first line of input: number of tests and number of training sets
const [testsCount, trainingSetsCount] = readline().split(' ').map(Number);

// Read all test inputs
const testInputStrings: string[] = [];
for (let i = 0; i < testsCount; i++) {
    testInputStrings.push(readline());
}

// Read all training data (input-output pairs)
const trainingData: { input: number[], output: number[] }[] = [];
for (let i = 0; i < trainingSetsCount; i++) {
    const [inputStr, outputStr] = readline().split(' ');
    trainingData.push({
        input: binaryStringToArray(inputStr),
        output: binaryStringToArray(outputStr)
    });
}

// --- Neural Network Configuration (Hyperparameters) ---
const INPUT_NODES = 8;  // Number of input bits
const OUTPUT_NODES = 8; // Number of output bits

// Configuration for hidden layers:
// We use one hidden layer with 32 neurons. This provides enough capacity to learn
// non-linear patterns like the bit-counting threshold observed in the examples.
const HIDDEN_LAYERS_CONFIG = [32];

// Learning rate: Controls how quickly the network adjusts its weights.
// 0.05 is a good balance for stability and reasonable training speed.
const LEARNING_RATE = 0.05;

// Number of epochs: How many times the entire training dataset is presented to the network.
// 50,000 epochs allow for thorough learning given the dataset size without excessive runtime.
const EPOCHS = 50000;

// Create and initialize the neural network with the defined configuration
const neuralNet = new NeuralNetwork(INPUT_NODES, HIDDEN_LAYERS_CONFIG, OUTPUT_NODES, LEARNING_RATE);

// Train the neural network using the provided training data
neuralNet.train(trainingData, EPOCHS);

// Make predictions for each test input and print the results
for (const testInputString of testInputStrings) {
    const inputArr = binaryStringToArray(testInputString);
    const predictedArr = neuralNet.feedForwardWithStore(inputArr); // Run feedforward for prediction
    print(arrayToBinaryString(predictedArr)); // Convert numerical output back to binary string and print
}