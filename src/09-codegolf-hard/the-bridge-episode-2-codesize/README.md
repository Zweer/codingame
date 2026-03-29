# The Bridge - Code Golf

[:link: Puzzle on CodinGame](https://www.codingame.com/codegolf/hard/the-bridge-episode-2-codesize)

**Level:** codegolf-hard
**Topics:** DFS, Backtracking

VIEW MORE +BOBNET - THE BRIDGE 

**Excellent work!** Thanks to you, we have managed to hijack four motorbikes! Their source code has been modified to carry our virus back to _Bobnet_.  
  
_Bobnet's_ headquarters are on the other end of the next bridge, but a recent acid rain storm has gravely damaged the structural integrity of the road, leaving it scattered with **many holes**.  
The motorbikes are perfectly capable of crossing the damaged bridge but, because of our virus, it's up to you to code the evasive maneuvers of the motorbikes.  
  
**Humankind is relying on you to see as many motorbikes safely across the bridge as possible!**

The program:

  
There are 4 lanes on the bridge road and 1 to 4 bikes to control. There can only be one moto per lane and they are always vertically aligned.  
  
Each game turn, you can send a single instruction to every bike. **Since the bikes operate on the same frequency, they will all synchronize on the commands you send them.**  
  
The possible commands are: 
* `SPEED` to speed up by 1.
* `SLOW` to slow down by 1.
* `JUMP` to jump.
* `WAIT` to go straight on.
* `UP` to send all motorbikes one lane up.
* `DOWN` to send all motorbikes one lane down.
  
The starting speeds of the bikes are synced, and can be 0\. After every game turn, the bikes will move a number of squares equal to their current speed across the X axis.  
  
The `UP` and `DOWN` instructions will make the bikes move across the Y axis in addition to the movement across the X axis (Y = 0 corresponds to the highest lane). If a motorbike is prevented from moving up or down by the bridge's guard rails, none of the bikes will move on the Y axis that turn.  
  
When a motorbike goes in a straight line and does not jump, if there is a hole between the current position and the next position (after the move), **then the motorbike is lost forever**. For example, if X=2 and S=3, the next position of the bike will have X=5: if there is a hole in X=3, X=4 or X=5, the bike will be destroyed.  
  
Going up or down will put you at risk of falling in any hole situated in the black zone (consider the holes on the current and next lane):  
![](https://www.codingame.com/servlet/fileservlet?id=1211165059887)  
* The mission is a success if the minimum amount of required bikes gets to the far side of the bridge.
* You fail if too many motorbikes fall into holes.
* You fail if the motorbikes do not cross the entire bridge after 50 turns.

The program must first read the initialization data from standard input. Then, **within an infinite loop**, read the data from the standard input related to the bike's current state and provide to the standard output the next instruction.  
  
The tests provided are similar to the validation tests used to compute the final score but remain different.

INITIALIZATION INPUT:

**Line 1 :** M the amount of motorbikes to control. 

**Line 2 :** V the minimum amount of motorbikes that must survive. 

**Lines 3 through 6:** the road ahead. Each line represents one lane of the road. A dot character . represents a safe space, a zero 0 represents a hole in the road. 

INPUT FOR ONE GAME TURN:

**Line 1 :** S the motorbikes' speed. 

**Next M lines:** 

X Y A two integers and a boolean seperated by spaces. X, Y the coordinates of the motorbike on the road and A to indicate whether the motorbike is activated "**1**" or detroyed "**0**".

OUTPUT FOR ONE GAME TURN:

A single line containing one of 6 keywords: SPEED SLOW JUMP WAIT UP DOWN.

CONSTRAINTS:

The initial positions of the motorbikes are always X\= 0.  
0 ≤ S < 50  
1 ≤ M ≤ 4  
1 ≤ V ≤ M  
0 ≤ X < 500  
0 ≤ Y < 4 

Response time for one game turn ≤ 150ms

EXAMPLE:

There are 2 AI motorbikes to begin with, you only need one to cross the bridge.  
![](https://www.codingame.com/servlet/fileservlet?id=1094951122874) 

| **Initialization input** _(outside the loop)_                      | **_No output expected_**                                                                        |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 2 _(M)_ 1 _(V)_ ...0...... ...00..... ...0..0... ...0...... _Road_ |                                                                                                 |
| **Input for turn 1**                                               | **Output for turn 1**                                                                           |
| 1 _(S)_ 0 1 1 _(X Y A) bike 1_ 0 2 1 _(X Y A) bike 2_              | SPEED _Accelerate to have enough momentum to jump the gap_                                      |
| ****Input for turn 2**                                             | ****Output for turn 2**                                                                         |
| 2 _(S)_ 2 1 1 _(X Y A) bike 1_ 2 2 1 _(X Y A) bike 2_              | JUMP _The next space for both bikes is a hole, jump now_                                        |
| ****Input for turn 3**                                             | ****Output for turn 3**                                                                         |
| 2 _(S)_ 4 1 0 _(X Y A) bike 1_ 4 2 1 _(X Y A) bike 2_              | DOWN _One motorbike has been sacrificed. The remaining bike steers down to avoid oncoming hole_ |
| ****Input for turn 3**                                             | ****Output for turn 4**                                                                         |
| 2 _(S)_ 4 1 0 _(X Y A) bike 1_ 6 3 1 _(X Y A) bike 2_              | WAIT _The bike is out of trouble_                                                               |
