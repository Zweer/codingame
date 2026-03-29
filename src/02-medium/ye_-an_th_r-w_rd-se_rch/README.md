# Ye_  An_th_r W_rd Se_rch

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/ye_-an_th_r-w_rd-se_rch)

**Level:** medium
**Topics:** Backtracking, Algorithm X, Exact cover

## Goal 

This puzzle is part of a multi-part Algorithm X tutorial and is meant to be done per the guidance in the following playground:  
  
https://www.algorithm-x.com  
  
You are free to solve this puzzle in any language you choose. While the playground demonstrations are written in Python, a reusable Algorithm X Solver is available in many different languages. By following the guidance in the playground and using the solver as intended, this puzzle should be much easier than attempting it from scratch.  
  
**Task Overview:**  
  
While cleaning out the storage closet at CodinGame HQ, a handful of word search puzzles were found. Due to water damage, some letters on the grid are smudged and illegible. Find the words and print out the solution. Words can be hidden in any direction, including horizontally, vertically, diagonally, forward or backward. 

Input

**Line 1:** Two space-separated integers, the height and width of the word search grid.  
  
**Next height lines:** A row of letters in the word search grid. Illegible letters are represented with a (.).  
  
**Next line:** A string words, a sequence of space-separated words hidden in the word search.

Output

**height lines:** A row of the solution grid with the hidden words displayed. All locations that are not part of the solution must be replaced with a space. Do NOT trim any trailing spaces from the lines of your solution.

Constraints

• 7 <= height, width < 50.  
  
• All test cases have a unique solution.

Example

Input

10 10
...G......
.H...C....
..N.......
......U..H
...H......
........K.
.......H..
I...Q.....
F.V.......
.P..J.....
ANTELOPE CROCODILE

Output

          
     C    
     R    
     O    
     C    
ANTELOPE  
     D    
     I    
     L    
     E
