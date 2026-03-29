# Checkers

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/checkers)

**Level:** multi

This is a port of the board game [checkers](https://en.wikipedia.org/wiki/English%5Fdraughts) 

# The Goal 

The goal of the game is to capture all of your opponent’s pieces. You win, when the other player has no more valid moves. 

# Rules 

The game is a two player game played on a 8x8 board, each player has 12 pieces.  
Every turn you need to make a move to an empty square, if you can capture a piece than you must do that move.  
  
Movement works as follow: 
* You move a piece diagonally forward to an empty square. You can not move a piece diagonally backwards until it is promoted to king. If you can capture a piece you must make that move.
  
Jumping works as follows: 
* If an opponent piece is on a square diagonally forward next to one of your pieces and the space beyond is empty, then you must jump over the opponent piece capture it and land in the space beyond
* If another jump is available after you have done a jump, then you must jump again and capture next piece. You must keep jumping until there are no more jumps available
* A captured piece is removed from the board
* If multiple pieces can jump, you can choose the piece you want to make the jump.
Crowning: 
* When one of your pieces reaches the opposite side of the board, it is crowned and is promoted to King.
* A King can move diagonally backward and forward, it can only move one space at a time.
* A King can also jump backward and forward, it must take the jump available
Illustrated rules [here](https://www.itsyourturn.com/t%5Fhelptopic2030.html). 

# Game Input 

Initial input 

Next line: Your color as a string. The characters can be: 

* r: red pieces
* b: black pieces

Input for one game turn

First 8 lines: The board as strings of length 8\. The characters can be: 

* .: empty square
* r: red piece
* R: red King
* b: black piece
* B: black King

Next line: Number of legal moves as int: 

Next lines: The legal moves as strings

Output

A single lineContaining the move.   
Example(No jump move: A3B4, jump move: A3C5, multiple jump move: A3C5A7)   

  
Allotted response time per turn is ≤ 100 ms.
