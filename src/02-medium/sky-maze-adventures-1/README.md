# Sky Maze Adventures 1

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/sky-maze-adventures-1)

**Level:** medium
**Topics:** Pathfinding, Maze

## Goal 

A maze robot, BillyBot, is going to take the sky maze challenge.   
  
Your goal: given a maze, a starting position and a destination, help BillyBot reach the destination without repeating the route.   
  
The maze, with the top-left corner being (0, 0), consists of characters 0 and 1 where 0 represents a walkable path, and 1 represents an empty space.   
  
**For example:** Given the 5 by 3 maze:   
01111   
00000   
11110   
  
and a destination of (4, 2), reaching it from starting point (0, 0) would require these steps:   
\-> DOWN   
\-> RIGHT   
\-> RIGHT   
\-> RIGHT   
\-> RIGHT   
\-> DOWN 

Initialization input

Line 1: 2 space-separated integers w and h, the width and height of the maze.   
Line 2: 2 space-separated integers dx and dy, representing the x- and y-coordinates of the destination.   
Next h lines: A string of w characters, where each character is either a 0 or a 1.

Input for a game round

Line 1: 2 space-separated integers x and y, representing the player’s position. In the first round, this denotes the starting position.

Output for a game round

Line 1: UP, DOWN, LEFT or RIGHT, each moving the player’s position by 1 unit in the corresponding direction. 

Constraints

1 ≤ w, h ≤ 30   
0 ≤ dx, x < w   
0 ≤ dy, y < h   
The starting position is never the destination.
