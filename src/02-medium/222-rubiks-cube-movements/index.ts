interface CubeState {
    F: string[][]; // Front
    B: string[][]; // Back
    R: string[][]; // Right
    L: string[][]; // Left
    U: string[][]; // Up
    D: string[][]; // Down
}

let cube: CubeState = {
    F: [['F', 'F'], ['F', 'F']],
    B: [['B', 'B'], ['B', 'B']],
    R: [['R', 'R'], ['R', 'R']],
    L: [['L', 'L'], ['L', 'L']],
    U: [['U', 'U'], ['U', 'U']],
    D: [['D', 'D'], ['D', 'D']],
};