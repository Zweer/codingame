type DartThrow = {
    type: 'S' | 'D' | 'T';
    value: number; // Base value (e.g., 20 for T20)
    points: number; // Actual points scored (e.g., 60 for T20)
};

const allPossibleThrows: DartThrow[] = [];
// Populate with S1-S20, S25
// Populate with D1-D20, D25
// Populate with T1-T20