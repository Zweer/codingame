# Xmas Rush

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/xmas-rush)

**Level:** multi
**Topics:** Pathfinding, Minimax, Uncategorized, Classic board games

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a **league based** challenge. 

Wood leagues should be considered as a tutorial which lets players discover the different rules of the game.   
In Bronze league, all rules will be unlocked and the real challenge will begin. 

## The Goal 

Make your way to the items on the board and be the first to complete your quests! 

## Rules 

The game is played by 2 players on a 7x7 board with 49 square tiles. The (0,0) coordinate corresponds to the top left corner. 

Each player has 1 tile placed outside the board which they can use to push a row or a column on the board, trying to make a path toward their quest items. When a user pushes a tile into the board, the tile that gets pushed out will become the new player's tile. 

**The board** 

* The board contains square tiles with paths on them. A path can lead to one of the four directions (UP, RIGHT, DOWN and LEFT).
* Some tiles have an item on them.

**Quest** 

* Each quest corresponds to an item on the board. Quests are the same for both players, but each item is unique in the deck.
* To complete a quest, a player must move to the tile containing the corresponding item. The quest must be revealed to be able to complete it.
* For this league, each player has 1 quest to complete.

**The game turns** 

Each game turn alternates between a PUSH turn and a MOVE turn. The first turn is always a PUSH turn. 

**Rules for pushing** 

* Each player can choose to push any row or column on the board. Rows can only be pushed horizontally (LEFT or RIGHT), while columns can only be pushed vertically (UP or DOWN).
* If both players push the same row or column, no matter the direction, nothing happens.
* If push commands intersect (one is horizontal and the other one vertical), the row is pushed first, followed by the column. Otherwise, they get pushed simultaneously.
* If a player is on a tile which gets pushed out of the map, the player is wrapped on the other end of the line.

**Rules for moving** 

* To allow a player to move between two adjacent tiles, the tiles' respective paths must connect to form a longer path. Moving to an adjacent tile counts as 1 step.
* Each player can move at most 20 steps during this turn via connected paths.

**Actions** 

Every PUSH turn the player must: 
* PUSH id direction: to push a row id(direction LEFT or RIGHT) or a column id(direction UP or DOWN).
Every MOVE turn the player must either: 
* MOVE direction: to move one step towards direction LEFT, RIGHT, UP or DOWN.
* PASS: to do nothing.

A MOVE can contain up to 20 directions, each direction separated by a space . 

  
Note: You may toggle tile scenery on/off in the settings panel (![](https://www.codingame.com/servlet/fileservlet?id=3463235186409)). 

Victory Conditions

* You complete all your quests before your opponent (if both players complete their quests in the same turn, the game will end as a draw).
* After 150 turns, you complete more quests than your opponent.

Loss Conditions

* Your program times out.
* Your program provides invalid output for the active turn type.
* You complete fewer quests than your opponent.

  
## Advanced Details 

You can see the game's source code here: <https://github.com/CodinGameCommunity/XmasRush>. 

* Players don't need to finish their turn on an item to collect it. Moving over it during a longer movement sequence is sufficient to complete revealed quests.
* An invalid move ends the current movement. Moving to a direction without a connected path in that direction is considered as invalid.
* It is possible to complete a quest during a push turn. If a push command warps a player onto a quest item, the quest, if revealed, is completed and another one is revealed at the end of the turn.
* If no modification of the labyrinth happens for 10 successive turns of modification, the game ends, independently of both players' movement actions.

## Game Input 

Input for one game turn

First line: Integer turnType: the game turn type: 
* 0: a PUSH turn.
* 1: a MOVE turn.
Next 7 lines: 7 space-separated strings representing each tile on a row, starting from the top. Each tile is represented by a 4 digit group, each digit corresponding to a directional path: up, right, down, left. 1 means the tile has a path for the respective direction, 0 means the tile doesn't.  
Next 2 lines: for each player, numPlayerCards, playerX, playerY, playerTile: 
* Integer numPlayerCards: the total number of quests for a player (hidden and revealed).
* Integer playerX: the player's x position on the board (the column).
* Integer playerY: the player's y position on the board (the row).
* String playerTile: the player's tile in 4 digit format.
**Note**: The player's input always comes **first**, the opponent's input comes **second**.  
Next line: Integer numItems: the total number of items available on board and on player tiles.  
Next numItems lines: itemName, itemX, itemY, itemPlayerId: 
* String itemName: the item's name.
* Integer itemX: the item's x position on the board (the column).
* Integer itemY: the item's y position on the board (the row).
* Integer itemPlayerId: the id of the player who can collect the item.
**Note**: If an item is on a player's tile, itemX and itemY will both be \-1 for the player and \-2 for the opponent.  
Next line: Integer numQuests: the total number of revealed quests for both players.  
Next numQuests lines: questItemName, questPlayerId: 
* String questItemName: the item's name.
* Integer questPlayerId: the id of the player the quest belongs to.
**Note**: The player's id is always 0 and the opponent's 1. 

Output for one PUSH game turn

* PUSH id direction where id is between 0 and 6, and direction can be UP, DOWN, LEFT or RIGHT.
Example: PUSH 3 UP will push the fourth column upwards. 

Output for one MOVE game turn

* MOVE direction where direction can be UP, DOWN, LEFT or RIGHT.
* PASS to skip moving this turn.
A MOVE can contain up to 20 directions, each direction separated by a space .  
Example: MOVE LEFT UP RIGHT will make the player move left, then up, then right. 

Constraints

board width \= 7  
board height \= 7  
numPlayerCards \= 1  
0 ≤ numItems ≤ 2  
0 ≤ numQuests ≤ 2  
  
Response time for the first turn ≤ 1s  
Response time per turn ≤ 50ms  

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

What is in store in the higher leagues? 

The extra rules available in higher leagues are: 

* In Wood 1, players must complete 6 quests. At most 1 quest is revealed.
* In Bronze, players must complete 12 quests. At most 3 quests are revealed.
