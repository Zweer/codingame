# Apple tree

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/apple-tree)

**Level:** hard
**Topics:** Geometry, Physics

## Goal 

There are N apples on the tree. Every apple is a sphere with position (x, y, z) and radius r.  
Then the i\-th apple begins to fall straight down and can collide with others. When static apple gets hit by the falling one it begins to fall too, and the falling apple continues to fall straight down.  
Your task is to determine how many apples will remain on the tree.  
  
**NOTE**  
"Down" direction is vector (0, 0, \-1), i.e. position (0, 0, 10) is higher than (0, 0, 5). 

Input

**Line 1** Two space-separated integers N and i – the number of apples and index of the falling apple  
**Next N lines** Four space-separated integers x, y, z and r – position and radius of the apple

Output

A single integer – number of remaining apples

Constraints

1 ≤ N < 100  
0 ≤ i < N  
\-1,000,000 ≤ x, y, z ≤ 1,000,000  
1 ≤ r < 1,000,000

Example

Input

2 0
0 0 100 10
0 0 200 15

Output

1
