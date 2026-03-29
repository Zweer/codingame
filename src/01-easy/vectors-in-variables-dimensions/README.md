# Vectors in variables dimensions

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/vectors-in-variables-dimensions)

**Level:** easy
**Topics:** Distances

## Goal 

You are a space-time traveler who can travel across universe. You want to know where you can go, so you've got yourself a list of anchors' coordinates (as you travel not only in 3D space, there can be more than 3 associated components for each point). The goal of this exercise is to output the shortest (non zero) and the longest vectors you can form from your list by pairing any two points in combination.  
  
As in 2D: Distance in higher dimensions is calculated as follows:   
For two points A(a1, a2, ..., an) and B(b1, b2, ..., bn), distance = √ ( (a1-b1)²+(a2-b2)²+...+(an-bn)² ) 

Input

**Line 1**: An integer D for the number of dimensions your points will be in.  
**Line 2**: An integer N for the number of points you receive.  
**N next lines**: One point per line, written like A(0,1,2), every component is integer.  
Each name may consist of several characters.

Output

**Line 1**: The shortest non-zero vector, if it is the one between A and B, it will be AB(b1-a1,b2-a2, ...,bn-an), the first point should be the one that appears first in the list  
**Line 2**: The longest vector, written the same way.

Constraints

1 ≤ D ≤ 10  
2 ≤ N ≤ 100  
\-20 ≤ each component ≤ 20  
It is guaranteed that there is only one shortest and one longest in each case.  
There can never have two vectors with the same names.

Example

Input

2
5
A(1,2)
C(0,8)
D(0,9)
E(6,2)
F(6,4)

Output

CD(0,1)
DE(6,-7)
