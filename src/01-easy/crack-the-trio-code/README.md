# Crack the Trio Code

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/crack-the-trio-code)

**Level:** easy
**Topics:** Combinatorics

## Goal 

There are three positive integers, called **triads**. By selecting 1 to 3 of these numbers (with repetitions allowed) and summing them, you obtain what is known as **triad sums**. You are given a sorted subset L of triad sums. Your task is to determine the original triads.  
\- If there is only one possible set of triads, output them in ascending order (comma-separated).  
\- If there are multiple possible sets, output many.  
\- If no valid set exists, output none. 

Input

**Line 1:** A comma-separated list of integers representing a sorted subset of triad sums (with no duplicates).

Output

**Line 1:** The answer as specified in the statement.

Constraints

max(L) ≤ 120

Example

Input

3,11,12,102,111,120

Output

1,10,100
