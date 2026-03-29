// Standard input reading boilerplate for CodinGame
let inputString: string = '';
let currentLine: number = 0;

process.stdin.on('data', function(chunk: string) {
    inputString += chunk;
});

process.stdin.on('end', function() {
    inputString = inputString.trim().split('\n').map(str => str.trim());
    main();
});

function readLine(): string {
    return inputString[currentLine++];
}

function main() {
    const R: number = parseInt(readLine());

    let minPossible: number = 1;
    let maxPossible: number = 100;
    let cheated: boolean = false;

    for (let i = 1; i <= R; i++) {
        const line: string = readLine();
        const parts: string[] = line.split(' ');
        const guess: number = parseInt(parts[0]);
        const response: string = parts[1];

        if (response === "too high") {
            maxPossible = Math.min(maxPossible, guess - 1);
        } else if (response === "too low") {
            minPossible = Math.max(minPossible, guess + 1);
        } else if (response === "right on") {
            // Alice claimed 'guess' is the number.
            // First, check if 'guess' is consistent with the range established by all previous rounds.
            // At this point, minPossible and maxPossible represent that valid range.
            if (guess < minPossible || guess > maxPossible) {
                // 'guess' was already ruled out by prior responses. Alice cheated.
                console.log(`Alice cheated in round ${i}`);
                cheated = true;
                break; // Exit loop early
            }
            // If 'guess' is consistent with previous rounds, the possible range collapses to just 'guess'.
            minPossible = guess;
            maxPossible = guess;
        }

        // After updating the range based on the current round's response,
        // check if the range has become invalid (minPossible > maxPossible).
        // This indicates a contradiction (e.g., if 'too high' reduces maxPossible below minPossible).
        if (minPossible > maxPossible) {
            console.log(`Alice cheated in round ${i}`);
            cheated = true;
            break; // Exit loop early
        }
    }

    if (!cheated) {
        console.log("No evidence of cheating");
    }
}