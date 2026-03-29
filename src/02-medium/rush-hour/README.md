# RUSH HOUR

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/rush-hour)

**Level:** medium
**Topics:** BFS, DFS, Recursion, Beam Search

# The Goal 

This puzzle is inspired by a board game named [Rush hour](https://en.wikipedia.org/wiki/Rush%5FHour%5F%28puzzle%29)   
There is a 6x6 grid surrounded by walls, except an exit on the right of the 3rd line.   
You have to drive the red car to the exit, but there are other vehicles that obstruct the path. 

# Rules 

There are vertical and horizontal vehicles. You can move any vehicle you want, but on a straight line (vehicles can't turn). This means that horizontal vehicles can only go LEFT and RIGHT, and vertical vehicles only UP and DOWN   
  
Vehicles are given by their id, top-left coordinates, length and axis (H/V).   
  
Moreover: 
* The exit is always on 3rd line (y==2), on the right.
* The ID of the red car is always 0, on the 3rd line (y==2) and the car is always 2 cells long and horizontal.
* The IDs of the other vehicles are always >0, and they are 2 or 3 cells long.
* The other vehicles can't be both horizontal and on 3rd line.
  
You indicate moves by the id of the vehicle, followed by the direction UP / DOWN / LEFT / RIGHT.   
You win the game when the red car is in front of the exit (x==4). 

Victory Conditions

* You drive the red car in front of the exit (x==4)

Loss Conditions

* You do not respond in time.
* You output an unrecognized id.
* You output an unrecognized direction.
* You exceed the number of turns allowed

### 🐞 Debugging tips

* Append text after any command and that text will appear above the grid.
* Hover over a car to see information about it.

  
# Game datas 

Initial input

Line 1: The number n of cars

Input per turn

n lines: The cars represented by 4 integers id, x, y, length and one string axis

Output per turn

A single line containing the id and the direction of the car to move.   

Constraints

id\=0 for the red car   
0<id<16 for other vehicles   
0<=x,y<6   
2<=length<=3   
axis\='H' or 'V'   
Max response time in the 1st turn : 5 seconds   
Max response time in the other turns : 100 ms   
Max turns : 100 

  
# Example 

**Initial input :**   
3   
  
**Input for 1st turn :**   
0 1 2 2 H  
3 4 2 2 V  
13 0 4 3 H   
  
These inputs mean : 
* there are 3 vehicles
* the vehicle with id 0 starts at x=1, y=2, is 2 cells long and is horizontal
* the vehicle with id 3 starts at x=4, y=2, is 2 cells long and is vertical
* the vehicle with id 13 starts at x=0, y=4, is 3 cells long and is horizontal
which corresponds to the following game :   
  
![](https://cdn-games.codingame.com/community/4341304-1658170293668/77952ed9bc74608c35f97cd155397dc7323d6f0f0b2ae357b5694e78cf35f650.png)   
  
**Output for 1st turn :**   
0 RIGHT (red car moves to right)   
  
**Input for 2nd turn :**   
0 **2** 2 2 H (after moving right)  
3 4 2 2 V  
13 0 4 3 H   

# Mitch and the beach

  
Mitch wants to reach the beach.   
  
Mitch owns a beautiful red car.   
  
Mitch loves to pose with his red car on the beach.   
  
But ... Oh No ! Mitch is stuck in city traffic.   
  
You have to help Mitch to exit the city, so that Mitch can reach the beach.
