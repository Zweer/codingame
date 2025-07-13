The goal is to convert a text-based representation of a table into HTML `<table>` format. The input uses `+`, `-`, and `|` characters to define the table structure and cell boundaries, while cell content is placed between `|` characters. Multiple lines of data within a single cell should be joined by spaces in the HTML output, and leading/trailing spaces in cell content should be trimmed.

Here's the step-by-step reasoning:

1.  **Input Reading**: Read the integer `N` (number of lines) first, then read the `N` subsequent string lines into an array. We use `readline` for this, which is typical in Node.js-based competitive programming environments.

2.  **Determine Column Boundaries**:
    *   The `+` characters in the horizontal separator lines (e.g., `+-------+`) define the column structure.
    *   We need to find the first line that defines this structure. This line typically starts with `+` and contains `-` characters.
    *   Once identified, iterate through this line to find all indices of `+` characters. These indices mark the "corners" of the cells.
    *   For any two consecutive `+` indices (`idx1` and `idx2`), the content for that column will reside between `idx1 + 1` and `idx2 - 1` in the content lines. Store these `start` and `end` indices for each column.

3.  **Process Content and Build HTML**:
    *   Initialize an empty array `htmlOutput` and add the opening `<table>` tag.
    *   Maintain a `Map` (e.g., `currentHtmlRowCellContents`) to accumulate content for cells within the *current* HTML table row (`<tr>`). The map's keys will be column indices, and values will be arrays of strings, where each string is a line of content read from the input for that specific cell.
    *   Iterate through each input line:
        *   **If the line starts with `+`**: This signifies a horizontal separator, meaning the end of a logical HTML row.
            *   If `currentHtmlRowCellContents` contains any collected data (meaning we've processed at least one content line for the current HTML row), then:
                *   Start a new `<tr>` tag.
                *   For each column defined by `columnBoundaries`:
                    *   Retrieve all collected content parts for that cell from `currentHtmlRowCellContents`.
                    *   Join these parts with a single space (`' '`) and `trim()` the result to handle multiple content lines and remove extraneous spaces.
                    *   Wrap the combined content in `<td>` and `</td>` tags.
                *   Close the `<tr>` tag and push the complete `<tr>...</tr>` string to `htmlOutput`.
            *   Clear `currentHtmlRowCellContents` to prepare for the next HTML row.
        *   **If the line starts with `|`**: This is a content line.
            *   For each column defined in `columnBoundaries`:
                *   Extract the substring of the current line using the `start` and `end` indices determined earlier.
                *   `trim()` this extracted content.
                *   If the trimmed content is not empty, add it to the corresponding `string[]` array in `currentHtmlRowCellContents` for that column. If it's the first content for that cell, initialize the array.

4.  **Finalize Output**: After processing all input lines, add the closing `</table>` tag to `htmlOutput`. Finally, print each line in `htmlOutput`.

This approach correctly handles variable numbers of columns, multiple lines of content within a single cell, and trimming of spaces, matching the problem requirements and example. The assumption is that input always represents a complete, well-formed table structure, starting and ending with horizontal `+` lines, as implied by the problem constraints and example.