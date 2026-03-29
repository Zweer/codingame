# Sandpile addition

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/sandpile-addition)

**Level:** medium
**Topics:** 2D array

## Goal 

A sandpile is a square matrix of natural numbers between 0 and 3, representing how many grains of sand there is on each square.  
To add two sandpiles, just start by adding the two matrices element by element. Except the matrix you generate might not be a sandpile, if one of its element is higher than 3 you must transform this matrix into a sandpile, and this is how it is done:  
 \- If a square has 4 grains of sand or more, it "loses" four and distributes it to its four neighbors (if the square touches an edge, the grain of sand is lost).  
 \- Keep doing that to all the squares with 4 grains or more until all the squares have 3 grains or less.  
  
Example:  

000   000   000    010  
020 + 020 = 040 -> 101  
000   000   000    010  

Input

**Line 1:** An integer n, the size of the two sandpiles  
**Next n lines:** The first sandpile to add  
**Next n lines:** The second sandpile to add

Output

**n lines:** The resulting sandpile after adding the given sandpiles

Constraints

2 ≤ n ≤ 10

Example

Input

3
121
202
121
020
202
020

Output

313
101
313
