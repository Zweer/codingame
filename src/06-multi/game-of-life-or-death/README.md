# Game of Life or Death

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/game-of-life-or-death)

**Level:** multi
**Topics:** State machine, 2D array, Cellular Automata, Battle, Conway's Game Of Life

# The Goal 

Use the rules of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s%5FGame%5Fof%5FLife) to your advantage to overpower the opponent.   
  
The game is played on a rectangular grid of cells that can either be alive or dead (1 or 0 respectively). Each turn, the cells are updated according to the following rules:   
1. Any live cell with fewer than two live neighbors dies, as if by underpopulation.
2. Any live cell with two or three live neighbors lives on to the next generation.
3. Any live cell with more than three live neighbors dies, as if by overpopulation.
4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
  
  
In addition to the above rules: 
* Live cells can belong to either Player 1 or Player 2.
* The opponent's live cells are considered dead when calculating the next state for each player.
* If both players try to activate the same cell, that cell remains dead instead.
  
  
Finally, there are a set of cells in the middle of the grid called goalCells. For each turn that a goalCell is alive, the cell's owner scores one point. The player with the greatest number of points after 200 turns wins! 

# Rules 

Your program receives the current state of an 8x8 grid of cells where the 4 cells closest to the center are goalCells.  
  
You control a single column on one side of the grid. Each turn, your bot will output a string of space-separated binary digits (0's and 1's).  
  
These digits update the state of either the left or right-most columns of cells in the grid for the next turn.  
* If you are Player 1, your bot's output will be applied to the left-most column (top to bottom) on the viewport grid.
* If you are Player 2, your bot's output will be flipped and applied to the right-most column (bottom to top) on the viewport grid.
  
**NOTE:** From your code's perspective, you will always control the left side of the grid regardless of whether you are Player 1 or Player 2.  
The displayed board state will be rotated 180° and the cell values inverted before they are sent to Player 2 to maintain consistency between players.  
  
A visual representation of the grid and how the bot's output is used to update the grid.  
  
![Game Grid](https://i.imgur.com/ymul57x.png)   
  
The game grid works as follows: 
* Cells you occupy have a value of 1.
* Cells your opponent occupies have a value of \-1.
* Cells you occupy interact with each other from one turn to the next according to the rules of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s%5FGame%5Fof%5FLife)
* Cells you occupy do not interact with cells occupied by the opponent (they are treated as if they are 0)
* If both you and your opponent would occupy the same cell on a given turn, the effects cancel each other out and the cell remains unoccupied (0).
* The grid wraps around the top and bottom edges, so cells in the top row are neighbors with cells in the bottom row.
To score points, you must occupy one of the goalCells on the grid. The goalCells are the green cells in the center of the grid.   
The specific coordinates of goalCells are provided as input on the first turn of the game.   
You score one point for each goalCell you occupy at the end of each turn.   
You **win** if, at the end of 200 turns, you have more points than your opponent. If tied, the player with the most cells occupied wins.   
  
**MANA**   

You start the game with 6 mana points. You can use these points to activate cells on the grid. The more mana you have, the more cells you can activate.

Each cell you activate costs 1 mana point. You can activate as many cells as you have mana points.

At the end of each turn, you will receive 2 mana points to use in the following turn. Additionally, for each point scored you will earn 1 mana point.

Any unused mana points are carried over to the next turn up to a maximum of 6.
  
  
**Hint:**   
[Spaceships](https://conwaylife.com/wiki/Spaceship) are a good way to move around the grid! Try to find a way to build one. 

Victory Conditions

* You have more points at the end of the game **or**
* You scored the same number of points, but you occupied more total cells.

Defeat Conditions

* Unknown command (anything that is not a space-separated line of 0or 1with exactly the same number of digits as the number of rows in the grid)
* Your opponent has more points at the end of the game or they have the same number of points and have more total cells occupied.

# Game Input 

The program must first read the initialization data from standard input.

Initial Input

Line 1: rowCount, an integer representing the height of the grid.

Line 2: columnCount, an integer representing the width of the grid.

Line 3: maxMana, an integer representing the maximum amount of mana available on any given turn.

Line 4: goalCellCount, an integer representing the number of goalCells present on the grid.

Next goalCellCount lines: Space-delimited x y coordinates of the goalCells, one per line.

Game Loop Input

Line 1: mana, an integer representing the amount of mana available to spend this turn. This is how many 1s can be used in the next action.

Line 2: opponentMana, an integer representing the amount of mana the opponent has available to spend this turn. This is how many 1s they can use in the next action.

rowCount lines: The current state of one row of the game grid. A space-delimited string of integers between \-1 and 1 (columnCount integers per row). 

* 1 represents a cell you occupy
* \-1 represents a cell occupied by your opponent
* 0 represents an unoccupied cell

Output

A single line containing a space-delimited string of binary integers (0 or 1) of length rowCount. This represents the next state of left-most column of cells from top to bottom on the grid (the first value from each row). This new set of states will determine how neighboring cells to the right are updated.  
  
Constraints

Allotted response time to output is ≤ 50 milliseconds. 

# The Origin Story

Conway's Game of Life is famously a zero-player game.   
  
What if it _wasn't?_
