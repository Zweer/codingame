# Custom Game of Life

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/custom-game-of-life)

**Level:** medium
**Topics:** Conditions, Loops, Lists, Simulation, 2D array

## Goal 

You probably know the game of life, but if you don't: https://en.wikipedia.org/wiki/Conway%27s\_Game\_of\_Life  
  
It is a cellular automaton created by John Conway in 1970, consisting of an infinite grid of dead and live cells that changes each turn following specific rules:  
• A live cell will survive only if it has 2 or 3 live neighbours. Otherwise, if there are fewer than 2, it dies of isolation; if there are more than 3, it dies of overpopulation.  
• If a dead cell has exactly 3 live neighbours, it becomes live, else it stays dead.  
• **Neighbours** refers to the Moore neighbourhood (8 surrounding cells).  
  
You will be given new rules and will have to adapt the evolution of the grid to these. The first line is the condition of survival of a live cell, and the second line is the birth condition of a dead cell. The index within the line is the number of neighbours, 0 to 8\. Live is represented by 1, dead by 0.  
  
Your goal is to output the grid given in input after n turns and with specific given rules.  
  
**Example: Classic rules**  
001100000 A live cell survives if it has 2 or 3 live neighbours, and dies if 0, 1 or 4+.  
000100000 A dead cell becomes live if it has 3 live neighbours, and stays dead if any other number.  
  
A cell outside the grid will always be considered as dead. 

Input

**First line:** h & w, height and width of the grid, n the number of turns you have to simulate before output.  
**Second line:** 9 binary digits, the condition of surviving of a live cell (0: dies, 1: stays live).  
**Third line:** 9 binary digits, the condition of birth of a dead cell (0: stays dead, 1: birth).  
**Next h lines:** w\-length string for cells (.: dead, O: live).

Output

**h lines** of w\-length strings for cells after n turns (.: dead, O: live).

Constraints

0 < w, h, n ≤ 20

Example

Input

3 4 1
001100000
000100000
.OO.
O..O
.OO.

Output

.OO.
O..O
.OO.
