# Botters of the Galaxy

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/botters-of-the-galaxy)

**Level:** multi
**Topics:** Programming Fundamentals, Algorithms, Multi-agent

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a **league based** challenge. 

For this challenge, multiple versions of the same game are available. Once you have proven your skills on this first version, you will access a higher league and extra rules will be unlocked. 

# The Goal 

Eliminate the enemy heroes or destroy your opponent's tower. 

# Rules 

The game is played on a map 1920 units wide and 750 units high with 2 players.  
The coordinate X=0, Y=0 is the top left pixel.

Each player controls a hero of their choice, which they pick before the game begins by outputting each hero’s name.

The teams start out on opposite sides of the road stretching along the map.

An allied tower is placed for each team next to their starting position. Each player must protect their own tower, while trying to destroy their opponent's tower.

  
**The Heroes**  
  
You can select from following heroes:  
DEADPOOL   
DOCTOR\_STRANGE  
HULK  
IRONMAN   
VALKYRIE  

  
**Actions**  
  
Every turn your heroes must perform one of the following actions: 

* WAIT
* MOVE x y move towards (x, y)
* ATTACK unitId try to attack unitId
* ATTACK\_NEAREST unitType attacks nearest entity of given type
* MOVE\_ATTACK x y unitId move towards (x, y) and attacks unitId

Victory Conditions

* Destroy the enemy tower
* Kill the enemy hero

Lose Conditions

* Output wrong command
* Your program times out

# Expert Rules 

  
**Collisions**  
  
There are no collisions between entities.

  
**Round types**  
  
There are two different types of turns in this game.   
  
The first one is for hero picks and occurs at the beginning of the game. When the input variable roundType is negative, you must output the name of the hero you want to play. If you output  WAIT  instead of a hero name, a hero will be selected for you.   
  
The second type of turn is a normal game turn where you have to fight your way towards the win conditions. roundType will be positive and its value will represent the amount of heroes that you have to order.

  
**Game Entities: Heroes / Towers**   
  
Every entity has the following attributes:  
* unitId
* team \- the team they belong to
* type \- it can be an Unit / Hero / Tower / Groot(Neutral Unit)
* attackRange \- the distance from which entities can attack
* health \- the current amount of damage they can take before they die
* mana \- the current amount of mana they have available to perform their skills
* attack\_damage \- the amount of damage they can deal with an ATTACK command
* movement\_speed \- the distance they can travel in a single turn. An entity will stop where it arrives and won't travel any further until the following round.
* Entities also have maxHealth and maxMana. These represent the maximum values of health and mana they can have.  
    
Towers are stationary. They do not move. Ever.

  
**Spawn Locations**  
  
Hero for player 0 spawns at:  
x: 200, y: 590  
Hero for player 1 spawns at:  
x: 1720, y: 590  

  
**Hero stats**  
  
| Stats                                                           |
| --------------------------------------------------------------- |
| DEADPOOL                                                        |
| health 1380mana 100damage 80move speed 200mana regen 1range 110 |
| HULK                                                            |
| health 1450mana 90damage 80move speed 200mana regen 1range 95   |
| VALKYRIE                                                        |
| health 1400mana 155damage 65move speed 200mana regen 2range 130 |
| IRONMAN                                                         |
| health 820mana 200damage 60move speed 200mana regen 2range 270  |
| DOCTOR\_STRANGE                                                 |
| health 955mana 300damage 50move speed 200mana regen 2range 245  |
  
  
**Attacking**  
  
Heroes have an attack time of 0.1 and units have an attack time of 0.2  
  
Ranged heroes require an additional attack time \* distance / attackRange for their projectiles to hit the target.   
  
A hero is ranged if their attack attackRange is greater than 150.  
  
If a target is out of range, your hero will first move closer towards the target and then try to attack it. This helps a lot if you're only slightly out of range.  
  
The time used to move is distance / moveSpeed   
  
So if your hero has 75 range and travels a distance of 100 on the map, at 200 moveSpeed, it uses up 100 / 200 \= 0.5 turn time and still has half the turn left to attack. The attack will take place at 0.5 \+ 0.1 since the hero is melee in this case.  
  
The distance to the target still needs to be equal or smaller to the hero's range for the attack to take place.  
  
Attacks with an attack time higher than 1 don't carry over to the next round.  
  
ATTACK\_NEAREST unitType : works like a regular attack command, except it attacks nearest entity of given type.  
MOVE\_ATTACK x y unitId : your hero first moves to target location and then executes the attack, only if enough time is left during the current round to hit the target and if the target is within attackRange. 

  
**General information**  
  
