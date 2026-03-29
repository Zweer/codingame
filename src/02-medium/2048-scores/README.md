# 2048 scores

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/2048-scores)

**Level:** medium
**Topics:** Recursion

## Goal 

**2048:**  
  
2048 is game played on a 4 by 4 grid. You start with 2 tiles placed randomly in the grid. Every turn, you can move all the tiles in the grid in a particular direction (On pressing a particular direction, all tiles get pushed to that side). At the end of each turn, a new tile is generated, in a random position in the grid. The goal of the game is to obtain the 2048 tile. However, the game can be continued even after the 2048 tile is formed.  
 When moving tiles in a direction, if 2 adjacent tiles of the same value come in contact, they get merged into 1 tile, with value = 2\*value of old tile. When 2 tiles merge, the user’s score increases by the value of the new tile.This way, you can keep increasing the value of a tile. At the end of each turn, the randomly generated tile can only have value = 2 or 4. Note that there may be empty positions in the grid (marked as value=0 for simplicity)  
  
\--------------------------------------------------- xxx ---------------------------------------------------  
  
**The Problem:**  
  
Given a 2048 grid and the number of 4s generated, you have to output the player’s score and the number of turns played.   
  
\--------------------------------------------------- xxx ---------------------------------------------------  
  
**Example:**  
  
Consider the following game:  
  
0 0 0 0  
0 2 4 0  
0 0 0 0  
0 0 0 0  

4s generated = 1  
turns played = 0  
USER moves DOWN  
Grid becomes:  
  
0 0 0 0  
0 0 0 0  
0 0 0 0  
2 2 4 0  

4s generated = 1  
turns played = 1  
score = 0  
newly created tile = 2, placed at (0,3)  
USER moves LEFT  
Grid becomes:  
  
0 0 0 0  
0 4 0 0  
0 0 0 0  
4 4 0 0   

4s generated = 2  
turns played = 2  
score = 2+2 \= 4  
newly created tile = 4, placed at (1,1)  
So, given the following input:  
  
0 0 0 0  
0 4 0 0  
0 0 0 0  
4 4 0 0  
2   

Your program must output:  

4  
2  

  
\--------------------------------------------------- xxx ---------------------------------------------------  
  
**The Game:**  
  
Play the game from the link: https://gabrielecirulli.github.io/2048/ 

Input

**First 4 Lines:** 4 space-separated integers CNT, the value of the current tile  
**Next Line:** An integer FOURS, the number of 4s generated

Output

**Line 1:** An integer SCORE, the score of the user  
**Line 2:** An integer TURNS, the number of turns played

Constraints

0 ≤ CNT ≤ 2³¹

Example

Input

0 0 0 0
0 4 0 0
0 0 0 0
4 4 0 0
2

Output

4
2
