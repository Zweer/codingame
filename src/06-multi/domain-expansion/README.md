# Domain Expansion

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/domain-expansion)

**Level:** multi
**Topics:** Flood fill, Pathfinding

The source code of this game is available [on this GitHub repository](https://github.com/Mortis66666/CG-Domain-Expansion). 

  
# The Goal 

 The aim of this game is to expand your domain. The player with the larger domain wins. 

# Rules 

 The game is played on a 7x7 board, where each cell is identified by coordinates ranging from (0, 0) in the top-left corner to (6, 6) in the bottom-right. Each player will control a token.   
  
###  Movements 

 During a player's turn, the player may either keep their token in its current location, or move it to another cell up to 3 steps away (measured in Manhattan distance). There must be an unobstructed path (not blocked by any wall or the other player's token) to be able to move to the new location. A token cannot be moved outside the board, or to a cell occupied by the other player's token.   
  
###  Wall building 

 After completing their move – or choosing not to move – the player must build a wall on any side of their token: Up, Down, Left, or Right. After a wall is built, neither player's token will be able to pass through it. A wall cannot be built on an existing wall.   
 At the start of the game, the border of the board is automatically a wall, hence you are also not allowed to build on it.   
  
###  Game over condition 

 A game is over if the walls on the board split the players to two completely separated domains, meaning that neither player can reach the cell occupied by the other player. 

Victory Condition

 You have a larger domain (more accessible cells) than your opponent's. 

Defeat Condition

* Your program does not provide a command in the allotted time or it provides an unrecognized command.
* Your program provides a command against the rules.
* You have a smaller domain (fewer accessible cells) than your opponent's.
  
  
# Game Input 

Initial input

Line 1: 2 space-separated integers width height, the size of the board

Line 2: 2 space-separated integers x y, the position of your token

Line 3: 2 space-separated integers opponentX opponentY, the position of your opponent's token

Input

Line 1: 3 space-separated integers actionX actionY actionDirection, the opponent's last action (\-1 \-1 \_ for the first turn). 

Output

A single line x y direction message, x and y denotes the position of the cell you wish to move your token to (or its current position if not moving), direction denotes the direction you wish to build your wall, message to print a message, optional.   
direction is denoted by U, D, L or R. 

Constraints

Response time for first turn ≤ 1000ms   
 Response time for one turn ≤ 100ms
