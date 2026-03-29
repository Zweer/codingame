# Connect the Colours - Part 2

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/connect-the-colours---part-2)

**Level:** hard
**Topics:** BFS, DFS, Backtracking, Pathfinding

# The Goal 

 Connect the Colours is a logical puzzle that involves connecting pairs of matching colours in a closed grid. The objective is to connect **ALL** pairs of identical colours with non-overlapping paths, using **EVERY** tile.   
  
 This is the second edition of the "Connect the Colours" series. This edition does **NOT** contain any of the _special_ tiles that are in [part 1](https://www.codingame.com/training/medium/connect-the-colours---part-1). 

# Rules 

* Paths must consist of one or more horizontal and/or vertical segments to connect adjacent tiles.
* Each colour must be connected to the other instance of the same colour using a continuous path.
* A single tile can only be used in **ONE** path and any two paths **CANNOT** overlap or cross each other.
* Paths must remain entirely within the grid boundaries.
* Every tile must be used in a path, so that there are no empty tiles remaining.

 The top-left corner is positioned at coordinates (0,0) and the bottom-right is positioned at coordinates (w\-1,h\-1). 

Victory Conditions

* All colours are connected to their respective identical colour, in a continuous path and without overlaps or crossovers.

Loss Conditions

* Response time exceeds the time limit.
* The output is not properly formatted.
* Attempted to create an invalid path.
* Number of turns exceeds the turn limit.

###  🐞 Debug Mode

 Enable the debug mode using the settings icon ![setting icon](https://www.codingame.com/servlet/fileservlet?id=3463235186409) to provide extra information when hovering over tiles in the viewer.

# Game Input 

Input

Line 1: Space separated integers h w representing the height and width of the puzzle.

Next h Lines:  String of length w representing a row of the puzzle.

_Integers are used to define colours. Matching integers represent the same colour._ 

_The full stop character (.) indicates an empty tile that can be used as part of a path._ 

Output per turn

A single line containing space-separated integers in the form x1 y1 x2 y2 colour. 
* x1 \- X-Coordinate of the first tile.
* y1 \- Y-Coordinate of the first tile.
* x2 \- X-Coordinate of the second tile.
* y2 \- Y-Coordinate of the second tile.
* colour \- Colour identifier.
 This will create a section of a path from the first tile, to the second tile and will be in the colour denoted by the colour identifier.  
 Tiles **MUST** be in the same plane either horizontally or vertically (x1 \= x2 **OR** y1 \= y2).   

# Example 

Initialization input

 3 3 _(h,w)_   
 1.2 _(row)_   
 ... _(row)_   
 .12 _(row)_ 

Grid with 3 rows and 3 columns. Integers in the _rows_ represent the two tiles of a specific colour that must be connected with a single continuous path.  
  
![example image 1](https://i.ibb.co/6jyjjBK/example1.png)

Output for turn 1

0 0 0 2 1 

Create a path from coordinates (0,0) to the coordinates (0,2) using the colour represented by the colour identifier 1.  
  
![example image 2](https://i.ibb.co/4n7p73YB/example2.png)

Output for turn 2

2 0 1 0 2 

Create a path from coordinates (2,0) to the coordinates (1,0) using the colour represented by the colour identifier 2.  
  
![example image 3](https://i.ibb.co/CyRkxhg/example3.png)

Outputs for remaining turns

0 2 1 2 1  
 1 0 1 1 2   
 1 1 2 1 2   
 2 1 2 2 2   

Create paths for the remaining paired tiles, ensuring that each colour is connected by a single continuous path and that every tile is used.  
  
![example image 4](https://i.ibb.co/1YhKXD18/example4.png)

Constraints

 1 ≤ h, w ≤ 20  
 A colour identifier will appear exactly twice within a puzzle.  
 Maximum number of distinct colours in a puzzle is 9.  
 Allotted response time for first output is 2 seconds.  
 Allotted response time for subsequent outputs is 50 ms.  
 Turn limit is 60 turns.
