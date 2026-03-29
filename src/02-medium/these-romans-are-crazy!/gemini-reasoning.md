The problem requires us to add two numbers given in Roman numerals and output their sum, also in Roman numerals. The input numbers and their sum are guaranteed to be between 1 and 4999 (inclusive). Specific rules for Roman numerals, including subtractive notation (IV, IX, XL, XC, CD, CM) and maximum repetitions (e.g., 'M' up to 4 times, 'I', 'X', 'C' up to 3 times, 'V', 'L', 'D' up to 1 time), are provided.

The solution can be broken down into three main steps:
1.  **Roman Numeral to Integer Conversion:** Parse the input Roman numeral strings (`Rom1`, `Rom2`) into their corresponding integer values.
2.  **Integer Addition:** Sum the two integer values obtained in the first step.
3.  **Integer to Roman Numeral Conversion:** Convert the resulting sum back into its Roman numeral representation.

### Step 1: Roman Numeral to Integer Conversion (`romanToInteger`)

The standard algorithm for converting Roman numerals to integers involves iterating through the Roman string from left to right. We maintain a mapping of Roman characters to their integer values.
When processing a character:
*   If the current character's value is less than the value of the next character (e.g., 'I' before 'V' in 'IV'), it signifies a subtractive case. In this scenario, the current character's value is *subtracted* from the total.
*   Otherwise, the current character's value is *added* to the total.

Example: For `IX`:
-   'I' (1) is encountered. The next character 'X' (10) has a greater value. So, 1 is subtracted from the total. (total = -1)
-   'X' (10) is encountered. There is no next character. So, 10 is added to the total. (total = -1 + 10 = 9)

### Step 2: Integer Addition

This is a straightforward sum of the two integers obtained from the conversion.

### Step 3: Integer to Roman Numeral Conversion (`integerToRoman`)

To convert an integer back to a Roman numeral, we use a greedy approach. We maintain a list of Roman numeral values and their symbols, sorted in descending order. This list *must* include the subtractive combinations (e.g., 900 for 'CM', 400 for 'CD', etc.) to ensure the most compact and correct Roman numeral representation.

We iterate through this sorted list:
*   For each Roman numeral value in the list, we check how many times it can be subtracted from the remaining integer value.
*   For each successful subtraction, we append the corresponding Roman symbol to our result string and update the remaining integer value.
*   We continue this process until the integer value becomes zero.

The problem specifically states that 'M' can appear up to 4 times (e.g., MMMM for 4000). Our greedy algorithm correctly handles this, as it will append 'M' four times if the number is 4000, before moving on to smaller values. Other constraints on repetitions (e.g., 'V' max 1, 'I' max 3) are also implicitly handled by including subtractive forms and processing larger values first. For instance, 'VV' would never be generated because 'X' (10) would be preferred for the value 10.

### Overall Structure

The program will:
1.  Define a mapping for Roman characters to integer values.
2.  Implement `romanToInteger` function.
3.  Implement `integerToRoman` function.
4.  Use `readline` to read the two Roman numeral strings from standard input.
5.  Call `romanToInteger` for both inputs, sum the results.
6.  Call `integerToRoman` on the sum.
7.  Print the final Roman numeral string to standard output.