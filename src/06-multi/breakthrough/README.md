# Breakthrough

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/breakthrough)

**Level:** multi
**Topics:** Monte Carlo tree search, Minimax, Bitboarding

This is a port of the board game [Breakthrough](https://en.wikipedia.org/wiki/Breakthrough%5F%28board%5Fgame%29) 

# The Goal 

The goal of the game is to reach first the opponent's home row. 

# Rules 

The game is a two player game played on a 8x8 board, each player has 16 pieces.  
At the starting position, the two bottom rows (for White) and the two top rows (for Black) of the board are filled with pieces. White makes the first move.  
  
Movement works as follow: 
* A piece may move one space straight or diagonally forward if the target square is empty.
* A piece may move into a square containing an opponent's piece if and only if that square is one step diagonally forward. The opponent's piece is removed and the player's piece replaces it.
* Note that capturing is not compulsory, nor is it "chained" as in checkers.
Because pawns can only move forward, draws are impossible in Breakthrough games. A game may last theoretically up to 209 moves but, in practice, a game is generally decided before 100 moves are played. 

Victory conditions

* You reach first the opponent's home row.
* You capture all opponent pieces.

Defeat Conditions

* Your program does not provide a valid command in time.
* You fail to protect your home row.
* You lose all your pieces.

# Game Input 

Input for one game turn

First line: The last move of your opponent or "None" if you start the game

Next line: Number of legal moves as an integer 

Next lines: The legal moves as strings

Output

A single line: Your move and an additional short message separated by a whitespace

  
Move encoding

  
A move is defined by its starting square and ending square. Squares are described using chess notation.  
Example move: c2c3   

Constraints

  
The response time for the first turn is ≤ 1000 milliseconds.   
The response time for the following turns is ≤ 100 milliseconds.
