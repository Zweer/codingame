import * as readline from 'readline';

async function solve() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let N: number = 0;
    const inputLines: string[] = [];
    let lineNumber = 0;

    // Read input lines
    for await (const line of rl) {
        if (lineNumber === 0) {
            N = parseInt(line, 10);
        } else {
            inputLines.push(line);
        }
        lineNumber++;
        if (lineNumber > N) {
            rl.close();
        }
    }

    const htmlOutput: string[] = [];
    htmlOutput.push("<table>");

    // Step 1: Determine column boundaries from the first horizontal separator line.
    // This line defines where columns start and end.
    let columnBoundaries: { start: number; end: number }[] = [];
    // Find the first line that starts with '+' and contains '-' to ensure it's a structural line.
    const firstPlusLine = inputLines.find(line => line.startsWith('+') && line.includes('-'));

    if (firstPlusLine) {
        const plusIndices: number[] = [];
        for (let i = 0; i < firstPlusLine.length; i++) {
            if (firstPlusLine[i] === '+') {
                plusIndices.push(i);
            }
        }

        // Each pair of consecutive '+' characters defines a column.
        // The content for a cell in that column will be between `plusIndices[i]+1` and `plusIndices[i+1]-1`.
        for (let i = 0; i < plusIndices.length - 1; i++) {
            const start = plusIndices[i] + 1;
            const end = plusIndices[i+1] - 1;
            // Add boundary only if there's actual space for content (e.g., `+--+` has content space, `++` doesn't)
            if (start <= end) {
                columnBoundaries.push({ start, end });
            }
        }
    }
    
    // Map to store collected content lines for each cell in the current HTML row.
    // Key: columnIndex, Value: Array of content strings
    const currentHtmlRowCellContents: Map<number, string[]> = new Map();

    // Step 2: Iterate through input lines to extract cell content and build HTML.
    for (const line of inputLines) {
        if (line.startsWith('+')) {
            // This is a horizontal separator. It indicates the end of a logical HTML row.
            // If we've collected content, generate the <tr> and <td> tags.
            if (currentHtmlRowCellContents.size > 0) {
                let trContent = "<tr>";
                // Iterate through expected columns based on determined boundaries
                for (let i = 0; i < columnBoundaries.length; i++) {
                    const contentParts = currentHtmlRowCellContents.get(i) || [];
                    // Join multiple lines of content with a space and then trim the result.
                    // This handles the requirement "carriage returns between lines are replaced by spaces"
                    // and "Spaces before and after data of each line are ignored."
                    const combinedContent = contentParts.join(' ').trim();
                    trContent += `<td>${combinedContent}</td>`;
                }
                trContent += "</tr>";
                htmlOutput.push(trContent);
                currentHtmlRowCellContents.clear(); // Clear for the next HTML row
            }
        } else if (line.startsWith('|')) {
            // This is a content line. Extract content for each cell defined by columnBoundaries.
            for (let i = 0; i < columnBoundaries.length; i++) {
                const { start, end } = columnBoundaries[i];
                // Extract the substring for the current cell. `end + 1` because substring end is exclusive.
                // `.trim()` removes leading/trailing spaces for the current line's content.
                const cellText = line.substring(start, end + 1).trim();

                // Only store non-empty `cellText` parts to avoid adding empty strings for empty lines,
                // which might otherwise lead to extra spaces when combined later.
                if (cellText.length > 0) {
                    if (!currentHtmlRowCellContents.has(i)) {
                        currentHtmlRowCellContents.set(i, []);
                    }
                    currentHtmlRowCellContents.get(i)!.push(cellText);
                }
            }
        }
        // Lines that are neither '+' nor '|' (if any, though not specified by problem) are implicitly ignored.
    }

    // Add the closing table tag.
    htmlOutput.push("</table>");

    // Print all collected HTML lines.
    htmlOutput.forEach(outputLine => console.log(outputLine));
}

solve();