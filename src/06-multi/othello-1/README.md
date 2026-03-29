# Othello

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/othello-1)

**Level:** multi
**Topics:** Monte Carlo tree search, Minimax, Bitboarding, Classic board games

This is a port from the board game [Othello](https://en.wikipedia.org/wiki/Reversi#Othello).   
Click [here](https://github.com/MultiStruct/Othello) for the referee.   
Boss made by [darkhorse64](https://www.codingame.com/profile/c9ebe76a83b33730956eda0534d6cad86053292).  

# The Goal 

The goal of the game is to have more discs than your opponent. 

# Rules 

**Grid:**   
 Game is played on an 8x8 board.  
  
**The grid notation is represented in the image below:** 

![](https://cdn-games.codingame.com/community/1540478-1591830398920/960cf8ee5e4332743a5d72d794c6a23a710ed7f24cfb93fce51188becbf190a6.png)

  
**The board always starts with 4 discs placed, represented in the image below:** 

![](https://cdn-games.codingame.com/community/1540478-1591830398920/9ff3ed92777e95cbde858d44c0ff7d21b247811ed4a13a14d9053ecbb27a05de.png)

  
**Turn order:**   
* Player 0(**red**) is assigned black pieces and Player 1(**blue**) is assigned white pieces.
* Black always go first and white goes next.
  
**Legal action:**   
* The action must be done on an empty square, this square must also be adjacent to at least one opponent disc, this square must also be placed so that at least in one direction (horizontal, vertical or diagonally) there is a disc of the player playing, the disc must form a line over the opponent disc/discs, all the opponent discs that are on this line are flipped, if there are multiple lines, all the discs will discs affected will be flipped.
**The starting legal moves and the state of the board after black plays d3 is show below:** 

![](https://cdn-games.codingame.com/community/1540478-1591830398920/60ffca8d1f6ff4107b16fb91a1b59f36b53289f585503c77a6a645eb40a7a318.png)

  
**Resolution of a turn:** 
* A bot must output the coordinates of the square where he wants to place a disc.
  
**Output**  
* If the coordinates are outside of the board, the game will end and the other player will win.
* If the coordinates are inside but the square at those coordinates already has a disc, the game will end and the other player will win.

# Expert Rules 

* If a player has no legal moves, his turn will be passed.
* If both players have no more legal moves, the game will end and the player with more discs will win.
* If both players have the same amount of discs at the end of the game will end in a draw.
**If you output "EXPERT followed by the move", you will get an extra additional input, this input will always be given after the first output (on the next turn) and must be read after the first for loop (where board is given), this input is a string with all moves made by opponent on the last turn/turns this is given due to passes. You will also get passes made by the opponent. The moves are split by ';'.** 

Victory Conditions

* Have more discs than your opponent.

Loss Conditions

* Have less discs than your opponent.
* You do not respond in time or output an unrecognized command.

# Game Input 

Initial input

First line: The id of the player(id)   
Second line: boardSize: the number of rows and columns on the board. 

Input for one game turn

Next boardSize line: a string of characters representing one line of your grid, top to bottom. ('.': empty, '0': black, '1': white).   
Next actionCount: the number of legal actions.   
Next actionCount action: a string representing the action.   

Output

A single line containing the coordinates where you want to play. Example "d3".  
You can also print messages by doing the following. Example: "d3 MSG message".   

Constraints

Response time first turn is ≤ 2000 ms.   
Response time per turn is ≤ 150 ms.
