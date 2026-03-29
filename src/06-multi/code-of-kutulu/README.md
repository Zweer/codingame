# Code of Kutulu

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/code-of-kutulu)

**Level:** multi
**Topics:** Flood fill

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a **league based** challenge. 

For this challenge, multiple versions of the same game are available. Once you have proven your skills on this first version, you will access a higher league and extra rules will be unlocked. 

## The Plot 

## Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn 

> That is not dead which can eternal lie. In strange aeons even death may die 

  
You and your team of explorers have discovered the crypt of Kutulu. It was the worst idea you have ever had since he wasn't ready to be awakened and wants you dead. But the tomb is a real labyrinth and you can't remember where the exit was... If it still has one!   
Oh... and it seems that Kutulu wasn't alone, he is now sending the Deep Ones after you.   
  
Try to be last man standing of your crew but remember that alone you will not last longer... 

## Rules 

_All distances are by default [Manhattan distances ](https://en.wikipedia.org/wiki/Taxicab%5Fgeometry)if not specified._ 

The game is played on a map with width cells wide and height cells high with 4 players. The map is picked amongst a set of already generated maps.   
The {0,0} coordinate is the top left corner. 

**Units** 

Each player is an explorer lost in the map. The explorer's stats are shown next to your avatar. Each explorer starts with a sanity of 250 . You must be the last explorer to reach 0 sanity.   
Passively, explorers lose 3 sanity each turn due to the fear caused by the environment.   
When another explorer is up to 2 cells away from you, even if there is a wall in between, **you reassure each other and thus lose only 1 sanity instead** . 

Wanderer spawns are placed on the map at fixed positions. They summon wanderers , a type of minion (detailed below).   
Kutulu regularly invokes wanderers to strike fear into the hearts of those who would desecrate his tomb. After a few turns, and regularly thereafter, a wanderer will be spawned at the spawnpoint that is furthest from any player (ignoring walls).   
You have a few turns to get ready before wanderers start spawning.   
When a wanderer reaches your cell, it _spooks_ you and then disappears. You will lose 20 sanity. 

**Actions**   
Every turn your explorer must perform one of these actions. 

* WAIT : you'll stay in place. You coward.
* MOVE x y : Your explorer will take a step closer to the cell at {x,y} (via the shortest path), or wait if that cell is unreachable.

# Game Input 

Initialization input 

Line 1 : width an integer for the width of the map   
Line 2 : height an integer for the height of the map   
Next height lines : A string representing each row of the map starting from the top. Each character encodes a cell as follows   
* \# : wall
* w : spawn for wanderers
* . : empty cell
  
One line: 4 integers to read. No signification yet. 

Input for one game turn 

First line: An integer entityCount for the number of entities on the field (including spawning minions).   
Next entityCount lines: Each entity represented as follows:   
* String entityType the type of entity amongst those: EXPLORER | WANDERER
* Integer id the unique identifier of a unit, -1 for an effect
* Integers x & y the position of the entity.
* Integer param0  
  * Explorer: sanity
  * Spawning minion: time before spawn
  * Wanderer: time before being recalled
* Integer param1 :  
  * Explorer: ignore for this league
  * Minion: Current state amongst those -> SPAWNING = 0 , WANDERING = 1
* Integer param2 :  
  * Explorer: ignore for this league
  * Minion: id of the explorer targeted by this minion. -1 if no target

Note: the explorer you control is the **first** given entity. The id may not necessarily be 0\. 

Output for one game turn 

One line : the action of your explorer which can be on of these: 
* WAIT
* MOVE x y

You can also display a message by adding a few characters after your command, such as WAIT Feast is over, and the lamps expire 

Constraints 

10 ≤ width ≤ 24   
10 ≤ height ≤ 20   
0 ≤ spawns ≤ 8   
  
Response time first turn ≤ 1000ms   
Response time per turn ≤ 50ms
