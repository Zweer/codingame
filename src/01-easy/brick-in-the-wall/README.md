# Brick in the Wall

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/brick-in-the-wall)

**Level:** easy
**Topics:** Greedy algorithms, Mathematics

## Goal 

Good ol' Master Mason wants to build a wall. He's got N bricks lying on the floor, each of them with **different weights**. The height of the bricks is 6.5 cm.  
  
The wall is built from the bottom; in every row can be no more bricks than in the row below it. Bricks can be put right on top, if the previous condition is satisfied. In every row there’s a place for maximum X bricks.  
  
Master Mason wants to minimize his work. Remembering old school days and physics lessons, he calculates the work as follows. If a brick is built into the **L**\-th row from the floor, the work needed to place this brick is: **W = ((L-1) \* 6.5 / 100) \* g \* m**, where **m** is the weight of the brick measured in kilograms and **g = 10 m/s²** is the (not too precise value of the) gravitational acceleration. **(L-1) \* 6.5 / 100** measures the distance the brick needs to be lift in meters. Note that the most bottom row ist the 1st one.  
  
The task is to calculate the minimal work Master Mason can build all the bricks into a (not necessarily rectangular) wall. 

Input

**Line 1:** An integer X for the number of bricks in a row.  
**Line 2:** An integer N for the number of bricks.  
**Line 3:** The integer weights of the bricks separated by space. Weights are given in kg.

Output

**Line 1 :** The minimum work. Printed exactly with 3 decimal places.

Constraints

2 ≤ X ≤ 100  
2 ≤ N ≤ 1000  
0 < m < 1000

Example

Input

2
3
100 10 150

Output

6.500
