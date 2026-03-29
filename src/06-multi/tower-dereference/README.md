# Tower Dereference

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/tower-dereference)

**Level:** multi
**Topics:** Resource management, Simulation

# The Goal 

Survive attack waves longer than your opponent by building towers to stop them. 

# Rules 

The game is played on a map of size 17x17, the origin being at the top left corner. The map contains a canyon going from the right side of the map to the left. Attackers will spawn on both ends, approaching towards the other side.   
Your task is to stop the opponent attackers from reaching your side and to support your own attackers.   
Each player starts with 350 money and has 20 lives, losing one for each attacker reaching the own base.   

### Attackers

Attackers have a player owning them, a location on the map, movement speed, hitpoints and a bounty for killing them.   
They will spawn at both ends of the canyon symmetrically, those attacking player 1 on the left, player 2 on the right. Each turn they move towards the base of their opponent by their movement speed. In case of multiple shortest paths, they will pick one at random.   
When their opponent kills them, it will be rewarded by the attacker's bounty.   

### Towers

A tower has an owner, a location, damage, range, reload and cooldown time. When a tower has an attacker in range and a cooldown time of 0, the tower will shoot at the attacker and be inactive for the next few turns, depending on the reload time.   
An attacker is in range of a tower, when the pythagorean distance between them is less than or equal to the tower range.   
A player can build and upgrade different types of towers as follows:   

#### Building towers

Towers can only be built on plateaus, not in the canyon. It is not possible to build a tower at the same cell as another tower.   

##### Gun tower

The gun tower attacks one unit at a time, reducing the hit point by its damage value. In case of multiple possible targets, it will always take the one closest to the own base.   

##### Fire tower

The fire tower damages all opponent attackers in its range. The attack will last 2 turns, damaging the units that are in range during the turn of the attack happening or one turn after.   

##### Glue tower

The glue tower does not cause any damage to the attackers. Instead it will slow them down for some turns. It targets all attackers in range, ignoring those which are already slowed down.   

##### Heal tower

The heal tower does not shoot at opponent attackers. Instead it will heal the attackers of the own team, making it harder for the opponent to kill them.   

#### Upgrading towers

It is possible to make towers stronger by increasing the damage and range as well as reducing the reload time. Each of these can be upgraded independently up to three times. The upgrade costs for the first, second and third level are 50, 100 and 150.   

#### Tower strengths

The tower strengths are as follows: ![](https://i.imgur.com/p7JWEYi.png) 

# Expert Rules 

You can find the source code of the game at <https://github.com/eulerscheZahl/TowerDefense/>   

The turn order is the following: 
* Upgrade commands are handled
* Build commands are handled
* Towers shoot and kill attackers
* Alive attackers move
* Attackers, which reached the opponent base, disappear and reduce the player lives
* Players with no life remaining lose
  
Towers shoot in the following order: heal towers, fire towers, gun towers, glue towers. Among the same category, towers closest to the own base will shoot first.   
In case of both players trying to build a tower at the same cell in the same turn, the player building closer to the own base will succeed. The upper half of the middle column is considered closer to player 1, the lower half to player 2\. 

# Game Input 

Initial input

Line 1: playerId, either 0 (you defend the left side) or 1 (you defend the right side)

Line 2: width height, the size of the map

Next height lines: the map. A character can be . for a canyon or # for a plateau.

Turn input

Line 1: myMoney myLives, the amount of money and lives that your player has.

Line 2: opponentMoney opponentLives, the amount of money and lives that the opponent player has.

Line 3: towerCount, the number of towers on the map

Next towerCount lines: towerType towerId owner x y damage range reload coolDown

Next line: attackerCount, the number of attackers on the map

Next attackerCount lines: attackerId owner x y hitPoints maxHitPoints currentSpeed maxSpeed slowTime bounty

Output

A single line containing your actions, separated by a ;   
an action can be: 
* BUILD x y type to build at a given location. type can be GUNTOWER, FIRETOWER, GLUETOWER or HEALTOWER
* UPGRADE id type to upgrade a tower with a given id. type can be DAMAGE, RANGE or RELOAD
* PASS to do nothing
* MSG text to print a message

Constraints

... contains between 1 and 500 characters.  
  
Allotted response time for per turn is ≤ 50 ms (1000 ms for the first turn).

  
Graphics assets:  
<https://craftpix.net/freebies/free-stone-tower-game-assets/>   
<https://craftpix.net/freebies/free-2d-monster-sprites/>   
Special thanks to [dbdr](https://www.codingame.com/profile/a44c2c75eb5da8d5e52184eaa92342813628822), [Illedan](https://www.codingame.com/profile/433c83b2f60d89f64e138f0fce10b30f8598731) and [Nixerrr](https://www.codingame.com/profile/d0202a2b347a4fd473f840ede3e470427494112), who helped coding the game and create an apealing UI.
