# Night Of War

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/night-of-war)

**Level:** multi
**Topics:** Minimax, MCTS

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

 This is a **league based** challenge. 

 For this challenge, multiple leagues for the same game are available. Once you have proven your skills against the first Boss, you will access a higher league and extra rules will be available. 

# The Goal 

 The goal is to finish the opponent's army or having more bucks at the end of game. 

# Rules 

 In this game you have to control your army 1\-3 soldiers depending upon the league. To understand game mechanics you need to understand few things given below.  
  
---

  
**SOLDIER** 

 A Soldier is movable unit which is defined by 6 integers :-  
ownerId \- The ID of player who owns this soldier.  
x \- The position X of this soldier.  
y \- The position Y of this soldier.  
soldierId \- The unique ID of soldier.  
level \- Ignore for this league.  
direction \- The Direction soldier is facing 0 = UP, 1 = LEFT , 2 = DOWN, 3 = RIGHT.  
 A Soldier can perform MOVE or ATTACK tasks.  
Note \- the level of soldier remains 0 when game starts and can upgrade upto level 10 

  
**BLOCK** 

 A Block is a single cell in the map defined by 3 integers :-  
blockOwner \- The ID of player who owns this block.  
x \- The position X of this block.  
y \- The position Y of this block.  
 It gives you 2 Bucks for eack Block you owned every turn. 

  
**SOLDIER MOVABLE SITES** 

Soldier movable sites are blocks where a soldier can move which based on direction where is soldier facing, for example: If soldier is facing **UP** then soldier **can't move DOWN** and **can move UP, RIGHT and LEFT**.  
![](https://cdn-games.codingame.com/community/3721214-1607311051570/edebb9414fe61659e2fcb0b77b4c2fec1da2ed63fe19a79bebaf7aa690d1d67d.JPG)  
 Suppose in this picture the soldier is facing **UP** side, Then it can move on GREEN coloured tiles and can't move on RED coloured tiles.  
 So, basically the soldier just can't move in the opposite direction of where it is facing. 

  
**SOLDIER ATTACKING SITES** 

Soldier attacking sites are blocks on which a soldier can attack which is again based on the direction soldier is facing. A soldier can attack on the blocks which are in range of distance 2 from soldier and are not in back side of direction.  
![](https://cdn-games.codingame.com/community/3721214-1607311051570/c4de7cf9fe507e5af7f8d5930dbc326748f59e294ff37cb4f5dec4e1a2e77c8b.JPG)  
 Suppose in this picture the soldier is facing **UP**, then GREEN coloured tiles are soldier attacking sites.  
![](https://cdn-games.codingame.com/community/3721214-1607311051570/91df125d645ed955938d4e12e08391c8db242fc11509626884729167825c3e8b.JPG)  
 And suppose in this picture the soldier is facing **DOWN**, then GREEN coloured tiles are soldier attacking sites.  

  
---

  
**ACTIONS:-**  
  
**WAIT**  
 You can use this command to do nothing. The action looks like - 'WAIT' your income won't be affected by this.   
  
**MOVE**  
 You can use this command to move your soldiers but remember a soldier can only move at **SOLDIER MOVABLE SITES**(Explained above).The command for the action looks like - 'MOVE ID DIRECTION' In which ID is the unique identifier of soldier and DIRECTION can be any of UP DOWN LEFT RIGHT.  
  
**ATTACK**  
 You can use this command to attack on any opponent soldier which is in range of 2 tiles which kills the soldier and it should be one of the **SOLDIER ATTACKING SITES**(Explained above) and the level of opponent's soldier should be less than or equal to your soldier's level. It costs you 35 Bucks to attack. The command for the action looks like - 'ATTACK ID OPPONENT\_SOLDIER\_ID' In which ID is the unique identifier of soldier and OPPONENT\_SOLDIER\_ID is the id of the opponent soldier that you want to attack.  
  
  
---

Victory Conditions

* All opponent's soldiers died.
* After 200 turns, you have more Bucks than your opponent.

Lose Conditions

* You fail to provide a valid command in time.
* You provide a unrecognized command.
* If your opponent satisfies any of victory conditions.

# Game Input 

Initial input

* int MyID \- Your unique player Id which could be 0 or 1.
* int MapSize \- The size of board, Map = MapSize\*MapSize.

Input per turn

* int MyBucks \- Your present money or bucks.
* int OppBucks \- Opponent's present money or bucks.
* Next MapSize \* MapSize lines each **BLOCK** in the board represented by 3 integers:-
* int BlockOwner \- The owner's player id of this block.  
 int x \- This block's position x.  
 int y \- This block's position y.
* int activeSoldierCount \- Total no. of active soldier in the game.
* Next activeSoldierCount lines each **SOLDIER** reprensented by 6 integers:-
* int ownerId \- The owner's player id of this soldier.  
 int x \- This soldier's position x.  
 int y \- This soldier's position y.  
 int soldierId \- The unique identifier of soldier.  
 int level \- Level of the soldier ignore for first league.  
 int direction \- The side where the soldier is facing.

Output

A single line from one of the following commands:- 

* WAIT optional\_message
* MOVE soldierID  Direction  optional\_message
* ATTACK soldierID soldierId to attack on optional\_message

Constraints

Your code should respond under 100 ms.

Game will automatically end after 200 turns.

MapSize \= 4 For first league, 5 For second league, 8 For third league.

MyId \= 0 or 1.
