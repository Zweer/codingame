# Maze /w teleporters and jumps

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/maze-w-teleporters-and-jumps)

**Level:** medium
**Topics:** BFS, Maze

## Goal 

Your goal is to find the minimum amount of steps from start to end in a maze with teleporters and jump pods, and return \-1 if it is impossible to reach the end.  
  
You will be given a maze of width x height cells with symbols:  
#: wall  
\_: empty cell  
S: starting point  
E: ending point  
lowercase letter: teleporter entry  
UPPERCASE letter: teleporter exit  
<, \>, ^, v: jump pod  
  
How teleporters work: Stepping on a lowercase letter instantly transports you to the matching uppercase letter. Teleporters are one-way: you can travel from the lowercase entry to the uppercase exit, but not the other way round.  
  
How jump pods work: When you step on a jump pod, you jump 2 cells in the direction of the sign. You also jump over walls, but there won't be any out of bounds jump pods. Stepping on the \> will make you jump 2 cells to the right, < to the left, ^ up, and v down.  
  
You may move up, down, left, or right (no diagonal moves), one cell at a time. Each move to an adjacent cell counts as a single step. Stepping onto a teleporter or a jump pod also counts as one step, but the teleportation or jump itself does not add extra steps. 

Input

**Line 1:** width of the maze  
**Line 2:** height of the maze  
**Next height lines:** string describing a row in the maze

Output

**Line 1:** the minimum amount of steps from start to end, or \-1 if it is impossible to reach the end

Constraints

3 ≤ width ≤ 20  
3 ≤ height ≤ 20  
Each maze contains exactly one S and one E.  
Teleporter entries and exits are strictly one-to-one; no duplicates.  
S, E and v are never used as teleporter symbols.

Example

Input

6
5
######
#S__x#
######
#X__E#
######

Output

6
