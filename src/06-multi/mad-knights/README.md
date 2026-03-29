# Mad Knights

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/mad-knights)

**Level:** multi
**Topics:** Monte Carlo tree search, Minimax, Neural network, Bitboarding, Heuristic search

# The Game 

This game is strongly inspired from [Knight Isolation](https://github.com/udacity/cd0349-adversarial-search), a Udacity model game.

Click [here](https://github.com/darkhorse64/CG%5FMadKnights) for the referee.

# Rules 

The game is played on a 8x8 chess board with three players: Red, Green, Blue. Each player has one single piece: a knight. The goal of the game is to "isolate" the opponent knights.

Whenever a knight occupies a square, that square becomes unavailable for the remainder of the game. An open square available for a knight to move into is called a "liberty". A player with no remaining liberties for their piece during their turn leaves the game. Therefore, the last player to move wins the game.

The initial positions of the pieces are random but borders are excluded to ensure equal chances for all players.

**How to play:** 

Red starts the game, then Green, then Blue. Each player alternate taking turns moving their knight to an available square. Knights can move to any open square that is 2-rows and 1-column or 2-columns and 1-row away from their current position on the board.

The game ends when only one player remains.

**Ending a turn:** 
* A bot must output the destination coordinates of its piece. Coordinates are expressed in chess notation e.g. e3
**Wrong output:**   
* If the destination square is outside of the board,
* If the destination square is not available,
* If the move is not a knight move,

the player leaves the game.

# Expert Rules 

* The game has been deliberately designed to be simple. Focus on search algorithms !

Victory Conditions

* Be the last to move.

Loss Conditions

* You cannot move your knight.
* You do not respond in time.
* You output an unrecognized command or an illegal move.

# Game Input/Output 

Initial input

One line: color: your piece color (r: red, g: green or b: blue). 

Input for one game turn

First 3 lines: player: player color (r, g or b), status: 0 (player has lost), 1 (player is alive), lastMove: last move played or nullif the player has not yet moved.   
Next 8 lines: line: a string of characters representing one horizontal row of the grid, top to bottom. (.: open, #: blocked, r: red, g: green, b: blue).   
Next line: moveCount: the number of legal moves for this turn.   
Next moveCount lines: move: a string of characters representing a legal move. 

Output

A single line containing the coordinates where you want to move to, e.g. e3.  
* You can display a (short) comment in the viewer by adding a space after the move and writing its content, e.g. e3 message.
* You can play a random move (chosen amongst all legal moves) by outputting random instead of specific coordinates.
  
Constraints

Response time first turn is ≤ 1000 ms.   
Response time per turn is ≤ 100 ms.
