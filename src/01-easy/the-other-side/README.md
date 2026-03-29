# The Other Side

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/the-other-side)

**Level:** easy
**Topics:** BFS, DFS, Flood fill, graph traversal

## Goal 

Placrates, the labyrinth engineer, is facing a simple puzzle. Given an h×w grid made of + and # characters, the objective is to **count the number of + characters in the leftmost column from which there exists a path to the rightmost column**.   
  
The path can be traced through a series of moves. Each move can be either horizontal or vertical, but not diagonal. Finally, valid moves pass through + characters only. 

Input

**Line 1 :** The height h of the grid.  
**Line 2 :** The width w of the grid.  
**Next h lines:** The rows of the grid, where each row is composed of w space separated characters.

Output

**Line 1 :** The number of + characters in the leftmost column from which there exists a path to the rightmost column.

Constraints

2 ≤ h,w ≤ 12

Example

Input

2
3
+ + +
+ + +

Output

2
