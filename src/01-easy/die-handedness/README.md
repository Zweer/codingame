# Die Handedness

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/die-handedness)

**Level:** easy
**Topics:** Mathematics, Geometry, cube, Linear algebra, Determinant

## Goal 

According to Wikipedia (https://en.wikipedia.org/wiki/Dice):  
  
"Opposite sides of a modern die traditionally add up to seven, requiring the 1, 2, and 3 faces to share a vertex. The faces of a die may be placed clockwise or counterclockwise about this vertex. If the 1, 2, and 3 faces run counterclockwise, the die is called "right-handed". If those faces run clockwise, the die is called "left-handed"."  
  
You are given a die. You need to decide if it is right-handed or left-handed. If opposite sides don't add up to 7, we will say that the die is degenerate. 

Input

The die is given as a 3-line string such as  

  
 1  
2354  
 6  

  
where the first and third lines have a whitespace in front. The arrangement contains all the numbers 1-6 exactly once.

Output

In a 1-line answer you need to output one of right-handed, left-handed and degenerate.

Constraints

Example

Input

 1
2354
 6

Output

right-handed
