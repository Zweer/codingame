# OneWay City

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/oneway-city)

**Level:** medium
**Topics:** Combinatorics

## Goal 

Your city is a rectangular grid of buildings with streets joining them vertically and horizontally.   
All the streets are one way: you can only go either south or east, but never north or west.  
  
Your program has to compute the number of routes linking the North-West corner to the South-East one in an M x N city grid.  
  
Be warned however that OneWay City is in fact a Megalopolis—with all the headaches that it implies. Actually, the numbers can get so big that your program's output should only contain the first 1000 digits of the solution. 

Input

Line 1: M, the number of west-east roads  
Line 2: N, the number of north-south roads

Output

Number of ways leading from the North-West corner to the South-East one, truncated to the most significant 1000 digits.

Constraints

0 < N, M <= 5000

Example

Input

4
4

Output

20
