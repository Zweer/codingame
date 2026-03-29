# Vindinium

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/vindinium)

**Level:** multi
**Topics:** Flood fill, Minimax

This is a port of the game [vindinium](https://github.com/ornicar/vindinium). The port is as close to the original game as possible. There were changes made to the allowed response time per turn, the total number of turns as well as the input/output format. 

Four legendary heroes were fighting for the land of Vindinium   
 Making their way in the dangerous woods   
 Slashing goblins and stealing gold mines   
 And looking for a tavern where to drink their gold 

## The Goal 

Vindinium is a multi-player turn based dungeon crawling game. Each player has one hero that can move across a map. The objective is for players to amass the maximum quantity of gold during a predetermined number of turns. Players must take control of gold mines to produce gold; however, gold mines are protected by goblins. When a player defeats a goblin, he becomes owner of the gold mine and receives one gold per turn. Furthermore, the goblin now defends the mine against other players. Heroes can fight each other. The survivor gets control of all his opponent's gold mines. The killed hero is immediately respawned with all his gold, but no mine. When going to the tavern, heroes can buy beers for gold, restoring their life points. The objective is to create a computer program (a bot) that plays the game of Vindinium as intelligently as possible. 

## Rules 

**Maps** Maps are generated randomly. Generated maps are symmetric, and always contain 4 taverns and 4 heroes. **Hero** Heroes can move by one square each turn, and have the following attributes: 
* Life points (HP): Starting at the maximum value = 100. If HP drop to zero, the hero dies (see: Death of a hero).
* Gold: Starting at 0, this is the success indicator of the hero. At the end of the game, heroes will be scored based on their gold value.
**Resolution of a turn**  
 A bot must issue one order per turn. Possible orders are: WAIT, NORTH, EAST, SOUTH or WEST. Once the order is executed, the hero stays, or moves one square in the given direction.   
  
_Hero move_  
 If the hero: 
* Tries to step out of the map, or over a tree, nothing happens.
* Steps into a gold mine, he stays in place, and:  
  * If the mine already belongs to the hero, nothing happens.
  * If the mine is neutral, or belongs to another hero, a fight happens against the goblin guarding the mine. The hero loses 20 life points. If he survives, the mine is his.
* Steps into another hero, he stays in place and nothing happens. Hero fights are resolved at the end of the turn.
* Steps into a tavern, he stays in place and orders a beer. The hero pays 2 gold and receives 50 HP. Note than HP can never exceed 100.
* Times out, i.e. fails to send an order in the given delay, he stays in place until the game is finished. Note that he can still win if he has more gold than the other players at the end of the game.
  
**End of a hero turn**  
 After the hero has moved (or decided to stay in place), a few things happen:   
  
_Fights_   
 Heroes are quite nervous and never miss an opportunity to slap each others with their big blades. At the end of the hero turn, if there is an enemy at a distance of one square in any direction, the hero attacks the enemy. For instance, in this situation, at the end of the green Hero's turn:   
[ ![](https://i.imgur.com/qvOh4LO.png) ](https://i.imgur.com/qvOh4LO.png)   
 Green attacks blue. Green does not attack yellow because it's 2 moves away. The attacking hero doesn't lose any life point, the defending one loses 20 life points. If the defender dies (see: Death of a hero), the attacking hero obtains control of all the loser's gold mines.   
  
_Mining_   
 After the fight's resolution, he gains one gold per controlled mine.   
  
_Thirst_   
 Then, the hero loses 1 HP (because all this action made him thirsty). Note that heroes don't die of thirst. Worse case, they fall to 1 HP.   
  
**Death of a hero**   
 When a hero HP drops to 0, he ceases to live. The hero immediately respawns on the map at its initial position, with HP= 100. The hero loses control of all his gold mines, but keeps all his amassed gold. Be careful, when a hero respawns on its initial position, every opponent that may be at this position is automatically killed. So, you should avoid being at the respawn position of one of the heroes... A hero can't die of thirst. Thirst can put the hero HP to 1, but not to 0.   
  
**End of the game**   
 The game ends when the maximum number of 150 turns has been reached. The winner is the hero with the greatest amount of gold. If two players have the same amount of gold, there is no winner. 

_Thanks to [Illedan](https://www.codingame.com/profile/433c83b2f60d89f64e138f0fce10b30f8598731) for helping me with the implementation_ 

Victory Conditions

* Amass more gold than your opponents

Loss Conditions

* Amass less gold than your opponents
* You do not respond in time or output an unrecognized command.

  
## Advanced Details 

You can see the game's source code on <https://github.com/eulerschezahl/vindinium>.   
  
There are some optional game parameters that you can pass along with the seed:  
* players=2: replace the lower half of the map by water and play 1 vs 1
* turns=x: limit the turns per player
* size=x: board size
* wallPercent=x: probability of a wall
* minePercent=x: probability of a mine
  
If you output a debug message that contains "EXPERT\_INPUT", you will get a list of opponent actions before the game input for every following turn. It has the format "playerID x y". Note that this will give you the target after parsing the move. It will always be the current position of the hero or a direct neighbor to it. 

## Game Input 

Initial input

First line: the size of the board   
Next size lines: The board as strings of length size. The characters can be: 
* .: empty cell
* 0, 1, 2, 3: the spawn point of the hero with the corresponding ID
* #: wall
* T: tavern
* M: mine
Next line: The ID of your hero 
  
  
Input for one game turn

First line: entityCount: the number of entities   
Next entityCount lines: the entity represented as follows:   
type: the type of the entity, either HERO or MINE   
id: the id of the hero or the owner of a mine   
x: the x position of the entity   
y: the y position of the entity   
life: the life of a hero ( \-1 for mines)   
gold: the gold of a hero ( \-1 for mines) 

Output for one game turn

* WAIT to do nothing
* NORTH to go north
* EAST to go east
* SOUTH to go south
* WEST to go west
* MOVE x y to go the field at location (x, y) or the reachable field closest to it

Constraints 

10 ≤ size  ≤ 24 , size is even   
  
 Response time first turn ≤ 1000 ms   
 Response time per turn ≤ 50 ms
