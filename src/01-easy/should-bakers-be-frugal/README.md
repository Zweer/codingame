# Should Bakers be Frugal?

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/should-bakers-be-frugal)

**Level:** easy
**Topics:** Strive for Simplicity, Resource management, Simulation, Mathematics, Geometry

## Goal 

**Background/terms:**  
• A biscuit is round (a circle)  
• Measurements are in inches (not necessarily full inches)  
• When a Baker has a flattened-out square of dough ("DoughSquare"), he will cut-out biscuits (in grid-style orderly columns and rows) until no more biscuits can be cut-out  
  
**The difference:**  
There are two types of Bakers: "Wasteful" and "Frugal":  
• A Wasteful Baker will stop there, and throw away the remaining dough ☹️  
• A Frugal Baker will take the remaining dough and re-form it into another (smaller) DoughSquare, and repeat the cutting process. He will continue to do this until no full-biscuit can be cut-out.  
  
NOTE: At the end, there might be enough dough left to manually shape into a circle of the required diameter, but the Baker is **not** allowed to do this. In order to make a biscuit, the DoughSquare itself must be big enough so that the Baker can place the biscuit cutter fully on it.  
  
**The question:**  
Given the length of a side of the starting DoughSquare, and the diameter of the biscuit cutter, how many **more** biscuits can a Frugal Baker cut-out than a Wasteful Baker? 

Input

**Line 1:** Two floats side and diameter separated by a space

Output

**Line 1:** How many **more** biscuits a Frugal Baker makes than a Wasteful Baker

Constraints

0 < diameter < side < 100

Example

Input

3 1

Output

2
