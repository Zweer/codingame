# Touching Balls

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/touching-balls)

**Level:** easy

## Goal 

You are given N non-overlapping spheres, each centered at (x,y,z) with radiusr. In the same order as they are given, expand the radius of each sphere until it touches any of the other spheres. 

Input

**Line 1:** The Number of spheres  
**Next N lines:** x y z r for each sphere, space separated

Output

The sum of r^3 for all the spheres after expansion, rounded to the nearest integer.

Constraints

2≤ N ≤ 100  
0≤x,y,z≤100  
0<r≤100

Example

Input

2
0 0 0 1
0 0 10 3

Output

370
