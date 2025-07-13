// Define helper functions for direction changes
const sameDir = (dir: number) => dir;
const turnRight = (dir: number) => (dir + 1) % 4;
const turnLeft = (dir: number) => (dir + 3) % 4;
const turn180 = (dir: number) => (dir + 2) % 4;

// faceTransitions[currentFaceIdx][currentDirLeavingFace]
const faceTransitions: FaceConnection[][] = new Array(6).fill(null).map(() => new Array(4).fill(null));

// F1 (index 1) - Central face
faceTransitions[1][0] = { face: 2, getCoords: (r, c) => ({ r: currentN - 1, c }), getDir: sameDir }; // UP -> F2 DOWN
faceTransitions[1][1] = { face: 3, getCoords: (r, c) => ({ r, c: 0 }), getDir: sameDir }; // RIGHT -> F3 LEFT
faceTransitions[1][2] = { face: 4, getCoords: (r, c) => ({ r: 0, c }), getDir: sameDir }; // DOWN -> F4 UP
faceTransitions[1][3] = { face: 0, getCoords: (r, c) => ({ r, c: currentN - 1 }), getDir: sameDir }; // LEFT -> F0 RIGHT

// F0 (index 0) - Left of F1
faceTransitions[0][0] = { face: 2, getCoords: (r, c) => ({ r: c, c: 0 }), getDir: turnLeft }; // UP -> F2 LEFT, F0(0,c) to F2(c,0), UP(0) to LEFT(3)
faceTransitions[0][1] = { face: 1, getCoords: (r, c) => ({ r, c: 0 }), getDir: sameDir }; // RIGHT -> F1 LEFT
faceTransitions[0][2] = { face: 4, getCoords: (r, c) => ({ r: currentN - 1 - c, c: 0 }), getDir: turnLeft }; // DOWN -> F4 LEFT, F0(N-1,c) to F4(N-1-c,0), DOWN(2) to LEFT(3)
faceTransitions[0][3] = { face: 5, getCoords: (r, c) => ({ r: 0, c: currentN - 1 - r }), getDir: turnRight }; // LEFT -> F5 TOP, F0(r,0) to F5(0,N-1-r), LEFT(3) to UP(0)

// F3 (index 3) - Right of F1
faceTransitions[3][0] = { face: 2, getCoords: (r, c) => ({ r: currentN - 1 - c, c: currentN - 1 }), getDir: turnRight }; // UP -> F2 RIGHT, F3(0,c) to F2(N-1-c,N-1), UP(0) to RIGHT(1)
faceTransitions[3][1] = { face: 5, getCoords: (r, c) => ({ r: currentN - 1, c: currentN - 1 - r }), getDir: turnRight }; // RIGHT -> F5 DOWN, F3(r,N-1) to F5(N-1,N-1-r), RIGHT(1) to DOWN(2)
faceTransitions[3][2] = { face: 4, getCoords: (r, c) => ({ r: c, c: currentN - 1 }), getDir: turnRight }; // DOWN -> F4 RIGHT, F3(N-1,c) to F4(c,N-1), DOWN(2) to RIGHT(1)
faceTransitions[3][3] = { face: 1, getCoords: (r, c) => ({ r, c: currentN - 1 }), getDir: sameDir }; // LEFT -> F1 RIGHT

// F2 (index 2) - Above F1
faceTransitions[2][0] = { face: 5, getCoords: (r, c) => ({ r: currentN - 1, c: currentN - 1 - c }), getDir: turn180 }; // UP -> F5 DOWN, F2(0,c) to F5(N-1,N-1-c), UP(0) to DOWN(2)
faceTransitions[2][1] = { face: 3, getCoords: (r, c) => ({ r: 0, c: currentN - 1 - r }), getDir: turnLeft }; // RIGHT -> F3 UP, F2(r,N-1) to F3(0,N-1-r), RIGHT(1) to UP(0)
faceTransitions[2][2] = { face: 1, getCoords: (r, c) => ({ r: 0, c }), getDir: sameDir }; // DOWN -> F1 UP
faceTransitions[2][3] = { face: 0, getCoords: (r, c) => ({ r: 0, c: r }), getDir: turnRight }; // LEFT -> F0 UP, F2(r,0) to F0(0,r), LEFT(3) to UP(0)

// F4 (index 4) - Below F1
faceTransitions[4][0] = { face: 1, getCoords: (r, c) => ({ r: currentN - 1, c }), getDir: sameDir }; // UP -> F1 DOWN
faceTransitions[4][1] = { face: 3, getCoords: (r, c) => ({ r: currentN - 1, c: currentN - 1 - r }), getDir: turnLeft }; // RIGHT -> F3 DOWN, F4(r,N-1) to F3(N-1,N-1-r), RIGHT(1) to DOWN(2)
faceTransitions[4][2] = { face: 5, getCoords: (r, c) => ({ r: 0, c }), getDir: sameDir }; // DOWN -> F5 UP
faceTransitions[4][3] = { face: 0, getCoords: (r, c) => ({ r: currentN - 1, c: r }), getDir: turnRight }; // LEFT -> F0 DOWN, F4(r,0) to F0(N-1,r), LEFT(3) to DOWN(2)

// F5 (index 5) - Bottom-most
faceTransitions[5][0] = { face: 4, getCoords: (r, c) => ({ r: currentN - 1, c }), getDir: sameDir }; // UP -> F4 DOWN
faceTransitions[5][1] = { face: 3, getCoords: (r, c) => ({ r: currentN - 1 - r, c: currentN - 1 }), getDir: sameDir }; // RIGHT -> F3 RIGHT, F5(r,N-1) to F3(N-1-r,N-1), RIGHT(1) to RIGHT(1)
faceTransitions[5][2] = { face: 2, getCoords: (r, c) => ({ r: 0, c: currentN - 1 - c }), getDir: turn180 }; // DOWN -> F2 UP, F5(N-1,c) to F2(0,N-1-c), DOWN(2) to UP(0)
faceTransitions[5][3] = { face: 0, getCoords: (r, c) => ({ r: currentN - 1 - r, c: 0 }), getDir: sameDir }; // LEFT -> F0 LEFT, F5(r,0) to F0(N-1-r,0), LEFT(3) to LEFT(3)