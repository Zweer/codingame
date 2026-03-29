# Coders of the Realm

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/coders-of-the-realm)

**Level:** multi
**Topics:** Flood fill, 2D array, Classic board games

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a **league based** challenge. 

Wood leagues should be considered as a tutorial which lets players discover the different rules of the game. 

In Bronze league, all rules will be unlocked and the real challenge will begin.

# The Goal 

This is a port of the board game [Kingdomino](http://www.blueorangegames.eu/pf/kingdomino/) by Bruno Cathala and Cyril Bouquet. 

The source code of the game is available [here](https://gitlab.com/matthieu.dazy/cg-kingdomino/-/tree/master). 

The goal is to build the wealthiest territory by carefully choosing and placing land tiles, thus creating the largest and richest connected zones. 

The tile textures are from [this OpenGameArt pack](https://opengameart.org/content/big-pack-of-hand-painted-tiling-textures). 

The logo has been generated on [Render Forest](http://renderforest.com). 

# Rules 

## Tiles

The game is played with land tiles. Each tile is a domino with two squares. There are 6 different terrain type: corn field, forest, grassland, lake, wetland and mine. Each square may also contain up to 3 crowns that will reinforce the value of the zone containing the square. 

Each tile has a unique ID, roughly indicating its "value". Tiles with more crowns or rare terrain types have larger IDs, whereas tiles with common terrain types and few or no crowns have lower IDs. 

Players build their own, separate territory, starting from their castle and expanding by placing new land tiles next to existing land, thus creating connected zones of the same terrain type. 

The game contains a fixed set of 48 tiles, distributed in sets over several turns. Each tile is therefore available only once in the game. In a 2- or 3-player game, only some of the tiles are put in play, so some tiles may not appear at all during the game. 

The full list of tiles is available [here](https://gitlab.com/matthieu.dazy/cg-kingdomino/-/blob/master/src/main/resources/tiles.csv)as a CSV file. 

## Game turn

On each turn, each player executes a sequence of two actions: 

* PUT a tile on their territory
* PICK the tile they will play on the next turn

The order of play in each turn is determined by the value of the chosen tiles, as explained below in the Tile choice rules section. On the first turn, the order is that of the IDE. 

In a 2-player game, 4 tiles are available for each turn and each player plays twice, excuting two separate and independent sequences of PUT \+ PICK actions. On the first turn, players do this alternatively (first player, second player, first player, second player). On subsequent turns, the order changes according to the picked tiles. 

## Tile placement rules

* Tiles may be rotated in any orientation.
* Tiles may not overlap the castle.
* The horizontal and vertical extent of the resulting territory must not exceed 5 squares.
* If a tile cannot be placed according to these constraints, it is discarded.
* There is no tile placement on the first turn.
![Examples of valid placement](https://i.imgur.com/5wXKSF2.png)  
![Examples of invalid placement](https://i.imgur.com/QyZGDH7.png)  

## Tile choice rules

* Several new tiles are available for pick on each turn: 4 for a 2- or 4-player game and 3 for a 3-player game.
* Each tile can be chosen by only one player: the first player has the most choice, the others have to pick from whatever is left.
* The tiles are ordered by ascending ID: on the following turn, the player who picked the tile with the lowest ID will play first (and get the largest choice from the new tiles), whereas the player who picked the tile with the highest ID will play last. For 2 players this means that players may perform their put+pick sequences sequentially or alternately, depending on the IDs order.
* There is no tile choice on the last turn.

## Scoring

* The game always lasts exactly 7 turns for a 2-player game and 13 turns for a 3- or 4-player game.
* Each player's territory is composed of several connected zones, each of a specific terrain type. Each zone has a value equal to its size (in number of squares) multiplied by the number of crowns contained in that zone.
* A zone containing no crowns is thus worth zero points.
* The full score of a player's territory is the sum of the scores of all zones in that territory.
* In case of a score tie, the players with the largest territory (in number of squares) each receive one extr point for tie-breaking.
* In case of a second score tie, the players with the largest number of crowns each receive one extra point for tie-breaking.
* After that, players may be tied for good.

Victory Conditions

* Be the player with the largest score.

Defeat Conditions

* Have a lower score.
* Output an invalid PICK action.

# Game Input 

Input

**Game initialization**: 

Line 1: nbPlayers: the number of players.

Line 2: nbTiles: the number of tiles in play each turn. This is 4 for 2- and 4-player games and 3 for 3-player games. 

**For each turn**: 

nbPlayers times 9 lines: each player's grid. **Your grid is always the first one**. Each line is composed of 9 sets of 2 chars representing a single grid square: 

* One char representing the terrain type: empty (\_), castle (\*), corn field (c), forest (f), grassland (g), lake (l), wetland (w) or mine (m).
* One char between 0 and 3 for the number of crowns on that square.
* The castle is always located at the center of the grid.

**IMPORTANT:** the grid given in input is larger than what the viewer displays. The viewer only shows a subwindow of the grid that fits the maximal allowed extent. 

nbTiles next lines: tileId firstSquare secondSquare playerId current: the ID of a tile being placed that turn, the two squares of the tile, in the same format as in the grid, the ID of the player who places that tile and a flag showing the tile in play this turn. **You always have player ID 0**. playerId may be \-1 in case a tile has not been picked during the previous turn. current is 1 for the tile in play this turn, 0 for the other tiles. 

nbTiles next lines: tileId firstSquare secondSquare playerId: the tiles to be picked for the next turn. playerId is \-1 for tiles that are still available for picking. 

Output

Line 1: PUT x y rotation: 

* x and y are the location of the first square of the tile.
* rotation determines the location of the second square: 0 is on the right of the first square, 1 is below, 2 is on the left, 3 is above.  
![Examples of rotation](https://i.imgur.com/DZIOUIi.png)
* In the case where there is no valid placement for the tile, values on this line are ignored - however the line still needs to be given with the expected format.
* In Wood leagues, invalid PUT commands will cause the tile in play to be discarded.

Line 2: PICK tileId message: the ID of the picked tile and an optional message to be displayed in the viewer. 

Constraints

* Both commands must always be given and correctly formatted on every turn.
* On the first turn, the values given to the PUT command are ignored.
* On the last turn, the value given to the PICK command is ignored.
* Badly formatted commands and invalid PICK actions will end the player's game. The score is still taken into account at the end of the game.

You have 1000 ms to answer on the first turn.

You have 50 ms to answer during the rest of the game.

# Coders of the Realm

After his last victorious conquest, the king is granting territories to his faithful lords as a reward for their participation in the battles. In order to avoid strife among them, the king has designed a way to ensure each lord gets a fair mix of the richer and poorer lands. 

Yet, if you are more cunning than the other lords, you might still be able to build the best land for yourself!
