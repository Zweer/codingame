# Spring Challenge 2020

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/spring-challenge-2020)

**Level:** multi
**Topics:** Pathfinding, Multi-agent, Distances, 2D array

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a **league based** challenge. 

For this challenge, multiple leagues for the same game are available. Once you have proven your skills against the first Boss, you will access a higher league and extra rules will be available. 

## Goal 

Eat more pellets than your opponent! 

![Eat more pellets than your opponent!](https://static.codingame.com/servlet/fileservlet?id=43832304725167) 

## Rules 

The game is played on a grid given to you at the start of each run. The grid is made up of walls and floors.  
  
In this first league, each player controls a single pac that can move along the grid. 

  
### 🗺️ The Map

The grid is generated randomly, and can vary in width and height.

  
Each cell of the map is either: 

* A wall (represented by a pound character: #)
* A floor (represented by a space character: )
  
Maps are always symetrical across the central vertical axis. Most grids will have floor tiles on the left and right edges, pacs can **wrap around the map** and appear on the other side by moving through these tiles.

  
When the game begins, the map is filled with **pellets** and the occasional **super-pellet**. Landing on a pellet with your **pac** scores you 1 point. 

Super-pellets are worth 10 points. The pellet is then removed. 

![](https://static.codingame.com/servlet/fileservlet?id=43832401302931) 

_A pellet is worth 1 point and a super-pellet is worth 10 points ._

  
### 🔵🔴 The Pacs

Each player controls one pac. But in the next leagues you will control up to 5 pacs each!

  
On each turn you have vision on all of the pellets and pacs in the grid (this will change in a future league).

  
At each turn, you are given information regarding the visible pacs and pellets. For each pac, you are given its identifier, whether it's yours or not and its coordinates. For each pellet, you are given its coordinates and value.

  
Pacs can receive the following command:

* MOVE: Give the pac a target position, the pac will find a shortest route to that position and **move the first step of the way**. The pac will not take into account the presence of pellets or other pacs when choosing a route.  
![](https://static.codingame.com/servlet/fileservlet?id=43832368078694)  
_Each pac that received a MOVE  order will move toward the target by going either up, down, left or right._
  
See the **Game Protocol** section for more information on sending commands to your pacs.

  
Crossing paths or landing on the same cell as another pac will cause a **collision** to occur. In that case, the movements of the colliding pacs are cancelled. 

  
### ⛔ Game end

The game stops when there are no enough pellets in game to change the outcome of the game.  
  
The game stops automatically after 200 turns.   

Victory Conditions

* The winner is the player with the highest score, regardless of the amount of surviving pacs.

Defeat Conditions

* Your program does not provide a command in the alloted time or one of the commands is invalid.

  
### 🐞 Debugging tips

* Hover over the grid to see the coordinates of the cell under your mouse
* Hover over pacs to see information about them
* Append text after any command for a pac and that text will appear above that pac
* Press the gear icon on the viewer to access extra display options
* Use the keyboard to control the action: space to play/pause, arrows to step 1 frame at a time

## Game Input 

Initialization Input

Line 1: two integers width and height for the size of the map.  
Next height lines: a string of width characters each representing one cell of this row: ' ' is a floor and '#' is a wall.   

Input for One Game Turn

First line: Two space-separated integers:   
* myScore your current score
* opponentScore the score of your opponent
Second line: One integer:   
* visiblePacCount for the amount of pacs visible to you
Next visiblePacCount lines:   
* pacId: the pac's id (unique for a given player)
* mine: the pac's owner (1 if this pac is yours, 0 otherwise. Converted into a boolean type in most languages.)
* x & y: the pac's position
* typeId: unused in this league
* speedTurnsLeft: unused in this league
* abilityCooldown: unused in this league
Next line: one integer visiblePelletCount for the amount of pellets visible to you  
Next visiblePelletCount lines: three integers:   
* x & y: the pellet's position
* value: the pellet's score value

Output

A single line with your action: 
* MOVE pacId x y: the pac with the identifier pacId moves towards the given cell (pacId is always 0 in this league).

Constraints

Response time per turn ≤ 50ms   
Response time for the first turn ≤ 1000ms 

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png)

What is in store for me in the higher leagues ? 

The extra rules available in higher leagues are:
* Pacs will be in rock, paper or scissor form.
* Pacs will be able to kill each other.
* Pacs will be able to swap their type or perform a speed boost.
* Input data will include pacs that have died.
