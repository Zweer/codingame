# Paper soccer

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/paper-soccer)

**Level:** multi
**Topics:** Pathfinding, Minimax

## The Goal 

Paper soccer is a paper-and-pencil game played on a grid representing football pitch. The objective of the game is to score a goal. The detailed rules can be found [HERE](https://en.wikipedia.org/wiki/Paper%5Fsoccer). 

## Rules 

**Pitch:**  
The pitch is drawn on a grid as a rectangle, with small rectangles at the top and the bottom representing the two goals. The ball is represented as a dot and is placed at the center. The typical size of pitch is 8x10 meaning 8 squares wide and 10 squares high.   
  
**The initial state of the pitch is shown below:**   
  
![](https://i.imgur.com/aL4trJv.png)
  
  
**Turn:**  
Paper soccer is a turn-based game. Each player move the ball by drawing line from its current position to a new one. Player can move horizontally, vertically or diagonally by one square. Player can't move on already drawn line as well the pitch's lines.   
  
**On the left: Game after first player move. On the right: The situation after second player move:**   
  
![](https://i.imgur.com/hiZn3nr.png)
  
  
In addition, if the ball is moved to a point which is the end of already drawn line, the ball "bounces" and player makes an additional move in his turn. Player makes additional moves until ball ends up in a position without any drawn lines (except for the just drawn line by the player).  
  
**Example: After player moves by one square, the ball is at the end of already drawn line. The same player must make additional move.**   
  
![](https://i.imgur.com/AKKIfNf.png)
  
  
**Winning and losing:**  
Player wins the game by placing the ball in the opponent's goal. Player loses if he places ball in his own goal. Player also loses if after his turn the ball cannot be moved. First player must reach the top goal. Second player must reach the bottom goal.  
  
**On the left: Player wins by placing ball in opponent's goal; On the right: After player's turn, ball cannot be moved. Ball is blocked, the player lost.**   
  
![](https://i.imgur.com/kdQWxCZ.png)
  
  
Player also loses by providing unrecognizable or invalid input: 
* Invalid characters in the input
* Trying to draw on already drawn line
* Trying to make additional line after the ball ended up on empty intersection, or one of the goals
* Trying to move outside the pitch's boundaries
* Ending the move too early when the ball is still at the end of already drawn line
  
**Output**   
  
Move is represented as digits, each digit represents direction:  
0 - N  
1 - NE  
2 - E  
3 - SE  
4 - S  
5 - SW  
6 - W  
7 - NW  
  
**Picture:** 

![](https://i.imgur.com/oFddZJ4.png)

Player will provide output in the form of string of digits. For example, **2** will move the ball to the right. String **4644** will move ball down, then left, then down and down.   
  
**Example of simple moves. First player writes "7", then second player writes "4":**   
  
![](https://i.imgur.com/hiZn3nr.png)
  
  
**Examples for moves with bounces. On the left player writes "35". On the right player writes "02217":**   
  
![](https://i.imgur.com/T1KNuge.png)

Victory Conditions

* Score a goal by placing ball in opponent's goal.

Loss Conditions

* Opponent places ball in your goal.
* After your turn ball can't be moved (the ball is stuck).
* You output illegal move or an unrecognized command.
* You do not respond in time

# Game Input 

Initial input

First line: The id of the player (myId). 0 for first player, 1 for the second player. 

Input for one game turn

First line: opponentMoveLength: the length of opponent's last move.   
Next opponentMove: characters representing opponent's last move.   

Output

A single line containing the movement, i.e. "024" to move up, right, then down.   

Constraints

Response time first turn is ≤ 1000 ms.   
Response time per turn is ≤ 200 ms.
