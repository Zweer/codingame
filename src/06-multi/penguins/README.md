# Penguins

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/penguins)

**Level:** multi
**Topics:** Uncategorized, Classic board games

# The Goal 

This game is a port from the board game (league 1): Hey, Thats my fish! (en/us), Pinguinos (sp), Pingouins (fr) by Günter Cornett and Alvydas Jakeliunas.   
In the game, penguins hunt fish by jumping from ice block to ice block, trying to catch as many fish as possible, while taking care not to be blocked or isolated on the ice.   

# Rules 

The board contains a grid of ice block

Each ice block contains 1, 2 or 3 fish

An Ice block with 0 fish is considered a sea hole, and must be avoided.

  
 The game is played on a hexagonal grid 7 or 8 cells wide and 8 high.

  
![](https://imgur.com/izE2XbR.png)

  
The site <https://www.redblobgames.com/grids/hexagons/> is a goldmine of information about working with hexagonal grids.   

Each player has:

* 4 penguins (2 player game)
* 3 penguins (3 player game)
* 2 penguins (4 player game)

Move a penguin:

The player chooses one of his penguins and moves it respecting the following constraints:

* If all the player's penguins have not be placed, the player must put a penguin on the board on a free ice block.
* A penguin must move in a straight line, in one of the 6 directions that surround its ice block.
* A penguin can advance as many spaces as the player wants.
* A penguin cannot cross another penguin or a sea hole (a block of ice previously removed).
* For example, the penguin on F4 can move on F5, E5, E4, D4, F3, G2, G1 but not on G4, H4 (hole in G4) and not on E6, D7, E8 (penguin in E6).  
    
![](https://imgur.com/XtQ64Vs.png)

Remove a block of ice:

* The player removes the ice block on which the penguin started and eats all the fishes which were on the starting ice block.
* After the move, the player adds some points to their score:  
  * One fish: 100 points
  * One ice block removed: 1 point

The game ends when no player has any possible moves left. 

If only one player is still in the game, the game could end early if the last player is winning.

Victory Conditions

* Score more points than your opponent(s) at games end.

Loss Conditions

* Score less points than your opponent(s) at games end.
* You do not respond in due time or output an invalid command.

# Game Input 

The program must first read the game state input data from standard input. Then, provide to the standard output one line with the player's move.

Initial input

First line: nbPlayers: the number of players in game.   
Second line: playerId: the ID of the player. '0', '1, '2, '3'.   
Third line: nbPenguinsPerPlayer: the number of penguins avalable for each player. 

Input per turn

First line: nbRows: the number of lines of the board.   
Next nbRows lines: iceBlockLine: each char of the string is the number of fish on the ice block. If it is 0 it is a hole. First line is A1, B1, C1 ..., second line is A2, B2, ...   
Next nbPlayers lines: score: the score of each players.   
Next nbPenguins: the number of penguins on the board.   
Next nbPenguins lines: id: id of the penguin ownerId: player id of the owner of the penguin pos: position of the penguin.   
Next nbActions: the number of actions available.   
Next nbActions lines: actions   

Output

A single line:  MOVE "id of your own penguin" "coordinate of the ice block \[letter\]\[number\]". This can be followed by an optional message to display introduced by the 'MSG' keyword. Example: "MOVE 1 C7 MSG Hello". 

Constraints

Allotted response time to output is 1 s for the first turn, then 50 ms for the other turns.
