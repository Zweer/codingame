# Forest Fire

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/forest-fire)

**Level:** medium
**Topics:** Loops, Greedy algorithms, 2D array

# Forest Fire

  
A forest fire has broken out! The nearby Fire Station Service asked your help to manage the dispatch of units on the scene.   
The Fire Chief sent you the coordinates where the fires are located, you must decide which unit is best to send using the least amount of water possible.   
  
The available units are:   
  
\- **C Canadair: covers** a **3x3** area and uses **2100** Liters of water   
\- **H Fire Helicopter:** covers a **2x2** area and uses **1200** Liters   
\- **J Smoke Jumpers Squad:** covers a **1x1** area and uses **600** Liters

  
# The Goal 

Your goal is to put out ALL the fires by using the least amount of water possible.   
On **each turn** you'll have to output the unit that should be called in and on which coordinates 

# Rules 

  
**Coordinate system**   
The top-left corner has position (0,0). x goes to the right, y increases downwards   
To attack an area you must give the top-left coordinate of the 3x3 or 2x2 area you want to attack   
* Sending a Canadair to (0;0): C 0 0 will extinguish:  
0;0 0;1 0;2  
1;0 1;1 1;2  
2;0 2;1 2;2
* Sending a Fire Helicopter to (0;0): H 0 0 will extinguish:  
0;0 0;1  
1;0 1;1
* Sending a Smoke Jumpers Squad to (0;0): J 0 0 will extinguish:  
0;0
  
**Be careful!**   
The attacking area MUST be inside the forest area, you can't exceed it or you would damage the nearby areas! 

# Extra Detail 

  
All maps are square shaped (L x L)   
  
_Huge thanks to [eulerscheZahl](https://www.codingame.com/profile/8374201b6f1d19eb99d61c80351465b65150051) for helping me with the graphics!_   

Victory Conditions

* All fires are extinguished

Loss Conditions

* Your water supplies goes to 0 and you still have fires to put out.
* You do not have enough water to send a specific unit
* You attack an area outside the forest zone
* You do not respond in time or output an unrecognized command.

  
# Game Input 

Input

  
**At the beginning of the game:** 

Line 1: an int L, the size of one side of the map

Line 2: an int water, the total amount of water available

**On each turn** 

Line 1: an int N, the amount of fires on the map

Next N lines: The coordinates of each fire in the format fireX fireY 

Output

A single line containing the unit code that you want to send and the coordinates of the top left cell   
  
The unit codes are: 
* C Canadair;
* H Fire Helicopter;
* J Smoke Jumpers Squad;

Constraints

2 ≤ L ≤ 20   
  
0 ≤ fireX < L   
  
0 ≤ fireY < L   
  
N ≤ L\*L
