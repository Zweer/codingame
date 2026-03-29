# Mirrors

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/mirrors)

**Level:** easy
**Topics:** Simulation, Mathematics

## Goal 

When z units of light shine on any side of a mirror with reflectivity r, rz units of light are reflected, and the other (1-r)z units of light pass through the mirror.   
There are n mirrors numbered 1...n arranged in a row. Mirror i has reflectivity r\_i. Find the total amount of light reflected back to the source when 1 unit of light shines on the first mirror.   
Note that light can be reflected multiple times.  

----> | | | | |  
light 1 2 3 4 5 ...

Input

**Line 1**: An integer n for the number of mirrors  
**Line 2**: n space-separated floats r for the reflectivity of the mirrors

Output

**Line 1**: Total reflected light rounded to 4 decimal places

Constraints

1 ≤ n ≤ 10  
0 ≤ r ≤ 1

Example

Input

2
0.5 0.500000

Output

0.6667
