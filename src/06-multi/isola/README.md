# Isola

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/isola)

**Level:** multi
**Topics:** Monte Carlo tree search, Minimax, Board Game

This is a port of the board game [Isola](https://fr.wikipedia.org/wiki/Isola%5F%28jeu%29) :   
  
![](https://github.com/wala-fr/CodingameIsolation/blob/master/CodingameIsolation/src/main/resources/view/statement/isola_statement.png?raw=true) 

The source code of this game is available [on this GitHub repo](https://github.com/wala-fr/CodingameIsola).   

# The Goal 

The goal of the game is to block the opponent's pawn.

# Rules 

**Board:** 
* The game is played on a 9 x 9 board.
* Player 0 always starts at (0, 4) and player 1 at (8, 4).
**At each turn:**   
1. You must **move your pawn** to an adjacent tile (diagonal included) :  
    
![](https://github.com/wala-fr/CodingameIsolation/blob/master/CodingameIsolation/src/main/resources/view/statement/moves.png?raw=true)  
You can't :  
  * stay put
  * move to the tile occupied by the opponent's pawn
  * move to an already removed tile.
2. **Then** you must **remove a free tile**.  
You can't remove a tile occupied by a pawn.

Victory Conditions

* At his turn, the opponent can't move his pawn.

Loss Conditions

* At your turn, you can't move your pawn.
* You do not respond in time or output an invalid action.

# Game Input 

Initialization input

Line 1: playerPositionX   
Line 2: playerPositionYthe coordinates of your pawn. 

  
Input for one game turn

Line 1: opponentPositionX   
Line 2: opponentPositionYthe coordinates of the opponent's pawn.   
Line 3: opponentLastRemovedTileX   
Line 4: opponentLastRemovedTileYthe coordinates of the last tile removed by the opponent ( \-1 -1if no tile has been removed (first round)).   

Output

A single line containing the coordinates where you want to move your pawn, followed by the coordinates of the tile you want to remove.  
Example: 1 4 7 4   
 You can also add a message :  
 Example: 1 4 7 4;MESSAGE   
 NB : You can print RANDOMinstead of the 4 coordinates. Then a random possible move and tile will be chosen. 

Constraints

Response time first turn is ≤ 1000ms.   
Response time per turn is ≤ 100ms.
