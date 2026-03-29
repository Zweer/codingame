# Hitori solver

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/hitori-solver)

**Level:** hard
**Topics:** Conditions, Loops, 2D array

## Goal 

Each puzzle consists of a square grid with numbers appearing in all squares. The object is to shade squares so:  
  
\- No number appears in a row or column more than once.  
\- Shaded squares do not touch each other vertically or horizontally.  
\- When completed, all un-shaded squares create a single continuous area.  
(use \* for shaded squares) 

Input

Line 1 : The size of the square, n .  
n following lines : Content of the grid made of n numbers.

Output

n following lines : Content of the solved grid made of n numbers and \* for shaded squares.

Constraints

2 ≤ n ≤ 8

Example

Input

3
111
234
224

Output

*1*
234
*2*
