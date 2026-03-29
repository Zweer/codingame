# Timer for Clash of Code

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/timer-for-clash-of-code)

**Level:** easy
**Topics:** Time

## Goal 

You have to implement a version of the timer in Clash of Code. The timer starts at 5:00 and runs towards 0:00\. The timer stop time changes based on players joining.  
  
Here are the rules:  
\* Every time a player joins the clash, the timer stop time is set to  

t - 256 / ( 2^(p - 1) )

 where t is current time in seconds and p is the number of players in the room before the new player joined.  
\* If the result is under 0:00, set it to 0:00.  
\* If a player joins at the same time the game is supposed to start, set the new timer stop time instead of starting the game.  
  
For example:  
  
At 5:00 the timer starts, and there is one player (the one who started the clash).  
At 4:47 the second player joins -> set to start 256 seconds from now, at 0:31.  
At 3:56 the third player joins -> set to start 128 seconds from now, at 1:48.  
At 3:13 the fourth player joins -> set to start 64 seconds from now, at 2:09.  
At 2:09, the game starts.  
  
Output: 2:09  
  
The game starts if:  
\* The timer reaches the time it is set to stop at, or  
\* The timer reaches zero and there is more than one player, or  
\* The clash room is filled (8 players in total, 7 have joined). 

Input

**First line:** An integer n for the number of players who join the clash  
  
**The next n lines:** Time stamps in the format m:ss (minutes and seconds) at which a player joins the clash

Output

Output the time stamp at which the game starts in the format m:ss.   
If no one joined, output NO GAME.

Constraints

n: Between 0 inclusive and 7 inclusive  
Time stamps: Between 0:00 exclusive and 5:00 exclusive  
  
The time stamps in the input are always in the right order (no invalid inputs).

Example

Input

1
4:47

Output

0:31
