# Impasse

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/impasse)

**Level:** multi
**Topics:** Monte Carlo tree search, Minimax, Neural network, Bitboarding

# The Game 

This is a port of the board game **Impasse**, invented by [Mark Steere](https://marksteeregames.com/).

Full rules of the game are available [here](https://marksteeregames.com/Impasse%5Frules.pdf).

The referee is available [here](https://github.com/acatai/CG%5FImpasse).

# Rules 

The game is played on a 8x8 board with two players. Each player has 12 checkers. Players take turns, starting with **White**.   
Checkers can be placed upon each other making a **double**. Normal unpaired checkers are called **singles**. The first player to remove all of his checkers from the board wins. 

### Basic Moves

There are three types of basic moves in Impasse: the **single slide**, the **double slide**, and the **transpose**. If you have any basic move available you have to perform one and only one of them. 

**Single slide**: A single checker can be slid diagonally forward (away from the owner), in a straight line along any number of consecutive, unoccupied squares. Your program has to output the coordinates of the piece he wants to move followed by its destination coordinate (e.g, c1a3). 

**Double slide**: A double is a stack of two like-colored checkers. Doubles can be slid diagonally backward in a straight line along any number of consecutive, unoccupied squares. Your program has to output the start and end coordinates of the movement (e.g, g7d4). 

**Transpose**: If you have a single adjacent to one of your doubles, and in a nearer row than the double, you can take the top checker (a **crown**) of that double and transfer it onto the single. Your program has to output the start and end coordinates of the crown (e.g, f8g7). 

### Bear Off

When you come to have a double in your nearest row (by way of a slide or a transpose), you must immediately **bear off**, i.e., remove the top checker of that double from the board (which increases your score). 

This action is performed automatically by the referee. However, it can occur in the middle of your turn and impact further choices during this turn. 

### Impasse

If you have no basic moves available at the start of your turn you are at an **impasse**, and you must remove exactly one of your checkers from the board - either a single or the top checker of a double. You cannot make any of the three basic move types during your turn, but may need to perform a **crown** action after (see below). The winner’s last checker is removed via the impasse rule. 

When the impasse occurs, your program has to output a single coordinate, pointing the piece (or crown of the piece) you want to remove from the board, (e.g, c5). 

### Crown

When you have a single in your furthest row (by way of a slide, a transpose, or the impasse), you must immediately **crown** that single with another one of your on-board singles. This action removes chosen on-board single, and makes the furthest row single a double. 

If you don’t have another on-board single, nothing happens for now. If you obtain another on-board single during a later turn (via the bear off or impasse), and still have a single in your furthest row, you must immediately perform crowning action. 

If crowning occurs during your turn, your program has to specify which piece you want to use for the crowning (even if it is the only choice). For this, you have to append to your program's so-far output a single coordinate, on which the piece that should become a crown is, (e.g, c5). 

  
# Expert Rules 

* It is possible to have two singles in your furthest row (the second single via the impasse rule). Then you can choose any of them for the crown action.

Victory Conditions

* Be the first to remove all your pieces from the board.

Loss Conditions

* You fail to remove your pieces before the opponent.
* You do not respond in time or output an unrecognized command.

  
**Acknowledgments**

This contribution was developed for the dr. Mark Winands course _**Intelligent Search & Games**_, Maastricht University, 2022.

Authored by _**Jakub Kowalski**_ ([@aCat](https://www.codingame.com/profile/b528dd3b279d7578674a1129305918e0400484)).

SDK implementation partially based on the source codes by [@struct](https://www.codingame.com/profile/dfb886f869fc14dc31fc9191a1b87a608740451) and [@darkhorse64](https://www.codingame.com/profile/c9ebe76a83b33730956eda0534d6cad86053292). 

  
# Game Input/Output 

Initial input

One line: color: the color of your checkers (w: white, b: black). 

Input for one game turn

First 8 lines: line: a string of characters representing one horizontal row of the grid, top to bottom. (.: empty, w: white single, W: white double, b: black single, B: black double).   
Next line: lastMove: the last move by the opponent ("null" if it's the first turn).   
Next line: moveCount: the number of legal moves for this turn.   
Next moveCount lines: move: a string of characters representing a legal move. 

Output

A single line containing the coordinates specifying your actions.  
This may be 1, 2, or 3 coordinates depending on the context, e.g., "d2f4" (move from d2 to f3), "f8g7c5" (transpose from f8 to g7 and crown from c5), "b6" (impasse-remove on b6).  
* You can display a (short) comment in the viewer by adding a space after the move and writing its content, e.g. "e3d4 message".
* You can play a random move by outputting "random" instead of a move. This is admittedly only useful for stub code generation.
  
Constraints

Response time first turn is ≤ 1000 ms.   
Response time per turn is ≤ 100 ms.   
Turn limit is 300.
