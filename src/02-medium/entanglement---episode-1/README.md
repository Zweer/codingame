# Entanglement - Episode 1

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/entanglement---episode-1)

**Level:** medium
**Topics:** Conditions, Loops

# The Goal 

Your task is to implement a **scoring calculator** for a game called **Entanglement**. According to the given rules, your program must determine how many **points** the player earns and which **path** they follow. 

# Rules 

The game is played on a hexagonal grid. The player places one hexagonal tile at a time. Each tile has 12 entrances numbered 0–11, forming 6 distinct path segments — each **entrance** connects exactly once. It follows that one **path segment** is represented by 2 integers entranceA and entranceB. 

![](https://cdn-games.codingame.com/community/3996809-1760901746214/7c34165a9a4d696305b071ab5b89bf9e1222cd96e989b098a5aeeeeaeaf0d232.png) 

_Example of a single tile with numbered entrances._ 

**Gameplay:**

* The game starts on the base tile at position \[0, 0\], at entrance 7.
* Each turn, the player places a new tile on the empty cell directly ahead (first move: \[0, -1\]).
* After placing a tile, the player follows the connected path.
* The path continues until it reaches an empty cell, the board edge, or returns to the base tile.
* The game ends once the path reaches the board edge or the base tile.

**Scoring:**

Each turn consists of placing one tile and following the resulting path. For **every segment** of the path passed through **during this turn**, the player scores 1, 2, 3, ... points respectively.

_Examples:_  

* If the path passes through 1 segment this turn, the score increases by 1
* If the path passes through 2 segments this turn, the score increases by 3 (1+2)
* If the path passes through 3 segments this turn, the score increases by 6 (1+2+3)
* If the path passes through 4 segments this turn, the score increases by 10 (1+2+3+4)
* If the path passes through 5 segments this turn, the score increases by 15 (1+2+3+4+5)
* and so on...

**Coordinate System:**

The board has a fixed size, with all cells located at most 3 units away from the center. Your task is to print placement of all visited path segments, so make sure you understand the coordinate system used: 

![](https://cdn-games.codingame.com/community/3996809-1760901746214/d2fef08c29531d4f2a8a5b73cfa02aa2e96fbbfd719cb6ecfb76dad937fb356e.jpg) 

_Coordinate system:_ 
_y increases towards the south_ 
_x increases towards the north-east_ 

# Additional Info 

\- Click the gear icon in the viewer to access display options.  
\- This puzzle is inspired by the logic game [Entanglement](http://entanglement.gopherwoodstudios.com/).  
\- Source code available on [GitHub](https://github.com/VizGhar/CG-Entanglement).  
\- Design available on [Figma](https://www.figma.com/design/ofWLfYSIM6gnStGasFTtr3/Codingame?node-id=426-207&t=lPaNm2QLr5gEbB24-1). 

# Game Input / Output 

Turn input

Each turn, you receive information about the tile placed on the board:

6 lines: 2 space-separated integers entranceA and entranceB that form a path segment of the tile.

Turn output

Line 1: The current total score.

Line 2: A list of semicolon-separated (;) path segments. Each segment is defined by a quadruplet of space-separated integers:  
x y entranceA entranceB, representing a visited tile at position \[x, y\] and the two entrances connected on that tile.

_Turn output example:_

0 -1 3 7; 0 -2 0 5; 1 -2 10 8 – represents three path segments: 

* 0 -1 3 7 – first segment: the player starts this turn at \[0, -1\] and connects entrances 3 and 7.
* 0 -2 0 5 – second segment: the player continues at \[0, -2\] and connects entrances 0 and 5.
* 1 -2 10 8 – third segment: the player ends this turn at \[1, -2\] and connects entrances 10 and 8.

_Note 1:_ The referee will trim spaces around ; for convenience.

_Note 2:_ Path segment entrances are unordered: (3 7) is equivalent to (7 3).

Constraints

Response time for the first turn: ≤ 1s  
Response time for subsequent turns: ≤ 50ms
