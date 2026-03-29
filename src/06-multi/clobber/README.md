# Clobber

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/clobber)

**Level:** multi
**Topics:** Monte Carlo tree search, Minimax, Bitboarding

# The Game 

This is a port of the board game [Clobber](https://en.wikipedia.org/wiki/Clobber).

Click [here](https://github.com/darkhorse64/CG%5FClobber) for the referee.

Special thanks to [struct](https://www.codingame.com/profile/dfb886f869fc14dc31fc9191a1b87a608740451) for providing me with his referee code as a basis for this work.

# Rules 

The game is played on a 8x8 board. In the initial position, all squares are occupied by a stone, with white stones on the white squares and black stones on the black squares.

**How to play:** 
* A player moves by picking up one of their stones and "clobbering" an opponent's stone on an adjacent square (horizontally or vertically). The "clobbered" stone is removed from the board and replaced by the stone that was moved.

The game ends when one player, on their turn, is unable to move, and then that player loses.

**Ending a turn:** 
* A bot must output the coordinates of the piece he wants to move followed by its destination coordinates. Coordinates are expressed in chess notation e.g. "e2e3"
**Wrong output:**   
* If the starting or destination coordinates are outside of the board,
* If the starting square is occupied by an opponent stone,
* If the destination square is empty or occupied by an own piece,

the game will end and the other player will win.

# Expert Rules 

Draws are impossible. 

Victory Conditions

* Be the last player to move.

Loss Conditions

* Have no legal moves.
* You do not respond in time or output an unrecognized command.

# Game Input/Output 

Initial input

First line: boardSize: the number of rows and columns on the board.   
Next line:color: the color of your pieces (w: white, b: black). 

Input for one game turn

Next boardSize lines: line: a string of characters representing one horizontal row of the grid, top to bottom. (.: empty, w: white, b: black).   
Next line: lastAction: the last action made by the opponent ("null" if it's the first turn).   
Next line: actionsCount: the number of legal actions for this turn.   

Output

A single line containing the coordinates where you want to move from, to, e.g. "e2e3".  
* You can display a (short) comment in the viewer by adding a space after the move and writing its content, e.g. "e2e3 message".
* You can play a random move by outputting random instead of a move. This is admittedly only useful for stub code generation.
  
Constraints

Response time first turn is ≤ 1000 ms.   
Response time per turn is ≤ 150 ms.
