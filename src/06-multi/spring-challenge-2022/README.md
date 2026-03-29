# Spider Attack

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/spring-challenge-2022)

**Level:** multi
**Topics:** Multi-agent, Resource management

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a **league based** challenge. 

For this challenge, multiple leagues for the same game are available. Once you have proven yourself against the first Boss, you will access a higher league and extra rules will be available.  
  
Starter AIs are available in the [Starter Kit](https://github.com/CodinGame/SpringChallenge2022/tree/main/starterAIs). They can help you get started with your own bot.   
  
_Introductory video by **Mathis Hammel**: <https://youtu.be/MyHjWftmMfQ>_

## The Goal 

Protect your base from monster attacks and outlive your opponent. 

## Rules 

Both players controls a team of 3 **heroes**. The teams start out at opposite corners of the map, near their **base**. Throughout the game **monsters** will appear regularly on the edges of the map. If a **monster** reaches your base, it will deal **damage**. If your base takes too much damage, you lose. 

Thankfully, your **heroes** can kill **monsters**. 

### The map 

The game is played on a rectangular map where the coordinate X=0, Y=0 is the top-left pixel and X=17630, Y=9000 is the bottom-right pixel. 

Each **base** can take a maximum of 3 points of damage before being destroyed. 

### Heroes 

Every turn, you must provide a command for each **hero**. They may perform any of the following commands: 

* WAIT, the hero remains where they are.
* MOVE, followed by map coordinates will make the hero advance towards that point by a maximum of 800 units.

After a **hero**'s move phase, any **monsters** within 800 units will suffer 2 points of damage. 

### Monsters 

Every **monster** appears with a given amount of **health**. If at the end of a turn, a monster's **health** has dropped to zero or below, the **monster** is removed from the game. 

**Monsters** will appear randomly, with a random moving direction. 

**Monsters** will always advance in a straight line at a speed of 400 units per turn. 

If a **monster** comes within 5000 units of a **base** at the end of a turn, it will **target** that base. 

When **targeting** a base, a monster will move **directly towards** that **base** and can no longer leave the map. 

If a **monster** comes within 300 units of a **base** at the end of a turn, as long as it has not been killed on this turn, it will disappear and deal the **base** 1 point of damage. 

Victory Conditions

* Your opponent's base health has dropped to zero.
* You have more base health points than your opponent after **220 turns.**

Defeat Conditions

* Your base's health reaches zero.
* Your program does not provide a valid command in time.

  
### 🐞 Debugging tips

* Hover over an entity to see extra information about it
* Append text after any command and that text will appear above your hero
* Press the gear icon on the viewer to access extra display options
* Use the keyboard to control the action: space to play/pause, arrows to step 1 frame at a time

## Game Input/Output 

Initialization Input

Line 1: two integers baseX and baseY for the coordinates of your base. The enemy base will be at the opposite side of the map.   
Line 2: the integer heroesPerPlayer which is always 3.   

Input for One Game Turn

First 2 lines: two integers baseHealth and mana for the remaining health and mana for both players. Your data is always given first. _You may ignore the mana for this league._   
Next line: entityCount for the amount of game entities currently in play.   
Next entityCount lines: 11 integers to describe each entity: 
* id: entity's unique id.
* type:  
  * 0: a monster
  * 1: one of your heroes
  * 2: one of your opponent's heroes
* x & y: the entity's position.
* shieldLife: _ignore for this league_.
* isControlled: _ignore for this league_.
The next 5 integers only apply to monsters (will be \-1 for heroes). 
* health: monster's remaining health points.
* vx & vy: monster's current speed vector, they will add this to their position for their next movement.
* nearBase: 1: if monster is **targeting** a base, 0 otherwise.
* threatFor:  
  * With the monster's current trajectory — if nearBase is 0:  
    * 0: it will never reach a base.
    * 1: it will eventually reach your base.
    * 2: it will eventually reach your opponent's base.
  * If nearBase is 1: 1 if this monster is **targeting** your base, 2 otherwise.

Output for One Game Turn

3 lines, one for each hero, containing one of the following actions: 
* WAIT: the hero does nothing.
* MOVE followed by two integers (x,y): the hero moves 800 towards the given point.
You may append text to a command to have it displayed in the viewer above your hero.   
  
 Examples: 
* MOVE 8000 4500
* WAIT nothing to do...

Constraints

Response time per turn ≤ 50ms   
Response time for the first turn ≤ 1000ms 

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png)

What is in store for me in the higher leagues? 

Extra rules available in higher leagues are: 
* Heroes can cast spells
* Fog of war
