# Snooker Ball Collision

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/snooker-ball-collision)

**Level:** hard
**Topics:** Simulation, Collision Detection, Physics

## Goal 

The goal is to predict the position of two balls after stopping (at the beginning: one is moving, the other is immobile).  
\- The radius of the balls is **30.75mm**  
\- We consider there is **no borders**.  
\- Any collision is perfectly elastic.  
\- The formula of the acceleration induced by the frictions is: **a\_d(t) = -0.8\*v(t)**  
With **v(t)** the speed of the ball (in meters per second) and **t** the time (in seconds) 

Input

**Line 1:** Two real numbers x0 and y0 (separated by a space), the position of the moving ball (in meters).  
**Line 2:** Two real numbers x1 and y1 (separated by a space), the position of the static ball (in meters).  
**Line 3:** Two real numbers vx and vy (separated by a space), the components of the velocity (in meters per second).

Output

**Line 1:** x0\_f and y0\_f (separated by a space), the components of the position of the moving ball when stopped **rounded to two decimals** (in meters).  
**Line 2:** x1\_f and y1\_f (separated by a space), the components of the position of the static ball when stopped **rounded to two decimals** (in meters).

Constraints

Example

Input

1.24 0.34
0.29 1.05
0 0

Output

1.24 0.34
0.29 1.05
