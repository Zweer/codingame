The task is to simulate a simplified version of the "Automaton2000" chat bot. This bot learns by building a word graph from chat logs and then generates sentences based on this graph when its name is mentioned.

Here's a breakdown of the approach:

1.  **Data Structure for the Word Graph:**
    We'll use a nested `Map` to represent the word graph. `Map<string, Map<string, number>>`.
    *   The outer `Map` maps a `previousWord` (a string) to another `Map`.
    *   The inner `Map` maps a `nextWord` (a string) to a `number` (its frequency count after `previousWord`).
    *   Special nodes: `__START__` represents the beginning of a sentence, and `__END__` represents the end of a sentence.

2.  **Processing Chat Lines (Learning Phase):**
    For each incoming chat line:
    *   **Extract the message:** The line format is `(HH:MM:SS) UserName: Message`. We need to parse out the `Message` part. The simplest way is to find the last colon (`:`) and take everything after it (plus the following space).
    *   **Tokenize words:** Split the extracted `Message` by spaces.
    *   **Filter words:**
        *   Remove any empty strings resulting from multiple spaces.
        *   Ignore the exact word "Automaton2000" itself.
    *   **Update the word graph:**
        *   If there are words in the message:
            *   Add a relationship from `__START__` to the first word.
            *   For every consecutive pair of words (`word1`, `word2`), add a relationship from `word1` to `word2`.
            *   Add a relationship from the last word to `__END__`.
        *   Each time a relationship is added, increment its count in the graph.

3.  **Generating Sentences:**
    If the current chat line (the raw input line) contains the string "Automaton2000", we must generate and print a sentence:
    *   Start the sentence generation from the `__START__` node.
    *   Iteratively select the next word:
        *   From the current word, look up all possible next words in the graph along with their counts.
        *   **Selection rule:** Choose the next word with the highest count.
        *   **Tie-breaking rule:** If multiple words have the same highest count, choose the one that comes first alphabetically (case-sensitive, uppercase first).
        *   Append the chosen word to the sentence.
        *   Set the chosen word as the `currentWord` for the next iteration.
    *   **Termination conditions:**
        *   Stop if the `__END__` node is chosen.
        *   Stop if there are no possible next words from the `currentWord`.
        *   Stop after 30 words to prevent infinite loops (as per puzzle rules).
    *   Finally, join the collected words with spaces and print the resulting string.

**Example Walkthrough (from problem description):**

Input:
```
3
(21:52:18) Magus: Hey MadKnight, did you improve your CSB AI recently?
(21:53:05) MadKnight: Hey Magus. Yes my CSB AI use a new genetic algorithm! And you?
(21:53:42) Magus: No i'm too busy trying to fix Automaton2000
```

1.  **Line 1:** `(21:52:18) Magus: Hey MadKnight, did you improve your CSB AI recently?`
    *   Message: `Hey MadKnight, did you improve your CSB AI recently?`
    *   Words: `Hey`, `MadKnight,`, `did`, `you`, `improve`, `your`, `CSB`, `AI`, `recently?`
    *   Graph updated: `__START__ -> Hey (1)`, `Hey -> MadKnight, (1)`, `MadKnight, -> did (1)`, ..., `AI -> recently? (1)`, `recently? -> __END__ (1)`.
    *   No "Automaton2000" in line, so no output.

2.  **Line 2:** `(21:53:05) MadKnight: Hey Magus. Yes my CSB AI use a new genetic algorithm! And you?`
    *   Message: `Hey Magus. Yes my CSB AI use a new genetic algorithm! And you?`
    *   Words: `Hey`, `Magus.`, `Yes`, `my`, `CSB`, `AI`, `use`, `a`, `new`, `genetic`, `algorithm!`, `And`, `you?`
    *   Graph updated: `__START__ -> Hey (now 2)`. `Hey -> Magus. (1)`. `CSB -> AI (now 2)`. `AI -> use (1)`. etc.
    *   No "Automaton2000" in line, so no output.

3.  **Line 3:** `(21:53:42) Magus: No i'm too busy trying to fix Automaton2000`
    *   Message: `No i'm too busy trying to fix` (`Automaton2000` is ignored)
    *   Words: `No`, `i'm`, `too`, `busy`, `trying`, `to`, `fix`
    *   Graph updated: `__START__ -> No (1)`, `No -> i'm (1)`, etc.
    *   **Contains "Automaton2000"**: Generate sentence.
        *   Start from `__START__`. Best word: `Hey` (count 2) vs `No` (count 1). Choose `Hey`.
        *   Current: `Hey`. Possible next: `MadKnight,` (1), `Magus.` (1). Tie. Alphabetical: `MadKnight,` comes before `Magus.`. Choose `MadKnight,`.
        *   Current: `MadKnight,`. Possible next: `did` (1). Choose `did`.
        *   ...
        *   Current: `CSB`. Possible next: `AI` (2). Choose `AI`.
        *   Current: `AI`. Possible next: `recently?` (1), `use` (1). Tie. Alphabetical: `recently?` comes before `use`. Choose `recently?`.
        *   Current: `recently?`. Possible next: `__END__` (1). Choose `__END__`.
        *   Sentence ends.
    *   Output: `Hey MadKnight, did you improve your CSB AI recently?`