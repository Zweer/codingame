# Clash of Bots

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/clash-of-bots)

**Level:** multi
**Topics:** Multi-agent, bot-programming

## Goal 

End the game with more **alive robots** than your opponent. 

The game takes place in an arena, where robots fight. 

Destroy your enemies. 

## Rules 

Each player takes control over several **robots**. The game takes place on a rectangular grid representing the **arena**. 

The game is played over several rounds. On each turn, robots perform actions simultaneously. 

### Arena

The arena is a rectangle of some size and it behaves like a torus.   

### Rounds

At the start of each round, players receive status about the surrounding area of each owned robot.  
Then, players take **action** for each owned robot. 

### Actions

The possible actions are: 
* GUARD: Command a robot to raise a guard. Reduces taken damage by 50% for this turn. (\*damage taken is rounded down)
* MOVE <DIRECTION>: Command a robot to move in a given direction. If the move would cause a collision, it is canceled and involved robots are damaged. (1 damage)
* ATTACK <DIRECTION>: Command a robot to attack a neighbor cell. If any robot is present there, it takes 2 damage.
* SELFDESTRUCTION: Command a robot to activate self-destruction and explode, damaging all the robots around him. (4 damage, 3x3 square)
Actions are performed in the above order. So all the attacks are executed at the same time but after every move was performed. Effectively it is possible to dodge an attack or neutralize a robot before it explodes due to selfdestruction. 

For animated description, see [Clash of Bots' Youtube playlist.](https://youtube.com/playlist?list=PLXWATAcbsILO3J1O6XRkzanZjvS39x5C0) 

### Directions

The possible directions are: 
* UP
* DOWN
* LEFT
* RIGHT

### ⛔ Game end

If players have the same number of alive robots, the winner is the player with the most summary health.

Victory Conditions

* The winner is the player with the most **number of alive robots**.

Defeat Conditions

* Your program does not provide a command in the allotted time or it provides an unrecognized command.

  
### 🐞 Debugging tips

* Hover over a robot to see extra information about it
* Use the keyboard to control the action: space to play/pause, arrows to step 1 frame at a time

## Technical Details 

* Players start the game with two robots.
* Every 5 rounds new robots are spawned.
* Ordering of robots in the input is randomized.
* You can check out the source code of this game [on GitHub](https://github.com/stivens/Clash-of-Bots).

## Game Protocol 

Input for One Game Turn

First line: An integer k: the number of robots you currently own.  
Followed by k minimaps. Minimap is a square of size 5x5 representing robot vision.   
  
Example minimap:   
  
`0 0 0 0 0`  
`0 -10 0 0 0`  
`0 0 10 0 0`  
`0 0 0 0 0`  
`0 0 0 0 0`  
0 \- empty square   
n > 0 (positive integer) - ally robot with health equal n   
n < 0 (negative integer) - enemy robot with health equal n   
  
The current robot is always in the middle of the minimap (10 in the above example)   
  
So the example above represents situation like this:   
![](https://i.imgur.com/fGAGCfx.png) 

---

  
Example input:   
  
`2`  
`0 0 0 0 0`  
`0 -10 0 0 0`  
`0 0 10 0 0`  
`0 0 0 0 0`  
`0 0 0 0 0`  
`0 0 0 0 0`  
`0 -10 0 0 0`  
`0 0 10 0 0`  
`0 0 0 0 0`  
`0 0 0 0 0`  

Output

k lines with your commands.   
k is the number of your robots.   
Line number i contains command for the i-th robot (relative to input ordering) 

* guard: command your robot to raise the guard.
* move \[left|right|up|down\]: command your robot to move on given direction.
* attack \[left|right|up|down\]: command your robot to attack the cell that is \[left|right|up|down\] to it.
* selfdestruction: command your robot to activate self-destruction.

Constraints

Response time per turn ≤ 50ms   
Response time for the first turn ≤ 1000ms
