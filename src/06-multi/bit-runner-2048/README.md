# Bit Runner 2048

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/bit-runner-2048)

**Level:** multi
**Topics:** Simulation, Genetic Algorithm

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

Summary 

Made by Illedan, pb4 and Agade!  
  
Welcome to Bit Runner 2048!   
  
Since community games do not feature silver/gold/legend leagues, we will use wood leagues as equivalents.   
The rules of the game will not be introduced gradually: you are playing the full game from the beginning!   
  
Good luck! 

**Winners of the contest, lasting from 19th of April to 12th of May 2019, are: reCurse, Neumann and RoboStac!** 

![](https://i.imgur.com/ex8vdBy.png)   

# The Goal 

Capture more prisoners than your opponent.  

# Rules 

Two players face off in a circular map.   
Each player controls 2 cars. Cars are used to pick-up prisoners, and put them in solitary confinement.   
  
**The Map**

The playing field is a Prison yard, represented with a circle of radius mapRadius units. The coordinates X=0, Y=0 represent the point at **the center**.   
A manhole is located in the center of the field. It is circular, with a radius of centerRadius units.   

**The Prisoners** 

Prisoners are located in escape pods with a radius of 100 units.   
 At the start of a game, Prisoners are placed **randomly** across the map.   
 A game always starts with 2 Prisoners.   
 Players must capture them to score points!   
 Prisoners roll on the playing field and are not subject to friction.   
  
**The Cars**

A Car is a disc of radius 400 units.   
**Cars generate a magnetic field, which allows them to grab the prisoners' escape pods when they are separated by a distance lower than the Car's radius.**   
 Cars glide on the playing field and are subject to friction.   
  
**Game mechanics**

**To score one point**, a Player must drop a prisoner into the man hole.   
 A new Prisoner will appear on the edge of the prison yard. 2 Prisoners are always around trying to escape.   
  
**To move a car**, you must print the **X Y coordinates of a target destination** and a **thrust** between 0 and 200.   
The Car will pivot towards the destination, by a maximum of 18 degrees.   
It will then apply thrust in that direction. Careful, the faster a Car goes, the harder it is to control!   
  
 It is impossible to leave the prison yard. Cars and Prisoners will bounce off the electric fence on the edge of the yard. **Beware, Cars will rebound with surprising momentum!**   
 Collisions occur between the pairs: Car-Car, Car-Fence, Prisoner-Fence.   
  
**If the center of a Prisoner enters the radius of a Car, the Prisoner is magnetically attached to the Car.**   
  
The Car's magnetic field is not sufficient to keep hold of a Prisoner during strong collisions. **If two Cars collide with an impulse stronger than minSwapImpulse units, the eventual control of a Prisoner is transferred from one Car to the other.**   
 The game ends after 250 turns or as soon as one player has captured 10 prisoners.   
 If a player does not provide output in time or provides incorrect output, they are eliminated and the game ends immediately. If both players are eliminated on the same turn, they will be tied regardless of their score.

Victory Conditions

* Be the first player to capture 10 prisoners.
* Be the player with the most captures after 250 turns.
* In case of a tie according to the rules above, be the first player to have scored the last point.

Lose Conditions

* Your opponent wins.
* Your program does not provide output in time.
* Your program provides invalid output.

# Expert Rules 

* You can find the game's source code on Github: <https://github.com/Illedan/Bit-Runner-2048>
* To grab a Prisoner, the distance between the center of the Car and the center of the Prisoner must be less than or equal to the **Car's radius - 1**.
* To score one point, the Car must have grabbed a Prisoner and the distance between the man hole and the Car's center point must be less than or equal to the **Man hole's radius - 1**. A new Prisoner will be spawned 4000 units away from the man hole.
* Collisions are (nearly) elastic. A minimal impulse of 120 is applied for Car-Car collisions, 600 for Car-Fence collisions and 42 for Prisoner-Fence collisions
* Cars have a mass of 1 unit.
Each turn, the movement of entities is computed as follows: 
1. **Thrust**: the Car pivots towards its **destination**, by a maximum of 18 degrees. The Car's normalized heading vector is multiplied by the thrust power divided by the mass. The result is added to the current speed vector.
2. **Movement**: Their speed vector is added to the position of all entities to compute their new positions. If a collision occurs during the movement, the entities will rebound off one another.
3. **Friction**: the speed vector is multiplied by a constant, then truncated. The constant is:  
0.85 for Cars,  
1.0 for Prisoners
4. The position values are truncated.
5. The cars' heading angle is expressed in degrees and rounded.
Angle are provided in degrees, and relative to the x axis. 

# Game Input 

Initialization input

Line 1: one integer mapRadius, the radius of the map.   
Line 2: one integer centerRadius, the radius of the center.   
Line 3: one integer minSwapImpulse, the impulse needed to steal a ball.   
Line 4: one integer carCount, the number of Cars you control.   

Input for one game turn

First line: an integer myScore, your team's score.   
Next line: an integer oppScore, your opponent's score   
Next line: an integer currentWinner, whether or not you win given the current score (in case of a draw). -1: lose, 0: draw, 1: win   
Next line: an integer entities for the number of entities currently in play.   
Next entities lines: one line per entity.   
  
 Each entity is represented by 8 integers: entityId, entityType, x, y, vx, vy, angle and prisonerId.   
entityId is the unique id of this entity.   
entityType indicates the type of entity. The value can be: 
* 0 for one of your Cars
* 1 for an opposing Car
* 2 for a Prisoner that is not being held by a Car.
x, y for the entity's position.   
vx, vy for the entity's speed vector.   
angle \-1 for a Prisoner. Heading angle in degrees between 0 and 360 for a Car.   
prisonerId \-1 for a Prisoner. \-1 for a Car that doesn't hold a Prisoner, entityId of that Prisoner otherwise. 

Output for one game turn

One line for each one of your team's Cars: three integers X, Y and thrust   
 You may append the output with a message which we be displayed above the corresponding pod.   
  
Optional debugging information   
 If the message is debug once, the game summary will contain additional information throughout the game. The referee will provide the list of collision events during the last turn, presented in the following manner: id1 id2 time.   
id shall be interpreted as:   
\-1: map border   
0: man hole   
other values: entityId of the Car or Prisoner   
  
Alternative output format   
 For convenience purposes, you may also output your actions in the following format: EXPERT rotationAngle thrust message. 

Constraints

0 <= thrust <= 200   
entityId \>= 0   
4000 <= mapRadius <= 6000   
500 <= centerRadius <= 1000   
250 <= minSwapImpulse <= 350   
carCount \= 2   
 Response time for the first turn ≤ 1000 ms   
 Response time per turn ≤ 50 ms   
  
_Note that the current referee uses a lower range of mapRadius, centerRadius and minSwapImpulse values than stated above. Creators of the puzzle reserve the right to update the referee with new numerical values, insofar as they remain within the bounds provided in this statement._
