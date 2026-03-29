// Standard library for CodinGame
declare function readline(): string;
declare function print(message: string): void;

/**
 * Represents a musical pitch with its base note and accidental.
 */
interface Pitch {
    baseNote: string;
    accidental: number; // 0 for natural, 1 for sharp (+), -1 for flat (-)
}

// Order of natural notes used for determining interval type (counting letter names)
const NOTE_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// Semitone values for natural notes, starting with A = 0.
// This mapping is derived from the puzzle's definition of tones (2 semitones) and semitones (1 semitone)
// between consecutive natural notes.
const NATURAL_SEMITONES: Record<string, number> = {
    'A': 0, // A
    'B': 2, // A-B is a tone (+2)
    'C': 3, // B-C is a semitone (+1)
    'D': 5, // C-D is a tone (+2)
    'E': 7, // D-E is a tone (+2)
    'F': 8, // E-F is a semitone (+1)
    'G': 10 // F-G is a tone (+2)
};

// Properties for each interval type (1st to 8th).
// - name: The common name of the interval type.
// - baseSemitones: The semitone span of the natural A-based reference interval.
// - baseQuality: The quality string for this reference interval.
// - qualityScale: An ordered array of possible quality names for this specific type.
//   The index in this array is adjusted based on semitone deviation from the reference.
const INTERVAL_PROPERTIES: Record<number, {
    name: string;
    baseSemitones: number;
    baseQuality: string;
    qualityScale: string[];
}> = {
    // Prime (1st): A to A
    1: { name: 'prime', baseSemitones: 0, baseQuality: 'perfect', qualityScale: ['diminished', 'perfect', 'augmented'] },
    // Second (2nd): A to B
    2: { name: 'second', baseSemitones: 2, baseQuality: 'major', qualityScale: ['diminished', 'minor', 'major', 'augmented'] },
    // Third (3rd): A to C
    3: { name: 'third', baseSemitones: 3, baseQuality: 'minor', qualityScale: ['diminished', 'minor', 'major', 'augmented'] },
    // Fourth (4th): A to D
    4: { name: 'fourth', baseSemitones: 5, baseQuality: 'perfect', qualityScale: ['diminished', 'perfect', 'augmented'] },
    // Fifth (5th): A to E
    5: { name: 'fifth', baseSemitones: 7, baseQuality: 'perfect', qualityScale: ['diminished', 'perfect', 'augmented'] },
    // Sixth (6th): A to F
    6: { name: 'sixth', baseSemitones: 8, baseQuality: 'minor', qualityScale: ['diminished', 'minor', 'major', 'augmented'] },
    // Seventh (7th): A to G
    7: { name: 'seventh', baseSemitones: 10, baseQuality: 'minor', qualityScale: ['diminished', 'minor', 'major', 'augmented'] },
    // Octave (8th): A to next A
    8: { name: 'octave', baseSemitones: 12, baseQuality: 'perfect', qualityScale: ['diminished', 'perfect', 'augmented'] },
};

/**
 * Parses a pitch string (e.g., "C", "B-", "F+") into its base note and accidental.
 * @param pitchStr The input pitch string.
 * @returns A Pitch object.
 */
function parsePitch(pitchStr: string): Pitch {
    const baseNote = pitchStr[0];
    let accidental = 0;
    if (pitchStr.length > 1) {
        if (pitchStr[1] === '+') {
            accidental = 1; // Sharp
        } else if (pitchStr[1] === '-') {
            accidental = -1; // Flat
        }
    }
    return { baseNote, accidental };
}

/**
 * Solves the Musical Intervals puzzle.
 */
function solve() {
    const N: number = parseInt(readline()); // Number of intervals to process

    for (let i = 0; i < N; i++) {
        const line = readline().split(' ');
        const fromPitchStr = line[0];
        const toPitchStr = line[1];

        const fromPitch = parsePitch(fromPitchStr);
        const toPitch = parsePitch(toPitchStr);

        const fromBaseIdx = NOTE_ORDER.indexOf(fromPitch.baseNote);
        const toBaseIdx = NOTE_ORDER.indexOf(toPitch.baseNote);

        // 1. Determine the raw interval type (1-7 based on letter counting).
        // This counts how many note letters are spanned, starting from 1 for the 'from' note.
        let intervalTypeRaw: number;
        if (fromBaseIdx === toBaseIdx) {
            // If base notes are the same (e.g., C to C), it's initially considered a Prime.
            intervalTypeRaw = 1; 
        } else {
            // Calculate type for different base notes (e.g., C to E is a Third).
            // Handles wrapping around the octave (e.g., G to C is a Fourth).
            intervalTypeRaw = (toBaseIdx - fromBaseIdx + (toBaseIdx < fromBaseIdx ? 7 : 0)) + 1;
        }

        // 2. Calculate the actual semitone difference between the two pitches.
        let actualSemitoneDiff = (NATURAL_SEMITONES[toPitch.baseNote] + toPitch.accidental) -
                                 (NATURAL_SEMITONES[fromPitch.baseNote] + fromPitch.accidental);
        
        // Adjust semitone difference if the 'to' note's base alphabetical position is before 'from'.
        // This means 'to' is in the next octave (e.g., G to C, C is higher than G).
        // This ensures we calculate the "smallest strictly rising interval".
        if (toBaseIdx < fromBaseIdx) {
            actualSemitoneDiff += 12; // Add a full octave (12 semitones)
        }

        // 3. Refine interval type to 8 (octave) if it's a prime (type 1) that spans exactly 12 semitones.
        // This addresses the "A to next A: perfect octave" example, where a prime (same letter name)
        // becomes an octave if it covers a full scale.
        let finalIntervalType = intervalTypeRaw;
        if (intervalTypeRaw === 1 && actualSemitoneDiff === 12) {
            finalIntervalType = 8; // It's an octave, not a prime
        }

        // Retrieve properties for the determined interval type.
        const intervalProps = INTERVAL_PROPERTIES[finalIntervalType];
        
        // 4. Calculate the quality based on semitone deviation from the reference interval.
        const refSemitones = intervalProps.baseSemitones;
        const refQualityIndex = intervalProps.qualityScale.indexOf(intervalProps.baseQuality);
        
        // The difference in semitones directly translates to a shift in quality index.
        const semitoneDelta = actualSemitoneDiff - refSemitones;
        let finalQualityIndex = refQualityIndex + semitoneDelta;

        // Ensure the quality index stays within the bounds of the quality scale array.
        // The puzzle constraints imply this won't go out of bounds for valid inputs.
        finalQualityIndex = Math.max(0, Math.min(finalQualityIndex, intervalProps.qualityScale.length - 1));

        const quality = intervalProps.qualityScale[finalQualityIndex];
        const typeName = intervalProps.name;

        // Output the fully-qualified interval.
        print(`${quality} ${typeName}`);
    }
}

solve();