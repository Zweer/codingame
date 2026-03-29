# Snake Sort 2D

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/snake-sort-2d)

**Level:** easy
**Topics:** Sorting

## Goal 

A lazy snake wants to eat all N apples in a 2D array of fixed size (100x100).  
  
The snake starts at the position 0,0 and, because it is a lazy snake, goes down to the first row that contains apples and traverses the row from left to right; it then goes down to the next row that contains apples and traverses this row from right to left, and so on, "snaking" its way down the array.  
  
You are given the name and the row,column coordinates of each apple.  
What is the list of each apple’s name in the lazy-snake-eating-order? 

Input

**Line 1:** An integer N for the number of apples.  
**N next lines:** A string name and two integers row,column for the name and coordinates of an apple.

Output

**Line 1:** A lazy-snake-eating-order comma-separated sorted list of apples.

Constraints

2 ≤ N ≤ 100  
0 ≤ row,column < 100

Example

Input

4
A 0 10
B 0 20
C 1 10
D 1 20

Output

A,B,D,C
