# Bandas

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/bandas)

**Level:** multi

# The Goal 

 Get your pawns to be the last on the grid 

# Rules 

The game is played on a 8x8 grid.

Both players pawns are placed randomly until the board is completely filled.

 Each turn every pawns of a player will move to the same direction pushing the opponent's pawns if they meet its way.  
 For example: Player outputs UP all her/his pawns are pushed UP, and any opponent pawns above the players pawns will also be pushed UP. 

A pawn will disappear if it moves / is pushed off the grid.

At the end of each turn, every empty lines and columns of the sides will be removed.

Victory Conditions

* Push all the enemy pawns off the grid.

Loss Conditions

* You have no pawns remaining on the grid.
* You do not respond in time or output an unrecognized command.
* You have less pawns than your opponent after 200 turns.

  
# Game Input 

 The program must first read the initialization data from standard input. Then, in an infinite loop, read the turn input and provide to the standard output one line with the direction to go. 

Initialization input

Line 1: 1 integer myId for your id (0 or 1)  
Line 2: 1 integer height height of the grid  
Line 3: 1 integer width width of the grid  

Input for one game turn

Line 1 to height: width space separated characters representing a line  
* 0 or 1: player with this id
* \-: empty
* x: hole

Output for one game turn

A single line containing the direction to go ("UP" | "RIGHT" | "DOWN" | "LEFT")   

Constraints

  
Allowed response time to output is ≤ 100 milliseconds.

  
## Advanced Details 

 You can see the game's source code on <https://github.com/Oli8/CG-bandas>.
