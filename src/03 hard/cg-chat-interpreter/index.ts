// Standard input reading boilerplate for TS on CodinGame
declare function readline(): string;
declare function print(message: string): void;
declare function printErr(message: string): void; // For debug output

// Global state variables
const goodNouns = new Set<string>();
const badNouns = new Set<string>();
const nickStacks = new Map<string, number[]>(); // Map nick (string) to stack (array of numbers)
const nickContexts = new Map<string, string>(); // Map speaker nick (string) to context nick (string)
const outputBuffer: number[] = [];

// Helper function to clean text: lowercase, remove punctuation, normalize spaces
function cleanText(text: string): string {
    return text
        .toLowerCase()
        .replace(/[.,!?;:'"()[\]{}]/g, '') // Remove common punctuation
        .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
        .trim(); // Trim leading/trailing spaces
}

// Helper to get stack for a nick, create if not exists
function getStack(nick: string): number[] {
    if (!nickStacks.has(nick)) {
        nickStacks.set(nick, []);
    }
    return nickStacks.get(nick)!;
}

// Helper to safely peek at the top of a stack, returning 0 if empty
function peekStack(stack: number[]): number {
    return stack.length > 0 ? stack[stack.length - 1] : 0;
}

// Function to resolve special constants ("me", "you"/"u", "*nick*")
function resolveSpecialConstant(
    token: string,
    speaker: string,
    currentContext: string | undefined
): number | undefined {
    if (token === "me") {
        return peekStack(getStack(speaker));
    }
    if (token === "you" || token === "u") {
        if (!currentContext) {
            // printErr(`Warning: 'you' used by ${speaker} without context. Returning 0.`);
            return 0; // As per typical CG behavior for uninitialized/empty values
        }
        return peekStack(getStack(currentContext));
    }
    // Check for *nick* format
    const nickMatch = token.match(/^\*(.*)\*$/);
    if (nickMatch) {
        const mentionedNick = cleanText(nickMatch[1]); // Ensure mentioned nick is cleaned
        return peekStack(getStack(mentionedNick));
    }
    return undefined; // Not a special constant
}

// Main function to evaluate a constant phrase string
function evaluateConstant(phrase: string, speaker: string, currentContext: string | undefined): number {
    const tokens = cleanText(phrase).split(' ').filter(t => t !== '');
    if (tokens.length === 0) {
        // printErr(`Warning: Empty constant phrase received. Returning 0.`);
        return 0;
    }

    // Attempt to parse arithmetic expressions first (prioritize binary operations, then unary)
    // The `lastIndexOf` approach helps prioritize the "outermost" expression in nested cases.

    // Try "A by B multiplied"
    const multIdx = tokens.lastIndexOf("multiplied");
    if (multIdx !== -1 && multIdx >= 2) { // Need at least "X by Y multiplied" (3 words minimum)
        const byIdx = tokens.lastIndexOf("by", multIdx - 1); // Search for "by" before "multiplied"
        if (byIdx !== -1 && byIdx > 0 && byIdx < multIdx - 1) { // Ensure C1, C2 exist between keywords
            const c1Phrase = tokens.slice(0, byIdx).join(' ');
            const c2Phrase = tokens.slice(byIdx + 1, multIdx).join(' ');
            return evaluateConstant(c1Phrase, speaker, currentContext) *
                   evaluateConstant(c2Phrase, speaker, currentContext);
        }
    }

    // Try "A but not B though"
    const thoughIdx = tokens.lastIndexOf("though");
    if (thoughIdx !== -1 && thoughIdx >= 3) { // Need at least "X but not Y though" (4 words minimum)
        const notIdx = tokens.lastIndexOf("not", thoughIdx - 1);
        if (notIdx !== -1 && notIdx >= 1) { // "not" must be before "though"
            const butIdx = tokens.lastIndexOf("but", notIdx - 1);
            if (butIdx !== -1 && butIdx > 0 && butIdx < notIdx - 1) { // Ensure C1, C2 exist
                const c1Phrase = tokens.slice(0, butIdx).join(' ');
                const c2Phrase = tokens.slice(notIdx + 1, thoughIdx).join(' ');
                return evaluateConstant(c1Phrase, speaker, currentContext) -
                       evaluateConstant(c2Phrase, speaker, currentContext);
            }
        }
    }

    // Try "A and B too"
    const tooIdx = tokens.lastIndexOf("too");
    if (tooIdx !== -1 && tooIdx >= 2) { // Need at least "X and Y too" (3 words minimum)
        const andIdx = tokens.lastIndexOf("and", tooIdx - 1);
        if (andIdx !== -1 && andIdx > 0 && andIdx < tooIdx - 1) { // Ensure C1, C2 exist
            const c1Phrase = tokens.slice(0, andIdx).join(' ');
            const c2Phrase = tokens.slice(andIdx + 1, tooIdx).join(' ');
            return evaluateConstant(c1Phrase, speaker, currentContext) +
                   evaluateConstant(c2Phrase, speaker, currentContext);
        }
    }

    // Try "A squared" (unary, postfix)
    if (tokens.length >= 2 && tokens[tokens.length - 1] === "squared") {
        const cPhrase = tokens.slice(0, tokens.length - 1).join(' ');
        const val = evaluateConstant(cPhrase, speaker, currentContext);
        return val * val;
    }

    // If no arithmetic operators found, it must be a primary constant
    // Primary constant: {a/an} {adjective(s)} {noun} OR {special_constant}

    // Check for special constants (single token) first
    if (tokens.length === 1) {
        const specialVal = resolveSpecialConstant(tokens[0], speaker, currentContext);
        if (specialVal !== undefined) {
            return specialVal;
        }
    }

    // Try simple noun phrase constant: {a/an} {adjective(s)} {noun}
    let startOfNounPhraseContent = 0;
    // Check for "a" or "an" at the very beginning of the constant phrase tokens
    if (tokens.length > 0 && (tokens[0] === "a" || tokens[0] === "an")) {
        startOfNounPhraseContent = 1; // Skip the article for adjective/noun search
    }

    let adjectives: string[] = [];
    let nounToken: string | undefined;
    let baseValue: number = 0;
    let nounFoundIdx = -1;

    // Find the noun in the remaining tokens after potential article
    for (let i = startOfNounPhraseContent; i < tokens.length; i++) {
        const token = tokens[i];
        if (goodNouns.has(token)) {
            nounToken = token;
            baseValue = 1;
            nounFoundIdx = i;
            break;
        } else if (badNouns.has(token)) {
            nounToken = token;
            baseValue = -1;
            nounFoundIdx = i;
            break;
        }
    }

    if (nounToken && nounFoundIdx !== -1) {
        // Collect adjectives: all words *between* `startOfNounPhraseContent` and `nounFoundIdx`.
        for (let i = startOfNounPhraseContent; i < nounFoundIdx; i++) {
            adjectives.push(tokens[i]);
        }
        return baseValue * (2 ** adjectives.length);
    }

    // Should not reach here if input is always a valid constant phrase.
    // printErr(`Error: Unable to parse constant phrase "${phrase}". Returning 0.`);
    return 0; // Default or error for unparsable constant
}


// --- Main Program Logic ---

const numGoodAndBad = readline().split(' ').map(Number);
const numGood = numGoodAndBad[0];
const numBad = numGoodAndBad[1];

// Read good nouns
if (numGood > 0) {
    readline().split(' ').forEach(noun => goodNouns.add(cleanText(noun)));
} else {
    readline(); // Consume empty line if numGood is 0
}

// Read bad nouns
if (numBad > 0) {
    readline().split(' ').forEach(noun => badNouns.add(cleanText(noun)));
} else {
    readline(); // Consume empty line if numBad is 0
}

const numLines = parseInt(readline());

let currentSpeaker: string = ""; // Stores the speaker from the most recent line

for (let i = 0; i < numLines; i++) {
    const rawLine = readline();
    let lineContent = rawLine.toLowerCase(); // Work with lowercase for parsing

    // 1. Extract speaker nick from the beginning of the line
    const speakerMatch = lineContent.match(/^<([^>]+)>/);
    if (speakerMatch) {
        currentSpeaker = cleanText(speakerMatch[1]);
        lineContent = lineContent.substring(speakerMatch[0].length).trim(); // Remove <nick> part
    } else {
        // If no speaker tag (e.g., observer comments without speaker), skip the line.
        // printErr(`Skipping line (no speaker tag): ${rawLine}`);
        continue;
    }

    // Determine the active context for this line.
    // It's the speaker's last set context, possibly overridden by an immediate context change.
    let activeSpeaker = currentSpeaker;
    let activeContext = nickContexts.get(activeSpeaker);

    // Process the remaining line content (after speaker tag)
    let commandCandidateTokens = cleanText(lineContent).split(' ').filter(t => t !== '');

    let processedImmediateContextChange = false;
    // 2. Check for immediate context change (e.g., `<speaker> *target* ...`)
    if (commandCandidateTokens.length > 0) {
        const firstToken = commandCandidateTokens[0];
        const initialContextNickMatch = firstToken.match(/^\*(.*)\*$/);
        if (initialContextNickMatch) {
            const mentionedNick = cleanText(initialContextNickMatch[1]);
            nickContexts.set(activeSpeaker, mentionedNick);
            activeContext = mentionedNick; // Use this new context for the current line
            commandCandidateTokens.shift(); // Remove the *nick* token from tokens for subsequent command parsing
            processedImmediateContextChange = true;
            // The rest of the line can still contain a command.
        }
    }

    // Now, `activeContext` reflects any immediate change.

    let commandFound = false;

    // Check for Assignment Command keywords
    const assignKeywords = ["youre", "your", "ur"];
    if (commandCandidateTokens.length > 0 && assignKeywords.includes(commandCandidateTokens[0])) {
        commandFound = true;
        const constantPhrase = commandCandidateTokens.slice(1).join(' '); // Everything after the keyword is the constant phrase
        const value = evaluateConstant(constantPhrase, activeSpeaker, activeContext);
        if (activeContext) {
            getStack(activeContext).push(value);
            // printErr(`DEBUG: ${activeSpeaker} -> ${activeContext} PUSH ${value}`);
        } else {
            // printErr(`WARNING: Assignment by ${activeSpeaker} failed: no context. Value: ${value}.`);
        }
    }
    // Check for Stack Commands
    else if (commandCandidateTokens.length > 0 && commandCandidateTokens[0] === "listen") {
        commandFound = true;
        if (activeContext) {
            const stack = getStack(activeContext);
            const val = peekStack(stack); // Gets 0 if stack is empty
            stack.push(val);
            // printErr(`DEBUG: ${activeSpeaker} -> ${activeContext} LISTEN (duplicate ${val})`);
        } else {
            // printErr(`WARNING: Listen by ${activeSpeaker} failed: no context.`);
        }
    } else if (commandCandidateTokens.length > 0 && commandCandidateTokens[0] === "forget") {
        commandFound = true;
        if (activeContext) {
            const stack = getStack(activeContext);
            if (stack.length > 0) {
                stack.pop();
                // printErr(`DEBUG: ${activeSpeaker} -> ${activeContext} FORGET (pop)`);
            }
        } else {
            // printErr(`WARNING: Forget by ${activeSpeaker} failed: no context.`);
        }
    } else if (commandCandidateTokens.length > 0 && commandCandidateTokens[0] === "flip") {
        commandFound = true;
        if (activeContext) {
            const stack = getStack(activeContext);
            if (stack.length >= 2) {
                const top = stack.pop()!;
                const second = stack.pop()!;
                stack.push(top);
                stack.push(second);
                // printErr(`DEBUG: ${activeSpeaker} -> ${activeContext} FLIP (${second} and ${top})`);
            }
        } else {
            // printErr(`WARNING: Flip by ${activeSpeaker} failed: no context.`);
        }
    }
    // Check for Output Command
    else if (commandCandidateTokens.length > 0 && (commandCandidateTokens[0] === "tell" || commandCandidateTokens[0] === "telling")) {
        commandFound = true;
        if (activeContext) {
            const stack = getStack(activeContext);
            const val = stack.length > 0 ? stack.pop()! : 0; // Pop value, or 0 if empty
            outputBuffer.push(val);
            // printErr(`DEBUG: ${activeSpeaker} -> ${activeContext} TELL (print ${val})`);
        } else {
            // If no context, the problem implies defaulting behavior (e.g. print 0)
            outputBuffer.push(0);
            // printErr(`WARNING: Tell by ${activeSpeaker} failed: no context. Printing 0.`);
        }
    }

    // If no explicit command (assignment, stack, output) was found,
    // and no immediate context change, check if it's a general context setting statement.
    if (!commandFound && !processedImmediateContextChange) {
        // The context setting statement pattern is: `<{nick}> {flavor text} *{nick}* {flavor text}`.
        // We look for *any* `*nick*` in the raw line content (after speaker tag).
        const contextSettingMatch = lineContent.match(/\*(.*)\*/);
        if (contextSettingMatch) {
            const mentionedNick = cleanText(contextSettingMatch[1]);
            nickContexts.set(activeSpeaker, mentionedNick);
            // printErr(`DEBUG: CONTEXT SET: ${activeSpeaker} -> ${mentionedNick} (from flavor text)`);
        } else {
            // If the speaker has no context AND the line contained no command AND no context setting, skip it.
            if (!nickContexts.has(activeSpeaker)) {
                // printErr(`Skipping line from ${activeSpeaker} (no context, no command, no explicit context set): ${rawLine}`);
            }
        }
    }
}

// Print final accumulated output values, separated by hyphens
print(outputBuffer.join('-'));