# Treasure hunt

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/treasure-hunt)

**Level:** easy
**Topics:** Arrays

## Goal 

You are a treasure hunter.  
Your goal is simple: move on the map to collect the maximum amount of gold.  
  
Given a map of height H, width W and a starting position, you can move on 4 directions (North, South, East, West).  
Each time you visit a cell, you collect the amount of gold indicated on it.  
You cannot visit a cell more than once!  
  
The possible values for a cell are:  
 \- X: Your starting position.  
 \- ' ': Nothing - you can go through that cell, but there is no gold on it.  
 \- #: A wall - you cannot go through that cell.  
 \- \[1 \- 9\]: The amount of gold on that cell. 

Input

**Line 1:** Two space-separated positive integers H and W for the height and the width of the map.  
**H next lines:** A string (of size W) representing each row of the map.

Output

A non-negative integer for the **maximum amount of gold** obtained by summing the amount of gold on each visited cell.

Constraints

1 <= H <= 100  
1 <= W <= 100

Example

Input

3 3
X##
1 5
3#4

Output

10
