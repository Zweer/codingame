# Tiling by Squares

[:link: Puzzle on CodinGame](https://www.codingame.com/training/expert/tiling-by-squares)

**Level:** expert
**Topics:** Tiling

## Goal 

Given a rectangle of integer sides w and h, find the minimum number of squares with integer sides (the sides' sizes must be natural numbers) needed to fill the rectangle.  
  
**Example** with w \= 11 and h \= 13:  

 _ _ _ _ _ _ _ _ _ _ _  
|       |             |  
|   4   |             |  
|       |             |  
|_ _ _ _|      7      |  
|       |             |  
|   4   |             |  
|       |_ _ _ _ _ _ _|  
|_ _ _ _|1|           |  
|         |           |  
|         |     6     |  
|    5    |           |  
|         |           |  
|_ _ _ _ _|_ _ _ _ _ _|

  
You can fill it with a minimum of 6 squares so the output should be 6. 

Input

Two integers w, h separated by a space.

Output

The minimal number of squares.

Constraints

0 < w, h < 50

Example

Input

6 7

Output

5
