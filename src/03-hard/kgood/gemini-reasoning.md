The problem asks us to find the length of the longest substring of a given string `S` that contains no more than `K` distinct lowercase English characters. This is a classic "longest substring with K distinct characters" problem, which can be efficiently solved using the sliding window technique.

**Reasoning:**

1.  **Sliding Window Approach:** We maintain a window `[left, right]` within the string `S`. The goal is to expand this window to the right as much as possible while ensuring the condition (at most `K` distinct characters) is met. If the condition is violated, we shrink the window from the left until the condition is met again.

2.  **Maintaining Distinct Characters and Counts:** To efficiently check the distinct character count and manage it, we use a frequency map (or an array for fixed alphabet size). For lowercase English letters, an array of size 26 (`charCounts`) is perfect. `charCounts[i]` will store the count of the `i`-th letter ('a' at index 0, 'b' at index 1, etc.) within the current window. We also maintain a `distinctCount` variable to quickly know how many unique characters are in the window.

3.  **Algorithm Steps:**
    *   Initialize `maxLength = 0`, `left = 0`.
    *   Initialize `charCounts` array of size 26 with all zeros.
    *   Initialize `distinctCount = 0`.
    *   Iterate `right` from `0` to `S.length - 1`:
        *   Add `S[right]` to the window:
            *   Get the character's index (`S[right].charCodeAt(0) - 'a'.charCodeAt(0)`).
            *   If `charCounts[index]` is `0` (meaning this character is new to the window), increment `distinctCount`.
            *   Increment `charCounts[index]`.
        *   **Shrink the window if necessary:** While `distinctCount > K`:
            *   Remove `S[left]` from the window:
                *   Get the character's index (`S[left].charCodeAt(0) - 'a'.charCodeAt(0)`).
                *   Decrement `charCounts[index]`.
                *   If `charCounts[index]` becomes `0` (meaning this character is no longer in the window), decrement `distinctCount`.
            *   Move the left pointer: `left++`.
        *   **Update `maxLength`:** After the `while` loop, the window `[left, right]` is KGood. Calculate its length (`right - left + 1`) and update `maxLength = Math.max(maxLength, current_window_length)`.
    *   After iterating through the entire string, `maxLength` will hold the length of the longest KGood substring.

4.  **Time and Space Complexity:**
    *   **Time Complexity: O(N)**, where N is the length of the string S. Both `left` and `right` pointers traverse the string at most once. Operations inside the loops (array access, arithmetic) are O(1).
    *   **Space Complexity: O(1)**. The `charCounts` array has a fixed size of 26, independent of the input string length.

**Example Trace (`S = "aaaaabcdef"`, `K = 3`):**

| right | char `S[right]` | `charCounts` (relevant part) | `distinctCount` | `left` | Window | `maxLength` | Notes                                          |
| :---- | :-------------- | :--------------------------- | :-------------- | :----- | :----- | :---------- | :--------------------------------------------- |
| 0     | 'a'             | `{'a':1}`                    | 1               | 0      | "a"    | 1           |                                                |
| 1     | 'a'             | `{'a':2}`                    | 1               | 0      | "aa"   | 2           |                                                |
| 2     | 'a'             | `{'a':3}`                    | 1               | 0      | "aaa"  | 3           |                                                |
| 3     | 'a'             | `{'a':4}`                    | 1               | 0      | "aaaa" | 4           |                                                |
| 4     | 'a'             | `{'a':5}`                    | 1               | 0      | "aaaaa" | 5           |                                                |
| 5     | 'b'             | `{'a':5, 'b':1}`             | 2               | 0      | "aaaaab" | 6           |                                                |
| 6     | 'c'             | `{'a':5, 'b':1, 'c':1}`      | 3               | 0      | "aaaaabc" | 7           | `distinctCount` is now 3 (KGood)             |
| 7     | 'd'             | `{'a':5, 'b':1, 'c':1, 'd':1}` | 4               | 0      | "aaaaabcd" | 7           | `distinctCount` is 4 (>K). Shrink:             |
|       |                 | `{'a':4, 'b':1, 'c':1, 'd':1}` | 4               | 1      | "aaaabcd" | 7           | `S[0]`='a' removed. `distinctCount` still 4. |
|       |                 | `{'a':3, 'b':1, 'c':1, 'd':1}` | 4               | 2      | "aaabcd" | 7           | `S[1]`='a' removed. `distinctCount` still 4. |
|       |                 | `{'a':2, 'b':1, 'c':1, 'd':1}` | 4               | 3      | "aabcd" | 7           | `S[2]`='a' removed. `distinctCount` still 4. |
|       |                 | `{'a':1, 'b':1, 'c':1, 'd':1}` | 4               | 4      | "abcd" | 7           | `S[3]`='a' removed. `distinctCount` still 4. |
|       |                 | `{'a':0, 'b':1, 'c':1, 'd':1}` | 3               | 5      | "bcd"  | 7           | `S[4]`='a' removed. `distinctCount` is 3.      |
| 8     | 'e'             | `{'b':1, 'c':1, 'd':1, 'e':1}` | 4               | 5      | "bcde" | 7           | `distinctCount` is 4 (>K). Shrink:             |
|       |                 | `{'b':0, 'c':1, 'd':1, 'e':1}` | 3               | 6      | "cde"  | 7           | `S[5]`='b' removed. `distinctCount` is 3.      |
| 9     | 'f'             | `{'c':1, 'd':1, 'e':1, 'f':1}` | 4               | 6      | "cdef" | 7           | `distinctCount` is 4 (>K). Shrink:             |
|       |                 | `{'c':0, 'd':1, 'e':1, 'f':1}` | 3               | 7      | "def"  | 7           | `S[6]`='c' removed. `distinctCount` is 3.      |

End of string. Final `maxLength = 7`.