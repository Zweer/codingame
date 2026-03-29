# Magnets

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/magnets)

**Level:** hard
**Topics:** DFS, Recursion, Logic, Heuristic search

# The Goal 

You are given a **board** where you must place **magnets** and   **wooden blocks** so that all rules are satisfied and the final configuration is **stable**.

# Rules 

 Each **magnet consists of** two parts: a blue **negative pole** (\-) and a red **positive pole** (+). You have an unlimited supply of such magnets. Your task is to place the magnets on the board so that the following conditions are met: 

* Magnets may only be placed in predefined two-cell regions, which can be oriented horizontally or vertically.
* Identical poles (cells with +, \-) can't touch each other making the board **unstable**.
* The numbers on the left side of the board (leftHint) indicate the exact number of + poles that must appear in each row.
* The numbers above the board (topHint) indicate the exact number of + poles that must appear in each column.
* The numbers on the right side of the board (rightHint) indicate the exact number of \- poles that must appear in each row.
* The numbers below the board (bottomHint) indicate the exact number of \- poles that must appear in each column.
* The board must be fully covered by magnets and wooden blocks. Each wooden block, like a magnet, occupies a predefined two-cell region, and is marked with x.
 For a clearer understanding, see the example below: 

![Example solution](https://cdn-games.codingame.com/community/3996809-1759184451664/c2fde3921cb94cc7037ef014b51c15420113940b105cbb76f78d6ae4107d5e44.jpg) 

_Example of a valid solution_

# Additional Info 

\- Press the gear icon in the viewer to access extra display options  
\- This puzzle is based on the logic [game Magnets by Simon Tatham](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/js/magnets.html)  
\- Source code available on [GitHub](https://github.com/VizGhar/CG-Magnets)  
\- Design available on [Figma](https://www.figma.com/design/ofWLfYSIM6gnStGasFTtr3/Codingame?node-id=426-205&t=36qUqsGcExIKAUD7-1) 

# Game Input 

Initial input

Line 1: single integer width, the width of the board.

Line 2: single integer height, the height of the board.

Line 3: height space-separated integers leftHint (number of + poles in each row, from top to bottom).

Line 4: width space-separated integers topHint (number of + poles in each column, from left to right).

Line 5: height space-separated integers rightHint (number of \- poles in each row, from top to bottom).

Line 6: width space-separated integers bottomHint (number of \- poles in each column, from left to right).

_Note:_ You will receive \-1 if there is no hint specified for given row or column.

Turn input

height lines: each line contains a string of width characters:  

* + → cell occupied by the positive pole of a magnet.
* \- → cell occupied by the negative pole of a magnet.
* x → cell occupied by wooden block.
* Letter (A–Z, a–z , excluding x) marking predefined two-cell regions which are unoccupied. Identical letters mark two adjacent cells that belong to the same region.

Turn output

Single line: three space-separated values - integers x and y and character symbol (one of +, \-, x).  
This output will place symbol at \[x, y\], the coordinates of a cell (the matching cell is placed automatically).

_Note_: The board's top-left position is \[0, 0\].

Constraints

5 ≤ width, height ≤ 10  
  
Allotted response time to output in first turn is ≤ 3s  
Allotted response time to output in other turns is ≤ 50ms
