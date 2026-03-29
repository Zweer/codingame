# Space Shooter

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/space-shooter)

**Level:** multi
**Topics:** Simulation, Physics

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a league based challenge. 

For this challenge, three leagues for the same game are available. Once you have proven your skills against the Boss, you will access a higher league and extra rules will be available. 

## The Goal 

Win. Don't die.

Shoot at your enemy with bullets and missiles, watch out for their weapons. Be careful - the forcefield, which was used to trap your enemy, seems to also be keeping you inside. Keep away from the edge - crash with the forcefield will destroy your ship! 

# Rules 

The game is played on a map 1700units wide (along x axis) and 1080units high (along y axis). Point (0,0) is in the upper left corner. 

  
You and your opponent each own one starship, which has 10health points. 

  
The ship has an infinite number of bullets. 

  
The bullet can be shot every two turns. It detonates automatically in the first tick, when its distance to the closest enemy unit, that was in its damage radius, starts to increase. Ending its lifetime (after 7turns), or going out of health points (a bullet has its own 10health points) also detonates the bullet. 

Bullet's damage radius is 120, the damage caused at the bullet's position is 10and decreases linearly with the distance to it, reaching 0at damage radius. The bullet is shot with the given velocities along each axis (in relation to the ship), with the resultant velocity being clipped to be at most 100. 

  
The ships start at symmetrical positions, close to the center of the board.

 Ships move with the given acceleration along each axis, with the resultant acceleration (interpreted as a vector) being clipped to length 10. 

  
 Hitting the edge of the board immediately sets the unit's (ship's or bullet's) health to 0, causing it to die/detonate. 

  
Keep in mind that your own weapons are as harmful to you as your opponent's!

  
Each game turn consists of 5ticks, so that the units' positions are updated 5 times a turn.   
  
 Each turn takes exactly 1 time unit, so that every tick takes 1/5 of a time unit - for example, a ship moving with the speed of 10 will travel 2 units of space every tick, so 10 every turn. 

  
The player whose ship reaches 0health points first - loses. 

  
The game lasts up to 100 turns. If both players survive that long, it's a draw. 

  
Stats summary:   
  
| unit   | number of | damage | damage radius | health | lifetime | max acceleration |
| ------ | --------- | ------ | ------------- | ------ | -------- | ---------------- |
| ship   | 1         | \-     | \-            | 10     | \-       | 10               |
| bullet | ∞         | 10     | 120           | 10     | 7        | \-               |
  
  
Note that there is a debug mode available in the game settings! 

**Acknowledgment**

This contribution was developed for the _**Programming Programming Games**_ course, University of Wrocław, 2021.

Authored by _**Michał Opanowicz**_ ([@MichalOp](https://www.codingame.com/profile/c8fbe194ecea052756348280ed3ae8ee6584812)), _**Katarzyna Miernikiewicz**_ ([@Manwi23](https://www.codingame.com/profile/068eb3c4e38aeac8038b14288804fb497707273)), _**Agnieszka Pawicka**_ ([@Agn](https://www.codingame.com/profile/c70bc4ee60fd15da0ffe221d1439d82c0542212)). 

Supervised by _**Jakub Kowalski**_ ([@aCat](https://www.codingame.com/profile/b528dd3b279d7578674a1129305918e0400484)). 

## Game Input 

Input for one game turn

Line 1: One integer units for the number of units on the board.   
Next units lines: Two integers unit\_id, faction, being the unit's unique ID and faction (1for the player, \-1for the opponent), one char type being Ship or Bullet, six floats health, position\_x, position\_y, velocity\_x, velocity\_y, gun\_cooldown for the unit's health points left, its position on each axis and velocity on each axis, followed by gun cooldown, which indicates the number of turns till the next bullet can be shot if this unit is a ship, \-1 otherwise.   

Output for one game turn

1 line, a command for your ship in the form:  unit\_id | A x y | F x y , having one or more commands for the ship separated by |. unit\_idis your ship's ID. You can also use Sinstead of unit\_id. x,yare both dot-formatted doubles - if given with more precision than 2 decimal places, then rounded up to at most 2 decimal places. 

  
Available commands:  

* \[A | ACCELERATE\] ax ay  \- put acceleration axon x-axis, ayon y-axis (with instant effect)
* \[F | FIRE\] vx vy  \- fire a bullet with velocity vxon x-axis, vyon y-axis (relative to ship)
* \[P | PRINT\] message  \- print a message - it can also be a multiline one, with lines split with an escaped newline symbol ("\\\\n")
* \[W | WAIT\]  \- do nothing
  
  
Example outputs:  
  
You want to put acceleration (0, -4) on your ship, which has id 23, and at the same time fire a bullet with velocity (relative to the ship) (2, 1).  
23 | A 0 -4 | F 2 1   
  
You want to not do anything in this turn.  
23 | W   
  
You want to only fire a bullet with velocity (relative to the ship) (1, 1) and print "Hello there" and a debug information (note that 'S' is used instead of unit\_id).  
S | F 1 1 | P Hello there   
  
![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png)

What is in the higher league? 

Missiles! They have their own engines and can be moved around just as your ship. A deadly weapon.