Overall it looks complex, but it's far simpler than it looks.

  
For more details you can check the [Referee on GitHub](https://github.com/Illedan/BOTG-Refree) 

# Game Input 

Initialization input

Line 1: your team’s number, can be either 0 or 1.  
Line 2:bushAndSpawnPointCount the number of bushes and spawn points  
  
Next bushAndSpawnPointCount lines: String entityType \[Bush, Spawn\], Integer x, Integer y, Integer radius  
  
Next Line: itemCount the total number of items available in game.  
Next itemCount lines: 
* String itemName
* Integer itemCost
* Integer damage
* Integer health
* Integer maxHealth
* Integer mana
* Integer maxMana
* Integer moveSpeed
* Integer manaRegeneration
* Integer isPotion \[it’s a potion if it’s equal to 1\]

Input for one game turn

Line 1: your gold amount as Integer  
Line 2: your opponent’s gold as Integer  
Line 3: roundType an Integer that lets you know if you’re in the Hero pick phase or during the actual game phase.  
Line 4: entityCount a number that represents the sum of all heroes, units, towers and neutral creatures currently on the map  
  
Next entityCount inputs of: 
* Integer unitId the unique number to identify a unit
* Integer team the team the unit belongs to
* String unitType the type of unit \[UNIT, TOWER, HERO, GROOT\]
* Integer x
* Integer y
* Integer attackRange the range from which a unit can attack
* Integer health current health
* Integer max\_health maximum health
* Integer shield temporary extra health
* Integer attack\_damage the damage this unit can do with a single attack
* Integer movement\_speed
* Integer stun\_duration the amount of turns this unit is stunned for
* Integer gold\_value the bounty / gold reward given when this unit is killed by an enemy
  
  
If the unitType is a HERO it will also have:  
* Integers countDown1, countDown2 and countDown3 representing the countdown on each skill before next skill usage is possible
* Integer mana current mana, this is needed to cast spells
* Integer maxMana maximum mana
* Integer manaRegeneration the amount of mana regenerated each round
* String heroType the hero's name \[DEADPOOL, HULK, VALKYRIE, DOCTOR\_STRANGE, IRONMAN\]
* Integer isVisible \[1 if visible\]
* Integer itemsOwned the amount of items in the hero inventory

Output for one game turn

Depending on the value of roundType your output must be either a hero pick or a hero command.   
  
If roundType is negative you must select a hero:   
**One Output line:** heroName must be one of the available heroes DEADPOOL, DOCTOR\_STRANGE, HULK, IRONMAN, VALKYRIE   
If roundType is positive, it means you own roundType heroes and you must output:   
**One line for each living hero you own, containing any of the following actions:** 
* WAIT
* MOVE x y
* ATTACK unitId
* ATTACK\_NEAREST unitType \[UNIT, HERO, TOWER, GROOT\]
* MOVE\_ATTACK x y unitId
* BUY itemName
* SELL itemName
To print a custom message in the game: \[your command\];\[your custom message\] (ex: MOVE 1 2;BotG, best game!) 

Constraints

Response time for first turn ≤ 1000ms   
Response time for one turn ≤ 50ms

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

What is in store for me in the higher leagues? 

The extra rules available in higher leagues are: 
* Buying items and last/hit deny mechanic.
* Neutral creatures, bushes and a 2nd hero.
* Hero skills.

## Galaxies at War

The armored towers rose above the desolated area, stretching into the collapsing skies of two fusing pocket universes.

Droves of mighty raccoons broke the silence as they emerged from their strongholds where they had been lying in wait. Now relentlessly marching forward into the rocky desert, they sought to destroy the intruders.

The intruders were the ones who came to take down the dark armies and put a stop to their conquest.

When the boulder sized fist hit, it was hard and unforgiving. Their bodies were flung away, clearing the path. A skillful lance wielder was keeping them at bay, while the ground was scorched to seal them away.

Heroes had gathered! 

“You know the plan, right?” asked Ironman.

“It's all about taking over the towers and control the bots so we can take over the galaxy.”

“No, it's not! We are here to save the galaxy from the raccoons!” exclaimed Valkyrie.

“Have you lost touch with ...” Reality? Doctor Strange was about to ask, but then a sudden realisation came to mind. They had been fighting alongside alternate versions of themselves from different universes. It was uncertain which reality came into question. 

A heavy gaze turned inwards the group. Eyes widened, fists clenched and stares intensified.

“Justice will prevail,” growled Hulk.

“Hah, agreed. Whose justice though?” asked Deadpool.

“Fine, we each have a side to play on, so let's sort out things properly,” said the other Deadpool.

And there inbetween, within the twilight of the colliding bubble universes, they were battling. Each one of them fighting to uphold their own morals. As the worlds were falling apart they were trying to prove whose justice is true justice. To themselves and to the others, to the silent witnesses who could no longer stay silent …
