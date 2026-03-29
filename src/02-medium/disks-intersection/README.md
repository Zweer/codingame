# Disks intersection

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/disks-intersection)

**Level:** medium
**Topics:** Geometry

## Goal 

Given centers and radius of two disks, you must determine their intersection area, rounded at a precision of 10^-2.  
So if you think the area is 42.3371337, you must output 42.34 and if your answer is 41.78954719, you must print 41.79.  
  
If these disks do not intersect, or intersect in one point, then the area is 0.00 . 

Input

**Line 1 :** Three space-separated integers x1, y1 and r1. x1 and y1 determine the position of the center of the first disk, and r1 its radius  
**Line 2 :** Three space-separated integers x2, y2 and r2. x2 and y2 determine the position of the center of the second disk, and r2 its radius

Output

The intersection area of the disks, rounded at a precision of 10^-2.

Constraints

\-100 < x1, y1, x2, y2 < 100  
1 ⩽ r1, r2 < 100

Example

Input

0 10 1
10 0 1

Output

0.00
