# Odd-Quad-Out

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/odd-quad-out)

**Level:** easy
**Topics:** Arithmetic, 2D array, Digit counts

## Goal 

**Overview:** Which of the 4 quadrant-values is different than the others?  
  
  
**Details:**  
You will be given a square table (sqTable), with a sideSize of an even-number (such as 4, 6, 8 etc).  
This sqTable can be thought of as having 4 equal quadrants (quads).  
  
Each cell in sqTable contains either nothing (represented by .) or a number from 1 to 9.  
  
The value of each quad is equal to the sum of the numbers in it.  
  
  
**Your Task:**  
Find the oddQuad that has a different value (oddValue) than the other quads.  
The other three quads will have the standardValue.  
  
  
**Note:**  
The oddValue might be larger or smaller than the standardValue  
  
-----------------------  
|          |          |  
|  Quad-1  |  Quad-2  |  
|          |          |  
-----------------------  
|          |          |  
|  Quad-3  |  Quad-4  |  
|          |          |  
-----------------------  

Input

**Line 1:** An integer, sideSize  
  
**Next sideSize Lines:** A string that is sideSize long, consisting only of . and digits (1 through 9)

Output

**Line 1:** Quad-oddQuad is Odd-Quad-Out  
**Line 2:** It has value of oddValue  
**Line 3:** Others have value of standardValue

Constraints

sideSize is an even-number  
4 ≤ sideSize ≤ 30

Example

Input

4
.48.
3..2
6.2.
4.17

Output

Quad-1 is Odd-Quad-Out
It has value of 7
Others have value of 10
