# Crystal Rush

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/crystal-rush)

**Level:** multi
**Topics:** Programming Fundamentals, Data Structures, Algorithms, Multi-agent, Resource management

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a **league based** challenge. 

For this challenge, multiple leagues for the same game are available. Once you have proven your skills against the first Boss, you will access a higher league and extra opponents will be available. 

## Goal 

There exists is a rare and valuable **crystal ore** which is only found on inhospitable planets. As one of two competing mining companies, you must control the robots on-site to unearth as much ore as you can. 

Deliver more crystal ore than your opponent! 

## Rules 

Both players control a team of several **robots**. The teams start out at the same points on the map, at the **headquarters**. The robots can use **radars** from the headquarters to detect and mine crystal ore veins. They may also trap certain areas of the map with **EMP traps**. These can be triggered by robots which are then rendered inoperable. 

  
**The map**

  
The game is played on a grid 30 cells wide by 15 cells high. The coordinates x=0, y=0corresponds to the top left cell. 

The first column of cells is considered to be part of the **headquarters**. This is where **Crystal ore** must be returned to once mined and where objects are requested.

The cells that contain crystal ore are called **vein cells**. Veins are not visible to the players unless they are within the range of the player's radar. There are no vein cells in the headquarters.

Robots can drill a **hole** on any cell (except the headquarters'). Holes are visible to both players and do not impede movement.

  
**Robots**

  
Each robot can hold 1 **item** in its inventory.

A robot may:

* REQUEST an item from the headquarters.
* MOVE towards a given cell.
* DIG on a cell. This will, in order:  
  1. Create a **hole** on this cell if there isn't one already.
  2. Bury any item the robot is holding into the hole.
  3. If digging on a **vein cell** and ore was not buried on step 2, place one unit of ore into the robot's inventory.
* WAIT to do nothing.

Details:

* Robots may only dig on the cell they occupy or neighbouring cells. Cells have 4 neighbours: up, left, right, and down.
* Robots on any cell part of the headquarters will automatically deliver any ore it is holding.
* Robots can occupy the same cell.
* Robots cannot leave the grid.
* Robots' inventories are not visible to the opponent.

**Items**

  
**Crystal Ore** is considered an item and should be delivered to the headquarters to score 1 point.

At the **headquarters**, robots may request one of two possible **items**: a RADAR or a TRAP.

If an item is taken from the headquarters, that item will no longer be available for the robots of the same team for 5 turns.

A **trap** buried inside a **hole** will go off if any robot uses the DIG  command on the cell it is buried in. The EMP pulse destroys any robots on the cell or on the 4 neighbouring cells. Any other trap caught in the pulse will also go off, causing a chain reaction.

A **radar** buried inside a **hole** will grant the ability to see the amount of buried ore in **veins** within a range of 4 cells, for the team which buried it. If an opponent robot uses the DIG on the cell the radar is buried in, the radar is destroyed. 

  
**Action order for one turn**

1. If DIG commands would trigger **Traps**, they go off.
2. The other DIG commands are resolved.
3. REQUEST commands are resolved.
4. Request timers are decremented.
5. MOVE and **WAIT** commands are resolved.
6. **Ore** is delivered to the **headquarters**.

Victory Conditions

* After `200` rounds, your team has delivered the most crystal ore.
* You have delivered more ore than your opponent and they have no more active robots.

Defeat Conditions

* Your program does not provide one valid command per robot in time, including destroyed robots.

## Technical Details 

* Robots can insert ore into a cell, the cell becomes a **vein**.
* Each robot, radar and trap has a unique id.
* Receiving an item from the **headquarters** will destroy any item a robot may already be holding.
* When several robots of the same team request an item, robots with no item will be given priority for the request.
* Traps have no effect on buried radars and ore.
* If a robot holding an item is destroyed, the item is lost.

## Game Input 

Initialization Input

Line 1: two integers width and height for the size of the map. The leftmost column are cells with access to the headquarters.   

Input for One Game Turn

First line: Two integers:   
* myScore for the amount of ore you delivered to the elevator.
* enemyScore for the amount ore your opponent delivered to the elevator.
Next height lines: each line has width \* 2  variables: ore and hole.  
ore is: 
* ? character if this cell is not within range of a radar you control.
* A positive integer otherwise, for the amount of ore this cell contains.
hole is: 
* 1 if this cell has a hole on it.
* 0 otherwise.
  
  
Next line: Three integers 
* entityCount for the amount of robots, radars and traps currently visible to you.
* radarCooldown for the number of turns until a new RADAR can be requested.
* trapCooldown for the number of turns until a new TRAP can be requested.
Next entityCount lines: 5 integers to describe each entity 
* entityId: entity's unique id.
* entityType:  
  * 0: one of your robots
  * 1: one of your opponent's robots
  * 2: one of your buried radars
  * 3: one of your buried traps
* x & y: the entity's position.  
 If this entity is a destroyed robot, x y will equal \-1 -1
* item: if this entity is a robot, the item this robot is carrying:  
  * \-1for nothing
  * 2for a radar
  * 3for a trap
  * 4for a unit of crystal ore

Output

5 lines,  one for each robot, in the same order in which they were given, containing one of the following actions: 
* WAIT: the robot does nothing.
* MOVE x y: the robot moves 4 cells towards the given cell.
* DIG x y: the robot attempts to bury the item it is carrying in the target cell, retrieve ore from the cell, or both. **If the cell is not adjacent, the robot will execute a MOVE command towards the target instead.**
* REQUEST followed by RADAR or TRAP: the robot attempts to take an item from the **headquarters**. If the robot is not on a headquarters cell, the robot will execute the MOVE 0 y command instead, where y is the ordinate of the robot.
You may append text to a command to have it displayed in the viewer above your robot.   
  
 Examples: 
* MOVE 8 4
* WAIT nothing to do...
You must provide a command to all robots each turn, even if they are destroyed. Destroyed robots will ignore the command.

Constraints

Response time per turn ≤ 50ms   
Response time for the first turn ≤ 1000ms 

## Getting Started

Why not jump straight into battle with one these **Starter AIs**, provided by the Unleash The Geek Team: 
* C++ <https://gist.github.com/CGjupoulton/a4053faf94bc3fe2b4db3e71d6253ac5>
* C# <https://gist.github.com/CGjupoulton/557d990b31b79538f6e44709efd66968>
* Java <https://gist.github.com/CGjupoulton/f273031a12f552c145602582115f2b25>
* JavaScript <https://gist.github.com/CGjupoulton/d258d155c0dd443d16035c372bb58525>
* Python <https://gist.github.com/CGjupoulton/e93512f74336aeef97a2c2a52b381e20>

You can modify them to suit your own coding style or start completely from scratch. 

Other starters may become available [here](https://gist.github.com/CGjupoulton/).
