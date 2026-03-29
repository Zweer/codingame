# Code Keeper - The Hero

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/code-keeper---the-hero)

**Level:** multi

A skilled programmer has to swiftly navigate through maze of code, fearlessly fight encountered errors and bravely reach the imposed deadline by smartly using all available resources.   
And now is the time to show your fellow coworkers that you are a better programmer than them. Not a particularly noble cause, but... ready, steady, code!

  
# The Goal 

The goal of the game is to make the hero reach the exit of the maze alive. This may require fighting monsters and gathering necessary supplies, but also there may be some treasures along the way. 

# Rules 

Detailed rules of the puzzle. 

(You can access the game's source code on <https://github.com/acatai/CodeKeeper-TheHero>.) 

### Maze

A rectangle of **cells** of width 16 and height 12, where 0 0 is the top left corner and 15 11 is the bottom right corner. 

Each cell can be **passable** or an **obstacle**. No entity can occupy or step into an **obstacle**. 

**Moving** through the game is only possible by making steps in cardinal directions (left, right, up, down). **Seeing** or **attacking** in range n applies to all cells reachable from the entity position by making n steps in any (cardinal or diagonal) direction. 

### Hero

Only player-controlled entity. He has known x, y position and health points. Health points cannot go above 20. When they reach 0 or below, the game ends, and the score is reduced by 1000. Ending the game with an error (timeout, wrong command, etc.) sets the final score to \-10000. 

The hero can only see a portion of the maze around him, having perfect knowledge about all entities in range 3. (The visualization of fog can be turned on/off in the viewer settings.) 

During a turn, the hero can either move to an adjacent cell or attack a terget cell with one of his weapons. Hero actions are performed at the beginning of the turn, before the monsters reaction. 

### Weapons

There are four weapons the hero can use: **sword**, **hammer**, **scythe**, and **bow**. There are no limitations on using **sword**, but the remaining ones require to spend a charge. Each weapon has a separate charge counter, which is initialized to 5 at the beginning of every game. 

To use a weapon, a target cell within the valid range has to be specified. If a given cell is outside the weapon's range, no action is performed and the charge is not spent. 

* **sword**: 10 damage  
Applies damage to one cell that is a step away (in cardinal direction) from the hero.
* **hammer**: 6 damage  
Applies damage to three cells in range 1. If the given target is diagonal, the attack also hits the closest neighbours in the two adjacent cardinal directions from the hero. If the target is in a cardinal direction, it also hits the closest neighbouring cells in the two diagonal adjacent directions.
* **scythe**: 7 damage  
A target can be any cell in the chess queen move pattern limited to distance 2\. The attack applies damage to the two cells covered by a queen move pattern containing the given target cell.
* **bow**: 8 damage  
Applies damage to any single cell visible by the hero (which is in range ≤ 3).

### Monsters

Each type of monster has associated initial health, view range, attack range, and damage. If a monster health hits 0, it is destroyed and the hero score is increased by the amount of the monster's initial health. 

During a turn, monster actions are performed after the heroes' and the order in which they are acting is uniformly random in each turn. 

If the hero is within the monster's attack range, the monster attacks reducing hero's health and score by damage. If the hero is within the monster's view range but not attack range, the monster is making a step towards hero (possibly avoiding obstacles along the way). Otherwise, the monster stays in place and makes no action. 

At most one monster can occupy a cell at any moment. During the movement, each monster considers the other ones as unmoving obstacles. 

There are the following five types of monsters: 

* **Box**: 1 health, 0 view range, 0 attack range, 0 damage.
* **Skeleton**: 6 health, 1 view range, 1 attack range, 1 damage.
* **Gargoyle**: 14 health, 2 view range, 1 attack range, 2 damage.
* **Orc**: 8 health, 2 view range, 2 attack range, 2 damage.
* **Vampire**: 10 health, 3 view range, 1 attack range, 3 damage.

### Items

An item can be found only at passable cells, and there is at most one item on a single cell. A monster can stay on top of an item, but it is not influencing it in any way. 

If the hero moves into a cell containing an item, its effect is immediately applied. 

The following item types may be found in the maze: 

* **Exit**: Ends the level with success and increases the score by 10000.
* **Treasure**: Increases the score by 100.
* **Potion**: Gives up to 10 health (never exceeds the hero's maximum health).
* **Hammer**: A chest giving additional hammer charge.
* **Scythe**: A chest giving additional scythe charge.
* **Bow**: A chest giving additional bow charge.

  
**Acknowledgments**

This contribution was developed for the _**Artificial Intelligence for Games, 2021 edition**_ course, University of Wrocław, 2021.

Authored by _**Jakub Kowalski**_ ([@aCat](https://www.codingame.com/profile/b528dd3b279d7578674a1129305918e0400484)).

Map generator by [eulerscheZahl](https://www.codingame.com/profile/8374201b6f1d19eb99d61c80351465b65150051).

Additional thanks to: [@radekmie](https://www.codingame.com/profile/2b872a07bc65786f280864cadc2f635c0763881), [@Gabbek](https://www.codingame.com/profile/6c5afcae707f119ca130870235cb21a10526811).
  
  
# Game Input 

Input for one Game Turn

First line: 7 space-separated integers: 
* x: x position of the hero.
* y: y position of the hero.
* health: current health points.
* score: current score.
* chargesHammer: how many times the **hammer** can be used.
* chargesScythe: how many times the **scythe** can be used.
* chargesBow: how many times the **bow** can be used.
Next line: An integer visibleEntities for the number of visible entities.  
Next visibleEntities lines: 4 space-separated integers to describe each visible entity: 
* ex: x position of the entity.
* ey: y position of the entity.
* etype: the type of the entity:  
  * 0: exit.
  * 1: obstacle.
  * 2: treasure.
  * 3: potion.
  * 4: charge for hammer.
  * 5: charge for scythe.
  * 6: charge for bow.
  * 7: box.
  * 8: skeleton.
  * 9: gargoyle.
  * 10: orc.
  * 11: vampire.
* evalue: value associated with the entity:  
  * for monster: its current health.
  * for potion: its healing value 10.
  * for obstacle: \-1.
  * for treasure and exit: amount of score points they give (100 and 10000 respectively).
  * for charge chest: 1 if it contains hammer, 2 if scythe, 3 if bow

Output

A single line with your action: 
* MOVE x y \[message\] to move towards a given cell. x y. Optional message can be appended after.  
Moving to a cell more than one one step distant uses in-game pathfinding that takes into account only currently visible cells. Stepping into a cell containing monster automatically uses the **sword** attack. To wait, hero can move to his current position.
* ATTACK weapon x y \[message\] to attack with given weapon towards given cell. Weapon identifiers are: 0 for **sword**, 1 for **hammer**, 2 for **scythe**, and 3 for **bow**. Optional message can be appended.

Constraints

Response time for first turn ≤ 1s  
Response time for one turn ≤ 50ms  
Turn limit: 150
