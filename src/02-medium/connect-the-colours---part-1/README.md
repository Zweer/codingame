# Connect the Colours - Part 1

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/connect-the-colours---part-1)

**Level:** medium
**Topics:** BFS, DFS, Backtracking, Pathfinding

# The Goal 

 Connect the Colours is a logical puzzle that involves connecting pairs of matching colours in a closed grid. The objective is to connect **ALL** pairs of identical colours with non-overlapping paths, using **EVERY** usable tile. 

# Rules 

* Paths must consist of one or more horizontal and/or vertical segments to connect adjacent tiles.
* Each colour must be connected to the other instance of the same colour using a continuous path.
* A single tile can only be used in **ONE** path and any two paths **CANNOT** overlap or cross each other.
* Paths must remain entirely within the grid boundaries.
* Every usable tile must be used in a path, so that there are no empty tiles remaining.
* Special tiles can only be used in the manner specified in their respective rules.

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

_Integers (0\-9) and/or characters (a\-e) are used to define colours. Matching identifiers represent the same colour._ 

_The full stop character (.) indicates an empty tile that can be used as part of a path._ 

_Directional tiles (V and H) can only be connected in the direction specified. (V \= vertically only, H \= horizontally only)_

_Blockers (X) are tiles that CANNOT be used in any path._

Next Line:  Integer k representing the number of checkpoints in the puzzle.

Next k Lines:  Space separated information (x y c) representing the coordinates (x , y) and colour (c) of a checkpoint. Where x and y are integers and c is a string.

_Checkpoints are tiles that MUST be used as part of the path connecting the colour (c)._

Output per turn

A single line containing space-separated information in the form x1 y1 x2 y2 colour. 
* x1 \- X-Coordinate of the first tile _(integer)_.
* y1 \- Y-Coordinate of the first tile _(integer)_.
* x2 \- X-Coordinate of the second tile _(integer)_.
* y2 \- Y-Coordinate of the second tile _(integer)_.
* colour \- Colour identifier _(integer/character)_.
 This will create a section of a path from the first tile, to the second tile and will be in the colour denoted by the colour identifier.  
 Tiles **MUST** be in the same plane either horizontally or vertically (x1 \= x2 **OR** y1 \= y2).   

# Example 

Initialization input

 4 4   _(h,w)_   
 0..e _(row)_   
 V... _(row)_   
 ..H. _(row)_   
 0XXe _(row)_   
 2   _(k)_   
 0 2 0   _(x,y,c)_   
 2 0 e   _(x,y,c)_ 

Grid with 4 rows and 4 columns. Matching integers or lowercase characters in the _rows_ represent the two tiles of a specific colour that must be connected with a single continuous path. There are 2 _checkpoint tiles_ which can only be used in the path of their specified colour. Additionally, there are two _directional tiles_ which indicate they can only be used in paths in their given direction. Finally, there are two _blocker tiles_ which can't be used in any path.  
  
![example image 1](https://i.ibb.co/8nDR68xj/x1.png)

Output for turn 1

0 0 0 3 0 

Create a path from coordinates (0,0) to the coordinates (0,3) using the colour represented by the colour identifier 0. The path goes vertically through the vertical directional tile and connects through the checkpoint tile associated with the colour 0.  
  
![example image 2](https://i.ibb.co/kVSvsBrK/e2.png)

Output for turn 2

1 2 2 2 e 

Create a path from coordinates (1,2) to the coordinates (2,2) using the colour represented by the colour identifier e. This path correctly aligns with the orientation of the horizontal directional tile.  
  
![example image 3](https://i.ibb.co/F2Pn545/e3.png)

Outputs for remaining turns

3 0 3 1 e  
 3 1 2 1 e  
 2 0 2 1 e  
 2 0 1 0 e  
 1 2 1 0 e  
 2 2 3 2 e  
 3 2 3 3 e  

Create paths for the remaining paired tiles, ensuring that each colour is connected by a single continuous path and that every available tile is used.  
  
![example image 4](https://i.ibb.co/QFgT4RqV/x5.png)

Constraints

 1 ≤ h, w ≤ 15  
 0 ≤ k ≤ 15  
 0 ≤ x < w   
 0 ≤ y < h   
c is a digit (0\-9) or one of a\-e.   
 A colour identifier will appear exactly twice within a puzzle.  
 Maximum number of distinct colours in a puzzle is 15.  
 A puzzle will always contain at least one special tile (H, V or X).  
 Checkpoints are located on empty (.) tiles only.  
 Allotted response time for first output is 2 seconds.  
 Allotted response time for subsequent outputs is 50 ms.  
 Turn limit is 100 turns.
