# Blocking

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/blocking)

**Level:** multi
**Topics:** Monte Carlo tree search, Minimax

# The Goal 

 Blocking is a turn-based game, where the objective is to maximize your score by placing a maximum of shapes on the board.   
This game is inspired from <https://www.mattelgames.com/en-us/strategy/blokus>   

# Rules 

The game is played on a NxN grid.

As usual in Codingame, the top left corner is X=0, Y=0\. X axis from 0 to N-1 goes from left to right. Y axis from 0 to N-1 goes from top to bottom.

The shapes potentialy available to each player are identified by a letter from 'A' to 'U'.

![](https://imgur.com/XU7bHgl.png) 

Game can be played by 2, 3 or 4 players numbered from '0 to '3'

Shapes 'A', 'B', 'C' & 'D' are always available.

Shapes from 'E' to 'U' are randomly selected at each game depending on the number of players

Each player has exactly the same shapes than the others at the beginning of the game.

* For a 2 players game, each player owns a total of 18 shapes.
* For a 3 players game, each player owns a total of 13 shapes.
* For a 4 players game, each player owns a total of 10 shapes.

These numbers of shapes are defined to keep the "density" of the game at the same level for each number of players.

The first shape played by each player must cover a corner square.

* 0,0 for player 0.
* N-1,N-1 for player 1.
* 0,N-1 for player 2.
* N-1,0 for player 3.

For a 3 players game, to deal with the advantage of the proximity of an open zone, players 0 and 1 have to play shape A, B, C or D at the first round.

Players take turns laying down one piece at a time. Each new shape must touch at least one other piece of the same color, but only at the corners. Shapes of the same color can never touch along a side.

One player can play a shape from his set only once.

Shapes can be flipped before being played.

![](https://imgur.com/AmAMru6.png) 

Or rotated 1 to 3 times.

![](https://imgur.com/Sm9X38c.png) 

Or flipped 1 time and rotated 1 to 3 times.

![](https://imgur.com/d6Dp1aP.png) 

The orientation a shape is formalized through the shapeLetter-\[0-1\]the flip number-\[0-3\]the rotate number. The previous diagram define the 8 possibles states of the Q shape Q00 Q01 Q02 Q03 on the first line and Q10 Q11 Q12 Q13 on the second line.

To issue a move a player must provide x-y of a valid connected cell for the player's color and the number of the square of the oriented shape to place over x-y.

For a first move with Q, player 0 can say : 0 0 Q001 or 0 0 Q033 or 0 0 Q101 or 0 0 Q113\. Resulting boards after 0 0 Q001 and 0 0 Q113 are exacty the same.

Victory Conditions

* Have more points than your opponent(s).

Loss Conditions

* Have less points than your opponent(s).
* Not respond in due time or output an invalid command.

# Game Input 

Initial input

First line: Number of shapes: 10 or 13 or 18\.   
Each shape: Letter, col, row, definition: '#' and '.' defining the rows of the shape from up to down, '#' are numbered from 1 and from left to right.   
Next line: Number of players: between \[2-4\].   
Next line: Current player id: between \[0-3\].   
Next line: Board Size: N=13.   
Next line: String containing Letters of authorized shapes for this game: some letters in \['A'-'U'\].   

  
Input for one game turn

First N lines: rows of the board, top (row 0) to bottom (row N-1).   
Each line: a single row consisting of N characters : \['0'-'3'\] cell occupied by this player, '.' free cell, 'x' free cell well connected for current player.  
Next : Number of played moves made by others players.  
Each move: player id \['0'-'3'\], column \[0-(N-1)\], row \[0-(N-1)\], oriented shape 4 char string.  
Next : Number of valid unique possible move for the current player.  
Each move: column \[0-(N-1)\], row \[0-(N-1)\], oriented shape 4 char string.  

  
Output for one game turn

A single line containing an action: two space-separated integers column row followed by an oriented shape.   
Example: 0 0 A001 

  
Constraints

Response time for first turn ≤ 1s  
Response time for one turn ≤ 200ms
