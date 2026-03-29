The puzzle asks us to determine the musical interval (type and quality) between two given pitches. A pitch consists of a base note (A-G) and an optional accidental (`+` for sharp, `-` for flat).

Here's a breakdown of the approach:

**1. Note Representation and Semitone Distances:**
*   We map the natural notes (A, B, C, D, E, F, G) to numerical semitone values, starting A=0.
    *   A: 0
    *   B: 2 (A to B is a tone)
    *   C: 3 (B to C is a semitone)
    *   D: 5 (C to D is a tone)
    *   E: 7 (D to E is a tone)
    *   F: 8 (E to F is a semitone)
    *   G: 10 (F to G is a tone)
    *   (Next A would be 12, as G to A is a tone)
*   A sharp (`+`) increases the semitone value by 1.
*   A flat (`-`) decreases the semitone value by 1.

**2. Parsing Pitches:**
*   A function `parsePitch` extracts the base note and accidental from the input string (e.g., `C` -> `C`, `0`; `B-` -> `B`, `-1`; `F+` -> `F`, `1`).

**3. Determining Interval Type:**
*   The interval type (e.g., "third", "fifth") is determined by counting the number of letter names from the `from` note to the `to` note, inclusive.
    *   Example: C to E -> C(1), D(2), E(3) -> Third.
    *   Example: B to F -> B(1), C(2), D(3), E(4), F(5) -> Fifth.
*   We use the `NOTE_ORDER` array (`A`, `B`, `C`, `D`, `E`, `F`, `G`) to get the numerical index of each base note.
*   The calculation `(toBaseIdx - fromBaseIdx + (toBaseIdx < fromBaseIdx ? 7 : 0)) + 1` correctly handles wrapping around the octave (e.g., G to C is a fourth) and assigns types 1-7.
*   Special case for Octave: The problem states "prime between two notes of the same pitch" and "octave between two same-named notes a full scale apart". The input format doesn't distinguish between `C` and `next C`. However, the example `A to next A: perfect octave` implies an octave is a distinct type (8). The constraint "smallest strictly rising interval" means `C C` should be a prime (type 1). Therefore, an octave (type 8) is identified only if the calculated type is 1 (prime) AND the total semitone difference is exactly 12.

**4. Calculating Actual Semitone Difference:**
*   For each pitch, we determine its absolute semitone value (natural note semitones + accidental adjustment).
*   The difference `toSemitones - fromSemitones` gives the raw semitone span.
*   If the `to` base note's index is less than the `from` base note's index (e.g., G to C), it means the `to` note is in the next octave, so we add 12 semitones to the difference. This ensures the `actualSemitoneDiff` always represents the smallest rising interval.

**5. Determining Interval Quality:**
*   The quality (e.g., "major", "perfect", "diminished") is determined by comparing the `actualSemitoneDiff` to a reference semitone span for that interval type.
*   We define `INTERVAL_PROPERTIES` which stores for each interval type (1st to 8th):
    *   `name`: The name of the interval type (e.g., 'third').
    *   `baseSemitones`: The semitone span of the natural reference interval (e.g., A to C for a third is 3 semitones).
    *   `baseQuality`: The quality name of this reference interval (e.g., 'minor' for A to C).
    *   `qualityScale`: An ordered array of possible qualities for this specific interval type (e.g., `['diminished', 'minor', 'major', 'augmented']` for thirds).
*   **The core logic for quality:**
    1.  Find the `baseQuality` (e.g., `minor`) within its `qualityScale` (e.g., `['diminished', 'minor', 'major', 'augmented']`). This gives its `refQualityIndex` (e.g., `1` for `minor`).
    2.  Calculate the `semitoneDelta`: `actualSemitoneDiff - refSemitones`. This value represents how much the actual interval deviates in semitones from the reference interval.
    3.  Add `semitoneDelta` to `refQualityIndex` to get `finalQualityIndex`. This correctly translates semitone expansion/contraction into quality changes as described in the puzzle rules (e.g., +1 semitone means "expand to next available quality").
    4.  Retrieve the `quality` string from `qualityScale` using `finalQualityIndex`.

**Example Walkthrough (C to E):**
1.  **Parse Pitches:** `from: {baseNote: 'C', accidental: 0}`, `to: {baseNote: 'E', accidental: 0}`
2.  **Determine Type:** `fromBaseIdx=2`, `toBaseIdx=4`. `intervalTypeRaw = (4 - 2 + 0) + 1 = 3` (Third).
3.  **Calculate Semitone Diff:** `actualSemitoneDiff = (NATURAL_SEMITONES['E'] + 0) - (NATURAL_SEMITONES['C'] + 0) = 7 - 3 = 4`.
4.  **Refine Type:** `intervalTypeRaw` is 3, not 1, so `finalIntervalType` remains 3.
5.  **Determine Quality:**
    *   `intervalProps` for type 3: `name: 'third', baseSemitones: 3, baseQuality: 'minor', qualityScale: ['diminished', 'minor', 'major', 'augmented']`.
    *   `refSemitones = 3`.
    *   `refQualityIndex = qualityScale.indexOf('minor') = 1`.
    *   `semitoneDelta = actualSemitoneDiff - refSemitones = 4 - 3 = 1`.
    *   `finalQualityIndex = refQualityIndex + semitoneDelta = 1 + 1 = 2`.
    *   `quality = qualityScale[2] = 'major'`.
6.  **Output:** `major third`

This logic fully implements the rules provided in the puzzle description, including the nuanced shifting and accidental effects on quality.