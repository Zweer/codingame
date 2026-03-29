# BeeMineGame

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/beeminegame)

**Level:** multi
**Topics:** Flood fill, Pathfinding

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a **league based** challenge. 

For this challenge, multiple leagues for the same game are available. Once you have proven your worth against the first Boss, you will access the higher league and unlock new opponents. Good luck.   

Transform the gray, empty terrain into a vibrant, flowery meadow. Your neighbor, of course, came up with the same idea, but they won't do it better than you! Prove to them that your meadow will attract more bees than theirs.

  
# The Goal 

The goal of the game is to collect more points than the opponent's team within the given time. Points are scored by expanding and upgrading your territory to attract bees to it. 

# Rules 

The game lasts for 100 turns. 

### Map

The skirmish takes place on a rectangular board of size 19×9. 

The board square can have one of the following types: 

* 0, 1: square occupied by one of the players (0 is "me", 1 is the opponent).
* 2: **neutral** square.
* 3: square containing a **rock**. You cannot expand on it. The board is always surrounded by rock squares. Rocks do not appear inside the board.
* 4: square containing a **beehive**. You cannot expand on it.

### Beehives

There is a random number of beehives on the board (from 4 to 9). The positions of the beehives are fixed per game, they do not change during the match. 

### Player Territories

Each player starts with a certain initial territory. You can expand the territory by occupying squares adjacent to the area you already own. You can only occupy neutral squares. 

In each turn, the player designates the coordinates of the square on which they want to expand. You can choose a square that is not adjacent to your owned territory, then the best square moving in the given direction will be automatically calculated - and the expansion attempt will be performed on it. 

Both players move simultaneously. In case of a conflict (both players want to occupy the same square) the square remains neutral. 

### Scoring

In each turn, each beehive can reward the player with one point. The player gets a point if their territory is closer (in Manhattan metric) than the opponent's territory. In case of equal distance to both players, neither of them gets a point.

The final score is the total number of points gained throughout the game. 

  
### 🐞 Debugging Tips

* Hover over an entity to see more information about it.
* Add text at the end of an instruction to display it on your part of the fence.
* Click on the gear icon to display additional visual options.
* In particular use **Debug Mode**, to see more information about the game state. You can also turn the grid on and off.
* Use the keyboard to control actions: space for play/pause, arrows for step-by-step forward movement.

  
**Acknowledgments**

This contribution was developed for the [Lower Silesian Congress of Young Explorers](https://odkrywcy.math.uni.wroc.pl/) (in Polish), University of Wroclaw, 2025.

Authored by _**Jakub Kowalski**_ ([@aCat](https://www.codingame.com/profile/b528dd3b279d7578674a1129305918e0400484)).

Special thanks for testing and other help to [@Sko0owi](https://www.codingame.com/profile/bd53fc0e0b06bd53e633f552c346e5cf4768943) and [@Noobkins](https://www.codingame.com/profile/315f874e4d3c05e1c08e54bc3a4a5f901809535). 

  
# Game Input 

Input in Each Turn

Next 171 lines (one for each map square):  5 space-separated numbers: 
* x: square position on the x-coordinate.
* y: square position on the y-coordinate.
* type: square type (0 \- my territory, 1 \- opponent's territory, 2  neutral territory, 3 \- rock, 4 \- beehive).
* level: not used in this league.
* bees: not used in this league.

Output

A single line containing the coordinates of the square in the direction of which we are expanding our area.   
  
 Optionally, after each instruction, you can include a message (message) to be displayed at the top of the visualization. Messages up to 25 characters long will be fully displayed, longer messages will be truncated. 
* x y \[message\] to expand your territory towards the square x y.

Constraints

Response time for the first turn: ≤ 1s  
Response time for subsequent turns: ≤ 50ms  
Turn limit: 100
