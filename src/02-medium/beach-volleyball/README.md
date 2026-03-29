# 🏐 🏖 Beach Volleyball 🏐 🏖

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/beach-volleyball)

**Level:** medium
**Topics:** Loops, Distances, Physics, Time, Snell's Law

## Goal 

You love playing beach volleyball! Out there in the sun, playing with your friends, volleying that ball back and forth, it's the best.  
  
Until dude-face comes along, and kicks your precious volleyball into the ocean. You'd kick sand at him, but that volleyball could float away and you have to go get it right away!  
  
You are located on the beach at X=start\_x and Y=start\_y, and ocean meets the beach where Y=beach\_y. The volleyball is located in the water at X=ball\_x and Y=ball\_y.  
  
You have to plot a route that **will take the least time** to get the ball. You happen to know that you can travel speed\_land units per second on land and speed\_water units per second while in the water.  
  
You will travel in a straight line towards the shoreline to coordinate X=beach\_x, Y=beach\_y, then another straight line from there to the ball.  
  
Find the **best integer value** for beach\_x on the shore line that will result in the least travel time. 

Input

**Line 1:** space separated values start\_x and start\_y  
**Line 2:** beach\_y  
**Line 3:** space separated values ball\_x and ball\_y  
**Line 4:** speed\_land  
**Line 5:** speed\_water

Output

**Line 1 :** beach\_x - The X coordinate of the point where you meet the beach on your way to the ball.

Constraints

0 ≤ start\_x,ball\_x ≤ 20,000,000  
0 ≤ start\_y < beach\_y < ball\_y ≤ 20,000,000  
1 ≤ speed\_water ≤ speed\_land ≤ 1,000

Example

Input

2 0
10
2 20
1
1

Output

2
