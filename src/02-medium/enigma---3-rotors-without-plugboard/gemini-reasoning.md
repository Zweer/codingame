The Enigma machine puzzle requires simulating its core components: three rotors and a reflector, without a plugboard. The key challenges are accurately modeling the rotor wiring and positions, the signal path (forward and reverse through the rotors), and the complex rotor stepping mechanism.

### 1. Core Concepts & Data Structures

*   **Alphabet Mapping**: Letters 'A' through 'Z' are mapped to integers 0 through 25 for easier calculation.
    *   `charToInt(char: string)`: Converts 'A' to 0, 'B' to 1, ..., 'Z' to 25.
    *   `intToChar(int: number)`: Converts 0 to 'A', 1 to 'B', ..., 25 to 'Z'.

*   **Wiring Representation**: Each rotor and the reflector have internal wiring. This is represented as an array `number[]` of size 26, where `wiring[i] = j` means input contact `i` connects to output contact `j`.
    *   For rotors, we also need an `inverseWiring` array for the reverse pass: `inverseWiring[j] = i` if `wiring[i] = j`.
    *   The `parseWiresInput` helper function reads the `X-Y` pairs and populates both `wiring` and `inverseWiring` arrays.

*   **Rotor State**:
    *   `initialWiring`: The fixed internal mapping of the rotor.
    *   `inverseWiring`: The inverse mapping, used for the reverse pass.
    *   `triggerPosition`: The specific letter (0-25) at which the rotor "notches" to trigger the next rotor's movement.
    *   `currentPosition`: The current 'A' position (0-25) of the rotor, indicating its rotation state.

### 2. Rotor Stepping Mechanism

The rules for rotor rotation are crucial and slightly differ from the simplest Enigma models:
*   **Rotation Timing**: All rotations for a key press occur *before* the letter is encoded.
*   **Rotor 1**: Always rotates by one position when a key is pressed.
*   **Rotor 2**: Rotates if Rotor 1 *was* at its `triggerPosition` immediately *before* Rotor 1's current step.
*   **Rotor 3**: Rotates if Rotor 2 *was* at its `triggerPosition` immediately *before* Rotor 2's potential step (due to R1 or its own notch). If Rotor 3 rotates, Rotor 2 also rotates an *additional* time (this is known as "double stepping").

To implement this, we must capture the positions of Rotor 1 and Rotor 2 *before* any of them move for the current key press. Then, based on these "before" positions, we apply the rotations in a specific order:
1.  Check if Rotor 2 is at its notch (`r2_pos_before === r2_trigger_pos`). This determines if Rotor 3 (and Rotor 2 again) will step.
2.  Check if Rotor 1 is at its notch (`r1_pos_before === r1_trigger_pos`). This determines if Rotor 2 will step.
3.  Rotor 1 increments its position.
4.  If `r1_will_step_r2` was true, Rotor 2 increments its position.
5.  If `r2_will_step_r3_and_itself` was true, Rotor 2 increments its position *again*, and Rotor 3 increments its position.

### 3. Signal Path through Rotors and Reflector

The signal path for a character `C` involves several transformations:

*   **Forward Pass (Entry -> Rotor 1 -> Rotor 2 -> Rotor 3 -> Reflector)**:
    For a character `charIndex` entering a rotor `R` at `currentPosition` and having `initialWiring`:
    1.  The signal enters the rotor at an effective contact determined by `(charIndex + R.currentPosition) % 26`.
    2.  This effective contact is mapped through the rotor's `initialWiring` to get an intermediate output contact: `wiredOutput = R.initialWiring[effectiveContact]`.
    3.  This intermediate output is then adjusted back to the machine's fixed alphabet by `(wiredOutput - R.currentPosition + 26) % 26`. The `+ 26` ensures a positive result before the modulo operation.

*   **Reflector**: The signal from Rotor 3 passes through the reflector's `wiring`. This is a simple lookup `reflector[charIndex]`, as the reflector is reciprocal and does not rotate.

*   **Reverse Pass (Reflector -> Rotor 3 -> Rotor 2 -> Rotor 1 -> Output)**:
    For a character `charIndex` coming back from the reflector side into a rotor `R` at `currentPosition` and having `inverseWiring`:
    1.  The signal effectively enters the rotor from the right, mapping it to an internal contact related to `(charIndex + R.currentPosition) % 26`.
    2.  This internal contact is then mapped through the rotor's `inverseWiring` to find the original input contact on the internal wiring: `internalWiredInput = R.inverseWiring[internalReflectedInput]`.
    3.  This internal input is then adjusted back to the machine's fixed alphabet: `(internalWiredInput - R.currentPosition + 26) % 26`.

### 4. Implementation Structure

The `EnigmaMachine` class encapsulates the rotors, reflector, and all the logic for rotation and encoding.
*   The constructor initializes the rotors with their parsed wiring, trigger positions, and starting positions.
*   `rotateRotors()` implements the stepping logic.
*   `passThroughRotorForward()` and `passThroughRotorReverse()` handle the signal transformations.
*   `encipherChar()` orchestrates the entire process for a single character: rotate, forward pass, reflector, reverse pass.
*   `encipherMessage()` iterates through the input message, calling `encipherChar()` for each character.

### Example Walkthrough (from Problem Description)

The detailed walkthrough of the first character 'X' in the reasoning section confirms that the implemented rotation and signal path logic correctly matches the problem's example explanation.