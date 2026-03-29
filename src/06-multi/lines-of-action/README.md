# Lines Of Action

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/lines-of-action)

**Level:** multi
**Topics:** Monte Carlo tree search, Minimax, Neural network, Bitboarding

# The Game 

This is a port of the board game [Lines Of Action](https://en.wikipedia.org/wiki/Lines%5Fof%5FAction).

Click [here](https://github.com/darkhorse64/CG%5FLinesOfAction) for the referee.

# Rules 

The game is played on a 8x8 board with two players. Each player has 12 checkers.

The initial position of checkers is shown in the following picture:

![Img: LOA initial position](https://github.com/darkhorse64/CG_LinesOfAction/raw/main/config/board.png)

The goal of the game is to bring all of your own checkers together into a single connected group. Checkers can be connected vertically, horizontally or diagonally.

**How to play:** 

Black starts the game. Checkers move horizontally, vertically, or diagonally.

* A checker moves exactly as many spaces as there are checkers (both friendly and opponent) on the line in which it is moving.
* A checker may not jump over an opponent checker.
* A checker may jump over friendly checkers.
* A checker may land on an empty square or a square occupied by an opponent checker, resulting in the latter's capture and removal from the game.

The game ends when one player has connected all his checkers or when 150 moves have been performed without victory from any player. In that case, the game is a draw.

**Ending a turn:** 
* A bot must output the coordinates of the piece he wants to move followed by its destination coordinates. Coordinates are expressed in chess notation e.g. "e2e3"
**Wrong output:**   
* If the starting or destination coordinates are outside of the board,
* If the starting square is occupied by an opponent checker,
* If the destination square is occupied by an own checker,
* If the checker path is blocked by one or more opponent checkers,
* If the checker does not move exactly as many spaces as there are checkers (both friendly and opponent) on the line in which it is moving,

the game will end and the other player will win.

# Expert Rules 

* If your last move connects simultaneously your checkers and the opponent checkers, it is considered as a win for you.
* In very rare occurences, a player will not have any legal moves left. This is not considered as a losing position for the player and he must issue a "pass" move to continue the game.

Victory Conditions

* Connect first all your checkers.

Loss Conditions

* You fail to connnect your checkers before the opponent.
* You do not respond in time or output an unrecognized command.

# Game Input/Output 

Initial input

One line: color: the color of your checkers (w: white, b: black). 

Input for one game turn

First 8 lines: line: a string of characters representing one horizontal row of the grid, top to bottom. (.: empty, w: white, b: black).   
Next line: lastMove: the last move by the opponent ("null" if it's the first turn).   
Next line: moveCount: the number of legal moves for this turn.   
Next moveCount lines: move: a string of characters representing a legal move. 

Output

A single line containing the coordinates where you want to move from, to, e.g. "e2e3" or "pass" only if you have no legal moves left.  
* You can display a (short) comment in the viewer by adding a space after the move and writing its content, e.g. "e2e3 message".
* You can play a random move by outputting "random" instead of a move. This is admittedly only useful for stub code generation.
  
Constraints

 Response time first turn is ≤ 1000 ms.   
Response time per turn is ≤ 150 ms.
